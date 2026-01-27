-- =====================================================
-- Fix RLS Policy Infinite Recursion and 403 Errors
-- =====================================================
-- This script fixes:
-- 1. Infinite recursion in org_members RLS policy
-- 2. Missing RLS policies for org_requests
-- 3. Missing RLS policies for analytics views
-- =====================================================

-- PART 1: Fix infinite recursion in org_members RLS policy
-- The org_members_org_admin_read policy queries org_members itself, causing recursion
-- Solution: Create a SECURITY DEFINER helper function that bypasses RLS to check membership

-- Create helper function to check if user is org owner/admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_org_admin(p_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_members
    WHERE org_id = p_org_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'business_admin')
  );
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.is_org_admin(uuid) TO authenticated;

-- Drop the problematic policy that causes recursion
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE p.polname = 'org_members_org_admin_read' AND c.relname = 'org_members' AND n.nspname = 'public'
  ) THEN
    DROP POLICY org_members_org_admin_read ON public.org_members;
  END IF;
END$$;

-- Create new policy using the SECURITY DEFINER function (no recursion)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE p.polname = 'org_members_org_admin_read' AND c.relname = 'org_members' AND n.nspname = 'public'
  ) THEN
    CREATE POLICY org_members_org_admin_read
    ON public.org_members
    FOR SELECT
    USING (
      -- Use SECURITY DEFINER function to check membership (bypasses RLS, no recursion)
      public.is_org_admin(org_members.org_id)
      -- OR user is a global admin
      OR is_admin()
    );
  END IF;
END$$;

-- PART 2: Add missing RLS policies for org_requests
-- The org_requests table needs policies for admins to read all requests

-- Check if org_requests table exists and has RLS enabled
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'org_requests'
  ) THEN
    -- Enable RLS if not already enabled
    ALTER TABLE public.org_requests ENABLE ROW LEVEL SECURITY;
    
    -- Add policy for admins to read all org_requests
    IF NOT EXISTS (
      SELECT 1 FROM pg_policy p
      JOIN pg_class c ON p.polrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE p.polname = 'org_requests_admin_read' AND c.relname = 'org_requests' AND n.nspname = 'public'
    ) THEN
      CREATE POLICY org_requests_admin_read
      ON public.org_requests
      FOR SELECT
      USING (is_admin());
    END IF;
    
    -- Add policy for admins to update org_requests
    IF NOT EXISTS (
      SELECT 1 FROM pg_policy p
      JOIN pg_class c ON p.polrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE p.polname = 'org_requests_admin_update' AND c.relname = 'org_requests' AND n.nspname = 'public'
    ) THEN
      CREATE POLICY org_requests_admin_update
      ON public.org_requests
      FOR UPDATE
      USING (is_admin())
      WITH CHECK (is_admin());
    END IF;
  END IF;
END$$;

-- PART 3: Fix analytics views RLS
-- The views need proper GRANT statements and may need RLS on underlying tables

-- Grant SELECT on analytics views to authenticated users
DO $$
BEGIN
  -- view_business_insight_analytics
  IF EXISTS (
    SELECT 1 FROM pg_views
    WHERE schemaname = 'public' AND viewname = 'view_business_insight_analytics'
  ) THEN
    GRANT SELECT ON public.view_business_insight_analytics TO authenticated;
  END IF;
  
  -- view_business_org_analytics
  IF EXISTS (
    SELECT 1 FROM pg_views
    WHERE schemaname = 'public' AND viewname = 'view_business_org_analytics'
  ) THEN
    GRANT SELECT ON public.view_business_org_analytics TO authenticated;
  END IF;
END$$;

-- PART 4: Ensure is_org_member function exists and doesn't cause recursion
-- This function is used in other policies and should be SECURITY DEFINER to avoid recursion
DO $$
BEGIN
  -- Check if function exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.proname = 'is_org_member' AND n.nspname = 'public'
  ) THEN
    -- Create the function if it doesn't exist
    CREATE OR REPLACE FUNCTION public.is_org_member(p_org_id uuid)
    RETURNS boolean
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = public
    AS $$
      SELECT EXISTS (
        SELECT 1 FROM public.org_members
        WHERE org_id = p_org_id
          AND user_id = auth.uid()
      );
    $$;
    
    -- Grant execute to authenticated users
    GRANT EXECUTE ON FUNCTION public.is_org_member(uuid) TO authenticated;
  ELSE
    -- Ensure it's SECURITY DEFINER to avoid recursion
    CREATE OR REPLACE FUNCTION public.is_org_member(p_org_id uuid)
    RETURNS boolean
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = public
    AS $$
      SELECT EXISTS (
        SELECT 1 FROM public.org_members
        WHERE org_id = p_org_id
          AND user_id = auth.uid()
      );
    $$;
  END IF;
END$$;

-- PART 5: Fix other potentially recursive policies
-- The manage_org_members_admins policy might query org_members directly, causing recursion

-- Drop and recreate manage_org_members_admins using SECURITY DEFINER helper function
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE p.polname = 'manage_org_members_admins' AND c.relname = 'org_members' AND n.nspname = 'public'
  ) THEN
    DROP POLICY manage_org_members_admins ON public.org_members;
  END IF;
  
  -- Recreate using SECURITY DEFINER helper function (no recursion)
  CREATE POLICY manage_org_members_admins
  ON public.org_members
  FOR ALL
  USING (
    -- Use SECURITY DEFINER function (bypasses RLS, no recursion)
    public.is_org_admin(org_members.org_id)
    OR is_admin()
  )
  WITH CHECK (
    public.is_org_admin(org_members.org_id)
    OR is_admin()
  );
END$$;

-- PART 6: Ensure analytics views use SECURITY DEFINER or have proper RLS
-- The views query orgs table, which might trigger RLS that checks org_members
-- Solution: Make sure views use security_invoker = true and orgs has proper RLS

-- Ensure orgs table has RLS policies that don't cause recursion
DO $$
BEGIN
  -- Check if orgs has RLS enabled
  IF EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'orgs'
  ) THEN
    -- Enable RLS
    ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;
    
    -- Add policy for members to read their orgs (using SECURITY DEFINER function)
    IF NOT EXISTS (
      SELECT 1 FROM pg_policy p
      JOIN pg_class c ON p.polrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE p.polname = 'orgs_members_read' AND c.relname = 'orgs' AND n.nspname = 'public'
    ) THEN
      CREATE POLICY orgs_members_read
      ON public.orgs
      FOR SELECT
      USING (
        -- Use SECURITY DEFINER function to check membership (no recursion)
        public.is_org_member(orgs.id)
        OR orgs.created_by = auth.uid()
        OR is_admin()
      );
    END IF;
    
    -- Add policy for public to read approved orgs (for Research Hub)
    IF NOT EXISTS (
      SELECT 1 FROM pg_policy p
      JOIN pg_class c ON p.polrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE p.polname = 'orgs_public_read' AND c.relname = 'orgs' AND n.nspname = 'public'
    ) THEN
      CREATE POLICY orgs_public_read
      ON public.orgs
      FOR SELECT
      USING (status = 'approved');
    END IF;
  END IF;
END$$;

-- PART 7: Verify the fix by checking policy structure
-- This is a read-only check to confirm policies are correct
DO $$
DECLARE
  v_policy_count integer;
BEGIN
  SELECT COUNT(*) INTO v_policy_count
  FROM pg_policy p
  JOIN pg_class c ON p.polrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE c.relname = 'org_members' AND n.nspname = 'public';
  
  RAISE NOTICE 'org_members has % RLS policies', v_policy_count;
END$$;

