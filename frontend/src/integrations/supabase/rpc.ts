import { supabase } from "./client";
import { AdminApprovalResult, AdminPendingIdea } from "@/features/admin/openIdeas/types";

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
  kind: 'Spark' | 'BusinessInsight',
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

// Organization application RPC functions
export async function rpcApplyToOrg(org_id: string, message?: string | null) {
  return supabase.rpc("apply_to_org" as any, {
    p_org_id: org_id,
    p_message: message || null,
  });
}

export async function rpcApproveOrgMemberApplication(application_id: string) {
  return supabase.rpc("approve_org_member_application" as any, {
    p_application_id: application_id,
  });
}

export async function rpcRejectOrgMemberApplication(application_id: string) {
  return supabase.rpc("reject_org_member_application" as any, {
    p_application_id: application_id,
  });
}

export async function rpcApproveOrgRequest(request_id: string) {
  return supabase.rpc("approve_org_request" as any, {
    p_request_id: request_id,
  });
}

export async function rpcRejectOrgRequest(request_id: string, reason?: string | null) {
  return supabase.rpc("reject_org_request" as any, {
    p_request_id: request_id,
    p_reason: reason || null,
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

export async function rpcAdminListPending(p_limit?: number) {
  // @ts-expect-error - Function exists but not in generated types
  return supabase.rpc("admin_list_pending", { p_limit: p_limit || null }) as Promise<{ data: AdminPendingIdea[] | null; error: Error | null }>;
}

export async function rpcAdminApproveIntake(p_id: string) {
  // @ts-expect-error - Function exists but not in generated types
  return supabase.rpc("admin_approve_intake", { p_id }) as Promise<{ data: AdminApprovalResult | null; error: Error | null }>;
}

export async function rpcAdminApproveUser(p_id: string) {
  // @ts-expect-error - Function exists but not in generated types
  return supabase.rpc("admin_approve_user", { p_id }) as Promise<{ data: AdminApprovalResult | null; error: Error | null }>;
}
