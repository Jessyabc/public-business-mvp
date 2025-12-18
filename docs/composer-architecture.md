# Composer Architecture

## Overview

The Composer is the post creation interface in Public Business. It is accessible globally via the `+` button in the bottom navigation.

## Core Principle

**The Composer always creates posts. It never creates or modifies workspace thoughts.**

This distinction is critical to maintaining the two-pillar architecture:
- **Think (Workspace)**: Private, non-social, persisted to `workspace_thoughts` table
- **Discuss (Social)**: Public/Business posts, persisted to `posts` table

## Data Model

### What Composer Creates

- **Table**: `posts`
- **Post Types**:
  - Public Spark (`kind: 'brainstorm'`)
  - Business Insight (`kind: 'insight'`)
  - Open Idea (`kind: 'open_idea'` - anonymous only)

### What Composer Does NOT Touch

- **Table**: `workspace_thoughts`
- Workspace thoughts are managed exclusively by the workspace UI
- No "publish thought as post" feature exists (by design)

## Origin Context

### Route-Aware Behavior

The composer detects which route it was opened from:

- **From Workspace (`/`)**: Shows informational banner explaining posts go to Discuss
- **From Discuss (`/discuss`)**: No banner, standard behavior
- **From Other Routes**: No banner

### Context is UI-Only

The route/origin context is **not persisted** to the database. It serves only to:
1. Display contextual UI (banners, tooltips)
2. Set appropriate defaults (lens, post type)

The `posts` table does not store "where was this created from" - only the post content and metadata.

## Implementation Details

### Key Files

- **`/src/components/composer/ComposerModal.tsx`**: Main composer UI
- **`/src/hooks/useComposerStore.ts`**: Composer state management
- **`/src/lib/posts.ts`**: Post payload builders

### State Management

```typescript
interface ComposerStore {
  isOpen: boolean;
  context: ComposerContext | null;
  openComposer: (context?: ComposerContext) => void;
  closeComposer: () => void;
  setContext: (context: ComposerContext | null) => void;
}
```

### Context Object

```typescript
interface ComposerContext {
  parentPostId?: string;           // For continuations
  relationType?: 'continuation' | 'linking';
  originOpenIdeaId?: string;       // If sparked from open idea
}
```

Note: Context does NOT include "route opened from" - that is detected dynamically via `useLocation()`.

## User Experience

### Workspace Context Banner

When opened from workspace:
- Shows soft blue info banner
- Text: "Sharing to Discuss — Posts you create here will appear in the Discuss feed. Your workspace thoughts remain private."
- Dismissible via X button
- Persisted per-session (sessionStorage)

### Tooltip

The `+` button tooltip is route-aware:
- In Workspace: "Share to Discuss"
- In Discuss: "Create post"
- Elsewhere: "Create post"

## Architectural Guarantees

### What Composer CAN Do

✅ Create posts in `posts` table
✅ Link posts via `post_relations` (hard/soft links)
✅ Create posts in Public or Business mode (based on lens)
✅ Attach metadata (origin open idea, tags, etc.)

### What Composer CANNOT Do

❌ Create workspace thoughts
❌ Modify workspace thoughts
❌ Read from workspace_thoughts table
❌ "Publish" a workspace thought as a post
❌ Persist "opened from workspace" to database

## Future Considerations

### Lineage Support

When workspace lineage is implemented (Phase 3+):
- Workspace thoughts will have their own lineage system
- Workspace lineage will be separate from post lineage
- No mixing of workspace and post relations

### Cross-Pillar Actions

The two-pillar model explicitly forbids:
- Publishing workspace thoughts to Discuss
- Importing Discuss posts into Workspace
- Linking workspace thoughts to posts

Each pillar remains sovereign.

## References

- See `/docs/terminology.md` for UI ↔ DB term mapping
- See `/src/features/workspace/` for workspace implementation
- See `/src/pages/Discuss.tsx` for discuss implementation
