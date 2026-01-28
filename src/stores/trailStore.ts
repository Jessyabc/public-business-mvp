import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TrailItem {
  id: string;
  title: string | null;
  content: string;
  visitedAt: string;
}

interface TrailStore {
  trail: TrailItem[];
  addToTrail: (item: Omit<TrailItem, 'visitedAt'>) => void;
  clearTrail: () => void;
  removeFromTrail: (id: string) => void;
}

const MAX_TRAIL_ITEMS = 20;

export const useTrailStore = create<TrailStore>()(
  persist(
    (set) => ({
      trail: [],
      
      addToTrail: (item) => set((state) => {
        // Remove existing entry if present (to move to top)
        const filteredTrail = state.trail.filter(t => t.id !== item.id);
        
        // Add new item at the beginning with timestamp
        const newTrail = [
          { ...item, visitedAt: new Date().toISOString() },
          ...filteredTrail
        ].slice(0, MAX_TRAIL_ITEMS);
        
        return { trail: newTrail };
      }),
      
      clearTrail: () => set({ trail: [] }),
      
      removeFromTrail: (id) => set((state) => ({
        trail: state.trail.filter(t => t.id !== id)
      })),
    }),
    {
      name: 'pb-trail-store',
      version: 1,
    }
  )
);
