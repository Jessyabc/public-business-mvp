/**
 * Pillar #1: Individual Workspace - Zustand Store
 * 
 * Pure cognitive state management with daily threading.
 * No social metrics, no engagement tracking.
 * 
 * Threading model:
 * - Thoughts are grouped by day_key (YYYY-MM-DD)
 * - Each day forms a "thread" of related thinking
 * - New entries prepend to the day (most recent at top)
 * - Users can revisit and add to previous days
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { WorkspaceStore, ThoughtObject, DayThread } from './types';
import { format, parseISO } from 'date-fns';

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
      activeDayKey: null,
      isLoading: false,
      isSyncing: false,
      lastSyncedAt: null,

      // Create a new thought, optionally for a specific day
      // user_id is passed from the component that has auth context
      createThought: (dayKey?: string, userId?: string) => {
        const id = generateId();
        const now = new Date().toISOString();
        const targetDayKey = dayKey || get().activeDayKey || getTodayKey();
        
        const newThought: ThoughtObject = {
          id,
          user_id: userId || '', // Set from auth context, fallback empty
          content: '',
          state: 'active',
          created_at: now,
          updated_at: now,
          day_key: targetDayKey,
        };
        
        set((state) => ({
          thoughts: [newThought, ...state.thoughts],
          activeThoughtId: id,
          activeDayKey: targetDayKey,
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
        set((state) => ({
          thoughts: state.thoughts.map((t) =>
            t.id === id
              ? { 
                  ...t, 
                  state: 'anchored', 
                  anchored_at: now, 
                  updated_at: now,
                  // Ensure day_key is set based on when anchored
                  day_key: t.day_key || getDayKey(now),
                }
              : t
          ),
          activeThoughtId: state.activeThoughtId === id ? null : state.activeThoughtId,
        }));
      },

      // Reactivate an anchored thought for continued thinking
      reactivateThought: (id) => {
        const thought = get().thoughts.find(t => t.id === id);
        set((state) => ({
          thoughts: state.thoughts.map((t) =>
            t.id === id
              ? { ...t, state: 'active', updated_at: new Date().toISOString() }
              : t
          ),
          activeThoughtId: id,
          activeDayKey: thought?.day_key || null,
        }));
      },

      // Delete a thought
      deleteThought: (id) => {
        set((state) => ({
          thoughts: state.thoughts.filter((t) => t.id !== id),
          activeThoughtId: state.activeThoughtId === id ? null : state.activeThoughtId,
        }));
      },

      // Set which day thread to add to
      setActiveDayKey: (dayKey) => set({ activeDayKey: dayKey }),

      // Update display label for a day thread
      updateDayLabel: (dayKey, label) => {
        set((state) => ({
          thoughts: state.thoughts.map((t) =>
            t.day_key === dayKey
              ? { ...t, display_label: label }
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
          .sort((a, b) => {
            const timeA = a.anchored_at || a.created_at;
            const timeB = b.anchored_at || b.created_at;
            return new Date(timeB).getTime() - new Date(timeA).getTime();
          });
      },

      // Get all thoughts grouped by day
      getDayThreads: () => {
        const { thoughts } = get();
        const anchored = thoughts.filter((t) => t.state === 'anchored');
        
        // Group by day_key
        const dayMap = new Map<string, ThoughtObject[]>();
        
        for (const thought of anchored) {
          const key = thought.day_key || getDayKey(thought.anchored_at || thought.created_at);
          if (!dayMap.has(key)) {
            dayMap.set(key, []);
          }
          dayMap.get(key)!.push(thought);
        }
        
        // Convert to DayThread array
        const threads: DayThread[] = [];
        
        dayMap.forEach((dayThoughts, dayKey) => {
          // Sort thoughts within day by anchored_at descending (newest first)
          const sorted = dayThoughts.sort((a, b) => {
            const timeA = a.anchored_at || a.created_at;
            const timeB = b.anchored_at || b.created_at;
            return new Date(timeB).getTime() - new Date(timeA).getTime();
          });
          
          // Get the display label from any thought in this day (they all share it)
          const displayLabel = sorted[0]?.display_label || null;
          
          threads.push({
            day_key: dayKey,
            display_label: displayLabel,
            thoughts: sorted,
            earliest_at: sorted[sorted.length - 1].anchored_at || sorted[sorted.length - 1].created_at,
            latest_at: sorted[0].anchored_at || sorted[0].created_at,
          });
        });
        
        // Sort threads by day_key descending (most recent day first)
        return threads.sort((a, b) => b.day_key.localeCompare(a.day_key));
      },

      getDayThread: (dayKey) => {
        const threads = get().getDayThreads();
        return threads.find((t) => t.day_key === dayKey) || null;
      },
    }),
    {
      name: 'pb-workspace',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        thoughts: state.thoughts,
        activeThoughtId: state.activeThoughtId,
        activeDayKey: state.activeDayKey,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);
