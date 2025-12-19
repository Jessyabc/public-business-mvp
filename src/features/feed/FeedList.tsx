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
      
      {/* Connection line to next card - only for public lens */}
      {!isBusiness && (
        <div className="absolute -bottom-6 left-8 w-px h-6 bg-gradient-to-b from-white/20 via-[var(--accent)]/30 to-transparent pointer-events-none z-10" />
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

export const FeedList = memo(function FeedList({ items, onEndReached, loading, onSelect }: Props) {
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
            <PostToSparkCard post={item} onSelect={handlePostSelect} />
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
