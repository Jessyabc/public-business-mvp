import { supabase } from '@/integrations/supabase/client';
import type { Post, PostRelation } from '@/types/post';

export interface PostRelationsResult {
  hardChildren: Post[];
  softChildren: Post[];
  parentHard: Post[];
  parentSoft: Post[];
  allRelations: PostRelation[];
}

/**
 * Fetch all post relations for a given post ID
 * Returns categorized relations (hard/soft, parent/child) and all relation records
 */
export async function getPostRelations(postId: string): Promise<PostRelationsResult> {
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
        softChildren: [],
        parentHard: [],
        parentSoft: [],
        allRelations: [],
      };
    }

    if (!relations || relations.length === 0) {
      return {
        hardChildren: [],
        softChildren: [],
        parentHard: [],
        parentSoft: [],
        allRelations: [],
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
        softChildren: [],
        parentHard: [],
        parentSoft: [],
        allRelations: relations as PostRelation[],
      };
    }

    // Fetch all related posts
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .in('id', Array.from(postIds))
      .eq('status', 'active');

    if (postsError) {
      console.error('Error fetching related posts:', postsError);
      return {
        hardChildren: [],
        softChildren: [],
        parentHard: [],
        parentSoft: [],
        allRelations: relations as PostRelation[],
      };
    }

    const postsMap = new Map((posts || []).map((post) => [post.id, post as Post]));

    // Categorize relations
    const hardChildren: Post[] = [];
    const softChildren: Post[] = [];
    const parentHard: Post[] = [];
    const parentSoft: Post[] = [];

    relations.forEach((rel: PostRelation) => {
      if (rel.relation_type === 'hard') {
        if (rel.parent_post_id === postId) {
          const child = postsMap.get(rel.child_post_id);
          if (child) hardChildren.push(child);
        } else if (rel.child_post_id === postId) {
          const parent = postsMap.get(rel.parent_post_id);
          if (parent) parentHard.push(parent);
        }
      } else if (rel.relation_type === 'soft') {
        if (rel.parent_post_id === postId) {
          const child = postsMap.get(rel.child_post_id);
          if (child) softChildren.push(child);
        } else if (rel.child_post_id === postId) {
          const parent = postsMap.get(rel.parent_post_id);
          if (parent) parentSoft.push(parent);
        }
      }
    });

    return {
      hardChildren,
      softChildren,
      parentHard,
      parentSoft,
      allRelations: relations as PostRelation[],
    };
  } catch (error) {
    console.error('Failed to fetch post relations:', error);
    return {
      hardChildren: [],
      softChildren: [],
      parentHard: [],
      parentSoft: [],
      allRelations: [],
    };
  }
}
