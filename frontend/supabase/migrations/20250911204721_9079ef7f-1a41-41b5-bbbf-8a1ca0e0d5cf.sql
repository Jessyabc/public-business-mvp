-- ChatGPT Security Plan Implementation: RLS + Secure Views
-- Phase 1: Critical Data Protection

-- 1) Create admin helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- 2) Create safe profile view (no PII exposure)
CREATE OR REPLACE VIEW public.profile_cards AS
SELECT
  id,
  display_name,
  company,
  linkedin_url,
  website,
  bio,
  location
FROM public.profiles
WHERE is_completed = true;

-- Grant access to safe view only
REVOKE ALL ON TABLE public.profiles FROM anon, authenticated;
GRANT SELECT ON public.profile_cards TO anon, authenticated;

-- Strict RLS on profiles table
DROP POLICY IF EXISTS profiles_owner_rw ON public.profiles;
CREATE POLICY profiles_owner_rw
ON public.profiles
FOR ALL
USING (id = auth.uid() OR public.is_admin())
WITH CHECK (id = auth.uid() OR public.is_admin());

-- 3) Create safe open_ideas view (hide emails from public)
CREATE OR REPLACE VIEW public.open_ideas_public AS
SELECT
  id, 
  content, 
  is_curated, 
  linked_brainstorms_count,
  created_at, 
  status
FROM public.open_ideas
WHERE status = 'approved';

-- Lock down open_ideas table
REVOKE ALL ON TABLE public.open_ideas FROM anon, authenticated;
GRANT SELECT ON public.open_ideas_public TO anon, authenticated;

-- Only owner/admin can see full row with email
DROP POLICY IF EXISTS open_ideas_owner_read ON public.open_ideas;
CREATE POLICY open_ideas_owner_read
ON public.open_ideas
FOR SELECT
USING (user_id = auth.uid() OR public.is_admin());

-- Anyone can insert (for anonymous submissions)
DROP POLICY IF EXISTS open_ideas_any_insert ON public.open_ideas;
CREATE POLICY open_ideas_any_insert
ON public.open_ideas
FOR INSERT
WITH CHECK (true);

-- Only owner/admin can update/delete
DROP POLICY IF EXISTS open_ideas_owner_write ON public.open_ideas;
CREATE POLICY open_ideas_owner_write
ON public.open_ideas
FOR UPDATE 
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY open_ideas_owner_delete
ON public.open_ideas
FOR DELETE 
USING (user_id = auth.uid() OR public.is_admin());

-- 4) Fix idea_brainstorms privacy (respect is_public flag)
DROP POLICY IF EXISTS idea_brainstorms_public_read ON public.idea_brainstorms;
CREATE POLICY idea_brainstorms_public_read
ON public.idea_brainstorms
FOR SELECT
USING (is_public = true OR author_user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS idea_brainstorms_owner_write ON public.idea_brainstorms;
CREATE POLICY idea_brainstorms_owner_write
ON public.idea_brainstorms
FOR ALL
USING (author_user_id = auth.uid() OR public.is_admin())
WITH CHECK (author_user_id = auth.uid() OR public.is_admin());

-- 5) Create safe business profiles view (public directory without sensitive data)
CREATE OR REPLACE VIEW public.business_profiles_public AS
SELECT 
  id, 
  company_name, 
  industry_id, 
  department_id, 
  website, 
  linkedin_url, 
  status,
  created_at
FROM public.business_profiles
WHERE status = 'approved';

-- Lock down business_profiles table
REVOKE ALL ON TABLE public.business_profiles FROM anon, authenticated;
GRANT SELECT ON public.business_profiles_public TO anon, authenticated;

-- Only owner/admin can access full business profile
DROP POLICY IF EXISTS business_profiles_owner_rw ON public.business_profiles;
CREATE POLICY business_profiles_owner_rw
ON public.business_profiles
FOR ALL
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- 6) Create rate limiting table for Edge Functions
CREATE TABLE IF NOT EXISTS public.api_hits (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ip_hash text NOT NULL,
  endpoint text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);

-- Index for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_api_hits_ip_endpoint_time 
ON public.api_hits(ip_hash, endpoint, created_at);

-- RLS for api_hits (admin only)
ALTER TABLE public.api_hits ENABLE ROW LEVEL SECURITY;

CREATE POLICY api_hits_admin_only
ON public.api_hits
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 7) Create user consent tracking table
CREATE TABLE IF NOT EXISTS public.user_consent (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type text NOT NULL,
  granted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, consent_type)
);

-- RLS for user_consent (user owns their consent)
ALTER TABLE public.user_consent ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_consent_owner
ON public.user_consent
FOR ALL
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- Anonymous users can insert consent (for GDPR compliance)
CREATE POLICY user_consent_anonymous_insert
ON public.user_consent
FOR INSERT
WITH CHECK (true);

-- Add updated_at trigger
CREATE TRIGGER update_user_consent_updated_at
    BEFORE UPDATE ON public.user_consent
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();