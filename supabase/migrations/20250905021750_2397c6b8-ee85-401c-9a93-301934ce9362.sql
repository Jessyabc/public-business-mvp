-- Fix the remaining function that doesn't have search_path set
ALTER FUNCTION public.set_updated_at() SET search_path = 'public', 'pg_temp';