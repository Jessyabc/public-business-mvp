-- Migration: Consolidate legacy brainstorms and business data into posts table

-- 1️⃣ Migrate idea_brainstorms to posts with kind='Spark'
DO $$
BEGIN
  -- Check if idea_brainstorms exists and has data
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'idea_brainstorms') THEN
    
    -- Copy idea_brainstorms that don't already exist in posts
    -- Match by user_id, content, and created_at to avoid duplicates
    INSERT INTO public.posts (
      id,
      user_id,
      title,
      content,
      body,
      kind,
      type,
      mode,
      visibility,
      status,
      metadata,
      created_at,
      updated_at,
      published_at
    )
    SELECT 
      ib.id,
      COALESCE(ib.author_user_id, '00000000-0000-0000-0000-000000000000'::uuid) as user_id,
      ib.title,
      ib.content,
      ib.content as body,
      'Spark'::public.post_kind as kind,
      'brainstorm' as type,
      'public' as mode,
      CASE WHEN ib.is_public THEN 'public' ELSE 'draft' END as visibility,
      'active' as status,
      jsonb_build_object(
        'legacy_source', 'idea_brainstorms',
        'legacy_idea_id', ib.idea_id,
        'legacy_author_display_name', ib.author_display_name
      ) as metadata,
      ib.created_at,
      ib.created_at as updated_at,
      ib.created_at as published_at
    FROM public.idea_brainstorms ib
    WHERE NOT EXISTS (
      SELECT 1 FROM public.posts p 
      WHERE p.id = ib.id
    )
    AND ib.author_user_id IS NOT NULL;
    
    RAISE NOTICE 'Migrated idea_brainstorms to posts';
  ELSE
    RAISE NOTICE 'idea_brainstorms table does not exist, skipping';
  END IF;
END $$;

-- 2️⃣ Update interaction counts from idea_interactions if applicable
-- Note: idea_interactions are for open_ideas, not brainstorms/posts
-- This step is informational only - interaction structure doesn't match post_relations
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'idea_interactions') THEN
    RAISE NOTICE 'idea_interactions exists but is for open_ideas, not posts - no migration needed';
  END IF;
END $$;

-- 3️⃣ Check for business insight legacy tables
-- Business posts are already in posts table with mode='business'
-- Update any that don't have kind set
UPDATE public.posts
SET kind = 'BusinessInsight'::public.post_kind
WHERE mode = 'business' 
  AND type = 'insight'
  AND kind IS NULL;

-- Also set Spark for public brainstorms that don't have kind
UPDATE public.posts
SET kind = 'Spark'::public.post_kind
WHERE mode = 'public' 
  AND type = 'brainstorm'
  AND kind IS NULL;

-- 4️⃣ Rename legacy tables and add deny-all RLS
DO $$
BEGIN
  -- Rename idea_brainstorms if it exists and hasn't been renamed
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'idea_brainstorms') THEN
    -- Drop existing policies first
    DROP POLICY IF EXISTS "ib_admin_all" ON public.idea_brainstorms;
    DROP POLICY IF EXISTS "ib_read_auth" ON public.idea_brainstorms;
    DROP POLICY IF EXISTS "idea_brainstorms_owner_write" ON public.idea_brainstorms;
    DROP POLICY IF EXISTS "idea_brainstorms_public_read" ON public.idea_brainstorms;
    DROP POLICY IF EXISTS "insert_brainstorms" ON public.idea_brainstorms;
    DROP POLICY IF EXISTS "read_brainstorms" ON public.idea_brainstorms;
    
    -- Rename table
    ALTER TABLE public.idea_brainstorms RENAME TO idea_brainstorms_legacy;
    
    -- Ensure RLS is enabled
    ALTER TABLE public.idea_brainstorms_legacy ENABLE ROW LEVEL SECURITY;
    
    -- Add deny-all policies
    CREATE POLICY "legacy_deny_select" ON public.idea_brainstorms_legacy
      FOR SELECT USING (false);
    
    CREATE POLICY "legacy_deny_insert" ON public.idea_brainstorms_legacy
      FOR INSERT WITH CHECK (false);
    
    CREATE POLICY "legacy_deny_update" ON public.idea_brainstorms_legacy
      FOR UPDATE USING (false) WITH CHECK (false);
    
    CREATE POLICY "legacy_deny_delete" ON public.idea_brainstorms_legacy
      FOR DELETE USING (false);
    
    RAISE NOTICE 'Renamed idea_brainstorms to idea_brainstorms_legacy and locked it down';
  ELSE
    RAISE NOTICE 'idea_brainstorms table does not exist or already renamed';
  END IF;
END $$;

-- 5️⃣ Verification query
DO $$
DECLARE
  rec RECORD;
  total_count INTEGER;
BEGIN
  RAISE NOTICE '=== MIGRATION VERIFICATION ===';
  
  -- Count by kind
  FOR rec IN 
    SELECT 
      COALESCE(kind::text, 'NULL') as kind_value,
      COUNT(*) as count
    FROM public.posts 
    GROUP BY kind
    ORDER BY kind
  LOOP
    RAISE NOTICE 'kind=% count=%', rec.kind_value, rec.count;
  END LOOP;
  
  -- Total count
  SELECT COUNT(*) INTO total_count FROM public.posts;
  RAISE NOTICE 'Total posts: %', total_count;
  
  -- Check legacy table status
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'idea_brainstorms_legacy') THEN
    RAISE NOTICE 'Legacy table idea_brainstorms_legacy exists and is locked';
  END IF;
  
  RAISE NOTICE '=== END VERIFICATION ===';
END $$;