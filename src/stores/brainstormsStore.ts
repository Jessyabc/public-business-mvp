// LEGACY – do not extend. Kept temporarily for reference during migration.
// This uses mock brainstorm data and is not connected to the canonical posts system.
// New code should use usePosts and usePostRelations for real post management.

import { create } from 'zustand';
import { brainstormService, type Brainstorm } from '@/services/mock/brainstorms';
import { trackBrainstormCreated, trackBrainstormFailed, trackBrainstormReply } from '@/lib/track';

interface BrainstormsState {
  // Data
  roots: Brainstorm[];
  branches: Record<string, Brainstorm[]>;
  
  // UI State
  loading: boolean;
  error: string | null;
  optimisticInserts: Set<string>;
  
  // Actions
  loadRoots: () => Promise<void>;
  loadBranches: (rootId: string) => Promise<void>;
  createBrainstorm: (params: { text: string; parentId?: string }) => Promise<void>;
  clearError: () => void;
  
  // Selectors
  getBrainstorm: (id: string) => Brainstorm | undefined;
  getRootBrainstorms: (sortBy?: 'recent' | 'score') => Brainstorm[];
  getBranches: (rootId: string) => Brainstorm[];
}

export const useBrainstormsStore = create<BrainstormsState>((set, get) => ({
  // Initial state
  roots: [],
  branches: {},
  loading: false, 
  error: null,
  optimisticInserts: new Set(),

  // Load root brainstorms
  loadRoots: async () => {
    set({ loading: true, error: null });
    
    try {
      // Simulate loading delay for skeleton demo
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const roots = brainstormService.listRootBrainstorms();
      set({ roots, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load brainstorms',
        loading: false 
      });
    }
  },

  // Load branches for a specific brainstorm
  loadBranches: async (rootId: string) => {
    const { branches } = get();
    
    // Skip if already loaded
    if (branches[rootId]) return;
    
    try {
      const branchList = brainstormService.listBranches(rootId);
      set({ 
        branches: { ...branches, [rootId]: branchList }
      });
    } catch (error) {
      console.error('Failed to load branches:', error);
    }
  },

  // Create new brainstorm with optimistic updates
  createBrainstorm: async ({ text, parentId }) => {
    const { roots, branches, optimisticInserts } = get();
    
    // Create optimistic brainstorm
    const optimisticId = `temp-${Date.now()}`;
    const optimisticBrainstorm: Brainstorm = {
      id: optimisticId,
      text: text.trim(),
      authorId: 'user-current',
      authorName: 'You',
      tScore: 5, // Start with low score
      replyCount: 0,
      createdAt: new Date().toISOString(),
      parentId,
    };

    // Optimistically update UI
    set({ 
      optimisticInserts: new Set(optimisticInserts).add(optimisticId),
      error: null,
    });

    if (parentId) {
      // Add to branches
      const currentBranches = branches[parentId] || [];
      set({
        branches: {
          ...branches,
          [parentId]: [optimisticBrainstorm, ...currentBranches]
        }
      });
    } else {
      // Add to roots
      set({ roots: [optimisticBrainstorm, ...roots] });
    }

    try {
      // Create brainstorm via service
      const realBrainstorm = await brainstormService.createBrainstormAsync({ text, parentId });
      
      // Replace optimistic with real data
      const newOptimistic = new Set(optimisticInserts);
      newOptimistic.delete(optimisticId);
      
      if (parentId) {
        const currentBranches = branches[parentId] || [];
        const updatedBranches = currentBranches.map(b => 
          b.id === optimisticId ? realBrainstorm : b
        );
        
        // Also update parent's reply count and T-score
        const updatedRoots = roots.map(root => {
          if (root.id === parentId) {
            const parent = brainstormService.getBrainstorm(parentId);
            return parent || root;
          }
          return root;
        });
        
        set({
          roots: updatedRoots,
          branches: { ...branches, [parentId]: updatedBranches },
          optimisticInserts: newOptimistic,
        });

        trackBrainstormReply(realBrainstorm.id, parentId, realBrainstorm.replyCount);
      } else {
        const updatedRoots = roots.map(r => 
          r.id === optimisticId ? realBrainstorm : r
        );
        set({ 
          roots: updatedRoots,
          optimisticInserts: newOptimistic,
        });
      }

      trackBrainstormCreated(realBrainstorm.id, text.length, parentId);
      
    } catch (error) {
      // Rollback optimistic update
      const newOptimistic = new Set(optimisticInserts);
      newOptimistic.delete(optimisticId);
      
      if (parentId) {
        const currentBranches = branches[parentId] || [];
        const rolledBackBranches = currentBranches.filter(b => b.id !== optimisticId);
        set({
          branches: { ...branches, [parentId]: rolledBackBranches },
          optimisticInserts: newOptimistic,
          error: error instanceof Error ? error.message : 'Failed to create brainstorm',
        });
      } else {
        const rolledBackRoots = roots.filter(r => r.id !== optimisticId);
        set({ 
          roots: rolledBackRoots,
          optimisticInserts: newOptimistic,
          error: error instanceof Error ? error.message : 'Failed to create brainstorm',
        });
      }

      trackBrainstormFailed(
        error instanceof Error ? error.message : 'Unknown error',
        text.length,
        parentId
      );
    }
  },

  clearError: () => set({ error: null }),

  // Selectors
  getBrainstorm: (id: string) => {
    const { roots, branches } = get();
    
    // Check roots first
    const rootMatch = roots.find(r => r.id === id);
    if (rootMatch) return rootMatch;
    
    // Check all branches
    for (const branchList of Object.values(branches)) {
      const branchMatch = branchList.find(b => b.id === id);
      if (branchMatch) return branchMatch;
    }
    
    return undefined;
  },

  getRootBrainstorms: (sortBy = 'recent') => {
    const { roots } = get();
    
    if (sortBy === 'score') {
      return [...roots].sort((a, b) => b.tScore - a.tScore);
    }
    
    // Default: sort by recency
    return [...roots].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getBranches: (rootId: string) => {
    const { branches } = get();
    return branches[rootId] || [];
  },
}));