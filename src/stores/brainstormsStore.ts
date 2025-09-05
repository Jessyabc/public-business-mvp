import { create } from 'zustand';

export interface Brainstorm {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  parent_id?: string;
  likes_count: number;
  comments_count: number;
  branches?: Brainstorm[];
}

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
      // TODO: Replace with real API call
      await new Promise(resolve => setTimeout(resolve, 300));
      set({ roots: [], loading: false });
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
      // TODO: Replace with real API call
      set({ 
        branches: { ...branches, [rootId]: [] }
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
      title: text.trim(),
      content: text.trim(),
      user_id: 'current-user',
      likes_count: 0,
      comments_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      parent_id: parentId,
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
      // TODO: Replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, keep the optimistic version
      const newOptimistic = new Set(optimisticInserts);
      newOptimistic.delete(optimisticId);
      set({ optimisticInserts: newOptimistic });
      
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
      return [...roots].sort((a, b) => b.likes_count - a.likes_count);
    }
    
    // Default: sort by recency
    return [...roots].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  getBranches: (rootId: string) => {
    const { branches } = get();
    return branches[rootId] || [];
  },
}));