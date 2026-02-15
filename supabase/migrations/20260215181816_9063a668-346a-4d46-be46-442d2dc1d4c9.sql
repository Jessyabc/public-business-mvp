-- Private links between thought chains and published Sparks
-- Only visible to the chain/spark owner
CREATE TABLE public.chain_spark_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  chain_id UUID NOT NULL REFERENCES public.thought_chains(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(chain_id, post_id)
);

-- Enable RLS
ALTER TABLE public.chain_spark_links ENABLE ROW LEVEL SECURITY;

-- Only the owner can see their own links
CREATE POLICY "Users can view their own chain-spark links"
  ON public.chain_spark_links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chain-spark links"
  ON public.chain_spark_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chain-spark links"
  ON public.chain_spark_links FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, DELETE ON public.chain_spark_links TO authenticated;
GRANT SELECT ON public.chain_spark_links TO anon;

-- Index for fast lookups by chain
CREATE INDEX idx_chain_spark_links_chain ON public.chain_spark_links(chain_id);
CREATE INDEX idx_chain_spark_links_post ON public.chain_spark_links(post_id);
CREATE INDEX idx_chain_spark_links_user ON public.chain_spark_links(user_id);