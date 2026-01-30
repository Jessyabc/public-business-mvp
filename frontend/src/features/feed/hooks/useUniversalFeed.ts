import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchUniversalFeed, fetchCrossLinkedPosts } from '@/lib/feedQueries';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BasePost, PostKind } from '@/types/post';

export function useUniversalFeed(params: {
  mode:
    | 'public'
    | 'business'
    | 'brainstorm_main'
    | 'brainstorm_cross_links'
    | 'brainstorm_last_seen';
  kinds?: PostKind[];
  sort?: 'new' | 'hot' | 'score';
  search?: string | null;
  org_id?: string | null;
  pageSize?: number;
  activePostId?: string | null;
}) {
  const { user } = useAuth();
  const [items, setItems] = useState<BasePost[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [eof, setEof] = useState(false);
  const loadingRef = useRef(false);
  
  // Batch author map for performance optimization
  const [authorMap, setAuthorMap] = useState<Map<string, string | null>>(new Map());

  const load = useCallback(async (reset = false): Promise<void> => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    
    try {
        if (params.mode === 'brainstorm_last_seen') {
          setItems([]);
          setCursor(null);
          setEof(true);
          return;
        }

        if (params.mode === 'brainstorm_cross_links') {
          const crossLinked = await fetchCrossLinkedPosts(supabase, {
            postId: params.activePostId,
          });
          setItems(crossLinked);
          setCursor(null);
          setEof(true);
          return;
        }

        // Map mode to feed query mode
        const feedMode =
          params.mode === 'public' || params.mode === 'brainstorm_main'
            ? 'public'
            : params.mode === 'business'
            ? 'business'
            : 'public';

        const { items: chunk, nextCursor, authorMap: newAuthorMap } = await fetchUniversalFeed(supabase, {
          mode: feedMode,
          kinds: params.kinds,
          sort: params.sort,
          search: params.search,
          org_id: feedMode === 'business' ? params.org_id : null,
          user_id: feedMode === 'business' ? user?.id || null : null,
          cursor: reset ? null : cursor,
          limit: params.pageSize ?? 20,
        });

        setItems((prev) => (reset ? chunk : [...prev, ...chunk]));
        setCursor(nextCursor);
        setEof(!nextCursor);
        
        // Merge new author data into existing map
        if (newAuthorMap) {
          setAuthorMap((prev) => {
            const merged = new Map(prev);
            newAuthorMap.forEach((value, key) => merged.set(key, value));
            return merged;
          });
        }
      } catch (error) {
        console.error('Failed to load feed:', error);
        setEof(true);
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    }, [params.mode, params.kinds, params.sort, params.search, params.org_id, params.pageSize, params.activePostId, cursor, user?.id]);

  useEffect(() => {
    setCursor(null);
    setEof(false);
    setAuthorMap(new Map()); // Reset author map on mode change
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.mode, JSON.stringify(params.kinds), params.sort, params.search, params.org_id, params.activePostId]);

  return { 
    items, 
    loadMore: () => !eof && load(false), 
    loading, 
    eof, 
    refresh: () => load(true),
    authorMap, // Expose author map for components to use
  };
}
