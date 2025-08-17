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