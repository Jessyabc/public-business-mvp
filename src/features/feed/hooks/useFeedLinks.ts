import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PostLink {
  id: string;
  parent_post_id: string;
  child_post_id: string;
  relation_type: string;
  created_at: string;
}

interface LinkCounts {
  in: number;  // Links where this post is the child (incoming)
  out: number; // Links where this post is the parent (outgoing)
}

export function useFeedLinks() {
  const getLinksFor = async (postId: string): Promise<PostLink[]> => {
    try {
      // Get both incoming (where post is child) and outgoing (where post is parent) links
      const [incomingResult, outgoingResult] = await Promise.all([
        supabase
          .from('post_relations')
          .select('*')
          .eq('child_post_id', postId),
        supabase
          .from('post_relations')
          .select('*')
          .eq('parent_post_id', postId)
      ]);

      if (incomingResult.error) {
        console.error('Error fetching incoming links:', incomingResult.error);
      }
      if (outgoingResult.error) {
        console.error('Error fetching outgoing links:', outgoingResult.error);
      }

      const incoming = (incomingResult.data || []) as PostLink[];
      const outgoing = (outgoingResult.data || []) as PostLink[];
      
      // Combine and deduplicate
      const allLinks = [...incoming, ...outgoing];
      const uniqueLinks = Array.from(
        new Map(allLinks.map(link => [link.id, link])).values()
      );
      
      return uniqueLinks;
    } catch (error) {
      console.error('Error in getLinksFor:', error);
      return [];
    }
  };

  const linkCounts = async (postId: string): Promise<LinkCounts> => {
    try {
      const [incomingResult, outgoingResult] = await Promise.all([
        supabase
          .from('post_relations')
          .select('id', { count: 'exact', head: true })
          .eq('child_post_id', postId),
        supabase
          .from('post_relations')
          .select('id', { count: 'exact', head: true })
          .eq('parent_post_id', postId)
      ]);

      return {
        in: incomingResult.count || 0,
        out: outgoingResult.count || 0,
      };
    } catch (error) {
      console.error('Error in linkCounts:', error);
      return { in: 0, out: 0 };
    }
  };

  return {
    getLinksFor,
    linkCounts,
  };
}

