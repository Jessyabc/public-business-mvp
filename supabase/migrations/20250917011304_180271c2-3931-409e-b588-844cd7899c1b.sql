-- 3/5 — Event tracking RPC for user interactions
create or replace function api_track_event(
  p_event text, 
  p_target uuid, 
  p_kind text,
  p_props jsonb default '{}'::jsonb
)
returns void 
language sql volatile 
security definer
set search_path = public
as $$
  insert into public.analytics_events(event_name, user_id, properties, created_at)
  values (
    p_event, 
    auth.uid(), 
    jsonb_build_object('target_id', p_target, 'kind', p_kind) || p_props, 
    now()
  );
$$;