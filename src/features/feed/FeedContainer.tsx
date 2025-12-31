import * as React from 'react';
import { BasePost, PostKind } from '@/types/post';
import { useBrainstormExperienceStore } from '@/features/brainstorm/stores/experience';
import { useUniversalFeed } from './hooks/useUniversalFeed';
import { useFeedFilters } from './hooks/useFeedFilters';
import { FeedList } from './FeedList';

type FeedMode = 'public' | 'business' | 'brainstorm_main' | 'brainstorm_open_ideas' | 'brainstorm_cross_links' | 'brainstorm_last_seen';

type Props = {
  mode: FeedMode;
  activePostId?: string | null;
  initialKinds?: PostKind[];
  onItemsChange?: (items: BasePost[]) => void;
  /** Optional: render function to customize the feed display */
  renderFeed?: (items: BasePost[], feed: ReturnType<typeof useUniversalFeed>) => React.ReactNode;
};

// Public = Sparks, Business = Insights
const PUBLIC_KINDS: PostKind[] = ['Spark'];
const BUSINESS_KINDS: PostKind[] = ['Insight'];

/**
 * FeedContainer now powers the Brainstorm layout columns via specialized modes:
 * - brainstorm_main: canonical public feed + filters
 * - brainstorm_last_seen: local history store
 * - brainstorm_cross_links: relation-driven feed
 * - brainstorm_open_ideas: spark-only list for the sidebar
 */

export function FeedContainer({
  mode,
  activePostId = null,
  initialKinds,
  onItemsChange,
  renderFeed
}: Props) {
  const [activePost, setActivePost] = React.useState<BasePost | null>(null);
  const lastSeen = useBrainstormExperienceStore(state => state.lastSeen);
  
  // Determine kinds based on mode: public = Sparks, business = Insights
  const resolvedKinds = React.useMemo(() => {
    if (initialKinds) return initialKinds;
    if (mode === 'business') return BUSINESS_KINDS;
    if (mode === 'brainstorm_open_ideas') return ['Spark'] as PostKind[];
    return PUBLIC_KINDS;
  }, [initialKinds, mode]);

  const isMainFeed = mode === 'public' || mode === 'business' || mode === 'brainstorm_main';
  
  const filters = useFeedFilters({
    kinds: resolvedKinds
  });

  React.useEffect(() => {
    if (mode !== 'brainstorm_last_seen') return;
    onItemsChange?.(lastSeen);
  }, [mode, lastSeen, onItemsChange]);

  const feed = useUniversalFeed({
    mode,
    kinds: isMainFeed ? filters.kinds : resolvedKinds,
    sort: isMainFeed ? filters.sort : undefined,
    search: isMainFeed ? filters.search : undefined,
    activePostId,
    pageSize: 20
  });
  React.useEffect(() => {
    if (mode === 'brainstorm_last_seen') return;
    onItemsChange?.(feed.items);
  }, [mode, feed.items, onItemsChange]);
  
  if (mode === 'brainstorm_last_seen') {
    const syntheticFeed: ReturnType<typeof useUniversalFeed> = {
      items: lastSeen,
      loadMore: async () => {},
      loading: false,
      eof: true,
      refresh: async () => {}
    };
    if (renderFeed) {
      return <>{renderFeed(lastSeen, syntheticFeed)}</>;
    }
    return <div style={{
      flex: 1
    }}>
        <FeedList items={syntheticFeed.items} onEndReached={syntheticFeed.loadMore} loading={syntheticFeed.loading} onSelect={setActivePost} />
      </div>;
  }
  if (renderFeed) {
    return <>{renderFeed(feed.items, feed)}</>;
  }
  return (
    <div style={{
      flex: 1
    }}>
      <FeedList items={feed.items} onEndReached={feed.loadMore} loading={feed.loading} onSelect={setActivePost} />
    </div>
  );
}