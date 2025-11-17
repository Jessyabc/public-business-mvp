import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { mapPostRecordToBasePost, PostRecordRow } from '@/lib/feedQueries';
import { convertFeedPostToUniversal } from '../utils/postConverter';
import { BasePost as UniversalBasePost, PostLink } from '../types';

type GraphResult = {
  nodes: UniversalBasePost[];
  links: PostLink[];
  loading: boolean;
  error: string | null;
};

type RelationRow = {
  id: string;
  parent_post_id: string;
  child_post_id: string;
  relation_type: 'hard' | 'soft' | 'biz_in' | 'biz_out';
  created_at: string;
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
        const { data: relations, error: relationsError } = await supabase
          .from<RelationRow>('post_relations')
          .select('id, parent_post_id, child_post_id, relation_type, created_at')
          .or(`parent_post_id.eq.${activePostId},child_post_id.eq.${activePostId}`);

        if (relationsError) {
          throw relationsError;
        }

        const relatedIds = new Set<string>([activePostId]);
        (relations ?? []).forEach((relation) => {
          relatedIds.add(relation.parent_post_id);
          relatedIds.add(relation.child_post_id);
        });

        const { data: posts, error: postsError } = await supabase
          .from<PostRecordRow>('posts')
          .select('id, user_id, title, content, summary, type, kind, visibility, mode, t_score, u_score, involvement, created_at, updated_at')
          .in('id', Array.from(relatedIds));

        if (postsError) {
          throw postsError;
        }

        if (cancelled) return;

        const mappedPosts = (posts ?? []).map(mapPostRecordToBasePost);
        const universalPosts = mappedPosts.map(convertFeedPostToUniversal);
        const graphLinks: PostLink[] = (relations ?? []).map((relation) => ({
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
