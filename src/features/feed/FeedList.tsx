import React, { memo, useEffect, useRef, useState } from 'react';
import { BasePost } from '@/types/post';
import { PostToSparkCard } from '@/components/brainstorm/PostToSparkCard';
import { useBrainstormExperienceStore } from '@/features/brainstorm/stores/experience';
import { SwipeableCard } from '@/components/brainstorm/SwipeableCard';
import { LineagePreview } from '@/components/brainstorm/LineagePreview';
import { cn } from '@/lib/utils';

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
  onSwipeLeft,
  onSwipeRight,
  onLongPress
}: { 
  children: React.ReactNode; 
  index: number;
  postId: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onLongPress?: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

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
      {/* Lineage preview above */}
      <LineagePreview postId={postId} isHovered={isHovered} position="above" />
      
      {/* Connection line to next card */}
      <div className="absolute -bottom-6 left-8 w-px h-6 bg-gradient-to-b from-white/20 via-[var(--accent)]/30 to-transparent pointer-events-none z-10" />
      
      <SwipeableCard
        postId={postId}
        onSwipeLeft={onSwipeLeft}
        onSwipeRight={onSwipeRight}
        onLongPress={onLongPress}
      >
        <div className={cn(
          "rounded-3xl overflow-hidden",
          "backdrop-blur-xl",
          "bg-white/5 dark:bg-white/10",
          "border border-white/10",
          "shadow-[0_0_20px_rgba(0,0,0,0.25)]",
          "transition-all duration-500 ease-out",
          "group-hover:bg-white/8 group-hover:shadow-[0_0_30px_rgba(72,159,227,0.2)]",
          "group-hover:border-white/20"
        )}>
          {children}
        </div>
      </SwipeableCard>
      
      {/* Lineage preview below */}
      <LineagePreview postId={postId} isHovered={isHovered} position="below" />
    </li>
  );
};

export const FeedList = memo(function FeedList({ items, onEndReached, loading, onSelect }: Props) {
  const setActivePost = useBrainstormExperienceStore((state) => state.setActivePost);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

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

  const handleContinueSpark = (post: BasePost) => {
    // Open composer with this post as parent
    window.dispatchEvent(
      new CustomEvent('pb:composer:open', {
        detail: { parentPost: post, mode: 'continue' },
      })
    );
  };

  const handleSaveReference = (post: BasePost) => {
    // Save as reference/bookmark
    window.dispatchEvent(
      new CustomEvent('pb:post:bookmark', {
        detail: { postId: post.id },
      })
    );
  };

  const handlePreview = (post: BasePost) => {
    // Show preview modal
    window.dispatchEvent(
      new CustomEvent('pb:post:preview', {
        detail: { post },
      })
    );
  };

  return (
    <>
      <ul className="mx-auto w-full max-w-3xl px-4 space-y-6 pb-20 relative">
        {/* Thread connection line overlay */}
        <div className="absolute left-8 top-0 bottom-20 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent pointer-events-none" />
        
        {items.map((item, index) => (
          <GlassCardWrapper 
            key={item.id} 
            index={index}
            postId={item.id}
            onSwipeLeft={() => handleContinueSpark(item)}
            onSwipeRight={() => handleSaveReference(item)}
            onLongPress={() => handlePreview(item)}
          >
            <PostToSparkCard post={item} onSelect={handlePostSelect} />
          </GlassCardWrapper>
        ))}
      </ul>
      
      {loading && (
        <div className="py-4 text-center">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
            <span>Loading...</span>
          </div>
        </div>
      )}
      <div ref={sentinelRef} style={{ height: '1px' }} />
    </>
  );
});
