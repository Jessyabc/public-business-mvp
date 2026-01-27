-- Add public_member enum value
ALTER TYPE app_role ADD VALUE 'public_member';

-- Update existing user roles
UPDATE user_roles SET role = 'public_member' WHERE role = 'public_user';