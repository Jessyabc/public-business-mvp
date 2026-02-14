/**
 * Think Space: Pull-the-Thread System - Chain Store
 * 
 * Zustand store for chain state management.
 * Lenses removed - raw chains only.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { 
  ChainStore, 
  ThoughtChain, 
  ChainId, 
  ChainViewMode 
} from '../types/chain';

const generateId = () => crypto.randomUUID();

export const useChainStore = create<ChainStore>()(
  persist(
    (set, get) => ({
      // Initial state
      chains: [],
      activeChainId: null,
      pendingChainId: null,
      viewMode: 'raw' as ChainViewMode,
      isLoadingChains: false,
      isSyncingChains: false,

      // Chain operations
      createChain: (userId: string): ChainId => {
        const id = generateId();
        const now = new Date().toISOString();
        
        const newChain: ThoughtChain = {
          id,
          user_id: userId,
          created_at: now,
          first_thought_at: null,
          display_label: null,
          updated_at: now,
        };
        
        set((state) => ({
          chains: [newChain, ...state.chains],
          activeChainId: id,
        }));
        
        return id;
      },

      deleteChain: (id: ChainId) => {
        set((state) => ({
          chains: state.chains.filter((c) => c.id !== id),
          activeChainId: state.activeChainId === id ? null : state.activeChainId,
          pendingChainId: state.pendingChainId === id ? null : state.pendingChainId,
        }));
      },

      updateChainLabel: (id: ChainId, label: string | null) => {
        set((state) => ({
          chains: state.chains.map((c) =>
            c.id === id
              ? { ...c, display_label: label, updated_at: new Date().toISOString() }
              : c
          ),
        }));
      },

      setActiveChain: (id: ChainId | null) => {
        set({ 
          activeChainId: id,
          pendingChainId: id ? null : get().pendingChainId,
        });
      },

      breakChain: (userId: string, fromChainId?: string | null, atThoughtId?: string | null): ChainId => {
        const id = generateId();
        const now = new Date().toISOString();
        const currentActiveChainId = fromChainId ?? get().activeChainId;
        
        const newChain: ThoughtChain = {
          id,
          user_id: userId,
          created_at: now,
          first_thought_at: null,
          display_label: null,
          updated_at: now,
          diverged_from_chain_id: currentActiveChainId,
          diverged_at_thought_id: atThoughtId ?? null,
        };
        
        set((state) => ({
          chains: [newChain, ...state.chains],
          pendingChainId: id,
        }));
        
        return id;
      },

      clearPendingChain: () => {
        set({ pendingChainId: null });
      },

      setViewMode: (mode: ChainViewMode) => set({ viewMode: mode }),

      // State management
      setChains: (chains: ThoughtChain[]) => set({ chains }),
      setLoadingChains: (isLoadingChains: boolean) => set({ isLoadingChains }),
      setSyncingChains: (isSyncingChains: boolean) => set({ isSyncingChains }),

      resetStore: () => {
        set({
          chains: [],
          activeChainId: null,
          pendingChainId: null,
          viewMode: 'raw' as ChainViewMode,
          isLoadingChains: false,
          isSyncingChains: false,
        });
      },

      // Selectors
      getActiveChain: () => {
        const { chains, activeChainId } = get();
        return chains.find((c) => c.id === activeChainId) ?? null;
      },

      getChainById: (id: ChainId) => {
        const { chains } = get();
        return chains.find((c) => c.id === id) ?? null;
      },
    }),
    {
      name: 'pb-workspace-chains',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        chains: state.chains,
        activeChainId: state.activeChainId,
        pendingChainId: state.pendingChainId,
        viewMode: state.viewMode,
      }),
    }
  )
);
