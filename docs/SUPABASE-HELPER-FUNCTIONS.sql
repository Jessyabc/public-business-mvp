-- =====================================================
-- Helper Functions for Account Types & Membership Flow Migration
-- =====================================================
-- These functions are required before running the main migration.
-- Run this script FIRST, then run SUPABASE-MIGRATION-CLEANED.sql
-- =====================================================

-- =====================================================
-- Function: set_updated_at()
-- =====================================================
-- Trigger function to automatically update updated_at timestamp
-- This should already exist, but creating it if missing for safety
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END $$;

-- =====================================================
-- Function: is_admin()
-- =====================================================
-- Check if the current authenticated user has admin role
-- This should already exist, but creating it if missing for safety
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- =====================================================
-- Verification
-- =====================================================
-- Run these queries to verify the functions were created:
-- SELECT proname, prosrc FROM pg_proc WHERE proname IN ('set_updated_at', 'is_admin');

