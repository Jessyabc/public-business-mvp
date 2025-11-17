import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchUniversalFeed, fetchCrossLinkedPosts } from '@/lib/feedQueries';
import { supabase } from '@/integrations/supabase/client';
import { BasePost, PostKind } from '@/types/post';

export function useUniversalFeed(params: {
  mode: 'public' | 'business' | 'brainstorm_main' | 'brainstorm_open_ideas' | 'brainstorm_cross_links';
  kinds?: PostKind[];
  sort?: 'new' | 'hot' | 'score';
  search?: string | null;
  org_id?: string | null;
  pageSize?: number;
  activePostId?: string | null;
}) {
  const [items, setItems] = useState<BasePost[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [eof, setEof] = useState(false);
  const loadingRef = useRef(false);

    const load = useCallback(async (reset = false) => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    
    try {
        if (params.mode === 'brainstorm_cross_links') {
          const crossLinked = await fetchCrossLinkedPosts(supabase, {
            postId: params.activePostId,
          });
          setItems(crossLinked);
          setCursor(null);
          setEof(true);
          return;
        }

        const feedMode =
          params.mode === 'public' || params.mode === 'business'
            ? params.mode
            : 'public';

        const { items: chunk, nextCursor } = await fetchUniversalFeed(supabase, {
          mode: feedMode,
          kinds: params.kinds,
          sort: params.sort,
          search: params.search,
          org_id: feedMode === 'business' ? params.org_id : null,
          cursor: reset ? null : cursor,
          limit: params.pageSize ?? 20,
        });

      setItems(prev => reset ? chunk : [...prev, ...chunk]);
      setCursor(nextCursor);
      setEof(!nextCursor);
    } catch (error) {
      console.error('Failed to load feed:', error);
      setEof(true);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
    }, [params.mode, params.kinds, params.sort, params.search, params.org_id, params.pageSize, params.activePostId, cursor]);

  useEffect(() => {
    setCursor(null);
    setEof(false);
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.mode, JSON.stringify(params.kinds), params.sort, params.search, params.org_id, params.activePostId]);

  return { items, loadMore: () => !eof && load(false), loading, eof, refresh: () => load(true) };
}

