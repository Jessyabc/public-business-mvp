# Database Access Layer Documentation

## 🎯 Overview

This document describes the **ONLY** approved ways for frontend code to interact with the Supabase database. Direct table access is deprecated and should not be used.

## 📋 Breaker Panel: Views & RPCs

### Frontend MUST Use These Entry Points

```typescript
// ❌ NEVER DO THIS - Direct table access
const { data } = await supabase.from('open_ideas').select('*');
const { data } = await supabase.from('user_roles').select('*');

// ✅ ALWAYS DO THIS - Use views and RPCs
const { data } = await supabase.from('open_ideas_public_view').select('*');
const { data } = await supabase.rpc('get_user_role');
```

---

## 📚 Available Views

### 1. `open_ideas_public_view`
**Purpose:** Read all approved Open Ideas from both intake and user tables  
**Access:** Public (authenticated + anonymous)

```typescript
const { data, error } = await supabase
  .from('open_ideas_public_view')
  .select('*');

// Returns: { id, content, created_at, source }
// source: 'intake' | 'user'
```

**Use Cases:**
- Display curated ideas on landing pages
- Browse approved ideas before authentication
- Feed the ideas gallery

---

### 2. `my_open_ideas_view`
**Purpose:** Read the current user's submitted Open Ideas  
**Access:** Authenticated users only (filtered by `auth.uid()`)

```typescript
const { data, error } = await supabase
  .from('my_open_ideas_view')
  .select('*');

// Returns: { id, user_id, content, status, created_at }
// status: 'pending' | 'approved' | 'rejected'
```

**Use Cases:**
- User's "My Ideas" dashboard
- Track submission status
- Edit/delete own ideas

---

### 3. `my_posts_view`
**Purpose:** Read the current user's posts (brainstorms, insights, etc.)  
**Access:** Authenticated users only (filtered by `auth.uid()`)

```typescript
const { data, error } = await supabase
  .from('my_posts_view')
  .select('*');

// Returns: Full posts table columns for current user's posts
```

**Use Cases:**
- "My Posts" page
- User dashboard
- Post management interface

---

## 🔧 Available RPCs

### 1. `get_user_role()`
**Purpose:** Retrieve the current user's role (never returns null)  
**Access:** All users (returns 'public_user' for unauthenticated)

```typescript
const { data: role, error } = await supabase.rpc('get_user_role');

// Returns: 'public_user' | 'business_member' | 'admin'
// ALWAYS returns a value - defaults to 'public_user'
```

**Use Cases:**
- Determine UI access (show/hide Business features)
- Route guards
- Feature flagging

**Example:**
```typescript
// In a React hook
const useUserRole = () => {
  const [role, setRole] = useState<string>('public_user');
  
  useEffect(() => {
    const fetchRole = async () => {
      const { data } = await supabase.rpc('get_user_role');
      setRole(data ?? 'public_user');
    };
    fetchRole();
  }, []);
  
  return {
    role,
    isAdmin: role === 'admin',
    isBusinessMember: role === 'business_member',
    isPublicUser: role === 'public_user',
  };
};
```

---

## 🚫 Deprecated / Quarantined

### `open_ideas` table
**Status:** ✅ MIGRATED & FROZEN  
**Previous Name:** `open_ideas_legacy`  
**Access:** DENIED to all users (comprehensive deny-all RLS)  
**Migration Date:** 2025-01-XX  
**Migration Status:** Complete

**Migration Summary:**
- Total legacy rows: 2
- Migrated to `open_ideas_intake`: 2 (anonymous submissions)
- Migrated to `open_ideas_user`: 0 (no authenticated submissions in legacy)
- Data preserved: 100%

**What happened:**
The original `open_ideas` table was deprecated in P1, renamed to `open_ideas_legacy`, and finally migrated in P3. All data has been moved to the canonical intake/user tables based on whether the submission had a user_id.

**Current state:**
- Table still exists in database (for backup/audit purposes)
- All RLS policies deny access (SELECT, INSERT, UPDATE, DELETE all return false)
- Table marked with deprecation comment
- Consider dropping after 30-day verification period

❌ **DO NOT** attempt to read from or write to this table  
✅ **USE** `open_ideas_public_view` or `my_open_ideas_view` instead

---

## 🔒 RLS Policies Summary

### Base Tables
- `open_ideas_intake`: Anonymous insert allowed
- `open_ideas_user`: Authenticated users can insert/select their own
- `posts`: Public select, authenticated users can write their own

### Views
Views inherit RLS from their base tables and have explicit GRANT permissions:
- `open_ideas_public_view`: authenticated + anon
- `my_open_ideas_view`: authenticated only
- `my_posts_view`: authenticated only

---

## ✅ Self-Test Queries

Run these in Supabase SQL Editor to verify setup:

```sql
-- Test 1: Check user role (should return text, not null)
SELECT public.get_user_role();

-- Test 2: Check my posts (requires auth)
SELECT * FROM public.my_posts_view LIMIT 1;

-- Test 3: Check my open ideas (requires auth)
SELECT * FROM public.my_open_ideas_view LIMIT 1;

-- Test 4: Check public open ideas (works unauthenticated)
SELECT * FROM public.open_ideas_public_view LIMIT 5;
```

---

## 🛠️ Migration History

| Date | Migration | Description |
|------|-----------|-------------|
| 2025-01-XX | `breaker-panel` | Created views, hardened RPCs, quarantined legacy tables |
| 2025-01-XX | `p3-data-migration` | Migrated 2 rows from open_ideas_legacy to canonical tables |
| 2025-01-XX | `p3-freeze-legacy` | Applied deny-all RLS to open_ideas_legacy |

---

## 📖 Best Practices

1. **Always use views for reads** - Never query base tables directly
2. **Use RPCs for role checks** - Never read `user_roles` table directly
3. **Handle errors gracefully** - Views/RPCs may return empty results
4. **Cache role results** - Don't call `get_user_role()` on every render
5. **Test with different auth states** - Verify behavior for anonymous, authenticated, and admin users

---

## 🆘 Troubleshooting

### "permission denied for table X"
- **Cause:** Frontend is trying to access a base table directly
- **Fix:** Use the appropriate view or RPC instead

### "view does not exist"
- **Cause:** Migration hasn't been run yet
- **Fix:** Run the breaker-panel migration in Supabase dashboard

### "RLS policy violation"
- **Cause:** Trying to access data without proper authentication
- **Fix:** Ensure user is authenticated before calling authenticated-only views

---

## 📝 Notes

- All views are `CREATE OR REPLACE`, safe to re-run migrations
- Views automatically stay in sync with base table schema changes
- RPC functions are security definer - they run with elevated privileges
- Legacy `open_ideas` table will be dropped after data migration completes
