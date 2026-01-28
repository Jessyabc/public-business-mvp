import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PendingReferencesStore {
  pendingRefs: string[];
  addRef: (postId: string) => void;
  removeRef: (postId: string) => void;
  clearRefs: () => void;
  hasRef: (postId: string) => boolean;
}

export const usePendingReferencesStore = create<PendingReferencesStore>()(
  persist(
    (set, get) => ({
      pendingRefs: [],
      addRef: (postId: string) => 
        set((state) => ({
          pendingRefs: state.pendingRefs.includes(postId) 
            ? state.pendingRefs 
            : [...state.pendingRefs, postId]
        })),
      removeRef: (postId: string) => 
        set((state) => ({
          pendingRefs: state.pendingRefs.filter((id) => id !== postId)
        })),
      clearRefs: () => set({ pendingRefs: [] }),
      hasRef: (postId: string) => get().pendingRefs.includes(postId),
    }),
    {
      name: 'pending-references-storage',
    }
  )
);
