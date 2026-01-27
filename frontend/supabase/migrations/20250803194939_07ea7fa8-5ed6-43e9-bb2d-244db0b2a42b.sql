-- Fix posts RLS policies to allow proper access to public posts
-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Posts are viewable by everyone for public visibility" ON public.posts;
DROP POLICY IF EXISTS "Business posts are viewable by business users" ON public.posts;

-- Create a comprehensive policy for viewing posts
CREATE POLICY "Public posts are viewable by everyone, private posts by owners" 
ON public.posts 
FOR SELECT 
USING (
  -- Public visibility posts are visible to everyone
  visibility = 'public' 
  OR 
  -- Users can always see their own posts
  auth.uid() = user_id 
  OR 
  -- Business posts with business visibility require authentication
  (
    mode = 'business' 
    AND visibility IN ('other_businesses', 'my_business') 
    AND auth.uid() IS NOT NULL
  )
);

-- Ensure users can create brainstorms without business restrictions
-- Update the posts insert policy to be more permissive for brainstorms
DROP POLICY IF EXISTS "Users can create their own posts" ON public.posts;

CREATE POLICY "Users can create posts" 
ON public.posts 
FOR INSERT 
WITH CHECK (
  -- Must be authenticated
  auth.uid() IS NOT NULL
  AND
  -- Either it's their own post or it's a public brainstorm
  (
    auth.uid() = user_id 
    OR 
    (type = 'brainstorm' AND mode = 'public' AND visibility = 'public')
  )
);