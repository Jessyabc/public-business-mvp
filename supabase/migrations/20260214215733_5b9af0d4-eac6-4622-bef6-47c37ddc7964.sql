-- Clear all workspace data for fresh testing
-- Order matters due to foreign key constraints

-- Clear chain_links first (references thought_chains)
DELETE FROM chain_links;

-- Clear lens_chains (references thought_chains and thought_lenses)
DELETE FROM lens_chains;

-- Clear thought_lenses
DELETE FROM thought_lenses;

-- Clear workspace_thoughts (references thought_chains)
DELETE FROM workspace_thoughts;

-- Clear thought_chains
DELETE FROM thought_chains;

-- Reset active_chain_id in user_settings
UPDATE user_settings SET active_chain_id = NULL;
