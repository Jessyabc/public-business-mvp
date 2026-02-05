/**
 * Pillar #1: Individual Workspace - Zustand Store
 *
 * Chain of Thoughts - Pure cognitive state management.
 * 
 * Key invariants:
 * - Chains break ONLY when user explicitly breaks them
 * - Global feed is strictly time-ordered (newest first)
 * - Copy-on-edit: edits create new thoughts, original preserved
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
 import type { WorkspaceStore, ThoughtObject, ChainId } from './types';
import { format, parseISO } from 'date-fns';
import { useChainStore } from './stores/chainStore';

const generateId = () => crypto.randomUUID();

/** Get day key from ISO date string */
const getDayKey = (isoString: string): string => {
  return format(parseISO(isoString), 'yyyy-MM-dd');
};

/** Get today's day key */
const getTodayKey = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set, get) => ({
      // Initial state
      thoughts: [],
      activeThoughtId: null,
      isLoading: false,
      isSyncing: false,
      lastSyncedAt: null,

      // Create a new thought, optionally for a specific day
      createThought: (dayKey?: string, userId?: string, chainId?: ChainId) => {
        const id = generateId();
        const now = new Date().toISOString();
         // day_key kept for backward compat only
         const targetDayKey = dayKey || getTodayKey();
        
        // Ensure day_key is in correct format (YYYY-MM-DD)
        const normalizedDayKey = targetDayKey.includes('T') 
          ? getDayKey(targetDayKey) 
          : targetDayKey;
        
        // Get chain from chain store if not provided
        // Priority: 1) provided chainId, 2) pendingChainId (from break gesture), 3) activeChainId
        const chainStore = useChainStore.getState();
        const pendingChainId = chainStore.pendingChainId;
        const activeChainId = chainStore.activeChainId;
        
        // Use pending chain if it exists (from break gesture), otherwise use active or provided
        let finalChainId: ChainId | null = chainId || pendingChainId || activeChainId;
        
        // If no chain and user exists, create one
        if (!finalChainId && userId) {
          finalChainId = chainStore.createChain(userId);
        }
        
        const newThought: ThoughtObject = {
          id,
          user_id: userId || '', // Set from auth context, fallback empty
          content: '',
          state: 'active',
          created_at: now,
          updated_at: now,
          day_key: normalizedDayKey,
          chain_id: finalChainId, // Assign to active chain
        };
        
        set((state) => ({
          thoughts: [newThought, ...state.thoughts],
          activeThoughtId: id,
        }));
        
        return id;
      },

      // Update thought content (for auto-save)
      updateThought: (id, content) => {
        set((state) => ({
          thoughts: state.thoughts.map((t) =>
            t.id === id
              ? { ...t, content, updated_at: new Date().toISOString() }
              : t
          ),
        }));
      },

      // Anchor a thought (implicit transition, not "save" or "submit")
      anchorThought: (id) => {
        const now = new Date().toISOString();
        
        // Get the thought before updating to check its chain_id
        const thought = get().thoughts.find(t => t.id === id);
        const thoughtChainId = thought?.chain_id;
        
        set((state) => ({
          thoughts: state.thoughts.map((t) =>
            t.id === id
              ? { 
                  ...t, 
                  state: 'anchored', 
                  anchored_at: now, 
                  updated_at: now,
                   day_key: getDayKey(now),
                }
              : t
          ),
          activeThoughtId: state.activeThoughtId === id ? null : state.activeThoughtId,
        }));
        
        // If this thought belongs to the pending chain, activate it
        const chainStore = useChainStore.getState();
        if (thoughtChainId && chainStore.pendingChainId === thoughtChainId) {
          // Activate the pending chain and clear pending status
          chainStore.setActiveChain(thoughtChainId);
          chainStore.clearPendingChain();
        }
      },

      // Reactivate an anchored thought for continued thinking
      // IMPORTANT: Rule 6 - opening old thought places user in that chain
      reactivateThought: (id) => {
        const thought = get().thoughts.find(t => t.id === id);
        
        // Re-anchor to the thought's chain (V1 Rule 6)
        if (thought?.chain_id) {
          const chainStore = useChainStore.getState();
          chainStore.setActiveChain(thought.chain_id);
        }
        
        set((state) => ({
          thoughts: state.thoughts.map((t) =>
            t.id === id
              ? { ...t, state: 'active', updated_at: new Date().toISOString() }
              : t
          ),
          activeThoughtId: id,
        }));
      },

      // Cancel edit: restore thought to anchored state without updating timestamps
      cancelEdit: (id, originalContent) => {
        set((state) => ({
          thoughts: state.thoughts.map((t) =>
            t.id === id
              ? { 
                  ...t, 
                  content: originalContent,
                  state: 'anchored',
                  // Don't update updated_at, anchored_at, or day_key - keep original values
                }
              : t
          ),
          activeThoughtId: state.activeThoughtId === id ? null : state.activeThoughtId,
        }));
      },

      // Delete a thought (also marks it for deletion from Supabase)
      deleteThought: (id) => {
        // Get the thought before removing it so we can delete from Supabase
        const thoughtToDelete = get().thoughts.find(t => t.id === id);
        
        set((state) => ({
          thoughts: state.thoughts.filter((t) => t.id !== id),
          activeThoughtId: state.activeThoughtId === id ? null : state.activeThoughtId,
        }));
        
        // Return the deleted thought ID for sync handling
        return thoughtToDelete?.id ?? null;
      },

       // Copy-on-edit: creates new thought referencing original
       editThought: (id, newContent, userId) => {
         const original = get().thoughts.find(t => t.id === id);
         if (!original || original.content === newContent) return null;
 
         const now = new Date().toISOString();
         const editedId = generateId();
 
         const editedThought: ThoughtObject = {
           id: editedId,
           user_id: userId || original.user_id,
           content: newContent,
           state: 'anchored',
           created_at: now,
           updated_at: now,
           anchored_at: now,
           day_key: getDayKey(now),
           chain_id: original.chain_id,
           edited_from_id: id,
         };
 
         set(state => ({
           thoughts: [editedThought, ...state.thoughts],
           activeThoughtId: null,
         }));
 
         return editedId;
       },

      // State setters
      setActiveThought: (id) => set({ activeThoughtId: id }),
      setThoughts: (thoughts) => set({ thoughts }),
      setLoading: (isLoading) => set({ isLoading }),
      setSyncing: (isSyncing) => set({ isSyncing }),
      setLastSynced: (lastSyncedAt) => set({ lastSyncedAt }),

      // Reset store (for auth cleanup)
      resetStore: () => {
        set({
          thoughts: [],
          activeThoughtId: null,
          isLoading: false,
          isSyncing: false,
          lastSyncedAt: null,
        });
      },

      // Selectors
      getActiveThought: () => {
        const { thoughts, activeThoughtId } = get();
        return thoughts.find((t) => t.id === activeThoughtId) ?? null;
      },

      getAnchoredThoughts: () => {
        const { thoughts } = get();
        return thoughts
          .filter((t) => t.state === 'anchored')
          .sort((a, b) => {
            const timeA = a.anchored_at || a.created_at;
            const timeB = b.anchored_at || b.created_at;
            return new Date(timeB).getTime() - new Date(timeA).getTime();
          });
      },

       // Get ALL anchored thoughts in strict timestamp order (newest first)
       getGlobalFeed: () => {
        const { thoughts } = get();
         return thoughts
           .filter((t) => t.state === 'anchored')
           .sort((a, b) => {
             const timeA = new Date(a.anchored_at || a.created_at).getTime();
             const timeB = new Date(b.anchored_at || b.created_at).getTime();
             return timeB - timeA; // Newest first
          });
      },

       // Get anchor thought for a chain (earliest thought in that chain)
       getChainAnchor: (chainId) => {
         const { thoughts } = get();
         const chainThoughts = thoughts
           .filter((t) => t.chain_id === chainId && t.state === 'anchored')
           .sort((a, b) => {
             const timeA = new Date(a.anchored_at || a.created_at).getTime();
             const timeB = new Date(b.anchored_at || b.created_at).getTime();
             return timeA - timeB; // Oldest first for anchor
           });
         return chainThoughts[0] || null;
      },
    }),
    {
      name: 'pb-workspace',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        thoughts: state.thoughts,
        activeThoughtId: state.activeThoughtId,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);
