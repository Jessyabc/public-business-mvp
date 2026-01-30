-- Drop all existing versions of the function first
DROP FUNCTION IF EXISTS public.get_lineage_clusters(TEXT, INTEGER, TEXT, TEXT[], TEXT, UUID);

-- Recreate with proper type casting for post_kind enum
CREATE OR REPLACE FUNCTION public.get_lineage_clusters(
  p_mode TEXT DEFAULT 'public',
  p_limit INTEGER DEFAULT 20,
  p_cursor TEXT DEFAULT NULL,
  p_kinds TEXT[] DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_org_id UUID DEFAULT NULL
)
RETURNS TABLE (
  spark_id UUID,
  spark_data JSONB,
  continuations JSONB,
  total_continuations BIGINT,
  latest_activity_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_kinds post_kind[];
BEGIN
  -- Cast text array to post_kind enum array if provided
  IF p_kinds IS NOT NULL THEN
    v_kinds := p_kinds::post_kind[];
  END IF;

  RETURN QUERY
  WITH spark_roots AS (
    -- Get root sparks (posts with no parent or origin)
    SELECT p.id, p.created_at, p.title, p.content, p.body, p.kind, p.t_score, 
           p.u_score, p.user_id, p.org_id, p.mode, p.status, p.visibility,
           p.metadata, p.continuation_count
    FROM posts p
    WHERE p.kind = 'Spark'::post_kind
      AND p.status = 'active'
      AND (p_mode = 'public' OR (p_mode = 'business' AND p.mode = 'business'))
      AND (v_kinds IS NULL OR p.kind = ANY(v_kinds))
      AND (p_org_id IS NULL OR p.org_id = p_org_id)
      AND (p_search IS NULL OR p.title ILIKE '%' || p_search || '%' OR p.content ILIKE '%' || p_search || '%')
      AND NOT EXISTS (
        SELECT 1 FROM post_relations pr 
        WHERE pr.child_post_id = p.id 
        AND pr.relation_type IN ('reply', 'origin')
      )
    ORDER BY p.created_at DESC
    LIMIT p_limit
  ),
  continuations_data AS (
    -- Get all continuations for each spark
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
      pr.parent_post_id,
      1 AS depth
    FROM spark_roots sr
    JOIN post_relations pr ON pr.parent_post_id = sr.id
    JOIN posts cp ON cp.id = pr.child_post_id AND cp.status = 'active'
    WHERE pr.relation_type IN ('reply', 'origin')
    
    UNION ALL
    
    -- Recursive: get nested continuations (depth 2)
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
      pr2.parent_post_id,
      cd.depth + 1 AS depth
    FROM continuations_data cd
    JOIN post_relations pr2 ON pr2.parent_post_id = cd.post_id
    JOIN posts cp2 ON cp2.id = pr2.child_post_id AND cp2.status = 'active'
    WHERE pr2.relation_type IN ('reply', 'origin')
      AND cd.depth < 3  -- Limit recursion depth
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
      'continuation_count', sr.continuation_count
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
            'metadata', cd.metadata
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
           sr.metadata, sr.continuation_count
  ORDER BY latest_activity_at DESC;
END;
$$;

-- Ensure permissions are granted
GRANT EXECUTE ON FUNCTION public.get_lineage_clusters(TEXT, INTEGER, TEXT, TEXT[], TEXT, UUID) TO authenticated, anon;