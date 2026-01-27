-- Security fix: Restrict open_ideas access to admins only
-- This prevents email harvesting and ensures only admins can curate ideas

-- 1. Drop existing permissive SELECT policies that allow public access to email addresses
DROP POLICY IF EXISTS "read_open_ideas_approved" ON public.open_ideas;
DROP POLICY IF EXISTS "open_ideas_public_read" ON public.open_ideas;
DROP POLICY IF EXISTS "insert_open_ideas" ON public.open_ideas;
DROP POLICY IF EXISTS "open_ideas_any_insert" ON public.open_ideas;

-- 2. Create strict SELECT policy: only admins can read the full open_ideas table
CREATE POLICY "Only admins can read open_ideas"
ON public.open_ideas
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Allow anonymous/public insert (for submitting new ideas)
CREATE POLICY "Anyone can submit ideas"
ON public.open_ideas
FOR INSERT
WITH CHECK (true);

-- 4. Restrict UPDATE to admins only (for curation)
DROP POLICY IF EXISTS "open_ideas_admin_curate" ON public.open_ideas;
DROP POLICY IF EXISTS "update_open_ideas_count" ON public.open_ideas;

CREATE POLICY "Only admins can curate ideas"
ON public.open_ideas
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 5. Owners and admins can delete their own ideas
DROP POLICY IF EXISTS "open_ideas_owner_delete" ON public.open_ideas;

CREATE POLICY "Owners and admins can delete ideas"
ON public.open_ideas
FOR DELETE
USING (
  (user_id = auth.uid()) 
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- 6. Grant SELECT on the public view to authenticated and anonymous users
GRANT SELECT ON public.open_ideas_public TO authenticated;
GRANT SELECT ON public.open_ideas_public TO anon;