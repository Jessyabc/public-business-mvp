-- Enable security invoker on analytics views
-- This makes views run with the caller's permissions instead of the view owner's permissions

ALTER VIEW view_business_insight_analytics SET (security_invoker = on);
ALTER VIEW view_business_org_analytics SET (security_invoker = on);
ALTER VIEW view_post_u_score SET (security_invoker = on);
ALTER VIEW view_post_t_score SET (security_invoker = on);