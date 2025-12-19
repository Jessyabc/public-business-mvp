/**
 * Pillar #1: Individual Workspace - Type Definitions
 * 
 * These are THOUGHT objects, not POST objects.
 * No social metrics, no forced structure, no publishing.
 */

export type ThoughtState = 'active' | 'anchored';

export interface ThoughtObject {
  id: string;
  user_id: string;
  content: string;
  state: ThoughtState;
  created_at: string;
  updated_at: string;
  /** When the thought was anchored - this is its temporal identity */
  anchored_at?: string | null;
  /** Optional user-provided label (replaces timestamp in display) */
  display_label?: string | null;
}

export interface WorkspaceState {
  thoughts: ThoughtObject[];
  activeThoughtId: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
}

export interface WorkspaceActions {
  // Core thought operations
  createThought: () => string;
  updateThought: (id: string, content: string) => void;
  anchorThought: (id: string) => void;
  reactivateThought: (id: string) => void;
  deleteThought: (id: string) => void;
  
  // Lineage: cosmetic label (does not affect ordering)
  updateDisplayLabel: (id: string, label: string | null) => void;
  
  // State management
  setActiveThought: (id: string | null) => void;
  setThoughts: (thoughts: ThoughtObject[]) => void;
  setLoading: (loading: boolean) => void;
  setSyncing: (syncing: boolean) => void;
  setLastSynced: (timestamp: string) => void;
  
  // Selectors
  getActiveThought: () => ThoughtObject | null;
  getAnchoredThoughts: () => ThoughtObject[];
}

export type WorkspaceStore = WorkspaceState & WorkspaceActions;
