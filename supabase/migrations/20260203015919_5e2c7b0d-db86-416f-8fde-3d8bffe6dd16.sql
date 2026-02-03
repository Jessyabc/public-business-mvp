-- Add divergence tracking to thought_chains for V1 chain breaks
-- Records where a new chain split from

-- Add divergence columns
ALTER TABLE public.thought_chains
ADD COLUMN IF NOT EXISTS diverged_from_chain_id uuid REFERENCES public.thought_chains(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS diverged_at_thought_id uuid REFERENCES public.workspace_thoughts(id) ON DELETE SET NULL;

-- Add index for finding chains that diverged from a specific chain
CREATE INDEX IF NOT EXISTS idx_thought_chains_diverged_from
ON public.thought_chains(diverged_from_chain_id)
WHERE diverged_from_chain_id IS NOT NULL;