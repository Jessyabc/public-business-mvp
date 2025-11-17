import { supabase } from '@/integrations/supabase/client';
import type { Post } from '@/types/post';

export type LinkCount = { id: string; link_count: number };

export class SpaceAdapter {
  /** Recent brainstorm posts (fallback / initial load) */
  async recent(limit = 50): Promise<Post[]> {
    // Use direct query for now since RPC functions aren't available
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('type', 'brainstorm')
      .eq('status', 'active')
      .limit(limit)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data ?? []) as Post[];
  }

  /** Follow HARD chain forward/backward from a given node */
  async hardChain(
    startId: string,
    direction: 'forward' | 'backward' = 'forward',
    limit = 25
  ): Promise<Post[]> {
    // Fallback to recent for now
    return this.recent(limit);
  }

  /** Get SOFT-linked neighbors for a given node */
  async softNeighbors(nodeId: string, limit = 12): Promise<Post[]> {
    // Fallback to recent for now
    return this.recent(limit);
  }

  /** Latest post along the HARD chain starting at startId */
  async latestHard(startId: string): Promise<Post | null> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', startId)
      .eq('status', 'active')
      .single();
      
    if (error) return null;
    return data as Post;
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