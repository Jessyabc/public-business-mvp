# Prompt for Lovable: Fix Organization Setup and RLS 403 Errors

## Context
I'm working on a Public Business MVP application with an organization membership system. There are critical issues preventing the app from working correctly:

1. **Missing Organization**: "Public Business" organization needs to be created
2. **User Ownership**: monojessy25@gmail.com must be the owner/admin of "Public Business"
3. **403 Errors**: RLS (Row Level Security) policies are blocking queries, causing 403 errors in Business Dashboard and Admin Panel

## Current Issues

### 1. Organization Setup
- The "Public Business" organization doesn't exist in the database
- User monojessy25@gmail.com needs to be set as the owner of this organization
- User needs to have `org_members` record with `role = 'owner'` for "Public Business"

### 2. RLS 403 Errors
Users are getting 403 errors when:
- Querying `org_members` with joins to `orgs(*)`
- Accessing Business Dashboard
- Accessing Admin Panel
- The `orgs` table is missing RLS policies that allow members to read their organizations

## Required Fixes

### Step 1: Run SQL Fix Script
**File to run:** `docs/SUPABASE-INSIGHTS-AND-ORG-FIX.sql`

This script:
- Adds RLS policies to `orgs` table so joins work
- Creates trigger for auto-filling `org_id` for insights
- Ensures `is_org_member` function is SECURITY DEFINER
- Updates posts INSERT policy to allow NULL org_id initially

**Action:** Run this entire SQL script in Supabase SQL Editor.

### Step 2: Create "Public Business" Organization
Run this SQL in Supabase SQL Editor to create the organization and set ownership:

```sql
-- Step 1: Get the user ID for monojessy25@gmail.com
DO $$
DECLARE
  v_user_id uuid;
  v_org_id uuid;
BEGIN
  -- Find user by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'monojessy25@gmail.com';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email monojessy25@gmail.com not found';
  END IF;

  -- Create "Public Business" organization
  INSERT INTO public.orgs (
    name,
    description,
    status,
    created_by,
    website,
    industry_id,
    company_size
  ) VALUES (
    'Public Business',
    'The main Public Business organization',
    'approved',
    v_user_id,
    NULL,
    NULL,
    NULL
  )
  RETURNING id INTO v_org_id;

  -- Create org_members record with owner role
  INSERT INTO public.org_members (
    org_id,
    user_id,
    role
  ) VALUES (
    v_org_id,
    v_user_id,
    'owner'
  )
  ON CONFLICT (org_id, user_id) DO UPDATE
  SET role = 'owner';

  -- Ensure user has business_user role
  INSERT INTO public.user_roles (
    user_id,
    role
  ) VALUES (
    v_user_id,
    'business_user'
  )
  ON CONFLICT (user_id) DO UPDATE
  SET role = 'business_user';

  RAISE NOTICE 'Created "Public Business" org (ID: %) and set % as owner', v_org_id, v_user_id;
END $$;
```

### Step 3: Verify Setup
Run these verification queries:

```sql
-- Verify org exists
SELECT id, name, status, created_by 
FROM public.orgs 
WHERE name = 'Public Business';

-- Verify membership exists
SELECT om.*, o.name as org_name
FROM public.org_members om
JOIN public.orgs o ON o.id = om.org_id
WHERE o.name = 'Public Business';

-- Verify user role
SELECT ur.*, u.email
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE u.email = 'monojessy25@gmail.com';

-- Test RLS policies (should return data, not 403)
SELECT om.*, org:orgs(*) 
FROM public.org_members om
WHERE om.user_id = (SELECT id FROM auth.users WHERE email = 'monojessy25@gmail.com');
```

## Expected Results After Fix

1. ✅ "Public Business" organization exists with status 'approved'
2. ✅ monojessy25@gmail.com is owner of "Public Business"
3. ✅ User has `business_user` role in `user_roles`
4. ✅ No 403 errors in browser console
5. ✅ Business Dashboard loads membership data
6. ✅ Admin Panel shows "Owner" badge
7. ✅ Business insights appear in Discuss section (Business lens)
8. ✅ Can create business insights without errors

## Testing Checklist

After running the fixes:

- [ ] Open browser console - no 403 errors
- [ ] Navigate to Business Dashboard - loads without errors
- [ ] Navigate to Admin Panel - shows "Owner" badge
- [ ] Check `useOrgMembership` hook returns data
- [ ] Switch to Business lens in Discuss - insights appear
- [ ] Try creating a business insight - works without errors

## Files Reference

- **SQL Fix Script**: `docs/SUPABASE-INSIGHTS-AND-ORG-FIX.sql`
- **SQL Instructions**: `docs/SQL-FIX-INSTRUCTIONS.md`
- **Roadmap**: `docs/NEXT-AGENT-ROADMAP.md`

## Important Notes

1. **Run SQL scripts in order**: First run `SUPABASE-INSIGHTS-AND-ORG-FIX.sql`, then the org creation script
2. **All scripts are idempotent**: Safe to run multiple times
3. **Check for errors**: If any SQL errors occur, check Supabase logs
4. **Hard refresh browser**: After fixes, do Ctrl+Shift+R to clear cache

## If Issues Persist

If 403 errors continue:
1. Check that `orgs` table has RLS policies: `SELECT * FROM pg_policy WHERE polrelid = 'orgs'::regclass;`
2. Verify `is_org_member` function exists and is SECURITY DEFINER
3. Check browser console for specific error messages
4. Verify user is logged in as monojessy25@gmail.com

---

**Priority**: CRITICAL - This blocks core functionality
**Estimated Time**: 5-10 minutes to run SQL scripts and verify

