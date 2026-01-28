-- Add business_member role to existing enum
ALTER TYPE app_role ADD VALUE 'business_member';

-- Create business_invitations table for tracking invitations
CREATE TABLE public.business_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invited_email TEXT NOT NULL,
  invited_by_user_id UUID NOT NULL,
  invited_by_type TEXT NOT NULL CHECK (invited_by_type IN ('business_member', 'business')), 
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on business_invitations
ALTER TABLE public.business_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for business_invitations
CREATE POLICY "Users can view invitations sent to their email" 
ON public.business_invitations 
FOR SELECT 
USING (invited_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Business members can create invitations" 
ON public.business_invitations 
FOR INSERT 
WITH CHECK (
  auth.uid() = invited_by_user_id AND 
  (get_user_role(auth.uid()) = 'business_member' OR get_user_role(auth.uid()) = 'admin')
);

CREATE POLICY "Users can update invitations sent to their email" 
ON public.business_invitations 
FOR UPDATE 
USING (invited_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Business members can view their sent invitations" 
ON public.business_invitations 
FOR SELECT 
USING (
  invited_by_user_id = auth.uid() AND 
  (get_user_role(auth.uid()) = 'business_member' OR get_user_role(auth.uid()) = 'admin')
);

-- Create function to accept business invitation
CREATE OR REPLACE FUNCTION public.accept_business_invitation(invitation_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create function to check if user can create business posts
CREATE OR REPLACE FUNCTION public.can_create_business_posts(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid 
    AND role IN ('business_member', 'admin')
  );
$$;

-- Update business_profiles to include approval status tracking
ALTER TABLE public.business_profiles ADD COLUMN IF NOT EXISTS approved_by UUID;
ALTER TABLE public.business_profiles ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Create trigger for updated_at on business_invitations
CREATE TRIGGER update_business_invitations_updated_at
BEFORE UPDATE ON public.business_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();