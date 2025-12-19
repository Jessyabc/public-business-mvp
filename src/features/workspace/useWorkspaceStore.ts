/**
 * Pillar #1: Individual Workspace - Zustand Store
 * 
 * Pure cognitive state management.
 * No social metrics, no engagement tracking.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { WorkspaceStore, ThoughtObject } from './types';

const generateId = () => crypto.randomUUID();

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set, get) => ({
      // Initial state
      thoughts: [],
      activeThoughtId: null,
      isLoading: false,
      isSyncing: false,
      lastSyncedAt: null,

      // Create a new thought and make it active
      createThought: () => {
        const id = generateId();
        const now = new Date().toISOString();
        const newThought: ThoughtObject = {
          id,
          user_id: '', // Will be set during sync
          content: '',
          state: 'active',
          created_at: now,
          updated_at: now,
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
      // Sets anchored_at - this becomes the thought's temporal identity
      anchorThought: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          thoughts: state.thoughts.map((t) =>
            t.id === id
              ? { ...t, state: 'anchored', anchored_at: now, updated_at: now }
              : t
          ),
          activeThoughtId: state.activeThoughtId === id ? null : state.activeThoughtId,
        }));
      },

      // Reactivate an anchored thought for continued thinking
      reactivateThought: (id) => {
        set((state) => ({
          thoughts: state.thoughts.map((t) =>
            t.id === id
              ? { ...t, state: 'active', updated_at: new Date().toISOString() }
              : t
          ),
          activeThoughtId: id,
        }));
      },

      // Delete a thought
      deleteThought: (id) => {
        set((state) => ({
          thoughts: state.thoughts.filter((t) => t.id !== id),
          activeThoughtId: state.activeThoughtId === id ? null : state.activeThoughtId,
        }));
      },

      // Update display label (cosmetic only - does not affect lineage ordering)
      // Pass null or empty string to revert to timestamp
      updateDisplayLabel: (id, label) => {
        set((state) => ({
          thoughts: state.thoughts.map((t) =>
            t.id === id
              ? { ...t, display_label: label || null }
              : t
          ),
        }));
      },

      // State setters
      setActiveThought: (id) => set({ activeThoughtId: id }),
      setThoughts: (thoughts) => set({ thoughts }),
      setLoading: (isLoading) => set({ isLoading }),
      setSyncing: (isSyncing) => set({ isSyncing }),
      setLastSynced: (lastSyncedAt) => set({ lastSyncedAt }),

      // Selectors
      getActiveThought: () => {
        const { thoughts, activeThoughtId } = get();
        return thoughts.find((t) => t.id === activeThoughtId) ?? null;
      },

      getAnchoredThoughts: () => {
        const { thoughts } = get();
        return thoughts
          .filter((t) => t.state === 'anchored')
          // Sort by anchored_at (temporal lineage), fallback to created_at for backward compatibility
          .sort((a, b) => {
            const timeA = a.anchored_at || a.created_at;
            const timeB = b.anchored_at || b.created_at;
            return new Date(timeB).getTime() - new Date(timeA).getTime();
          });
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
