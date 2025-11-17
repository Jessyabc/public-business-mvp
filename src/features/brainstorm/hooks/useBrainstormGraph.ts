import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { mapPostRecordToBasePost, PostRecordRow } from '@/lib/feedQueries';
import { convertFeedPostToUniversal } from '../utils/postConverter';
import { BasePost as UniversalBasePost, PostLink } from '../types';
import { getPostRelations } from '@/lib/getPostRelations';

type GraphResult = {
  nodes: UniversalBasePost[];
  links: PostLink[];
  loading: boolean;
  error: string | null;
};

const relationWeight = (type: string): number => (type === 'hard' ? 3 : 2);

const normaliseRelationType = (type: string): PostLink['link_type'] => {
  if (type === 'hard') return 'hard';
  if (type === 'soft') return 'soft';
  if (type === 'biz_in') return 'biz_in';
  if (type === 'biz_out') return 'biz_out';
  return 'soft';
};

export function useBrainstormGraph(activePostId: string | null): GraphResult {
  const [nodes, setNodes] = useState<UniversalBasePost[]>([]);
  const [links, setLinks] = useState<PostLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activePostId) {
      setNodes([]);
      setLinks([]);
      setError(null);
      return;
    }

    let cancelled = false;

    const loadGraph = async () => {
      setLoading(true);

      try {
        // Use getPostRelations helper to fetch all relations
        const relationsResult = await getPostRelations(activePostId);

        if (cancelled) return;

        // Collect all related post IDs
        const allRelatedPostIds = new Set<string>();
        relationsResult.hardChildren.forEach(p => allRelatedPostIds.add(p.id));
        relationsResult.softChildren.forEach(p => allRelatedPostIds.add(p.id));
        relationsResult.parentHard.forEach(p => allRelatedPostIds.add(p.id));
        relationsResult.parentSoft.forEach(p => allRelatedPostIds.add(p.id));
        allRelatedPostIds.add(activePostId);

        // Fetch all posts (including active post) in PostRecordRow format for conversion
        const { data: postsData, error: postsError } = await supabase
          .from<PostRecordRow>('posts')
          .select('id, user_id, title, content, summary, type, kind, visibility, mode, t_score, u_score, involvement, created_at, updated_at')
          .in('id', Array.from(allRelatedPostIds));

        if (postsError) {
          throw postsError;
        }

        if (cancelled) return;

        const mappedPosts = (postsData ?? []).map(mapPostRecordToBasePost);
        const universalPosts = mappedPosts.map(convertFeedPostToUniversal);
        
        // Convert relations to PostLink format
        const graphLinks: PostLink[] = relationsResult.allRelations.map((relation) => ({
          id: relation.id,
          source_post_id: relation.parent_post_id,
          target_post_id: relation.child_post_id,
          link_type: normaliseRelationType(relation.relation_type),
          weight: relationWeight(relation.relation_type),
          created_at: relation.created_at,
        }));

        setNodes(universalPosts);
        setLinks(graphLinks);
        setError(null);
      } catch (err) {
        console.error('Failed to load brainstorm graph', err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load brainstorm graph');
          setNodes([]);
          setLinks([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadGraph();

    return () => {
      cancelled = true;
    };
  }, [activePostId]);

  return { nodes, links, loading, error };
}
