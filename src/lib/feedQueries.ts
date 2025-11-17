import { SupabaseClient } from '@supabase/supabase-js';
import { BasePost, PostKind } from '@/types/post';

type FeedQueryOpts = {
  mode: 'public' | 'business';
  kinds?: PostKind[];
  limit?: number;
  cursor?: string | null;      // ISO created_at for simple pagination
  search?: string | null;
  org_id?: string | null;
  sort?: 'new' | 'hot' | 'score';
};

const DEFAULT_FEED_KINDS: PostKind[] = ['brainstorm','spark','business_insight'];

const normaliseVisibility = (visibility?: string | null): BasePost['privacy'] => {
  if (visibility === 'private') return 'private';
  if (visibility === 'org') return 'org';
  return 'public';
};

const normaliseKind = (kind?: string | null, fallback?: string | null): PostKind => {
  const value = (kind ?? fallback ?? 'brainstorm').toString().toLowerCase();
  if (value === 'spark') return 'spark';
  if (value === 'open_idea') return 'open_idea';
  if (value === 'insight') return 'insight';
  if (value === 'business_insight') return 'business_insight';
  return 'brainstorm';
};

export function mapPostRecordToBasePost(post: any): BasePost {
  return {
    id: post.id,
    kind: normaliseKind(post.kind, post.type),
    org_id: post.org_id ?? null,
    author_id: post.user_id || post.author_id || '',
    title: post.title || null,
    summary: post.summary ?? post.content?.substring(0, 200) ?? null,
    created_at: post.created_at,
    updated_at: post.updated_at || post.created_at,
    privacy: normaliseVisibility(post.visibility),
    metrics: {
      t_score: post.t_score ?? null,
      u_score: post.u_score ?? null,
      involvement: post.involvement ?? null,
    },
  };
}

// Strategy B (safe now): query existing tables/views, merge, sort.
// Adapts to existing schema: posts table (type field), open_ideas_public_view
export async function fetchUniversalFeed(
  sb: SupabaseClient,
  opts: FeedQueryOpts
): Promise<{ items: BasePost[]; nextCursor: string | null }> {
  const kinds = opts.kinds ?? DEFAULT_FEED_KINDS;
  const chunks: BasePost[] = [];
  const before = opts.cursor ?? new Date().toISOString();
  const limit = opts.limit ?? 20;

  // Query open_ideas from open_ideas_public_view
  if (kinds.includes('open_idea')) {
    let q = sb
      .from('open_ideas_public_view')
      .select('id, content, created_at')
      .lt('created_at', before)
      .limit(limit);
    
    if (opts.search) {
      // Note: open_ideas_public_view may not have search_vector, so we'll filter client-side if needed
      const { data } = await q;
      if (data) {
        const filtered = opts.search 
          ? data.filter((item: any) => 
              item.content?.toLowerCase().includes(opts.search!.toLowerCase())
            )
          : data;
        chunks.push(...filtered.map((item: any): BasePost => ({
          id: item.id,
          kind: 'open_idea',
          author_id: '', // open_ideas_public_view doesn't expose author_id
          title: null,
          summary: item.content?.substring(0, 200) || null,
          created_at: item.created_at,
          updated_at: item.created_at,
          privacy: 'public',
          metrics: undefined,
        })));
      }
    } else {
      const { data } = await q;
      if (data) {
        chunks.push(...data.map((item: any): BasePost => ({
          id: item.id,
          kind: 'open_idea',
          author_id: '',
          title: null,
          summary: item.content?.substring(0, 200) || null,
          created_at: item.created_at,
          updated_at: item.created_at,
          privacy: 'public',
          metrics: undefined,
        })));
      }
    }
  }

  const includeBrainstorm = kinds.includes('brainstorm');
  const includeSpark = kinds.includes('spark');

  // Query brainstorm + spark posts from posts table (type='brainstorm')
  if (includeBrainstorm || includeSpark) {
    let q = sb
      .from('posts')
      .select('id, user_id, title, content, summary, type, kind, visibility, mode, t_score, u_score, involvement, created_at, updated_at')
      .eq('type', 'brainstorm')
      .eq('status', 'active')
      .lt('created_at', before)
      .limit(limit);

    if (opts.mode === 'public') {
      q = q.eq('visibility', 'public');
    }

    const { data } = await q;

    if (data) {
      const mapped = data
        .filter((item: any) => {
          const normalizedKind = normaliseKind(item.kind, item.type);
          if (normalizedKind === 'spark') {
            return includeSpark;
          }
          return includeBrainstorm;
        })
        .map(mapPostRecordToBasePost);

      const searched = opts.search
        ? mapped.filter((item) => {
            const term = opts.search!.toLowerCase();
            return (
              item.summary?.toLowerCase().includes(term) ||
              item.title?.toLowerCase().includes(term)
            );
          })
        : mapped;

      chunks.push(...searched);
    }
  }

  const includeInsights = kinds.some(k => k === 'business_insight' || k === 'insight');

  // Query business insights from posts table
  if (includeInsights) {
    let q = sb
      .from('posts')
      .select('id, user_id, title, content, summary, type, kind, visibility, mode, t_score, u_score, involvement, created_at, updated_at')
      .in('type', ['insight', 'report', 'whitepaper', 'webinar'])
      .eq('status', 'active')
      .lt('created_at', before)
      .limit(limit);
    
    if (opts.mode === 'public') {
      q = q.eq('visibility', 'public');
    } else if (opts.mode === 'business' && opts.org_id) {
      q = q.or('visibility.eq.public,visibility.eq.other_businesses');
    }
    
    const { data } = await q;
    if (data) {
      const mapped = data.map(mapPostRecordToBasePost);

      const searched = opts.search
        ? mapped.filter((item) => {
            const term = opts.search!.toLowerCase();
            return (
              item.summary?.toLowerCase().includes(term) ||
              item.title?.toLowerCase().includes(term)
            );
          })
        : mapped;

      chunks.push(...searched);
    }
  }

  // Sort the merged chunks
  const sort = opts.sort ?? 'new';
  const sorted = chunks.sort((a, b) => {
    if (sort === 'new') return b.created_at.localeCompare(a.created_at);
    if (sort === 'hot') {
      const aHot = (a.metrics?.involvement ?? 0) + (a.metrics?.t_score ?? 0) + (a.metrics?.u_score ?? 0);
      const bHot = (b.metrics?.involvement ?? 0) + (b.metrics?.t_score ?? 0) + (b.metrics?.u_score ?? 0);
      return bHot - aHot;
    }
    const aScore = (a.metrics?.t_score ?? 0) + (a.metrics?.u_score ?? 0);
    const bScore = (b.metrics?.t_score ?? 0) + (b.metrics?.u_score ?? 0);
    return bScore - aScore;
  });

  // Limit to requested size
  const limited = sorted.slice(0, limit);
  const nextCursor = limited.length ? limited[limited.length - 1].created_at : null;

  return { items: limited, nextCursor };
}

export async function fetchCrossLinkedPosts(
  sb: SupabaseClient,
  opts: { postId?: string | null; relationTypes?: string[]; limit?: number }
): Promise<BasePost[]> {
  if (!opts.postId) {
    return [];
  }

  const relationTypes = opts.relationTypes ?? ['hard','soft','biz_in','biz_out'];

  try {
    const { data: relations, error } = await sb
      .from('post_relations')
      .select('id, parent_post_id, child_post_id, relation_type, created_at')
      .or(`parent_post_id.eq.${opts.postId},child_post_id.eq.${opts.postId}`)
      .in('relation_type', relationTypes)
      .limit(opts.limit ?? 40);

    if (error) {
      console.warn('Failed to load cross links:', error.message);
      return [];
    }

    const relatedIds = new Set<string>();
    (relations ?? []).forEach((relation: any) => {
      if (relation.parent_post_id === opts.postId) {
        relatedIds.add(relation.child_post_id);
      } else if (relation.child_post_id === opts.postId) {
        relatedIds.add(relation.parent_post_id);
      }
    });

    relatedIds.delete(opts.postId);
    if (!relatedIds.size) {
      return [];
    }

    const { data: posts, error: postsError } = await sb
      .from('posts')
      .select('id, user_id, title, content, summary, type, kind, visibility, mode, t_score, u_score, involvement, created_at, updated_at')
      .in('id', Array.from(relatedIds));

    if (postsError) {
      console.warn('Failed to load posts for cross links:', postsError.message);
      return [];
    }

    return (posts ?? [])
      .map(mapPostRecordToBasePost)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  } catch (err) {
    console.warn('Unexpected cross link fetch error:', err);
    return [];
  }
}

