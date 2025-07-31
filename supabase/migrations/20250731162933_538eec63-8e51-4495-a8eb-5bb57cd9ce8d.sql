-- Fix search path security issues for functions
CREATE OR REPLACE FUNCTION public.accept_business_invitation(invitation_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  invitation_record RECORD;
  user_email TEXT;
BEGIN
  -- Get current user email
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  -- Get invitation details
  SELECT * INTO invitation_record 
  FROM public.business_invitations 
  WHERE id = invitation_id 
    AND invited_email = user_email 
    AND status = 'pending' 
    AND expires_at > now();
    
  -- Check if invitation exists and is valid
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update user role to business_member
  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'business_member')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Mark invitation as accepted
  UPDATE public.business_invitations 
  SET status = 'accepted', updated_at = now()
  WHERE id = invitation_id;
  
  RETURN TRUE;
END;
$$;

-- Fix search path for can_create_business_posts function
CREATE OR REPLACE FUNCTION public.can_create_business_posts(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid 
    AND role IN ('business_member', 'admin')
  );
$$;