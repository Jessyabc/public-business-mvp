import React, { memo, useEffect, useRef } from 'react';
import { BasePost } from '@/types/post';
import { BrainstormPostCard } from '@/features/brainstorm/components/BrainstormPostCard';
import { useBrainstormExperienceStore } from '@/features/brainstorm/stores/experience';

type Props = {
  items: BasePost[];
  onEndReached: () => void;
  loading: boolean;
};

export const FeedList = memo(function FeedList({ items, onEndReached, loading }: Props) {
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

  return (
    <>
      <div className="space-y-4">
        {items.map((item) => (
          <BrainstormPostCard key={item.id} post={item} onSelect={setActivePost} />
        ))}
      </div>
      {loading ? (
        <div className="py-4 text-center text-muted-foreground">Loading...</div>
      ) : null}
      <div ref={sentinelRef} style={{ height: '1px' }} />
    </>
  );
});

