# Conflict Resolution Plan for PR #49

## Conflict Analysis

### 1. Modify/Delete Conflicts (2 files)
- `BrainstormFeedRenderer.tsx` - Deleted in main, exists in HEAD
- `useBrainstormGraph.ts` - Deleted in main, exists in HEAD

**Decision:** Keep these files (they're used in HEAD's implementation)

### 2. Content Conflicts (3 files)

#### `BrainstormLayoutShell.tsx`
- **Conflict:** Tab labels
- **HEAD:** "Main Feed"
- **Main:** "Main" + adds "Cross-links" tab
- **Resolution:** Use main's version (more complete)

#### `LinkPicker.tsx`
- **Conflict 1:** Query field - HEAD uses `type = 'brainstorm'`, main uses `kind = 'Spark'`
- **Conflict 2:** Post type mapping - HEAD uses `post.type`, main uses `'Spark'`
- **Resolution:** Use main's version (uses new `kind` field)

#### `BrainstormFeed.tsx`
- **Conflict:** Complete rewrite
- **HEAD:** Uses `BrainstormFeedContent` component with custom implementation
- **Main:** Uses `FeedContainer` with mode props + `CrossLinksFeed`
- **Resolution:** Use main's version (simpler, uses FeedContainer pattern)

## Resolution Steps

1. Keep `BrainstormFeedRenderer.tsx` and `useBrainstormGraph.ts` (mark as resolved)
2. Resolve `BrainstormLayoutShell.tsx` - use main's version
3. Resolve `LinkPicker.tsx` - use main's version  
4. Resolve `BrainstormFeed.tsx` - use main's version

