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
  
  // Thread navigation
  threadNodes: BrainstormNode[];
  currentIndex: number;
  threadQueue: BrainstormNode[];
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
  setThreadQueue: (nodes: BrainstormNode[]) => void;
  appendThread: (nodes: BrainstormNode[]) => void;
  buildHardChainFrom: (startId: string) => Promise<BrainstormNode[]>;
  loadMoreHardSegment: () => Promise<void>;
  setFetchingMore: (fetching: boolean) => void;
  setExpandedPostId: (id: string | null) => void;
  
  // Selectors
  hardNeighborsFor: (id: string) => BrainstormNode[];
  softLinksForSelected: () => Array<{
    child_post_id: string;
    child_title?: string;
    child_post_type?: string;
    child_like_count?: number;
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
    const { threadNodes } = get();
    const index = threadNodes.findIndex((n) => n.id === id);
    if (index >= 0) {
      set({ selectedNodeId: id, currentIndex: index });
    } else {
      set({ selectedNodeId: id });
    }
  },

  // Selectors
  hardNeighborsFor: (id: string) => {
    const { nodes, edges } = get();
    const hardEdges = edges.filter((e) => e.type === 'hard' && (e.source === id || e.target === id));
    const neighborIds = hardEdges.map((e) => (e.source === id ? e.target : e.source));
    return nodes.filter((n) => neighborIds.includes(n.id));
  },

  softLinksForSelected: () => {
    const { selectedNodeId, nodes, edges } = get();
    if (!selectedNodeId) return [];
    
    const softEdges = edges.filter((e) => e.type === 'soft' && e.source === selectedNodeId);
    return softEdges.map((edge) => {
      const childNode = nodes.find((n) => n.id === edge.target);
      return {
        child_post_id: edge.target,
        child_title: childNode?.title,
        child_post_type: childNode?.emoji,
        child_like_count: childNode?.likes_count,
      };
    });
  },

  topSoftLinkByLikes: (id: string) => {
    const { nodes, edges } = get();
    const softEdges = edges.filter((e) => e.type === 'soft' && e.source === id);
    const softNeighbors = softEdges
      .map((e) => nodes.find((n) => n.id === e.target))
      .filter((n): n is BrainstormNode => n !== undefined);
    
    if (softNeighbors.length === 0) return null;
    
    return softNeighbors.reduce((best, current) =>
      (current.likes_count ?? 0) > (best.likes_count ?? 0) ? current : best
    );
  },

  // Thread queue management
  setThreadQueue: (nodes) => {
    const seenIds = new Set(nodes.map(n => n.id));
    set({ threadQueue: nodes, seenPostIds: seenIds });
  },
  
  appendThread: (nodes) => {
    set((state) => {
      const newNodes = nodes.filter(n => !state.seenPostIds.has(n.id));
      const newSeenIds = new Set([...Array.from(state.seenPostIds), ...newNodes.map(n => n.id)]);
      return {
        threadQueue: [...state.threadQueue, ...newNodes],
        seenPostIds: newSeenIds
      };
    });
  },
  
  buildHardChainFrom: async (startId: string) => {
    const { BrainstormSupabaseAdapter } = await import('@/features/brainstorm/adapters/supabaseAdapter');
    const adapter = new BrainstormSupabaseAdapter();
    const chain = await adapter.fetchChainHard(startId, 'forward', 25, 500);
    return chain;
  },
  
  loadMoreHardSegment: async () => {
    const { 
      threadQueue, 
      topSoftLinkByLikes, 
      buildHardChainFrom, 
      appendThread, 
      setFetchingMore, 
      edges,
      nodes,
      seenPostIds 
    } = get();
    
    if (threadQueue.length === 0) return;
    
    const lastNode = threadQueue[threadQueue.length - 1];
    if (!lastNode) return;
    
    setFetchingMore(true);
    
    try {
      // Priority 1: Check for more hard links from current node
      const hardEdges = edges.filter((e) => e.type === 'hard' && e.source === lastNode.id);
      const unseenHardTargets = hardEdges
        .map(e => e.target)
        .filter(id => !seenPostIds.has(id));
      
      if (unseenHardTargets.length > 0) {
        // Continue with hard chain
        const moreChain = await buildHardChainFrom(lastNode.id);
        const unseenChain = moreChain.filter(n => !seenPostIds.has(n.id));
        if (unseenChain.length > 0) {
          appendThread(unseenChain);
          return;
        }
      }
      
      // Priority 2: Pick ONE soft link (most liked, unseen)
      const softEdges = edges.filter((e) => e.type === 'soft' && e.source === lastNode.id);
      const unseenSoftTargets = softEdges
        .map((e) => {
          const targetNode = nodes.find(n => n.id === e.target);
          return targetNode;
        })
        .filter((n): n is BrainstormNode => n !== undefined && !seenPostIds.has(n.id))
        .sort((a, b) => (b.likes_count ?? 0) - (a.likes_count ?? 0));
      
      if (unseenSoftTargets.length > 0) {
        const nextSoft = unseenSoftTargets[0];
        
        // Add handoff marker
        const handoffMarker: BrainstormNode = {
          id: `handoff-${lastNode.id}-${nextSoft.id}`,
          title: nextSoft.title || 'Continue thread',
          content: '',
          emoji: '🔗',
          tags: ['handoff'],
          position: { x: 0, y: 0 },
          created_at: new Date().toISOString(),
          author: 'System',
        };
        appendThread([handoffMarker]);
        
        // Build hard chain from soft target
        const softChain = await buildHardChainFrom(nextSoft.id);
        const unseenSoftChain = softChain.filter(n => !seenPostIds.has(n.id));
        appendThread(unseenSoftChain);
        return;
      }
      
      // Priority 3: Show other unseen brainstorms
      const unseenNodes = nodes.filter(n => !seenPostIds.has(n.id));
      if (unseenNodes.length > 0) {
        // Sort by recency
        const sortedUnseen = unseenNodes.sort((a, b) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        
        // Add a few at a time
        const nextBatch = sortedUnseen.slice(0, 3);
        appendThread(nextBatch);
      }
      
    } catch (err) {
      console.error('Failed to load more:', err);
    } finally {
      setFetchingMore(false);
    }
  },
  
  setFetchingMore: (fetching) => set({ isFetchingMore: fetching }),
  
  setExpandedPostId: (id) => set({ expandedPostId: id }),
}));
