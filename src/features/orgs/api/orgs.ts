import { supabase } from '@/integrations/supabase/client';

// Single RPC call: creates the org AND links current user as owner
export async function createOrganization(params: {
  name: string;
  description?: string | null;
}) {
  // Call the RPC, passing name + description
  const { data: orgId, error } = await (supabase.rpc as any)('create_org_and_owner', {
    p_name: params.name,
    p_description: params.description ?? null,
  });
  if (error) throw error;

  // Fetch the newly created org row (id, name, slug)
  const { data: org, error: selectError } = await supabase
    .from('orgs')
    .select('id, name, slug')
    .eq('id', orgId as string)
    .single();
  if (selectError) throw selectError;

  return org as { id: string; name: string; slug: string };
}

// Kept for backwards compatibility but no longer used in CreateOrganization
export async function addOwnerToOrg(orgId: string, userId: string) {
  const { data, error } = await supabase
    .from('org_members')
    .insert({ org_id: orgId, user_id: userId, role: 'business_admin' })
    .select()
    .single();
  if (error) throw error;
  return data;
}
