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

// Strategy B (safe now): query existing tables/views, merge, sort.
// Adapts to existing schema: posts table (type field), open_ideas_public_view
export async function fetchUniversalFeed(
  sb: SupabaseClient,
  opts: FeedQueryOpts
): Promise<{ items: BasePost[]; nextCursor: string | null }> {
  const kinds = opts.kinds ?? ['open_idea','brainstorm','business_insight'];
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

  // Query brainstorms from posts table (type='brainstorm')
  if (kinds.includes('brainstorm')) {
    let q = sb
      .from('posts')
      .select('id, user_id, title, content, type, visibility, mode, t_score, u_score, created_at, updated_at')
      .eq('type', 'brainstorm')
      .eq('status', 'active')
      .lt('created_at', before)
      .limit(limit);
    
    if (opts.mode === 'public') {
      q = q.eq('visibility', 'public');
    }
    
    if (opts.search) {
      // Filter by content containing search term
      const { data } = await q;
      if (data) {
        const filtered = data.filter((item: any) => 
          item.content?.toLowerCase().includes(opts.search!.toLowerCase()) ||
          item.title?.toLowerCase().includes(opts.search!.toLowerCase())
        );
        chunks.push(...filtered.map((item: any): BasePost => ({
          id: item.id,
          kind: 'brainstorm',
          org_id: null,
          author_id: item.user_id || '',
          title: item.title || null,
          summary: item.content?.substring(0, 200) || null,
          created_at: item.created_at,
          updated_at: item.updated_at || item.created_at,
          privacy: item.visibility === 'public' ? 'public' : item.visibility === 'private' ? 'private' : 'org',
          metrics: {
            t_score: item.t_score ?? null,
            u_score: item.u_score ?? null,
            involvement: null, // Could calculate from likes_count, comments_count if available
          },
        })));
      }
    } else {
      const { data } = await q;
      if (data) {
        chunks.push(...data.map((item: any): BasePost => ({
          id: item.id,
          kind: 'brainstorm',
          org_id: null,
          author_id: item.user_id || '',
          title: item.title || null,
          summary: item.content?.substring(0, 200) || null,
          created_at: item.created_at,
          updated_at: item.updated_at || item.created_at,
          privacy: item.visibility === 'public' ? 'public' : item.visibility === 'private' ? 'private' : 'org',
          metrics: {
            t_score: item.t_score ?? null,
            u_score: item.u_score ?? null,
            involvement: null,
          },
        })));
      }
    }
  }

  // Query business_insights from posts table (type='insight' or mode='business')
  if (kinds.includes('business_insight')) {
    let q = sb
      .from('posts')
      .select('id, user_id, title, content, type, visibility, mode, t_score, u_score, created_at, updated_at')
      .in('type', ['insight', 'report', 'whitepaper', 'webinar'])
      .eq('status', 'active')
      .lt('created_at', before)
      .limit(limit);
    
    if (opts.mode === 'public') {
      q = q.eq('visibility', 'public');
    } else if (opts.mode === 'business' && opts.org_id) {
      // For business mode, show public insights or org-specific ones
      // Note: posts table may not have org_id field directly, so we'll filter by visibility
      q = q.or('visibility.eq.public,visibility.eq.other_businesses');
    }
    
    if (opts.search) {
      const { data } = await q;
      if (data) {
        const filtered = data.filter((item: any) => 
          item.content?.toLowerCase().includes(opts.search!.toLowerCase()) ||
          item.title?.toLowerCase().includes(opts.search!.toLowerCase())
        );
        chunks.push(...filtered.map((item: any): BasePost => ({
          id: item.id,
          kind: 'business_insight',
          org_id: null,
          author_id: item.user_id || '',
          title: item.title || null,
          summary: item.content?.substring(0, 200) || null,
          created_at: item.created_at,
          updated_at: item.updated_at || item.created_at,
          privacy: item.visibility === 'public' ? 'public' : item.visibility === 'private' ? 'private' : 'org',
          metrics: {
            t_score: item.t_score ?? null,
            u_score: item.u_score ?? null,
            involvement: null,
          },
        })));
      }
    } else {
      const { data } = await q;
      if (data) {
        chunks.push(...data.map((item: any): BasePost => ({
          id: item.id,
          kind: 'business_insight',
          org_id: null,
          author_id: item.user_id || '',
          title: item.title || null,
          summary: item.content?.substring(0, 200) || null,
          created_at: item.created_at,
          updated_at: item.updated_at || item.created_at,
          privacy: item.visibility === 'public' ? 'public' : item.visibility === 'private' ? 'private' : 'org',
          metrics: {
            t_score: item.t_score ?? null,
            u_score: item.u_score ?? null,
            involvement: null,
          },
        })));
      }
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

