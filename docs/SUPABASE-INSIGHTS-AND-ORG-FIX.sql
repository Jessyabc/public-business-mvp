-- =====================================================
-- Fix Insights/Org Association and Complete RLS Setup
-- =====================================================
-- This addresses:
-- 1. Auto-fill org_id for insights when user has single org
-- 2. Ensure orgs table has proper RLS policies (for joins)
-- 3. Complete the org_requests policies
-- =====================================================

-- PART 1: Ensure orgs table has RLS policies (needed for org_members join)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'orgs'
  ) THEN
    -- Enable RLS
    ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;
    
    -- Policy 1: Members can read their orgs (using SECURITY DEFINER function)
    IF NOT EXISTS (
      SELECT 1 FROM pg_policy p
      JOIN pg_class c ON p.polrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE p.polname = 'orgs_members_read' AND c.relname = 'orgs' AND n.nspname = 'public'
    ) THEN
      CREATE POLICY orgs_members_read
      ON public.orgs
      FOR SELECT
      TO authenticated
      USING (
        -- Use SECURITY DEFINER function to check membership (no recursion)
        public.is_org_member(orgs.id)
        OR orgs.created_by = auth.uid()
        OR is_admin()
      );
    END IF;
    
    -- Policy 2: Public can read approved orgs (for Research Hub search)
    IF NOT EXISTS (
      SELECT 1 FROM pg_policy p
      JOIN pg_class c ON p.polrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE p.polname = 'orgs_public_read' AND c.relname = 'orgs' AND n.nspname = 'public'
    ) THEN
      CREATE POLICY orgs_public_read
      ON public.orgs
      FOR SELECT
      TO authenticated, anon
      USING (status = 'approved');
    END IF;
    
    -- Grant SELECT to authenticated
    GRANT SELECT ON public.orgs TO authenticated;
    
    RAISE NOTICE 'orgs table RLS policies configured';
  END IF;
END$$;

-- PART 2: Trigger to auto-fill org_id for insights when user has single org
-- This implements: "If I am only associated with one business, the system should assume that it is always in association with this business"
CREATE OR REPLACE FUNCTION public.set_insight_org_if_single_membership()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_count integer;
  v_single_org_id uuid;
BEGIN
  -- Only apply to business insights
  IF NEW.type != 'insight' OR NEW.mode != 'business' THEN
    RETURN NEW;
  END IF;
  
  -- If org_id is already set, don't override
  IF NEW.org_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Count user's org memberships
  SELECT COUNT(*), MAX(org_id)
  INTO v_org_count, v_single_org_id
  FROM public.org_members
  WHERE user_id = auth.uid();

  -- If exactly one membership, set org_id
  IF v_org_count = 1 AND v_single_org_id IS NOT NULL THEN
    NEW.org_id := v_single_org_id;
    RAISE NOTICE 'Auto-set org_id to % for user with single membership', v_single_org_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trg_set_insight_org_on_insert ON public.posts;

CREATE TRIGGER trg_set_insight_org_on_insert
BEFORE INSERT ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.set_insight_org_if_single_membership();

-- PART 3: Ensure is_org_member function exists and is SECURITY DEFINER
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.proname = 'is_org_member' AND n.nspname = 'public'
  ) THEN
    CREATE OR REPLACE FUNCTION public.is_org_member(p_org_id uuid)
    RETURNS boolean
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = public
    AS $$
      SELECT EXISTS (
        SELECT 1 FROM public.org_members
        WHERE org_id = p_org_id
          AND user_id = auth.uid()
      );
    $$;
    
    GRANT EXECUTE ON FUNCTION public.is_org_member(uuid) TO authenticated;
    RAISE NOTICE 'Created is_org_member function';
  ELSE
    -- Ensure it's SECURITY DEFINER
    CREATE OR REPLACE FUNCTION public.is_org_member(p_org_id uuid)
    RETURNS boolean
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = public
    AS $$
      SELECT EXISTS (
        SELECT 1 FROM public.org_members
        WHERE org_id = p_org_id
          AND user_id = auth.uid()
      );
    $$;
    
    GRANT EXECUTE ON FUNCTION public.is_org_member(uuid) TO authenticated;
    RAISE NOTICE 'Ensured is_org_member is SECURITY DEFINER';
  END IF;
END$$;

-- PART 4: Update posts INSERT policy to allow org_id to be NULL initially
-- (The trigger will fill it if user has single org)
DO $$
BEGIN
  -- Drop existing policy if it requires org_id
  IF EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE p.polname = 'insert_org_business_insights' AND c.relname = 'posts' AND n.nspname = 'public'
  ) THEN
    DROP POLICY insert_org_business_insights ON public.posts;
  END IF;
  
  -- Create policy that allows NULL org_id (trigger will fill it)
  CREATE POLICY insert_org_business_insights
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    type = 'insight'
    AND mode = 'business'
    AND user_id = auth.uid()
    AND (
      -- If org_id is provided, user must be member of that org
      (org_id IS NOT NULL AND is_org_member(org_id))
      -- If org_id is NULL, trigger will fill it if user has single org
      OR org_id IS NULL
    )
  );
  
  RAISE NOTICE 'Updated insert_org_business_insights policy to allow NULL org_id';
END$$;

-- PART 5: Org-scoped insight scores function (from Supabase AI proposal, adapted for posts table)
CREATE OR REPLACE FUNCTION public.get_org_insight_scores(p_org_id uuid)
RETURNS TABLE (
  insight_id uuid,
  u_score_avg numeric,
  u_score_count bigint,
  positive_ratings bigint,
  negative_ratings bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Ensure caller is a member of the org or a site admin
  SELECT r.*
  FROM (
    SELECT p.id AS insight_id,
           round(avg(rating)::numeric, 2) AS u_score_avg,
           count(*)::bigint AS u_score_count,
           count(*) FILTER (WHERE rating >= 4) AS positive_ratings,
           count(*) FILTER (WHERE rating <= 2) AS negative_ratings
    FROM public.post_utility_ratings r
    JOIN public.posts p ON p.id = r.post_id
    WHERE p.org_id = p_org_id
      AND p.type = 'insight'
      AND p.mode = 'business'
      AND p.status = 'active'
    GROUP BY p.id
  ) r
  WHERE
    -- allow if caller is site admin
    (public.is_admin())
    OR
    -- allow if caller is member of the org
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = p_org_id
        AND om.user_id = auth.uid()
    );
$$;

GRANT EXECUTE ON FUNCTION public.get_org_insight_scores(uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_org_insight_scores(uuid) FROM public;

-- PART 6: Policy for org_requests - only org owners can accept/decline
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'org_requests'
  ) THEN
    -- Policy for org owners to manage requests for their org
    IF NOT EXISTS (
      SELECT 1 FROM pg_policy p
      JOIN pg_class c ON p.polrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE p.polname = 'org_owner_manage_requests' AND c.relname = 'org_requests' AND n.nspname = 'public'
    ) THEN
      CREATE POLICY org_owner_manage_requests
      ON public.org_requests
      FOR UPDATE
      TO authenticated
      USING (
        -- Only allow update if the caller is owner for the request's org
        EXISTS (
          SELECT 1 FROM public.org_members om
          WHERE om.org_id = org_requests.org_id
            AND om.user_id = auth.uid()
            AND om.role = 'owner'
        )
        OR is_admin()
      )
      WITH CHECK (
        -- Restrict status values
        status IN ('pending', 'approved', 'rejected')
      );
      
      RAISE NOTICE 'Created org_owner_manage_requests policy';
    END IF;
  END IF;
END$$;

-- PART 7: Verification summary
DO $$
DECLARE
  v_orgs_policies integer;
  v_posts_trigger_exists boolean;
BEGIN
  SELECT COUNT(*) INTO v_orgs_policies
  FROM pg_policy p
  JOIN pg_class c ON p.polrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE c.relname = 'orgs' AND n.nspname = 'public';
  
  SELECT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_set_insight_org_on_insert'
  ) INTO v_posts_trigger_exists;
  
  RAISE NOTICE '=== VERIFICATION SUMMARY ===';
  RAISE NOTICE 'orgs table has % RLS policies', v_orgs_policies;
  RAISE NOTICE 'Auto-fill org_id trigger: %', CASE WHEN v_posts_trigger_exists THEN 'EXISTS ✓' ELSE 'MISSING ✗' END;
  RAISE NOTICE '=== END SUMMARY ===';
END$$;

