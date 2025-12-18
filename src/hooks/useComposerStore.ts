import { create } from 'zustand';

export type RelationType = 'continuation' | 'linking';

/**
 * Context for composer modal - tracks origin and parent relationships
 */
export interface ComposerContext {
  parentPostId?: string;
  relationType?: RelationType | null;
  originOpenIdeaId?: string;
}

/**
 * Composer store - manages state for post creation modal
 * 
 * IMPORTANT: Composer always creates posts (stored in posts table).
 * It does NOT interact with workspace_thoughts table.
 * 
 * Origin context (workspace vs discuss) is UI-only for displaying
 * informational banners - it is not persisted to the database.
 */
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