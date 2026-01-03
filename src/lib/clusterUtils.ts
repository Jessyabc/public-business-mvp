import { SupabaseClient } from '@supabase/supabase-js';
import type { BasePost } from '@/types/post';

export interface ContinuationNode {
  post: BasePost;
  depth: number;
  descendantCount: number;
  score: number; // weighted rank score
  parentId: string | null;
}

export interface LineageCluster {
  spark: BasePost; // root anchor
  continuations: ContinuationNode[]; // all continuations (flat)
  latestActivityAt: string; // max created_at in cluster
  totalContinuations: number;
}

/**
 * Recursively count all descendants for a post (including nested)
 */
async function countDescendants(
  sb: SupabaseClient,
  postId: string,
  visited: Set<string> = new Set()
): Promise<number> {
  if (visited.has(postId)) return 0;
  visited.add(postId);

  const { data: relations, error } = await sb
    .from('post_relations')
    .select('child_post_id')
    .eq('parent_post_id', postId)
    .in('relation_type', ['reply', 'origin']);

  if (error || !relations || relations.length === 0) {
    return 0;
  }

  let count = relations.length; // Direct children

  // Recursively count descendants of each child
  for (const rel of relations) {
    count += await countDescendants(sb, rel.child_post_id, visited);
  }

  return count;
}

/**
 * Recursively fetch all continuations for a root post
 */
async function fetchContinuations(
  sb: SupabaseClient,
  rootPostId: string,
  visited: Set<string> = new Set(),
  depth: number = 0,
  parentId: string | null = null
): Promise<ContinuationNode[]> {
  if (visited.has(rootPostId) || depth > 10) return []; // Safety limit
  visited.add(rootPostId);

  const result: ContinuationNode[] = [];

  // Fetch children (continuations via 'reply' or 'origin' relations)
  const { data: relations, error } = await sb
    .from('post_relations')
    .select('child_post_id')
    .eq('parent_post_id', rootPostId)
    .in('relation_type', ['reply', 'origin']);

  if (error || !relations || relations.length === 0) {
    return result;
  }

  // Fetch the child posts
  const childIds = relations.map(r => r.child_post_id);
  const { data: childPosts, error: postsError } = await sb
    .from('posts')
    .select('*')
    .in('id', childIds)
    .eq('status', 'active');

  if (postsError || !childPosts) {
    return result;
  }

  // Process each child
  for (const childPost of childPosts as BasePost[]) {
    // Count all descendants (recursive) - use a fresh visited set to avoid cycles
    const descendantCount = await countDescendants(sb, childPost.id, new Set());
    
    // Calculate weighted score: (TScore * 0.30) + (DescendantCount * 0.70)
    const tScore = childPost.t_score ?? 0;
    const score = (tScore * 0.30) + (descendantCount * 0.70);

    result.push({
      post: childPost,
      depth: depth + 1,
      descendantCount,
      score,
      parentId: rootPostId,
    });

    // Recursively get and add descendants
    const descendants = await fetchContinuations(
      sb,
      childPost.id,
      visited,
      depth + 1,
      childPost.id
    );
    result.push(...descendants);
  }

  return result;
}

/**
 * Calculate max created_at in a cluster
 */
function calculateLatestActivity(spark: BasePost, continuations: ContinuationNode[]): string {
  let latest = spark.created_at;
  
  for (const cont of continuations) {
    if (cont.post.created_at > latest) {
      latest = cont.post.created_at;
    }
  }
  
  return latest;
}

/**
 * Build a lineage cluster for a root Spark
 */
export async function buildCluster(
  sb: SupabaseClient,
  spark: BasePost
): Promise<LineageCluster> {
  const continuations = await fetchContinuations(sb, spark.id);
  
  // Sort continuations by score (highest first)
  continuations.sort((a, b) => b.score - a.score);

  const latestActivityAt = calculateLatestActivity(spark, continuations);

  return {
    spark,
    continuations,
    latestActivityAt,
    totalContinuations: continuations.length,
  };
}

/**
 * Get top continuations for display (top 3, max depth 2)
 */
export function getTopContinuations(cluster: LineageCluster, maxCount: number = 3): ContinuationNode[] {
  // Filter to depth 1 (direct continuations only)
  const depth1Continuations = cluster.continuations.filter(c => c.depth === 1);
  
  // Sort by score and take top N
  return depth1Continuations
    .sort((a, b) => b.score - a.score)
    .slice(0, maxCount);
}

/**
 * Count deeper continuations (depth > 3, since we show up to depth 3)
 */
export function countDeeperContinuations(cluster: LineageCluster): number {
  return cluster.continuations.filter(c => c.depth > 3).length;
}

