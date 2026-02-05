-- Fix existing thoughts: update state to 'anchored' where anchored_at is set
UPDATE workspace_thoughts 
SET state = 'anchored' 
WHERE anchored_at IS NOT NULL AND state = 'active';

-- Recreate search_thoughts to use the correct parameter name (search_user_id)
-- and filter only on anchored_at (not state)
CREATE OR REPLACE FUNCTION public.search_thoughts(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10,
  search_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content text,
  similarity float,
  chain_id uuid,
  anchored_at timestamptz,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    wt.id,
    wt.content,
    1 - (wt.embedding <=> query_embedding) AS similarity,
    wt.chain_id,
    wt.anchored_at,
    wt.created_at
  FROM workspace_thoughts wt
  WHERE wt.user_id = COALESCE(search_user_id, auth.uid())
    AND wt.anchored_at IS NOT NULL
    AND wt.embedding IS NOT NULL
    AND LENGTH(wt.content) > 0
    AND 1 - (wt.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;