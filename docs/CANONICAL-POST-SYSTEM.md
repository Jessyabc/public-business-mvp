# Canonical Post System

## Overview

The Public Business application uses a **strict canonical model** for all content and relationships:

- **All content lives in the `posts` table**
- **All relationships live in the `post_relations` table**
- **Posts never change species after creation**
- **Type, kind, mode, and org_id are immutable**
- **Only content and title can be edited**

## Post Types

### 1. Spark (Public Brainstorm)

**Canonical Shape:**
```typescript
{
  type: 'brainstorm',        // IMMUTABLE
  kind: 'Spark',             // IMMUTABLE
  mode: 'public',            // IMMUTABLE
  visibility: 'public',      // IMMUTABLE
  org_id: null,              // IMMUTABLE
  user_id: '<auth.uid>',     // IMMUTABLE
  content: 'Your content',   // MUTABLE
  title: 'Optional title',   // MUTABLE
  status: 'active'
}
```

**Rules:**
- Anyone can create Sparks (authenticated users only)
- Sparks are always public
- Sparks never belong to an organization
- Sparks cannot become Business Insights

### 2. Business Insight

**Canonical Shape:**
```typescript
{
  type: 'insight',           // IMMUTABLE
  kind: 'BusinessInsight',   // IMMUTABLE
  mode: 'business',          // IMMUTABLE
  visibility: 'my_business', // IMMUTABLE
  org_id: '<org_uuid>',      // IMMUTABLE (required)
  user_id: '<auth.uid>',     // IMMUTABLE
  content: 'Your content',   // MUTABLE
  title: 'Required title',   // MUTABLE (required)
  status: 'active'
}
```

**Rules:**
- Only business members can create Business Insights
- Must belong to an organization (org_id required)
- Title is required
- Only visible to members of the same organization
- Business Insights cannot become Sparks

## Relation Types

All post relationships use the `post_relations` table with standardized types:

| Relation Type | Description | Use Case |
|--------------|-------------|----------|
| `reply` | Child continues parent | "Continue Spark" functionality (formerly 'hard') |
| `cross_link` | Child references parent | Cross-linking posts (formerly 'soft') |
| `origin` | Parent is source of child | Idea → Insight transformation |
| `quote` | Child quotes parent | Referencing/quoting content |

### Legacy Mapping

The system automatically maps legacy relation types:
- `hard` → `reply`
- `soft` → `cross_link`

## Usage

### Creating Posts

**Always use canonical builders:**

```typescript
import { buildSparkPayload, buildBusinessInsightPayload } from '@/lib/posts';

// Create a Spark
const sparkPayload = buildSparkPayload({
  userId: user.id,
  content: 'Your brilliant idea...',
  title: 'Optional title',
  metadata: { origin_open_idea_id: '...' } // optional
});

await supabase.from('posts').insert(sparkPayload);

// Create a Business Insight
const insightPayload = buildBusinessInsightPayload({
  userId: user.id,
  orgId: organization.id,
  content: 'Your professional analysis...',
  title: 'Required title',
  metadata: {} // optional
});

await supabase.from('posts').insert(insightPayload);
```

### Creating Relations

**Always use canonical relation helpers:**

```typescript
import { createPostRelation, createHardLink, createSoftLinks } from '@/lib/posts';

// Create a "Continue Spark" relation (hard link)
await createHardLink(parentPostId, newPostId);

// Create cross-references (soft links)
await createSoftLinks(newPostId, [relatedPost1Id, relatedPost2Id]);

// Create any relation type
await createPostRelation({
  parentPostId: parent.id,
  childPostId: child.id,
  relationType: 'quote'
});
```

### Updating Posts

**Only content and title can be updated:**

```typescript
import { buildPostUpdatePayload } from '@/lib/posts';

const updatePayload = buildPostUpdatePayload({
  content: 'Updated content',
  title: 'Updated title'
});

await supabase
  .from('posts')
  .update(updatePayload)
  .eq('id', postId)
  .eq('user_id', user.id);
```

**Attempting to update immutable fields will fail:**
```typescript
// ❌ THIS WILL THROW AN ERROR
await supabase
  .from('posts')
  .update({ 
    type: 'insight',  // ERROR: Cannot change type
    mode: 'business', // ERROR: Cannot change mode
    org_id: someOrgId // ERROR: Cannot change org_id
  })
  .eq('id', postId);
```

## Database Safeguards

### Immutability Trigger

A database trigger (`enforce_immutable_post_fields`) prevents mutation of:
- `type`
- `kind`
- `mode`
- `org_id`
- `user_id`

Any attempt to change these fields after creation will raise an exception.

### RLS Policies

Row Level Security policies enforce:

**Sparks (Public Posts):**
- SELECT: Anyone can view active Sparks
- INSERT: Authenticated users can create Sparks
- UPDATE: Only owner can update content/title
- DELETE: Only owner can delete

**Business Insights:**
- SELECT: Only organization members can view
- INSERT: Only business members in that org can create
- UPDATE: Only owner and org members can update content/title
- DELETE: Only owner can delete

**Relations:**
- SELECT: Can view if you can view either post
- INSERT: Must own one of the posts or be business admin
- DELETE: Must own one of the posts or be business admin

## Architecture Benefits

1. **Type Safety**: Posts maintain their identity throughout their lifecycle
2. **Clear Boundaries**: Public and business content are strictly separated
3. **Audit Trail**: Immutable fields create a clear audit trail
4. **Security**: RLS policies enforce access at the database level
5. **Maintainability**: Single source of truth for post creation and relations
6. **Performance**: Indexed relations table for fast queries

## Migration Path

### From Legacy Code

**Old Way (❌ Don't use):**
```typescript
// Manual payload construction
const payload = {
  user_id: user.id,
  content: content,
  type: 'brainstorm',
  mode: 'public',
  // ... manual field setting
};
```

**New Way (✅ Use this):**
```typescript
import { buildSparkPayload } from '@/lib/posts';

const payload = buildSparkPayload({
  userId: user.id,
  content: content,
  title: title
});
```

### Relation Migration

**Old Way (❌ Don't use):**
```typescript
await supabase
  .from('idea_links') // Legacy table
  .insert({
    source_id: parent.id,
    target_id: child.id,
    source_type: 'brainstorm',
    target_type: 'insight'
  });
```

**New Way (✅ Use this):**
```typescript
import { createPostRelation } from '@/lib/posts';

await createPostRelation({
  parentPostId: parent.id,
  childPostId: child.id,
  relationType: 'origin'
});
```

## Files

### Core Library
- `src/lib/posts/builders.ts` - Canonical post builders
- `src/lib/posts/relations.ts` - Unified relation helpers
- `src/lib/posts/index.ts` - Public API

### Hooks
- `src/hooks/usePosts.ts` - Post CRUD operations
- `src/hooks/usePostRelations.ts` - Relation management

### Components
- `src/components/composer/ComposerModal.tsx` - Post creation UI

### Types
- `src/types/post.ts` - TypeScript definitions

## Testing

### Verify Immutability

```sql
-- This should fail
UPDATE posts 
SET type = 'insight' 
WHERE id = 'some-spark-id';
-- Error: Cannot change post type after creation

-- This should succeed
UPDATE posts 
SET content = 'Updated content' 
WHERE id = 'some-spark-id';
```

### Verify RLS

```sql
-- As public user, should see only public Sparks
SELECT * FROM posts;

-- As business member, should see org insights
SELECT * FROM posts WHERE org_id = 'my-org-id';
```

## Best Practices

1. **Always use builders** - Never construct post payloads manually
2. **Use relation helpers** - Never insert relations directly
3. **Validate payloads** - Use `validatePostPayload()` before insertion
4. **Handle errors** - Builders throw errors for invalid data
5. **Document relations** - Use meaningful relation types
6. **Test RLS** - Verify access control at the database level

## Common Pitfalls

❌ **Don't** try to change post type after creation
❌ **Don't** create posts without canonical builders
❌ **Don't** use legacy tables (idea_links, brainstorms, business_insights)
❌ **Don't** bypass RLS policies
❌ **Don't** create relations without permission checks

✅ **Do** use canonical builders for all posts
✅ **Do** use relation helpers for linking
✅ **Do** only update content and title
✅ **Do** respect the post lifecycle
✅ **Do** leverage RLS for security

## Future Considerations

- Post versioning/history
- Soft delete with status changes
- Post categories/tags via metadata
- Enhanced search with full-text indexing
- Post templates for common patterns
