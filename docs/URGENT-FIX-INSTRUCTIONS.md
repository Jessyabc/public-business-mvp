# URGENT: Fix 403 Permission Errors

## The Problem

You're getting `403 (Forbidden)` errors with message:
```
permission denied for table user_roles
```

This happens because:
1. RLS policies on `user_roles` are too restrictive
2. Some RLS policies directly query `user_roles` instead of using `is_admin()` function
3. The `orgs` table is missing RLS policies

## The Solution

Run these SQL scripts **IN ORDER** in Supabase SQL Editor:

### Step 1: Fix user_roles RLS (CRITICAL)
**File:** `docs/FIX-USER-ROLES-RLS.sql`

This fixes:
- `user_roles` table RLS policies
- Helper functions (`is_admin()`, `is_business_user()`, etc.)
- Policies that directly query `user_roles` (replaces with `is_admin()`)
- `orgs` table RLS policies

### Step 2: Create Organization
**File:** `docs/QUICK-FIX-SQL.sql`

This creates:
- "Public Business" organization
- Sets you (monojessy25@gmail.com) as owner
- Sets your role to `business_user`

## Quick Copy-Paste Method

If you want to run everything at once, copy and paste in this order:

1. **First:** Copy entire contents of `docs/FIX-USER-ROLES-RLS.sql`
2. **Then:** Copy entire contents of `docs/QUICK-FIX-SQL.sql`

## After Running

1. **Hard refresh browser** (Ctrl+Shift+R or Cmd+Shift+R)
2. **Check console** - should see NO 403 errors
3. **Test Business Dashboard** - should load without errors
4. **Test Admin Panel** - should show "Owner" badge

## What Gets Fixed

✅ `user_roles` table permissions  
✅ `orgs` table RLS policies  
✅ `org_members` queries with joins  
✅ `view_business_org_analytics` access  
✅ All helper functions (SECURITY DEFINER)  
✅ Organization creation and ownership  

## If Errors Persist

Check:
1. Are you logged in as `monojessy25@gmail.com`?
2. Did both scripts run successfully (no errors)?
3. Did you hard refresh the browser?
4. Check Supabase logs for any SQL errors

---

**Priority:** CRITICAL - Blocks all business features  
**Time:** 2-3 minutes to run both scripts

