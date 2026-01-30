import { supabase } from '@/integrations/supabase/client';
import type { PostRelationType } from '@/types/post';
import { logError } from '@/lib/errorLogger';
import { toast } from 'sonner';

/**
 * CANONICAL POST RELATIONS
 * 
 * All relationships between posts use the post_relations table.
 * 
 * Relation types:
 * - 'origin': Parent is the origin/source of child (e.g., idea → insight)
 * - 'reply': Child responds to parent (e.g., continuation of thought)
 * - 'quote': Child quotes/references parent
 * - 'cross_link': Bidirectional association (soft link)
 * 
 * Legacy 'hard' and 'soft' types are mapped to new standard:
 * - 'hard' → 'reply' (continuation)
 * - 'soft' → 'cross_link' (reference)
 */

export interface CreateRelationParams {
  parentPostId: string;
  childPostId: string;
  relationType: PostRelationType | 'hard' | 'soft';
}

/**
 * Maps legacy relation types to canonical types
 */
function normalizeRelationType(type: PostRelationType | 'hard' | 'soft'): PostRelationType {
  switch (type) {
    case 'hard':
      return 'reply'; // Hard links are continuations
    case 'soft':
      return 'cross_link'; // Soft links are references
    default:
      return type as PostRelationType;
  }
}

/**
 * Creates a relation between two posts using the canonical database function.
 * 
 * This function:
 * - Validates that both posts exist
 * - Checks lineage rules
 * - Enforces permissions (must own one of the posts or be business admin)
 * - Normalizes relation types (hard→reply, soft→cross_link)
 * 
 * @throws Error if validation fails or user lacks permission
 */
export async function createPostRelation(params: CreateRelationParams): Promise<void> {
  const normalizedType = normalizeRelationType(params.relationType);
  
  const { error } = await supabase.rpc('create_post_relation', {
    p_parent_post_id: params.parentPostId,
    p_child_post_id: params.childPostId,
    p_relation_type: normalizedType,
  });

  if (error) {
    logError(error, { action: 'create_post_relation', parentPostId: params.parentPostId, childPostId: params.childPostId });
    const errorMessage = error.message || 'Failed to create relation';
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * Creates multiple soft links (cross_link relations) from a parent to multiple children.
 * Useful for linking a new post to multiple existing posts.
 * 
 * @param parentId - The parent post ID
 * @param childIds - Array of child post IDs to link
 */
export async function createSoftLinks(parentId: string, childIds: string[]): Promise<void> {
  if (childIds.length === 0) return;
  
  const { error } = await supabase.rpc('api_create_soft_links', {
    p_parent: parentId,
    p_children: childIds,
  });

  if (error) {
    logError(error, { action: 'create_soft_links', parentId, childIds });
    const errorMessage = error.message || 'Failed to create soft links';
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * Creates a hard link (reply relation) between parent and child.
 * Used for "Continue Spark" functionality.
 * 
 * @param parentId - The parent post ID
 * @param childId - The child post ID (continuation)
 */
export async function createHardLink(parentId: string, childId: string): Promise<void> {
  await createPostRelation({
    parentPostId: parentId,
    childPostId: childId,
    relationType: 'reply', // Hard links are now 'reply' type
  });
}

/**
 * Deletes a relation between two posts.
 * User must own one of the posts or be a business admin.
 * 
 * @param relationId - The relation ID to delete
 */
export async function deletePostRelation(relationId: string): Promise<void> {
  const { error } = await supabase
    .from('post_relations')
    .delete()
    .eq('id', relationId);

  if (error) {
    logError(error, { action: 'delete_post_relation', relationId });
    const errorMessage = error.message || 'Failed to delete relation';
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * Fetches all relations for a post (both as parent and child)
 * 
 * @param postId - The post ID to fetch relations for
 */
export async function fetchPostRelations(postId: string) {
  const { data, error } = await supabase
    .from('post_relations')
    .select('*')
    .or(`parent_post_id.eq.${postId},child_post_id.eq.${postId}`)
    .order('created_at', { ascending: false });

  if (error) {
    logError(error, { action: 'fetch_post_relations', postId });
    // Don't show toast for fetch errors - they're usually handled by UI loading states
    throw new Error(error.message || 'Failed to fetch relations');
  }

  return data || [];
}

/**
 * Fetches child posts linked to a parent post
 * 
 * @param parentId - The parent post ID
 * @param relationType - Optional filter by relation type
 */
export async function fetchChildPosts(parentId: string, relationType?: PostRelationType) {
  let query = supabase
    .from('post_relations')
    .select(`
      *,
      child_post:posts!post_relations_child_post_id_fkey(*)
    `)
    .eq('parent_post_id', parentId);

  if (relationType) {
    query = query.eq('relation_type', relationType);
  }

  const { data, error } = await query;

  if (error) {
    logError(error, { action: 'fetch_child_posts', parentId });
    // Don't show toast for fetch errors - they're usually handled by UI loading states
    throw new Error(error.message || 'Failed to fetch child posts');
  }

  return data || [];
}
