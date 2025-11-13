import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PostLink, LinkType } from '../types';

/**
 * Hook to fetch post links (relations) for a given set of post IDs
 * Converts database post_relations format to PostLink format
 */
export function usePostLinks(postIds: string[]): PostLink[] {
  const [links, setLinks] = useState<PostLink[]>([]);

  useEffect(() => {
    if (postIds.length === 0) {
      setLinks([]);
      return;
    }

    const fetchLinks = async () => {
      try {
        // Use the RPC function to fetch relations for the given post IDs
        const { data, error } = await supabase.rpc('api_list_brainstorm_edges_for_nodes', {
          p_node_ids: postIds,
        });

        if (error) {
          console.error('Error fetching post links:', error);
          setLinks([]);
          return;
        }

        // Convert database format to PostLink format
        const convertedLinks: PostLink[] = (data || []).map((relation: any) => {
          // Map relation_type to LinkType
          // Database uses 'hard' | 'soft', which maps directly
          const linkType: LinkType = 
            relation.relation_type === 'hard' ? 'hard' :
            relation.relation_type === 'soft' ? 'soft' :
            'soft'; // default fallback

          // Determine source and target
          // For now, treat parent as source and child as target
          // This might need adjustment based on your data model
          return {
            id: relation.id,
            source_post_id: relation.parent_post_id,
            target_post_id: relation.child_post_id,
            link_type: linkType,
            weight: linkType === 'hard' ? 3 : 2, // Hard links are thicker
            created_at: relation.created_at,
          };
        });

        // Filter to only include links where both source and target are in the visible posts
        const visiblePostIds = new Set(postIds);
        const filteredLinks = convertedLinks.filter(
          link => visiblePostIds.has(link.source_post_id) && visiblePostIds.has(link.target_post_id)
        );

        console.log(`[usePostLinks] Fetched ${convertedLinks.length} links, ${filteredLinks.length} visible`);
        setLinks(filteredLinks);
      } catch (err) {
        console.error('Failed to fetch post links:', err);
        setLinks([]);
      }
    };

    fetchLinks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postIds.join(',')]); // Re-fetch when post IDs change (using join for array comparison)

  return links;
}

