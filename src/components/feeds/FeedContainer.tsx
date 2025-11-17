import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import type { Post } from '@/hooks/usePosts';
import { usePosts } from '@/hooks/usePosts';

type FeedItem = Post & {
  kind?: string;
  [key: string]: unknown;
};

interface FeedRenderState<T extends FeedItem> {
  items: T[];
  loading: boolean;
  error: string | null;
  kinds: string[];
  setKinds: React.Dispatch<React.SetStateAction<string[]>>;
  refresh: () => Promise<void>;
}

interface FeedContainerProps<T extends FeedItem = FeedItem> {
  mode?: 'public' | 'business';
  initialKinds?: string[];
  renderFeed: (items: T[], feed: FeedRenderState<T>) => ReactNode;
}

export function FeedContainer<T extends FeedItem = FeedItem>({
  mode = 'public',
  initialKinds = [],
  renderFeed,
}: FeedContainerProps<T>) {
  const { posts, loading, error, fetchPosts } = usePosts();
  const [kinds, setKinds] = useState<string[]>(initialKinds);

  const refresh = useCallback(async () => {
    await fetchPosts(mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    void fetchPosts(mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const filteredItems = useMemo(() => {
    if (!kinds.length) {
      return posts as unknown as T[];
    }

    return (posts as FeedItem[]).filter(item => {
      const kind = item.kind ?? item.type;
      return kind ? kinds.includes(kind) : false;
    }) as unknown as T[];
  }, [posts, kinds]);

  const feedState: FeedRenderState<T> = {
    items: filteredItems,
    loading,
    error,
    kinds,
    setKinds,
    refresh,
  };

  return (
    <div className="h-full w-full">
      {renderFeed(filteredItems, feedState)}
    </div>
  );
}
