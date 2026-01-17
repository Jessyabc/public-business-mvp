import { SupabaseClient } from '@supabase/supabase-js';
import { BasePost, PostKind } from '@/types/post';
import { fetchClustersRpc, type LineageCluster } from './clusterUtils';

type FeedQueryOpts = {
  mode: 'public' | 'business';
  kinds?: PostKind[];
  limit?: number;
  cursor?: string | null;
  search?: string | null;
  org_id?: string | null;
  user_id?: string | null; // For filtering user's own posts across orgs
  sort?: 'new' | 'hot' | 'score';
};

/**
 * Batch fetch author profiles for a list of posts
 * Returns a Map of user_id -> display_name
 */
export async function batchFetchAuthors(
  sb: SupabaseClient,
  userIds: string[]
): Promise<Map<string, string | null>> {
  if (userIds.length === 0) return new Map();

  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  
  const { data, error } = await sb
    .from('profile_cards')
    .select('id, display_name')
    .in('id', uniqueIds);

  if (error) {
    console.error('Error fetching author profiles:', error);
    return new Map();
  }

  return new Map((data || []).map(p => [p.id, p.display_name]));
}

/**
 * Minimal feed query - fetches from posts table using DB fields directly
 * Now returns items with optional authorMap for batch author lookup
 */
export async function fetchUniversalFeed(
  sb: SupabaseClient,
  opts: FeedQueryOpts
): Promise<{ items: BasePost[]; nextCursor: string | null; authorMap?: Map<string, string | null> }> {
  const limit = opts.limit ?? 20;
  const before = opts.cursor ?? new Date().toISOString();
  
  let query = sb
    .from('posts')
    .select('*')
    .eq('status', 'active')
    .lt('created_at', before)
    .order('created_at', { ascending: false })
    .limit(limit);

  // Filter by mode and visibility
  if (opts.mode === 'public') {
    query = query.eq('mode', 'public').eq('visibility', 'public');
  } else if (opts.mode === 'business') {
    query = query.eq('mode', 'business');
    // For business mode, include my_business and other_businesses visibility
    // Business insights must be published (have published_at set)
    query = query.not('published_at', 'is', null);
    if (opts.org_id) {
      // Build visibility filter: org posts OR user's own posts (regardless of org)
      // This allows users to see their own posts across all orgs they're associated with
      if (opts.user_id) {
        // Supabase PostgREST doesn't support complex nested OR/AND conditions
        // So we make two separate queries and combine the results
        const orgQuery = sb
          .from('posts')
          .select('*')
          .eq('status', 'active')
          .lt('created_at', before)
          .eq('mode', 'business')
          .not('published_at', 'is', null)
          .eq('org_id', opts.org_id)
          .in('visibility', ['my_business', 'other_businesses', 'public']);
        
        const userQuery = sb
          .from('posts')
          .select('*')
          .eq('status', 'active')
          .lt('created_at', before)
          .eq('mode', 'business')
          .not('published_at', 'is', null)
          .eq('user_id', opts.user_id)
          .not('visibility', 'is', null);
        
        // Apply kind filter to both queries if specified
        if (opts.kinds && opts.kinds.length > 0) {
          orgQuery.in('kind', opts.kinds);
          userQuery.in('kind', opts.kinds);
        }
        
        // Apply search filter to both queries if specified
        if (opts.search) {
          orgQuery.or(`title.ilike.%${opts.search}%,content.ilike.%${opts.search}%`);
          userQuery.or(`title.ilike.%${opts.search}%,content.ilike.%${opts.search}%`);
        }
        
        // Execute both queries in parallel
        const [orgResult, userResult] = await Promise.all([
          orgQuery.order('created_at', { ascending: false }),
          userQuery.order('created_at', { ascending: false })
        ]);
        
        if (orgResult.error) {
          console.error('Org query error:', orgResult.error);
        }
        if (userResult.error) {
          console.error('User query error:', userResult.error);
        }
        
        // Combine and deduplicate results by ID
        const combinedItems = new Map<string, BasePost>();
        [...(orgResult.data || []), ...(userResult.data || [])].forEach((item: any) => {
          combinedItems.set(item.id, item);
        });
        
        // Sort by created_at descending and limit
        const allItems = Array.from(combinedItems.values()) as BasePost[];
        allItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const sortedItems = allItems.slice(0, limit);
        
        const nextCursor = sortedItems.length === limit ? sortedItems[sortedItems.length - 1].created_at : null;
        
        // Batch fetch authors
        const userIds = sortedItems.map(p => p.user_id).filter(Boolean) as string[];
        const authorMap = await batchFetchAuthors(sb, userIds);
        
        return { items: sortedItems, nextCursor, authorMap };
      } else {
        // Fallback: just org posts with appropriate visibility
        query = query.eq('org_id', opts.org_id).in('visibility', ['my_business', 'other_businesses', 'public']);
      }
    } else {
      // If no org_id, only show public business insights (or user's own if user_id provided)
      if (opts.user_id) {
        query = query.or(`visibility.eq.public,user_id.eq.${opts.user_id}`);
      } else {
        query = query.eq('visibility', 'public');
      }
    }
  }

  // Filter by kinds if specified
  if (opts.kinds && opts.kinds.length > 0) {
    query = query.in('kind', opts.kinds);
  }

  // Search filter
  if (opts.search) {
    query = query.or(`title.ilike.%${opts.search}%,content.ilike.%${opts.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Feed query error:', error, { mode: opts.mode, org_id: opts.org_id, user_id: opts.user_id, kinds: opts.kinds });
    return { items: [], nextCursor: null };
  }

  const items = (data || []) as BasePost[];
  const nextCursor = items.length === limit ? items[items.length - 1].created_at : null;

  // Batch fetch authors for non-business mode (business mode handled above)
  const userIds = items.map(p => p.user_id).filter(Boolean) as string[];
  const authorMap = await batchFetchAuthors(sb, userIds);

  return { items, nextCursor, authorMap };
}

/**
 * Fetch cross-linked posts for a given post
 */
export async function fetchCrossLinkedPosts(
  sb: SupabaseClient,
  opts: { postId?: string | null }
): Promise<BasePost[]> {
  if (!opts.postId) return [];

  // Get cross-link relations where this post is involved
  // Only fetch 'cross_link' type, not 'origin' (continuations) which are shown in lineage
  const { data: relations, error: relError } = await sb
    .from('post_relations')
    .select('parent_post_id, child_post_id')
    .eq('relation_type', 'cross_link')
    .or(`parent_post_id.eq.${opts.postId},child_post_id.eq.${opts.postId}`);

  if (relError || !relations || relations.length === 0) {
    return [];
  }

  // Collect related post IDs
  const relatedIds = new Set<string>();
  relations.forEach((rel) => {
    if (rel.parent_post_id !== opts.postId) relatedIds.add(rel.parent_post_id);
    if (rel.child_post_id !== opts.postId) relatedIds.add(rel.child_post_id);
  });

  if (relatedIds.size === 0) return [];

  // Fetch related posts - filter for active posts only
  // Note: This doesn't filter by type/mode/visibility to allow cross-type linking
  // Individual consumers should filter further if needed
  const { data: posts, error: postsError } = await sb
    .from('posts')
    .select('*')
    .in('id', Array.from(relatedIds))
    .eq('status', 'active');

  if (postsError) {
    console.error('Cross-links query error:', postsError);
    return [];
  }

  return (posts || []) as BasePost[];
}

/**
 * Fetch lineage cluster feed - clusters ordered by latest activity
 * Now uses optimized RPC function (single query instead of N+1)
 */
export async function fetchLineageClusterFeed(
  sb: SupabaseClient,
  opts: FeedQueryOpts
): Promise<{ clusters: LineageCluster[]; nextCursor: string | null }> {
  return fetchClustersRpc(sb, {
    mode: opts.mode,
    limit: opts.limit ?? 20,
    cursor: opts.cursor,
    kinds: opts.kinds ?? null,
    search: opts.search,
    org_id: opts.org_id,
    user_id: opts.user_id ?? null,
  });
}
