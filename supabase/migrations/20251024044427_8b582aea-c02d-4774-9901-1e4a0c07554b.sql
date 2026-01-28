-- 1) Safety: work in a transaction
begin;

-- 2) KEEP: public brainstorm read/insert policies (if you already have them)
--    (read_brainstorms_public, insert_brainstorm_public) – unchanged

-- 3) REMOVE overly-permissive generic policies on posts
drop policy if exists "posts_owner_insert" on posts;
drop policy if exists "rls_posts_insert" on posts;
drop policy if exists "rls_posts_select" on posts;

-- 4) INSERT: only org members can insert business insights with the right shape
drop policy if exists "insert_insight_org_member" on posts;

create policy "insert_insight_org_member"
on posts
for insert
with check (
  user_id = auth.uid()
  and type = 'insight'
  and visibility = 'my_business'
  and mode = 'business'
  and org_id is not null
  and is_org_member(org_id)
);

-- 5) SELECT: org insights are visible only to members of that org (or admins)
drop policy if exists "read_insights_org_members" on posts;

create policy "read_insights_org_members"
on posts
for select
using (
  type = 'insight'
  and visibility = 'my_business'
  and mode = 'business'
  and org_id is not null
  and (
    is_org_member(org_id)
    or exists (
      select 1 from user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'admin'
    )
  )
);

-- 6) (Optional but recommended) UPDATE/DELETE: author or admin, and still scoped
drop policy if exists "author_update_post" on posts;
create policy "author_update_post"
on posts
for update
using (
  user_id = auth.uid()
  or exists (
    select 1 from user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'admin'
  )
)
with check (
  -- preserve invariants for insights
  case
    when type = 'insight' then
      visibility = 'my_business'
      and mode = 'business'
      and org_id is not null
      and (is_org_member(org_id) or exists (select 1 from user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'))
    else true
  end
);

drop policy if exists "author_delete_post" on posts;
create policy "author_delete_post"
on posts
for delete
using (
  user_id = auth.uid()
  or exists (
    select 1 from user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'admin'
  )
);

-- 7) RE-ADD a narrow "public read" policy that does NOT leak business posts
drop policy if exists "posts_public_read" on posts;
create policy "posts_public_read"
on posts
for select
using (
  -- public brainstorms (and any future public content) are visible to everyone
  visibility = 'public'
);

commit;