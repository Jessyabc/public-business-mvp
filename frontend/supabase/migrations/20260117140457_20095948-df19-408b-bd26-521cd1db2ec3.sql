-- Fix analytics_events RLS to allow anonymous inserts
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Insert analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "analytics_events_authenticated_insert" ON public.analytics_events;
DROP POLICY IF EXISTS "analytics_events_anonymous_insert" ON public.analytics_events;

-- Create permissive insert policy for both anonymous and authenticated users
CREATE POLICY "analytics_events_insert_all" ON public.analytics_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    -- Allow if user_id is NULL (anonymous)
    user_id IS NULL
    -- OR user_id matches the authenticated user
    OR user_id = auth.uid()
  );