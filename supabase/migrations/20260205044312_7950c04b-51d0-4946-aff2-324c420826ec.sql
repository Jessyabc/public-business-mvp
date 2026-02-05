-- Phase 1: Database Migrations for Think Space Chain of Thoughts

-- 1. Create chain_links table for merge relationships
CREATE TABLE IF NOT EXISTS public.chain_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_chain_id UUID NOT NULL REFERENCES public.thought_chains(id) ON DELETE CASCADE,
  to_chain_id UUID NOT NULL REFERENCES public.thought_chains(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chain_links_unique UNIQUE (from_chain_id, to_chain_id),
  CONSTRAINT chain_links_no_self_link CHECK (from_chain_id <> to_chain_id)
);

-- Indexes for chain_links
CREATE INDEX IF NOT EXISTS idx_chain_links_user ON public.chain_links(user_id);
CREATE INDEX IF NOT EXISTS idx_chain_links_from ON public.chain_links(from_chain_id);
CREATE INDEX IF NOT EXISTS idx_chain_links_to ON public.chain_links(to_chain_id);

-- Enable RLS on chain_links
ALTER TABLE public.chain_links ENABLE ROW LEVEL SECURITY;

-- RLS policies for chain_links
CREATE POLICY "Users can view own chain links"
  ON public.chain_links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chain links"
  ON public.chain_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chain links"
  ON public.chain_links FOR DELETE
  USING (auth.uid() = user_id);

-- 2. Add edited_from_id column to workspace_thoughts for copy-on-edit
ALTER TABLE public.workspace_thoughts 
  ADD COLUMN IF NOT EXISTS edited_from_id UUID REFERENCES public.workspace_thoughts(id);

-- 3. Add embedding column for semantic search (pgvector)
ALTER TABLE public.workspace_thoughts 
  ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- 4. Create IVFFlat index on embedding for efficient similarity search
-- Note: IVFFlat requires at least some data, so we create it with lists=10 initially
CREATE INDEX IF NOT EXISTS idx_workspace_thoughts_embedding 
  ON public.workspace_thoughts 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);

-- 5. Create RPC function for semantic search
CREATE OR REPLACE FUNCTION public.search_thoughts(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 20
) 
RETURNS SETOF public.workspace_thoughts
LANGUAGE sql 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.workspace_thoughts
  WHERE user_id = auth.uid()
  AND state = 'anchored'
  AND embedding IS NOT NULL
  AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;