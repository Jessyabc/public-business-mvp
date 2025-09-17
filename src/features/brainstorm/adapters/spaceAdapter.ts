import { supabase } from '@/integrations/supabase/client';

export type BrainstormPost = {
  id: string;
  title: string | null;
  content: string | null;
  user_id: string | null;
  created_at: string;
};

export type LinkCount = { id: string; link_count: number };

export class SpaceAdapter {
  /** Recent brainstorm posts (fallback / initial load) */
  async recent(limit = 50): Promise<BrainstormPost[]> {
    const { data, error } = await supabase.rpc('api_brainstorm_recent', { p_limit: limit });
    if (error) throw error;
    return (data ?? []) as BrainstormPost[];
  }

  /** Follow HARD chain forward/backward from a given node */
  async hardChain(
    startId: string,
    direction: 'forward' | 'backward' = 'forward',
    limit = 25
  ): Promise<BrainstormPost[]> {
    const { data, error } = await supabase.rpc('api_space_chain_hard', {
      p_start: startId,
      p_direction: direction,
      p_limit: limit,
    });
    if (error) throw error;
    return (data ?? []) as BrainstormPost[];
  }

  /** Get SOFT-linked neighbors for a given node */
  async softNeighbors(nodeId: string, limit = 12): Promise<BrainstormPost[]> {
    const { data, error } = await supabase.rpc('api_space_soft_neighbors', {
      p_node: nodeId,
      p_limit: limit,
    });
    if (error) throw error;
    return (data ?? []) as BrainstormPost[];
  }

  /** Latest post along the HARD chain starting at startId */
  async latestHard(startId: string): Promise<BrainstormPost | null> {
    const { data, error } = await supabase.rpc('api_space_chain_latest', { p_start: startId });
    if (error) throw error;
    return (data as BrainstormPost) ?? null;
  }

  /** Link counts for a set of post ids (for UI badges) */
  async linkCounts(ids: string[]): Promise<LinkCount[]> {
    if (!ids.length) return [];
    const { data, error } = await supabase.rpc('api_post_link_counts', { p_ids: ids });
    if (error) throw error;
    return (data ?? []) as LinkCount[];
  }

  /** Optional analytics event */
  async trackOpen(nodeId: string) {
    // fire-and-forget; ignore errors to avoid blocking UI
    await supabase.rpc('api_track_event', {
      p_event: 'open_node',
      p_target: nodeId,
      p_kind: 'brainstorm',
      p_props: {},
    }).catch(() => {});
  }
}
