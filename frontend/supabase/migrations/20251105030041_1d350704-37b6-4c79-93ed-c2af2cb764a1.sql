-- 1. Ensure relation_type supports both 'hard' and 'soft'
ALTER TABLE public.post_relations
  DROP CONSTRAINT IF EXISTS post_relations_relation_type_check;

ALTER TABLE public.post_relations
  ADD CONSTRAINT post_relations_relation_type_check 
  CHECK (relation_type IN ('hard', 'soft'));

-- 2. Create unique indexes for hard and soft links
CREATE UNIQUE INDEX IF NOT EXISTS post_rel_hard_unique
  ON public.post_relations (parent_post_id, child_post_id)
  WHERE relation_type = 'hard';

CREATE UNIQUE INDEX IF NOT EXISTS post_rel_soft_unique
  ON public.post_relations (parent_post_id, child_post_id)
  WHERE relation_type = 'soft';

-- 3. RPC: List recent public posts from user's view history
CREATE OR REPLACE FUNCTION public.api_list_recent_public_posts(
  p_q text DEFAULT NULL,
  p_limit int DEFAULT 15
)
RETURNS TABLE (
  post_id uuid,
  post_type text,
  title text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  WITH ev AS (
    SELECT DISTINCT ON (e.properties->>'target_id')
      (e.properties->>'target_id')::uuid AS post_id,
      e.created_at
    FROM public.analytics_events e
    WHERE e.user_id = auth.uid()
      AND e.event_name = 'post_view'
    ORDER BY (e.properties->>'target_id'), e.created_at DESC
  )
  SELECT p.id,
         p.type AS post_type,
         p.title,
         p.created_at
  FROM ev
  JOIN public.posts p ON p.id = ev.post_id
  WHERE p.visibility = 'public'
    AND p.status = 'active'
    AND (p_q IS NULL OR p.title ILIKE '%'||p_q||'%' OR p.content ILIKE '%'||p_q||'%')
  ORDER BY ev.created_at DESC
  LIMIT GREATEST(1, LEAST(p_limit, 50));
$$;

-- 4. RPC: Create soft links in bulk (using index name for conflict)
CREATE OR REPLACE FUNCTION public.api_create_soft_links(
  p_parent uuid, 
  p_children uuid[]
)
RETURNS SETOF public.post_relations
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  INSERT INTO public.post_relations(parent_post_id, child_post_id, relation_type)
  SELECT p_parent, unnest(p_children), 'soft'
  ON CONFLICT (parent_post_id, child_post_id) WHERE relation_type = 'soft' DO NOTHING
  RETURNING *;
$$;