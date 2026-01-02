-- =====================================================
-- Fix user_roles RLS Permission Errors
-- =====================================================
-- Problem: RLS policies on other tables query user_roles directly,
-- but user_roles RLS only allows users to see their own roles.
-- This creates permission denied errors.
-- 
-- Solution: 
-- 1. Ensure is_admin() is SECURITY DEFINER (bypasses RLS)
-- 2. Grant SELECT on user_roles to authenticated role for SECURITY DEFINER functions
-- 3. Update any policies that directly query user_roles to use is_admin() instead
-- =====================================================

-- PART 1: Ensure is_admin() function is SECURITY DEFINER and correct
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM public;

-- PART 2: Fix user_roles RLS policy to allow SECURITY DEFINER functions
-- The current policy only allows users to see their own roles, but SECURITY DEFINER
-- functions need to be able to check any user's role. We'll keep the restrictive
-- policy for direct queries, but SECURITY DEFINER functions bypass RLS anyway.

-- Ensure the SELECT policy exists and is correct
DO $$
BEGIN
  -- Drop existing policies that might conflict
  DROP POLICY IF EXISTS "rls_user_roles_select" ON public.user_roles;
  DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
  
  -- Create policy: users can see their own roles, admins can see all
  CREATE POLICY "rls_user_roles_select"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (
      (user_id = auth.uid()) 
      OR is_admin()  -- Admins can see all roles
    );
  
  RAISE NOTICE 'Created user_roles SELECT policy';
END $$;

-- PART 3: Grant necessary permissions
-- SECURITY DEFINER functions bypass RLS, but we need to ensure the role has
-- the necessary table permissions
GRANT SELECT ON public.user_roles TO authenticated;

-- PART 4: Ensure all helper functions that access user_roles are SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_user_roles(p_user_id uuid)
RETURNS app_role[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(array_agg(role), ARRAY['public_user'::app_role])
  FROM public.user_roles
  WHERE user_id = p_user_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_roles(uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_roles(uuid) FROM public;

CREATE OR REPLACE FUNCTION public.is_business_user(p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = p_user_id 
      AND role IN ('business_user'::app_role, 'admin'::app_role)
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_business_user(uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.is_business_user(uuid) FROM public;

-- PART 5: Fix RLS policies that directly query user_roles to use is_admin() instead
-- These policies cause permission errors because they try to query user_roles
-- with user permissions, but user_roles RLS blocks it

-- Fix posts policies that directly query user_roles
DO $$
BEGIN
  -- Update read_insights_org_members policy if it exists
  IF EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE p.polname = 'read_insights_org_members' AND c.relname = 'posts' AND n.nspname = 'public'
  ) THEN
    DROP POLICY IF EXISTS "read_insights_org_members" ON public.posts;
    
    CREATE POLICY "read_insights_org_members"
    ON public.posts
    FOR SELECT
    TO authenticated
    USING (
      type = 'insight'
      AND visibility = 'my_business'
      AND mode = 'business'
      AND org_id IS NOT NULL
      AND (
        is_org_member(org_id)
        OR is_admin()  -- Use is_admin() instead of direct user_roles query
      )
    );
    
    RAISE NOTICE 'Updated read_insights_org_members policy';
  END IF;
  
  -- Update author_update_post policy if it directly queries user_roles
  IF EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE p.polname = 'author_update_post' AND c.relname = 'posts' AND n.nspname = 'public'
  ) THEN
    DROP POLICY IF EXISTS "author_update_post" ON public.posts;
    
    CREATE POLICY "author_update_post"
    ON public.posts
    FOR UPDATE
    TO authenticated
    USING (
      user_id = auth.uid()
      OR is_admin()  -- Use is_admin() instead of direct user_roles query
    )
    WITH CHECK (
      CASE
        WHEN type = 'insight' THEN (
          visibility = 'my_business' 
          AND mode = 'business' 
          AND org_id IS NOT NULL 
          AND (is_org_member(org_id) OR is_admin())
        )
        ELSE true
      END
    );
    
    RAISE NOTICE 'Updated author_update_post policy';
  END IF;
  
  -- Fix business_invitations policy if it directly queries user_roles
  IF EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE p.polname = 'rls_bi_insert_business_members' AND c.relname = 'business_invitations' AND n.nspname = 'public'
  ) THEN
    DROP POLICY IF EXISTS "rls_bi_insert_business_members" ON public.business_invitations;
    
    CREATE POLICY "rls_bi_insert_business_members" 
    ON public.business_invitations 
    FOR INSERT 
    TO authenticated
    WITH CHECK (
      -- Use is_business_user() or is_admin() instead of direct user_roles query
      (is_business_user() OR is_admin())
      AND inviter_id = auth.uid()
    );
    
    RAISE NOTICE 'Updated rls_bi_insert_business_members policy';
  END IF;
  
END $$;

-- PART 6: Ensure orgs table has RLS policies (from original fix)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'orgs'
  ) THEN
    -- Enable RLS
    ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;
    
    -- Policy 1: Members can read their orgs (using SECURITY DEFINER function)
    IF NOT EXISTS (
      SELECT 1 FROM pg_policy p
      JOIN pg_class c ON p.polrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE p.polname = 'orgs_members_read' AND c.relname = 'orgs' AND n.nspname = 'public'
    ) THEN
      CREATE POLICY orgs_members_read
      ON public.orgs
      FOR SELECT
      TO authenticated
      USING (
        -- Use SECURITY DEFINER function to check membership (no recursion)
        public.is_org_member(orgs.id)
        OR orgs.created_by = auth.uid()
        OR is_admin()
      );
    END IF;
    
    -- Policy 2: Public can read approved orgs (for Research Hub search)
    IF NOT EXISTS (
      SELECT 1 FROM pg_policy p
      JOIN pg_class c ON p.polrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE p.polname = 'orgs_public_read' AND c.relname = 'orgs' AND n.nspname = 'public'
    ) THEN
      CREATE POLICY orgs_public_read
      ON public.orgs
      FOR SELECT
      TO authenticated, anon
      USING (status = 'approved');
    END IF;
    
    -- Grant SELECT to authenticated
    GRANT SELECT ON public.orgs TO authenticated;
    
    RAISE NOTICE 'orgs table RLS policies configured';
  END IF;
END $$;

-- PART 7: Fix view_business_org_analytics security
-- The view might be trying to access user_roles. Let's ensure it's set to security_invoker
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_views
    WHERE schemaname = 'public' AND viewname = 'view_business_org_analytics'
  ) THEN
    -- Set view to use security_invoker (runs with caller's permissions)
    -- This is already set in migration 20251201080405, but let's ensure it
    ALTER VIEW view_business_org_analytics SET (security_invoker = on);
    
    RAISE NOTICE 'view_business_org_analytics security configured';
  END IF;
END $$;

-- PART 8: Verification
DO $$
DECLARE
  v_user_roles_policies integer;
  v_orgs_policies integer;
  v_is_admin_exists boolean;
BEGIN
  SELECT COUNT(*) INTO v_user_roles_policies
  FROM pg_policy p
  JOIN pg_class c ON p.polrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE c.relname = 'user_roles' AND n.nspname = 'public';
  
  SELECT COUNT(*) INTO v_orgs_policies
  FROM pg_policy p
  JOIN pg_class c ON p.polrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE c.relname = 'orgs' AND n.nspname = 'public';
  
  SELECT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.proname = 'is_admin' AND n.nspname = 'public'
  ) INTO v_is_admin_exists;
  
  RAISE NOTICE '=== VERIFICATION SUMMARY ===';
  RAISE NOTICE 'user_roles table has % RLS policies', v_user_roles_policies;
  RAISE NOTICE 'orgs table has % RLS policies', v_orgs_policies;
  RAISE NOTICE 'is_admin() function exists: %', CASE WHEN v_is_admin_exists THEN 'YES ✓' ELSE 'NO ✗' END;
  RAISE NOTICE '=== END SUMMARY ===';
END $$;

