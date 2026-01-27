-- Brainstorm Delta Patch Migration
-- Goal: Align posts/post_relations schema with frontend expectations and normalize triggers

-- ============================================================================
-- 1. COMPATIBILITY & INDEXING
-- ============================================================================

-- Create index on posts for efficient brainstorm queries (idempotent)
CREATE INDEX IF NOT EXISTS idx_posts_kind_status_created 
  ON public.posts (kind, status, created_at DESC);

-- ============================================================================
-- 2. NORMALIZE TRIGGERS - Ensure exactly one set_updated_at trigger per table
-- ============================================================================

-- Drop any existing set_updated_at triggers and recreate canonical ones
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN 
    SELECT unnest(ARRAY['posts', 'profiles', 'business_profiles', 'email_subscriptions', 'contact_requests'])
  LOOP
    -- Drop all variants of update timestamp triggers
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', t);
    EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I', t, t);
    EXECUTE format('DROP TRIGGER IF EXISTS update_updated_at ON public.%I', t);
    
    -- Create canonical trigger
    EXECUTE format(
      'CREATE TRIGGER set_updated_at 
       BEFORE UPDATE ON public.%I 
       FOR EACH ROW 
       EXECUTE FUNCTION public.update_updated_at_column()',
      t
    );
  END LOOP;
END $$;

-- ============================================================================
-- 3. BRAINSTORM RPCs - Fix to match frontend schema expectations
-- ============================================================================

-- api_list_brainstorm_nodes: Return brainstorm posts with profile info
CREATE OR REPLACE FUNCTION public.api_list_brainstorm_nodes(
  p_cursor timestamptz DEFAULT NULL,
  p_limit int DEFAULT 500
)
RETURNS TABLE(
  id uuid,
  title text,
  content text,
  metadata jsonb,
  created_at timestamptz,
  user_id uuid,
  display_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT 
    p.id,
    p.title,
    p.content,
    p.metadata,
    p.created_at,
    p.user_id,
    pr.display_name
  FROM public.posts p
  LEFT JOIN public.profiles pr ON pr.id = p.user_id
  WHERE p.type = 'brainstorm' 
    AND p.mode = 'public'
    AND p.status = 'active'
    AND (p_cursor IS NULL OR p.created_at < p_cursor)
  ORDER BY p.created_at DESC
  LIMIT GREATEST(1, LEAST(p_limit, 1000));
$$;

-- api_list_brainstorm_edges_for_nodes: Get relations for given node IDs
CREATE OR REPLACE FUNCTION public.api_list_brainstorm_edges_for_nodes(
  p_node_ids uuid[]
)
RETURNS TABLE(
  id uuid,
  parent_post_id uuid,
  child_post_id uuid,
  relation_type text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT 
    id,
    parent_post_id,
    child_post_id,
    relation_type,
    created_at
  FROM public.post_relations
  WHERE parent_post_id = ANY(p_node_ids) 
     OR child_post_id = ANY(p_node_ids);
$$;

-- api_space_chain_hard: Walk hard relation chains recursively
CREATE OR REPLACE FUNCTION public.api_space_chain_hard(
  p_start uuid,
  p_direction text DEFAULT 'forward',
  p_limit int DEFAULT 25,
  p_max_depth int DEFAULT 500
)
RETURNS TABLE(
  id uuid,
  title text,
  content text,
  user_id uuid,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  WITH RECURSIVE walk AS (
    -- Seed: start node
    SELECT 
      p.id,
      p.title,
      p.content,
      p.user_id,
      p.created_at,
      0 AS depth
    FROM public.posts p
    WHERE p.id = p_start 
      AND p.type = 'brainstorm'
    
    UNION ALL
    
    -- Recursive step: follow hard links
    SELECT 
      p2.id,
      p2.title,
      p2.content,
      p2.user_id,
      p2.created_at,
      w.depth + 1
    FROM walk w
    JOIN public.post_relations r ON (
      r.relation_type = 'hard'
      AND (
        (p_direction = 'forward' AND r.parent_post_id = w.id)
        OR (p_direction = 'backward' AND r.child_post_id = w.id)
      )
    )
    JOIN public.posts p2 ON (
      p2.id = CASE
        WHEN p_direction = 'forward' THEN r.child_post_id
        WHEN p_direction = 'backward' THEN r.parent_post_id
      END
    )
    WHERE p2.type = 'brainstorm'
      AND w.depth < p_max_depth
  )
  SELECT id, title, content, user_id, created_at
  FROM walk
  ORDER BY created_at DESC
  LIMIT GREATEST(1, LEAST(p_limit, 200));
$$;

-- ============================================================================
-- 4. LEGACY LOCKDOWN - Lock brainstorms table to admin only
-- ============================================================================

-- Enable RLS on legacy brainstorms table
ALTER TABLE public.brainstorms ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS brainstorms_admin_only ON public.brainstorms;
DROP POLICY IF EXISTS brainstorms_deny_all ON public.brainstorms;
DROP POLICY IF EXISTS brainstorms_insert ON public.brainstorms;
DROP POLICY IF EXISTS brainstorms_select ON public.brainstorms;
DROP POLICY IF EXISTS brainstorms_update ON public.brainstorms;
DROP POLICY IF EXISTS insert_brainstorms ON public.brainstorms;
DROP POLICY IF EXISTS select_brainstorms ON public.brainstorms;
DROP POLICY IF EXISTS update_brainstorms ON public.brainstorms;

-- Admin-only policy
CREATE POLICY brainstorms_admin_only ON public.brainstorms
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Revoke public access
REVOKE ALL ON public.brainstorms FROM PUBLIC;
REVOKE ALL ON public.brainstorms FROM anon;
REVOKE ALL ON public.brainstorms FROM authenticated;

-- Grant only to admins (service_role has superuser, doesn't need explicit grant)
-- ============================================================================
-- 5. OPTIONAL: Rate Limiting Helpers
-- ============================================================================

-- Rate limit enforcement function
CREATE OR REPLACE FUNCTION public.enforce_rate_limit(
  limit_count int,
  window_seconds int
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count int;
  v_ip text;
BEGIN
  v_ip := get_client_ip();
  
  -- Count recent submissions from this IP
  SELECT COUNT(*) INTO v_count
  FROM (
    SELECT created_at FROM public.open_ideas_intake 
    WHERE ip_hash = hash_ip(v_ip)
      AND created_at > now() - make_interval(secs => window_seconds)
    UNION ALL
    SELECT created_at FROM public.email_subscriptions
    WHERE created_at > now() - make_interval(secs => window_seconds)
  ) recent;
  
  IF v_count >= limit_count THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please try again later.';
  END IF;
  
  RETURN true;
END;
$$;

COMMENT ON FUNCTION public.enforce_rate_limit IS 
  'Enforces rate limiting by IP hash across intake tables';

-- ============================================================================
-- VERIFICATION QUERIES (commented out, run manually to test)
-- ============================================================================

-- SELECT * FROM public.api_list_brainstorm_nodes(NULL, 50);
-- SELECT * FROM public.api_list_brainstorm_edges_for_nodes(ARRAY[]::uuid[]);
-- SELECT * FROM public.api_space_chain_hard(
--   (SELECT id FROM posts WHERE type='brainstorm' LIMIT 1),
--   'forward', 25, 200
-- );
-- \d public.posts
-- SELECT tablename, schemaname FROM pg_tables WHERE tablename = 'brainstorms';
-- SELECT * FROM pg_policies WHERE tablename = 'brainstorms';