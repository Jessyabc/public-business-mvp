import { create } from 'zustand';

interface ComposerStore {
  isOpen: boolean;
  openComposer: () => void;
  closeComposer: () => void;
}

export const useComposerStore = create<ComposerStore>((set) => ({
  isOpen: false,
  openComposer: () => set({ isOpen: true }),
  closeComposer: () => set({ isOpen: false }),
}));