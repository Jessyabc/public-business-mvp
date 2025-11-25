import { SupabaseClient } from '@supabase/supabase-js';
import { BasePost, PostKind } from '@/types/post';

type FeedQueryOpts = {
  mode: 'public' | 'business';
  kinds?: PostKind[];
  limit?: number;
  cursor?: string | null;
  search?: string | null;
  org_id?: string | null;
  sort?: 'new' | 'hot' | 'score';
};

/**
 * Minimal feed query - fetches from posts table using DB fields directly
 */
export async function fetchUniversalFeed(
  sb: SupabaseClient,
  opts: FeedQueryOpts
): Promise<{ items: BasePost[]; nextCursor: string | null }> {
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
    // (draft posts are excluded by default since they're not published)
    if (opts.org_id) {
      query = query.eq('org_id', opts.org_id).in('visibility', ['my_business', 'other_businesses', 'public']);
    } else {
      // If no org_id, only show public business insights
      query = query.eq('visibility', 'public');
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
    console.error('Feed query error:', error);
    return { items: [], nextCursor: null };
  }

  const items = (data || []) as BasePost[];
  const nextCursor = items.length === limit ? items[items.length - 1].created_at : null;

  return { items, nextCursor };
}

/**
 * Fetch cross-linked posts for a given post
 */
export async function fetchCrossLinkedPosts(
  sb: SupabaseClient,
  opts: { postId?: string | null }
): Promise<BasePost[]> {
  if (!opts.postId) return [];

  // Get relations where this post is involved
  const { data: relations, error: relError } = await sb
    .from('post_relations')
    .select('parent_post_id, child_post_id')
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
