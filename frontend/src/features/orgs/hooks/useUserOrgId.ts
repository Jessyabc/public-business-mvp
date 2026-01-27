import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useUserOrgId() {
  return useQuery({
    queryKey: ['user', 'org_id'],
    queryFn: async () => {
      const { data: rpc, error: rpcErr } = await supabase.rpc('get_user_org_id');
      if (!rpcErr && rpc) return rpc as string;
      return null;
    },
    staleTime: 30000,
  });
}
