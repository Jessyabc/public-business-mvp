-- Migration: Fix RLS Performance by using (select auth.uid()) pattern
-- This addresses the Supabase Performance Advisor "Auth RLS Initialization Plan" warnings
-- Using (select auth.uid()) ensures the auth function is evaluated once per query, not per row

-- ============================================================================
-- 1. Fix helper functions to use (select auth.uid())
-- ============================================================================

-- Fix is_admin() helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = (select auth.uid()) AND role = 'admin'
  );
$$;

-- Fix is_business_member() helper function (checks org_members)
CREATE OR REPLACE FUNCTION public.is_business_member()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.org_members om WHERE om.user_id = (select auth.uid()));
$$;

-- Fix get_user_role() helper function
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles 
  WHERE user_id = (select auth.uid())
  LIMIT 1;
$$;

-- Fix current_user_email() helper function if it exists
CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = (select auth.uid());
$$;

-- ============================================================================
-- 2. Fix workspace_thoughts RLS policies (critical for initial load)
-- ============================================================================
DROP POLICY IF EXISTS "workspace_thoughts_owner_select" ON public.workspace_thoughts;
CREATE POLICY "workspace_thoughts_owner_select"
  ON public.workspace_thoughts
  FOR SELECT
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "workspace_thoughts_owner_insert" ON public.workspace_thoughts;
CREATE POLICY "workspace_thoughts_owner_insert"
  ON public.workspace_thoughts
  FOR INSERT
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "workspace_thoughts_owner_update" ON public.workspace_thoughts;
CREATE POLICY "workspace_thoughts_owner_update"
  ON public.workspace_thoughts
  FOR UPDATE
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "workspace_thoughts_owner_delete" ON public.workspace_thoughts;
CREATE POLICY "workspace_thoughts_owner_delete"
  ON public.workspace_thoughts
  FOR DELETE
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- 3. Fix profiles RLS policies
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "profiles_owner_rw" ON public.profiles;
CREATE POLICY "profiles_owner_rw"
  ON public.profiles
  FOR ALL
  USING (id = (select auth.uid()) OR public.is_admin())
  WITH CHECK (id = (select auth.uid()) OR public.is_admin());

DROP POLICY IF EXISTS "rls_profiles_delete_self_or_admin" ON public.profiles;
CREATE POLICY "rls_profiles_delete_self_or_admin"
  ON public.profiles
  FOR DELETE
  USING ((id = (select auth.uid())) OR is_admin());

-- ============================================================================
-- 4. Fix user_roles RLS policies
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;
CREATE POLICY "Users can insert their own roles"
  ON public.user_roles
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "rls_user_roles_select" ON public.user_roles;
CREATE POLICY "rls_user_roles_select"
  ON public.user_roles
  FOR SELECT
  USING ((user_id = (select auth.uid())) OR is_admin());

-- ============================================================================
-- 5. Fix business_profiles RLS policies
-- ============================================================================
DROP POLICY IF EXISTS "business_profiles_owner_rw" ON public.business_profiles;
CREATE POLICY "business_profiles_owner_rw"
  ON public.business_profiles
  FOR ALL
  USING (user_id = (select auth.uid()) OR public.is_admin())
  WITH CHECK (user_id = (select auth.uid()) OR public.is_admin());

DROP POLICY IF EXISTS "rls_bp_update_self_or_admin" ON public.business_profiles;
CREATE POLICY "rls_bp_update_self_or_admin"
  ON public.business_profiles
  FOR UPDATE
  USING ((user_id = (select auth.uid())) OR is_admin());

DROP POLICY IF EXISTS "rls_bp_delete_self_or_admin" ON public.business_profiles;
CREATE POLICY "rls_bp_delete_self_or_admin"
  ON public.business_profiles
  FOR DELETE
  USING ((user_id = (select auth.uid())) OR is_admin());

DROP POLICY IF EXISTS "bp_owner_admin_all" ON public.business_profiles;
CREATE POLICY "bp_owner_admin_all"
  ON public.business_profiles
  FOR ALL
  USING ((user_id = (select auth.uid())) OR is_admin())
  WITH CHECK ((user_id = (select auth.uid())) OR is_admin());

-- ============================================================================
-- 6. Fix business_invitations RLS policies
-- ============================================================================
DROP POLICY IF EXISTS "rls_bi_select" ON public.business_invitations;
CREATE POLICY "rls_bi_select"
  ON public.business_invitations
  FOR SELECT
  USING ((inviter_id = (select auth.uid())) OR (lower(invitee_email) = lower(current_user_email())) OR is_admin());

DROP POLICY IF EXISTS "rls_bi_update" ON public.business_invitations;
CREATE POLICY "rls_bi_update"
  ON public.business_invitations
  FOR UPDATE
  USING ((
    (lower(invitee_email) = lower(current_user_email()) AND consumed_at IS NULL) OR
    (inviter_id = (select auth.uid()) AND consumed_at IS NULL) OR
    is_admin()
  ))
  WITH CHECK ((
    (lower(invitee_email) = lower(current_user_email()) AND consumed_at IS NULL) OR
    (inviter_id = (select auth.uid()) AND consumed_at IS NULL) OR
    is_admin()
  ));

DROP POLICY IF EXISTS "rls_bi_delete" ON public.business_invitations;
CREATE POLICY "rls_bi_delete"
  ON public.business_invitations
  FOR DELETE
  USING ((inviter_id = (select auth.uid())) OR is_admin());

-- ============================================================================
-- 7. Fix idea_interactions RLS policies
-- ============================================================================
DROP POLICY IF EXISTS "ii_owner_read" ON public.idea_interactions;
CREATE POLICY "ii_owner_read"
  ON public.idea_interactions
  FOR SELECT
  USING ((user_id = (select auth.uid())) OR is_admin());

-- ============================================================================
-- 8. Fix user_consent RLS policies
-- ============================================================================
DROP POLICY IF EXISTS "user_consent_owner" ON public.user_consent;
CREATE POLICY "user_consent_owner"
  ON public.user_consent
  FOR ALL
  USING (user_id = (select auth.uid()) OR public.is_admin())
  WITH CHECK (user_id = (select auth.uid()) OR public.is_admin());

-- ============================================================================
-- 9. Fix open_ideas RLS policies
-- ============================================================================
DROP POLICY IF EXISTS "open_ideas_owner_read" ON public.open_ideas;
CREATE POLICY "open_ideas_owner_read"
  ON public.open_ideas
  FOR SELECT
  USING (user_id = (select auth.uid()) OR public.is_admin());

DROP POLICY IF EXISTS "open_ideas_owner_write" ON public.open_ideas;
CREATE POLICY "open_ideas_owner_write"
  ON public.open_ideas
  FOR UPDATE
  USING (user_id = (select auth.uid()) OR public.is_admin())
  WITH CHECK (user_id = (select auth.uid()) OR public.is_admin());

DROP POLICY IF EXISTS "open_ideas_owner_delete" ON public.open_ideas;
CREATE POLICY "open_ideas_owner_delete"
  ON public.open_ideas
  FOR DELETE
  USING (user_id = (select auth.uid()) OR public.is_admin());

-- ============================================================================
-- 10. Fix idea_brainstorms RLS policies
-- ============================================================================
DROP POLICY IF EXISTS "idea_brainstorms_public_read" ON public.idea_brainstorms;
CREATE POLICY "idea_brainstorms_public_read"
  ON public.idea_brainstorms
  FOR SELECT
  USING (is_public = true OR author_user_id = (select auth.uid()) OR public.is_admin());

DROP POLICY IF EXISTS "idea_brainstorms_owner_write" ON public.idea_brainstorms;
CREATE POLICY "idea_brainstorms_owner_write"
  ON public.idea_brainstorms
  FOR ALL
  USING (author_user_id = (select auth.uid()) OR public.is_admin())
  WITH CHECK (author_user_id = (select auth.uid()) OR public.is_admin());

-- ============================================================================
-- 11. Fix post_relations RLS policies
-- ============================================================================
DROP POLICY IF EXISTS "rls_pr_insert" ON public.post_relations;
CREATE POLICY "rls_pr_insert"
  ON public.post_relations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts p
      WHERE p.id = post_relations.child_post_id
        AND (p.user_id = (select auth.uid()) OR is_admin())
    )
  );

DROP POLICY IF EXISTS "rls_pr_delete" ON public.post_relations;
CREATE POLICY "rls_pr_delete"
  ON public.post_relations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM posts p
      WHERE p.id = post_relations.child_post_id
        AND (p.user_id = (select auth.uid()) OR is_admin())
    )
  );

-- ============================================================================
-- 12. Fix posts RLS policies (if they exist with auth.uid())
-- ============================================================================
DROP POLICY IF EXISTS "posts_owner_select" ON public.posts;
DROP POLICY IF EXISTS "posts_owner_insert" ON public.posts;
DROP POLICY IF EXISTS "posts_owner_update" ON public.posts;
DROP POLICY IF EXISTS "posts_owner_delete" ON public.posts;

-- Check if posts table has any direct auth.uid() policies to recreate
DO $$
BEGIN
  -- Only create if there are no existing policies covering these operations
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname LIKE '%select%') THEN
    EXECUTE 'CREATE POLICY "posts_user_select" ON public.posts FOR SELECT USING (user_id = (select auth.uid()) OR visibility = ''public'' OR public.is_admin())';
  END IF;
END $$;

-- ============================================================================
-- 13. Fix org_members RLS policies
-- ============================================================================
DROP POLICY IF EXISTS "org_members_owner_select" ON public.org_members;
CREATE POLICY "org_members_owner_select"
  ON public.org_members
  FOR SELECT
  USING (user_id = (select auth.uid()) OR is_admin());

-- ============================================================================
-- Completion notice
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE 'RLS policies updated to use (select auth.uid()) pattern for better performance';
END $$;
