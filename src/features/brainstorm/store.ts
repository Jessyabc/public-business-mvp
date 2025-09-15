import { create } from 'zustand';
import { BrainstormNode, BrainstormEdge } from './types';

type Store = {
  nodes: BrainstormNode[];
  edges: BrainstormEdge[];
  selectedNode: string | null;
  selectedEdge: string | null;
  isCreatingLink: boolean;
  searchTerm: string;
  showHardEdges: boolean;
  showSoftEdges: boolean;

  setNodes: (nodes: BrainstormNode[]) => void;
  setEdges: (edges: BrainstormEdge[]) => void;
  addNode: (node: Omit<BrainstormNode, 'id' | 'created_at'>) => void;
  updateNode: (id: string, updates: Partial<BrainstormNode>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: Omit<BrainstormEdge, 'id' | 'created_at'>) => void;
  deleteEdge: (id: string) => void;
  setSelectedNode: (id: string | null) => void;
  setSelectedEdge: (id: string | null) => void;
  setCreatingLink: (creating: boolean) => void;
  setSearchTerm: (term: string) => void;
  toggleHardEdges: () => void;
  toggleSoftEdges: () => void;
  fitToView: () => void;
  autoArrange: () => void;
};

export const useBrainstormStore = create<Store>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  selectedEdge: null,
  isCreatingLink: false,
  searchTerm: '',
  showHardEdges: true,
  showSoftEdges: true,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  addNode: (nodeData) => {
    const id = crypto.randomUUID();
    const node: BrainstormNode = {
      ...nodeData,
      id,
      created_at: new Date().toISOString(),
    };
    set((state) => ({ nodes: [...state.nodes, node] }));
  },

  updateNode: (id, updates) => {
    set((state) => ({
      nodes: state.nodes.map((node) => (node.id === id ? { ...node, ...updates } : node)),
    }));
  },

  deleteNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
      selectedNode: state.selectedNode === id ? null : state.selectedNode,
    }));
  },

  addEdge: (edgeData) => {
    const id = crypto.randomUUID();
    const edge: BrainstormEdge = {
      ...edgeData,
      id,
      created_at: new Date().toISOString(),
    };
    set((state) => ({ edges: [...state.edges, edge] }));
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
  fitToView: () => {},
  autoArrange: () => {},
}));
