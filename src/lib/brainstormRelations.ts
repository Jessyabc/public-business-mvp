import { supabase } from '@/integrations/supabase/client';
import type { Post, PostRelation } from '@/types/post';

export interface RelatedPosts {
  hardChildren: Post[];
  hardParents: Post[];
  softChildren: Post[];
  softParents: Post[];
}

/**
 * Fetch all related posts for a given post ID
 * Queries post_relations and joins with posts table
 */
export async function fetchRelatedPosts(postId: string): Promise<RelatedPosts> {
  try {
    // Fetch all relations where this post is involved (as parent or child)
    const { data: relations, error: relationsError } = await supabase
      .from('post_relations')
      .select('*')
      .or(`parent_post_id.eq.${postId},child_post_id.eq.${postId}`);

    if (relationsError) {
      console.error('Error fetching relations:', relationsError);
      return {
        hardChildren: [],
        hardParents: [],
        softChildren: [],
        softParents: [],
      };
    }

    if (!relations || relations.length === 0) {
      return {
        hardChildren: [],
        hardParents: [],
        softChildren: [],
        softParents: [],
      };
    }

    // Collect all unique post IDs
    const postIds = new Set<string>();
    relations.forEach((rel: PostRelation) => {
      if (rel.parent_post_id !== postId) postIds.add(rel.parent_post_id);
      if (rel.child_post_id !== postId) postIds.add(rel.child_post_id);
    });

    if (postIds.size === 0) {
      return {
        hardChildren: [],
        hardParents: [],
        softChildren: [],
        softParents: [],
      };
    }

    // Fetch all related posts - filter for public brainstorm posts only
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .in('id', Array.from(postIds))
      .eq('type', 'brainstorm')
      .eq('mode', 'public')
      .eq('visibility', 'public')
      .eq('status', 'active');

    if (postsError) {
      console.error('Error fetching related posts:', postsError);
      return {
        hardChildren: [],
        hardParents: [],
        softChildren: [],
        softParents: [],
      };
    }

    const postsMap = new Map((posts || []).map((post) => [post.id, post as Post]));

    // Categorize relations
    const hardChildren: Post[] = [];
    const hardParents: Post[] = [];
    const softChildren: Post[] = [];
    const softParents: Post[] = [];

    relations.forEach((rel: PostRelation) => {
      // Only process 'hard' and 'soft' relations (ignore biz_in, biz_out)
      if (rel.relation_type === 'hard') {
        if (rel.parent_post_id === postId) {
          const child = postsMap.get(rel.child_post_id);
          // Only include if it's a public brainstorm post
          if (child && child.type === 'brainstorm' && child.mode === 'public' && child.status === 'active') {
            hardChildren.push(child);
          }
        } else if (rel.child_post_id === postId) {
          const parent = postsMap.get(rel.parent_post_id);
          // Only include if it's a public brainstorm post
          if (parent && parent.type === 'brainstorm' && parent.mode === 'public' && parent.status === 'active') {
            hardParents.push(parent);
          }
        }
      } else if (rel.relation_type === 'soft') {
        if (rel.parent_post_id === postId) {
          const child = postsMap.get(rel.child_post_id);
          // Only include if it's a public brainstorm post
          if (child && child.type === 'brainstorm' && child.mode === 'public' && child.status === 'active') {
            softChildren.push(child);
          }
        } else if (rel.child_post_id === postId) {
          const parent = postsMap.get(rel.parent_post_id);
          // Only include if it's a public brainstorm post
          if (parent && parent.type === 'brainstorm' && parent.mode === 'public' && parent.status === 'active') {
            softParents.push(parent);
          }
        }
      }
    });

    return {
      hardChildren,
      hardParents,
      softChildren,
      softParents,
    };
  } catch (error) {
    console.error('Failed to fetch related posts:', error);
    return {
      hardChildren: [],
      hardParents: [],
      softChildren: [],
      softParents: [],
    };
  }
}

