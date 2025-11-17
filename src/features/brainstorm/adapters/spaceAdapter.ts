import { supabase } from '@/integrations/supabase/client';
import type { BrainstormPost } from '../postTypes';

const BASE_POST_FIELDS = [
  'id',
  'user_id',
  'title',
  'content',
  'body',
  'type',
  'kind',
  'visibility',
  'mode',
  'status',
  'org_id',
  'industry_id',
  'department_id',
  'metadata',
  'likes_count',
  'comments_count',
  'views_count',
  't_score',
  'u_score',
  'published_at',
  'created_at',
  'updated_at',
].join(', ');

type BrainstormPostRow = Partial<BrainstormPost> &
  Pick<BrainstormPost, 'id' | 'user_id' | 'content' | 'created_at' | 'updated_at'>;

const mapRowToBrainstormPost = (post: BrainstormPostRow): BrainstormPost => ({
  id: post.id,
  user_id: post.user_id,
  title: post.title ?? null,
  content: post.content ?? '',
  body: post.body ?? null,
  type: 'brainstorm',
  kind: post.kind ?? 'Spark',
  visibility: 'public',
  mode: 'public',
  status: post.status ?? 'active',
  org_id: post.org_id ?? null,
  industry_id: post.industry_id ?? null,
  department_id: post.department_id ?? null,
  metadata: post.metadata ?? null,
  likes_count: post.likes_count ?? 0,
  comments_count: post.comments_count ?? 0,
  views_count: post.views_count ?? 0,
  t_score: post.t_score ?? null,
  u_score: post.u_score ?? null,
  published_at: post.published_at ?? null,
  created_at: post.created_at,
  updated_at: post.updated_at,
});

export type LinkCount = { id: string; link_count: number };

export class SpaceAdapter {
  /** Recent brainstorm posts (fallback / initial load) */
  async recent(limit = 50): Promise<BrainstormPost[]> {
    // Use direct query for now since RPC functions aren't available
    const { data, error } = await supabase
      .from('posts')
      .select(BASE_POST_FIELDS)
      .eq('type', 'brainstorm')
      .eq('visibility', 'public')
      .eq('mode', 'public')
      .limit(limit)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map((post) => mapRowToBrainstormPost(post as BrainstormPostRow));
  }

  /** Follow HARD chain forward/backward from a given node */
  async hardChain(
    startId: string,
    direction: 'forward' | 'backward' = 'forward',
    limit = 25
  ): Promise<BrainstormPost[]> {
    // Fallback to recent for now
    return this.recent(limit);
  }

  /** Get SOFT-linked neighbors for a given node */
  async softNeighbors(nodeId: string, limit = 12): Promise<BrainstormPost[]> {
    // Fallback to recent for now
    return this.recent(limit);
  }

  /** Latest post along the HARD chain starting at startId */
  async latestHard(startId: string): Promise<BrainstormPost | null> {
    const { data, error } = await supabase
      .from('posts')
      .select(BASE_POST_FIELDS)
      .eq('type', 'brainstorm')
      .eq('visibility', 'public')
      .eq('mode', 'public')
      .eq('id', startId)
      .single();

    if (error || !data) return null;
    return mapRowToBrainstormPost(data as BrainstormPostRow);
  }

  /** Link counts for a set of post ids (for UI badges) */
  async linkCounts(ids: string[]): Promise<LinkCount[]> {
    if (!ids.length) return [];
    // Return empty array for now since we don't have the proper RPC
    return [];
  }

  /** Optional analytics event */
  async trackOpen(nodeId: string) {
    // fire-and-forget; ignore errors to avoid blocking UI
    try {
      await supabase.rpc('api_track_event', {
        p_event: 'open_node',
        p_target: nodeId,
        p_kind: 'brainstorm',
        p_props: {},
      });
    } catch (error) {
      // ignore errors to avoid blocking UI
      console.log('Analytics tracking failed:', error);
    }
  }
}