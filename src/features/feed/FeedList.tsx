import React, { memo, useEffect, useRef } from 'react';
import { BasePost } from '@/types/post';
import { PostToSparkCard } from '@/components/brainstorm/PostToSparkCard';
import { useBrainstormExperienceStore } from '@/features/brainstorm/stores/experience';

type Props = {
  items: BasePost[];
  onEndReached: () => void;
  loading: boolean;
  onSelect?: (post: BasePost) => void;
};

const GlassCardWrapper = ({ children }: { children: React.ReactNode }) => (
  <li className="
    w-full rounded-3xl overflow-hidden
    backdrop-blur-xl
    bg-white/5 dark:bg-white/10
    border border-white/10
    shadow-[0_0_20px_rgba(0,0,0,0.25)]
    transition-all duration-300
    hover:bg-white/8 hover:shadow-[0_0_25px_rgba(0,0,0,0.35)]
  ">
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
    // Always dispatch thread event for main feed clicks (primary behavior)
    // This allows BrainstormFeed to handle the thread view
    window.dispatchEvent(
      new CustomEvent('pb:brainstorm:show-thread', {
        detail: { post, postId: post.id },
      })
    );
    
    // Also call onSelect if provided (for backward compatibility with FeedContainer)
    if (onSelect) {
      onSelect(post);
    } else {
      // Set active post in store as fallback
      setActivePost(post);
    }
  };

  return (
    <>
      <ul
        className="
          mx-auto
          w-full
          max-w-3xl
          px-4
          space-y-6
          pb-20
        "
      >
        {items.map((item) => (
          <GlassCardWrapper key={item.id}>
            <PostToSparkCard post={item} onSelect={handlePostSelect} />
          </GlassCardWrapper>
        ))}
      </ul>
      {loading ? (
        <div className="py-4 text-center text-muted-foreground">Loading...</div>
      ) : null}
      <div ref={sentinelRef} style={{ height: '1px' }} />
    </>
  );
});

