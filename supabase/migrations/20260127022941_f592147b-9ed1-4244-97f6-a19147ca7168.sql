-- Think Space: Pull-the-Thread System
-- V1: Raw Chains data model

-- Create thought_chains table
CREATE TABLE public.thought_chains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  first_thought_at TIMESTAMPTZ,
  display_label TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.thought_chains ENABLE ROW LEVEL SECURITY;

-- RLS policies for thought_chains
CREATE POLICY "Users can view their own chains"
  ON public.thought_chains FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chains"
  ON public.thought_chains FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chains"
  ON public.thought_chains FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chains"
  ON public.thought_chains FOR DELETE
  USING (auth.uid() = user_id);

-- Add chain_id to workspace_thoughts (nullable for migration)
ALTER TABLE public.workspace_thoughts
  ADD COLUMN chain_id UUID REFERENCES public.thought_chains(id) ON DELETE SET NULL;

-- Index for efficient chain queries
CREATE INDEX idx_thought_chains_user_id ON public.thought_chains(user_id);
CREATE INDEX idx_thought_chains_first_thought_at ON public.thought_chains(first_thought_at DESC);
CREATE INDEX idx_workspace_thoughts_chain_id ON public.workspace_thoughts(chain_id);

-- Trigger to update first_thought_at when thoughts are added
CREATE OR REPLACE FUNCTION public.update_chain_first_thought_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Update first_thought_at to the earliest anchored_at/created_at of thoughts in this chain
  UPDATE public.thought_chains
  SET first_thought_at = (
    SELECT MIN(COALESCE(anchored_at, created_at))
    FROM public.workspace_thoughts
    WHERE chain_id = NEW.chain_id
  ),
  updated_at = now()
  WHERE id = NEW.chain_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_chain_timestamp
  AFTER INSERT OR UPDATE OF chain_id, anchored_at ON public.workspace_thoughts
  FOR EACH ROW
  WHEN (NEW.chain_id IS NOT NULL)
  EXECUTE FUNCTION public.update_chain_first_thought_at();

-- V2 preparation: thought_lenses and lens_chains tables
CREATE TABLE public.thought_lenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  label TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.thought_lenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own lenses"
  ON public.thought_lenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lenses"
  ON public.thought_lenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lenses"
  ON public.thought_lenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lenses"
  ON public.thought_lenses FOR DELETE
  USING (auth.uid() = user_id);

CREATE TABLE public.lens_chains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lens_id UUID NOT NULL REFERENCES public.thought_lenses(id) ON DELETE CASCADE,
  chain_id UUID NOT NULL REFERENCES public.thought_chains(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(lens_id, chain_id)
);

ALTER TABLE public.lens_chains ENABLE ROW LEVEL SECURITY;

-- RLS for lens_chains - user can manage if they own the lens
CREATE POLICY "Users can view their lens chains"
  ON public.lens_chains FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.thought_lenses
    WHERE id = lens_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can add to their lenses"
  ON public.lens_chains FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.thought_lenses
    WHERE id = lens_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can remove from their lenses"
  ON public.lens_chains FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.thought_lenses
    WHERE id = lens_id AND user_id = auth.uid()
  ));

CREATE INDEX idx_thought_lenses_user_id ON public.thought_lenses(user_id);
CREATE INDEX idx_lens_chains_lens_id ON public.lens_chains(lens_id);
CREATE INDEX idx_lens_chains_chain_id ON public.lens_chains(chain_id);