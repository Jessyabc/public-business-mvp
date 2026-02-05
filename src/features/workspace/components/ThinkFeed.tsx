 /**
  * Think Space: ThinkFeed - Continuous Feed Surface
  * 
  * Single continuous feed showing ALL thoughts in strict timestamp order.
  * Supports three projections: global/chain/merged with subtle transitions.
  * 
  * Key features:
  * - Vertical continuity line between same-chain adjacent thoughts
  * - Chain anchor markers (not adjacency-based)
  * - Scope transitions via fade/reflow
  */
 
 import { useCallback, useMemo, useRef } from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
 import { useWorkspaceStore } from '../useWorkspaceStore';
 import { useChainStore } from '../stores/chainStore';
 import { useFeedStore } from '../stores/feedStore';
 import { ThoughtCard } from './ThoughtCard';
 import { ChainStartMarker } from './ChainStartMarker';
 import { FeedScopeIndicator } from './FeedScopeIndicator';
import { SearchInline } from './SearchInline';
 import { cn } from '@/lib/utils';
 
 // PB Blue for continuity line
 const PB_BLUE = '#489FE3';
 
 export function ThinkFeed() {
   const { getGlobalFeed, getChainAnchor } = useWorkspaceStore();
   const { getChainById } = useChainStore();
   const { scope, focusedChainId, getVisibleThoughts } = useFeedStore();
   const feedRef = useRef<HTMLDivElement>(null);
 
   // Get all anchored thoughts in time order
   const allThoughts = getGlobalFeed();
   
   // Filter based on current scope
   const visibleThoughts = useMemo(() => {
     return getVisibleThoughts(allThoughts);
   }, [allThoughts, getVisibleThoughts]);
 
   // Build a map of chain anchor thought IDs for marker rendering
   const chainAnchorIds = useMemo(() => {
     const anchors = new Map<string, string>(); // chainId -> thoughtId
     const seenChains = new Set<string>();
     
     // Process in reverse order (oldest first) to find true anchors
     const sorted = [...visibleThoughts].sort((a, b) => {
       const timeA = new Date(a.anchored_at || a.created_at).getTime();
       const timeB = new Date(b.anchored_at || b.created_at).getTime();
       return timeA - timeB; // Oldest first
     });
     
     sorted.forEach((thought) => {
       if (thought.chain_id && !seenChains.has(thought.chain_id)) {
         seenChains.add(thought.chain_id);
         anchors.set(thought.chain_id, thought.id);
       }
     });
     
     return anchors;
   }, [visibleThoughts]);
 
   // Check if a thought is the anchor for its chain
   const isChainAnchor = useCallback((thought: typeof visibleThoughts[0]) => {
     return thought.chain_id && chainAnchorIds.get(thought.chain_id) === thought.id;
   }, [chainAnchorIds]);
 
   // Check if adjacent thoughts share the same chain (for continuity line)
   const hasContinuityLine = useCallback((index: number) => {
     if (index >= visibleThoughts.length - 1) return false;
     const current = visibleThoughts[index];
     const next = visibleThoughts[index + 1];
     return current.chain_id && current.chain_id === next.chain_id;
   }, [visibleThoughts]);
 
   if (visibleThoughts.length === 0) {
     return null;
   }
 
   return (
     <div ref={feedRef} className="think-feed w-full max-w-2xl mx-auto">
       {/* Feed header with scope indicator and search */}
       <div className="flex items-start justify-between mb-4 gap-4">
         <FeedScopeIndicator />
         <SearchInline />
       </div>
 
       {/* Feed items with AnimatePresence for smooth transitions */}
       <AnimatePresence mode="popLayout">
         {visibleThoughts.map((thought, index) => {
           const isAnchor = isChainAnchor(thought);
           const showContinuityLine = hasContinuityLine(index);
           const chain = thought.chain_id ? getChainById(thought.chain_id) : null;
 
           return (
             <motion.div
               key={thought.id}
               layout
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95 }}
               transition={{ 
                 duration: 0.2,
                 ease: 'easeOut',
               }}
               className="relative"
             >
              {/* Thought card */}
              <ThoughtCard thought={thought} />
 
              {/* Chain anchor marker - placed after the first thought to avoid confusion */}
              {isAnchor && chain && (
                <ChainStartMarker
                  chain={chain}
                  anchorThought={thought}
                />
              )}
 
               {/* Vertical continuity line to next thought */}
               {showContinuityLine && (
                 <div
                  className="absolute left-1/2 -translate-x-1/2 w-[2px] h-6"
                  style={{
                    top: 'calc(100% - 8px)',
                    background: `${PB_BLUE}25`,
                  }}
                />
              )}
             </motion.div>
           );
         })}
       </AnimatePresence>
     </div>
   );
 }
