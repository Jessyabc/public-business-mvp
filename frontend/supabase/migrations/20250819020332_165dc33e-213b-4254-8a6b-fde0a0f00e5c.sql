-- Fix missing INSERT policy for business_invitations table
-- This allows business members to create invitations through both RPC and direct table access

-- Create INSERT policy for business_invitations
-- Only business members and admins can create invitations
CREATE POLICY "rls_bi_insert_business_members" 
ON public.business_invitations 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Only business members or admins can create invitations
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('business_member'::app_role, 'admin'::app_role)
  )
  AND 
  -- The inviter_id must match the current user
  inviter_id = auth.uid()
);