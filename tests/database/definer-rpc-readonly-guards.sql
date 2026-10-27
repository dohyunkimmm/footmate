-- FootMate live-database RPC boundary regression: READ ONLY.
-- Exercises actual PostgreSQL roles with simulated JWT claims, not real signed
-- Auth HTTP sessions. No persistent records, privileges or schema are modified.
-- Requires at least one operator and one nonoperator profile in the pilot DB.
begin read only;
set local statement_timeout = '30s';

do $qa$
declare
  total integer;
  exposed integer;
  bad_paths integer;
  operator_uid text;
  member_uid text;
begin
  select count(*),
    count(*) filter(where has_function_privilege('anon',p.oid,'EXECUTE')),
    count(*) filter(where coalesce(array_to_string(p.proconfig,','),'') not like '%search_path=public, pg_temp%')
  into total,exposed,bad_paths
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.prosecdef
    and has_function_privilege('authenticated',p.oid,'EXECUTE');
  if total<>20 or exposed<>0 or bad_paths<>0 then
    raise exception 'QA_DEFINER_CATALOG_MISMATCH:total=%,anon=%,path=%',total,exposed,bad_paths;
  end if;
  select user_id::text into operator_uid from public.operators limit 1;
  select p.id::text into member_uid from public.profiles p
    where not exists(select 1 from public.operators o where o.user_id=p.id)
    limit 1;
  if operator_uid is null or member_uid is null then
    raise exception 'QA_DEFINER_REQUIRES_OPERATOR_AND_NONOPERATOR_FIXTURES';
  end if;
  perform set_config('qa.operator_uid',operator_uid,true);
  perform set_config('qa.member_uid',member_uid,true);
end
$qa$;

set local role authenticated;

-- All ten operator_* RPCs must reject:
-- 1. nonoperators, even when their JWT says AAL2;
-- 2. operators with AAL1, without entering write or read-only branches.
do $qa$
declare
  scenario record;
  r record;
  statement text;
  rejected integer;
begin
  if current_user<>'authenticated' then raise exception 'QA_WRONG_ROLE';end if;
  for scenario in
    select * from (values
      ('nonoperator_aal2','qa.member_uid','aal2','OPERATOR_REQUIRED'),
      ('operator_aal1','qa.operator_uid','aal1','MFA_REQUIRED')
    ) as s(name,actor_setting,aal,expected)
  loop
    perform set_config('request.jwt.claims',
      json_build_object('sub',current_setting(scenario.actor_setting),
        'role','authenticated','aal',scenario.aal)::text,true);
    rejected:=0;
    for r in
      select p.proname,
        (select string_agg('null::'||format_type(p.proargtypes[i],null),', ' order by i)
         from generate_series(0,p.pronargs-1) i) as args
      from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where n.nspname='public' and p.proname like 'operator_%'
        and p.prosecdef and has_function_privilege('authenticated',p.oid,'EXECUTE')
    loop
      statement:=format('select * from public.%I(%s)',r.proname,coalesce(r.args,''));
      begin
        execute statement;
        raise exception 'QA_OPERATOR_BYPASS:%:%',scenario.name,r.proname;
      exception when others then
        if sqlerrm<>scenario.expected then
          raise exception 'QA_OPERATOR_REJECTION_MISMATCH:%:%:%',
            scenario.name,r.proname,sqlerrm;
        end if;
        rejected:=rejected+1;
      end;
    end loop;
    if rejected<>10 then raise exception 'QA_OPERATOR_COUNT:%:%',scenario.name,rejected;end if;
  end loop;
end
$qa$;

-- Missing auth.uid() must be rejected even if the Postgres role is authenticated.
select set_config('request.jwt.claims','{}',true);
do $qa$
declare r record; statement text; rejected integer:=0;
begin
  for r in
    select p.proname,
      (select string_agg('null::'||format_type(p.proargtypes[i],null),', ' order by i)
       from generate_series(0,p.pronargs-1) i) as args
    from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname in (
      'cancel_beta_waitlist','cancel_participation','check_in_participation',
      'join_beta_waitlist','join_match_position','mark_beta_notification_read',
      'submit_beta_match_feedback','require_beta_operator_aal2'
    )
  loop
    statement:=format('select * from public.%I(%s)',r.proname,coalesce(r.args,''));
    begin
      execute statement;
      raise exception 'QA_MISSING_UID_BYPASS:%',r.proname;
    exception when others then
      if sqlerrm<>'AUTH_REQUIRED' then
        raise exception 'QA_MISSING_UID_REJECTION_MISMATCH:%:%',r.proname,sqlerrm;
      end if;
      rejected:=rejected+1;
    end;
  end loop;
  if rejected<>8 then raise exception 'QA_MISSING_UID_COUNT:%',rejected;end if;
  if public.discovery_event_budget_available() is distinct from false then
    raise exception 'QA_MISSING_UID_BUDGET_BYPASS';
  end if;
end
$qa$;

reset role;
rollback;
