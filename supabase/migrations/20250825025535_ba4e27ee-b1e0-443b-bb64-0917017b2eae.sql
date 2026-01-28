-- Grant admin role to jessy@evos.ca
INSERT INTO user_roles (user_id, role)
SELECT u.id, 'admin'::app_role
FROM auth.users u
WHERE u.email = 'jessy@evos.ca'
ON CONFLICT (user_id, role) DO NOTHING;