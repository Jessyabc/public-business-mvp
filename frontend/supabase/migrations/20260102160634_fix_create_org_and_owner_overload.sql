-- =====================================================
-- Fix create_org_and_owner function overload ambiguity
-- =====================================================
-- This migration consolidates create_org_and_owner into a single function
-- with all optional parameters to resolve ambiguity when called with different
-- parameter counts (2 params for admin approval, 5 params for CreateOrganization)

-- Drop the existing function to remove ambiguity
DROP FUNCTION IF EXISTS public.create_org_and_owner(text, text);
DROP FUNCTION IF EXISTS public.create_org_and_owner(text, text, text, uuid, text);

-- Create unified function with all optional parameters
CREATE OR REPLACE FUNCTION public.create_org_and_owner(
  p_name text,
  p_description text DEFAULT NULL,
  p_website text DEFAULT NULL,
  p_industry_id uuid DEFAULT NULL,
  p_company_size text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_org uuid;
  v_base_slug text;
  v_slug text;
  v_counter integer := 0;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Generate base slug from name
  v_base_slug := lower(regexp_replace(p_name, '[^a-zA-Z0-9]+', '-', 'g'));
  v_slug := v_base_slug;

  -- Ensure slug is unique by appending a number if needed
  WHILE EXISTS (SELECT 1 FROM public.orgs WHERE slug = v_slug) LOOP
    v_counter := v_counter + 1;
    v_slug := v_base_slug || '-' || v_counter::text;
  END LOOP;

  -- Create the organization with all provided fields and unique slug
  INSERT INTO public.orgs (name, description, website, industry_id, company_size, slug, created_by)
  VALUES (p_name, p_description, p_website, p_industry_id, p_company_size, v_slug, auth.uid())
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

-- Add comment for documentation
COMMENT ON FUNCTION public.create_org_and_owner(text, text, text, uuid, text) IS 
  'SECURITY DEFINER function to create a new organization and set the current user as owner. 
   All parameters except p_name are optional. Returns the new org ID.';

