-- Add RPC functions for post engagement counters
CREATE OR REPLACE FUNCTION public.increment_post_likes(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  UPDATE public.posts 
  SET likes_count = COALESCE(likes_count, 0) + 1,
      updated_at = now()
  WHERE id = post_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_post_views(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  UPDATE public.posts 
  SET views_count = COALESCE(views_count, 0) + 1,
      updated_at = now()
  WHERE id = post_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_post_comments(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  UPDATE public.posts 
  SET comments_count = COALESCE(comments_count, 0) + 1,
      updated_at = now()
  WHERE id = post_id;
END;
$$;