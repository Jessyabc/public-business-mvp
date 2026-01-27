-- 1/5 — Performance indexes for brainstorm tables using existing posts structure
create index if not exists idx_posts_brainstorm_created_at on public.posts(created_at desc) where type = 'brainstorm';
create index if not exists idx_post_relations_parent on public.post_relations(parent_post_id);
create index if not exists idx_post_relations_child on public.post_relations(child_post_id);

-- RPCs for efficient brainstorm data fetching (invoker rights – respect RLS)

-- Nodes: cursor pagination by created_at for brainstorm posts
create or replace function api_list_brainstorm_nodes(p_cursor timestamptz default null, p_limit int default 500)
returns table(
  id uuid,
  title text,
  content text,
  metadata jsonb,
  created_at timestamptz,
  user_id uuid,
  display_name text
)
language sql stable as $$
  select 
    p.id,
    p.title,
    p.content,
    p.metadata,
    p.created_at,
    p.user_id,
    pr.display_name
  from public.posts p
  left join public.profiles pr on pr.id = p.user_id
  where p.type = 'brainstorm' 
    and p.mode = 'public'
    and p.status = 'active'
    and (p_cursor is null or p.created_at < p_cursor)
  order by p.created_at desc
  limit greatest(1, least(p_limit, 1000));
$$;

-- Edges by node ids (collect neighbors of visible nodes)
create or replace function api_list_brainstorm_edges_for_nodes(p_node_ids uuid[])
returns table(
  id uuid,
  parent_post_id uuid,
  child_post_id uuid,
  relation_type text,
  created_at timestamptz
)
language sql stable as $$
  select 
    id,
    parent_post_id,
    child_post_id,
    relation_type,
    created_at
  from public.post_relations
  where parent_post_id = any(p_node_ids) or child_post_id = any(p_node_ids);
$$;