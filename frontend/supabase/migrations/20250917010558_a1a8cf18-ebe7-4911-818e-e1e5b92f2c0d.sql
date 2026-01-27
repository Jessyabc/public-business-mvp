-- 1/5 — Performance indexes for brainstorm tables (idempotent)
create index if not exists idx_brainstorm_nodes_created_at on public.brainstorm_nodes(created_at desc);
create index if not exists idx_brainstorm_edges_source on public.brainstorm_edges(source);
create index if not exists idx_brainstorm_edges_target on public.brainstorm_edges(target);

-- RPCs for efficient brainstorm data fetching (invoker rights – respect RLS)

-- Nodes: cursor pagination by created_at
create or replace function api_list_brainstorm_nodes(p_cursor timestamptz default null, p_limit int default 500)
returns setof public.brainstorm_nodes
language sql stable as $$
  select *
  from public.brainstorm_nodes
  where (p_cursor is null or created_at < p_cursor)
  order by created_at desc
  limit greatest(1, least(p_limit, 1000));
$$;

-- Edges by node ids (collect neighbors of visible nodes)
create or replace function api_list_brainstorm_edges_for_nodes(p_node_ids uuid[])
returns setof public.brainstorm_edges
language sql stable as $$
  select *
  from public.brainstorm_edges
  where source = any(p_node_ids) or target = any(p_node_ids);
$$;