-- Add public SELECT policies for open_ideas_user and open_ideas_intake
-- This allows client-side reading of approved ideas from both tables

-- Policy for open_ideas_user: allow public SELECT of approved ideas
CREATE POLICY IF NOT EXISTS "public_select_approved_user_ideas"
ON public.open_ideas_user
FOR SELECT
USING (status = 'approved');

-- Policy for open_ideas_intake: allow public SELECT of approved ideas  
CREATE POLICY IF NOT EXISTS "public_select_approved_intake_ideas"
ON public.open_ideas_intake
FOR SELECT
USING (status = 'approved');

-- Grant SELECT permissions on the tables (in addition to RLS policies)
GRANT SELECT ON public.open_ideas_user TO authenticated, anon;
GRANT SELECT ON public.open_ideas_intake TO authenticated, anon;

