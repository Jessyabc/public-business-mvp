 # Think Space: Chain of Thoughts - Implementation Tracker
 
 **Last Updated**: 2026-02-05
 **Status**: In Progress
 
 ---
 
 ## Summary of Latest Changes
 
 ### Current Run (2026-02-05)
 - [ ] Starting implementation
 - [ ] Database migrations pending
 
 ---
 
 ## Phase Completion Status
 
 | Phase | Description | Status | Verified |
 |-------|-------------|--------|----------|
 | 1 | Database migrations (chain_links, edited_from_id, embedding) | 🔄 In Progress | ❌ |
 | 2 | Fix core bug - remove day grouping | ⏳ Pending | ❌ |
 | 3 | Feed scope/projection system (feedStore) | ⏳ Pending | ❌ |
 | 4 | ThinkFeed component | ⏳ Pending | ❌ |
 | 5 | Break gesture correction (horizontal on top) | ⏳ Pending | ❌ |
 | 6 | Continue chain prompt | ⏳ Pending | ❌ |
 | 7 | Copy-on-edit | ⏳ Pending | ❌ |
 | 8 | Realtime sync | ⏳ Pending | ❌ |
 | 9 | Semantic search | ⏳ Pending | ❌ |
 | 10 | Chain linking UI | ⏳ Pending | ❌ |
 
 ---
 
 ## Detailed Task Checklist
 
 ### Phase 1: Database Migrations
 - [ ] Create `chain_links` table
   - [ ] id, user_id, from_chain_id, to_chain_id, created_at
   - [ ] Unique constraint (from_chain_id, to_chain_id)
   - [ ] Check constraint from_chain_id <> to_chain_id
   - [ ] RLS policies
 - [ ] Add `edited_from_id` column to workspace_thoughts
 - [ ] Add `embedding` vector(1536) column to workspace_thoughts
 - [ ] Create IVFFlat index on embedding
 - [ ] Create `search_thoughts` RPC function
 
 ### Phase 2: Fix Core Bug (Remove Day Grouping)
 - [ ] Remove `getDayThreads()` from useWorkspaceStore.ts
 - [ ] Remove `getDayThread()` from useWorkspaceStore.ts
 - [ ] Remove `activeDayKey` state and `setActiveDayKey()` action
 - [ ] Remove `updateDayLabel()` action
 - [ ] Add `getGlobalFeed()` selector
 - [ ] Update types.ts (remove DayThread usage, add edited_from_id)
 
 ### Phase 3: Feed Scope System
 - [ ] Create `stores/feedStore.ts`
 - [ ] Implement FeedScope type ('global' | 'chain' | 'merged')
 - [ ] Implement viewGlobal(), viewChain(), viewMerged() actions
 - [ ] Implement getVisibleThoughts() selector
 - [ ] Implement scroll anchor preservation
 
 ### Phase 4: ThinkFeed Component
 - [ ] Create `components/ThinkFeed.tsx`
 - [ ] Create `components/ChainBreakMarker.tsx` (anchor-based)
 - [ ] Create `components/LinkIndicator.tsx`
 - [ ] Create `components/ThoughtCard.tsx` (repurpose AnchoredThought)
 - [ ] Implement vertical continuity line
 - [ ] Implement scope transitions (fade/reflow)
 - [ ] Delete/deprecate DayThread.tsx, ThoughtStack.tsx, DaysList.tsx
 
 ### Phase 5: Break Gesture Correction
 - [ ] Modify useChainGestures.ts for horizontal pull
 - [ ] Update OpenCircle.tsx position and visuals
 - [ ] Move break control to TOP near writer input
 - [ ] Update WorkspaceCanvas.tsx layout
 
 ### Phase 6: Continue Chain Prompt
 - [ ] Create `components/ContinuePrompt.tsx`
 - [ ] Implement 30-minute inactivity detection
 - [ ] Non-blocking visual hint near input
 
 ### Phase 7: Copy-on-Edit
 - [ ] Add `editThought()` action to useWorkspaceStore.ts
 - [ ] Modify ThinkingSurface.tsx to use editThought
 - [ ] Ensure original thought remains visible
 - [ ] Edited thought appears at top with new timestamp
 
 ### Phase 8: Realtime Sync
 - [ ] Create `hooks/useRealtimeSync.ts`
 - [ ] Subscribe to workspace_thoughts changes
 - [ ] Subscribe to thought_chains changes
 - [ ] Subscribe to chain_links changes
 - [ ] Implement reconciliation logic
 
 ### Phase 9: Semantic Search
 - [ ] Create `supabase/functions/embed-thought/index.ts`
 - [ ] Create `hooks/useThoughtSearch.ts`
 - [ ] Create `components/SearchInline.tsx`
 - [ ] Configure OPENAI_API_KEY secret
 
 ### Phase 10: Chain Linking UI
 - [ ] Create `components/LinkPanel.tsx`
 - [ ] Implement inline panel (not modal)
 - [ ] Create links in chain_links table
 
 ---
 
 ## Files Modified
 
 | File | Action | Status |
 |------|--------|--------|
 | useWorkspaceStore.ts | Modify | ⏳ |
 | types.ts | Modify | ⏳ |
 | types/chain.ts | Modify | ⏳ |
 | useChainGestures.ts | Modify | ⏳ |
 | OpenCircle.tsx | Modify | ⏳ |
 | WorkspaceCanvas.tsx | Modify | ⏳ |
 | ThinkingSurface.tsx | Modify | ⏳ |
 | AnchoredThought.tsx | Repurpose | ⏳ |
 | useWorkspaceSync.ts | Modify | ⏳ |
 | useChainSync.ts | Modify | ⏳ |
 
 ## Files Created
 
 | File | Purpose | Status |
 |------|---------|--------|
 | stores/feedStore.ts | Scope/projection state | ⏳ |
 | components/ThinkFeed.tsx | Main feed renderer | ⏳ |
 | components/ChainBreakMarker.tsx | Anchor marker | ⏳ |
 | components/LinkIndicator.tsx | Merge indicator | ⏳ |
 | components/ContinuePrompt.tsx | Long pause hint | ⏳ |
 | components/SearchInline.tsx | Inline search UI | ⏳ |
 | components/LinkPanel.tsx | Chain linking panel | ⏳ |
 | hooks/useRealtimeSync.ts | Realtime subscriptions | ⏳ |
 | hooks/useThoughtSearch.ts | Semantic search hook | ⏳ |
 | supabase/functions/embed-thought/index.ts | Embedding generation | ⏳ |
 
 ## Files Deleted/Deprecated
 
 | File | Reason | Status |
 |------|--------|--------|
 | DayThread.tsx | No day grouping | ⏳ |
 | ThoughtStack.tsx | Replaced by ThinkFeed | ⏳ |
 | DaysList.tsx | No longer needed | ⏳ |
 
 ---
 
 ## Verification Tests
 
 | Test | Description | Passed |
 |------|-------------|--------|
 | Chain continuity | Chains don't break at day boundaries | ❌ |
 | Horizontal break | Pull left/right on + creates new chain | ❌ |
 | Global feed | All thoughts in timestamp order | ❌ |
 | Scope transitions | Subtle fade/reflow, no navigation | ❌ |
 | Copy-on-edit | Original preserved, new thought at top | ❌ |
 | Realtime sync | Changes reflect across devices | ❌ |
 | Semantic search | Vector similarity returns relevant thoughts | ❌ |
 
 ---
 
 ## Critical Invariants Checklist
 
 - [ ] Chains break ONLY when user explicitly breaks them
 - [ ] UI is strictly time-ordered in global view
 - [ ] Server is single source of truth
 - [ ] Copy-on-edit creates new thought, original preserved
 - [ ] All RLS policies enforce user_id = auth.uid()
 - [ ] "NEW CHAIN" markers are anchor-based, not adjacency-based
 
 ---
 
 ## Notes
 
 ### Run 1 (2026-02-05)
 - Starting implementation
 - Reading existing codebase structure
 - Planning database migrations