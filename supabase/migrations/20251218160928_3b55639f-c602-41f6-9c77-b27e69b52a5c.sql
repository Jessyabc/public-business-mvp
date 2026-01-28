-- Create workspace_thoughts table for Pillar #1: Individual Workspace
-- This is a private cognitive space, NOT a content/post system

CREATE TABLE public.workspace_thoughts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT 'active' CHECK (state IN ('active', 'anchored')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Critical: No social metrics columns (likes, views, scores, etc.)
-- This is pure external memory, not content

-- Enable RLS
ALTER TABLE public.workspace_thoughts ENABLE ROW LEVEL SECURITY;

-- STRICT privacy: Users can ONLY see their own thoughts
CREATE POLICY "workspace_thoughts_owner_select"
  ON public.workspace_thoughts
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "workspace_thoughts_owner_insert"
  ON public.workspace_thoughts
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "workspace_thoughts_owner_update"
  ON public.workspace_thoughts
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "workspace_thoughts_owner_delete"
  ON public.workspace_thoughts
  FOR DELETE
  USING (user_id = auth.uid());

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_workspace_thoughts_updated_at
  BEFORE UPDATE ON public.workspace_thoughts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for efficient user-based queries
CREATE INDEX idx_workspace_thoughts_user_id ON public.workspace_thoughts(user_id);
CREATE INDEX idx_workspace_thoughts_user_state ON public.workspace_thoughts(user_id, state);
CREATE INDEX idx_workspace_thoughts_user_updated ON public.workspace_thoughts(user_id, updated_at DESC);