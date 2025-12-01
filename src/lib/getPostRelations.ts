// LEGACY – do not extend. Kept temporarily for reference during migration.
// This is a duplicate of usePostRelations functionality.
// New code should use usePostRelations from src/hooks/usePostRelations.ts

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

    // Fetch all related posts - filter for public brainstorm posts only
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .in('id', Array.from(postIds))
      .eq('status', 'active')
      .eq('type', 'brainstorm')
      .eq('mode', 'public');

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
      // Process 'origin' (migrated from 'hard') and 'cross_link' (migrated from 'soft')
      if (rel.relation_type === 'origin') {
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
            parentHard.push(parent);
          }
        }
      } else if (rel.relation_type === 'cross_link') {
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
            parentSoft.push(parent);
          }
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
