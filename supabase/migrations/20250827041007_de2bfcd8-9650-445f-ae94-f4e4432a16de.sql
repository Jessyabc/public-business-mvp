-- Fix security issue: Restrict business profile contact information access
-- Only allow access to business contact details for business members and admins

-- First, drop the existing overly permissive select policy
DROP POLICY IF EXISTS "rls_bp_select" ON public.business_profiles;

-- Create new restrictive policy for business profiles
-- Users can see their own profile, admins can see all, 
-- but only business members can see other approved business profiles
CREATE POLICY "rls_bp_select_secure" 
ON public.business_profiles 
FOR SELECT 
USING (
  -- Own profile access
  (user_id = auth.uid()) 
  OR 
  -- Admin access
  is_admin(auth.uid())
  OR 
  -- Business members can see approved profiles of other business members
  (
    status = 'approved' 
    AND EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('business_member'::app_role, 'admin'::app_role)
    )
  )
);