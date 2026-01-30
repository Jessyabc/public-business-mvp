import { create } from 'zustand';
import type { BrainstormNode, BrainstormEdge } from './types';

// Types used by the thread feed
export interface ThreadItem {
  kind: 'post' | 'handoff';
  post?: BrainstormNode;
  handoffTo?: BrainstormNode;
}

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
  
  // Thread navigation
  threadNodes: BrainstormNode[];
  currentIndex: number;
  threadQueue: ThreadItem[];
  isFetchingMore: boolean;
  seenPostIds: Set<string>;
  expandedPostId: string | null;

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
  
  // Thread navigation methods
  goNextInThread: () => void;
  goPrevInThread: () => void;
  selectById: (id: string) => void;
  setThreadQueue: (items: ThreadItem[]) => void;
  appendThread: (items: ThreadItem[]) => void;
  clearThread: () => void;
  backtrackToRoot: (startId: string) => BrainstormNode;
  walkForward: (startId: string) => BrainstormNode[];
  buildFullHardChainFrom: (startId: string) => BrainstormNode[];
  rebuildThreadFromSelection: () => Promise<void>;
  rebuildFeed: () => Promise<void>;
  continueThreadAfterEnd: () => Promise<void>;
  setFetchingMore: (fetching: boolean) => void;
  setExpandedPostId: (id: string | null) => void;
  
  // Selectors
  hardNeighborsFor: (id: string) => BrainstormNode[];
  softLinksForPost: (postId: string) => Array<{
    id: string;
    title?: string;
    post_type?: string;
  }>;
  topSoftLinkByLikes: (id: string) => BrainstormNode | null;
};

const makeId = () =>
  (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));

export const useBrainstormStore = create<Store>((set, get) => ({
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
  threadNodes: [],
  currentIndex: 0,
  threadQueue: [],
  isFetchingMore: false,
  seenPostIds: new Set(),
  expandedPostId: null,

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
    // Removed like functionality - no longer supported for Brainstorm
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

  // Thread navigation
  goNextInThread: () => {
    const { currentIndex, threadNodes } = get();
    if (currentIndex < threadNodes.length - 1) {
      const nextIndex = currentIndex + 1;
      set({ currentIndex: nextIndex, selectedNodeId: threadNodes[nextIndex]?.id ?? null });
    }
  },

  goPrevInThread: () => {
    const { currentIndex, threadNodes } = get();
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      set({ currentIndex: prevIndex, selectedNodeId: threadNodes[prevIndex]?.id ?? null });
    }
  },

  selectById: (id: string) => {
    set({ selectedNodeId: id });
  },

  // Selectors
  hardNeighborsFor: (id: string) => {
    const { nodes, edges } = get();
    const hardEdges = edges.filter((e) => e.type === 'hard' && (e.source === id || e.target === id));
    const neighborIds = hardEdges.map((e) => (e.source === id ? e.target : e.source));
    return nodes.filter((n) => neighborIds.includes(n.id));
  },

  softLinksForPost: (postId: string) => {
    const { nodes, edges } = get();
    return edges
      .filter(e => e.source === postId && e.type === 'soft')
      .map(e => {
        const n = nodes.find(nn => nn.id === e.target);
        return n ? { id: n.id, title: n.title, post_type: n.emoji } : null;
      })
      .filter(Boolean) as { id: string; title?: string; post_type?: string }[];
  },

  topSoftLinkByLikes: (id: string) => {
    const { nodes, edges } = get();
    const softEdges = edges.filter((e) => e.type === 'soft' && e.source === id);
    const softNodes = softEdges
      .map(e => nodes.find(n => n.id === e.target))
      .filter(Boolean) as BrainstormNode[];
    
    if (!softNodes.length) return null;
    
    // Return first soft node (no longer sorting by likes)
    return softNodes[0] ?? null;
  },

  // Thread queue management
  setThreadQueue: (items) => set({ threadQueue: items }),
  
  appendThread: (items) => set({ threadQueue: [...get().threadQueue, ...items] }),
  
  clearThread: () => set({ threadQueue: [] }),
  
  // Walk HARD links backward to the root (find parent whose child = current)
  backtrackToRoot: (startId: string) => {
    const s = get();
    let current = s.nodes.find(n => n.id === startId);
    const visited = new Set<string>();
    while (current && !visited.has(current.id)) {
      visited.add(current.id);
      const prevEdge = s.edges.find(
        e => e.target === current!.id && e.type === 'hard'
      );
      if (!prevEdge) break;
      current = s.nodes.find(n => n.id === prevEdge.source);
    }
    return current ?? s.nodes.find(n => n.id === startId)!;
  },

  // Walk HARD links forward from a given start node
  walkForward: (startId: string) => {
    const s = get();
    const chain: BrainstormNode[] = [];
    let current = s.nodes.find(n => n.id === startId);
    const visited = new Set<string>();
    while (current && !visited.has(current.id)) {
      chain.push(current);
      visited.add(current.id);
      const nextEdge = s.edges.find(
        e => e.source === current!.id && e.type === 'hard'
      );
      if (!nextEdge) break;
      current = s.nodes.find(n => n.id === nextEdge.target);
    }
    return chain;
  },

  // Build FULL hard-link chain around a selection: root → … → leaf
  buildFullHardChainFrom: (startId: string) => {
    const s = get();
    const root = s.backtrackToRoot(startId);
    return s.walkForward(root.id);
  },

  // Rebuild the visible thread from the current selection (root → leaf)
  rebuildThreadFromSelection: async () => {
    const s = get();
    if (!s.selectedNodeId) return;
    const full = s.buildFullHardChainFrom(s.selectedNodeId);
    set({ threadQueue: full.map(p => ({ kind: 'post', post: p })) });
  },

  // Show ALL brainstorms in chronological order (unified feed)
  rebuildFeed: async () => {
    const s = get();
    const allNodes = [...s.nodes].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    set({ threadQueue: allNodes.map(p => ({ kind: 'post', post: p })) });
  },

  // When the chain ends, append dotted handoff + next chain via most-liked soft link
  continueThreadAfterEnd: async () => {
    const s = get();
    const q = s.threadQueue;
    const lastPost = [...q].reverse().find(i => i.kind === 'post')?.post;
    if (!lastPost) return;
    const nextSoft = s.topSoftLinkByLikes(lastPost.id);
    if (!nextSoft) return;
    s.appendThread([{ kind: 'handoff', handoffTo: nextSoft }]);
    const nextFull = s.buildFullHardChainFrom(nextSoft.id);
    s.appendThread(nextFull.map(p => ({ kind: 'post', post: p })));
  },
  
  setFetchingMore: (fetching) => set({ isFetchingMore: fetching }),
  
  setExpandedPostId: (id) => set({ expandedPostId: id }),
}));
