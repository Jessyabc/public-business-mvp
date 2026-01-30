-- Fix security definer view warnings by recreating views as SECURITY INVOKER
-- This ensures views respect the calling user's RLS policies rather than the creator's

CREATE OR REPLACE VIEW public.public_posts_view
WITH (security_invoker = true)
AS
SELECT * FROM public.posts 
WHERE status = 'active' AND kind = 'Spark';

CREATE OR REPLACE VIEW public.business_posts_view
WITH (security_invoker = true)
AS
SELECT * FROM public.posts 
WHERE kind = 'BusinessInsight';

CREATE OR REPLACE VIEW public.my_posts_view
WITH (security_invoker = true)
AS
SELECT * FROM public.posts 
WHERE user_id = auth.uid();

-- Re-grant permissions
GRANT SELECT ON public.public_posts_view TO authenticated, anon;
GRANT SELECT ON public.business_posts_view TO authenticated, anon;
GRANT SELECT ON public.my_posts_view TO authenticated;