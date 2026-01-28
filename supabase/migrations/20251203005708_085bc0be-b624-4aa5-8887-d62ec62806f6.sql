-- Add unique constraint on post_utility_ratings for (post_id, user_id)
-- This allows upsert operations for rating updates
ALTER TABLE post_utility_ratings 
ADD CONSTRAINT post_utility_ratings_post_user_unique 
UNIQUE (post_id, user_id);