-- Grant SELECT on tables that are missing permissions
-- RLS policies still control row-level access, these grants just allow querying

-- Tables used by score/analytics views
GRANT SELECT ON public.post_utility_ratings TO authenticated;
GRANT SELECT ON public.post_interactions TO authenticated;

-- Tables used by org features
GRANT SELECT ON public.org_themes TO authenticated;
GRANT SELECT ON public.org_requests TO authenticated;
GRANT SELECT ON public.org_member_applications TO authenticated;

-- Tables used by lineage/linking features
GRANT SELECT ON public.idea_links TO authenticated;

-- Tables used by documentation features
GRANT SELECT ON public.nods_page TO authenticated;
GRANT SELECT ON public.nods_page_section TO authenticated;

-- Ensure all analytics views are accessible
GRANT SELECT ON public.view_post_u_score TO authenticated;
GRANT SELECT ON public.view_post_t_score TO authenticated;
GRANT SELECT ON public.view_business_org_analytics TO authenticated;
GRANT SELECT ON public.view_business_insight_analytics TO authenticated;