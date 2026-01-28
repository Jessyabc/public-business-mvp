-- Create table for post relations to link posts in a graph (replies, linking)
CREATE TABLE IF NOT EXISTS public.post_relations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  child_post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  relation_type text NOT NULL CHECK (relation_type IN ('continuation','linking')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT post_relations_parent_child_type_unique UNIQUE (parent_post_id, child_post_id, relation_type)
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_post_relations_parent ON public.post_relations (parent_post_id);
CREATE INDEX IF NOT EXISTS idx_post_relations_child ON public.post_relations (child_post_id);

-- Enable Row Level Security
ALTER TABLE public.post_relations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Anyone can read post relations" ON public.post_relations;
CREATE POLICY "Anyone can read post relations"
ON public.post_relations
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can create relations for their posts" ON public.post_relations;
CREATE POLICY "Users can create relations for their posts"
ON public.post_relations
FOR INSERT
WITH CHECK (
  auth.uid() = (SELECT user_id FROM public.posts WHERE id = child_post_id)
);

DROP POLICY IF EXISTS "Users can update their own relations" ON public.post_relations;
CREATE POLICY "Users can update their own relations"
ON public.post_relations
FOR UPDATE
USING (
  auth.uid() = (SELECT user_id FROM public.posts WHERE id = child_post_id)
);

DROP POLICY IF EXISTS "Users can delete their own relations" ON public.post_relations;
CREATE POLICY "Users can delete their own relations"
ON public.post_relations
FOR DELETE
USING (
  auth.uid() = (SELECT user_id FROM public.posts WHERE id = child_post_id)
);

-- Ensure posts.updated_at is automatically maintained
DROP TRIGGER IF EXISTS trg_update_posts_updated_at ON public.posts;
CREATE TRIGGER trg_update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.update_posts_updated_at();