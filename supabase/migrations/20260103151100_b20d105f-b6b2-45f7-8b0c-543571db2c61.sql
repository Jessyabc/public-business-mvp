-- =====================================================
-- LEGACY TABLE CLEANUP - MVP LAUNCH PREP
-- =====================================================

-- 1. Drop empty legacy tables (confirmed 0 rows each)
DROP TABLE IF EXISTS public.brainstorms CASCADE;
DROP TABLE IF EXISTS public.business_insights CASCADE;
DROP TABLE IF EXISTS public.idea_brainstorms_archive CASCADE;

-- 2. Drop backup table from relation_type migration (12 rows, migration verified successful)
DROP TABLE IF EXISTS public.post_relations_backup_for_relation_type_fix CASCADE;