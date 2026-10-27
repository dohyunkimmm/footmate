-- FootMate Supabase: repeatable READ-ONLY advisor triage (2026-10-27).
-- Paste into Supabase SQL Editor or run through a read-only database connection.
-- Do not use this query as evidence of per-user row isolation; run the
-- transactionally rolled-back tests/database/discovery-followup.sql and
-- explicit auth/owner/AAL1/AAL2 role journeys separately before any policy DDL.
-- Output flagged_count is a review signal, not necessarily an exploitable bug.
with public_definers as (
  select p.oid, p.proname, p.proacl, p.proowner,
    lower(pg_get_functiondef(p.oid)) as definition
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.prosecdef
    and has_function_privilege('authenticated', p.oid, 'EXECUTE')
), operator_definers as (
  select * from public_definers where proname like 'operator_%'
), affected_policies as (
  select tablename, policyname, qual, with_check
  from pg_policies
  where schemaname = 'public'
    and tablename in (
      'matches', 'match_slots', 'participations',
      'profiles', 'beta_operation_events'
    )
)
select 'executable_definer_functions' as check_name,
  count(*) as checked_count,
  count(*) filter (
    where has_function_privilege('anon', oid, 'EXECUTE')
      or exists (
        select 1
        from aclexplode(coalesce(proacl, acldefault('f', proowner))) acl
        where acl.grantee = 0 and acl.privilege_type = 'EXECUTE'
      )
  ) as flagged_count
from public_definers
union all
select 'operator_definer_missing_mfa_guard', count(*),
  count(*) filter (
    where position('require_beta_operator_aal2' in definition) = 0
  )
from operator_definers
union all
select 'rls_policies_direct_jwt_call', count(*),
  count(*) filter (
    where (coalesce(qual, '') || coalesce(with_check, '')) ~
      '(^|[^a-z_.])auth\\.jwt\\(\\)'
      and (coalesce(qual, '') || coalesce(with_check, '')) !~
      'select[[:space:]]+auth\\.jwt\\(\\)'
  )
from affected_policies;
