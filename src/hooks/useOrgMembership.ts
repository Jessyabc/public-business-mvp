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
    slug: string | null;
    logo_url: string | null;
    created_by: string | null;
    created_at: string;
    theme_version: number;
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
          id, org_id, user_id, role, created_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useOrgMembership] Error fetching memberships:', error);
        return [];
      }
      
      // Fetch org details separately to avoid type issues with RLS
      const memberships = (data || []) as OrgMembership[];
      if (memberships.length > 0) {
        // Deduplicate by org_id - keep the most recent membership per org
        const orgMembershipMap = new Map<string, OrgMembership>();
        memberships.forEach(m => {
          const existing = orgMembershipMap.get(m.org_id);
          if (!existing || new Date(m.created_at) > new Date(existing.created_at)) {
            orgMembershipMap.set(m.org_id, m);
          }
        });
        const uniqueMemberships = Array.from(orgMembershipMap.values());
        
        const orgIds = Array.from(new Set(uniqueMemberships.map(m => m.org_id)));
        const { data: orgs } = await supabase
          .from('orgs')
          .select('id, name, description, slug, logo_url, created_by, created_at, theme_version')
          .in('id', orgIds);
        
        const orgMap = new Map((orgs || []).map(o => [o.id, o]));
        uniqueMemberships.forEach(m => {
          m.org = orgMap.get(m.org_id) as OrgMembership['org'];
        });
        
        return uniqueMemberships;
      }
      
      return memberships;
    },
    enabled: !!user,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

/**
 * Hook to check if user is an org owner (of any org)
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
 * Hook to check if user is owner of a specific organization
 */
export function useIsOrgOwnerOf(orgId?: string | null) {
  const { data: memberships } = useOrgMembership();
  
  if (!orgId) return { isOwner: false };
  
  const membership = memberships?.find(m => m.org_id === orgId);
  const isOwner = membership?.role === 'owner';
  
  return {
    isOwner,
    membership,
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

