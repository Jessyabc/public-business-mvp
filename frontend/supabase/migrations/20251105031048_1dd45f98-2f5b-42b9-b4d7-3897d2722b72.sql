-- Create post_interactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.post_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('view', 'like', 'comment')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id, kind)
);

-- Enable RLS
ALTER TABLE public.post_interactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own interactions" ON public.post_interactions;
DROP POLICY IF EXISTS "Users can view all interactions" ON public.post_interactions;

-- RLS policies
CREATE POLICY "Users can insert their own interactions"
  ON public.post_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all interactions"
  ON public.post_interactions FOR SELECT
  USING (true);

-- Drop and recreate increment functions
DROP FUNCTION IF EXISTS public.increment_post_views(uuid);
DROP FUNCTION IF EXISTS public.increment_post_likes(uuid);

CREATE FUNCTION public.increment_post_views(p_post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Track the view interaction (only once per user)
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.post_interactions(user_id, post_id, kind)
    VALUES (auth.uid(), p_post_id, 'view')
    ON CONFLICT (user_id, post_id, kind) DO NOTHING;
  END IF;

  -- Increment view count
  UPDATE public.posts
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = p_post_id;
END$$;

CREATE FUNCTION public.increment_post_likes(p_post_id uuid)
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
  SET likes_count = COALESCE(likes_count, 0) + 1
  WHERE id = p_post_id;
END$$;