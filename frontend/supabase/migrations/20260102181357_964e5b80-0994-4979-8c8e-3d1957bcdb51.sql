-- Grant SELECT on all views to authenticated users
GRANT SELECT ON public.view_business_insight_analytics TO authenticated;
GRANT SELECT ON public.view_business_org_analytics TO authenticated;
GRANT SELECT ON public.view_post_t_score TO authenticated;
GRANT SELECT ON public.view_post_u_score TO authenticated;

-- Also grant SELECT on org_members to authenticated users
-- (The RLS policies already control access, but the base grant is missing)
GRANT SELECT ON public.org_members TO authenticated;
GRANT SELECT ON public.orgs TO authenticated;