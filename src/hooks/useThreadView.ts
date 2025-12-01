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

      const typedRootPost = rootPost as unknown as Post;

      // 2. Find the true root of the thread by traversing up
      let currentRootId = postId;
      let foundRoot = false;
      
      while (!foundRoot) {
        const { data: parentRelation } = await supabase
          .from('post_relations')
          .select('parent_post_id')
          .eq('child_post_id', currentRootId)
          .eq('relation_type', 'reply')
          .maybeSingle();
        
        if (parentRelation) {
          currentRootId = parentRelation.parent_post_id;
        } else {
          foundRoot = true;
        }
      }

      // 3. Fetch all descendants from the true root
      const { data: relations, error: relationsError } = await supabase
        .from('post_relations')
        .select('*')
        .eq('relation_type', 'reply')
        .order('created_at', { ascending: true });

      if (relationsError) {
        throw new Error('Failed to fetch thread relations');
      }

      // 4. Filter relations to only include those in the thread containing our post
      const threadRelations = relations?.filter(rel => {
        // Use a set to track all posts in the thread
        const threadPostIds = new Set<string>([currentRootId]);
        const queue = [currentRootId];
        
        while (queue.length > 0) {
          const current = queue.shift()!;
          relations?.forEach(r => {
            if (r.parent_post_id === current && !threadPostIds.has(r.child_post_id)) {
              threadPostIds.add(r.child_post_id);
              queue.push(r.child_post_id);
            }
          });
        }
        
        return threadPostIds.has(rel.parent_post_id) && threadPostIds.has(rel.child_post_id);
      }) || [];

      // 5. If no relations in this thread, return single-node thread
      if (threadRelations.length === 0) {
        return {
          rootPost: typedRootPost,
          threadTree: {
            post: typedRootPost,
            children: [],
            depth: 0,
            parentId: null,
          },
          allPosts: [typedRootPost],
          relations: [],
        };
      }

      // 6. Fetch the true root post if different from clicked post
      let actualRootPost = typedRootPost;
      if (currentRootId !== postId) {
        const { data: rootData } = await supabase
          .from('posts')
          .select('*')
          .eq('id', currentRootId)
          .eq('status', 'active')
          .maybeSingle();
        
        if (rootData) {
          actualRootPost = rootData as unknown as Post;
        }
      }

      // 7. Fetch all related posts
      const postIds = new Set<string>([currentRootId, postId]);
      threadRelations.forEach((rel) => {
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

      // 8. Build thread tree
      const postsMap = new Map<string, Post>();
      allPosts.forEach((post) => {
        postsMap.set(post.id, post as unknown as Post);
      });

      const childrenMap = new Map<string, string[]>();
      threadRelations.forEach((rel) => {
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

      const threadTree = buildTree(currentRootId, 0, null);

      if (!threadTree) {
        throw new Error('Failed to build thread tree');
      }

      return {
        rootPost: actualRootPost,
        threadTree,
        allPosts: allPosts as unknown as Post[],
        relations: threadRelations,
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
