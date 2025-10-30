import { supabase } from "./client";

export async function rpcCreateBusinessInvite(p_invitee_email: string) {
  return supabase.rpc("create_business_invite", { p_invitee_email });
}

export async function rpcConsumeInvite(p_token: string) {
  return supabase.rpc("consume_invite", { p_token });
}

export async function rpcCanCreateBusinessPosts(user_uuid: string) {
  return supabase.rpc("can_create_business_posts", { user_uuid });
}

export async function rpcGetMyRoles() {
  return supabase.rpc("get_my_roles");
}

export async function rpcListBrainstormNodes(p_cursor?: string, p_limit?: number) {
  return supabase.rpc("api_list_brainstorm_nodes", { 
    p_cursor: p_cursor || null, 
    p_limit: p_limit || 500 
  });
}

export async function rpcListBrainstormEdgesForNodes(p_node_ids: string[]) {
  return supabase.rpc("api_list_brainstorm_edges_for_nodes", { p_node_ids });
}

export async function rpcTrackEvent(
  p_event: string, 
  p_target: string, 
  p_kind: string, 
  p_props?: Record<string, any>
) {
  return supabase.rpc("api_track_event", { 
    p_event, 
    p_target, 
    p_kind, 
    p_props: p_props || {} 
  });
}

export async function rpcCreatePost(
  kind: 'Spark' | 'BusinessInsight' | 'Insight',
  title: string,
  body: string,
  org_id?: string | null
) {
  return supabase.rpc("create_post", {
    p_kind: kind,
    p_title: title,
    p_body: body,
    p_org_id: org_id || null
  });
}