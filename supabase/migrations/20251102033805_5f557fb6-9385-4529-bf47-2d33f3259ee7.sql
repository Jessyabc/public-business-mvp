-- Enhance idea_links table with better indexes and policies
-- Note: Table already exists, we're just optimizing it

-- Drop existing indexes if they exist and recreate optimized versions
DROP INDEX IF EXISTS idx_idea_links_source;
DROP INDEX IF EXISTS idx_idea_links_target;

-- Create optimized indexes for performance
CREATE INDEX IF NOT EXISTS idx_idea_links_source ON public.idea_links(source_id, source_type);
CREATE INDEX IF NOT EXISTS idx_idea_links_target ON public.idea_links(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_idea_links_created_by ON public.idea_links(created_by);
CREATE INDEX IF NOT EXISTS idx_idea_links_created_at ON public.idea_links(created_at DESC);

-- Add composite index for common lineage queries
CREATE INDEX IF NOT EXISTS idx_idea_links_lineage ON public.idea_links(source_type, target_type, created_at DESC);

-- Update RLS policies to ensure proper security
-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can insert their own links" ON public.idea_links;
DROP POLICY IF EXISTS "Users can view all links" ON public.idea_links;
DROP POLICY IF EXISTS "insert_links" ON public.idea_links;
DROP POLICY IF EXISTS "select_links" ON public.idea_links;

-- Create new comprehensive RLS policies
CREATE POLICY "Users can insert their own links"
  ON public.idea_links 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Anyone can view links"
  ON public.idea_links 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Optional: Allow users to delete their own links
CREATE POLICY "Users can delete their own links"
  ON public.idea_links 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = created_by);

-- Create a helper view for lineage visualization
CREATE OR REPLACE VIEW public.idea_lineage_view AS
SELECT 
  il.id,
  il.source_id,
  il.source_type,
  il.target_id,
  il.target_type,
  il.created_at,
  il.created_by,
  p.display_name as creator_name
FROM public.idea_links il
LEFT JOIN public.profiles p ON il.created_by = p.id
ORDER BY il.created_at DESC;

-- Grant access to the view
GRANT SELECT ON public.idea_lineage_view TO authenticated;

-- Add a function to count links for an entity
CREATE OR REPLACE FUNCTION public.count_links_for_entity(
  entity_id UUID,
  entity_type TEXT
)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.idea_links
  WHERE (source_id = entity_id AND source_type = entity_type)
     OR (target_id = entity_id AND target_type = entity_type);
$$;

-- Add a function to get the full lineage chain
CREATE OR REPLACE FUNCTION public.get_lineage_chain(
  start_id UUID,
  start_type TEXT
)
RETURNS TABLE(
  id UUID,
  source_id UUID,
  source_type TEXT,
  target_id UUID,
  target_type TEXT,
  depth INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH RECURSIVE lineage AS (
    -- Base case: direct links from start entity
    SELECT 
      il.id,
      il.source_id,
      il.source_type,
      il.target_id,
      il.target_type,
      1 as depth
    FROM public.idea_links il
    WHERE il.source_id = start_id 
      AND il.source_type = start_type
    
    UNION ALL
    
    -- Recursive case: follow the chain
    SELECT 
      il.id,
      il.source_id,
      il.source_type,
      il.target_id,
      il.target_type,
      l.depth + 1
    FROM public.idea_links il
    INNER JOIN lineage l ON il.source_id = l.target_id
    WHERE l.depth < 10  -- Prevent infinite recursion
  )
  SELECT * FROM lineage
  ORDER BY depth, source_type;
$$;