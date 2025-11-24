import * as React from 'react';
import { BasePost, PostKind } from '@/types/post';
import { useBrainstormExperienceStore } from '@/features/brainstorm/stores/experience';
import { useUniversalFeed } from './hooks/useUniversalFeed';
import { useFeedFilters } from './hooks/useFeedFilters';
import { FeedList } from './FeedList';
type BrainstormFeedMode = 'brainstorm_main' | 'brainstorm_open_ideas' | 'brainstorm_cross_links' | 'brainstorm_last_seen';
type Props = {
  mode: BrainstormFeedMode;
  activePostId?: string | null;
  initialKinds?: PostKind[];
  onItemsChange?: (items: BasePost[]) => void;
  /** Optional: render function to customize the feed display */
  renderFeed?: (items: BasePost[], feed: ReturnType<typeof useUniversalFeed>) => React.ReactNode;
};
const DEFAULT_MAIN_KINDS: PostKind[] = ['Spark'];

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
  const lastSeen = useBrainstormExperienceStore(state => state.lastSeen);
  const resolvedKinds = initialKinds ?? (mode === 'brainstorm_open_ideas' ? ['Spark'] : DEFAULT_MAIN_KINDS);
  const filters = useFeedFilters({
    kinds: resolvedKinds
  });
  React.useEffect(() => {
    if (mode !== 'brainstorm_last_seen') return;
    onItemsChange?.(lastSeen);
  }, [mode, lastSeen, onItemsChange]);
  const feed = useUniversalFeed({
    mode,
    kinds: mode === 'brainstorm_main' ? filters.kinds : resolvedKinds,
    sort: mode === 'brainstorm_main' ? filters.sort : undefined,
    search: mode === 'brainstorm_main' ? filters.search : undefined,
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
        <FeedList items={syntheticFeed.items} onEndReached={syntheticFeed.loadMore} loading={syntheticFeed.loading} />
      </div>;
  }
  if (renderFeed) {
    return <>{renderFeed(feed.items, feed)}</>;
  }
  return <div style={{
    flex: 1
  }}>
      <FeedList items={feed.items} onEndReached={feed.loadMore} loading={feed.loading} className="pl-[10px] px-px pr-[10px] py-[10px]" />
    </div>;
}