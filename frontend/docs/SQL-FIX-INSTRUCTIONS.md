# SQL Fix Instructions for RLS 403 Errors

## Overview
This document provides step-by-step instructions for running the SQL fix to resolve RLS 403 errors when querying `org_members` with joins to `orgs`.

## File to Run
**Location:** `docs/SUPABASE-INSIGHTS-AND-ORG-FIX.sql`

## What This Fix Does

1. **Adds RLS policies to `orgs` table** - Allows members to read their organizations (needed for joins)
2. **Creates trigger for auto-filling `org_id`** - Automatically sets `org_id` for business insights when user has single org membership
3. **Updates `is_org_member` function** - Ensures it's SECURITY DEFINER for proper RLS evaluation
4. **Updates posts INSERT policy** - Allows `org_id` to be NULL initially (trigger will fill it)
5. **Creates org-scoped insight scores function** - For analytics
6. **Completes `org_requests` policies** - Allows org owners to manage requests

## Steps to Run

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor**

2. **Open the SQL File**
   - Open `docs/SUPABASE-INSIGHTS-AND-ORG-FIX.sql` in your editor
   - Copy the entire contents

3. **Paste and Run**
   - Paste the SQL into the Supabase SQL Editor
   - Click **Run** (or press Ctrl+Enter)

4. **Verify Success**
   - Check for any errors in the output
   - The script is idempotent (safe to run multiple times)
   - Look for NOTICE messages indicating successful creation

## Expected Output

You should see NOTICE messages like:
```
NOTICE: orgs table RLS policies configured
NOTICE: Auto-set org_id to [uuid] for user with single membership
NOTICE: Created is_org_member function
NOTICE: Updated insert_org_business_insights policy to allow NULL org_id
NOTICE: === VERIFICATION SUMMARY ===
NOTICE: orgs table has 2 RLS policies
NOTICE: Auto-fill org_id trigger: EXISTS ✓
NOTICE: === END SUMMARY ===
```

## Verification Queries

After running, you can verify the policies exist:

```sql
-- Check orgs policies
SELECT p.polname, c.relname 
FROM pg_policy p
JOIN pg_class c ON p.polrelid = c.oid
WHERE c.relname = 'orgs';

-- Check trigger exists
SELECT tgname FROM pg_trigger 
WHERE tgname = 'trg_set_insight_org_on_insert';

-- Test query (should work without 403)
SELECT *, org:orgs(*) 
FROM org_members 
WHERE user_id = auth.uid();
```

## Testing After Fix

1. **Hard refresh browser** (Ctrl+Shift+R or Cmd+Shift+R)
2. **Check browser console** - Should see no 403 errors
3. **Verify membership data loads** - Check Admin Panel and Business Dashboard
4. **Verify "Owner" badges appear** - Should show for org owners
5. **Test business insights** - Should appear in Discuss section (Business lens)

## Troubleshooting

If you still see 403 errors:
- Ensure you're logged in as a user with org memberships
- Check that the policies were created: `SELECT * FROM pg_policy WHERE polrelid = 'orgs'::regclass;`
- Verify the `is_org_member` function exists and is SECURITY DEFINER
- Check browser console for specific error messages

## Next Steps

After running this fix:
1. ✅ RLS 403 errors should be resolved
2. ✅ Business insights should appear in Discuss section (already fixed in code)
3. ⏳ Update Composer for org selection (next task)

