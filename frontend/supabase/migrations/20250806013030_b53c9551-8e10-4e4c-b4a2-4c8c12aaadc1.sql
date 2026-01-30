-- Update the app_role enum to include the correct role names
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'public_member';

-- Update existing user roles to use the new naming convention
UPDATE user_roles SET role = 'public_member' WHERE role = 'public_user';

-- Drop the old enum value (this requires recreating the enum)
-- First create the new enum
CREATE TYPE app_role_new AS ENUM ('admin', 'business_member', 'public_member');

-- Update the user_roles table to use the new enum
ALTER TABLE user_roles ALTER COLUMN role TYPE app_role_new USING role::text::app_role_new;

-- Update the profiles table to use the new enum
ALTER TABLE profiles ALTER COLUMN role TYPE app_role_new USING role::text::app_role_new;

-- Drop the old enum and rename the new one
DROP TYPE app_role;
ALTER TYPE app_role_new RENAME TO app_role;

-- Update the get_user_role function to use the new enum
DROP FUNCTION IF EXISTS public.get_user_role(uuid);
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
 RETURNS app_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role FROM public.user_roles WHERE user_id = user_uuid LIMIT 1;
$function$;

-- Update the business invitation function
DROP FUNCTION IF EXISTS public.can_create_business_posts(uuid);
CREATE OR REPLACE FUNCTION public.can_create_business_posts(user_uuid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid 
    AND role IN ('business_member', 'admin')
  );
$function$;