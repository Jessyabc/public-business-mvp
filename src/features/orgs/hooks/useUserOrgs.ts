import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserOrg {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  role: string;
  created_at: string;
}

export function useUserOrgs() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-orgs', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Fetch all organizations the user is a member of
      const { data: members, error: membersError } = await supabase
        .from('org_members')
        .select('org_id, role, created_at')
        .eq('user_id', user.id);
      
      if (membersError) {
        console.error('Error fetching org members:', membersError);
        return [];
      }
      
      if (!members || members.length === 0) return [];
      
      // Fetch org details for all org IDs
      const orgIds = members.map(m => m.org_id);
      const { data: orgs, error: orgsError } = await supabase
        .from('orgs')
        .select('id, name, description, logo_url, website, created_at')
        .in('id', orgIds);
      
      if (orgsError) {
        console.error('Error fetching orgs:', orgsError);
        return [];
      }
      
      // Combine org data with member role
      const memberMap = new Map(members.map(m => [m.org_id, m]));
      return (orgs || []).map(org => ({
        id: org.id,
        name: org.name,
        description: org.description,
        logo_url: org.logo_url,
        website: org.website,
        role: memberMap.get(org.id)?.role || 'member',
        created_at: memberMap.get(org.id)?.created_at || org.created_at,
      })).sort((a, b) => {
        // Sort by role priority (owner first, then admin, then member), then by created_at
        const rolePriority: Record<string, number> = { owner: 0, business_admin: 1, member: 2 };
        const aPriority = rolePriority[a.role] ?? 3;
        const bPriority = rolePriority[b.role] ?? 3;
        if (aPriority !== bPriority) return aPriority - bPriority;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    },
    enabled: !!user,
  });
}

