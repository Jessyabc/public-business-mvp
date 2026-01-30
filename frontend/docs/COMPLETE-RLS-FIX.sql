-- =====================================================
-- COMPLETE RLS FIX - Run This First
-- =====================================================
-- This script fixes ALL RLS permission errors:
-- 1. user_roles table permissions
-- 2. orgs table permissions  
-- 3. Policies that directly query user_roles
-- 4. Helper functions (is_admin, is_org_member, etc.)
-- =====================================================

-- Run this script FIRST, then run QUICK-FIX-SQL.sql to create the organization

-- PART 1: Fix user_roles RLS and functions
\i docs/FIX-USER-ROLES-RLS.sql

-- PART 2: Fix orgs RLS policies (from original fix)
\i docs/SUPABASE-INSIGHTS-AND-ORG-FIX.sql

-- Note: If \i doesn't work in Supabase SQL Editor, copy and paste
-- the contents of both files in order instead.

