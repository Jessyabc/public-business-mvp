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

interface RpcClusterRow {
  spark_id: string;
  spark_data: BasePost;
  continuations: Array<{
    post: BasePost;
    depth: number;
    parent_id: string;
    descendant_count: number;
    score: number;
  }>;
  total_continuations: number;
  latest_activity_at: string;
}

/**
 * Fetch lineage clusters using optimized RPC function (single query)
 * Replaces the old N+1 recursive approach
 */
export async function fetchClustersRpc(
  sb: SupabaseClient,
  opts: {
    mode: 'public' | 'business';
    limit?: number;
    cursor?: string | null;
    kinds?: string[] | null;
    search?: string | null;
    org_id?: string | null;
  }
): Promise<{ clusters: LineageCluster[]; nextCursor: string | null }> {
  const { data, error } = await sb.rpc('get_lineage_clusters', {
    p_mode: opts.mode,
    p_limit: opts.limit ?? 20,
    p_cursor: opts.cursor ?? null,
    p_kinds: opts.kinds ?? null,
    p_search: opts.search ?? null,
    p_org_id: opts.org_id ?? null,
  });

  if (error) {
    console.error('Error fetching clusters via RPC:', error);
    return { clusters: [], nextCursor: null };
  }

  const rows = (data || []) as RpcClusterRow[];

  const clusters: LineageCluster[] = rows.map((row) => ({
    spark: row.spark_data,
    continuations: row.continuations.map((c) => ({
      post: c.post,
      depth: c.depth,
      descendantCount: c.descendant_count,
      score: c.score,
      parentId: c.parent_id,
    })),
    latestActivityAt: row.latest_activity_at,
    totalContinuations: row.total_continuations,
  }));

  const nextCursor = clusters.length === (opts.limit ?? 20) 
    ? clusters[clusters.length - 1].latestActivityAt 
    : null;

  return { clusters, nextCursor };
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

// ============================================================================
// LEGACY FUNCTIONS - kept for backward compatibility during migration
// These can be removed once all code paths use fetchClustersRpc
// ============================================================================

/**
 * @deprecated Use fetchClustersRpc instead - this makes N+1 queries
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

  let count = relations.length;
  for (const rel of relations) {
    count += await countDescendants(sb, rel.child_post_id, visited);
  }

  return count;
}

/**
 * @deprecated Use fetchClustersRpc instead - this makes N+1 queries
 */
async function fetchContinuations(
  sb: SupabaseClient,
  rootPostId: string,
  visited: Set<string> = new Set(),
  depth: number = 0,
  parentId: string | null = null
): Promise<ContinuationNode[]> {
  if (visited.has(rootPostId) || depth > 10) return [];
  visited.add(rootPostId);

  const result: ContinuationNode[] = [];

  const { data: relations, error } = await sb
    .from('post_relations')
    .select('child_post_id')
    .eq('parent_post_id', rootPostId)
    .in('relation_type', ['reply', 'origin']);

  if (error || !relations || relations.length === 0) {
    return result;
  }

  const childIds = relations.map(r => r.child_post_id);
  const { data: childPosts, error: postsError } = await sb
    .from('posts')
    .select('*')
    .in('id', childIds)
    .eq('status', 'active');

  if (postsError || !childPosts) {
    return result;
  }

  for (const childPost of childPosts as BasePost[]) {
    const descendantCount = await countDescendants(sb, childPost.id, new Set());
    const tScore = childPost.t_score ?? 0;
    const score = (tScore * 0.30) + (descendantCount * 0.70);

    result.push({
      post: childPost,
      depth: depth + 1,
      descendantCount,
      score,
      parentId: rootPostId,
    });

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
 * @deprecated Use fetchClustersRpc instead - this makes N+1 queries
 */
export async function buildCluster(
  sb: SupabaseClient,
  spark: BasePost
): Promise<LineageCluster> {
  const continuations = await fetchContinuations(sb, spark.id);
  continuations.sort((a, b) => b.score - a.score);
  const latestActivityAt = calculateLatestActivity(spark, continuations);

  return {
    spark,
    continuations,
    latestActivityAt,
    totalContinuations: continuations.length,
  };
}
