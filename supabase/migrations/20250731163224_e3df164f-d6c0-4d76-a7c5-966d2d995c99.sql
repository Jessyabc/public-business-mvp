-- Grant business_member role to the current user (Monojessy25@gmail.com) for testing
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'business_member'
FROM auth.users 
WHERE email = 'Monojessy25@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;