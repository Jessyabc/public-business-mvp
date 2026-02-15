/**
 * Pillar #1: Individual Workspace - Zustand Store
 *
 * Chain of Thoughts - Pure cognitive state management.
 * 
 * Key invariants:
 * - Chains break ONLY when user explicitly breaks them
 * - Global feed is strictly time-ordered (newest first)
 * - In-place edit: edits update the original thought directly
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
      hasMorePages: false,
      oldestLoadedAt: null,

      // Create a new thought
      createThought: (dayKey?: string, userId?: string, chainId?: ChainId, focusedChainId?: ChainId | null) => {
        const id = generateId();
        const now = new Date().toISOString();
        const targetDayKey = dayKey || getTodayKey();
        
        const normalizedDayKey = targetDayKey.includes('T') 
          ? getDayKey(targetDayKey) 
          : targetDayKey;
        
        const chainStore = useChainStore.getState();
        const pendingChainId = chainStore.pendingChainId;
        const activeChainId = chainStore.activeChainId;
        
        let finalChainId: ChainId | null = chainId || focusedChainId || pendingChainId || activeChainId;
        
        if (!finalChainId && userId) {
          finalChainId = chainStore.createChain(userId);
        }
        
        if (focusedChainId && finalChainId === focusedChainId) {
          chainStore.setActiveChain(focusedChainId);
        }
        
        const newThought: ThoughtObject = {
          id,
          user_id: userId || '',
          content: '',
          state: 'active',
          created_at: now,
          updated_at: now,
          day_key: normalizedDayKey,
          chain_id: finalChainId,
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

      // Anchor a thought
      anchorThought: (id) => {
        const now = new Date().toISOString();
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
        
        const chainStore = useChainStore.getState();
        if (thoughtChainId && chainStore.pendingChainId === thoughtChainId) {
          chainStore.setActiveChain(thoughtChainId);
          chainStore.clearPendingChain();
        }
      },

      // Reactivate an anchored thought for in-place editing
      reactivateThought: (id) => {
        const { thoughts, activeThoughtId } = get();
        
        // If another thought is currently active, re-anchor it first to prevent data loss
        if (activeThoughtId && activeThoughtId !== id) {
          const activePrev = thoughts.find(t => t.id === activeThoughtId);
          if (activePrev && activePrev.state === 'active') {
            if (activePrev.content.trim()) {
              // Re-anchor the previously active thought
              const now = new Date().toISOString();
              set((state) => ({
                thoughts: state.thoughts.map((t) =>
                  t.id === activeThoughtId
                    ? { ...t, state: 'anchored', anchored_at: t.anchored_at || now, updated_at: now }
                    : t
                ),
              }));
            } else {
              // Empty thought — remove it
              set((state) => ({
                thoughts: state.thoughts.filter((t) => t.id !== activeThoughtId),
              }));
            }
          }
        }
        
        const thought = get().thoughts.find(t => t.id === id);
        
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
                }
              : t
          ),
          activeThoughtId: state.activeThoughtId === id ? null : state.activeThoughtId,
        }));
      },

      // Delete a thought
      deleteThought: (id) => {
        set((state) => ({
          thoughts: state.thoughts.filter((t) => t.id !== id),
          activeThoughtId: state.activeThoughtId === id ? null : state.activeThoughtId,
        }));
      },

      // State setters
      setActiveThought: (id) => set({ activeThoughtId: id }),
      setThoughts: (thoughts) => set({ thoughts }),
      setLoading: (isLoading) => set({ isLoading }),
      setSyncing: (isSyncing) => set({ isSyncing }),
      setLastSynced: (lastSyncedAt) => set({ lastSyncedAt }),
      setHasMorePages: (hasMorePages) => set({ hasMorePages }),
      setOldestLoadedAt: (oldestLoadedAt) => set({ oldestLoadedAt }),

      resetStore: () => {
        set({
          thoughts: [],
          activeThoughtId: null,
          isLoading: false,
          isSyncing: false,
          lastSyncedAt: null,
          hasMorePages: false,
          oldestLoadedAt: null,
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

      getGlobalFeed: () => {
        const { thoughts } = get();
        return thoughts
          .filter((t) => t.state === 'anchored')
          .sort((a, b) => {
            const timeA = new Date(a.anchored_at || a.created_at).getTime();
            const timeB = new Date(b.anchored_at || b.created_at).getTime();
            return timeB - timeA;
          });
      },

      getChainAnchor: (chainId) => {
        const { thoughts } = get();
        const chainThoughts = thoughts
          .filter((t) => t.chain_id === chainId && t.state === 'anchored')
          .sort((a, b) => {
            const timeA = new Date(a.anchored_at || a.created_at).getTime();
            const timeB = new Date(b.anchored_at || b.created_at).getTime();
            return timeA - timeB;
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
