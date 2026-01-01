# Roadmap for Next Agent Conversation

**Date:** 2025-01-30  
**Context:** Account Types & Membership System Implementation

---

## 🎯 Current Status

### ✅ Completed

1. **Database Schema & RLS Policies**
   - Account types system implemented (Public Member, Business Member, Org Owner)
   - Organization creation flow with approval system
   - Organization membership application system
   - RLS policies for `org_members`, `orgs`, `org_requests`, `org_member_applications`
   - Helper functions: `is_admin()`, `is_org_member()`, `is_org_admin()`, `set_updated_at()`
   - Migration scripts in `docs/SUPABASE-MIGRATION-CLEANED.sql`

2. **Frontend Implementation**
   - Organization creation form (`src/features/orgs/pages/CreateOrganization.tsx`)
   - Research Hub with Companies tab (`src/pages/Research.tsx`)
   - Company search and application components (`src/components/orgs/`)
   - Admin panel with org ownership badges (`src/pages/Admin.tsx`)
   - Business Dashboard with ownership display (`src/pages/BusinessDashboard.tsx`)
   - Settings page with read-only business settings for non-owners (`src/pages/Settings.tsx`)
   - Navigation updates (Research Hub in menu, Create Org button on Profile)
   - UI readability improvements (text contrast fixes)

3. **Hooks & API**
   - `useOrgMembership` hook for membership data
   - `useIsOrgOwner` hook for ownership detection
   - `useIsBusinessMember` hook for business membership
   - `useOrgApplications` hook for application management
   - `useAdminOrgRequests` hook for admin org approval
   - RPC functions for org operations (`src/integrations/supabase/rpc.ts`)

4. **Query Optimization**
   - Added query invalidation on auth state changes
   - Improved error handling in `useOrgMembership`
   - Removed debug console.logs

---

## ⚠️ Known Issues & Pending Tasks

### 1. **RLS Policy 403 Errors (CRITICAL - IN PROGRESS)**

**Problem:** Users getting 403 errors when querying `org_members` with join to `orgs(*)`

**Root Cause:** 
- `orgs` table missing RLS policies for members to read their organizations
- Join query `SELECT *, org:orgs(*) FROM org_members` fails because `orgs` RLS blocks access

**Solution Files Created:**
- `docs/SUPABASE-RLS-FINAL-FIX.sql` - Fixes `org_members_own_read` policy
- `docs/SUPABASE-INSIGHTS-AND-ORG-FIX.sql` - Adds `orgs` RLS policies and insights/org association

**Status:** SQL scripts ready, need to be run in Supabase

**Next Steps:**
1. Run `docs/SUPABASE-INSIGHTS-AND-ORG-FIX.sql` in Supabase SQL Editor
2. Verify policies exist: `org_members_own_read`, `orgs_members_read`, `orgs_public_read`
3. Test query: `SELECT *, org:orgs(*) FROM org_members WHERE user_id = auth.uid()`
4. Hard refresh browser and verify 403 errors are gone
5. Verify `useOrgMembership` returns data
6. Verify "Owner" badges appear in Admin Panel and Business Dashboard

### 2. **Business Insights Not Wired in Discuss Section**

**Problem:** Business insights appear in Research Hub but not in Discuss section

**Status:** Pending - needs investigation

**Files to Check:**
- `src/pages/Discuss.tsx` or similar
- Feed hooks that filter business insights
- RLS policies on `posts` table for business insights

### 3. **Insights/Org Association Logic**

**Requirements:**
- When creating a Business Insight (`type='insight'`, `mode='business'`):
  - If user has exactly 1 org membership → auto-fill `org_id` (trigger implemented)
  - If user has multiple orgs → UI must show org selector
  - `org_id` is required for insights (enforced by RLS policy)

**Implementation:**
- Trigger created: `trg_set_insight_org_on_insert` (auto-fills `org_id` if single org)
- Need to update frontend composer to:
  - Show org selector if user has multiple orgs
  - Allow `org_id` to be NULL initially (trigger will fill if single org)
  - Validate `org_id` is set before submission

**Files to Update:**
- Business insight composer component
- Post creation API calls

---

## 📋 Immediate Next Steps

### Priority 1: Fix RLS 403 Errors

1. **Run SQL Fix in Supabase:**
   ```sql
   -- Run: docs/SUPABASE-INSIGHTS-AND-ORG-FIX.sql
   -- This will:
   -- - Add RLS policies to orgs table
   -- - Ensure org_members_own_read policy exists
   -- - Create trigger for auto-filling org_id
   -- - Fix all helper functions
   ```

2. **Verify Fix:**
   - Hard refresh browser (Ctrl+Shift+R)
   - Check console - should see no 403 errors
   - Verify `useOrgMembership` returns data
   - Verify "Owner" badges appear
   - Verify Business Settings is editable for owners

### Priority 2: Wire Business Insights in Discuss Section

1. **Investigate:**
   - Check `src/pages/Discuss.tsx` or similar
   - Check feed hooks (`useUniversalFeed`, `usePosts`)
   - Verify RLS policies allow reading business insights
   - Check if filters are excluding business insights

2. **Fix:**
   - Update feed queries to include business insights
   - Ensure proper filtering by org_id if needed
   - Test in UI

### Priority 3: Update Composer for Org Selection

1. **Update Business Insight Composer:**
   - Check if user has multiple orgs (`useOrgMembership`)
   - If multiple → show org selector dropdown
   - If single → auto-fill `org_id` (or let trigger handle it)
   - Validate `org_id` is set before submission

2. **Files to Update:**
   - Business insight creation component
   - Post creation API/function

---

## 📁 Key Files Reference

### Database Migration Files
- `docs/SUPABASE-MIGRATION-CLEANED.sql` - Main migration (already run)
- `docs/SUPABASE-HELPER-FUNCTIONS.sql` - Helper functions (already run)
- `docs/SUPABASE-RLS-FINAL-FIX.sql` - Fix for org_members RLS (ready to run)
- `docs/SUPABASE-INSIGHTS-AND-ORG-FIX.sql` - Complete fix for orgs RLS + insights (ready to run)

### Frontend Components
- `src/features/orgs/pages/CreateOrganization.tsx` - Org creation form
- `src/components/orgs/CompanySearch.tsx` - Company search in Research Hub
- `src/components/orgs/OrgApplicationModal.tsx` - Application modal
- `src/pages/Research.tsx` - Research Hub with Companies tab
- `src/pages/Admin.tsx` - Admin panel with ownership badges
- `src/pages/BusinessDashboard.tsx` - Business dashboard
- `src/pages/Settings.tsx` - Settings with read-only business form

### Hooks
- `src/hooks/useOrgMembership.ts` - Membership data hook
- `src/hooks/useOrgApplications.ts` - Application management hook
- `src/features/orgs/hooks/useUserOrgId.ts` - User's org ID hook

### API/RPC
- `src/integrations/supabase/rpc.ts` - RPC function wrappers
- `src/features/orgs/api/orgs.ts` - Org API functions

---

## 🔍 Testing Checklist

After running RLS fixes:

- [ ] No 403 errors in console
- [ ] `useOrgMembership` returns membership data
- [ ] "Owner" badge appears in Admin Panel
- [ ] "Owner" badge appears in Business Dashboard
- [ ] Business Settings form is editable for owners
- [ ] Business Settings form is read-only for non-owners
- [ ] Can create organization
- [ ] Can search for companies in Research Hub
- [ ] Can apply to organizations
- [ ] Admin can approve/reject org requests
- [ ] Org owners can approve/reject member applications

---

## 🗄️ Database Structure Summary

### Account Types
- **Public Member**: Default role for all new users (`user_roles.role = 'public_user'`)
- **Business Member**: User with org membership (`org_members` row exists, `user_roles.role = 'business_user'`)
- **Org Owner**: User who created an org (`org_members.role = 'owner'`, `orgs.created_by = user_id`)

### Key Tables
- `public.orgs` - Organizations (has `status`, `created_by`, `website`, `industry_id`, `company_size`)
- `public.org_members` - Membership linking (`org_id`, `user_id`, `role`)
- `public.org_member_applications` - Applications to join orgs
- `public.org_requests` - Organization creation requests (for admin approval)
- `public.user_roles` - User role assignments
- `public.posts` - Posts/insights (has `org_id` for business insights)

### Key Functions
- `is_admin()` - Check if user is global admin
- `is_org_member(org_id)` - Check if user is member of org (SECURITY DEFINER)
- `is_org_admin(org_id)` - Check if user is owner/admin of org (SECURITY DEFINER)
- `create_org_and_owner(...)` - Create org and set creator as owner
- `apply_to_org(org_id, message)` - Apply for org membership
- `approve_org_member_application(application_id)` - Approve application
- `reject_org_member_application(application_id)` - Reject application

---

## 🚀 Quick Start for Next Agent

1. **Read this file first** - Understand current status
2. **Check Supabase RLS** - Verify `orgs` table has policies (run `SUPABASE-INSIGHTS-AND-ORG-FIX.sql` if not)
3. **Test frontend** - Hard refresh and verify 403 errors are gone
4. **Fix Discuss section** - Wire business insights into Discuss feed
5. **Update composer** - Add org selector for multi-org users

---

## 📝 Notes

- All SQL scripts are idempotent (safe to run multiple times)
- Frontend uses React Query for caching - may need to invalidate queries after RLS fixes
- Debug console.logs have been removed from production code
- Query invalidation happens automatically on auth state changes

---

**Last Updated:** 2025-01-30  
**Status:** RLS fixes ready, pending Supabase execution

