# Think Space: Chain of Thoughts - Refactored Implementation Plan

## Executive Summary

This plan addresses the core bug where chains implicitly break at day boundaries (via `day_key` grouping in `getDayThreads()`) and implements the full "Chain of Thoughts" vision: a single continuous feed surface with three projection views (global/chain/merged), explicit-only chain breaks via horizontal pull gesture on the TOP “+” control, copy-on-edit, realtime sync, and semantic search — all while keeping transitions subtle and same-surface (no navigation, no modals).

---

## Current State Analysis

### Existing Infrastructure (What We Keep)

* **Database Tables**: `workspace_thoughts`, `thought_chains`, `thought_lenses`, `lens_chains`, `user_settings` all exist with proper FKs
* **Chain Store**: `chainStore.ts` handles chain CRUD with divergence tracking (`diverged_from_chain_id`, `diverged_at_thought_id`)
* **Sync**: `useChainSync.ts` and `useWorkspaceSync.ts` persist to Supabase
* **Gestures**: `useChainGestures.ts` exists (currently bottom-180° pull)
* **pgvector**: Installed (v0.8.0) - ready for semantic search
* **Active Chain Persistence**: Already persisted to `user_settings.active_chain_id`

### The Core Bug

In `useWorkspaceStore.ts`, line 243-285, `getDayThreads()` groups thoughts by `day_key` (YYYY-MM-DD), creating implicit chain breaks at midnight. This violates the invariant: **chains break ONLY when the user explicitly breaks them**.

### Missing Infrastructure

1. `chain_links` table (for merge relationships) - **does not exist**
2. `edited_from_id` column on `workspace_thoughts` - **does not exist**
3. `embedding` vector column on `workspace_thoughts` - **does not exist**
4. Realtime subscriptions - **not implemented**
5. Horizontal break gesture on TOP “+” - **not implemented** (current is bottom/vertical)
6. Feed scope/projection system - **not implemented**
7. Correct “NEW CHAIN” marker logic (must not be inferred from adjacent differing `chain_id` in a global time-ordered feed)

---

## Database Changes

### 1. New Table: `chain_links`

```text
Purpose: Store directional merge relationships between chains (1-hop contextual merge-set)
```

| Column        | Type        | Constraints                                      |
| ------------- | ----------- | ------------------------------------------------ |
| id            | uuid        | PK, default gen_random_uuid()                    |
| user_id       | uuid        | NOT NULL, FK to auth.users ON DELETE CASCADE     |
| from_chain_id | uuid        | NOT NULL, FK to thought_chains ON DELETE CASCADE |
| to_chain_id   | uuid        | NOT NULL, FK to thought_chains ON DELETE CASCADE |
| created_at    | timestamptz | NOT NULL, default now()                          |

Indexes: `user_id`, `from_chain_id`, `to_chain_id`
Unique constraint: `(from_chain_id, to_chain_id)`
Check constraint: `from_chain_id <> to_chain_id`

RLS: Enable + policies for users to manage only their own rows.

### 2. New Columns on `workspace_thoughts`

| Column         | Type         | Purpose                                                   |
| -------------- | ------------ | --------------------------------------------------------- |
| edited_from_id | uuid         | FK to workspace_thoughts(id), tracks copy-on-edit lineage |
| embedding      | vector(1536) | pgvector storage for semantic search                      |

Index: IVFFlat on `embedding` with cosine ops.

### 3. RPC Function for Semantic Search

```sql
CREATE FUNCTION search_thoughts(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 20
) RETURNS SETOF workspace_thoughts
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT * FROM workspace_thoughts
  WHERE user_id = auth.uid()
  AND state = 'anchored'
  AND embedding IS NOT NULL
  AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
```

---

## Implementation Steps

### Phase 1: Fix Core Bug (Remove Day Grouping)

**File: `src/features/workspace/types.ts`**

Changes:

* Remove `DayThread` interface usage
* Keep `ThoughtObject` as-is (day_key remains for backward compat but is no longer used for grouping)

**File: `src/features/workspace/useWorkspaceStore.ts`**

Changes:

* Remove `getDayThreads()` function (lines 243-285)
* Remove `getDayThread()` function (lines 287-290)
* Add new selector `getGlobalFeed()`:

```typescript
getGlobalFeed: () => {
  const { thoughts } = get();
  return thoughts
    .filter((t) => t.state === 'anchored')
    .sort((a, b) => {
      const timeA = new Date(a.anchored_at || a.created_at).getTime();
      const timeB = new Date(b.anchored_at || b.created_at).getTime();
      return timeB - timeA; // Newest first
    });
}
```

* Keep `getAnchoredThoughts()` (already correct)
* Remove `activeDayKey` state and `setActiveDayKey()` action (no longer needed)
* Remove `updateDayLabel()` action (chain titles replace this)

---

### Phase 2: Feed Scope/Projection System

**New File: `src/features/workspace/stores/feedStore.ts`**

```typescript
type FeedScope = 'global' | 'chain' | 'merged';

interface FeedStore {
  scope: FeedScope;
  focusedChainId: string | null;
  scrollAnchor: { thoughtId: string; offset: number } | null;

  // Actions
  viewGlobal: () => void;
  viewChain: (chainId: string) => void;
  viewMerged: (chainId: string) => void;
  saveScrollAnchor: (thoughtId: string, offset: number) => void;

  // Computed
  getVisibleThoughts: (allThoughts: ThoughtObject[], chainLinks: ChainLink[]) => ThoughtObject[];
}
```

Key logic for `getVisibleThoughts`:

* `global`: return all thoughts
* `chain`: filter to `chain_id === focusedChainId`
* `merged`: compute 1-hop merge-set from `chain_links` where `from_chain_id === focusedChainId OR to_chain_id === focusedChainId`, include the focused chain itself, then filter thoughts to that set

Notes:

* Merged view is contextual (1-hop), not transitive closure.
* Scroll anchor should restore by thought id + offset (not raw scrollTop), to remain stable under realtime inserts.

---

### Phase 3: New Feed Renderer (Replace Day-Based UI)

**Delete/Deprecate (Deprecate first; delete only if no imports remain):**

* `DayThread.tsx` - no longer needed
* `ThoughtStack.tsx` - replace with `ThinkFeed.tsx`
* `DaysList.tsx` - no longer needed

**New File: `src/features/workspace/components/ThinkFeed.tsx`**

Single continuous feed that:

1. Receives global thoughts list (time-ordered, newest first)
2. Uses `feedStore` to get visible subset based on current scope
3. Renders vertical continuity line in center **only between adjacent items that share the same `chain_id`**
4. Renders **“NEW CHAIN” markers only for chain anchor thoughts** (not inferred from adjacency)

Important correction:

* In a global time-ordered feed, adjacent thoughts frequently belong to different chains; that is NOT a chain break. Therefore:

  * **Do NOT render “NEW CHAIN” when adjacent items have different `chain_id`.**
  * Render “NEW CHAIN” only at the first (anchor) thought of a chain.

Anchor detection strategy:

* Prefer an explicit `first_thought_id` on `thought_chains` if available.
* Otherwise compute per chain: earliest `anchored_at || created_at` thought id (memoized selector) and treat that as anchor.

5. Shows chain title on left side at chain anchors (editable, defaults to first thought’s timestamp)
6. Shows "||" link indicator for chains with links

Component structure:

```text
ThinkFeed
├── FeedScopeIndicator (subtle breadcrumb: Global > Chain > Merged)
├── FeedItems
│   └── for each thought:
│       ├── ContinuityLine (if same chain as next visible thought)
│       ├── ChainStartMarker (if this thought is anchor of its chain)
│       └── ThoughtCard (adapted from AnchoredThought)
```

Transitions:

* Use Framer Motion for subtle fade/reflow when scope changes.
* Same scroll container, same background, no navigation, no modal.

**New File: `src/features/workspace/components/ChainBreakMarker.tsx`** (rename acceptable to `ChainStartMarker.tsx` if preferred)

* Broken line visual + "NEW CHAIN" label (subtle)
* Editable chain title on left
* Default title: formatted timestamp of first thought in chain

**New File: `src/features/workspace/components/LinkIndicator.tsx`**

* Visual "||" (two parallel subtle lines)
* Tap enters merged view

---

### Phase 4: Break Gesture Correction

**Current Problem:** `OpenCircle.tsx` and `useChainGestures.ts` implement vertical (bottom 180°) pull

**Solution:** Change to horizontal (left/right) pull on the TOP “+” control near writer input

**File: `src/features/workspace/hooks/useChainGestures.ts`**

Modify to:

* Track horizontal delta (`deltaX`) instead of vertical (`deltaY`)
* Snap threshold: 60px horizontal movement
* Remove `isWithinBottomHemisphere()` check
* Update resistance calculation for horizontal pull

**File: `src/features/workspace/components/OpenCircle.tsx`**

Modify to:

* Remove vertical pull visual (thread stretch)
* Add horizontal pull visual (stretch left/right)
* Update hint text: "Pull ← or → to break"

**File: `src/features/workspace/components/WorkspaceCanvas.tsx`**

Move break control to TOP:

* Position `OpenCircle` under/near the writer input area
* Remove bottom positioning from `ThoughtStack` (since it’s replaced)

Behavior on snap:

* Create a new chain
* Update `user_settings.active_chain_id` to the new chain
* Next thought anchors into that new chain

---

### Phase 5: Continue Chain Prompt (Non-Blocking)

**New File: `src/features/workspace/components/ContinuePrompt.tsx`**

* Track last anchored thought timestamp from **active chain**
* After 30 minutes of inactivity, show subtle visual hint: "Continue this chain?"
* Non-modal, non-blocking (user can ignore; thought continues same chain)
* Disappears on next thought submission
* Positioned near input area

---

### Phase 6: Copy-on-Edit (Immutable History)

**File: `src/features/workspace/useWorkspaceStore.ts`**

Add new action `editThought`:

```typescript
editThought: (id: string, newContent: string) => {
  const original = get().thoughts.find(t => t.id === id);
  if (!original || original.content === newContent) return null;

  const now = new Date().toISOString();

  const editedThought: ThoughtObject = {
    id: generateId(),
    user_id: original.user_id,
    content: newContent,
    state: 'anchored',
    created_at: now,
    updated_at: now,
    anchored_at: now, // NEW timestamp so it becomes most recent
    day_key: getTodayKey(), // backward compat only; not used for grouping
    chain_id: original.chain_id, // Same chain
    edited_from_id: id, // Reference to original
  };

  set(state => ({
    thoughts: [editedThought, ...state.thoughts]
  }));

  return editedThought.id;
}
```

**File: `src/features/workspace/types.ts`**

Add to `ThoughtObject`:

```typescript
edited_from_id?: string | null;
```

**UI Changes:**

* `ThinkingSurface.tsx`: When editing existing thought, call `editThought()` instead of `updateThought()` if content changed
* Original thought remains visible in feed
* Edited thought appears at top (most recent)

---

### Phase 7: Realtime Subscriptions

**New File: `src/features/workspace/hooks/useRealtimeSync.ts`**

```typescript
export function useRealtimeSync() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('workspace-realtime')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'workspace_thoughts', filter: `user_id=eq.${user.id}` },
        handleThoughtInsert
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'workspace_thoughts', filter: `user_id=eq.${user.id}` },
        handleThoughtUpdate
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'workspace_thoughts', filter: `user_id=eq.${user.id}` },
        handleThoughtDelete
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'thought_chains', filter: `user_id=eq.${user.id}` },
        handleChainChange
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'chain_links', filter: `user_id=eq.${user.id}` },
        handleLinkChange
      )
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [user?.id]);
}
```

Reconciliation:

* Server is authoritative.
* Deduplicate optimistic inserts by id.
* Prefer server `anchored_at` for ordering.

**Offline Behavior:**

* Queue writes in local store, replay on reconnect.
* Offline edits create new nodes and should appear according to edit-time (`anchored_at`).

---

### Phase 8: Semantic Search

**New Edge Function: `supabase/functions/embed-thought/index.ts`**

Implementation note (sturdier approach):

* Do not rely on implicit “triggers” unless they already exist in this codebase.
* Generate/store embeddings as an explicit async step after insert/update, via edge function invocation.

Responsibilities:

1. Accept `{ text, mode }` (mode = 'thought' or 'query')
2. Generate embedding via OpenAI API
3. If mode='thought' and thoughtId provided, update `workspace_thoughts.embedding`
4. If mode='query', return embedding only

**New File: `src/features/workspace/hooks/useThoughtSearch.ts`**

```typescript
const searchThoughts = async (query: string) => {
  const { data: embedData } = await supabase.functions.invoke('embed-thought', {
    body: { text: query, mode: 'query' }
  });

  const { data } = await supabase.rpc('search_thoughts', {
    query_embedding: embedData.embedding,
    match_threshold: 0.7,
    match_count: 20
  });

  return data;
};
```

**New File: `src/features/workspace/components/SearchInline.tsx`**

* Inline search UI (slides down from top or sits under input)
* NOT a modal
* Results show: chain title + timestamp + thought preview
* Tap result focuses that chain (viewChain)

---

### Phase 9: Chain Linking UI (Inline, Not Modal)

**New File: `src/features/workspace/components/LinkPanel.tsx`**

* Inline panel/drawer (same feed surface)
* Triggered by long-press/right-click on "||" or action in chain header
* Lists user's chains (by title/date)
* Select chains to link (creates rows in `chain_links`)
* Fade in/out via subtle animation

Merge-set rules:

* 1-hop contextual: include chains where link touches the focused chain (incoming or outgoing).

---

## File Changes Summary

### Files to Modify

| File                   | Changes                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| `useWorkspaceStore.ts` | Remove `getDayThreads`, `getDayThread`, `activeDayKey`, `updateDayLabel`. Add `getGlobalFeed`, `editThought`. |
| `types.ts`             | Remove `DayThread` usage. Add `edited_from_id` to `ThoughtObject`.                                            |
| `useChainGestures.ts`  | Change from vertical/bottom to horizontal pull gesture on TOP “+”.                                            |
| `OpenCircle.tsx`       | Update visuals for horizontal pull, remove thread stretch.                                                    |
| `WorkspaceCanvas.tsx`  | Replace `ThoughtStack` with `ThinkFeed`, move break control to top.                                           |
| `ThinkingSurface.tsx`  | Use `editThought` for content changes on existing thoughts.                                                   |
| `AnchoredThought.tsx`  | Repurpose as `ThoughtCard` inside new feed.                                                                   |
| `useWorkspaceSync.ts`  | Remove `day_key` grouping assumptions; integrate realtime.                                                    |
| `useChainSync.ts`      | Add realtime subscription for chains.                                                                         |

### Files to Delete/Deprecate

| File               | Reason                    |
| ------------------ | ------------------------- |
| `DayThread.tsx`    | No longer grouping by day |
| `ThoughtStack.tsx` | Replaced by ThinkFeed     |
| `DaysList.tsx`     | No longer needed          |

### Files to Create

| File                                        | Purpose                                   |   |                   |
| ------------------------------------------- | ----------------------------------------- | - | ----------------- |
| `stores/feedStore.ts`                       | Scope/projection state management         |   |                   |
| `components/ThinkFeed.tsx`                  | Main continuous feed renderer             |   |                   |
| `components/ChainBreakMarker.tsx`           | Chain anchor marker (“NEW CHAIN”) + title |   |                   |
| `components/LinkIndicator.tsx`              | "                                         |   | " merge indicator |
| `components/ContinuePrompt.tsx`             | Long pause hint                           |   |                   |
| `components/SearchInline.tsx`               | Inline semantic search UI                 |   |                   |
| `components/LinkPanel.tsx`                  | Inline chain linking panel                |   |                   |
| `hooks/useRealtimeSync.ts`                  | Realtime subscriptions                    |   |                   |
| `hooks/useThoughtSearch.ts`                 | Semantic search hook                      |   |                   |
| `supabase/functions/embed-thought/index.ts` | Embedding generation                      |   |                   |

---

## Migration Path

### Database Migration Order

1. Create `chain_links` table + RLS (+ self-link check constraint)
2. Add `edited_from_id` column to `workspace_thoughts`
3. Add `embedding` column to `workspace_thoughts`
4. Create IVFFlat index on `embedding`
5. Create `search_thoughts` RPC function

### Code Deployment Order

1. Deploy database migrations
2. Deploy edge function `embed-thought`
3. Deploy updated store logic (remove day grouping)
4. Deploy new feed components (anchor-based “NEW CHAIN” markers)
5. Deploy gesture changes (top + horizontal pull)
6. Deploy realtime sync (dedupe + event-specific handlers)
7. Deploy search UI

---

## UI/UX Specifications

### Transitions (Subtle, Same-Surface Feel)

* **Global → Chain**: Fade out non-matching thoughts (0.3s), reflow remaining
* **Chain → Merged**: Same subtle fade/reflow
* **Exit to Global**: Reverse, restore scroll position from anchor

All transitions use Framer Motion with easeOut timing, no bounce.

### Continuity Line

* 2px wide, centered vertically
* Color: `rgba(72, 159, 227, 0.15)` (PB Blue at 15%)
* Connects adjacent visible thoughts in the same chain
* In global view this will be intermittent (truthful interleaving); in chain view it becomes continuous

### Chain Break Marker (Anchor-Based)

* Broken line segment + "NEW CHAIN" label (subtle, small)
* Chain title on left, editable
* Rendered only at the chain’s anchor thought (first thought)
* Default: `format(firstThoughtTimestamp, 'MMM d, h:mm a')`

### Link Indicator "||"

* Two parallel lines, subtle PB Blue
* Appears on chains that have links
* Tap enters merged view

---

## Technical Invariants Enforced

1. **No implicit chain breaks**: Removed all day_key grouping logic
2. **Timestamp honesty**: Global feed always strictly time-ordered by `anchored_at`
3. **Server authority**: Realtime subscriptions + reconciliation + dedupe
4. **Immutable edits**: Copy-on-edit creates new thought node, original preserved
5. **User data isolation**: All RLS policies enforce `user_id = auth.uid()`
6. **Correct NEW CHAIN markers**: Anchor-based, not adjacency-based

---

## Estimated Implementation Effort

| Phase                                             | Complexity | Est. Time |
| ------------------------------------------------- | ---------- | --------- |
| 1. Fix Core Bug                                   | Low        | 1 hour    |
| 2. Feed Scope System                              | Medium     | 2 hours   |
| 3. New Feed Renderer (anchor logic + transitions) | High       | 3-4 hours |
| 4. Gesture Correction                             | Medium     | 1-2 hours |
| 5. Continue Prompt                                | Low        | 30 min    |
| 6. Copy-on-Edit                                   | Medium     | 1 hour    |
| 7. Realtime Sync (dedupe + reconciliation)        | Medium     | 2 hours   |
| 8. Semantic Search (embeddings + RPC + inline UI) | High       | 3 hours   |
| 9. Chain Linking UI (inline panel)                | Medium     | 2 hours   |

**Total: ~16-18 hours**
make yourself a document to keep track of all the changes you make and ensure you checkmark everything you complete with the tests you made to ensure the changes are actually working, in addition, ensure that every run shows a summary in that document of the latest changes for you to be able to refer to that document when we continue with further phases after runs. keep the bigger picture in mind always. 
