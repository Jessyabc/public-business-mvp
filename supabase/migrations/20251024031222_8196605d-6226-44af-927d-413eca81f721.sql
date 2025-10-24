-- Speed up lookups if not present yet
create index if not exists idx_org_members_user_id
  on public.org_members(user_id);

create or replace function public.get_user_org_id()
returns uuid
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_org uuid;
begin
  select om.org_id
    into v_org
  from public.org_members om
  where om.user_id = auth.uid()
  order by
    case om.role when 'business_admin' then 0 else 1 end,  -- prefer admins
    om.created_at desc                                     -- else most recent
  limit 1;

  return v_org;  -- null if none
end
$$;

-- Don't let the world call it
revoke all on function public.get_user_org_id() from public;
grant execute on function public.get_user_org_id() to authenticated;