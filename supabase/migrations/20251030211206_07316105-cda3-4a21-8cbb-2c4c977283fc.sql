-- Migration: Backend Sanity & Function Unification (Part 1 - Update Policies)
-- Update all policies to use parameterless canonical functions before dropping duplicates

-- Update profiles policies
DROP POLICY IF EXISTS "rls_profiles_delete_self_or_admin" ON public.profiles;
CREATE POLICY "rls_profiles_delete_self_or_admin"
  ON public.profiles
  FOR DELETE
  USING ((id = auth.uid()) OR is_admin());

-- Update user_roles policies
DROP POLICY IF EXISTS "rls_user_roles_select" ON public.user_roles;
CREATE POLICY "rls_user_roles_select"
  ON public.user_roles
  FOR SELECT
  USING ((user_id = auth.uid()) OR is_admin());

DROP POLICY IF EXISTS "rls_user_roles_admin_insert" ON public.user_roles;
CREATE POLICY "rls_user_roles_admin_insert"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "rls_user_roles_admin_update" ON public.user_roles;
CREATE POLICY "rls_user_roles_admin_update"
  ON public.user_roles
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "rls_user_roles_admin_delete" ON public.user_roles;
CREATE POLICY "rls_user_roles_admin_delete"
  ON public.user_roles
  FOR DELETE
  USING (is_admin());

-- Update business_profiles policies
DROP POLICY IF EXISTS "rls_bp_update_self_or_admin" ON public.business_profiles;
CREATE POLICY "rls_bp_update_self_or_admin"
  ON public.business_profiles
  FOR UPDATE
  USING ((user_id = auth.uid()) OR is_admin());

DROP POLICY IF EXISTS "rls_bp_delete_self_or_admin" ON public.business_profiles;
CREATE POLICY "rls_bp_delete_self_or_admin"
  ON public.business_profiles
  FOR DELETE
  USING ((user_id = auth.uid()) OR is_admin());

DROP POLICY IF EXISTS "bp_owner_admin_all" ON public.business_profiles;
CREATE POLICY "bp_owner_admin_all"
  ON public.business_profiles
  FOR ALL
  USING ((user_id = auth.uid()) OR is_admin())
  WITH CHECK ((user_id = auth.uid()) OR is_admin());

-- Update business_invitations policies
DROP POLICY IF EXISTS "rls_bi_select" ON public.business_invitations;
CREATE POLICY "rls_bi_select"
  ON public.business_invitations
  FOR SELECT
  USING ((inviter_id = auth.uid()) OR (lower(invitee_email) = lower(current_user_email())) OR is_admin());

DROP POLICY IF EXISTS "rls_bi_update" ON public.business_invitations;
CREATE POLICY "rls_bi_update"
  ON public.business_invitations
  FOR UPDATE
  USING ((
    (lower(invitee_email) = lower(current_user_email()) AND consumed_at IS NULL) OR
    (inviter_id = auth.uid() AND consumed_at IS NULL) OR
    is_admin()
  ))
  WITH CHECK ((
    (lower(invitee_email) = lower(current_user_email()) AND consumed_at IS NULL) OR
    (inviter_id = auth.uid() AND consumed_at IS NULL) OR
    is_admin()
  ));

DROP POLICY IF EXISTS "rls_bi_delete" ON public.business_invitations;
CREATE POLICY "rls_bi_delete"
  ON public.business_invitations
  FOR DELETE
  USING ((inviter_id = auth.uid()) OR is_admin());

DROP POLICY IF EXISTS "bi_admin_all" ON public.business_invitations;
CREATE POLICY "bi_admin_all"
  ON public.business_invitations
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Update post_relations policies
DROP POLICY IF EXISTS "rls_pr_insert" ON public.post_relations;
CREATE POLICY "rls_pr_insert"
  ON public.post_relations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts p
      WHERE p.id = post_relations.child_post_id
        AND (p.user_id = auth.uid() OR is_admin())
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
        AND (p.user_id = auth.uid() OR is_admin())
    )
  );

DROP POLICY IF EXISTS "pr_admin_all" ON public.post_relations;
CREATE POLICY "pr_admin_all"
  ON public.post_relations
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Update departments policies
DROP POLICY IF EXISTS "rls_deps_admin_insert" ON public.departments;
CREATE POLICY "rls_deps_admin_insert"
  ON public.departments
  FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "rls_deps_admin_update" ON public.departments;
CREATE POLICY "rls_deps_admin_update"
  ON public.departments
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "rls_deps_admin_delete" ON public.departments;
CREATE POLICY "rls_deps_admin_delete"
  ON public.departments
  FOR DELETE
  USING (is_admin());

DROP POLICY IF EXISTS "departments_admin_all" ON public.departments;
CREATE POLICY "departments_admin_all"
  ON public.departments
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Update industries policies
DROP POLICY IF EXISTS "rls_inds_admin_insert" ON public.industries;
CREATE POLICY "rls_inds_admin_insert"
  ON public.industries
  FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "rls_inds_admin_update" ON public.industries;
CREATE POLICY "rls_inds_admin_update"
  ON public.industries
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "rls_inds_admin_delete" ON public.industries;
CREATE POLICY "rls_inds_admin_delete"
  ON public.industries
  FOR DELETE
  USING (is_admin());

DROP POLICY IF EXISTS "industries_admin_all" ON public.industries;
CREATE POLICY "industries_admin_all"
  ON public.industries
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Update leads policies
DROP POLICY IF EXISTS "Admin only read leads" ON public.leads;
CREATE POLICY "Admin only read leads"
  ON public.leads
  FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "leads_admin_read" ON public.leads;
CREATE POLICY "leads_admin_read"
  ON public.leads
  FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "leads_admin_all" ON public.leads;
CREATE POLICY "leads_admin_all"
  ON public.leads
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Update email_subscriptions policies
DROP POLICY IF EXISTS "Admin can read email subscriptions" ON public.email_subscriptions;
CREATE POLICY "Admin can read email subscriptions"
  ON public.email_subscriptions
  FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Admin can update email subscriptions" ON public.email_subscriptions;
CREATE POLICY "Admin can update email subscriptions"
  ON public.email_subscriptions
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admin can delete email subscriptions" ON public.email_subscriptions;
CREATE POLICY "Admin can delete email subscriptions"
  ON public.email_subscriptions
  FOR DELETE
  USING (is_admin());

DROP POLICY IF EXISTS "es_admin_read" ON public.email_subscriptions;
CREATE POLICY "es_admin_read"
  ON public.email_subscriptions
  FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "es_admin_all" ON public.email_subscriptions;
CREATE POLICY "es_admin_all"
  ON public.email_subscriptions
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Update idea_interactions policies
DROP POLICY IF EXISTS "ii_owner_read" ON public.idea_interactions;
CREATE POLICY "ii_owner_read"
  ON public.idea_interactions
  FOR SELECT
  USING ((user_id = auth.uid()) OR is_admin());

DROP POLICY IF EXISTS "ii_admin_all" ON public.idea_interactions;
CREATE POLICY "ii_admin_all"
  ON public.idea_interactions
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

DO $$
BEGIN
  RAISE NOTICE 'All policies updated to use canonical parameterless functions';
END $$;