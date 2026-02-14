/**
 * Think Space: Pull-the-Thread System - Chain Types
 * 
 * Raw Chains are the source of truth.
 * Merged Lenses are views, not containers.
 * 
 * Timeline Integrity: Merged views sort by global anchored_at with stable tie-breakers.
 */

export type ChainId = string;
export type LensId = string;

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
 * Merged Lens - A view over multiple raw chains
 * NOT the source of truth. Lenses never own thoughts.
 */
export interface ThoughtLens {
  id: LensId;
  user_id: string;
  created_at: string;
  label: string | null; // Optional - meaning can emerge later
  updated_at: string;
  chain_ids: ChainId[]; // Populated from lens_chains join table
}

/**
 * Chain membership in a lens
 */
export interface LensChainMembership {
  id: string;
  lens_id: LensId;
  chain_id: ChainId;
  added_at: string;
}

/**
 * Chain state for UI
 */
export type ChainViewMode = 'raw' | 'lens' | 'all';

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
  lenses: ThoughtLens[];
  activeChainId: ChainId | null;
  pendingChainId: ChainId | null; // Chain created by break gesture, becomes active on first anchor
  activeLensId: LensId | null;
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
  clearPendingChain: () => void; // Clear pending chain (used when activating it)
  
  // Lens operations (V2)
  createLens: (userId: string, chainIds: ChainId[], label?: string | null) => LensId;
  deleteLens: (id: LensId) => void;
  addChainToLens: (lensId: LensId, chainId: ChainId) => void;
  removeChainFromLens: (lensId: LensId, chainId: ChainId) => void;
  setActiveLens: (id: LensId | null) => void;
  
  // View mode
  setViewMode: (mode: ChainViewMode) => void;
  
  // State management
  setChains: (chains: ThoughtChain[]) => void;
  setLenses: (lenses: ThoughtLens[]) => void;
  setLoadingChains: (loading: boolean) => void;
  setSyncingChains: (syncing: boolean) => void;
  resetStore: () => void; // Reset store for auth cleanup
  
  // Selectors
  getActiveChain: () => ThoughtChain | null;
  getActiveLens: () => ThoughtLens | null;
  getChainById: (id: ChainId) => ThoughtChain | null;
  getChainsForLens: (lensId: LensId) => ThoughtChain[];
}

export type ChainStore = ChainState & ChainActions;
