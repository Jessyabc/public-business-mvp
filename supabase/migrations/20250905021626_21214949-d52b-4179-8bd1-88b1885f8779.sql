-- Fix security issue: Add proper search_path to functions without it
-- This addresses the "Function Search Path Mutable" security warning

-- Update functions that don't have search_path set
ALTER FUNCTION public.current_user_email() SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.get_user_roles(uuid) SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.get_my_roles() SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.is_admin(uuid) SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.get_user_role(uuid) SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.can_create_business_posts(uuid) SET search_path = 'public', 'pg_temp';