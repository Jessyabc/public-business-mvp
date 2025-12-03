import React, { memo, useEffect, useRef } from 'react';
import { BasePost } from '@/types/post';
import { PostToSparkCard } from '@/components/brainstorm/PostToSparkCard';
import { useBrainstormExperienceStore } from '@/features/brainstorm/stores/experience';
import { cn } from '@/lib/utils';

type Props = {
  items: BasePost[];
  onEndReached: () => void;
  loading: boolean;
  onSelect?: (post: BasePost) => void;
};

const GlassCardWrapper = ({ children, index }: { children: React.ReactNode; index: number }) => (
  <li 
    className={cn(
      "w-full rounded-3xl overflow-hidden relative",
      "backdrop-blur-xl",
      "bg-white/5 dark:bg-white/10",
      "border border-white/10",
      "shadow-[0_0_20px_rgba(0,0,0,0.25)]",
      "transition-all duration-500 ease-out",
      "hover:bg-white/8 hover:shadow-[0_0_30px_rgba(72,159,227,0.2)]",
      "hover:border-white/20",
      "animate-feed-card-enter"
    )}
    style={{ 
      animationDelay: `${index * 80}ms`,
      animationFillMode: 'backwards'
    }}
  >
    {/* Connection line to next card */}
    <div className="absolute -bottom-6 left-8 w-px h-6 bg-gradient-to-b from-white/20 via-[var(--accent)]/30 to-transparent pointer-events-none" />
    {children}
  </li>
);

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

  return (
    <>
      <ul className="mx-auto w-full max-w-3xl px-4 space-y-6 pb-20 relative">
        {/* Thread connection line overlay */}
        <div className="absolute left-8 top-0 bottom-20 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent pointer-events-none" />
        
        {items.map((item, index) => (
          <GlassCardWrapper key={item.id} index={index}>
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
