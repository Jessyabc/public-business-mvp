-- Drop and recreate search_thoughts function to accept user_id parameter from edge functions
DROP FUNCTION IF EXISTS public.search_thoughts(vector(1536), double precision, integer);
DROP FUNCTION IF EXISTS public.search_thoughts(vector(1536), double precision, integer, uuid);

CREATE OR REPLACE FUNCTION public.search_thoughts(
  query_embedding vector(1536),
  match_threshold double precision DEFAULT 0.5,
  match_count integer DEFAULT 20,
  search_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content text,
  similarity double precision,
  chain_id uuid,
  anchored_at timestamptz,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    wt.id,
    wt.content,
    1 - (wt.embedding <=> query_embedding) as similarity,
    wt.chain_id,
    wt.anchored_at,
    wt.created_at
  FROM public.workspace_thoughts wt
  WHERE wt.user_id = COALESCE(search_user_id, auth.uid())
    AND wt.state = 'anchored'
    AND wt.embedding IS NOT NULL
    AND 1 - (wt.embedding <=> query_embedding) > match_threshold
  ORDER BY wt.embedding <=> query_embedding
  LIMIT match_count;
$$;