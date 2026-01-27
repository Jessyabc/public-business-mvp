-- =====================================================
-- Fix Organization RPC Functions (Drop and Recreate)
-- =====================================================

-- Drop existing functions that have wrong signatures
DROP FUNCTION IF EXISTS public.approve_org_member_application(uuid);
DROP FUNCTION IF EXISTS public.reject_org_member_application(uuid);
DROP FUNCTION IF EXISTS public.approve_org_request(uuid);
DROP FUNCTION IF EXISTS public.reject_org_request(uuid, text);
DROP FUNCTION IF EXISTS public.apply_to_org(uuid, text);

-- Recreate RPC functions with correct signatures

CREATE OR REPLACE FUNCTION public.apply_to_org(p_org_id uuid, p_message text DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_application_id uuid;
BEGIN
  -- Check if user already has a pending application
  IF EXISTS (
    SELECT 1 FROM public.org_member_applications
    WHERE org_id = p_org_id
      AND user_id = auth.uid()
      AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'You already have a pending application for this organization';
  END IF;
  
  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM public.org_members
    WHERE org_id = p_org_id
      AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'You are already a member of this organization';
  END IF;
  
  INSERT INTO public.org_member_applications (org_id, user_id, message, status)
  VALUES (p_org_id, auth.uid(), p_message, 'pending')
  RETURNING id INTO v_application_id;
  
  RETURN v_application_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_org_member_application(p_application_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_app org_member_applications%ROWTYPE;
BEGIN
  SELECT * INTO v_app FROM public.org_member_applications WHERE id = p_application_id;
  
  IF v_app.id IS NULL THEN
    RAISE EXCEPTION 'Application not found';
  END IF;
  
  -- Check if caller is owner/admin of the org
  IF NOT EXISTS (
    SELECT 1 FROM public.org_members
    WHERE org_id = v_app.org_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'business_admin')
  ) AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only org owners/admins can approve applications';
  END IF;
  
  -- Update application status
  UPDATE public.org_member_applications
  SET status = 'approved', reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now()
  WHERE id = p_application_id;
  
  -- Add user to org
  INSERT INTO public.org_members (org_id, user_id, role)
  VALUES (v_app.org_id, v_app.user_id, 'member')
  ON CONFLICT (org_id, user_id) DO NOTHING;
  
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_org_member_application(p_application_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_app org_member_applications%ROWTYPE;
BEGIN
  SELECT * INTO v_app FROM public.org_member_applications WHERE id = p_application_id;
  
  IF v_app.id IS NULL THEN
    RAISE EXCEPTION 'Application not found';
  END IF;
  
  -- Check if caller is owner/admin of the org
  IF NOT EXISTS (
    SELECT 1 FROM public.org_members
    WHERE org_id = v_app.org_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'business_admin')
  ) AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only org owners/admins can reject applications';
  END IF;
  
  UPDATE public.org_member_applications
  SET status = 'rejected', reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now()
  WHERE id = p_application_id;
  
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_org_request(p_request_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_req org_requests%ROWTYPE;
BEGIN
  -- Only admins can approve org creation requests
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can approve organization requests';
  END IF;
  
  SELECT * INTO v_req FROM public.org_requests WHERE id = p_request_id;
  
  IF v_req.id IS NULL THEN
    RAISE EXCEPTION 'Request not found';
  END IF;
  
  -- Update org status to approved if org_id exists
  IF v_req.org_id IS NOT NULL THEN
    UPDATE public.orgs SET status = 'approved' WHERE id = v_req.org_id;
  END IF;
  
  -- Update request
  UPDATE public.org_requests
  SET status = 'approved', reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now()
  WHERE id = p_request_id;
  
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_org_request(p_request_id uuid, p_reason text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can reject org requests
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can reject organization requests';
  END IF;
  
  UPDATE public.org_requests
  SET status = 'rejected', 
      reviewed_by = auth.uid(), 
      reviewed_at = now(), 
      updated_at = now(),
      reason = COALESCE(p_reason, reason)
  WHERE id = p_request_id;
  
  RETURN true;
END;
$$;

-- Grant execute on all RPC functions
GRANT EXECUTE ON FUNCTION public.apply_to_org(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_org_member_application(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_org_member_application(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_org_request(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_org_request(uuid, text) TO authenticated;