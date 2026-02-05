-- Update the search_thoughts function to accept user_id filter
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
  WHERE 
    wt.embedding IS NOT NULL
    AND (search_user_id IS NULL OR wt.user_id = search_user_id)
    AND 1 - (wt.embedding <=> query_embedding) > match_threshold
  ORDER BY wt.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;