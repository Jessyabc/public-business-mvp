-- Phase 1: Fix RPC function conflict
-- Drop the conflicting timestamp cursor version, keeping only the text cursor version
-- This fixes the PostgREST overload resolution failure causing public feed to fail

DROP FUNCTION IF EXISTS public.get_lineage_clusters(
  p_mode text, 
  p_limit integer, 
  p_cursor timestamp with time zone, 
  p_kinds text[], 
  p_search text, 
  p_org_id uuid
);