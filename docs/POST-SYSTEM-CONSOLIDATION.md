# Post System Consolidation - Complete

**Date**: 2025-12-01  
**Status**: ✅ Phase 1 Complete (Legacy Tagging)

## Overview
The Public Business codebase has been consolidated to use a **single source of truth** for all post-related operations:
- **Canonical Posts Table**: `public.posts`
- **Canonical Relations Table**: `public.post_relations`

All duplicate systems, legacy tables, and shadow logic have been identified and marked for future removal.

---

## 🎯 Canonical System (PRIMARY - Production Ready)

### Core Data Model
- **`src/types/post.ts`** - Canonical post types (BasePost, Post, PostRelation)
- **`src/lib/postPayloads.ts`** - Payload builders for creating posts
  - `buildPublicSparkPayload()` - Creates public brainstorm Sparks
  - `buildBusinessInsightPayload()` - Creates business insights

### Core Hooks
- **`src/hooks/usePosts.ts`** - PRIMARY post CRUD operations
  - `fetchPosts()` - Fetch posts by mode
  - `createPost()` - Create posts with canonical rules
  - `createPostWithRelation()` - Create posts with parent relations
  - `updatePost()` - Update existing posts
  - `deletePost()` - Delete posts
  
- **`src/hooks/usePostRelations.ts`** - PRIMARY relations management
  - `createRelation()` - Create post_relations entries
  - `deleteRelation()` - Remove relations
  - Categorizes relations by type: origin, reply, quote, cross_link

### Feed System
- **`src/lib/feedQueries.ts`** - Unified feed queries from posts table
  - `fetchUniversalFeed()` - Main feed query with filters
  - `fetchCrossLinkedPosts()` - Related posts query

- **`src/features/feed/hooks/useUniversalFeed.ts`** - Universal feed hook
- **`src/features/feed/FeedContainer.tsx`** - Feed container component
- **`src/features/feed/FeedList.tsx`** - Feed list renderer

### Canonical Pages
- **`src/pages/brainstorm/BrainstormFeed.tsx`** - Main brainstorm feed (CANONICAL)
  - Uses FeedContainer with mode='brainstorm_main'
  - Uses BrainstormThread for thread views
  - Uses PostLineageOverlay for lineage
  - All data from posts + post_relations

### Canonical Composer
- **`src/components/composer/ComposerModal.tsx`** - CANONICAL post creation
  - Creates Sparks (public brainstorms)
  - Creates Business Insights
  - Uses `buildPublicSparkPayload()` and `buildBusinessInsightPayload()`
  - Inserts directly to `posts` table
  - Creates soft links via `api_create_soft_links` RPC to `post_relations`
  - Handles Open Ideas via edge function

---

## 🔴 Legacy System (Tagged for Future Removal)

### Legacy Hooks
| File | Status | Notes |
|------|--------|-------|
| `src/hooks/useBrainstorms.ts` | 🏷️ LEGACY | Wraps posts table in old interface |
| `src/hooks/useIdeaLinks.ts` | 🏷️ LEGACY | Uses deprecated idea_links table |
| `src/hooks/useIdeaLinks.LEGACY.ts` | 🏷️ LEGACY | Already deprecated |
| `src/hooks/useOpenIdeas.ts` | 🏷️ LEGACY | Uses legacy open_ideas tables |

### Legacy Query Functions
| File | Status | Notes |
|------|--------|-------|
| `src/lib/brainstormRelations.ts` | 🏷️ LEGACY | Duplicate of usePostRelations |
| `src/lib/getPostRelations.ts` | 🏷️ LEGACY | Duplicate of usePostRelations |

### Legacy Stores
| File | Status | Notes |
|------|--------|-------|
| `src/stores/brainstormsStore.ts` | 🏷️ LEGACY | Uses mock service, not connected to posts |

### Legacy Pages
| File | Status | Notes |
|------|--------|-------|
| `src/pages/Brainstorms.tsx` | 🏷️ LEGACY | Uses useBrainstorms wrapper |
| `src/pages/BrainstormDetail.tsx` | 🏷️ LEGACY | Uses useBrainstorms wrapper |
| `src/pages/BrainstormEdit.tsx` | 🏷️ LEGACY | Already marked for migration |
| `src/pages/BrainstormNew.tsx` | 🏷️ LEGACY | Already marked for migration |

### Legacy Components
| File | Status | Notes |
|------|--------|-------|
| `src/components/posts/PostComposer.tsx` | 🏷️ LEGACY | Redundant with ComposerModal |

### Helper Functions (Canonical but Redundant)
| File | Status | Notes |
|------|--------|-------|
| `src/data/posts.ts` | ✅ CANONICAL | Correct implementation, but prefer postPayloads |

---

## 📋 Database Tables

### ✅ Active (Canonical)
- **`public.posts`** - All posts (Sparks, Business Insights, etc.)
  - Fields: id, user_id, org_id, type, kind, visibility, mode, content, status, etc.
  
- **`public.post_relations`** - All post relationships
  - Fields: id, parent_post_id, child_post_id, relation_type, created_at
  - Relation types: 'origin', 'reply', 'quote', 'cross_link'

### 🔴 Legacy (To Be Phased Out)
- **`public.idea_links`** - Old linking system (deprecated)
- **`public.open_ideas_legacy`** - Old open ideas (deprecated)
- **`public.open_ideas_user`** - User-submitted ideas (being migrated)
- **`public.open_ideas_intake`** - Anonymous ideas (being migrated)
- **`public.brainstorms`** - Old brainstorms table (deprecated, data migrated)
- **`public.business_insights`** - Old insights table (deprecated, data migrated)

---

## 🔄 Canonical Post Creation Flow

### Public Spark Creation
```typescript
import { buildPublicSparkPayload } from '@/lib/postPayloads';
import { supabase } from '@/integrations/supabase/client';

// 1. Build payload
const payload = buildPublicSparkPayload({
  userId: user.id,
  content: 'My brainstorm content',
  title: undefined, // Optional
  originOpenIdeaId: undefined, // Optional
});

// 2. Insert to posts table
const { data: newPost, error } = await supabase
  .from('posts')
  .insert(payload)
  .select('id')
  .single();

// 3. Create relations (optional)
if (selectedParentPostIds.length > 0 && newPost?.id) {
  await supabase.rpc('api_create_soft_links', {
    p_parent: newPost.id,
    p_children: selectedParentPostIds
  });
}
```

### Business Insight Creation
```typescript
import { buildBusinessInsightPayload } from '@/lib/postPayloads';

// 1. Get user's org
const { data: orgId } = await supabase.rpc('get_user_org_id');

// 2. Build payload
const payload = buildBusinessInsightPayload({
  userId: user.id,
  orgId,
  content: 'My business insight',
  title: 'Insight Title',
});

// 3. Insert to posts table
const { data: newPost, error } = await supabase
  .from('posts')
  .insert(payload)
  .select('id')
  .single();
```

---

## 🔄 Canonical Relation Management

### Creating Relations
```typescript
import { usePostRelations } from '@/hooks/usePostRelations';

const { createRelation } = usePostRelations();

// Create a lineage relation (parent spawned child)
await createRelation({
  parentPostId: 'parent-uuid',
  childPostId: 'child-uuid',
  relationType: 'origin'
});

// Create a cross-link (bidirectional association)
await createRelation({
  parentPostId: 'post-a-uuid',
  childPostId: 'post-b-uuid',
  relationType: 'cross_link'
});
```

### Querying Relations
```typescript
import { usePostRelations } from '@/hooks/usePostRelations';

const { relations, children, parents, byType } = usePostRelations(postId);

// All relations for this post
console.log(relations);

// Categorized
console.log(byType.origin); // Origin relations
console.log(byType.cross_link); // Cross-link relations
console.log(children); // Child posts
console.log(parents); // Parent posts
```

---

## 🎯 Migration Status

### ✅ Completed
- [x] Tagged all legacy files with clear comments
- [x] Identified canonical system components
- [x] Documented single source of truth
- [x] Verified ComposerModal uses canonical paths
- [x] Verified BrainstormFeed uses canonical paths
- [x] Verified relation management is canonical

### 🔄 In Progress
- [ ] None

### 📝 Future Work (Do Not Start Yet)
- [ ] Migrate legacy pages to use canonical hooks
- [ ] Remove legacy hooks after migration
- [ ] Remove legacy query functions
- [ ] Drop deprecated database tables
- [ ] Remove PostComposer component

---

## 📚 Developer Guidelines

### ✅ DO
- Use `usePosts` for all post CRUD operations
- Use `usePostRelations` for managing post relationships
- Use `ComposerModal` for creating new posts
- Use `FeedContainer` and `useUniversalFeed` for displaying feeds
- Use `buildPublicSparkPayload` and `buildBusinessInsightPayload` for post creation
- Query from `posts` and `post_relations` tables only

### ❌ DON'T
- Don't use `useBrainstorms` in new code (legacy wrapper)
- Don't use `useIdeaLinks` (deprecated table)
- Don't use `useOpenIdeas` (legacy tables)
- Don't use `brainstormsStore` (mock data)
- Don't query from `idea_links`, `brainstorms`, or `business_insights` tables
- Don't extend any file marked with `// LEGACY` comment

---

## 🎉 Summary

**The Public Business post system is now unified!**

All posts flow through:
1. **`public.posts`** table (single source of truth)
2. **`public.post_relations`** table (single lineage system)
3. Canonical hooks (`usePosts`, `usePostRelations`)
4. Canonical composer (`ComposerModal`)
5. Canonical feeds (`useUniversalFeed`, `FeedContainer`)

Legacy code has been clearly marked but not removed. The system continues to compile and work correctly while providing a clear migration path forward.
