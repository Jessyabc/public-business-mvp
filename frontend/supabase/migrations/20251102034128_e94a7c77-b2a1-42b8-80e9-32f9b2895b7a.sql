-- Update RLS policies for business insights to allow public visibility
-- Business insights are stored in posts table with type='insight' and mode='business'

-- Drop existing restrictive policies for business insights
DROP POLICY IF EXISTS "read_insights_org_members" ON public.posts;
DROP POLICY IF EXISTS "insert_insight_org_member" ON public.posts;

-- 1. Anyone (including anonymous) can view public business posts
CREATE POLICY "read_public_business_insights"
ON public.posts
FOR SELECT
TO anon, authenticated
USING (
  type = 'insight' 
  AND mode = 'business' 
  AND visibility = 'public'
  AND status = 'active'
);

-- 2. Org members can view posts within their organization (my_business visibility)
CREATE POLICY "read_org_business_insights"
ON public.posts
FOR SELECT
TO authenticated
USING (
  type = 'insight'
  AND mode = 'business'
  AND visibility = 'my_business'
  AND status = 'active'
  AND org_id IS NOT NULL
  AND is_org_member(org_id)
);

-- 3. Post owners can view and edit their own business posts
CREATE POLICY "manage_own_business_insights"
ON public.posts
FOR ALL
TO authenticated
USING (
  type = 'insight'
  AND mode = 'business'
  AND user_id = auth.uid()
)
WITH CHECK (
  type = 'insight'
  AND mode = 'business'
  AND user_id = auth.uid()
);

-- 4. Org members can insert business insights for their org
CREATE POLICY "insert_org_business_insights"
ON public.posts
FOR INSERT
TO authenticated
WITH CHECK (
  type = 'insight'
  AND mode = 'business'
  AND user_id = auth.uid()
  AND (
    (visibility = 'my_business' AND org_id IS NOT NULL AND is_org_member(org_id))
    OR (visibility = 'public' AND org_id IS NOT NULL AND is_org_member(org_id))
  )
);

-- 5. Admins can view and manage all business posts (already covered by admin_all_posts policy)

-- Ensure the business_insights table (if still used) also has proper policies
-- Drop old restrictive policies
DROP POLICY IF EXISTS "business_insights_insert" ON public.business_insights;
DROP POLICY IF EXISTS "business_insights_select" ON public.business_insights;
DROP POLICY IF EXISTS "business_insights_update" ON public.business_insights;
DROP POLICY IF EXISTS "insert_business_insights" ON public.business_insights;
DROP POLICY IF EXISTS "select_business_insights" ON public.business_insights;
DROP POLICY IF EXISTS "update_business_insights" ON public.business_insights;

-- Create new policies for business_insights table (for backward compatibility)
CREATE POLICY "read_public_business_insights_legacy"
ON public.business_insights
FOR SELECT
TO anon, authenticated
USING (true);  -- No visibility field in business_insights, so allow all

CREATE POLICY "insert_own_business_insights_legacy"
ON public.business_insights
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_business_insights_legacy"
ON public.business_insights
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Add visibility column to business_insights if it doesn't exist (for future use)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'business_insights' 
    AND column_name = 'visibility'
  ) THEN
    ALTER TABLE public.business_insights
    ADD COLUMN visibility TEXT DEFAULT 'public'
    CHECK (visibility IN ('public', 'private', 'my_business'));
  END IF;
END $$;

-- Update business_posts_view to be accessible to everyone
-- This view already exists and should show public posts to all users
GRANT SELECT ON public.business_posts_view TO anon, authenticated;