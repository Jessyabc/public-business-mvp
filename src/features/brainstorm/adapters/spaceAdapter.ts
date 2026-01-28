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
    
    try {
      // Query post_relations to count links for each post
      // Count 'origin' (hard links/continuations) and 'cross_link' (soft links) where parent_post_id matches
      const { data, error } = await supabase
        .from('post_relations')
        .select('parent_post_id, relation_type')
        .in('parent_post_id', ids)
        .in('relation_type', ['origin', 'cross_link']);
      
      if (error) {
        console.error('Error fetching link counts:', error);
        return ids.map(id => ({ id, link_count: 0 }));
      }
      
      // Count links per post
      const counts = new Map<string, number>();
      ids.forEach(id => counts.set(id, 0));
      
      (data || []).forEach(relation => {
        const current = counts.get(relation.parent_post_id) || 0;
        counts.set(relation.parent_post_id, current + 1);
      });
      
      return ids.map(id => ({
        id,
        link_count: counts.get(id) || 0
      }));
    } catch (error) {
      console.error('Error in linkCounts:', error);
      return ids.map(id => ({ id, link_count: 0 }));
    }
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