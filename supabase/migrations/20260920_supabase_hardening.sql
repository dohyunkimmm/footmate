begin;

alter function public.touch_updated_at()
set search_path = public, pg_temp;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Supabase automatic-RLS helper is created by the platform when automatic RLS is enabled.
-- It is intended for internal event-trigger use, not public RPC access.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end;
$$;

create index if not exists matches_created_by_idx on public.matches(created_by);

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles
for select
to authenticated
using (id = (select auth.uid()));

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

drop policy if exists operators_select_self on public.operators;
create policy operators_select_self
on public.operators
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists participations_select_own on public.participations;
create policy participations_select_own
on public.participations
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists matches_operator_write on public.matches;
drop policy if exists matches_operator_insert on public.matches;
drop policy if exists matches_operator_update on public.matches;
drop policy if exists matches_operator_delete on public.matches;

create policy matches_operator_insert
on public.matches
for insert
to authenticated
with check (
  exists (
    select 1 from public.operators o where o.user_id = (select auth.uid())
  )
);

create policy matches_operator_update
on public.matches
for update
to authenticated
using (
  exists (
    select 1 from public.operators o where o.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.operators o where o.user_id = (select auth.uid())
  )
);

create policy matches_operator_delete
on public.matches
for delete
to authenticated
using (
  exists (
    select 1 from public.operators o where o.user_id = (select auth.uid())
  )
);

drop policy if exists match_slots_operator_write on public.match_slots;
drop policy if exists match_slots_operator_insert on public.match_slots;
drop policy if exists match_slots_operator_update on public.match_slots;
drop policy if exists match_slots_operator_delete on public.match_slots;

create policy match_slots_operator_insert
on public.match_slots
for insert
to authenticated
with check (
  exists (
    select 1 from public.operators o where o.user_id = (select auth.uid())
  )
);

create policy match_slots_operator_update
on public.match_slots
for update
to authenticated
using (
  exists (
    select 1 from public.operators o where o.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.operators o where o.user_id = (select auth.uid())
  )
);

create policy match_slots_operator_delete
on public.match_slots
for delete
to authenticated
using (
  exists (
    select 1 from public.operators o where o.user_id = (select auth.uid())
  )
);

commit;
