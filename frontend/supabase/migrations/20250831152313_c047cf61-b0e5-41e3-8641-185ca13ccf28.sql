-- Create open ideas table
CREATE TABLE IF NOT EXISTS public.open_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 10 AND 280),
  email TEXT,
  is_curated BOOLEAN NOT NULL DEFAULT false,
  linked_brainstorms_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create brainstorms table (different from existing posts)
CREATE TABLE IF NOT EXISTS public.idea_brainstorms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES public.open_ideas(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 80),
  content TEXT NOT NULL,
  author_user_id UUID,
  author_display_name TEXT NOT NULL DEFAULT 'Guest',
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create leads table for email capture
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'open_idea',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END $$;

-- Add trigger for open_ideas updated_at
DROP TRIGGER IF EXISTS trg_open_ideas_updated ON public.open_ideas;
CREATE TRIGGER trg_open_ideas_updated 
  BEFORE UPDATE ON public.open_ideas
  FOR EACH ROW 
  EXECUTE FUNCTION public.set_updated_at();

-- Enable RLS
ALTER TABLE public.open_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_brainstorms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- RLS policies for public reading
CREATE POLICY "read_open_ideas" ON public.open_ideas
  FOR SELECT USING (true);

CREATE POLICY "insert_open_ideas" ON public.open_ideas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "read_brainstorms" ON public.idea_brainstorms
  FOR SELECT USING (true);

CREATE POLICY "insert_brainstorms" ON public.idea_brainstorms
  FOR INSERT WITH CHECK (true);

CREATE POLICY "update_open_ideas_count" ON public.open_ideas
  FOR UPDATE USING (true);

-- No public access to leads
CREATE POLICY "read_leads" ON public.leads
  FOR SELECT USING (false);

CREATE POLICY "insert_leads" ON public.leads
  FOR INSERT WITH CHECK (true);