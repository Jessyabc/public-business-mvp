import React, { memo, useEffect, useRef, useState } from 'react';
import { BasePost } from '@/types/post';
import { PostToSparkCard } from '@/components/brainstorm/PostToSparkCard';
import { useBrainstormExperienceStore } from '@/features/brainstorm/stores/experience';
import { SwipeableCard } from '@/components/brainstorm/SwipeableCard';
import { LineagePreview } from '@/components/brainstorm/LineagePreview';
import { ConstellationView } from '@/components/brainstorm/ConstellationView';
import { cn } from '@/lib/utils';
import { useDiscussLensSafe } from '@/contexts/DiscussLensContext';

type Props = {
  items: BasePost[];
  onEndReached: () => void;
  loading: boolean;
  onSelect?: (post: BasePost) => void;
  /** Pre-fetched author map from batch lookup - keyed by user_id */
  authorMap?: Map<string, string | null>;
};

const GlassCardWrapper = ({ 
  children, 
  index,
  postId,
  postTitle,
  isBusiness,
}: { 
  children: React.ReactNode; 
  index: number;
  postId: string;
  postTitle?: string;
  isBusiness: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Business lens: crisp neumorphic card container
  const businessCardStyle = isBusiness ? {
    background: '#EAE6E2',
    borderRadius: '24px',
    boxShadow: isHovered 
      ? '10px 10px 24px rgba(166, 150, 130, 0.35), -10px -10px 24px rgba(255, 255, 255, 0.95)'
      : '8px 8px 20px rgba(166, 150, 130, 0.3), -8px -8px 20px rgba(255, 255, 255, 0.85)',
    transition: 'all 0.3s ease-out',
    transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
  } : {};

  return (
    <li 
      className={cn(
        "w-full rounded-3xl overflow-visible relative group",
        "animate-feed-card-enter"
      )}
      style={{ 
        animationDelay: `${index * 80}ms`,
        animationFillMode: 'backwards'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Lineage preview above - only for public lens */}
      {!isBusiness && <LineagePreview postId={postId} isHovered={isHovered} position="above" />}
      
      {/* Connection line to next card - solid blue glowing for continuations (matching ConstellationView) */}
      {!isBusiness && (
        <div 
          className="absolute -bottom-6 left-8 w-0.5 h-6 pointer-events-none z-10"
          style={{
            background: 'hsl(var(--accent))',
            boxShadow: '0 0 8px hsl(var(--accent)), 0 0 4px hsl(var(--accent))80',
            opacity: 0.9,
          }}
        />
      )}
      
      <SwipeableCard
        postId={postId}
        postTitle={postTitle}
      >
        <div 
          className={cn(
            "rounded-3xl overflow-hidden",
            "transition-all duration-500 ease-out",
            // Public lens: glass aesthetic
            !isBusiness && [
              "backdrop-blur-xl",
              "bg-white/5 dark:bg-white/10",
              "border border-white/10",
              "shadow-[0_0_20px_rgba(0,0,0,0.25)]",
              "group-hover:bg-white/8 group-hover:shadow-[0_0_30px_rgba(72,159,227,0.2)]",
              "group-hover:border-white/20",
            ]
          )}
          style={businessCardStyle}
        >
          {children}
        </div>
      </SwipeableCard>
      
      {/* Lineage preview below - only for public lens */}
      {!isBusiness && <LineagePreview postId={postId} isHovered={isHovered} position="below" />}
    </li>
  );
};

export const FeedList = memo(function FeedList({ items, onEndReached, loading, onSelect, authorMap }: Props) {
  const { lens } = useDiscussLensSafe();
  const isBusiness = lens === 'business';
  const setActivePost = useBrainstormExperienceStore((state) => state.setActivePost);
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

  const handlePostSelect = (post: BasePost) => {
    window.dispatchEvent(
      new CustomEvent('pb:brainstorm:show-thread', {
        detail: { post, postId: post.id },
      })
    );
    
    if (onSelect) {
      onSelect(post);
    } else {
      setActivePost(post);
    }
  };

  // Empty state when no items
  if (items.length === 0 && !loading) {
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
            {isBusiness ? "No business insights yet" : "No sparks yet"}
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
      <ul className="mx-auto w-full max-w-3xl px-4 space-y-6 pb-20 relative">
        {/* Thread connection line overlay - only for public lens */}
        {!isBusiness && (
          <div className="absolute left-8 top-0 bottom-20 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent pointer-events-none" />
        )}
        
        {items.map((item, index) => (
          <GlassCardWrapper 
            key={item.id} 
            index={index}
            postId={item.id}
            postTitle={item.title || item.content?.slice(0, 40)}
            isBusiness={isBusiness}
          >
            <PostToSparkCard 
              post={item} 
              onSelect={handlePostSelect} 
              authorDisplayName={authorMap?.get(item.user_id ?? '')}
            />
          </GlassCardWrapper>
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
          const post = items.find(p => p.id === postId);
          if (post) handlePostSelect(post);
        }}
      />
    </>
  );
});
