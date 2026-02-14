/**
 * Pillar #1: Individual Workspace - Type Definitions
 *
 * Chain of Thoughts Model:
 * - Chains break ONLY when user explicitly breaks them
 * - Global feed shows ALL thoughts in strict timestamp order (newest first)
 * - day_key kept for backward compat but NOT used for grouping
 * - In-place edit: edits update the original thought directly
 */

export type ThoughtState = 'active' | 'anchored';

export interface ThoughtEntry {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

/** Chain ID type alias for clarity */
export type ChainId = string;

export interface ThoughtObject {
  id: string;
  user_id: string;
  content: string;
  state: ThoughtState;
  created_at: string;
  updated_at: string;
  /** When the thought was anchored - this is its temporal identity */
  anchored_at?: string | null;
  /** Date key for grouping (YYYY-MM-DD) - derived from anchored_at or created_at */
  day_key: string;
  /** Optional user-provided label (replaces date header in display) */
  display_label?: string | null;
  /** Chain ID this thought belongs to (Pull-the-Thread system) */
  chain_id?: ChainId | null;
  /** Reference to original thought when this is an edit (legacy, kept for DB compat) */
  edited_from_id?: string | null;
}

 /** Feed scope for projection views */
 export type FeedScope = 'global' | 'chain' | 'merged';
 
 /** Chain link for merge relationships */
 export interface ChainLink {
   id: string;
   user_id: string;
   from_chain_id: string;
   to_chain_id: string;
   created_at: string;
 }

export interface WorkspaceState {
  thoughts: ThoughtObject[];
  activeThoughtId: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  /** Pagination: whether more pages exist on server */
  hasMorePages: boolean;
  /** Pagination: cursor for next page (oldest loaded updated_at) */
  oldestLoadedAt: string | null;
}

export interface WorkspaceActions {
  // Core thought operations
  createThought: (dayKey?: string, userId?: string, chainId?: ChainId, focusedChainId?: ChainId | null) => string;
  updateThought: (id: string, content: string) => void;
  anchorThought: (id: string) => void;
  reactivateThought: (id: string) => void;
  cancelEdit: (id: string, originalContent: string) => void;
  deleteThought: (id: string) => void;
  
  // State management
  setActiveThought: (id: string | null) => void;
  setThoughts: (thoughts: ThoughtObject[]) => void;
  setLoading: (loading: boolean) => void;
  setSyncing: (syncing: boolean) => void;
  setLastSynced: (timestamp: string) => void;
  setHasMorePages: (hasMore: boolean) => void;
  setOldestLoadedAt: (cursor: string | null) => void;
  resetStore: () => void;
  
  // Selectors
  getActiveThought: () => ThoughtObject | null;
  getAnchoredThoughts: () => ThoughtObject[];
  getGlobalFeed: () => ThoughtObject[];
  getChainAnchor: (chainId: ChainId) => ThoughtObject | null;
}

export type WorkspaceStore = WorkspaceState & WorkspaceActions;
