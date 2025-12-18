# Public Business Terminology Reference

## Overview

This document maps user-facing terms (UI/UX) to database schemas and code concepts. Use this when you're unsure whether "Spark" means something different in the database.

---

## Two-Pillar Architecture

### Pillar #1: Think (Workspace)

| UI Term | Database | Table | Notes |
|---------|----------|-------|-------|
| **Workspace** | N/A | N/A | Route: `/` |
| **Thought** | workspace_thoughts | `workspace_thoughts` | Private, user-scoped only |
| **Active Thought** | state='active' | `workspace_thoughts.state` | Currently being edited |
| **Anchored Thought** | state='anchored' | `workspace_thoughts.state` | Saved but not published |

**Key Points:**
- Thoughts never become posts
- No social metrics (likes, views, shares)
- No organization affiliation
- Strictly private (RLS enforced)

### Pillar #2: Discuss (Social Space)

| UI Term | Database | Table | Notes |
|---------|----------|-------|-------|
| **Discuss** | N/A | N/A | Route: `/discuss` |
| **Post** | posts | `posts` | Generic term for all content |
| **Spark** | kind='brainstorm' | `posts.kind` | Public conversational post |
| **Insight** | kind='insight' | `posts.kind` | Business structured post |
| **Open Idea** | kind='open_idea' | `posts.kind` | Anonymous submission |

**Key Points:**
- All posts stored in unified `posts` table
- Public posts have `represented_org_id = NULL`
- Business posts have `represented_org_id` set

---

## Post Types (Detailed)

### Spark (Public)

- **UI Name**: "Spark"
- **Database**: `post_kind = 'brainstorm'`
- **Description**: Public, conversational post
- **Characteristics**:
  - No title required
  - 80-2500 characters
  - Public visibility
  - Can be continued (hard links)
  - Can be referenced (soft links)

### Insight (Business)

- **UI Name**: "Insight"
- **Database**: `post_kind = 'insight'`
- **Description**: Business-mode structured post
- **Characteristics**:
  - Title required (3-120 chars)
  - 300-6000 characters
  - Organization-scoped
  - `represented_org_id` required

### Open Idea (Anonymous)

- **UI Name**: "Open Idea"
- **Database**: `post_kind = 'open_idea'`
- **Description**: Anonymous public submission
- **Characteristics**:
  - No title
  - 20-600 characters
  - Author can be NULL
  - Approval workflow

---

## Lens vs Mode vs Theme

These terms are often confused. Here's the distinction:

### Lens (Discuss Only)

- **Scope**: Only exists in `/discuss` route
- **Options**: Public | Business
- **Storage**: `localStorage` key: `pb-discuss-lens`
- **Purpose**: Filters which posts are shown
- **Implementation**: `DiscussLensContext`

### Theme (Visual Styling)

- **Scope**: Entire app
- **Options**: public (dark) | business (light)
- **Control**: `ThemeInjector` (single source of truth)
- **Purpose**: Visual styling and CSS variables
- **Implementation**: Sets `data-theme` attribute on `<body>`

### Mode (Deprecated)

- **Status**: ⚠️ Removed in Phase 1
- **Legacy**: Previously tried to be a global state
- **Replaced by**: Route-aware theming via ThemeInjector

---

## Post Relations (Lineage)

| UI Term | Database | Type | Notes |
|---------|----------|------|-------|
| **Continuation** | relation_type='origin' | Hard link | Linear thread |
| **Reply** | relation_type='reply' | Hard link | Conversational response |
| **Reference** | relation_type='cross_link' | Soft link | Associative |
| **Quote** | relation_type='quote' | Soft link | Citation |

**Table**: `post_relations`

**Key Points:**
- Hard links (`origin`, `reply`): Linear, primary narrative
- Soft links (`cross_link`, `quote`): Associative, secondary references
- Lineage is for posts only (workspace lineage TBD in future)

---

## Database Schema Quick Reference

### Core Tables

| Table | Purpose | Scope |
|-------|---------|-------|
| `workspace_thoughts` | Private thinking | User-only |
| `posts` | Social content | Public/Business |
| `post_relations` | Post lineage | Links between posts |
| `profiles` | User profiles | User metadata |
| `organizations` | Business entities | Business accounts |
| `org_members` | Membership | User ↔ Org join |

### Enums

```sql
-- Post kinds
CREATE TYPE post_kind AS ENUM (
  'open_idea',
  'brainstorm',        -- UI: "Spark"
  'brainstorm_continue',
  'insight',           -- UI: "Insight"
  'white_paper',
  'video_brainstorm',
  'video_insight'
);

-- Post status
CREATE TYPE post_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'archived'
);

-- Visibility
CREATE TYPE post_visibility AS ENUM (
  'public',
  'unlisted',
  'private'
);
```

---

## Special Cases

### Business Post Identification

**Question**: How do I query for "business posts"?

**Answer**: 
```sql
-- Business posts have represented_org_id set
SELECT * FROM posts WHERE represented_org_id IS NOT NULL;

-- Public posts
SELECT * FROM posts WHERE represented_org_id IS NULL;
```

There is no explicit `mode` column (removed in favor of org affiliation).

### Workspace vs Posts

**Question**: Can a workspace thought become a post?

**Answer**: No. By design, there is no "publish" action. The two pillars are sovereign:
- Workspace thoughts stay in `workspace_thoughts`
- Posts are created directly in `posts` (via Composer)

**Question**: Can posts reference workspace thoughts?

**Answer**: No. The `post_relations` table only links posts to posts. Workspace lineage (future) will be a separate system.

---

## Code References

### Key Directories

- **Workspace**: `/src/features/workspace/`
- **Discuss**: `/src/pages/Discuss.tsx`
- **Composer**: `/src/components/composer/`
- **Post Utilities**: `/src/lib/posts/`

### Key Functions

```typescript
// Build post payloads
buildSparkPayload()           // Creates brainstorm post
buildBusinessInsightPayload() // Creates insight post

// Create relations
createHardLink(parentId, childId)
createSoftLinks(postId, targetIds[])
```

---

## Migration Notes

### For Developers

If you see these in old code:
- `mode: 'public' | 'business'` → Use lens (Discuss) or check `represented_org_id` (posts)
- `uiModeStore` → Removed in Phase 1, use ThemeInjector
- `data-mode` attribute → Now `data-theme` (set by ThemeInjector)

### Why "Brainstorm" in DB but "Spark" in UI?

Historical reasons. Early versions used "brainstorm" as the post type name. UX research showed "Spark" resonated better with users. We kept the database enum for stability (no migration needed) but rebranded in UI.

**Guideline**: Use "Spark" in UI/docs, `kind='brainstorm'` in code/queries.

---

## Questions?

See also:
- `/docs/composer-architecture.md` - How composer works
- `/docs/CANONICAL-POST-SYSTEM.md` - Post system design
- `/docs/lineage-and-org-model.md` - Org and lineage details
