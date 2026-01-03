import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchLineageClusterFeed } from '@/lib/feedQueries';
import { supabase } from '@/integrations/supabase/client';
import type { LineageCluster } from '@/lib/clusterUtils';
import { PostKind } from '@/types/post';

export function useLineageClusterFeed(params: {
  mode: 'public' | 'business';
  kinds?: PostKind[];
  search?: string | null;
  org_id?: string | null;
  pageSize?: number;
}) {
  const [clusters, setClusters] = useState<LineageCluster[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [eof, setEof] = useState(false);
  const loadingRef = useRef(false);

  const load = useCallback(async (reset = false): Promise<void> => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    
    try {
      const { clusters: chunk, nextCursor } = await fetchLineageClusterFeed(supabase, {
        mode: params.mode,
        kinds: params.kinds,
        search: params.search,
        org_id: params.org_id,
        cursor: reset ? null : cursor,
        limit: params.pageSize ?? 20,
      });

      setClusters((prev) => (reset ? chunk : [...prev, ...chunk]));
      setCursor(nextCursor);
      setEof(!nextCursor);
    } catch (error) {
      console.error('Failed to load cluster feed:', error);
      setEof(true);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [params.mode, params.kinds, params.search, params.org_id, params.pageSize, cursor]);

  useEffect(() => {
    setCursor(null);
    setEof(false);
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.mode, JSON.stringify(params.kinds), params.search, params.org_id]);

  const loadMore = useCallback(async () => {
    if (!eof && !loading) {
      await load(false);
    }
  }, [eof, loading, load]);

  const refresh = useCallback(async () => {
    setCursor(null);
    setEof(false);
    await load(true);
  }, [load]);

  return {
    clusters,
    loadMore,
    loading,
    eof,
    refresh,
  };
}

