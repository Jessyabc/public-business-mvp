# Database View Definitions

This document explains the purpose and structure of all views in the public schema.

---

## ✅ Canonical Views (Documented & Approved)

### `my_open_ideas_view`
**Purpose:** Shows the current authenticated user's submitted open ideas  
**Access:** Authenticated users only (filtered by `auth.uid()`)  
**Columns:**
- `id` (uuid)
- `user_id` (uuid)
- `content` (text)
- `status` (text) - 'pending' | 'approved' | 'rejected'
- `created_at` (timestamp)

**Usage:**
```typescript
const { data } = await supabase.from('my_open_ideas_view').select('*');
```

---

### `my_posts_view`
**Purpose:** Shows the current authenticated user's posts (brainstorms, insights, etc.)  
**Access:** Authenticated users only (filtered by `auth.uid()`)  
**Columns:** All columns from `posts` table for current user

**Usage:**
```typescript
const { data } = await supabase.from('my_posts_view').select('*');
```

---

### `open_ideas_public_view` ⭐ **PRIMARY PUBLIC VIEW**
**Purpose:** Union of approved ideas from both `open_ideas_intake` and `open_ideas_user`  
**Access:** Public (authenticated + anonymous)  
**Columns:**
- `id` (uuid)
- `content` (text)
- `created_at` (timestamp)
- `source` (text) - 'intake' | 'user'

**Usage:**
```typescript
// ✅ CORRECT - Use this for public ideas
const { data } = await supabase.from('open_ideas_public_view').select('*');
```

**Note:** This is the canonical view for displaying approved open ideas. It automatically filters to `status = 'approved'` and unions both anonymous (intake) and authenticated (user) submissions.

---

### `business_profiles_public`
**Purpose:** Shows approved business profiles (public directory)  
**Access:** Public (authenticated + anonymous)  
**Columns:**
- `id` (uuid)
- `company_name` (text)
- `industry_id` (uuid)
- `department_id` (uuid)
- `website` (text)
- `linkedin_url` (text)
- `status` (text)
- `created_at` (timestamp)

**Usage:**
```typescript
const { data } = await supabase.from('business_profiles_public').select('*');
```

---

### `brainstorm_stats`
**Purpose:** Aggregated statistics for brainstorms (likes, comments)  
**Access:** Public (authenticated + anonymous)  
**Columns:**
- `brainstorm_id` (uuid)
- `likes_count` (bigint)
- `comments_count` (bigint)

**Usage:**
```typescript
const { data } = await supabase.from('brainstorm_stats').select('*');
```

---

### `profile_cards`
**Purpose:** Public profile information for user cards/directory  
**Access:** Public (authenticated + anonymous)  
**Columns:**
- `id` (uuid)
- `display_name` (text)
- `bio` (text)
- `company` (text)
- `location` (text)
- `website` (text)
- `linkedin_url` (text)

**Usage:**
```typescript
const { data } = await supabase.from('profile_cards').select('*');
```

---

## ⚠️ Legacy/Deprecated Views (Do Not Use)

### `open_ideas_public` ❌ **DEPRECATED**
**Status:** Legacy view from pre-P3 architecture  
**Problem:** Uses old schema structure (has `is_curated`, `status`, `linked_brainstorms_count`)  
**Replacement:** Use `open_ideas_public_view` instead

**Migration:**
```typescript
// ❌ OLD - Do not use
.from('open_ideas_public')

// ✅ NEW - Use this instead
.from('open_ideas_public_view')
```

**Columns (legacy structure):**
- `id`, `content`, `is_curated`, `linked_brainstorms_count`, `created_at`, `status`

**Action Required:** This view should be dropped after confirming all frontend code has migrated to `open_ideas_public_view`.

---

## ❓ Undocumented Views (Purpose Unknown)

### `open_ideas_members`
**Status:** Purpose unknown - needs investigation  
**Columns:** TBD (requires query to inspect)  
**Action Required:** Document purpose or drop if unused

---

### `open_ideas_teaser`
**Status:** Purpose unknown - possibly preview/marketing data  
**Columns:** 
- `id` (uuid)
- `preview` (text) - truncated content?
- `is_curated` (boolean)
- `created_at` (timestamp)

**Hypothesis:** May be used for showing preview snippets of ideas before authentication?  
**Action Required:** Confirm usage and document purpose, or drop if unused

---

## 📝 View Usage Guidelines

### ✅ DO:
- Use canonical views (`*_view` suffix) for all frontend queries
- Use `my_*_view` for user-specific data (requires auth)
- Use `*_public` or `*_public_view` for public data
- Rely on view RLS for security (don't add extra filters)

### ❌ DON'T:
- Query base tables directly from frontend (use views instead)
- Use deprecated views like `open_ideas_public`
- Read `user_roles` table directly (use `get_user_role()` RPC)
- Bypass views to "optimize" queries (views are already optimized)

---

## 🔍 View Maintenance

### Adding a New View
1. Create view with `CREATE OR REPLACE VIEW`
2. Apply appropriate `GRANT` statements for access
3. Add RLS policies if needed (views inherit from base tables)
4. Document in this file
5. Add usage example to `docs/data-contracts.ts`

### Deprecating a View
1. Mark as deprecated in this file
2. Add migration instructions
3. Update all frontend code to use replacement
4. Apply deny-all access (or drop view)
5. Remove from documentation after 30 days

---

## 📊 View Dependencies

```
BASE TABLES → VIEWS → FRONTEND
==============================================

open_ideas_intake ──┐
                    ├──> open_ideas_public_view → Frontend
open_ideas_user ────┘

posts ──────────────────> my_posts_view ────────> Frontend

user_roles ─────────────> [get_user_role() RPC] > Frontend
                          (no view, use RPC only)
```

---

## 🎯 Quick Reference

| View Name | Status | Use For |
|-----------|--------|---------|
| `my_open_ideas_view` | ✅ Active | User's submitted ideas |
| `my_posts_view` | ✅ Active | User's posts/brainstorms |
| `open_ideas_public_view` | ✅ Active | Public approved ideas |
| `business_profiles_public` | ✅ Active | Public business directory |
| `brainstorm_stats` | ✅ Active | Brainstorm statistics |
| `profile_cards` | ✅ Active | Public user profiles |
| `open_ideas_public` | ❌ Deprecated | Use `open_ideas_public_view` |
| `open_ideas_members` | ❓ Unknown | Needs documentation |
| `open_ideas_teaser` | ❓ Unknown | Needs documentation |
