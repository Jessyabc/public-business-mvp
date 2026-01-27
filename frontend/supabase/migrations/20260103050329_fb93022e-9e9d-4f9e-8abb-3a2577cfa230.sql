-- =====================================================
-- MVP LAUNCH SECURITY HARDENING - PHASE 1 & 2
-- =====================================================

-- 1. Fix profile_cards view - restrict to authenticated users only
DROP VIEW IF EXISTS public.profile_cards;
CREATE VIEW public.profile_cards WITH (security_invoker = false) AS
SELECT 
  id,
  display_name,
  company,
  "Social Media" AS linkedin_url,
  website,
  bio,
  location
FROM public.profiles
WHERE COALESCE(is_completed, false) = true;

-- Grant SELECT to authenticated users only, revoke from anon
GRANT SELECT ON public.profile_cards TO authenticated;
REVOKE ALL ON public.profile_cards FROM anon;

-- 2. Add RLS policies for nods_page tables (documentation/search data)
CREATE POLICY "nods_page_public_read" ON public.nods_page 
FOR SELECT USING (true);

CREATE POLICY "nods_page_section_public_read" ON public.nods_page_section 
FOR SELECT USING (true);

GRANT SELECT ON public.nods_page TO authenticated, anon;
GRANT SELECT ON public.nods_page_section TO authenticated, anon;

-- 3. Fix business_profiles_public view to explicitly exclude phone
DROP VIEW IF EXISTS public.business_profiles_public;
CREATE VIEW public.business_profiles_public AS
SELECT 
  id,
  company_name,
  industry_id,
  department_id,
  website,
  "Social Media" AS linkedin_url,
  status,
  created_at
  -- Explicitly NO phone column for privacy
FROM public.business_profiles
WHERE status = 'approved';

GRANT SELECT ON public.business_profiles_public TO authenticated, anon;

-- 4. Restrict post_interactions visibility - only own or public posts
DROP POLICY IF EXISTS "Users can view all interactions" ON public.post_interactions;
CREATE POLICY "View own and public post interactions" ON public.post_interactions
FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.posts p 
    WHERE p.id = post_interactions.post_id 
    AND (p.user_id = auth.uid() OR p.visibility = 'public')
  ) OR
  is_admin()
);

-- 5. Fix analytics_events - require authenticated user for inserts
DROP POLICY IF EXISTS "analytics_events_insert_any" ON public.analytics_events;
CREATE POLICY "analytics_events_authenticated_insert" ON public.analytics_events
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND user_id = auth.uid()
);