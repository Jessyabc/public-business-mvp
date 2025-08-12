import { create } from 'zustand';

export type RelationType = 'continuation' | 'linking';

export interface ComposerContext {
  parentPostId?: string;
  relationType?: RelationType | null;
}

interface ComposerStore {
  isOpen: boolean;
  context: ComposerContext | null;
  openComposer: (context?: ComposerContext) => void;
  closeComposer: () => void;
  setContext: (context: ComposerContext | null) => void;
}

export const useComposerStore = create<ComposerStore>((set) => ({
  isOpen: false,
  context: null,
  openComposer: (context) => set({ isOpen: true, context: context ?? null }),
  closeComposer: () => set({ isOpen: false, context: null }),
  setContext: (context) => set({ context }),
}));