-- Fix thought interaction to increment t_score for public posts
-- Update increment_post_likes to also increment t_score for public posts when liked

CREATE OR REPLACE FUNCTION public.increment_post_likes(p_post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Track the like interaction (only once per user)
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated to like posts';
  END IF;

  INSERT INTO public.post_interactions(user_id, post_id, kind)
  VALUES (auth.uid(), p_post_id, 'like')
  ON CONFLICT (user_id, post_id, kind) DO NOTHING;

  -- Increment like count
  UPDATE public.posts
  SET likes_count = COALESCE(likes_count, 0) + 1,
      updated_at = now()
  WHERE id = p_post_id;

  -- Also increment t_score for public posts (thought/engagement score)
  -- This represents "this made me think" - giving a thought increases T-score
  UPDATE public.posts
  SET t_score = COALESCE(t_score, 0) + 1,
      updated_at = now()
  WHERE id = p_post_id
    AND mode = 'public';
END;
$$;

-- Create function to decrement likes and t_score (for unliking)
CREATE OR REPLACE FUNCTION public.decrement_post_likes(p_post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Decrement like count
  UPDATE public.posts
  SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0),
      updated_at = now()
  WHERE id = p_post_id;

  -- Also decrement t_score for public posts
  UPDATE public.posts
  SET t_score = GREATEST(COALESCE(t_score, 0) - 1, 0),
      updated_at = now()
  WHERE id = p_post_id
    AND mode = 'public';
END;
$$;

