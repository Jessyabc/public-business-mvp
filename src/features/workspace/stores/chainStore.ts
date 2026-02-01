/**
 * Think Space: Pull-the-Thread System - Chain Store
 * 
 * Zustand store for chain state management.
 * Handles raw chains and merged lenses.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { 
  ChainStore, 
  ThoughtChain, 
  ThoughtLens, 
  ChainId, 
  LensId,
  ChainViewMode 
} from '../types/chain';

const generateId = () => crypto.randomUUID();

export const useChainStore = create<ChainStore>()(
  persist(
    (set, get) => ({
      // Initial state
      chains: [],
      lenses: [],
      activeChainId: null,
      pendingChainId: null,
      activeLensId: null,
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
          first_thought_at: null, // Will be set when first thought is added
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
          // Also remove from any lenses
          lenses: state.lenses.map((lens) => ({
            ...lens,
            chain_ids: lens.chain_ids.filter((cid) => cid !== id),
          })),
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
          // Clear pending chain when manually setting active chain (overrides pending behavior)
          pendingChainId: id ? null : get().pendingChainId,
          // Clear lens when switching to raw chain view
          activeLensId: id ? null : get().activeLensId,
        });
      },

      // Break chain - creates new chain as pending (becomes active on first anchor)
      breakChain: (userId: string): ChainId => {
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
          pendingChainId: id, // Set as pending, NOT active - keeps current activeChainId
        }));
        
        return id;
      },

      // Clear pending chain (used when activating it)
      clearPendingChain: () => {
        set({ pendingChainId: null });
      },

      // Lens operations (V2)
      createLens: (userId: string, chainIds: ChainId[], label: string | null = null): LensId => {
        const id = generateId();
        const now = new Date().toISOString();
        
        const newLens: ThoughtLens = {
          id,
          user_id: userId,
          created_at: now,
          label,
          updated_at: now,
          chain_ids: chainIds,
        };
        
        set((state) => ({
          lenses: [newLens, ...state.lenses],
          activeLensId: id,
          viewMode: 'lens' as ChainViewMode,
        }));
        
        return id;
      },

      deleteLens: (id: LensId) => {
        set((state) => ({
          lenses: state.lenses.filter((l) => l.id !== id),
          activeLensId: state.activeLensId === id ? null : state.activeLensId,
          viewMode: state.activeLensId === id ? 'raw' as ChainViewMode : state.viewMode,
        }));
      },

      addChainToLens: (lensId: LensId, chainId: ChainId) => {
        set((state) => ({
          lenses: state.lenses.map((lens) =>
            lens.id === lensId && !lens.chain_ids.includes(chainId)
              ? { 
                  ...lens, 
                  chain_ids: [...lens.chain_ids, chainId],
                  updated_at: new Date().toISOString(),
                }
              : lens
          ),
        }));
      },

      removeChainFromLens: (lensId: LensId, chainId: ChainId) => {
        set((state) => ({
          lenses: state.lenses.map((lens) =>
            lens.id === lensId
              ? { 
                  ...lens, 
                  chain_ids: lens.chain_ids.filter((id) => id !== chainId),
                  updated_at: new Date().toISOString(),
                }
              : lens
          ),
        }));
      },

      setActiveLens: (id: LensId | null) => {
        set({ 
          activeLensId: id,
          activeChainId: null, // Clear chain when viewing a lens
          viewMode: id ? 'lens' as ChainViewMode : get().viewMode,
        });
      },

      // View mode
      setViewMode: (mode: ChainViewMode) => set({ viewMode: mode }),

      // State management
      setChains: (chains: ThoughtChain[]) => set({ chains }),
      setLenses: (lenses: ThoughtLens[]) => set({ lenses }),
      setLoadingChains: (isLoadingChains: boolean) => set({ isLoadingChains }),
      setSyncingChains: (isSyncingChains: boolean) => set({ isSyncingChains }),

      // Selectors
      getActiveChain: () => {
        const { chains, activeChainId } = get();
        return chains.find((c) => c.id === activeChainId) ?? null;
      },

      getActiveLens: () => {
        const { lenses, activeLensId } = get();
        return lenses.find((l) => l.id === activeLensId) ?? null;
      },

      getChainById: (id: ChainId) => {
        const { chains } = get();
        return chains.find((c) => c.id === id) ?? null;
      },

      getChainsForLens: (lensId: LensId) => {
        const { chains, lenses } = get();
        const lens = lenses.find((l) => l.id === lensId);
        if (!lens) return [];
        return chains.filter((c) => lens.chain_ids.includes(c.id));
      },
    }),
    {
      name: 'pb-workspace-chains',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        chains: state.chains,
        lenses: state.lenses,
        activeChainId: state.activeChainId,
        pendingChainId: state.pendingChainId,
        activeLensId: state.activeLensId,
        viewMode: state.viewMode,
      }),
    }
  )
);
