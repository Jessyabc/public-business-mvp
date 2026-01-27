
# Think Space: Pull-the-Thread System — Implementation Plan

## Executive Summary

Think Space: Pull-the-Thread System — Implementation Plan
Executive Summary

This plan transforms the existing Think Space from a simple "day-grouped thoughts" system into a continuity-of-thought system with raw chains, merged lenses, and gesture-based threading. The philosophy is preserved: raw chains are the source of truth, merged lenses are views, and user intent drives all structural decisions.

Part 1: System Analysis
Current State Assessment

The existing architecture provides a solid foundation:

Component	Current State	Gap vs Vision
Thoughts	workspace_thoughts table with day_key, state, anchored_at	Missing chain_id — thoughts aren't explicitly linked to chains
Threading	Day-based grouping (getDayThreads())	Implicit by date, not explicit user-defined chains
Relations	post_relations table with hard/soft types	Exists for posts, not for workspace thoughts
Chain Walking	api_space_chain_hard, walkForward(), backtrackToRoot()	Only for public posts, not for private thoughts
Gestures	Tap to write, blur to anchor	Missing: pull-to-break, long-press merge
Search	Posts FTS exists	No thought-specific search
UI	Vertical timeline, day separators	Missing: open circle continuation indicator, thread visualization
Key Entities Identified
┌─────────────────────────────────────────────────────────────────┐
│  THOUGHT (workspace_thoughts)                                    │
│  - id, user_id, content, created_at, anchored_at                │
│  - chain_id (NEW) → links to RAW CHAIN                          │
│  Source of truth is event time (anchored_at/created_at).         │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│  RAW CHAIN (thought_chains - NEW TABLE)                          │
│  - id, user_id, created_at                                       │
│  - first_thought_at → temporal identity                          │
│  - display_label (optional)                                      │
│  Source of truth. Linear. Immutable ownership.                   │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│  MERGED LENS (thought_lenses - NEW TABLE)                        │
│  - id, user_id, created_at, label (optional)                     │
│  A view over multiple raw chains.                                │
│  NOT the source of truth.                                        │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│  LENS MEMBERSHIP (lens_chains - NEW JOIN TABLE)                  │
│  - lens_id, chain_id                                             │
│  Many-to-many: a chain can belong to multiple lenses.            │
└─────────────────────────────────────────────────────────────────┘

Part 2: Edge Cases & Risks
Edge Cases
Scenario	Resolution
Empty chain	Allowed. Represents an intentional break even before the next thought is written. May be collapsed visually. Optional cleanup only if user navigates away and the chain remains empty.
Single-thought chain	Valid — represents an isolated idea
Chain deletion	Only lens associations deleted; raw chain persists
Merge creates duplicate order	Timeline Integrity Rule: global anchored_at sorting across chains with stable tie-breakers (see Part 4)
User closes app mid-gesture	Debounced sync ensures partial state is saved
Offline merging	Queued actions with conflict resolution on reconnect
Gesture Conflicts
Conflict	Resolution
Scroll vs Pull (break chain)	Pull gesture requires: (1) touch on open circle only, (2) drag within bottom 180°, (3) minimum 60px distance with resistance
Tap vs Long-press (merge)	Long-press delay = 500ms; tap triggers continue
Double-tap vs scroll	No double-tap actions to avoid conflict
Right-click context menu	Desktop-only; mobile uses long-press
Performance Concerns
Concern	Mitigation
Merged lens with 10+ chains	Virtual scrolling, paginate to 50 thoughts max per render
Search latency	PostgreSQL full-text search with tsvector index on content
Gesture lag	60fps gesture animations using framer-motion transforms only (no layout changes during drag)
Sync storms	Debounced sync (1500ms), batch upserts
Mobile vs Desktop Differences
Feature	Mobile	Desktop
Break chain	Drag down on circle	Drag down on circle
Merge chains	Long-press (500ms)	Right-click OR click-hold (500ms)
Continue chain	Tap input area	Click input area
Keyboard dismiss	Double-enter on empty OR blur	N/A
Open circle size	48px touch target	32px
Part 3: UX States & Navigation Flows
State Machine
┌─────────────┐
│   IDLE      │◄─────────────────────────────────┐
│ (tap to     │                                   │
│  think)     │                                   │
└──────┬──────┘                                   │
       │ tap canvas / tap "open circle"           │
       ▼                                          │
┌─────────────┐                                   │
│  ACTIVE     │───blur with content──────────────►│ ANCHORED
│  WRITING    │                                   │ (thought
└──────┬──────┘                                   │  added to
       │ pull down on circle                      │  chain)
       ▼                                          │
┌─────────────┐                                   │
│  BREAKING   │───snap complete─────► NEW CHAIN   │
│  CHAIN      │   (next thought                   │
│ (resistance)│    goes to new chain)             │
└──────┬──────┘                                   │
       │ cancel (drag back)                       │
       ▼                                          │
   Back to ACTIVE                                 │
                                                  │
┌─────────────┐                                   │
│ LONG-PRESS  │───select target───► MERGED LENS   │
│  (merge)    │   from search                     │
└─────────────┘                                   │
                                                  │
                          ┌───────────────────────┘
                          │
                          ▼
                    ┌───────────┐
                    │  ANCHORED │
                    │  (chain   │
                    │   grows)  │
                    └───────────┘

View Modes

Raw Chain View (default) — Shows a single chain's thoughts in chronological order

Merged Lens View — Shows multiple chains interleaved by anchored_at (Timeline Integrity)

All Chains View — Sidebar list of all user's chains with previews

(Optional UX weighting) In merged lens view, the UI should communicate that this lens is the user’s current “mental space,” while raw chains remain accessible as origins.

Part 4: Data Structures (High-Level)
New Database Tables
thought_chains
├── id: UUID (PK)
├── user_id: UUID (FK → auth.users)
├── created_at: TIMESTAMPTZ
├── first_thought_at: TIMESTAMPTZ (computed from first thought)
├── display_label: TEXT (optional user title)
└── CONSTRAINT: user_id matches RLS

thought_lenses
├── id: UUID (PK)
├── user_id: UUID (FK → auth.users)
├── created_at: TIMESTAMPTZ
├── label: TEXT (optional; no forced structure at creation)
└── CONSTRAINT: user_id matches RLS

lens_chains (join table)
├── id: UUID (PK)
├── lens_id: UUID (FK → thought_lenses)
├── chain_id: UUID (FK → thought_chains)
├── added_at: TIMESTAMPTZ
└── UNIQUE(lens_id, chain_id)

Modifications to workspace_thoughts
workspace_thoughts (existing)
├── ... existing columns ...
├── chain_id: UUID (FK → thought_chains) [NEW]
└── (No position_in_chain in V1; ordering is event-time-based)

Stable Ordering / Tie-breakers (Timeline Integrity)

Merged lenses must order by:

anchored_at ascending (preferred, if present)

fallback: created_at ascending

tie-breaker: id ascending

(Optional future enhancement: add client_sequence per device/session to stabilize same-timestamp collisions.)

TypeScript Types
interface ThoughtChain {
  id: string;
  user_id: string;
  created_at: string;
  first_thought_at: string;
  display_label: string | null;
  thoughts: ThoughtObject[]; // Populated via join
}

interface ThoughtLens {
  id: string;
  user_id: string;
  created_at: string;
  label: string | null;
  chain_ids: string[]; // References to chains in this lens
}

// Updated ThoughtObject
interface ThoughtObject {
  // ... existing fields ...
  chain_id: string; // NEW - required
}

Part 5: Gesture Handling Logic
Pull-to-Break Gesture
GestureState:
  - startY: number
  - currentY: number
  - resistance: number (0-1)
  - isActive: boolean
  - didSnap: boolean

onTouchStart (on open circle only):
  if (target === openCircle):
    gestureState.startY = touch.clientY
    gestureState.isActive = true

onTouchMove:
  if (!gestureState.isActive) return
  
  deltaY = touch.clientY - gestureState.startY
  
  // Only allow downward drag (break gesture is "pull down")
  if (deltaY > 0 && isWithinBottomHemisphere(touch)):
    // Apply resistance curve: starts easy, gets harder
    resistance = Math.min(1, deltaY / 120)
    visualOffset = easeOutQuad(deltaY, 0, 80, 120)
    
    // Visual feedback: thread stretches
    updateThreadVisual(visualOffset)
    
    // Haptic at threshold
    if (resistance > 0.7 && !didHaptic):
      hapticFeedback('medium')
      didHaptic = true

onTouchEnd:
  if (gestureState.resistance > 0.8):
    // SNAP — create new chain (empty chain allowed)
    hapticFeedback('heavy')
    createNewChain()
  else:
    // Cancel — spring back
    animateSpringBack()
  
  resetGestureState()

Long-Press to Merge
Timer: null
LONG_PRESS_DURATION = 500ms

onTouchStart (on open circle):
  timer = setTimeout(() => {
    hapticFeedback('light')
    openMergeModal()
  }, LONG_PRESS_DURATION)

onTouchMove:
  if (movedMoreThan(10px)):
    clearTimeout(timer) // Abort — user is dragging

onTouchEnd:
  clearTimeout(timer)

Part 6: Search Integration
Search Architecture
┌─────────────────┐     ┌─────────────────┐
│ Search Input    │────►│ Debounce 300ms  │
└─────────────────┘     └────────┬────────┘
                                 │
                                 ▼
                   ┌─────────────────────────┐
                   │ PostgreSQL FTS Query    │
                   │ ts_rank(content, query) │
                   │ + continuity boost      │
                   │ + recency boost         │
                   └────────────┬────────────┘
                                │
                                ▼
                   ┌─────────────────────────┐
                   │ Results:                │
                   │ - Chain previews        │
                   │ - Matching thoughts     │
                   │ - Snippet highlights    │
                   └─────────────────────────┘

Search Ranking Formula
score = ts_rank(content_tsv, plainto_tsquery(input))
      + (chain_thought_count > 3 ? 0.3 : 0)                      -- continuity bonus (recall-friendly)
      + (1 / (1 + EXTRACT(DAY FROM now() - anchored_at))) * 0.2  -- recency

Part 7: Implementation Scope
V1 Scope (Ship First)

Must ship for the system to be functional:

Feature	Priority	Effort
Chain data model	Critical	Medium
Database migration for thought_chains, chain_id column		
Continue chain gesture	Critical	Low
Tap open circle → append thought to current chain		
Break chain gesture	Critical	High
Pull-down gesture with resistance and snap		
Visual thread indicator	Critical	Medium
Open circle at chain end, subtle line connecting thoughts		
Chain-aware writing indicator	High	Low
"Writing to: [chain preview]" shown during active writing		
Basic chain selector	High	Medium
UI to switch between chains (not lenses yet)		
Migration for existing thoughts	Critical	Medium
Assign all current thoughts to a single "legacy" chain per user		
V2 Scope (Can Wait)

Enhances but not required for core experience:

Feature	Priority	Effort
Merged Lens creation	High	High
Long-press → search → merge UI		
Lens view	High	High
Interleaved timeline with Timeline Integrity		
Chain search	Medium	Medium
FTS for finding chains to merge		
Unmerge / lens deletion	Medium	Low
Safe deletion (raw chains preserved)		
Multi-lens membership	Low	Low
Chain can belong to N lenses		
Lens labels & organization	Low	Medium
User-defined lens names and ordering		
(Optional) Ghost interleave preview during merge selection	Low	Medium
Part 8: File Changes Summary
New Files
File	Purpose
src/features/workspace/types/chain.ts	TypeScript types for chains and lenses
src/features/workspace/stores/chainStore.ts	Zustand store for chain state
src/features/workspace/hooks/useChainGestures.ts	Gesture handling for pull-to-break, long-press
src/features/workspace/components/ChainThread.tsx	Visual thread with open circle
src/features/workspace/components/OpenCircle.tsx	Gesture-aware continuation indicator
src/features/workspace/components/MergeModal.tsx	Search and select chains to merge (V2)
supabase/migrations/YYYYMMDD_thought_chains.sql	Database migration for new tables
Modified Files
File	Changes
src/features/workspace/types.ts	Add chain_id to ThoughtObject
src/features/workspace/useWorkspaceStore.ts	Add chain-aware actions: createChain, breakChain, setActiveChain
src/features/workspace/useWorkspaceSync.ts	Sync chains alongside thoughts
src/features/workspace/components/WorkspaceCanvas.tsx	Replace day-based grouping with chain-based
src/features/workspace/components/ThinkingSurface.tsx	Add "Writing to: [chain]" indicator
src/features/workspace/components/ThoughtStack.tsx	Render chains instead of day threads
src/features/workspace/components/AnchoredThought.tsx	Add subtle thread line connector
Part 9: UI Design Principles (Preserved)

The implementation must maintain:

Vertical timeline — Thoughts flow down, newest at top

Visible thread — Subtle line connecting thoughts in a chain

Open circle — Continuation point at chain end (gestures trigger here)

Minimal chrome — No forced titles, categories, or structure

Calm, private, forgiving — No gamification, no pressure

Subtle day separators — Temporal seams (not headers) between days

Visual Specifications
Open Circle:
  - Size: 48px (mobile), 32px (desktop)
  - Color: rgba(72, 159, 227, 0.3) → #489FE3 (PB Blue, faded)
  - Animation: Subtle pulse (1.5s ease-in-out infinite)
  - Position: Centered below last anchored thought

Thread Line:
  - Width: 1px
  - Color: rgba(72, 159, 227, 0.15)
  - Style: Solid (raw chain), Dashed (across chain boundary in lens view)
  - Length: Extends from bottom of one thought to top of next

Part 10: Critical Constraints (Non-Negotiable)

These constraints are locked and must not be simplified away:

Raw thoughts are immutable in ownership — A thought cannot move between chains

Merged chains are views, not containers — Lenses never own thoughts

A raw chain can belong to multiple lenses — Many-to-many relationship

No AI auto-merging or auto-splitting — User gesture = explicit intent

Timeline Integrity — Merged views always sort by global anchored_at with stable tie-breakers

Gesture is the decision — No confirmation modals for break/continue

No forced naming — Lens labels are optional at creation; meaning is allowed to emerge later

This plan provides the complete architectural foundation for the Pull-the-Thread system while preserving the thinking-continuity philosophy. V1 focuses on the raw chain mechanics; V2 adds the lens/merge layer.