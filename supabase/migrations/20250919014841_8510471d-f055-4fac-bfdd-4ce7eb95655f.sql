-- Fix all remaining database functions for security

-- Remove duplicate is_admin functions and keep only the secure ones
DROP FUNCTION IF EXISTS public.is_admin(uuid);
DROP FUNCTION IF EXISTS public.is_business_member(uuid);

-- Ensure the main is_admin function is properly secured
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$function$;

-- Ensure is_business_member is properly secured
CREATE OR REPLACE FUNCTION public.is_business_member()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('business_member','admin')
  );
$function$;

-- Fix API functions to use proper security settings
CREATE OR REPLACE FUNCTION public.api_brainstorm_recent(p_limit integer DEFAULT 50)
 RETURNS TABLE(id uuid, title text, content text, user_id uuid, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  select id, title, content, user_id, created_at
  from public.posts
  where type = 'brainstorm'
  order by created_at desc
  limit greatest(1, least(p_limit, 200));
$function$;

CREATE OR REPLACE FUNCTION public.api_list_brainstorm_nodes(p_cursor timestamp with time zone DEFAULT NULL::timestamp with time zone, p_limit integer DEFAULT 500)
 RETURNS TABLE(id uuid, title text, content text, metadata jsonb, created_at timestamp with time zone, user_id uuid, display_name text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.api_list_brainstorm_edges_for_nodes(p_node_ids uuid[])
 RETURNS TABLE(id uuid, parent_post_id uuid, child_post_id uuid, relation_type text, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  select 
    id,
    parent_post_id,
    child_post_id,
    relation_type,
    created_at
  from public.post_relations
  where parent_post_id = any(p_node_ids) or child_post_id = any(p_node_ids);
$function$;

CREATE OR REPLACE FUNCTION public.api_space_chain_hard(p_start uuid, p_direction text DEFAULT 'forward'::text, p_limit integer DEFAULT 25, p_max_depth integer DEFAULT 500)
 RETURNS TABLE(id uuid, title text, content text, user_id uuid, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  with recursive walk as (
    -- seed
    select p.id, p.title, p.content, p.user_id, p.created_at, 0 as depth
    from public.posts p
    where p.id = p_start and p.type = 'brainstorm'
    union all
    -- step
    select p2.id, p2.title, p2.content, p2.user_id, p2.created_at, w.depth + 1
    from walk w
    join public.post_relations r
      on r.relation_type = 'hard'
     and (
          (p_direction = 'forward'  and r.parent_post_id = w.id)
       or (p_direction = 'backward' and r.child_post_id  = w.id)
     )
    join public.posts p2
      on p2.id = case
                   when p_direction = 'forward'  then r.child_post_id
                   when p_direction = 'backward' then r.parent_post_id
                 end
    where p2.type = 'brainstorm'
      and w.depth < p_max_depth
  )
  select id, title, content, user_id, created_at
  from walk
  order by created_at desc
  limit greatest(1, least(p_limit, 200));
$function$;