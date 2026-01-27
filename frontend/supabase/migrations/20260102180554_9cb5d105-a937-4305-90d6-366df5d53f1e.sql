-- Add business_user role to monojessy25@gmail.com if missing
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'business_user'::app_role
FROM auth.users
WHERE email = 'monojessy25@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;