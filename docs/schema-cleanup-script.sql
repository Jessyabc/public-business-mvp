-- ============================================================================
-- SCHEMA CLEANUP SCRIPT
-- Post-P3 Canonical Structure Verification
-- ============================================================================
-- 
-- This script contains OPTIONAL cleanup suggestions based on audit findings.
-- Review each section carefully before executing.
--
-- ⚠️ IMPORTANT: These are suggestions only. Do not run without review.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- SECTION 1: View Documentation Check
-- ----------------------------------------------------------------------------
-- Purpose: Verify the structure of ambiguous views before making changes
-- 
-- Run these queries to understand what each view returns:

-- Check open_ideas_public structure
SELECT * FROM open_ideas_public LIMIT 1;

-- Check open_ideas_public_view structure  
SELECT * FROM open_ideas_public_view LIMIT 1;

-- Check open_ideas_members structure
SELECT * FROM open_ideas_members LIMIT 1;

-- Check open_ideas_teaser structure
SELECT * FROM open_ideas_teaser LIMIT 1;

-- Compare: Are open_ideas_public and open_ideas_public_view identical?
-- If they return the same columns, we have a duplicate.

-- ----------------------------------------------------------------------------
-- SECTION 2: Drop Duplicate View (if confirmed identical)
-- ----------------------------------------------------------------------------
-- ⚠️ ONLY run if open_ideas_public is confirmed identical to open_ideas_public_view
--
-- DROP VIEW IF EXISTS public.open_ideas_public CASCADE;
--
-- Note: This will break useOpenIdeas.ts queries (fix required in frontend first)

-- ----------------------------------------------------------------------------
-- SECTION 3: Drop Unused Views (if confirmed unused)
-- ----------------------------------------------------------------------------
-- ⚠️ ONLY run after confirming these views are not used anywhere
--
-- -- Search codebase first with: grep -r "open_ideas_members" src/
-- DROP VIEW IF EXISTS public.open_ideas_members CASCADE;
--
-- -- Search codebase first with: grep -r "open_ideas_teaser" src/
-- DROP VIEW IF EXISTS public.open_ideas_teaser CASCADE;

-- ----------------------------------------------------------------------------
-- SECTION 4: Optional Renaming for Clarity
-- ----------------------------------------------------------------------------
-- ⚠️ OPTIONAL: Rename idea_brainstorms to better reflect its purpose
-- 
-- This table stores brainstorm RESPONSES to open ideas, not standalone brainstorms.
-- Consider renaming to avoid confusion with the main 'posts' table (type='brainstorm').
--
-- ALTER TABLE public.idea_brainstorms RENAME TO open_idea_responses;
-- ALTER TABLE public.idea_interactions RENAME TO open_idea_response_interactions;
--
-- Note: This would require updating all frontend queries in:
-- - src/hooks/useBrainstorms.ts
-- - src/hooks/useOpenIdeas.ts
--
-- Update view:
-- CREATE OR REPLACE VIEW brainstorm_stats AS
-- SELECT 
--   r.id as brainstorm_id,
--   COUNT(DISTINCT i.id) FILTER (WHERE i.type = 'like') as likes_count,
--   COUNT(DISTINCT i.id) FILTER (WHERE i.type = 'comment') as comments_count
-- FROM public.open_idea_responses r
-- LEFT JOIN public.open_idea_response_interactions i ON i.idea_id = r.id
-- GROUP BY r.id;

-- ----------------------------------------------------------------------------
-- SECTION 5: Verify Legacy Freeze
-- ----------------------------------------------------------------------------
-- Purpose: Confirm open_ideas_legacy is properly quarantined

-- Should return 4 deny-all policies:
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'open_ideas_legacy'
ORDER BY policyname;

-- Expected output:
-- legacy_final_deny_select   | SELECT | false | -
-- legacy_final_deny_insert   | INSERT | -     | false
-- legacy_final_deny_update   | UPDATE | false | false
-- legacy_final_deny_delete   | DELETE | false | -

-- Verify table is inaccessible:
-- This should FAIL with permission denied:
-- SELECT * FROM public.open_ideas_legacy LIMIT 1;

-- ----------------------------------------------------------------------------
-- SECTION 6: Add Table Comments for Documentation
-- ----------------------------------------------------------------------------
-- Purpose: Document the purpose of each table directly in the schema

COMMENT ON TABLE public.posts IS 
'Main posts table. Stores all content types including standalone brainstorms (type=brainstorm), insights (type=insight), reports, etc. See my_posts_view for user-specific access.';

COMMENT ON TABLE public.idea_brainstorms IS 
'Brainstorm RESPONSES to open ideas. This is separate from posts table. Links to open_ideas_user/open_ideas_intake via idea_id.';

COMMENT ON TABLE public.open_ideas_user IS 
'Authenticated user submissions of open ideas. Paired with open_ideas_intake for anonymous submissions. See open_ideas_public_view for union of both.';

COMMENT ON TABLE public.open_ideas_intake IS 
'Anonymous submissions of open ideas (spam filtered by edge function). Paired with open_ideas_user for authenticated submissions. See open_ideas_public_view for union of both.';

COMMENT ON TABLE public.open_ideas_legacy IS 
'⚠️ DEPRECATED - Quarantined P3 (2025-01-30). All data migrated to open_ideas_intake/open_ideas_user. Protected by deny-all RLS. Safe to drop after 30-day verification period.';

COMMENT ON TABLE public.user_roles IS 
'User role assignments. Never query directly from frontend - use get_user_role() RPC instead. See docs/data-contracts.ts for approved access patterns.';

-- ----------------------------------------------------------------------------
-- SECTION 7: Self-Test Queries
-- ----------------------------------------------------------------------------
-- Run these to verify canonical structure is working:

-- Test 1: Role check (should return role, never null)
SELECT public.get_user_role() as current_role;

-- Test 2: Views are accessible
SELECT COUNT(*) as my_posts_count FROM public.my_posts_view;
SELECT COUNT(*) as my_ideas_count FROM public.my_open_ideas_view;
SELECT COUNT(*) as public_ideas_count FROM public.open_ideas_public_view;

-- Test 3: Legacy is locked
SELECT COUNT(*) as legacy_tables 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%legacy%';
-- Should return: 1 (open_ideas_legacy)

-- Test 4: No orphaned foreign keys
SELECT
  tc.table_name AS source_table,
  kcu.column_name AS source_column,
  ccu.table_name AS target_table,
  ccu.column_name AS target_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
  AND (ccu.table_name LIKE '%legacy%' OR ccu.table_name LIKE '%old%' OR ccu.table_name LIKE '%temp%');
-- Should return: 0 rows

-- ============================================================================
-- END OF CLEANUP SCRIPT
-- ============================================================================
