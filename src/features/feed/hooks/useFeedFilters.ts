import { useMemo, useState } from 'react';
import { PostKind } from '@/types/post';

export type FeedFilters = {
  kinds: PostKind[];
  sort: 'new' | 'hot' | 'score';
  search: string | null;
};

export function useFeedFilters(initial?: Partial<FeedFilters>) {
  const [kinds, setKinds] = useState<PostKind[]>(
    initial?.kinds ?? ['brainstorm','spark','business_insight']
  );
  const [sort, setSort] = useState<FeedFilters['sort']>(initial?.sort ?? 'new');
  const [search, setSearch] = useState<string | null>(initial?.search ?? null);

  return useMemo(() => ({ kinds, setKinds, sort, setSort, search, setSearch }), [kinds, sort, search]);
}

