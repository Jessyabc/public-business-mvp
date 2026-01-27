import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ============================================
// Type Definitions
// ============================================

export interface BusinessInsightAnalytics {
  post_id: string;
  org_id: string;
  title: string | null;
  published_at: string | null;
  created_at: string;
  u_score_avg: number;
  u_score_count: number;
  t_score: number;
  continuations_count: number;
  crosslinks_count: number;
  views_count: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
}

export interface OrgAnalytics {
  org_id: string;
  org_name: string;
  total_insights: number;
  avg_u_score: number;
  total_u_ratings: number;
  avg_t_score: number;
  total_continuations: number;
  total_crosslinks: number;
  total_views: number;
  total_likes: number;
  total_shares: number;
  last_insight_published_at: string | null;
}

// ============================================
// Hook: useOrgAnalytics
// Fetch analytics summary for a specific organization
// ============================================

export function useOrgAnalytics(orgId?: string) {
  return useQuery({
    queryKey: ['org-analytics', orgId],
    queryFn: async () => {
      if (!orgId) return null;

      const { data, error } = await supabase
        .from('view_business_org_analytics')
        .select('*')
        .eq('org_id', orgId)
        .single();

      if (error) {
        console.error('Error fetching org analytics:', error);
        throw error;
      }

      return data as OrgAnalytics;
    },
    enabled: !!orgId,
  });
}

// ============================================
// Hook: useOrgTopInsights
// Fetch top-performing insights for an organization
// ============================================

interface UseOrgTopInsightsOptions {
  orgId?: string;
  limit?: number;
  sortBy?: 'u_score' | 'continuations' | 'crosslinks' | 'recent';
}

export function useOrgTopInsights({
  orgId,
  limit = 10,
  sortBy = 'u_score',
}: UseOrgTopInsightsOptions) {
  return useQuery({
    queryKey: ['org-top-insights', orgId, limit, sortBy],
    queryFn: async () => {
      if (!orgId) return [];

      let query = supabase
        .from('view_business_insight_analytics')
        .select('*')
        .eq('org_id', orgId);

      // Apply sorting based on sortBy parameter
      switch (sortBy) {
        case 'u_score':
          // Primary: U-score average (quality), Secondary: U-score count (quantity)
          query = query
            .order('u_score_avg', { ascending: false })
            .order('u_score_count', { ascending: false });
          break;
        case 'continuations':
          query = query.order('continuations_count', { ascending: false });
          break;
        case 'crosslinks':
          query = query.order('crosslinks_count', { ascending: false });
          break;
        case 'recent':
          query = query.order('published_at', { ascending: false });
          break;
      }

      query = query.limit(limit);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching top insights:', error);
        throw error;
      }

      return data as BusinessInsightAnalytics[];
    },
    enabled: !!orgId,
  });
}

// ============================================
// Hook: useInsightAnalytics
// Fetch analytics for a single insight post
// ============================================

export function useInsightAnalytics(postId?: string) {
  return useQuery({
    queryKey: ['insight-analytics', postId],
    queryFn: async () => {
      if (!postId) return null;

      const { data, error } = await supabase
        .from('view_business_insight_analytics')
        .select('*')
        .eq('post_id', postId)
        .single();

      if (error) {
        // It's possible the post doesn't exist in analytics view
        if (error.code === 'PGRST116') return null;
        console.error('Error fetching insight analytics:', error);
        throw error;
      }

      return data as BusinessInsightAnalytics;
    },
    enabled: !!postId,
  });
}

// ============================================
// Hook: useAllOrgsAnalytics
// Fetch analytics for all organizations (admin use)
// ============================================

export function useAllOrgsAnalytics() {
  return useQuery({
    queryKey: ['all-orgs-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('view_business_org_analytics')
        .select('*')
        .order('total_insights', { ascending: false });

      if (error) {
        console.error('Error fetching all orgs analytics:', error);
        throw error;
      }

      return data as OrgAnalytics[];
    },
  });
}
