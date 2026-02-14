/**
 * Think Space: Pull-the-Thread System - Chain Types
 * 
 * Raw Chains are the source of truth.
 * Timeline Integrity: Merged views sort by global anchored_at with stable tie-breakers.
 */

export type ChainId = string;

/**
 * Raw Chain - Source of truth for a sequence of thoughts
 * Linear in time. Immutable ownership.
 */
export interface ThoughtChain {
  id: ChainId;
  user_id: string;
  created_at: string;
  first_thought_at: string | null;
  display_label: string | null;
  updated_at: string;
  /** ID of chain this was diverged from (break point origin) */
  diverged_from_chain_id?: ChainId | null;
  /** ID of thought where the break occurred */
  diverged_at_thought_id?: string | null;
}

/**
 * Chain state for UI
 */
export type ChainViewMode = 'raw' | 'all';

/**
 * Gesture states for omnidirectional pull-to-break interaction
 */
export interface PullGestureState {
  isActive: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  /** Normalized distance 0-1 from center to threshold */
  resistance: number;
  didSnap: boolean;
  didHaptic: boolean;
  /** Angle in radians from start point */
  angle: number;
  /** Legacy compat */
  direction: 'left' | 'right' | null;
}

/**
 * Chain store state
 */
export interface ChainState {
  chains: ThoughtChain[];
  activeChainId: ChainId | null;
  pendingChainId: ChainId | null;
  viewMode: ChainViewMode;
  isLoadingChains: boolean;
  isSyncingChains: boolean;
}

/**
 * Chain store actions
 */
export interface ChainActions {
  // Chain operations
  createChain: (userId: string) => ChainId;
  deleteChain: (id: ChainId) => void;
  updateChainLabel: (id: ChainId, label: string | null) => void;
  setActiveChain: (id: ChainId | null) => void;
  
  // Break chain gesture result - includes divergence tracking
  breakChain: (userId: string, fromChainId?: ChainId | null, atThoughtId?: string | null) => ChainId;
  clearPendingChain: () => void;
  
  // View mode
  setViewMode: (mode: ChainViewMode) => void;
  
  // State management
  setChains: (chains: ThoughtChain[]) => void;
  setLoadingChains: (loading: boolean) => void;
  setSyncingChains: (syncing: boolean) => void;
  resetStore: () => void;
  
  // Selectors
  getActiveChain: () => ThoughtChain | null;
  getChainById: (id: ChainId) => ThoughtChain | null;
}

export type ChainStore = ChainState & ChainActions;
