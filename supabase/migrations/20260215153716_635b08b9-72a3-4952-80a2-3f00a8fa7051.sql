
-- Grant table-level permissions to authenticated and anon roles
GRANT SELECT, INSERT, UPDATE, DELETE ON public.thought_chains TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chain_links TO authenticated;

-- Also grant to anon for completeness (RLS will restrict access anyway)
GRANT SELECT ON public.thought_chains TO anon;
GRANT SELECT ON public.chain_links TO anon;
