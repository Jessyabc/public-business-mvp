import { create } from 'zustand';
import type { BrainstormNode, BrainstormEdge } from './types';

type Store = {
  nodes: BrainstormNode[];
  edges: BrainstormEdge[];
  selectedNode: string | null;
  selectedEdge: string | null;
  isCreatingLink: boolean;
  searchTerm: string;
  showHardEdges: boolean;
  showSoftEdges: boolean;
  depth: 0 | 1 | 2;
  selectedNodeId: string | null;
  lastCreatedId: string | null;
  isLoadingGraph: boolean;
  graphError: string | null;

  setNodes: (nodes: BrainstormNode[]) => void;
  setEdges: (edges: BrainstormEdge[]) => void;
  addNode: (node: Omit<BrainstormNode, 'id' | 'created_at'>) => void;
  addNodeOptimistic: (node: { id: string; title: string; content: string; created_at: string; user_id: string }) => void;
  updateNode: (id: string, updates: Partial<BrainstormNode>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: Omit<BrainstormEdge, 'id' | 'created_at'>) => void;
  addEdgeOptimistic: (edge: { parent_post_id: string; child_post_id: string; relation_type: string }) => void;
  deleteEdge: (id: string) => void;
  setSelectedNode: (id: string | null) => void;
  setSelectedEdge: (id: string | null) => void;
  setCreatingLink: (creating: boolean) => void;
  setSearchTerm: (term: string) => void;
  toggleHardEdges: () => void;
  toggleSoftEdges: () => void;
  setDepth: (depth: 0 | 1 | 2) => void;
  setSelectedNodeId: (id: string | null) => void;
  setLastCreatedId: (id: string | null) => void;
  likeNode: (id: string) => void;
  viewNode: (id: string) => void;
  fitToView: () => void;
  autoArrange: () => void;
  reset: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
};

const makeId = () =>
  (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));

export const useBrainstormStore = create<Store>((set) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  selectedEdge: null,
  isCreatingLink: false,
  searchTerm: '',
  showHardEdges: true,
  showSoftEdges: true,
  depth: 0,
  selectedNodeId: null,
  lastCreatedId: null,
  isLoadingGraph: false,
  graphError: null,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  addNode: (nodeData) => {
    const id = makeId();
    const node: BrainstormNode = {
      ...nodeData,            // must include: title, content, tags, position, author (per your type)
      id,
      created_at: new Date().toISOString(),
    };
    set((state) => ({ nodes: [...state.nodes, node] }));
  },

  addNodeOptimistic: (node) => {
    const brainstormNode: BrainstormNode = {
      id: node.id,
      title: node.title,
      content: node.content,
      created_at: node.created_at,
      emoji: '💡',
      tags: [],
      position: { x: 0, y: 0 },
      author: 'You',
    };
    set((state) => ({ nodes: [...state.nodes, brainstormNode] }));
  },

  updateNode: (id, updates) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, ...updates } : node
      ),
    }));
  },

  deleteNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter(
        (edge) => edge.source !== id && edge.target !== id
      ),
      selectedNode: state.selectedNode === id ? null : state.selectedNode,
    }));
  },

  addEdge: (edgeData) => {
    const id = makeId();
    const edge: BrainstormEdge = {
      ...edgeData,            // must include: source, target, type
      id,
      created_at: new Date().toISOString(),
    };
    set((state) => ({ edges: [...state.edges, edge] }));
  },

  addEdgeOptimistic: (edge) => {
    const id = makeId();
    const brainstormEdge: BrainstormEdge = {
      id,
      source: edge.parent_post_id,
      target: edge.child_post_id,
      type: edge.relation_type as 'hard' | 'soft',
      created_at: new Date().toISOString(),
    };
    set((state) => ({ edges: [...state.edges, brainstormEdge] }));
  },

  deleteEdge: (id) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id),
      selectedEdge: state.selectedEdge === id ? null : state.selectedEdge,
    }));
  },

  setSelectedNode: (id) => set({ selectedNode: id }),
  setSelectedEdge: (id) => set({ selectedEdge: id }),
  setCreatingLink: (creating) => set({ isCreatingLink: creating }),
  setSearchTerm: (term) => set({ searchTerm: term }),
  toggleHardEdges: () => set((state) => ({ showHardEdges: !state.showHardEdges })),
  toggleSoftEdges: () => set((state) => ({ showSoftEdges: !state.showSoftEdges })),
  setDepth: (depth) => set({ depth }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setLastCreatedId: (id) => set({ lastCreatedId: id }),
  
  likeNode: (id) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id
          ? { ...node, likes_count: (node.likes_count ?? 0) + 1 }
          : node
      ),
    }));
  },

  viewNode: (id) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id
          ? { ...node, views_count: (node.views_count ?? 0) + 1 }
          : node
      ),
    }));
  },

  fitToView: () => {},
  autoArrange: () => {},

  reset: () =>
    set({
      nodes: [],
      edges: [],
      selectedNode: null,
      selectedEdge: null,
      isCreatingLink: false,
      searchTerm: '',
      showHardEdges: true,
      showSoftEdges: true,
      depth: 0,
      selectedNodeId: null,
      lastCreatedId: null,
      isLoadingGraph: false,
      graphError: null,
    }),

  setLoading: (loading) => set({ isLoadingGraph: loading }),
  setError: (error) => set({ graphError: error }),
}));
