/**
 * Pillar #1: Individual Workspace - Type Definitions
 * 
 * These are THOUGHT objects, not POST objects.
 * No social metrics, no forced structure, no publishing.
 * 
 * Daily Threading Model:
 * - Each day you write creates a new "day thread"
 * - Thoughts are grouped by day_key (YYYY-MM-DD)
 * - New entries prepend to the day (add from top)
 * - Days are sorted newest first, entries within sorted by created_at desc
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
}

/** A day's worth of thoughts, grouped together */
export interface DayThread {
  day_key: string; // YYYY-MM-DD
  display_label: string | null; // User's custom title, or null to show date
  thoughts: ThoughtObject[]; // Ordered newest first within the day
  earliest_at: string; // First thought of the day
  latest_at: string; // Most recent thought of the day
}

export interface WorkspaceState {
  thoughts: ThoughtObject[];
  activeThoughtId: string | null;
  /** Which day thread is currently being added to (null = new day) */
  activeDayKey: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
}

export interface WorkspaceActions {
  // Core thought operations - userId is optional, passed from auth context
  createThought: (dayKey?: string, userId?: string) => string;
  updateThought: (id: string, content: string) => void;
  anchorThought: (id: string) => void;
  reactivateThought: (id: string) => void;
  deleteThought: (id: string) => void;
  
  // Day thread operations
  setActiveDayKey: (dayKey: string | null) => void;
  updateDayLabel: (dayKey: string, label: string | null) => void;
  
  // State management
  setActiveThought: (id: string | null) => void;
  setThoughts: (thoughts: ThoughtObject[]) => void;
  setLoading: (loading: boolean) => void;
  setSyncing: (syncing: boolean) => void;
  setLastSynced: (timestamp: string) => void;
  
  // Selectors
  getActiveThought: () => ThoughtObject | null;
  getAnchoredThoughts: () => ThoughtObject[];
  getDayThreads: () => DayThread[];
  getDayThread: (dayKey: string) => DayThread | null;
}

export type WorkspaceStore = WorkspaceState & WorkspaceActions;
