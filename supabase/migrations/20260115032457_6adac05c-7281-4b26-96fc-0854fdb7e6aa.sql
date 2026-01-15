-- P0: Batch cluster building RPC function
-- Replaces recursive N+1 queries with a single optimized query

CREATE OR REPLACE FUNCTION get_lineage_clusters(
  p_mode text DEFAULT 'public',
  p_limit int DEFAULT 20,
  p_cursor timestamptz DEFAULT NULL,
  p_kinds text[] DEFAULT NULL,
  p_search text DEFAULT NULL,
  p_org_id uuid DEFAULT NULL
)
RETURNS TABLE (
  spark_id uuid,
  spark_data jsonb,
  continuations jsonb,
  total_continuations bigint,
  latest_activity_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE
  -- Step 1: Find root Sparks (posts with kind='Spark' that are NOT children of any reply/origin relation)
  child_posts AS (
    SELECT DISTINCT pr.child_post_id
    FROM post_relations pr
    WHERE pr.relation_type IN ('reply', 'origin')
  ),
  root_sparks AS (
    SELECT p.*
    FROM posts p
    LEFT JOIN child_posts cp ON cp.child_post_id = p.id
    WHERE p.status = 'active'
      AND p.kind = 'Spark'
      AND cp.child_post_id IS NULL
      -- Mode/visibility filters
      AND (
        (p_mode = 'public' AND p.mode = 'public' AND p.visibility = 'public')
        OR
        (p_mode = 'business' AND p.mode = 'business' AND p.published_at IS NOT NULL
          AND (
            p_org_id IS NULL AND p.visibility = 'public'
            OR
            p_org_id IS NOT NULL AND p.org_id = p_org_id AND p.visibility IN ('my_business', 'other_businesses', 'public')
          )
        )
      )
      -- Optional kind filter
      AND (p_kinds IS NULL OR p.kind = ANY(p_kinds))
      -- Optional search filter
      AND (p_search IS NULL OR p.title ILIKE '%' || p_search || '%' OR p.content ILIKE '%' || p_search || '%')
  ),
  -- Step 2: Recursively fetch all continuations for each root
  lineage AS (
    SELECT 
      rs.id AS root_id,
      rs.id AS post_id,
      0 AS depth,
      rs.id AS parent_id
    FROM root_sparks rs
    
    UNION ALL
    
    SELECT 
      l.root_id,
      pr.child_post_id AS post_id,
      l.depth + 1 AS depth,
      l.post_id AS parent_id
    FROM lineage l
    JOIN post_relations pr ON pr.parent_post_id = l.post_id
    WHERE pr.relation_type IN ('reply', 'origin')
      AND l.depth < 10  -- Safety limit
  ),
  -- Step 3: Get all unique continuation posts with their depths
  continuation_posts AS (
    SELECT 
      l.root_id,
      l.post_id,
      l.depth,
      l.parent_id,
      p.*
    FROM lineage l
    JOIN posts p ON p.id = l.post_id
    WHERE l.depth > 0  -- Exclude the root itself
      AND p.status = 'active'
  ),
  -- Step 4: Count descendants for each post
  descendant_counts AS (
    SELECT 
      l.post_id,
      COUNT(DISTINCT child_l.post_id) AS descendant_count
    FROM lineage l
    LEFT JOIN lineage child_l ON child_l.parent_id = l.post_id AND child_l.depth > l.depth
    GROUP BY l.post_id
  ),
  -- Step 5: Aggregate continuations per root
  cluster_data AS (
    SELECT 
      rs.id AS root_id,
      row_to_json(rs)::jsonb AS spark_data,
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'post', row_to_json(cp)::jsonb,
            'depth', cp.depth,
            'parent_id', cp.parent_id,
            'descendant_count', COALESCE(dc.descendant_count, 0),
            'score', (COALESCE(cp.t_score, 0) * 0.30) + (COALESCE(dc.descendant_count, 0) * 0.70)
          )
          ORDER BY (COALESCE(cp.t_score, 0) * 0.30) + (COALESCE(dc.descendant_count, 0) * 0.70) DESC
        ) FILTER (WHERE cp.post_id IS NOT NULL),
        '[]'::jsonb
      ) AS continuations,
      COUNT(DISTINCT cp.post_id) AS total_continuations,
      GREATEST(
        rs.created_at,
        MAX(cp.created_at)
      ) AS latest_activity
    FROM root_sparks rs
    LEFT JOIN continuation_posts cp ON cp.root_id = rs.id
    LEFT JOIN descendant_counts dc ON dc.post_id = cp.post_id
    GROUP BY rs.id, rs.created_at, row_to_json(rs)::jsonb
  )
  -- Final: Return sorted and paginated
  SELECT 
    cd.root_id AS spark_id,
    cd.spark_data,
    cd.continuations,
    cd.total_continuations,
    cd.latest_activity AS latest_activity_at
  FROM cluster_data cd
  WHERE (p_cursor IS NULL OR cd.latest_activity < p_cursor)
  ORDER BY cd.latest_activity DESC
  LIMIT p_limit;
END;
$$;

-- P1: Add missing indexes for feed queries
CREATE INDEX IF NOT EXISTS idx_posts_feed_query 
  ON posts (mode, visibility, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_spark_roots 
  ON posts (status, kind, created_at DESC) 
  WHERE kind = 'Spark' AND status = 'active';

CREATE INDEX IF NOT EXISTS idx_post_relations_lineage
  ON post_relations (parent_post_id, relation_type);

-- Index for batch author lookup
CREATE INDEX IF NOT EXISTS idx_profile_cards_batch
  ON profiles (id)
  INCLUDE (display_name);

-- Add continuation_count column for denormalized counts (P2)
ALTER TABLE posts 
  ADD COLUMN IF NOT EXISTS continuation_count integer DEFAULT 0;

-- Update existing counts
UPDATE posts p
SET continuation_count = (
  SELECT COUNT(*)
  FROM post_relations pr
  WHERE pr.parent_post_id = p.id
    AND pr.relation_type IN ('reply', 'origin')
);

-- Create trigger function to maintain continuation_count (handles both INSERT and DELETE)
CREATE OR REPLACE FUNCTION update_post_continuation_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process reply/origin relation types
  IF TG_OP = 'INSERT' THEN
    IF NEW.relation_type IN ('reply', 'origin') THEN
      UPDATE posts 
      SET continuation_count = continuation_count + 1
      WHERE id = NEW.parent_post_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.relation_type IN ('reply', 'origin') THEN
      UPDATE posts 
      SET continuation_count = GREATEST(0, continuation_count - 1)
      WHERE id = OLD.parent_post_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Drop existing trigger if exists and recreate without WHEN clause
DROP TRIGGER IF EXISTS trg_update_continuation_count ON post_relations;
CREATE TRIGGER trg_update_continuation_count
AFTER INSERT OR DELETE ON post_relations
FOR EACH ROW
EXECUTE FUNCTION update_post_continuation_count();

-- Grant execute permission on the new function
GRANT EXECUTE ON FUNCTION get_lineage_clusters TO authenticated, anon;