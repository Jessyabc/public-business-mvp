import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserOrgId } from './useUserOrgId';

export interface Organization {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  industry_id: string | null;
  company_size: string | null;
  status: string;
  slug: string | null;
}

export function useOrganization(orgId?: string) {
  const { data: defaultOrgId } = useUserOrgId();
  const finalOrgId = orgId || defaultOrgId;

  return useQuery({
    queryKey: ['organization', finalOrgId],
    queryFn: async () => {
      if (!finalOrgId) return null;

      const { data, error } = await supabase
        .from('orgs')
        .select('*')
        .eq('id', finalOrgId)
        .single();

      if (error) {
        console.error('Error fetching organization:', error);
        throw error;
      }

      return data as Organization;
    },
    enabled: !!finalOrgId,
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ orgId, updates }: { orgId: string; updates: Partial<Organization> }) => {
      const { data, error } = await supabase
        .from('orgs')
        .update(updates)
        .eq('id', orgId)
        .select()
        .single();

      if (error) {
        console.error('Error updating organization:', error);
        throw error;
      }

      return data as Organization;
    },
    onSuccess: (data) => {
      // Invalidate organization queries
      queryClient.invalidateQueries({ queryKey: ['organization', data.id] });
      queryClient.invalidateQueries({ queryKey: ['user-orgs'] });
      queryClient.invalidateQueries({ queryKey: ['org-analytics', data.id] });
    },
  });
}

