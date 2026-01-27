# Copy-Paste Prompt for Lovable

---

## Fix Organization Setup and RLS 403 Errors

I need you to fix critical issues in my Public Business MVP:

**Problems:**
1. "Public Business" organization doesn't exist
2. monojessy25@gmail.com needs to be owner/admin of "Public Business"
3. 403 errors in Business Dashboard and Admin Panel due to missing RLS policies

**Required Actions:**

### 1. Run RLS Fix Script
Run `docs/SUPABASE-INSIGHTS-AND-ORG-FIX.sql` in Supabase SQL Editor. This fixes RLS policies on `orgs` table.

### 2. Create Organization and Set Owner
Run `docs/QUICK-FIX-SQL.sql` in Supabase SQL Editor. This:
- Creates "Public Business" organization
- Sets monojessy25@gmail.com as owner
- Sets user role to business_user

### 3. Verify
After running both scripts:
- Check browser console - should have no 403 errors
- Business Dashboard should load
- Admin Panel should show "Owner" badge
- User should be able to create business insights

**Files:**
- `docs/SUPABASE-INSIGHTS-AND-ORG-FIX.sql` - RLS fix
- `docs/QUICK-FIX-SQL.sql` - Org creation and ownership

**Expected Result:** No 403 errors, user is owner of "Public Business", all features work.

---

