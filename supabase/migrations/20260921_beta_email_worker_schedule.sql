begin;

create extension if not exists pg_net;
create extension if not exists pg_cron;

-- Keep the job idempotent when migrations are replayed in a fresh environment.
do $$
declare
  v_job record;
begin
  for v_job in select jobid from cron.job where jobname = 'footmate-beta-email-outbox' loop
    perform cron.unschedule(v_job.jobid);
  end loop;
end
$$;

select cron.schedule(
  'footmate-beta-email-outbox',
  '* * * * *',
  $job$
    select net.http_post(
      url := 'https://iihitfjphowjplxzfxtn.supabase.co/functions/v1/process-beta-email-outbox',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-footmate-worker-token', (
          select decrypted_secret
          from vault.decrypted_secrets
          where name = 'footmate_beta_email_worker_token'
          limit 1
        )
      ),
      body := jsonb_build_object('source', 'pg_cron'),
      timeout_milliseconds := 8000
    ) as request_id;
  $job$
);

commit;
