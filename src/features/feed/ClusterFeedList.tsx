import { memo, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { LineageClusterCard } from './LineageClusterCard';
import { ConstellationView } from '@/components/brainstorm/ConstellationView';
import type { LineageCluster } from '@/lib/clusterUtils';
import type { BasePost } from '@/types/post';
import { useDiscussLensSafe } from '@/contexts/DiscussLensContext';

interface ClusterFeedListProps {
  clusters: LineageCluster[];
  onEndReached: () => void;
  loading: boolean;
  onSelect: (post: BasePost) => void;
}

export const ClusterFeedList = memo(function ClusterFeedList({
  clusters,
  onEndReached,
  loading,
  onSelect,
}: ClusterFeedListProps) {
  const { lens } = useDiscussLensSafe();
  const isBusiness = lens === 'business';
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  
  // Constellation view state
  const [constellationPostId, setConstellationPostId] = useState<string | null>(null);

  useEffect(() => {
    if (!sentinelRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          onEndReached();
        }
      },
      { threshold: 0.4 }
    );

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [onEndReached, loading]);

  // Listen for long press event to open constellation view
  useEffect(() => {
    const handleOpenConstellation = (e: CustomEvent<{ postId: string }>) => {
      setConstellationPostId(e.detail.postId);
    };

    window.addEventListener('pb:post:preview' as any, handleOpenConstellation);
    return () => {
      window.removeEventListener('pb:post:preview' as any, handleOpenConstellation);
    };
  }, []);

  const handleSelectPost = (postId: string) => {
    // Find the post in clusters
    for (const cluster of clusters) {
      if (cluster.spark.id === postId) {
        onSelect(cluster.spark);
        return;
      }
      const continuation = cluster.continuations.find(c => c.post.id === postId);
      if (continuation) {
        onSelect(continuation.post);
        return;
      }
    }
  };

  const handleExpandDeeper = (clusterId: string) => {
    // For now, open constellation view
    setConstellationPostId(clusterId);
  };

  // Empty state when no clusters
  if (clusters.length === 0 && !loading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12">
        <div 
          className={cn(
            "rounded-3xl p-8 text-center",
            isBusiness 
              ? "bg-[#EAE6E2]" 
              : "bg-white/5 backdrop-blur-xl border border-white/10"
          )}
          style={isBusiness ? {
            boxShadow: '8px 8px 20px rgba(166, 150, 130, 0.3), -8px -8px 20px rgba(255, 255, 255, 0.85)',
          } : undefined}
        >
          <div className={cn(
            "w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center",
            isBusiness ? "bg-[#4A7C9B]/10" : "bg-[var(--accent)]/10"
          )}>
            <svg 
              className={cn("w-8 h-8", isBusiness ? "text-[#4A7C9B]" : "text-[var(--accent)]")}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className={cn(
            "text-lg font-semibold mb-2",
            isBusiness ? "text-[#3D3833]" : "text-white"
          )}>
            {isBusiness ? "No business insights yet" : "No idea clusters yet"}
          </h3>
          <p className={cn(
            "text-sm mb-4",
            isBusiness ? "text-[#6B635B]" : "text-white/60"
          )}>
            {isBusiness 
              ? "Business insights will appear here once members start sharing."
              : "Be the first to spark a conversation! Share your thoughts with the community."
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ul className="mx-auto w-full max-w-3xl px-4 space-y-10 pb-20 relative">
        {clusters.map((cluster, index) => (
          <li 
            key={cluster.spark.id}
            className={cn(
              "w-full relative",
              "animate-feed-card-enter"
            )}
            style={{ 
              animationDelay: `${index * 80}ms`,
              animationFillMode: 'backwards'
            }}
          >
            <LineageClusterCard
              cluster={cluster}
              onSelectPost={handleSelectPost}
              onExpandDeeper={handleExpandDeeper}
            />
          </li>
        ))}
      </ul>
      
      {loading && (
        <div className="py-4 text-center">
          <div 
            className="inline-flex items-center gap-2"
            style={{ color: isBusiness ? '#6B635B' : 'var(--muted-foreground)' }}
          >
            <div 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: isBusiness ? '#4A7C9B' : 'var(--accent)' }}
            />
            <span>Loading...</span>
          </div>
        </div>
      )}
      <div ref={sentinelRef} style={{ height: '1px' }} />
      
      {/* Constellation View Modal */}
      <ConstellationView
        rootPostId={constellationPostId || ''}
        isOpen={!!constellationPostId}
        onClose={() => setConstellationPostId(null)}
        onSelectPost={(postId) => {
          setConstellationPostId(null);
          handleSelectPost(postId);
        }}
      />
    </>
  );
});

