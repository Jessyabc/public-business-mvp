import { supabase } from '@/integrations/supabase/client';

export async function createOrganization(params: { name: string; slug?: string }) {
  const { data, error } = await supabase
    .from('orgs')
    .insert({ 
      name: params.name,
      slug: params.slug || params.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    })
    .select()
    .single();
  if (error) throw error;
  return data as { id: string; name: string; slug: string };
}

export async function addOwnerToOrg(orgId: string, userId: string) {
  const { data, error } = await supabase
    .from('org_members')
    .insert({ org_id: orgId, user_id: userId, role: 'business_admin' })
    .select()
    .single();
  if (error) throw error;
  return data;
}
