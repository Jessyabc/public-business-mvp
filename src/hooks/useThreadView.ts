/**
 * Hook for fetching and building thread views using hard relations (reply type)
 * 
 * A thread is a chain/branch of posts connected via hard relations (continuation).
 * This hook fetches the thread structure and builds a tree for rendering.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Post } from '@/types/post';

export interface ThreadNode {
  post: Post;
  children: ThreadNode[];
  depth: number;
  parentId: string | null;
}

interface ThreadData {
  rootPost: Post;
  threadTree: ThreadNode;
  allPosts: Post[];
  relations: Array<{
    id: string;
    parent_post_id: string;
    child_post_id: string;
    relation_type: string;
  }>;
}

/**
 * Fetches a thread starting from a specific post
 * Uses hard relations (relation_type = 'reply') to build continuation chains
 */
export function useThreadView(postId?: string) {
  return useQuery({
    queryKey: ['thread-view', postId],
    queryFn: async (): Promise<ThreadData | null> => {
      if (!postId) return null;

      // 1. Fetch the root post
      const { data: rootPost, error: postError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .eq('status', 'active')
        .single();

      if (postError || !rootPost) {
        throw new Error('Failed to fetch root post');
      }

      // 2. Fetch all hard relations (reply type) where this post is involved
      // We need to traverse both directions to build the full thread
      const { data: relations, error: relationsError } = await supabase
        .from('post_relations')
        .select('*')
        .or(`parent_post_id.eq.${postId},child_post_id.eq.${postId}`)
        .eq('relation_type', 'reply')
        .order('created_at', { ascending: true });

      if (relationsError) {
        throw new Error('Failed to fetch thread relations');
      }

      // 3. If no relations, return single-node thread
      if (!relations || relations.length === 0) {
        return {
          rootPost: rootPost as Post,
          threadTree: {
            post: rootPost as Post,
            children: [],
            depth: 0,
            parentId: null,
          },
          allPosts: [rootPost as Post],
          relations: [],
        };
      }

      // 4. Fetch all related posts
      const postIds = new Set<string>([postId]);
      relations.forEach((rel) => {
        postIds.add(rel.parent_post_id);
        postIds.add(rel.child_post_id);
      });

      const { data: allPosts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .in('id', Array.from(postIds))
        .eq('status', 'active');

      if (postsError || !allPosts) {
        throw new Error('Failed to fetch thread posts');
      }

      // 5. Build thread tree
      const postsMap = new Map<string, Post>();
      allPosts.forEach((post) => {
        postsMap.set(post.id, post as Post);
      });

      const childrenMap = new Map<string, string[]>();
      relations.forEach((rel) => {
        if (!childrenMap.has(rel.parent_post_id)) {
          childrenMap.set(rel.parent_post_id, []);
        }
        childrenMap.get(rel.parent_post_id)!.push(rel.child_post_id);
      });

      function buildTree(currentPostId: string, depth: number, parentId: string | null): ThreadNode | null {
        const post = postsMap.get(currentPostId);
        if (!post) return null;

        const childIds = childrenMap.get(currentPostId) || [];
        const children = childIds
          .map((childId) => buildTree(childId, depth + 1, currentPostId))
          .filter((node): node is ThreadNode => node !== null);

        return {
          post,
          children,
          depth,
          parentId,
        };
      }

      const threadTree = buildTree(postId, 0, null);

      if (!threadTree) {
        throw new Error('Failed to build thread tree');
      }

      return {
        rootPost: rootPost as Post,
        threadTree,
        allPosts: allPosts as Post[],
        relations,
      };
    },
    enabled: !!postId,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Flattens a thread tree into a linear array for sequential display
 */
export function flattenThread(tree: ThreadNode): ThreadNode[] {
  const result: ThreadNode[] = [tree];
  tree.children.forEach((child) => {
    result.push(...flattenThread(child));
  });
  return result;
}
