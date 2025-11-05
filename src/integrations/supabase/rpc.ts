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

export async function rpcInviteToOrg(
  p_target_user: string,
  p_target_org: string,
  p_role: string = 'member'
) {
  return supabase.rpc("invite_to_org", {
    p_target_user,
    p_target_org,
    p_role
  });
}

export async function rpcIsBusinessUser(user_uuid?: string) {
  return supabase.rpc("is_business_user", { 
    p_user_id: user_uuid || null 
  });
}

export async function rpcSpaceChainHard(
  p_start: string,
  p_direction: string = 'forward',
  p_limit: number = 25,
  p_max_depth: number = 500
) {
  return supabase.rpc("api_space_chain_hard", {
    p_start,
    p_direction,
    p_limit,
    p_max_depth
  });
}

export async function rpcListRecentPublicPosts(p_q?: string, p_limit?: number) {
  return supabase.rpc("api_list_recent_public_posts", {
    p_q: p_q || null,
    p_limit: p_limit || 15
  });
}

export async function rpcCreateSoftLinks(p_parent: string, p_children: string[]) {
  return supabase.rpc("api_create_soft_links", {
    p_parent,
    p_children
  });
}

export async function rpcIncrementPostViews(p_post_id: string) {
  return supabase.rpc("increment_post_views", { p_post_id });
}

export async function rpcIncrementPostLikes(p_post_id: string) {
  return supabase.rpc("increment_post_likes", { p_post_id });
}