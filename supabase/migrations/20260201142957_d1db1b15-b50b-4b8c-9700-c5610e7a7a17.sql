-- Add missing foreign key indexes for Supabase performance lints
-- These indexes speed up joins and FK constraint checks

-- 1) admin audit log
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_user_id
ON public.admin_audit_log (admin_user_id);

-- 2) nods pages (tree structure)
CREATE INDEX IF NOT EXISTS idx_nods_page_parent_page_id
ON public.nods_page (parent_page_id);

CREATE INDEX IF NOT EXISTS idx_nods_page_section_page_id
ON public.nods_page_section (page_id);

-- 3) org flows
CREATE INDEX IF NOT EXISTS idx_org_member_applications_reviewed_by
ON public.org_member_applications (reviewed_by);

CREATE INDEX IF NOT EXISTS idx_org_requests_industry_id
ON public.org_requests (industry_id);

CREATE INDEX IF NOT EXISTS idx_orgs_created_by
ON public.orgs (created_by);

CREATE INDEX IF NOT EXISTS idx_orgs_industry_id
ON public.orgs (industry_id);

-- 4) interactions (important for PB)
CREATE INDEX IF NOT EXISTS idx_post_interactions_post_id
ON public.post_interactions (post_id);

-- Composite index for loading interactions ordered by newest first
CREATE INDEX IF NOT EXISTS idx_post_interactions_post_id_created_at
ON public.post_interactions (post_id, created_at DESC);