 /**
  * Think Space: Feed Scope/Projection Store
  * 
  * Manages the three projections of the same feed:
  * - global: ALL thoughts in timestamp order
  * - chain: single chain only
  * - merged: chain + linked chains (1-hop)
  */
 
 import { create } from 'zustand';
 import type { ThoughtObject, FeedScope, ChainLink, ChainId } from '../types';
 
 interface ScrollAnchor {
   thoughtId: string;
   offset: number;
 }
 
 interface FeedState {
   scope: FeedScope;
   focusedChainId: ChainId | null;
   scrollAnchor: ScrollAnchor | null;
   chainLinks: ChainLink[];
 }
 
 interface FeedActions {
   viewGlobal: () => void;
   viewChain: (chainId: ChainId) => void;
   viewMerged: (chainId: ChainId) => void;
   saveScrollAnchor: (thoughtId: string, offset: number) => void;
   clearScrollAnchor: () => void;
   setChainLinks: (links: ChainLink[]) => void;
   addChainLink: (link: ChainLink) => void;
   removeChainLink: (linkId: string) => void;
   getVisibleThoughts: (allThoughts: ThoughtObject[]) => ThoughtObject[];
   getMergeSet: (chainId: ChainId) => ChainId[];
   resetStore: () => void;
 }
 
 type FeedStore = FeedState & FeedActions;
 
 export const useFeedStore = create<FeedStore>()((set, get) => ({
   // Initial state
   scope: 'global',
   focusedChainId: null,
   scrollAnchor: null,
   chainLinks: [],
 
   // View actions
   viewGlobal: () => {
     set({
       scope: 'global',
       focusedChainId: null,
     });
   },
 
   viewChain: (chainId) => {
     const { scope } = get();
     // Save scroll anchor before switching if coming from global
     set({
       scope: 'chain',
       focusedChainId: chainId,
     });
   },
 
   viewMerged: (chainId) => {
     set({
       scope: 'merged',
       focusedChainId: chainId,
     });
   },
 
   // Scroll anchor management
   saveScrollAnchor: (thoughtId, offset) => {
     set({ scrollAnchor: { thoughtId, offset } });
   },
 
   clearScrollAnchor: () => {
     set({ scrollAnchor: null });
   },
 
   // Chain links management
   setChainLinks: (links) => {
     set({ chainLinks: links });
   },
 
   addChainLink: (link) => {
     set((state) => ({
       chainLinks: [...state.chainLinks, link],
     }));
   },
 
   removeChainLink: (linkId) => {
     set((state) => ({
       chainLinks: state.chainLinks.filter((l) => l.id !== linkId),
     }));
   },
 
   // Compute 1-hop merge set for a chain (contextual)
   getMergeSet: (chainId) => {
     const { chainLinks } = get();
     const mergeSet = new Set<ChainId>([chainId]);
     
     // Include chains where this chain is the source or target (1-hop)
     chainLinks.forEach((link) => {
       if (link.from_chain_id === chainId) {
         mergeSet.add(link.to_chain_id);
       }
       if (link.to_chain_id === chainId) {
         mergeSet.add(link.from_chain_id);
       }
     });
     
     return Array.from(mergeSet);
   },
 
   // Get visible thoughts based on current scope
   getVisibleThoughts: (allThoughts) => {
     const { scope, focusedChainId, getMergeSet } = get();
     
     // Global: return all
     if (scope === 'global' || !focusedChainId) {
       return allThoughts;
     }
     
     // Chain: filter to focused chain only
     if (scope === 'chain') {
       return allThoughts.filter((t) => t.chain_id === focusedChainId);
     }
     
     // Merged: filter to merge set
     if (scope === 'merged') {
       const mergeSet = getMergeSet(focusedChainId);
       return allThoughts.filter((t) => t.chain_id && mergeSet.includes(t.chain_id));
     }
     
     return allThoughts;
   },
 
   // Reset store
   resetStore: () => {
     set({
       scope: 'global',
       focusedChainId: null,
       scrollAnchor: null,
       chainLinks: [],
     });
   },
 }));