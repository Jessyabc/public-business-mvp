-- Update user roles to support multiple roles per user
-- Remove the unique constraint that prevents users from having multiple roles

-- First, let's drop the existing unique constraint
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;

-- Add a new unique constraint that allows multiple roles but prevents duplicate role assignments
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_unique UNIQUE (user_id, role);

-- Update the handle_new_user function to properly assign public_user role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $function$
BEGIN
  -- Insert public_user role for all new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'public_user')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- Update the accept_business_invitation function to add business_member role while keeping public_user
CREATE OR REPLACE FUNCTION public.accept_business_invitation(invitation_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  
  -- Add business_member role (user keeps their public_user role)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'business_member')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Mark invitation as accepted
  UPDATE public.business_invitations 
  SET status = 'accepted', updated_at = now()
  WHERE id = invitation_id;
  
  RETURN TRUE;
END;
$function$;

-- Create a function to get all user roles (not just the primary one)
CREATE OR REPLACE FUNCTION public.get_user_roles(user_uuid uuid)
RETURNS app_role[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT ARRAY_AGG(role) FROM public.user_roles WHERE user_id = user_uuid;
$function$;

-- Update the can_create_business_posts function to work with multiple roles
CREATE OR REPLACE FUNCTION public.can_create_business_posts(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid 
    AND role IN ('business_member'::app_role, 'admin'::app_role)
  );
$function$;