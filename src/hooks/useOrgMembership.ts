import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface OrgMembership {
  id: string;
  org_id: string;
  user_id: string;
  role: 'owner' | 'business_admin' | 'business_member' | 'member';
  created_at: string;
  org?: {
    id: string;
    name: string;
    description: string | null;
    website: string | null;
    industry_id: string | null;
    company_size: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_by: string;
  };
}

/**
 * Hook to get user's organization memberships
 */
export function useOrgMembership() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['org_membership', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('org_members')
        .select(`
          *,
          org:orgs(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        // Log error but don't throw to prevent UI crashes
        console.error('[useOrgMembership] Error fetching memberships:', error);
        return [];
      }
      
      return (data || []) as OrgMembership[];
    },
    enabled: !!user,
    staleTime: 0, // Reduced to 0 to always refetch (can increase later)
    refetchOnMount: true,
    refetchOnWindowFocus: true, // Refetch when window regains focus
    retry: 2, // Retry failed requests up to 2 times
  });
}

/**
 * Hook to check if user is an org owner
 */
export function useIsOrgOwner() {
  const { data: memberships, isLoading } = useOrgMembership();
  
  const isOrgOwner = memberships?.some(m => m.role === 'owner') ?? false;
  
  return {
    isOrgOwner,
    ownedOrgs: memberships?.filter(m => m.role === 'owner') ?? [],
    isLoading,
  };
}

/**
 * Hook to check if user is a business member (any org membership)
 */
export function useIsBusinessMember() {
  const { data: memberships } = useOrgMembership();
  
  return {
    isBusinessMember: (memberships?.length ?? 0) > 0,
    memberships: memberships ?? [],
  };
}

/**
 * Hook to get user's primary org (first owned org, or first membership)
 */
export function useUserPrimaryOrg() {
  const { data: memberships } = useOrgMembership();
  
  const primaryOrg = memberships?.[0]?.org;
  const isOwner = memberships?.some(m => m.role === 'owner' && m.org?.id === primaryOrg?.id) ?? false;
  
  return {
    org: primaryOrg,
    isOwner,
    membership: memberships?.[0],
  };
}

