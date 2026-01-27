-- ============================================
-- P3: DATA MIGRATION FROM LEGACY TABLES
-- ============================================
-- Migrate data from open_ideas_legacy to canonical intake/user tables
-- Then freeze legacy table with comprehensive deny-all RLS

-- Variables for logging
DO $$
DECLARE
  v_user_count INT := 0;
  v_intake_count INT := 0;
  v_legacy_count INT := 0;
  v_row RECORD;
BEGIN
  -- Get total count from legacy
  SELECT COUNT(*) INTO v_legacy_count FROM public.open_ideas_legacy;
  RAISE NOTICE 'Starting migration: % rows in open_ideas_legacy', v_legacy_count;

  -- Migrate rows with user_id to open_ideas_user
  FOR v_row IN 
    SELECT 
      id,
      content as text,
      user_id,
      status::text,
      created_at
    FROM public.open_ideas_legacy
    WHERE user_id IS NOT NULL
  LOOP
    BEGIN
      -- Map status text to enum (pending, approved, rejected)
      INSERT INTO public.open_ideas_user (id, user_id, text, status, created_at)
      VALUES (
        gen_random_uuid(), -- New ID to avoid conflicts
        v_row.user_id,
        v_row.text,
        CASE 
          WHEN v_row.status IN ('pending', 'approved', 'rejected') THEN v_row.status::open_idea_status
          ELSE 'pending'::open_idea_status
        END,
        v_row.created_at
      )
      ON CONFLICT (id) DO NOTHING;
      
      v_user_count := v_user_count + 1;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Failed to migrate row to user table: %, Error: %', v_row.id, SQLERRM;
    END;
  END LOOP;

  -- Migrate rows without user_id to open_ideas_intake (anonymous submissions)
  FOR v_row IN 
    SELECT 
      id,
      content as text,
      ip_hash,
      status::text,
      created_at
    FROM public.open_ideas_legacy
    WHERE user_id IS NULL
  LOOP
    BEGIN
      INSERT INTO public.open_ideas_intake (id, text, ip_hash, status, created_at)
      VALUES (
        gen_random_uuid(), -- New ID to avoid conflicts
        v_row.text,
        v_row.ip_hash,
        CASE 
          WHEN v_row.status IN ('pending', 'approved', 'rejected') THEN v_row.status::open_idea_status
          ELSE 'pending'::open_idea_status
        END,
        v_row.created_at
      )
      ON CONFLICT (id) DO NOTHING;
      
      v_intake_count := v_intake_count + 1;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Failed to migrate row to intake table: %, Error: %', v_row.id, SQLERRM;
    END;
  END LOOP;

  -- Log final counts
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRATION COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total rows in legacy table: %', v_legacy_count;
  RAISE NOTICE 'Rows migrated to open_ideas_user: %', v_user_count;
  RAISE NOTICE 'Rows migrated to open_ideas_intake: %', v_intake_count;
  RAISE NOTICE 'Total migrated: %', v_user_count + v_intake_count;
  
  IF (v_user_count + v_intake_count) < v_legacy_count THEN
    RAISE WARNING 'Data loss detected! Some rows were not migrated.';
  ELSE
    RAISE NOTICE 'All rows successfully migrated!';
  END IF;
END $$;

-- ============================================
-- FREEZE LEGACY TABLE - DENY ALL ACCESS
-- ============================================

-- Drop existing policies (including admin-only from P1)
DROP POLICY IF EXISTS "legacy_admin_select" ON public.open_ideas_legacy;
DROP POLICY IF EXISTS "legacy_admin_update" ON public.open_ideas_legacy;
DROP POLICY IF EXISTS "legacy_admin_delete" ON public.open_ideas_legacy;

-- Create comprehensive deny-all policies
CREATE POLICY "legacy_final_deny_select" ON public.open_ideas_legacy
  FOR SELECT 
  USING (false);

CREATE POLICY "legacy_final_deny_insert" ON public.open_ideas_legacy
  FOR INSERT 
  WITH CHECK (false);

CREATE POLICY "legacy_final_deny_update" ON public.open_ideas_legacy
  FOR UPDATE 
  USING (false)
  WITH CHECK (false);

CREATE POLICY "legacy_final_deny_delete" ON public.open_ideas_legacy
  FOR DELETE 
  USING (false);

-- Add comment to table for future reference
COMMENT ON TABLE public.open_ideas_legacy IS 'DEPRECATED: Migrated to open_ideas_intake and open_ideas_user. Data migrated on 2025-01-XX. RLS denies all access. Consider dropping after verification period.';