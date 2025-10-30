# Database Cleanup Inventory - P3

## Inventory Date
2025-01-XX

## Legacy Tables Found

### 1. `open_ideas_legacy`
**Status:** ✅ Found  
**Rows:** 2  
**Action:** Migrate data to new tables, then freeze with deny-all RLS

**Columns:**
- `id` (uuid, not null)
- `content` (text, not null) → Maps to `text` in new tables
- `email` (text, nullable)
- `is_curated` (boolean, not null, default: false)
- `linked_brainstorms_count` (integer, not null, default: 0)
- `created_at` (timestamp with time zone, not null)
- `updated_at` (timestamp with time zone, not null)
- `notify_on_interaction` (boolean, nullable, default: false)
- `subscribe_newsletter` (boolean, nullable, default: false)
- `status` (text, nullable, default: 'pending')
- `user_id` (uuid, nullable)
- `represented_org_id` (uuid, nullable)
- `ip_hash` (text, nullable)

**Data Classification:**
- 2 rows total
- 0 rows with user_id → will migrate to `open_ideas_intake`
- 2 rows without user_id → will migrate to `open_ideas_intake`

### 2. Other Legacy Table Patterns
**Status:** ❌ Not Found

Searched for:
- `ideas`, `user_ideas` - Not found
- `posts_*` - Not found (only `posts` table exists, which is canonical)
- `profiles_*` - Not found (only `profiles` table exists, which is canonical)
- `open_ideas` - Renamed to `open_ideas_legacy` in P1

## Migration Strategy

### Phase 1: Data Migration
1. **Route authenticated submissions** (`user_id IS NOT NULL`)
   - Target: `open_ideas_user`
   - Map: `content` → `text`, preserve `user_id`, `status`, `created_at`
   
2. **Route anonymous submissions** (`user_id IS NULL`)
   - Target: `open_ideas_intake`
   - Map: `content` → `text`, preserve `ip_hash`, `status`, `created_at`

### Phase 2: Freeze Legacy
1. Confirm no frontend queries to legacy tables
2. Drop existing admin-only policies
3. Add comprehensive deny-all RLS policies
4. Document in README-DB.md

### Phase 3: Optional Cleanup
- After verification period (7-14 days), consider dropping `open_ideas_legacy`
- Keep backup export before dropping

## Canonical Tables (Post-P3)

### Active Tables
- ✅ `open_ideas_intake` - Anonymous submissions
- ✅ `open_ideas_user` - Authenticated submissions
- ✅ `posts` - All posts (brainstorms, insights, etc.)
- ✅ `profiles` - User profiles
- ✅ `user_roles` - User role assignments
- ✅ `org_members` - Organization membership
- ✅ `orgs` - Organizations

### Views (Frontend-facing)
- ✅ `open_ideas_public_view` - Approved ideas from both intake + user
- ✅ `my_open_ideas_view` - Current user's ideas
- ✅ `my_posts_view` - Current user's posts
- ✅ `business_profiles_public` - Approved business profiles
- ✅ `brainstorm_stats` - Brainstorm statistics

### RPCs (Frontend-facing)
- ✅ `get_user_role()` - Returns user's primary role
- ✅ `get_my_roles()` - Returns array of user's roles
- ✅ `get_user_org_id()` - Returns user's primary org ID
- ✅ `is_admin()` - Boolean admin check
- ✅ `is_business_member()` - Boolean business member check
- ✅ `is_org_member(org_id)` - Boolean org membership check

## Verification Checklist

- [ ] Pre-migration row count: 2 in `open_ideas_legacy`
- [ ] Post-migration: 2 rows in target tables (intake/user)
- [ ] No data loss during migration
- [ ] Frontend still works (reads from views)
- [ ] No queries to legacy table in logs
- [ ] RLS policies deny all access to legacy table
- [ ] Documentation updated

## Rollback Plan

If migration fails:
1. Restore admin-only policies on `open_ideas_legacy`
2. Admin panel can still access legacy data
3. Re-run migration with fixes
4. Keep legacy table until successful migration

## Notes

- Legacy table has only 2 rows, so migration is low-risk
- Both rows are anonymous submissions (no user_id)
- All rows will go to `open_ideas_intake`
- No data will go to `open_ideas_user` in this migration
- Consider email collection for future features (legacy has email column)
