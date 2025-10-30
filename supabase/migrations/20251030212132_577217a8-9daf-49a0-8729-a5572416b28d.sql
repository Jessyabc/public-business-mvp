-- Migration: Backend Sanity & Function Unification (Part 2.5 - Fix remaining policy)
-- Update the last policy that still references is_admin(uuid)

DROP POLICY IF EXISTS "ur_admin_all" ON public.user_roles;
CREATE POLICY "ur_admin_all"
  ON public.user_roles
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Now drop duplicate functions
DROP FUNCTION IF EXISTS public.get_user_role(uuid);
DROP FUNCTION IF EXISTS public.is_admin(uuid);
DROP FUNCTION IF EXISTS public.is_business_member(uuid);
DROP FUNCTION IF EXISTS public.get_user_roles(uuid);

-- Add comments on canonical functions
COMMENT ON FUNCTION public.get_user_role() IS 
  'Returns the role of the current authenticated user as text. Uses auth.uid() to identify the user.';

COMMENT ON FUNCTION public.is_admin() IS 
  'Returns true if the current authenticated user has the admin role. Uses auth.uid() internally.';

COMMENT ON FUNCTION public.is_business_member() IS 
  'Returns true if the current authenticated user has business_member or admin role. Uses auth.uid() internally.';

COMMENT ON FUNCTION public.get_my_roles() IS 
  'Returns all roles for the current authenticated user as an array of app_role enums. Preferred over deprecated get_user_roles().';

COMMENT ON FUNCTION public.handle_new_user() IS 
  'Trigger function that runs after a new user is created in auth.users. Assigns the public_user role by default.';

COMMENT ON FUNCTION public.create_post(text, text, text, uuid) IS 
  'SECURITY DEFINER function to create a post with specified kind (Spark, BusinessInsight, Insight). Validates authentication and sets appropriate type/mode/visibility based on kind.';

COMMENT ON FUNCTION public.has_role(uuid, app_role) IS 
  'SECURITY DEFINER helper function. Returns true if the specified user has the specified role. Used internally by RLS policies to avoid recursion.';

COMMENT ON FUNCTION public.has_any_role(uuid, app_role[]) IS 
  'SECURITY DEFINER helper function. Returns true if the specified user has any of the specified roles. Used internally by RLS policies to avoid recursion.';

COMMENT ON FUNCTION public.increment_post_likes(uuid) IS 
  'SECURITY DEFINER function to atomically increment the likes_count for a post.';

COMMENT ON FUNCTION public.increment_post_views(uuid) IS 
  'SECURITY DEFINER function to atomically increment the views_count for a post.';

COMMENT ON FUNCTION public.increment_post_comments(uuid) IS 
  'SECURITY DEFINER function to atomically increment the comments_count for a post.';

COMMENT ON FUNCTION public.grant_role(uuid, text) IS 
  'SECURITY DEFINER function to grant a role to a user. Only callable by admins or system processes.';

COMMENT ON FUNCTION public.create_business_invite(text, text, integer) IS 
  'SECURITY DEFINER function to create a business invitation. Creates a unique token and sets expiration. Only business_members can create invites.';

COMMENT ON FUNCTION public.consume_invite(text) IS 
  'SECURITY DEFINER function to consume a business invitation. Validates token, checks email match, and grants the role to the authenticated user.';

COMMENT ON FUNCTION public.can_create_business_posts(uuid) IS 
  'SECURITY DEFINER function that returns true if the specified user can create business posts (has business_member or admin role).';

COMMENT ON FUNCTION public.is_org_member(uuid) IS 
  'SECURITY DEFINER function that returns true if the current authenticated user is a member of the specified organization.';

COMMENT ON FUNCTION public.get_user_org_id() IS 
  'SECURITY DEFINER function that returns the organization ID for the current authenticated user. Prefers business_admin role, then most recent membership.';

COMMENT ON FUNCTION public.create_org_and_owner(text, text) IS 
  'SECURITY DEFINER function to create a new organization and set the current user as owner. Returns the new org ID.';

COMMENT ON FUNCTION public.api_list_brainstorm_nodes(timestamp with time zone, integer) IS 
  'Public API function to list brainstorm nodes (posts with type=brainstorm). Supports cursor-based pagination.';

COMMENT ON FUNCTION public.api_list_brainstorm_edges_for_nodes(uuid[]) IS 
  'Public API function to list edges (post_relations) for the specified node IDs.';

COMMENT ON FUNCTION public.api_track_event(text, uuid, text, jsonb) IS 
  'SECURITY DEFINER function to track analytics events. Inserts into analytics_events table.';

COMMENT ON FUNCTION public.api_space_chain_hard(uuid, text, integer, integer) IS 
  'Public API function to traverse hard relation chains in the brainstorm graph. Supports forward/backward traversal with depth limits.';

COMMENT ON FUNCTION public.update_updated_at_column() IS 
  'Trigger function to automatically update the updated_at timestamp on row updates.';

COMMENT ON FUNCTION public.update_posts_updated_at() IS 
  'Trigger function to automatically update the updated_at timestamp for posts table.';

COMMENT ON FUNCTION public.on_business_profile_status_change() IS 
  'Trigger function that runs when business_profile status changes. Grants business_member role and stamps approval metadata when status becomes approved.';

COMMENT ON FUNCTION public.handle_new_user_profile() IS 
  'Trigger function that creates a profile entry when a new user is created in auth.users. Uses display_name from metadata or email.';

DO $$
BEGIN
  RAISE NOTICE '=== BACKEND SANITY & FUNCTION UNIFICATION COMPLETE ===';
  RAISE NOTICE 'Canonical functions: get_user_role(), is_admin(), is_business_member(), get_my_roles()';
  RAISE NOTICE 'Dropped duplicates: get_user_role(uuid), get_user_roles(uuid), is_admin(uuid), is_business_member(uuid)';
  RAISE NOTICE 'All RLS policies updated to use canonical functions';
  RAISE NOTICE 'All functions documented with COMMENT statements';
  RAISE NOTICE '=== END ===';
END $$;