-- Phase 1: Fix RPC functions for metrics system

-- 1a. Update increment_post_likes to accept user_id parameter
CREATE OR REPLACE FUNCTION public.increment_post_likes(p_post_id uuid, p_user_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Just update the post counters (edge function handles interaction insert)
  UPDATE public.posts
  SET
    likes_count = COALESCE(likes_count, 0) + 1,
    t_score = CASE WHEN mode = 'public' THEN COALESCE(t_score, 0) + 1 ELSE t_score END,
    updated_at = now()
  WHERE id = p_post_id;
END;
$$;

-- 1b. Add decrement_post_likes for toggle functionality
CREATE OR REPLACE FUNCTION public.decrement_post_likes(p_post_id uuid, p_user_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.posts
  SET
    likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0),
    t_score = CASE WHEN mode = 'public' THEN GREATEST(COALESCE(t_score, 0) - 1, 0) ELSE t_score END,
    updated_at = now()
  WHERE id = p_post_id;
END;
$$;

-- Phase 6: Update get_lineage_clusters to include views_count and has_given_thought
CREATE OR REPLACE FUNCTION public.get_lineage_clusters(
  p_mode text DEFAULT 'public'::text, 
  p_limit integer DEFAULT 20, 
  p_cursor text DEFAULT NULL::text, 
  p_kinds text[] DEFAULT NULL::text[], 
  p_search text DEFAULT NULL::text, 
  p_org_id uuid DEFAULT NULL::uuid,
  p_user_id uuid DEFAULT NULL::uuid
)
RETURNS TABLE(
  spark_id uuid, 
  spark_data jsonb, 
  continuations jsonb, 
  total_continuations bigint, 
  latest_activity_at timestamp with time zone
)
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_kinds post_kind[];
BEGIN
  -- Cast text array to post_kind enum array if provided
  IF p_kinds IS NOT NULL THEN
    v_kinds := p_kinds::post_kind[];
  END IF;

  RETURN QUERY
  WITH RECURSIVE spark_roots AS (
    -- Get root sparks (posts with no parent or origin)
    SELECT p.id, p.created_at, p.title, p.content, p.body, p.kind, p.t_score, 
           p.u_score, p.user_id, p.org_id, p.mode, p.status, p.visibility,
           p.metadata, p.continuation_count, p.views_count,
           -- Check if current user has given thought to this spark
           EXISTS (
             SELECT 1 FROM post_interactions pi 
             WHERE pi.post_id = p.id 
             AND pi.user_id = p_user_id 
             AND pi.kind = 'like'
           ) AS has_given_thought
    FROM posts p
    WHERE p.kind = 'Spark'::post_kind
      AND p.status = 'active'
      -- Filter by mode
      AND p.mode = p_mode
      -- For public mode, also require public visibility
      AND (p_mode = 'business' OR p.visibility = 'public')
      AND (v_kinds IS NULL OR p.kind = ANY(v_kinds))
      AND (p_org_id IS NULL OR p.org_id = p_org_id)
      AND (p_search IS NULL OR p.title ILIKE '%' || p_search || '%' OR p.content ILIKE '%' || p_search || '%')
      -- Cursor-based pagination
      AND (p_cursor IS NULL OR p.created_at < p_cursor::timestamptz)
      AND NOT EXISTS (
        SELECT 1 FROM post_relations pr 
        WHERE pr.child_post_id = p.id 
        AND pr.relation_type IN ('reply', 'origin')
      )
    ORDER BY p.created_at DESC
    LIMIT p_limit
  ),
  continuations_data AS (
    -- Base case: direct continuations of spark roots
    SELECT 
      sr.id AS spark_id,
      pr.child_post_id,
      cp.id AS post_id,
      cp.title,
      cp.content,
      cp.body,
      cp.kind,
      cp.t_score,
      cp.user_id,
      cp.created_at,
      cp.metadata,
      cp.views_count AS cont_views_count,
      pr.parent_post_id,
      1 AS depth,
      EXISTS (
        SELECT 1 FROM post_interactions pi 
        WHERE pi.post_id = cp.id 
        AND pi.user_id = p_user_id 
        AND pi.kind = 'like'
      ) AS cont_has_given_thought
    FROM spark_roots sr
    JOIN post_relations pr ON pr.parent_post_id = sr.id
    JOIN posts cp ON cp.id = pr.child_post_id AND cp.status = 'active'
    WHERE pr.relation_type IN ('reply', 'origin')
    
    UNION ALL
    
    -- Recursive case: nested continuations
    SELECT 
      cd.spark_id,
      pr2.child_post_id,
      cp2.id AS post_id,
      cp2.title,
      cp2.content,
      cp2.body,
      cp2.kind,
      cp2.t_score,
      cp2.user_id,
      cp2.created_at,
      cp2.metadata,
      cp2.views_count AS cont_views_count,
      pr2.parent_post_id,
      cd.depth + 1 AS depth,
      EXISTS (
        SELECT 1 FROM post_interactions pi 
        WHERE pi.post_id = cp2.id 
        AND pi.user_id = p_user_id 
        AND pi.kind = 'like'
      ) AS cont_has_given_thought
    FROM continuations_data cd
    JOIN post_relations pr2 ON pr2.parent_post_id = cd.post_id
    JOIN posts cp2 ON cp2.id = pr2.child_post_id AND cp2.status = 'active'
    WHERE pr2.relation_type IN ('reply', 'origin')
      AND cd.depth < 3
  )
  SELECT 
    sr.id AS spark_id,
    jsonb_build_object(
      'id', sr.id,
      'title', sr.title,
      'content', sr.content,
      'body', sr.body,
      'kind', sr.kind,
      't_score', sr.t_score,
      'u_score', sr.u_score,
      'user_id', sr.user_id,
      'org_id', sr.org_id,
      'mode', sr.mode,
      'status', sr.status,
      'visibility', sr.visibility,
      'created_at', sr.created_at,
      'metadata', sr.metadata,
      'continuation_count', sr.continuation_count,
      'views_count', sr.views_count,
      'has_given_thought', sr.has_given_thought
    ) AS spark_data,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'post', jsonb_build_object(
            'id', cd.post_id,
            'title', cd.title,
            'content', cd.content,
            'body', cd.body,
            'kind', cd.kind,
            't_score', cd.t_score,
            'user_id', cd.user_id,
            'created_at', cd.created_at,
            'metadata', cd.metadata,
            'views_count', cd.cont_views_count,
            'has_given_thought', cd.cont_has_given_thought
          ),
          'depth', cd.depth,
          'parent_id', cd.parent_post_id,
          'descendant_count', 0,
          'score', COALESCE(cd.t_score, 0)
        )
      ) FILTER (WHERE cd.post_id IS NOT NULL),
      '[]'::jsonb
    ) AS continuations,
    COUNT(cd.post_id) AS total_continuations,
    GREATEST(sr.created_at, MAX(cd.created_at)) AS latest_activity_at
  FROM spark_roots sr
  LEFT JOIN continuations_data cd ON cd.spark_id = sr.id
  GROUP BY sr.id, sr.title, sr.content, sr.body, sr.kind, sr.t_score, sr.u_score,
           sr.user_id, sr.org_id, sr.mode, sr.status, sr.visibility, sr.created_at,
           sr.metadata, sr.continuation_count, sr.views_count, sr.has_given_thought
  ORDER BY latest_activity_at DESC;
END;
$function$;