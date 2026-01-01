-- =====================================================
-- Final Fix for org_members RLS Policies
-- =====================================================
-- This script ensures users can read their own org memberships
-- Run this in Supabase SQL Editor
-- =====================================================

-- Ensure RLS is enabled
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

-- Recreate org_members_own_read policy
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE p.polname = 'org_members_own_read' AND c.relname = 'org_members' AND n.nspname = 'public'
  ) THEN
    DROP POLICY org_members_own_read ON public.org_members;
  END IF;

  CREATE POLICY org_members_own_read
  ON public.org_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

  RAISE NOTICE 'Created org_members_own_read policy';
END$$;

-- Ensure is_org_admin exists and is SECURITY DEFINER
DO $$
DECLARE
  v_count int;
  v_secdef boolean;
BEGIN
  SELECT COUNT(*) INTO v_count FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE p.proname = 'is_org_admin' AND n.nspname = 'public';
  IF v_count = 0 THEN
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
  ELSE
    SELECT prosecdef INTO v_secdef FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE p.proname = 'is_org_admin' AND n.nspname = 'public' LIMIT 1;
    IF v_secdef THEN
      RAISE NOTICE 'is_org_admin exists and is SECURITY DEFINER';
    ELSE
      RAISE NOTICE 'is_org_admin exists but is NOT SECURITY DEFINER - altering';
      -- Recreate function with SECURITY DEFINER
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
      RAISE NOTICE 'Recreated is_org_admin as SECURITY DEFINER';
    END IF;
  END IF;
END$$;

-- Ensure is_admin exists and is SECURITY DEFINER
DO $$
DECLARE
  v_count int;
  v_secdef boolean;
BEGIN
  SELECT COUNT(*) INTO v_count FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE p.proname = 'is_admin' AND n.nspname = 'public';
  IF v_count = 0 THEN
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
    SELECT prosecdef INTO v_secdef FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE p.proname = 'is_admin' AND n.nspname = 'public' LIMIT 1;
    IF v_secdef THEN
      RAISE NOTICE 'is_admin exists and is SECURITY DEFINER';
    ELSE
      RAISE NOTICE 'is_admin exists but is NOT SECURITY DEFINER - altering';
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
      RAISE NOTICE 'Recreated is_admin as SECURITY DEFINER';
    END IF;
  END IF;
END$$;

-- Grant SELECT to authenticated (explicit permission)
GRANT SELECT ON public.org_members TO authenticated;

-- Final verification: list policies on org_members
SELECT 
  p.polname, 
  pg_get_policydef(p.oid) AS definition
FROM pg_policy p
JOIN pg_class c ON p.polrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname = 'org_members' AND n.nspname = 'public'
ORDER BY p.polname;

