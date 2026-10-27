-- FootMate: wrap JWT claim lookup in a statement-stable initplan, keeping policy
-- name, role, command, permissive mode, ownership and AAL2 checks unchanged.
-- Staged review: operator/participant/anonymous read-only matrix before and after.
-- No DROP POLICY / GRANT / REVOKE. Fail closed on missing or changed policies.
begin;
set local lock_timeout = '3s';
set local statement_timeout = '30s';
do $guard$
declare found_count integer;
begin
  with targets(tablename, policyname, cmd) as (values
    ('beta_operation_events', 'beta_operation_events_operator_read', 'SELECT'),
    ('match_slots', 'match_slots_authenticated_read', 'SELECT'),
    ('match_slots', 'match_slots_operator_delete', 'DELETE'),
    ('match_slots', 'match_slots_operator_insert', 'INSERT'),
    ('match_slots', 'match_slots_operator_update', 'UPDATE'),
    ('matches', 'matches_authenticated_read', 'SELECT'),
    ('matches', 'matches_operator_delete', 'DELETE'),
    ('matches', 'matches_operator_insert', 'INSERT'),
    ('matches', 'matches_operator_update', 'UPDATE'),
    ('participations', 'participations_authenticated_read', 'SELECT'),
    ('profiles', 'profiles_authenticated_read', 'SELECT')
  )
  select count(*) into found_count
  from targets t
  join pg_policies p
    on p.schemaname = 'public' and p.tablename = t.tablename
    and p.policyname = t.policyname and p.cmd = t.cmd
  where p.permissive = 'PERMISSIVE'
    and p.roles = array['authenticated']::name[]
    and (coalesce(p.qual, '') || coalesce(p.with_check, '')) like '%auth.jwt()%'
    and (coalesce(p.qual, '') || coalesce(p.with_check, '')) not like '%SELECT auth.jwt()%';
  if found_count <> 11 then
    raise exception 'RLS_INITPLAN_PRECONDITION_FAILED: expected 11, found %', found_count;
  end if;
end;
$guard$;

-- SELECT policy (roles/permissive status preserved)
alter policy "beta_operation_events_operator_read" on public."beta_operation_events"
using (((COALESCE(((select auth.jwt()) ->> 'aal'::text), 'aal1'::text) = 'aal2'::text) AND (EXISTS ( SELECT 1
   FROM operators o
  WHERE (o.user_id = ( SELECT auth.uid() AS uid))))));

-- SELECT policy (roles/permissive status preserved)
alter policy "match_slots_authenticated_read" on public."match_slots"
using (((EXISTS ( SELECT 1
   FROM matches m
  WHERE ((m.id = match_slots.match_id) AND (m.status <> 'draft'::text)))) OR ((COALESCE(((select auth.jwt()) ->> 'aal'::text), 'aal1'::text) = 'aal2'::text) AND (EXISTS ( SELECT 1
   FROM operators o
  WHERE (o.user_id = ( SELECT auth.uid() AS uid)))))));

-- DELETE policy (roles/permissive status preserved)
alter policy "match_slots_operator_delete" on public."match_slots"
using (((COALESCE(((select auth.jwt()) ->> 'aal'::text), 'aal1'::text) = 'aal2'::text) AND (EXISTS ( SELECT 1
   FROM operators o
  WHERE (o.user_id = ( SELECT auth.uid() AS uid))))));

-- INSERT policy (roles/permissive status preserved)
alter policy "match_slots_operator_insert" on public."match_slots"
with check (((COALESCE(((select auth.jwt()) ->> 'aal'::text), 'aal1'::text) = 'aal2'::text) AND (EXISTS ( SELECT 1
   FROM operators o
  WHERE (o.user_id = ( SELECT auth.uid() AS uid))))));

-- UPDATE policy (roles/permissive status preserved)
alter policy "match_slots_operator_update" on public."match_slots"
using (((COALESCE(((select auth.jwt()) ->> 'aal'::text), 'aal1'::text) = 'aal2'::text) AND (EXISTS ( SELECT 1
   FROM operators o
  WHERE (o.user_id = ( SELECT auth.uid() AS uid))))))
with check (((COALESCE(((select auth.jwt()) ->> 'aal'::text), 'aal1'::text) = 'aal2'::text) AND (EXISTS ( SELECT 1
   FROM operators o
  WHERE (o.user_id = ( SELECT auth.uid() AS uid))))));

-- SELECT policy (roles/permissive status preserved)
alter policy "matches_authenticated_read" on public."matches"
using (((status <> 'draft'::text) OR ((COALESCE(((select auth.jwt()) ->> 'aal'::text), 'aal1'::text) = 'aal2'::text) AND (EXISTS ( SELECT 1
   FROM operators o
  WHERE (o.user_id = ( SELECT auth.uid() AS uid)))))));

-- DELETE policy (roles/permissive status preserved)
alter policy "matches_operator_delete" on public."matches"
using (((COALESCE(((select auth.jwt()) ->> 'aal'::text), 'aal1'::text) = 'aal2'::text) AND (EXISTS ( SELECT 1
   FROM operators o
  WHERE (o.user_id = ( SELECT auth.uid() AS uid))))));

-- INSERT policy (roles/permissive status preserved)
alter policy "matches_operator_insert" on public."matches"
with check (((COALESCE(((select auth.jwt()) ->> 'aal'::text), 'aal1'::text) = 'aal2'::text) AND (EXISTS ( SELECT 1
   FROM operators o
  WHERE (o.user_id = ( SELECT auth.uid() AS uid))))));

-- UPDATE policy (roles/permissive status preserved)
alter policy "matches_operator_update" on public."matches"
using (((COALESCE(((select auth.jwt()) ->> 'aal'::text), 'aal1'::text) = 'aal2'::text) AND (EXISTS ( SELECT 1
   FROM operators o
  WHERE (o.user_id = ( SELECT auth.uid() AS uid))))))
with check (((COALESCE(((select auth.jwt()) ->> 'aal'::text), 'aal1'::text) = 'aal2'::text) AND (EXISTS ( SELECT 1
   FROM operators o
  WHERE (o.user_id = ( SELECT auth.uid() AS uid))))));

-- SELECT policy (roles/permissive status preserved)
alter policy "participations_authenticated_read" on public."participations"
using (((user_id = ( SELECT auth.uid() AS uid)) OR ((COALESCE(((select auth.jwt()) ->> 'aal'::text), 'aal1'::text) = 'aal2'::text) AND (EXISTS ( SELECT 1
   FROM operators o
  WHERE (o.user_id = ( SELECT auth.uid() AS uid)))))));

-- SELECT policy (roles/permissive status preserved)
alter policy "profiles_authenticated_read" on public."profiles"
using (((id = ( SELECT auth.uid() AS uid)) OR ((COALESCE(((select auth.jwt()) ->> 'aal'::text), 'aal1'::text) = 'aal2'::text) AND (EXISTS ( SELECT 1
   FROM operators o
  WHERE (o.user_id = ( SELECT auth.uid() AS uid)))))));
do $guard$
declare updated_count integer;
begin
  with targets(tablename, policyname) as (values
    ('beta_operation_events', 'beta_operation_events_operator_read'),
    ('match_slots', 'match_slots_authenticated_read'),
    ('match_slots', 'match_slots_operator_delete'),
    ('match_slots', 'match_slots_operator_insert'),
    ('match_slots', 'match_slots_operator_update'),
    ('matches', 'matches_authenticated_read'),
    ('matches', 'matches_operator_delete'),
    ('matches', 'matches_operator_insert'),
    ('matches', 'matches_operator_update'),
    ('participations', 'participations_authenticated_read'),
    ('profiles', 'profiles_authenticated_read')
  )
  select count(*) into updated_count
  from targets t join pg_policies p
    on p.schemaname='public' and p.tablename=t.tablename
    and p.policyname=t.policyname
  where lower(coalesce(p.qual, '') || coalesce(p.with_check, '')) like '%select auth.jwt()%';
  if updated_count <> 11 then
    raise exception 'RLS_INITPLAN_POSTCONDITION_FAILED: expected 11, found %', updated_count;
  end if;
end;
$guard$;
commit;
