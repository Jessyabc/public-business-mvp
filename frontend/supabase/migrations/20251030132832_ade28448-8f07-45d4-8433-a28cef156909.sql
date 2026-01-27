-- ============================================
-- BREAKER PANEL: Formalized Database Access Layer
-- ============================================
-- This migration creates views and RPCs that serve as the ONLY
-- entry points for frontend code. Direct table access is deprecated.

-- A) CREATE VIEWS (FE reads only from these)
-- ============================================

-- 1. Open Ideas Public View: union of approved ideas from intake + user tables
CREATE OR REPLACE VIEW public.open_ideas_public_view AS
  SELECT 
    id, 
    text as content, 
    created_at, 
    'intake'::text as source
  FROM public.open_ideas_intake
  WHERE status = 'approved'
  UNION ALL
  SELECT 
    id, 
    text as content, 
    created_at, 
    'user'::text as source
  FROM public.open_ideas_user
  WHERE status = 'approved';

-- 2. My Open Ideas View: current user's Open Ideas from open_ideas_user
CREATE OR REPLACE VIEW public.my_open_ideas_view AS
  SELECT 
    id, 
    user_id, 
    text as content, 
    status::text as status, 
    created_at
  FROM public.open_ideas_user
  WHERE user_id = auth.uid();

-- 3. My Posts View: current user's posts
CREATE OR REPLACE VIEW public.my_posts_view AS
  SELECT *
  FROM public.posts
  WHERE user_id = auth.uid();

-- B) HARDEN RPCs (permission-safe entry points)
-- ============================================

-- Update get_user_role to never return null, default to 'public_user'
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role::text FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1),
    'public_user'
  );
$$;

-- C) QUARANTINE LEGACY open_ideas table
-- ============================================

-- Rename open_ideas to open_ideas_legacy if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'open_ideas'
  ) THEN
    -- Rename the table
    ALTER TABLE public.open_ideas RENAME TO open_ideas_legacy;
    
    -- Drop all existing policies on the legacy table
    DROP POLICY IF EXISTS "Anyone can submit ideas" ON public.open_ideas_legacy;
    DROP POLICY IF EXISTS "Only admins can curate ideas" ON public.open_ideas_legacy;
    DROP POLICY IF EXISTS "Only admins can read open_ideas" ON public.open_ideas_legacy;
    DROP POLICY IF EXISTS "Owners and admins can delete ideas" ON public.open_ideas_legacy;
    DROP POLICY IF EXISTS "oi_owner_all" ON public.open_ideas_legacy;
    DROP POLICY IF EXISTS "open_ideas_owner_read" ON public.open_ideas_legacy;
    DROP POLICY IF EXISTS "open_ideas_owner_write" ON public.open_ideas_legacy;
    
    -- Create deny-all policies (no one except service role can access)
    CREATE POLICY "legacy_deny_select" ON public.open_ideas_legacy
      FOR SELECT USING (false);
    
    CREATE POLICY "legacy_deny_insert" ON public.open_ideas_legacy
      FOR INSERT WITH CHECK (false);
    
    CREATE POLICY "legacy_deny_update" ON public.open_ideas_legacy
      FOR UPDATE USING (false);
    
    CREATE POLICY "legacy_deny_delete" ON public.open_ideas_legacy
      FOR DELETE USING (false);
  END IF;
END $$;

-- D) RLS SANITY CHECK
-- ============================================
-- Ensure base tables have RLS enabled (they should already)
ALTER TABLE public.open_ideas_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.open_ideas_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Grant SELECT permissions on views to authenticated and anon users
GRANT SELECT ON public.open_ideas_public_view TO authenticated, anon;
GRANT SELECT ON public.my_open_ideas_view TO authenticated;
GRANT SELECT ON public.my_posts_view TO authenticated;

-- ============================================
-- SELF-TEST QUERIES (run these manually to verify)
-- ============================================
-- SELECT public.get_user_role();
-- SELECT * FROM public.my_posts_view LIMIT 1;
-- SELECT * FROM public.my_open_ideas_view LIMIT 1;
-- SELECT * FROM public.open_ideas_public_view LIMIT 1;