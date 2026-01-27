/**
 * Hook for fetching cross-links (soft relations) for a post
 * 
 * Cross-links are references between posts that don't form part of the main thread.
 * They use relation_type = 'cross_link' (canonical) or 'soft' (legacy).
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Post } from '@/types/post';

export interface CrossLink {
  id: string;
  post: Post;
  relationType: string;
  direction: 'incoming' | 'outgoing'; // incoming = this post is referenced by others, outgoing = this post references others
}

/**
 * Fetches all cross-links for a specific post
 */
export function useCrossLinks(postId?: string) {
  return useQuery({
    queryKey: ['cross-links', postId],
    queryFn: async (): Promise<CrossLink[]> => {
      if (!postId) return [];

      // Fetch all cross-link relations (both soft and cross_link types for compatibility)
      const { data: relations, error: relationsError } = await supabase
        .from('post_relations')
        .select('*')
        .or(`parent_post_id.eq.${postId},child_post_id.eq.${postId}`)
        .in('relation_type', ['cross_link', 'soft', 'origin', 'quote'])
        .order('created_at', { ascending: false });

      if (relationsError) {
        console.error('Failed to fetch cross-links:', relationsError);
        return [];
      }

      if (!relations || relations.length === 0) {
        return [];
      }

      // Collect all related post IDs
      const relatedPostIds = new Set<string>();
      relations.forEach((rel) => {
        if (rel.parent_post_id !== postId) {
          relatedPostIds.add(rel.parent_post_id);
        }
        if (rel.child_post_id !== postId) {
          relatedPostIds.add(rel.child_post_id);
        }
      });

      // Fetch all related posts
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .in('id', Array.from(relatedPostIds))
        .eq('status', 'active');

      if (postsError || !posts) {
        console.error('Failed to fetch cross-linked posts:', postsError);
        return [];
      }

      // Map posts by ID
      const postsMap = new Map<string, Post>();
      posts.forEach((post) => {
        postsMap.set(post.id, post as Post);
      });

      // Build cross-link objects
      const crossLinks: CrossLink[] = [];
      relations.forEach((rel) => {
        const isIncoming = rel.child_post_id === postId;
        const relatedPostId = isIncoming ? rel.parent_post_id : rel.child_post_id;
        const relatedPost = postsMap.get(relatedPostId);

        if (relatedPost) {
          crossLinks.push({
            id: rel.id,
            post: relatedPost,
            relationType: rel.relation_type,
            direction: isIncoming ? 'incoming' : 'outgoing',
          });
        }
      });

      return crossLinks;
    },
    enabled: !!postId,
    staleTime: 1000 * 60, // 1 minute
  });
}
