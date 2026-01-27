-- Fix RLS policy for post_utility_ratings to allow upsert
-- Drop and recreate the update policy with proper WITH CHECK clause

DROP POLICY IF EXISTS "Users can update their own ratings" ON post_utility_ratings;

CREATE POLICY "Users can update their own ratings" 
ON post_utility_ratings 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);