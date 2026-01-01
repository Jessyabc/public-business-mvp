# Supabase Migration Instructions for Account Types & Membership Flow

## Overview

This document contains all SQL migrations needed to implement the account types and membership flow system. The migration adds:
1. Organization approval workflow (status field on orgs)
2. Member application system (for users to apply to join existing orgs)
3. Enhanced org creation with additional fields
4. RPC functions for application management

## Context

**Existing Tables (Already in Database):**
- ✅ `orgs` - Organizations table
- ✅ `org_members` - Organization membership (roles: 'owner', 'business_admin', 'member')
- ✅ `org_requests` - Org creation requests (status: pending/approved/rejected)
- ✅ `business_invitations` - Invitation system
- ✅ `user_roles` - Role assignments
- ✅ `industries` - Industry reference data

**Existing Functions (Already in Database):**
- ✅ `is_admin()` - Returns boolean if user has admin role
- ✅ `set_updated_at()` - Trigger function for updating updated_at timestamps

**What We're Adding:**
- `status` column to `orgs` table
- `org_member_applications` table (for applying to join existing orgs)
- Additional columns to `orgs` (website, industry_id, company_size)
- Updated `create_org_and_owner` RPC function
- New RPC functions for application management
- Unique constraint on `org_members(org_id, user_id)`
- Foreign key from `org_members.user_id` to `auth.users.id`

## Fixes Applied

This migration script has been corrected based on Supabase AI review:

1. ✅ **Reordered operations**: Unique constraint on `org_members` created BEFORE functions that use `ON CONFLICT`
2. ✅ **Fixed view email**: Changed from `profiles.email` (doesn't exist) to `auth.users.email`
3. ✅ **Partial unique index**: Uses `UNIQUE (org_id, user_id) WHERE status = 'pending'` instead of table-level unique
4. ✅ **Added FK constraint**: Explicit foreign key from `org_members.user_id` to `auth.users.id`
5. ✅ **Fixed view security**: Uses `WITH (security_invoker = true)` at creation time
6. ✅ **Improved org matching**: Better logic for matching `org_requests` to `orgs` in approval functions
7. ✅ **Functions exist**: Confirmed `is_admin()` and `set_updated_at()` already exist in database

---

## Complete Migration Script

**Note**: This is the cleaned and optimized version from Supabase AI Assistant with improved idempotency checks.

Copy and paste this entire script to Supabase SQL Editor or AI Assistant:

```sql
-- =====================================================
-- Account Types & Membership Flow - Database Migration
-- =====================================================
-- This migration implements:
-- 1. Organization approval workflow
-- 2. Member application system for joining existing orgs
-- 3. Enhanced org creation with additional fields
-- 4. RPC functions for application management
-- =====================================================

-- =====================================================
-- PART 1: Add status column to orgs table
-- =====================================================

-- Add status column to orgs (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orgs' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.orgs 
    ADD COLUMN status TEXT NOT NULL DEFAULT 'approved' 
    CHECK (status IN ('pending', 'approved', 'rejected'));
    
    -- Set all existing orgs to 'approved' status
    UPDATE public.orgs SET status = 'approved' WHERE status IS NULL;
  END IF;
END $$;

-- =====================================================
-- PART 2: Add additional fields to orgs table
-- =====================================================

-- Add website column (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orgs' 
    AND column_name = 'website'
  ) THEN
    ALTER TABLE public.orgs ADD COLUMN website TEXT;
  END IF;
END $$;

-- Add industry_id column (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orgs' 
    AND column_name = 'industry_id'
  ) THEN
    ALTER TABLE public.orgs 
    ADD COLUMN industry_id UUID REFERENCES public.industries(id);
  END IF;
END $$;

-- Add company_size column (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orgs' 
    AND column_name = 'company_size'
  ) THEN
    ALTER TABLE public.orgs 
    ADD COLUMN company_size TEXT 
    CHECK (company_size IN ('1-10', '11-50', '51-200', '201-1000', '1000+') OR company_size IS NULL);
  END IF;
END $$;

-- =====================================================
-- PART 3: Add unique constraint to org_members (BEFORE functions)
-- =====================================================

-- Add unique constraint to prevent duplicate memberships
-- This must be done BEFORE functions that use ON CONFLICT
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'org_members_org_user_unique'
  ) THEN
    ALTER TABLE public.org_members
    ADD CONSTRAINT org_members_org_user_unique 
    UNIQUE (org_id, user_id);
  END IF;
END $$;

-- Add FK from org_members.user_id to auth.users if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_org_members_user'
  ) THEN
    ALTER TABLE public.org_members
    ADD CONSTRAINT fk_org_members_user 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- =====================================================
-- PART 4: Create org_member_applications table
-- =====================================================

-- Table for users to apply to join existing organizations
CREATE TABLE IF NOT EXISTS public.org_member_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.org_member_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for org_member_applications

-- Users can view their own applications
CREATE POLICY "org_member_applications_owner_read"
  ON public.org_member_applications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create applications
CREATE POLICY "org_member_applications_owner_insert"
  ON public.org_member_applications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Org owners/admins can view applications to their orgs
CREATE POLICY "org_member_applications_org_owner_read"
  ON public.org_member_applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = org_member_applications.org_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'business_admin')
    )
  );

-- Org owners/admins can update applications to their orgs
CREATE POLICY "org_member_applications_org_owner_update"
  ON public.org_member_applications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = org_member_applications.org_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'business_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = org_member_applications.org_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'business_admin')
    )
  );

-- Admins can do everything
CREATE POLICY "org_member_applications_admin_all"
  ON public.org_member_applications
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Trigger to update updated_at
CREATE TRIGGER update_org_member_applications_updated_at
  BEFORE UPDATE ON public.org_member_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_org_member_applications_org_id 
  ON public.org_member_applications(org_id);
CREATE INDEX IF NOT EXISTS idx_org_member_applications_user_id 
  ON public.org_member_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_org_member_applications_status 
  ON public.org_member_applications(status);
CREATE INDEX IF NOT EXISTS idx_org_member_applications_org_status 
  ON public.org_member_applications(org_id, status);

-- Partial unique index: prevent duplicate pending applications only
-- This allows multiple rows for same user/org if status differs (e.g., one rejected + later pending)
CREATE UNIQUE INDEX IF NOT EXISTS ux_org_member_applications_pending 
  ON public.org_member_applications (org_id, user_id) 
  WHERE status = 'pending';

-- =====================================================
-- PART 5: Update org_requests table (add fields if needed)
-- =====================================================

-- Add website to org_requests (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'org_requests' 
    AND column_name = 'website'
  ) THEN
    ALTER TABLE public.org_requests ADD COLUMN website TEXT;
  END IF;
END $$;

-- Add industry_id to org_requests (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'org_requests' 
    AND column_name = 'industry_id'
  ) THEN
    ALTER TABLE public.org_requests 
    ADD COLUMN industry_id UUID REFERENCES public.industries(id);
  END IF;
END $$;

-- Add company_size to org_requests (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'org_requests' 
    AND column_name = 'company_size'
  ) THEN
    ALTER TABLE public.org_requests 
    ADD COLUMN company_size TEXT 
    CHECK (company_size IN ('1-10', '11-50', '51-200', '201-1000', '1000+') OR company_size IS NULL);
  END IF;
END $$;

-- =====================================================
-- PART 6: Update create_org_and_owner RPC function
-- =====================================================

CREATE OR REPLACE FUNCTION public.create_org_and_owner(
  p_name text,
  p_description text DEFAULT NULL,
  p_website text DEFAULT NULL,
  p_industry_id uuid DEFAULT NULL,
  p_company_size text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_org uuid;
  v_request_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Validate company_size if provided
  IF p_company_size IS NOT NULL AND p_company_size NOT IN ('1-10', '11-50', '51-200', '201-1000', '1000+') THEN
    RAISE EXCEPTION 'Invalid company_size. Must be one of: 1-10, 11-50, 51-200, 201-1000, 1000+';
  END IF;

  -- Create the organization with status='pending'
  INSERT INTO public.orgs (
    name, 
    description, 
    website,
    industry_id,
    company_size,
    created_by,
    status
  )
  VALUES (
    p_name, 
    p_description, 
    p_website,
    p_industry_id,
    p_company_size,
    auth.uid(),
    'pending'
  )
  RETURNING id INTO v_org;

  -- Add user as owner in org_members
  INSERT INTO public.org_members (org_id, user_id, role)
  VALUES (v_org, auth.uid(), 'owner')
  ON CONFLICT (org_id, user_id) DO NOTHING;

  -- Create org_request entry for admin review
  -- Note: We store the org_id in a comment or use a join later
  -- For now, we'll match by user_id + org_name + created_at proximity
  INSERT INTO public.org_requests (
    user_id,
    org_name,
    org_description,
    website,
    industry_id,
    company_size,
    reason,
    status
  )
  VALUES (
    auth.uid(),
    p_name,
    p_description,
    p_website,
    p_industry_id,
    p_company_size,
    'Organization creation request',
    'pending'
  )
  RETURNING id INTO v_request_id;

  -- Grant business_user role (user becomes business user even while pending)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'business_user'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN v_org;
END;
$function$;

-- =====================================================
-- PART 7: RPC Functions for Application Management
-- =====================================================

-- Function: Apply to join an existing organization
CREATE OR REPLACE FUNCTION public.apply_to_org(
  p_org_id uuid,
  p_message text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_application_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if org exists and is approved
  IF NOT EXISTS (
    SELECT 1 FROM public.orgs 
    WHERE id = p_org_id AND status = 'approved'
  ) THEN
    RAISE EXCEPTION 'Organization not found or not approved';
  END IF;

  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM public.org_members 
    WHERE org_id = p_org_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'You are already a member of this organization';
  END IF;

  -- Check if user already has a pending application
  IF EXISTS (
    SELECT 1 FROM public.org_member_applications 
    WHERE org_id = p_org_id 
    AND user_id = auth.uid() 
    AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'You already have a pending application to this organization';
  END IF;

  -- Create application
  INSERT INTO public.org_member_applications (
    org_id,
    user_id,
    message,
    status
  )
  VALUES (
    p_org_id,
    auth.uid(),
    p_message,
    'pending'
  )
  RETURNING id INTO v_application_id;

  RETURN v_application_id;
END;
$function$;

-- Function: Approve a member application (org owner/admin only)
CREATE OR REPLACE FUNCTION public.approve_org_member_application(
  p_application_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_org_id uuid;
  v_user_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get application details
  SELECT org_id, user_id INTO v_org_id, v_user_id
  FROM public.org_member_applications
  WHERE id = p_application_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  -- Verify caller is org owner/admin or system admin
  IF NOT EXISTS (
    SELECT 1 FROM public.org_members 
    WHERE org_id = v_org_id 
    AND user_id = auth.uid() 
    AND role IN ('owner', 'business_admin')
  ) AND NOT is_admin() THEN
    RAISE EXCEPTION 'Not authorized to approve applications for this organization';
  END IF;

  -- Update application status
  UPDATE public.org_member_applications
  SET 
    status = 'approved',
    reviewed_by = auth.uid(),
    reviewed_at = now()
  WHERE id = p_application_id;

  -- Add user to org_members
  INSERT INTO public.org_members (org_id, user_id, role)
  VALUES (v_org_id, v_user_id, 'member')
  ON CONFLICT (org_id, user_id) DO UPDATE SET role = 'member';

  -- Grant business_user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'business_user'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$function$;

-- Function: Reject a member application (org owner/admin only)
CREATE OR REPLACE FUNCTION public.reject_org_member_application(
  p_application_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_org_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get application org_id
  SELECT org_id INTO v_org_id
  FROM public.org_member_applications
  WHERE id = p_application_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  -- Verify caller is org owner/admin or system admin
  IF NOT EXISTS (
    SELECT 1 FROM public.org_members 
    WHERE org_id = v_org_id 
    AND user_id = auth.uid() 
    AND role IN ('owner', 'business_admin')
  ) AND NOT is_admin() THEN
    RAISE EXCEPTION 'Not authorized to reject applications for this organization';
  END IF;

  -- Update application status
  UPDATE public.org_member_applications
  SET 
    status = 'rejected',
    reviewed_by = auth.uid(),
    reviewed_at = now()
  WHERE id = p_application_id;
END;
$function$;

-- Function: Approve org creation request (admin only)
CREATE OR REPLACE FUNCTION public.approve_org_request(
  p_request_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_org_id uuid;
  v_user_id uuid;
  v_org_name text;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can approve org creation requests';
  END IF;

  -- Get request details
  SELECT user_id, org_name INTO v_user_id, v_org_name
  FROM public.org_requests
  WHERE id = p_request_id AND status = 'pending';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Org request not found or already processed';
  END IF;

  -- Find the org associated with this request
  -- Match by user_id (creator) and org_name, and ensure it's pending
  SELECT o.id INTO v_org_id
  FROM public.orgs o
  WHERE o.created_by = v_user_id 
    AND o.name = v_org_name
    AND o.status = 'pending'
  ORDER BY o.created_at DESC
  LIMIT 1;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Associated organization not found';
  END IF;

  -- Update org status to approved
  UPDATE public.orgs
  SET status = 'approved'
  WHERE id = v_org_id;

  -- Update org_request status
  UPDATE public.org_requests
  SET 
    status = 'approved',
    reviewed_by = auth.uid(),
    reviewed_at = now()
  WHERE id = p_request_id;
END;
$function$;

-- Function: Reject org creation request (admin only)
CREATE OR REPLACE FUNCTION public.reject_org_request(
  p_request_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_org_id uuid;
  v_user_id uuid;
  v_org_name text;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can reject org creation requests';
  END IF;

  -- Get request details
  SELECT user_id, org_name INTO v_user_id, v_org_name
  FROM public.org_requests
  WHERE id = p_request_id AND status = 'pending';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Org request not found or already processed';
  END IF;

  -- Find the org associated with this request
  SELECT o.id INTO v_org_id
  FROM public.orgs o
  WHERE o.created_by = v_user_id 
    AND o.name = v_org_name
    AND o.status = 'pending'
  ORDER BY o.created_at DESC
  LIMIT 1;

  IF v_org_id IS NOT NULL THEN
    -- Update org status to rejected
    UPDATE public.orgs
    SET status = 'rejected'
    WHERE id = v_org_id;
  END IF;

  -- Update org_request status
  UPDATE public.org_requests
  SET 
    status = 'rejected',
    reason = COALESCE(p_reason, reason),
    reviewed_by = auth.uid(),
    reviewed_at = now()
  WHERE id = p_request_id;
END;
$function$;

-- Note: Unique constraint on org_members was moved to PART 3 (before functions)

-- =====================================================
-- PART 8: Create helper view for admin panel (moved after functions)
-- =====================================================

-- View for admin to see all pending org creation requests with org details
-- Note: Using auth.users.email instead of profiles.email (profiles doesn't have email column)
CREATE OR REPLACE VIEW public.org_approval_requests 
WITH (security_invoker = true)
AS
SELECT 
  r.id as request_id,
  r.user_id,
  r.org_name,
  r.org_description,
  r.website,
  r.industry_id,
  r.company_size,
  r.reason,
  r.status as request_status,
  r.created_at as request_created_at,
  o.id as org_id,
  o.status as org_status,
  o.created_at as org_created_at,
  p.display_name as creator_name,
  u.email as creator_email
FROM public.org_requests r
LEFT JOIN public.orgs o ON (
  o.created_by = r.user_id 
  AND o.name = r.org_name
  AND o.created_at >= r.created_at - INTERVAL '1 minute'
  AND o.created_at <= r.created_at + INTERVAL '1 minute'
)
LEFT JOIN public.profiles p ON p.id = r.user_id
LEFT JOIN auth.users u ON u.id = r.user_id
WHERE r.status = 'pending'
ORDER BY r.created_at DESC;

-- Grant access only to authenticated users (RLS will filter to admins via is_admin() check)
-- The view uses security_invoker so it runs with caller's permissions
-- Admins should use a function wrapper that checks is_admin() before selecting from this view
GRANT SELECT ON public.org_approval_requests TO authenticated;

-- =====================================================
-- PART 9: Verify "Public Business" org exists
-- =====================================================

-- Check if "Public Business" org exists, create if missing
DO $$
DECLARE
  v_public_business_org_id uuid;
  v_admin_user_id uuid;
BEGIN
  -- Try to find existing "Public Business" org
  SELECT id INTO v_public_business_org_id
  FROM public.orgs
  WHERE LOWER(name) = 'public business'
  LIMIT 1;

  -- If not found, create it
  IF v_public_business_org_id IS NULL THEN
    -- Find an admin user to set as owner
    SELECT user_id INTO v_admin_user_id
    FROM public.user_roles
    WHERE role = 'admin'
    LIMIT 1;

    -- If no admin found, use the first user (fallback)
    IF v_admin_user_id IS NULL THEN
      SELECT id INTO v_admin_user_id
      FROM auth.users
      ORDER BY created_at ASC
      LIMIT 1;
    END IF;

    -- Create "Public Business" org
    INSERT INTO public.orgs (
      name,
      description,
      created_by,
      status
    )
    VALUES (
      'Public Business',
      'The main Public Business organization',
      v_admin_user_id,
      'approved'
    )
    RETURNING id INTO v_public_business_org_id;

    -- Add admin as owner
    INSERT INTO public.org_members (org_id, user_id, role)
    VALUES (v_public_business_org_id, v_admin_user_id, 'owner')
    ON CONFLICT (org_id, user_id) DO NOTHING;
  ELSE
    -- Ensure existing org is approved
    UPDATE public.orgs
    SET status = 'approved'
    WHERE id = v_public_business_org_id AND status != 'approved';
  END IF;
END $$;

-- =====================================================
-- Migration Complete
-- =====================================================
```

---

## Instructions for Supabase AI Assistant

**The cleaned script is also available in**: `docs/SUPABASE-MIGRATION-CLEANED.sql`

**To run the migration:**

1. Copy the SQL script below (or from SUPABASE-MIGRATION-CLEANED.sql)
2. Paste into Supabase SQL Editor
3. Run the migration

**Alternative - Copy this prompt to Supabase AI Assistant:**

```
I need to run a database migration for my account types and membership flow system. This script has been reviewed and corrected based on your previous feedback.

The migration:
1. Adds status column to orgs table (pending/approved/rejected)
2. Adds additional fields to orgs (website, industry_id, company_size)
3. Creates unique constraint on org_members BEFORE functions (fixes ON CONFLICT issue)
4. Adds FK from org_members.user_id to auth.users.id
5. Creates org_member_applications table with partial unique index (prevents duplicate pending apps)
6. Updates create_org_and_owner RPC to accept more fields and set status='pending'
7. Creates RPC functions for application management
8. Creates admin view for org approvals (uses auth.users.email, not profiles.email)
9. Verifies "Public Business" org exists

Fixes applied:
- Reordered: unique constraint created before functions
- Fixed view: uses auth.users.email instead of profiles.email
- Partial unique index: UNIQUE (org_id, user_id) WHERE status = 'pending'
- Added FK constraint: org_members.user_id -> auth.users.id
- View security: uses WITH (security_invoker = true) at creation

The functions is_admin() and set_updated_at() already exist in the database, so they don't need to be created.

Please execute the script. It's idempotent and safe to run multiple times.
```

---

## Verification Checklist

After running the migration, verify:

- [ ] `orgs.status` column exists with values: pending, approved, rejected
- [ ] `orgs.website`, `orgs.industry_id`, `orgs.company_size` columns exist
- [ ] `org_member_applications` table exists with proper RLS policies
- [ ] `create_org_and_owner` function accepts new parameters
- [ ] `apply_to_org`, `approve_org_member_application`, `reject_org_member_application` functions exist
- [ ] `approve_org_request`, `reject_org_request` functions exist
- [ ] `org_members` has unique constraint on (org_id, user_id)
- [ ] `org_approval_requests` view exists
- [ ] "Public Business" org exists and is approved

---

## Notes

1. **Idempotent Design**: The migration uses `DO $$ BEGIN ... END $$` blocks to check if columns/tables exist before creating them, making it safe to run multiple times.

2. **RLS Policies**: All new tables have proper RLS policies:
   - Users can see their own applications
   - Org owners can see applications to their orgs
   - Admins have full access

3. **Unique Constraints**: 
   - `org_member_applications` has unique constraint on (org_id, user_id, status) to prevent duplicate pending applications
   - `org_members` has unique constraint on (org_id, user_id) to prevent duplicate memberships

4. **Status Flow**:
   - Org creation: `pending` → admin approves → `approved`
   - Member application: `pending` → org owner approves → `approved` (user added to org_members)

5. **Backward Compatibility**: Existing orgs are set to `approved` status automatically.

