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
    user_id?: string | null;
  }
): Promise<{ clusters: LineageCluster[]; nextCursor: string | null }> {
  const { data, error } = await sb.rpc('get_lineage_clusters', {
    p_mode: opts.mode,
    p_limit: opts.limit ?? 20,
    p_cursor: opts.cursor ?? null,
    p_kinds: opts.kinds ?? null,
    p_search: opts.search ?? null,
    p_org_id: opts.org_id ?? null,
    p_user_id: opts.user_id ?? null,
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
 * Get top continuations for display (top 5, max depth 2)
 */
export function getTopContinuations(cluster: LineageCluster, maxCount: number = 5): ContinuationNode[] {
  // Filter to depth 1 (direct continuations only)
  const depth1Continuations = cluster.continuations.filter(c => c.depth === 1);
  
  // Sort by score and take top N
  return depth1Continuations
    .sort((a, b) => b.score - a.score)
    .slice(0, maxCount);
}

/**
 * Get all continuations for fading display (for items 6-15)
 */
export function getAllContinuationsWithFade(cluster: LineageCluster, visibleCount: number = 5): Array<ContinuationNode & { fadeOpacity: number }> {
  const depth1Continuations = cluster.continuations
    .filter(c => c.depth === 1)
    .sort((a, b) => b.score - a.score);
  
  return depth1Continuations.map((c, index) => ({
    ...c,
    fadeOpacity: index < visibleCount ? 1 : Math.max(0.3, 1 - ((index - visibleCount) * 0.15))
  }));
}

/**
 * Count deeper continuations (depth > 3, since we show up to depth 3)
 */
export function countDeeperContinuations(cluster: LineageCluster): number {
  return cluster.continuations.filter(c => c.depth > 3).length;
}

