-- =====================================================
-- Verify and Fix RLS Policies for org_members
-- =====================================================
-- This script verifies existing policies and ensures
-- users can read their own org memberships
-- =====================================================

-- PART 1: Verify current policies on org_members
DO $$
DECLARE
  v_policy_count integer;
  v_policy_names text;
BEGIN
  SELECT COUNT(*), string_agg(p.polname, ', ' ORDER BY p.polname)
  INTO v_policy_count, v_policy_names
  FROM pg_policy p
  JOIN pg_class c ON p.polrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE c.relname = 'org_members' AND n.nspname = 'public';
  
  RAISE NOTICE 'org_members currently has % policies: %', v_policy_count, v_policy_names;
END$$;

-- PART 2: Ensure org_members_own_read policy exists and is correct
-- This is the critical policy that allows users to read their own memberships
DO $$
BEGIN
  -- Drop if exists to recreate with correct definition
  IF EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE p.polname = 'org_members_own_read' AND c.relname = 'org_members' AND n.nspname = 'public'
  ) THEN
    DROP POLICY org_members_own_read ON public.org_members;
  END IF;
  
  -- Create the policy with explicit USING clause
  CREATE POLICY org_members_own_read
  ON public.org_members
  FOR SELECT
  USING (user_id = auth.uid());
  
  RAISE NOTICE 'Created org_members_own_read policy';
END$$;

-- PART 3: Verify is_org_admin function exists and is SECURITY DEFINER
DO $$
DECLARE
  v_func_exists boolean;
  v_is_security_definer boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.proname = 'is_org_admin' AND n.nspname = 'public'
  ) INTO v_func_exists;
  
  IF v_func_exists THEN
    SELECT prosecdef INTO v_is_security_definer
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.proname = 'is_org_admin' AND n.nspname = 'public';
    
    IF v_is_security_definer THEN
      RAISE NOTICE 'is_org_admin function exists and is SECURITY DEFINER ✓';
    ELSE
      RAISE WARNING 'is_org_admin function exists but is NOT SECURITY DEFINER - this will cause recursion!';
    END IF;
  ELSE
    RAISE WARNING 'is_org_admin function does not exist - creating it now';
    
    -- Create the function
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
    
    GRANT EXECUTE ON FUNCTION public.is_org_admin(uuid) TO authenticated;
    RAISE NOTICE 'Created is_org_admin function';
  END IF;
END$$;

-- PART 4: Ensure is_admin function exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.proname = 'is_admin' AND n.nspname = 'public'
  ) THEN
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
    RAISE NOTICE 'Created is_admin function';
  ELSE
    RAISE NOTICE 'is_admin function exists ✓';
  END IF;
END$$;

-- PART 5: Test query to verify policies work
-- This simulates what the frontend does
DO $$
DECLARE
  v_test_user_id uuid;
  v_membership_count integer;
BEGIN
  -- Get a test user ID (first user with org membership)
  SELECT user_id INTO v_test_user_id
  FROM public.org_members
  LIMIT 1;
  
  IF v_test_user_id IS NOT NULL THEN
    RAISE NOTICE 'Testing with user_id: %', v_test_user_id;
    
    -- This query should work if policies are correct
    -- Note: This will only work if run as that user, so it's just a syntax check
    RAISE NOTICE 'Query structure: SELECT * FROM org_members WHERE user_id = auth.uid()';
    RAISE NOTICE 'Expected: Should return rows where user_id matches authenticated user';
  ELSE
    RAISE NOTICE 'No test users found in org_members table';
  END IF;
END$$;

-- PART 6: Grant explicit permissions (backup)
-- Sometimes explicit GRANTs help even with RLS
GRANT SELECT ON public.org_members TO authenticated;

-- PART 7: Final verification summary
DO $$
DECLARE
  v_own_read_exists boolean;
  v_admin_read_exists boolean;
  v_admin_all_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE p.polname = 'org_members_own_read' AND c.relname = 'org_members' AND n.nspname = 'public'
  ) INTO v_own_read_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE p.polname = 'org_members_org_admin_read' AND c.relname = 'org_members' AND n.nspname = 'public'
  ) INTO v_admin_read_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE p.polname = 'org_members_admin_all' AND c.relname = 'org_members' AND n.nspname = 'public'
  ) INTO v_admin_all_exists;
  
  RAISE NOTICE '=== POLICY VERIFICATION ===';
  RAISE NOTICE 'org_members_own_read: %', CASE WHEN v_own_read_exists THEN 'EXISTS ✓' ELSE 'MISSING ✗' END;
  RAISE NOTICE 'org_members_org_admin_read: %', CASE WHEN v_admin_read_exists THEN 'EXISTS ✓' ELSE 'MISSING ✗' END;
  RAISE NOTICE 'org_members_admin_all: %', CASE WHEN v_admin_all_exists THEN 'EXISTS ✓' ELSE 'MISSING ✗' END;
  RAISE NOTICE '=== END VERIFICATION ===';
END$$;

