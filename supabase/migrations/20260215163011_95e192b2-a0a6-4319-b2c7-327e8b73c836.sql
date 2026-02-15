-- Grant table-level permissions for workspace_thoughts
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_thoughts TO authenticated;
GRANT SELECT ON public.workspace_thoughts TO anon;

-- Re-grant thought_chains and chain_links (previous grants may not have stuck)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.thought_chains TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chain_links TO authenticated;
GRANT SELECT ON public.thought_chains TO anon;
GRANT SELECT ON public.chain_links TO anon;

-- Also grant user_settings for active chain persistence
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_settings TO authenticated;
GRANT SELECT ON public.user_settings TO anon;