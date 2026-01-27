-- =====================================================
-- Organization Creation and Business Membership Flow (Fixed)
-- =====================================================

-- 1. Update create_org_and_owner to assign business_user role
CREATE OR REPLACE FUNCTION public.create_org_and_owner(p_name text, p_description text DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_org uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Create the organization
  INSERT INTO public.orgs (name, description, created_by)
  VALUES (p_name, p_description, auth.uid())
  RETURNING id INTO v_org;

  -- Add user as owner in org_members
  INSERT INTO public.org_members (org_id, user_id, role)
  VALUES (v_org, auth.uid(), 'owner');

  -- Grant business_user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'business_user'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN v_org;
END;
$function$;

-- 2. Create invite_to_org function
CREATE OR REPLACE FUNCTION public.invite_to_org(p_target_user uuid, p_target_org uuid, p_role text DEFAULT 'member')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify caller is owner or admin of the organization
  IF NOT EXISTS (
    SELECT 1 FROM public.org_members 
    WHERE org_id = p_target_org 
      AND user_id = auth.uid() 
      AND role IN ('owner', 'business_admin')
  ) AND NOT is_admin() THEN
    RAISE EXCEPTION 'Not authorized to invite users to this organization';
  END IF;

  -- Add user to organization
  INSERT INTO public.org_members (org_id, user_id, role)
  VALUES (p_target_org, p_target_user, p_role)
  ON CONFLICT (org_id, user_id) DO UPDATE SET role = p_role;

  -- Grant business_user role to invited user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_target_user, 'business_user'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$function$;

-- 3. Update get_user_roles to handle business_user
CREATE OR REPLACE FUNCTION public.get_user_roles(p_user_id uuid)
RETURNS app_role[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT COALESCE(array_agg(role), ARRAY['public_user'::app_role])
  FROM public.user_roles
  WHERE user_id = p_user_id;
$function$;

-- 4. Helper function to check if user is business user
CREATE OR REPLACE FUNCTION public.is_business_user(p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = p_user_id 
      AND role IN ('business_user'::app_role, 'admin'::app_role)
  );
$function$;

-- 5. Cleanup duplicate roles (keep only one per user per role)
DELETE FROM public.user_roles a
USING public.user_roles b
WHERE a.id > b.id 
  AND a.user_id = b.user_id 
  AND a.role = b.role;

-- 6. Clean up orphaned user_roles (users that no longer exist)
DELETE FROM public.user_roles
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- 7. Clean up orphaned org_members (users that no longer exist)
DELETE FROM public.org_members
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- 8. Ensure all existing users have public_user role
INSERT INTO public.user_roles (user_id, role)
SELECT au.id, 'public_user'::app_role
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = au.id AND ur.role = 'public_user'::app_role
)
ON CONFLICT (user_id, role) DO NOTHING;

-- 9. Grant business_user role to existing org owners (only valid users)
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT om.user_id, 'business_user'::app_role
FROM public.org_members om
INNER JOIN auth.users au ON au.id = om.user_id
WHERE om.role IN ('owner', 'business_admin')
ON CONFLICT (user_id, role) DO NOTHING;