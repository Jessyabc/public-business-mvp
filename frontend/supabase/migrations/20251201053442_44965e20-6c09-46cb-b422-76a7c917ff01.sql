-- ================================================
-- MIGRATION: Normalize Post Relations & Org Helpers (Fixed)
-- Purpose: Make post_relations the single source of truth
--          Standardize relation types to: origin, reply, quote, cross_link
--          Consolidate org helper functions
-- ================================================

-- ============================================
-- PART 1: DIAGNOSTIC CHECKS
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Checking for non-standard relation types...';
END $$;

-- ============================================
-- PART 2: STANDARDIZE POST_RELATIONS
-- ============================================

-- Remove old constraint if it exists
ALTER TABLE public.post_relations
  DROP CONSTRAINT IF EXISTS post_relations_relation_type_check;

-- Drop the unique constraint (not just the index)
ALTER TABLE public.post_relations
  DROP CONSTRAINT IF EXISTS post_relations_parent_child_type_unique;

-- Migrate old relation types to new standard
UPDATE public.post_relations
SET relation_type = CASE 
  WHEN relation_type = 'hard' THEN 'origin'
  WHEN relation_type = 'soft' THEN 'cross_link'
  WHEN relation_type = 'biz_in' THEN 'cross_link'
  WHEN relation_type = 'biz_out' THEN 'cross_link'
  ELSE relation_type
END
WHERE relation_type IN ('hard', 'soft', 'biz_in', 'biz_out');

-- Add CHECK constraint for standardized types
ALTER TABLE public.post_relations
  ADD CONSTRAINT post_relations_relation_type_check 
  CHECK (relation_type IN ('origin', 'reply', 'quote', 'cross_link'));

-- Create unique index (not constraint) to allow duplicate parent-child pairs with different types
CREATE UNIQUE INDEX IF NOT EXISTS idx_post_relations_unique
  ON public.post_relations (parent_post_id, child_post_id, relation_type);

-- Ensure CASCADE behavior on foreign keys
ALTER TABLE public.post_relations
  DROP CONSTRAINT IF EXISTS post_relations_parent_post_id_fkey;
ALTER TABLE public.post_relations
  ADD CONSTRAINT post_relations_parent_post_id_fkey
  FOREIGN KEY (parent_post_id) REFERENCES public.posts(id) ON DELETE CASCADE;

ALTER TABLE public.post_relations
  DROP CONSTRAINT IF EXISTS post_relations_child_post_id_fkey;
ALTER TABLE public.post_relations
  ADD CONSTRAINT post_relations_child_post_id_fkey
  FOREIGN KEY (child_post_id) REFERENCES public.posts(id) ON DELETE CASCADE;

-- Add index on relation_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_post_relations_type 
  ON public.post_relations(relation_type);

-- ============================================
-- PART 3: CREATE POST RELATION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.create_post_relation(
  p_parent_post_id UUID,
  p_child_post_id  UUID,
  p_relation_type  TEXT
)
RETURNS public.post_relations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_parent_owner  UUID;
  v_child_owner   UUID;
  v_parent_org    UUID;
  v_child_org     UUID;
  v_user_id       UUID := auth.uid();
  v_is_allowed    BOOLEAN := FALSE;
  v_result        public.post_relations%ROWTYPE;
BEGIN
  IF p_parent_post_id IS NULL OR p_child_post_id IS NULL THEN
    RAISE EXCEPTION 'parent_post_id and child_post_id must be provided';
  END IF;

  IF p_relation_type NOT IN ('origin', 'reply', 'quote', 'cross_link') THEN
    RAISE EXCEPTION 'invalid relation_type. Allowed: origin, reply, quote, cross_link';
  END IF;

  SELECT user_id, org_id INTO v_parent_owner, v_parent_org
  FROM public.posts WHERE id = p_parent_post_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'parent post not found: %', p_parent_post_id;
  END IF;

  SELECT user_id, org_id INTO v_child_owner, v_child_org
  FROM public.posts WHERE id = p_child_post_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'child post not found: %', p_child_post_id;
  END IF;

  IF v_user_id IS NOT NULL AND (v_user_id = v_parent_owner OR v_user_id = v_child_owner) THEN
    v_is_allowed := TRUE;
  END IF;

  IF NOT v_is_allowed AND v_parent_org IS NOT NULL THEN
    v_is_allowed := EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.user_id = v_user_id AND om.org_id = v_parent_org AND om.role = 'business_admin'
    );
  END IF;

  IF NOT v_is_allowed AND v_child_org IS NOT NULL THEN
    v_is_allowed := EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.user_id = v_user_id AND om.org_id = v_child_org AND om.role = 'business_admin'
    );
  END IF;

  IF NOT v_is_allowed THEN
    RAISE EXCEPTION 'permission denied: you must own one of the posts or be a business_admin in the org';
  END IF;

  INSERT INTO public.post_relations (parent_post_id, child_post_id, relation_type)
  VALUES (p_parent_post_id, p_child_post_id, p_relation_type)
  ON CONFLICT (parent_post_id, child_post_id, relation_type) DO NOTHING
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.create_post_relation IS 
  'Creates a relation between two posts with permission checks. Allowed types: origin, reply, quote, cross_link';

REVOKE ALL ON FUNCTION public.create_post_relation FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_post_relation TO authenticated;

-- ============================================
-- PART 4: CONSOLIDATE ORG HELPERS
-- ============================================

CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org UUID;
BEGIN
  SELECT om.org_id INTO v_org
  FROM public.org_members om
  WHERE om.user_id = auth.uid()
  ORDER BY
    CASE om.role 
      WHEN 'owner' THEN 1
      WHEN 'business_admin' THEN 2
      ELSE 3
    END,
    om.created_at ASC
  LIMIT 1;
  RETURN v_org;
END;
$$;

COMMENT ON FUNCTION public.get_user_org_id IS 
  'Returns the primary organization ID for the current user (prefers owner > business_admin > earliest joined)';

CREATE OR REPLACE FUNCTION public.get_primary_org()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_user_org_id();
$$;

COMMENT ON FUNCTION public.get_primary_org IS 
  'ALIAS for get_user_org_id() - Returns the primary organization ID for the current user';

CREATE OR REPLACE FUNCTION public.get_user_org()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_user_org_id();
$$;

COMMENT ON FUNCTION public.get_user_org IS 
  'ALIAS for get_user_org_id() - Returns the primary organization ID for the current user';

CREATE OR REPLACE FUNCTION public.is_business_member()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.org_members om WHERE om.user_id = auth.uid());
$$;

COMMENT ON FUNCTION public.is_business_member IS 
  'Returns true if the current user is a member of any organization';

-- ============================================
-- PART 5: UPDATE POST_RELATIONS RLS POLICIES
-- ============================================

DROP POLICY IF EXISTS "pr_public_read" ON public.post_relations;
DROP POLICY IF EXISTS "pr_admin_all" ON public.post_relations;
DROP POLICY IF EXISTS "rls_pr_select" ON public.post_relations;
DROP POLICY IF EXISTS "rls_pr_insert" ON public.post_relations;
DROP POLICY IF EXISTS "rls_pr_delete" ON public.post_relations;
DROP POLICY IF EXISTS "post_relations_insert_authenticated" ON public.post_relations;
DROP POLICY IF EXISTS "post_relations_delete_authenticated" ON public.post_relations;
DROP POLICY IF EXISTS "Anyone can read post relations" ON public.post_relations;
DROP POLICY IF EXISTS "Users can create relations for their posts" ON public.post_relations;
DROP POLICY IF EXISTS "Users can update their own relations" ON public.post_relations;
DROP POLICY IF EXISTS "Users can delete their own relations" ON public.post_relations;

CREATE POLICY "select_post_relations"
  ON public.post_relations FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.posts p
      WHERE p.id = post_relations.parent_post_id
        AND (p.visibility = 'public' OR p.user_id = auth.uid() 
             OR (p.org_id IS NOT NULL AND public.is_org_member(p.org_id))))
    OR
    EXISTS (SELECT 1 FROM public.posts p
      WHERE p.id = post_relations.child_post_id
        AND (p.visibility = 'public' OR p.user_id = auth.uid()
             OR (p.org_id IS NOT NULL AND public.is_org_member(p.org_id))))
  );

CREATE POLICY "insert_post_relations"
  ON public.post_relations FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_relations.parent_post_id AND p.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_relations.child_post_id AND p.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.posts p JOIN public.org_members om ON om.org_id = p.org_id
        WHERE p.id = post_relations.parent_post_id AND p.org_id IS NOT NULL 
          AND om.user_id = auth.uid() AND om.role = 'business_admin')
    OR EXISTS (SELECT 1 FROM public.posts p JOIN public.org_members om ON om.org_id = p.org_id
        WHERE p.id = post_relations.child_post_id AND p.org_id IS NOT NULL
          AND om.user_id = auth.uid() AND om.role = 'business_admin')
  );

CREATE POLICY "delete_post_relations"
  ON public.post_relations FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_relations.parent_post_id AND p.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_relations.child_post_id AND p.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.posts p JOIN public.org_members om ON om.org_id = p.org_id
        WHERE p.id = post_relations.parent_post_id AND p.org_id IS NOT NULL
          AND om.user_id = auth.uid() AND om.role = 'business_admin')
    OR EXISTS (SELECT 1 FROM public.posts p JOIN public.org_members om ON om.org_id = p.org_id
        WHERE p.id = post_relations.child_post_id AND p.org_id IS NOT NULL
          AND om.user_id = auth.uid() AND om.role = 'business_admin')
  );

CREATE POLICY "admin_all_post_relations"
  ON public.post_relations FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================
-- PART 6: MARK IDEA_LINKS AS LEGACY
-- ============================================

COMMENT ON TABLE public.idea_links IS 
  'LEGACY - DO NOT USE. This table is deprecated in favor of public.post_relations. All new lineage should use post_relations with standardized relation types (origin, reply, quote, cross_link). This table remains for historical data only.';

DO $$
BEGIN
  RAISE NOTICE '✅ Migration complete!';
  RAISE NOTICE 'Summary: Standardized post_relations, created create_post_relation(), consolidated org helpers, updated RLS';
END $$;