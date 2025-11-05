import { useEffect, useRef, useState } from 'react';
import { useBrainstormStore } from '../store';
import { GlassCard } from '@/ui/components/GlassCard';
import { FeedCard } from './FeedCard';
import { SoftHandoff } from './SoftHandoff';
import type { PostNode } from '@/types/brainstorm';

/**
 * ThreadScroller - Infinite feed scrolling hard-link chains with soft handoffs
 */
export default function ThreadScroller() {
  const {
    threadQueue,
    isFetchingMore,
    selectedNodeId,
    buildHardChainFrom,
    setThreadQueue,
    loadMoreHardSegment,
    selectById,
  } = useBrainstormStore();

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize thread on mount or when selection changes
  useEffect(() => {
    if (selectedNodeId && !hasInitialized) {
      buildHardChainFrom(selectedNodeId).then((chain) => {
        setThreadQueue(chain);
        setHasInitialized(true);
      });
    }
  }, [selectedNodeId, hasInitialized, buildHardChainFrom, setThreadQueue]);

  // Infinite scroll handler
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const handleScroll = () => {
      const { scrollTop, clientHeight, scrollHeight } = scroller;
      
      // Load more when approaching bottom
      if (scrollTop + clientHeight >= scrollHeight - 240 && !isFetchingMore) {
        loadMoreHardSegment();
      }
    };

    scroller.addEventListener('scroll', handleScroll);
    return () => scroller.removeEventListener('scroll', handleScroll);
  }, [isFetchingMore, loadMoreHardSegment]);

  const isHandoffMarker = (node: PostNode) => {
    return node.id.startsWith('handoff-');
  };

  return (
    <GlassCard className="relative z-10 p-0 overflow-hidden">
      <div
        ref={scrollerRef}
        className="h-[70vh] md:h-[76vh] overflow-auto scrollbar-thin scrollbar-thumb-foreground/20 scrollbar-track-transparent"
      >
        {threadQueue.map((node, i) =>
          isHandoffMarker(node) ? (
            <SoftHandoff
              key={node.id}
              title={node.title || 'Continue thread'}
              onClick={() => {
                // Extract target ID from handoff marker
                const parts = node.id.split('-');
                const targetId = parts[parts.length - 1];
                if (targetId) selectById(targetId);
              }}
            />
          ) : (
            <FeedCard key={node.id} node={node} index={i} />
          )
        )}
        {isFetchingMore && (
          <div className="p-4 text-slate-400 text-center text-sm">
            Loading more…
          </div>
        )}
        {threadQueue.length === 0 && !isFetchingMore && (
          <div className="p-8 text-slate-400 text-center">
            No posts in thread
          </div>
        )}
      </div>
    </GlassCard>
  );
}
