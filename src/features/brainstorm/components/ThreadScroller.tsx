import { useEffect, useRef, useState } from 'react';
import { useBrainstormStore } from '../store';
import { GlassCard } from '@/ui/components/GlassCard';
import { Badge } from '@/components/ui/badge';
import { FeedCard } from './FeedCard';
import { SoftHandoff } from './SoftHandoff';
import type { PostNode } from '@/types/brainstorm';
import { formatDistanceToNow } from 'date-fns';

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
    softLinksForSelected,
  } = useBrainstormStore();

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const softLinks = softLinksForSelected();

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
    <div className="relative h-full w-full flex">
      {/* Soft links panel - Left side */}
      {softLinks.length > 0 && (
        <div className="absolute left-8 top-0 bottom-0 w-80 py-8 flex flex-col animate-fade-in z-20">
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="text-xs uppercase tracking-wide text-foreground/80 font-medium">
              Soft links
            </div>
            <div className="h-[1px] flex-1 border-t border-dashed border-accent/40" />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 scrollbar-thin scrollbar-thumb-foreground/20 scrollbar-track-transparent">
            {softLinks.map((link) => (
              <button
                key={link.child_post_id}
                onClick={() => selectById(link.child_post_id)}
                className="w-full text-left"
              >
                <GlassCard className="w-full backdrop-blur-md border-dashed border-accent/40 opacity-80 hover:opacity-100 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] hover:ring-2 hover:ring-accent/40 p-4 cursor-pointer">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="text-sm font-semibold text-foreground/95">
                      {link.child_title || 'Related brainstorm'}
                    </div>
                    <Badge className="text-[10px] border-accent/30 text-accent px-1.5 py-0">
                      soft
                    </Badge>
                  </div>
                  <div className="text-xs line-clamp-3 text-foreground/75 leading-relaxed mb-2">
                    Click to explore this branch
                  </div>
                  <div className="text-[11px] text-foreground/60">
                    {link.child_like_count || 0} likes
                  </div>
                </GlassCard>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main feed - Center */}
      <GlassCard className="relative z-10 p-0 overflow-hidden flex-1 mx-auto max-w-4xl">
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
    </div>
  );
}
