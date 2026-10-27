-- Role/JWT simulation for the FootMate RLS operator-MFA boundary.
-- Safe for a production read-only dry run: no persistent rows, schema, privileges,
-- jobs or policies are changed. JWT claims are simulated inside one transaction;
-- this does not replace a signed Supabase Auth/API integration test.
-- Run once before and once after an approved JWT initplan migration.
begin read only;
set local statement_timeout = '20s';

-- Capture fixture identifiers without returning users' UUIDs.
select
  set_config('qa.op_uid', (select user_id::text from public.operators limit 1), true),
  set_config('qa.member_uid', (select id::text from public.profiles p
    where not exists(select 1 from public.operators o where o.user_id=p.id)
    limit 1), true),
  set_config('qa.participant_uid', (select user_id::text from public.participations limit 1), true),
  set_config('qa.matches_total', (select count(*)::text from public.matches where status<>'draft'), true),
  set_config('qa.slots_total', (select count(*)::text from public.match_slots), true),
  set_config('qa.profiles_total', (select count(*)::text from public.profiles), true),
  set_config('qa.participations_total', (select count(*)::text from public.participations), true),
  set_config('qa.audit_total', (select count(*)::text from public.beta_operation_events), true);

-- Public reads do not expose draft matches.
set local role anon;
do $qa$ begin
  if (select count(*) from public.matches) <> current_setting('qa.matches_total')::int then
    raise exception 'RLS_QA_ANON_PUBLIC_MATCHES_CHANGED';
  end if;
  if (select count(*) from public.match_slots) <> current_setting('qa.slots_total')::int then
    raise exception 'RLS_QA_ANON_SLOTS_CHANGED';
  end if;
end $qa$;
reset role;

-- Operator with AAL1 is still confined to their own profile.
set local role authenticated;
select set_config('request.jwt.claims', json_build_object(
  'sub', current_setting('qa.op_uid'), 'role', 'authenticated', 'aal', 'aal1')::text, true);
do $qa$ begin
  if (select count(*) from public.profiles) <> 1 then
    raise exception 'RLS_QA_OPERATOR_AAL1_PROFILE_LEAK';
  end if;
  if (select count(*) from public.beta_operation_events) <> 0 then
    raise exception 'RLS_QA_OPERATOR_AAL1_AUDIT_LEAK';
  end if;
  begin
    perform public.require_beta_operator_aal2();
    raise exception 'RLS_QA_OPERATOR_AAL1_GUARD_BYPASS';
  exception when sqlstate '42501' then
    if sqlerrm <> 'MFA_REQUIRED' then raise; end if;
  end;
end $qa$;

-- Identical operator UID with AAL2 gains existing authorized operator scope.
select set_config('request.jwt.claims', json_build_object(
  'sub', current_setting('qa.op_uid'), 'role', 'authenticated', 'aal', 'aal2')::text, true);
do $qa$ begin
  perform public.require_beta_operator_aal2();
  if (select count(*) from public.profiles) <> current_setting('qa.profiles_total')::int then
    raise exception 'RLS_QA_OPERATOR_AAL2_PROFILE_ACCESS_CHANGED';
  end if;
  if (select count(*) from public.participations) <> current_setting('qa.participations_total')::int then
    raise exception 'RLS_QA_OPERATOR_AAL2_PARTICIPATION_ACCESS_CHANGED';
  end if;
  if (select count(*) from public.beta_operation_events) <> current_setting('qa.audit_total')::int then
    raise exception 'RLS_QA_OPERATOR_AAL2_AUDIT_ACCESS_CHANGED';
  end if;
end $qa$;

-- AAL2 without membership in public.operators is not an operator.
select set_config('request.jwt.claims', json_build_object(
  'sub', current_setting('qa.member_uid'), 'role', 'authenticated', 'aal', 'aal2')::text, true);
do $qa$ begin
  if (select count(*) from public.profiles) <> 1 then
    raise exception 'RLS_QA_MEMBER_AAL2_PROFILE_LEAK';
  end if;
  if (select count(*) from public.beta_operation_events) <> 0 then
    raise exception 'RLS_QA_MEMBER_AAL2_AUDIT_LEAK';
  end if;
  begin
    perform public.require_beta_operator_aal2();
    raise exception 'RLS_QA_MEMBER_AAL2_OPERATOR_GUARD_BYPASS';
  exception when sqlstate '42501' then
    if sqlerrm <> 'OPERATOR_REQUIRED' then raise; end if;
  end;
end $qa$;

-- Normal match participant at AAL1 retains read access to their own record.
select set_config('request.jwt.claims', json_build_object(
  'sub', current_setting('qa.participant_uid'), 'role', 'authenticated', 'aal', 'aal1')::text, true);
do $qa$ begin
  if (select count(*) from public.participations) <> 1 then
    raise exception 'RLS_QA_PARTICIPANT_AAL1_OWNERSHIP_CHANGED';
  end if;
end $qa$;

reset role;
rollback;
