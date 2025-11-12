import React from 'react';
import { useUniversalFeed } from './hooks/useUniversalFeed';
import { useFeedFilters } from './hooks/useFeedFilters';
import { FeedList } from './FeedList';

type Props = {
  mode: 'public' | 'business';
  orgId?: string | null;
  initialKinds?: ('open_idea' | 'brainstorm' | 'business_insight')[];
};

export function FeedContainer({ mode, orgId = null, initialKinds }: Props) {
  const filters = useFeedFilters({ kinds: initialKinds });
  const feed = useUniversalFeed({
    mode,
    kinds: filters.kinds,
    sort: filters.sort,
    search: filters.search,
    org_id: mode === 'business' ? orgId ?? null : null,
    pageSize: 20,
  });

  return (
    <div style={{ flex: 1 }}>
      {/* reserved: future filter bar / pulses / breadcrumbs */}
      <FeedList
        items={feed.items}
        onEndReached={feed.loadMore}
        loading={feed.loading}
      />
    </div>
  );
}

