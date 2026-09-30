begin;

create extension if not exists pg_net;
create extension if not exists pg_cron;

create or replace function public.configure_beta_push_worker_schedule(p_project_url text)
returns bigint
language plpgsql
security definer
set search_path=public,pg_temp
as $$
declare
  v_project_url text:=regexp_replace(btrim(coalesce(p_project_url,'')),'/+$','');
  v_worker_url text;
  v_command text;
  v_job_id bigint;
begin
  if v_project_url !~ '^https://[a-z0-9-]+\.supabase\.co$' then
    raise exception 'INVALID_SUPABASE_PROJECT_URL' using errcode='22023';
  end if;
  if not exists(select 1 from vault.secrets where name='footmate_beta_email_worker_token') then
    raise exception 'BETA_WORKER_TOKEN_NOT_CONFIGURED' using errcode='55000';
  end if;
  v_worker_url:=v_project_url||'/functions/v1/process-beta-push-outbox';
  v_command:=format(
    $command$
      select net.http_post(
        url := %L,
        headers := jsonb_build_object(
          'Content-Type','application/json',
          'x-footmate-worker-token',(
            select decrypted_secret from vault.decrypted_secrets
            where name='footmate_beta_email_worker_token' limit 1
          )
        ),
        body := jsonb_build_object('source','pg_cron'),
        timeout_milliseconds := 8000
      ) as request_id;
    $command$,
    v_worker_url
  );
  select cron.schedule('footmate-beta-push-outbox','* * * * *',v_command) into v_job_id;
  return v_job_id;
end;
$$;

revoke all on function public.configure_beta_push_worker_schedule(text) from public,anon,authenticated;
grant execute on function public.configure_beta_push_worker_schedule(text) to service_role;

commit;
