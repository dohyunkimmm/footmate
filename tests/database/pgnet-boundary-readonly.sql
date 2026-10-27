-- FootMate pg_net boundary inventory · production-safe and READ ONLY.
-- Catalog-only assertions: no net.http_* calls, request-queue reads, secrets or writes.
-- This does NOT verify PostgREST/Data API exposed-schemas configuration.
begin read only;
set local statement_timeout = '15s';

do $audit$
declare
  v_jobs integer;
  v_schedule_wrappers integer;
  v_login integer;
  v_ext integer;
begin
  select count(*) into v_jobs from cron.job
  where jobname in ('footmate-beta-email-outbox',
                    'footmate-beta-push-outbox',
                    'footmate-beta-match-reminders')
    and active and username='postgres';
  if v_jobs<>3 then
    raise exception 'PGNET_AUDIT_CRON_ACTOR_CHANGED: expected three active postgres jobs, found %',v_jobs;
  end if;
  select count(*) into v_schedule_wrappers
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname in
    ('configure_beta_email_worker_schedule','configure_beta_push_worker_schedule')
    and p.prosecdef
    and has_function_privilege('service_role',p.oid,'EXECUTE')
    and not has_function_privilege('authenticated',p.oid,'EXECUTE')
    and not has_function_privilege('anon',p.oid,'EXECUTE');
  if v_schedule_wrappers<>2 then
    raise exception 'PGNET_AUDIT_WRAPPER_PRIVILEGE_DRIFT: expected two private service wrappers, found %',v_schedule_wrappers;
  end if;
  select count(*) into v_login from pg_roles
  where rolname in ('anon','authenticated') and rolcanlogin;
  if v_login<>0 then raise exception 'PGNET_AUDIT_CLIENT_ROLE_LOGIN_ENABLED'; end if;
  select count(*) into v_ext
  from pg_extension e join pg_namespace n on n.oid=e.extnamespace
  where e.extname='pg_net' and n.nspname='public' and e.extrelocatable=false;
  if v_ext<>1 then
    raise exception 'PGNET_AUDIT_EXTENSION_LAYOUT_CHANGED'; end if;
end
$audit$;

-- Report ACL posture without changing it. Direct database privileges are
-- not equivalent to Data API access; the net schema is not exposed by default.
select n.nspname as schema_name,
  has_schema_privilege('anon',n.oid,'USAGE') as anon_schema_usage,
  has_schema_privilege('authenticated',n.oid,'USAGE') as authenticated_schema_usage
from pg_namespace n where n.nspname='net';

select p.proname,
  has_function_privilege('anon',p.oid,'EXECUTE') as anon_execute,
  has_function_privilege('authenticated',p.oid,'EXECUTE') as authenticated_execute,
  has_function_privilege('service_role',p.oid,'EXECUTE') as service_execute
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='net' and p.proname in
('http_get','http_post','http_delete','worker_restart') order by p.proname;

rollback;
