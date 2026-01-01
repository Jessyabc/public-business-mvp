import { supabase } from '@/integrations/supabase/client';

// Single RPC call: creates the org AND links current user as owner
export async function createOrganization(params: {
  name: string;
  description?: string | null;
  website?: string | null;
  industry_id?: string | null;
  company_size?: string | null;
}) {
  // Call the RPC, passing all fields
  const { data: orgId, error } = await (supabase.rpc as any)('create_org_and_owner', {
    p_name: params.name,
    p_description: params.description ?? null,
    p_website: params.website ?? null,
    p_industry_id: params.industry_id ?? null,
    p_company_size: params.company_size ?? null,
  });
  if (error) throw error;

  // Fetch the newly created org row (id, name, slug, status)
  const { data: org, error: selectError } = await supabase
    .from('orgs')
    .select('id, name, slug, status')
    .eq('id', orgId as string)
    .single();
  if (selectError) throw selectError;

  return org as { id: string; name: string; slug: string; status: string };
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

export async function inviteUserToOrg(targetUserId: string, targetOrgId: string, role: string = 'member') {
  const { error } = await supabase.rpc('invite_to_org', {
    p_target_user: targetUserId,
    p_target_org: targetOrgId,
    p_role: role
  });
  if (error) throw error;
}
