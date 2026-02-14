/**
 * Think Space: ThinkFeed - Continuous Feed Surface
 * 
 * Single continuous feed showing ALL thoughts in strict timestamp order.
 * Supports three projections: global/chain/merged with subtle transitions.
 * Includes infinite scroll via IntersectionObserver.
 */

import { useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useWorkspaceStore } from '../useWorkspaceStore';
import { useChainStore } from '../stores/chainStore';
import { useFeedStore } from '../stores/feedStore';
import { ThoughtCard } from './ThoughtCard';
import { ChainStartMarker } from './ChainStartMarker';
import { FeedScopeIndicator } from './FeedScopeIndicator';
import { SearchInline } from './SearchInline';


const PB_BLUE = '#489FE3';

interface ThinkFeedProps {
  onLoadMore?: () => void;
}

export function ThinkFeed({ onLoadMore }: ThinkFeedProps) {
  const { getGlobalFeed, hasMorePages } = useWorkspaceStore();
  const { getChainById } = useChainStore();
  const { getVisibleThoughts } = useFeedStore();
  const feedRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Get all anchored thoughts in time order
  const allThoughts = getGlobalFeed();
  
  // Filter based on current scope
  const visibleThoughts = useMemo(() => {
    return getVisibleThoughts(allThoughts);
  }, [allThoughts, getVisibleThoughts]);

  // Infinite scroll observer
  useEffect(() => {
    if (!sentinelRef.current || !onLoadMore) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMorePages) {
          onLoadMore();
        }
      },
      { rootMargin: '200px' }
    );
    
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [onLoadMore, hasMorePages]);

  // Build a map of chain anchor thought IDs for marker rendering
  const chainAnchorIds = useMemo(() => {
    const anchors = new Map<string, string>();
    const seenChains = new Set<string>();
    
    const sorted = [...visibleThoughts].sort((a, b) => {
      const timeA = new Date(a.anchored_at || a.created_at).getTime();
      const timeB = new Date(b.anchored_at || b.created_at).getTime();
      return timeA - timeB;
    });
    
    sorted.forEach((thought) => {
      if (thought.chain_id && !seenChains.has(thought.chain_id)) {
        seenChains.add(thought.chain_id);
        anchors.set(thought.chain_id, thought.id);
      }
    });
    
    return anchors;
  }, [visibleThoughts]);

  // Build a set of "latest thought per chain" IDs — only these are editable
  const latestPerChain = useMemo(() => {
    const latest = new Set<string>();
    const seenChains = new Set<string>();
    
    // visibleThoughts is already sorted newest-first
    for (const thought of visibleThoughts) {
      const key = thought.chain_id || '__no_chain__';
      if (!seenChains.has(key)) {
        seenChains.add(key);
        latest.add(thought.id);
      }
    }
    
    return latest;
  }, [visibleThoughts]);

  const isChainAnchor = useCallback((thought: typeof visibleThoughts[0]) => {
    return thought.chain_id && chainAnchorIds.get(thought.chain_id) === thought.id;
  }, [chainAnchorIds]);

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
      <div className="flex items-center justify-between mb-4 gap-3">
        <FeedScopeIndicator />
        <SearchInline className="max-w-[200px]" />
      </div>

      {/* Feed items */}
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
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative"
            >
             <ThoughtCard thought={thought} isEditable={latestPerChain.has(thought.id)} />

             {isAnchor && chain && (
               <ChainStartMarker chain={chain} anchorThought={thought} />
             )}

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

      {/* Infinite scroll sentinel */}
      {hasMorePages && (
        <div ref={sentinelRef} className="flex justify-center py-6">
          <Loader2 className="w-4 h-4 animate-spin" style={{ color: `${PB_BLUE}50` }} />
        </div>
      )}
    </div>
  );
}
