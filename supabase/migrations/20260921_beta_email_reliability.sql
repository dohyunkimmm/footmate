begin;

alter table public.beta_notifications
  add column if not exists email_next_attempt_at timestamptz,
  add column if not exists email_claimed_at timestamptz,
  add column if not exists email_claim_token uuid,
  add column if not exists email_delivery_status text,
  add column if not exists email_delivery_updated_at timestamptz;

alter table public.beta_notifications
  drop constraint if exists beta_notifications_email_status_check,
  add constraint beta_notifications_email_status_check
    check (email_status in ('pending','processing','sent','failed','skipped')),
  drop constraint if exists beta_notifications_email_delivery_status_check,
  add constraint beta_notifications_email_delivery_status_check
    check (
      email_delivery_status is null
      or email_delivery_status in ('accepted','delivery_delayed','delivered','bounced','complained','suppressed','failed')
    );

create index if not exists beta_notifications_email_due_idx
  on public.beta_notifications(email_next_attempt_at, created_at, id)
  where email_status in ('pending','failed','processing');

create unique index if not exists beta_notifications_email_message_id_idx
  on public.beta_notifications(email_message_id)
  where email_message_id is not null;

comment on column public.beta_notifications.email_next_attempt_at is
  'Earliest server-worker retry time after a failed transactional email attempt.';
comment on column public.beta_notifications.email_claimed_at is
  'Lease timestamp for an atomic email outbox claim. Stale claims may be reclaimed.';
comment on column public.beta_notifications.email_claim_token is
  'Opaque lease token used to prevent stale email workers from overwriting a newer claim.';
comment on column public.beta_notifications.email_delivery_status is
  'Provider lifecycle state received from Resend webhooks. This is separate from outbox email_status.';
comment on column public.beta_notifications.email_delivery_updated_at is
  'Provider event timestamp for the current email_delivery_status.';

create or replace function public.claim_beta_notification_emails(
  p_limit integer default 10,
  p_user_id uuid default null,
  p_match_id uuid default null,
  p_participation_id uuid default null
)
returns table (
  id bigint,
  user_id uuid,
  event_type text,
  match_id uuid,
  participation_id uuid,
  title text,
  body text,
  email_attempts integer,
  email_claim_token uuid,
  created_at timestamptz
)
language sql
security definer
set search_path = public, extensions, pg_temp
as $$
  with candidates as (
    select n.id
    from public.beta_notifications n
    where (
      n.email_status in ('pending','failed')
      or (
        n.email_status = 'processing'
        and n.email_claimed_at < now() - interval '10 minutes'
      )
    )
      and n.email_attempts < 5
      and (n.email_next_attempt_at is null or n.email_next_attempt_at <= now())
      and (p_user_id is null or n.user_id = p_user_id)
      and (p_match_id is null or n.match_id = p_match_id)
      and (p_participation_id is null or n.participation_id = p_participation_id)
    order by n.created_at asc, n.id asc
    for update skip locked
    limit greatest(1, least(coalesce(p_limit, 10), 50))
  ), claimed as (
    update public.beta_notifications n
    set
      email_status = 'processing',
      email_claimed_at = now(),
      email_claim_token = gen_random_uuid(),
      email_last_error = null
    from candidates c
    where n.id = c.id
    returning
      n.id,
      n.user_id,
      n.event_type,
      n.match_id,
      n.participation_id,
      n.title,
      n.body,
      n.email_attempts,
      n.email_claim_token,
      n.created_at
  )
  select * from claimed order by created_at asc, id asc;
$$;

revoke all on function public.claim_beta_notification_emails(integer,uuid,uuid,uuid) from public, anon, authenticated;
grant execute on function public.claim_beta_notification_emails(integer,uuid,uuid,uuid) to service_role;

create or replace function public.record_beta_email_delivery(
  p_message_id text,
  p_delivery_status text,
  p_event_at timestamptz
)
returns bigint
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id bigint;
  v_status text := lower(btrim(coalesce(p_delivery_status, '')));
  v_event_at timestamptz := coalesce(p_event_at, now());
begin
  if btrim(coalesce(p_message_id, '')) = '' then
    raise exception 'EMAIL_MESSAGE_ID_REQUIRED' using errcode = '22023';
  end if;
  if v_status not in ('accepted','delivery_delayed','delivered','bounced','complained','suppressed','failed') then
    raise exception 'INVALID_EMAIL_DELIVERY_STATUS' using errcode = '22023';
  end if;

  update public.beta_notifications n
  set
    email_delivery_status = v_status,
    email_delivery_updated_at = v_event_at
  where n.email_message_id = p_message_id
    and (n.email_delivery_updated_at is null or v_event_at >= n.email_delivery_updated_at)
  returning n.id into v_id;

  return v_id;
end;
$$;

revoke all on function public.record_beta_email_delivery(text,text,timestamptz) from public, anon, authenticated;
grant execute on function public.record_beta_email_delivery(text,text,timestamptz) to service_role;

-- The cron worker token is generated inside Postgres and never needs to appear in source or browser code.
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'footmate_beta_email_worker_token') then
    perform vault.create_secret(
      encode(extensions.gen_random_bytes(32), 'hex'),
      'footmate_beta_email_worker_token',
      'FootMate Beta transactional email cron worker authentication'
    );
  end if;
end
$$;

create or replace function public.get_beta_email_worker_token()
returns text
language sql
security definer
set search_path = public, vault, pg_temp
as $$
  select decrypted_secret
  from vault.decrypted_secrets
  where name = 'footmate_beta_email_worker_token'
  limit 1;
$$;

revoke all on function public.get_beta_email_worker_token() from public, anon, authenticated;
grant execute on function public.get_beta_email_worker_token() to service_role;

-- Resend webhook signing secret is provisioned after the webhook is created.
create or replace function public.get_resend_webhook_signing_secret()
returns text
language sql
security definer
set search_path = public, vault, pg_temp
as $$
  select decrypted_secret
  from vault.decrypted_secrets
  where name = 'footmate_resend_webhook_secret'
  limit 1;
$$;

revoke all on function public.get_resend_webhook_signing_secret() from public, anon, authenticated;
grant execute on function public.get_resend_webhook_signing_secret() to service_role;

create or replace function public.operator_beta_email_health(p_limit integer default 30)
returns table (
  notification_id bigint,
  event_type text,
  match_id uuid,
  title text,
  email_status text,
  email_attempts integer,
  email_last_attempt_at timestamptz,
  email_next_attempt_at timestamptz,
  email_sent_at timestamptz,
  email_delivery_status text,
  email_delivery_updated_at timestamptz,
  email_last_error text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then raise exception 'AUTH_REQUIRED' using errcode = '28000'; end if;
  if not exists (select 1 from public.operators o where o.user_id = v_user_id) then
    raise exception 'OPERATOR_REQUIRED' using errcode = '42501';
  end if;

  return query
  select
    n.id,
    n.event_type,
    n.match_id,
    n.title,
    n.email_status,
    n.email_attempts,
    n.email_last_attempt_at,
    n.email_next_attempt_at,
    n.email_sent_at,
    n.email_delivery_status,
    n.email_delivery_updated_at,
    n.email_last_error,
    n.created_at
  from public.beta_notifications n
  order by n.created_at desc, n.id desc
  limit greatest(1, least(coalesce(p_limit, 30), 100));
end;
$$;

revoke all on function public.operator_beta_email_health(integer) from public, anon;
grant execute on function public.operator_beta_email_health(integer) to authenticated;

create or replace function public.operator_retry_beta_notification_email(p_notification_id bigint)
returns table (notification_id bigint, email_status text, email_attempts integer)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then raise exception 'AUTH_REQUIRED' using errcode = '28000'; end if;
  if not exists (select 1 from public.operators o where o.user_id = v_user_id) then
    raise exception 'OPERATOR_REQUIRED' using errcode = '42501';
  end if;

  return query
  update public.beta_notifications n
  set
    email_status = 'pending',
    email_next_attempt_at = null,
    email_claimed_at = null,
    email_claim_token = null,
    email_last_error = null
  where n.id = p_notification_id
    and n.email_status = 'failed'
    and n.email_attempts < 5
  returning n.id, n.email_status, n.email_attempts;
end;
$$;

revoke all on function public.operator_retry_beta_notification_email(bigint) from public, anon;
grant execute on function public.operator_retry_beta_notification_email(bigint) to authenticated;

create or replace function public.operator_beta_funnel_metrics(p_since timestamptz default (now() - interval '7 days'))
returns table (
  participation_joined bigint,
  participation_canceled bigint,
  participation_operator_canceled bigint,
  participation_checked_in bigint,
  match_completed bigint,
  email_accepted bigint,
  email_delivered bigint,
  email_failed bigint,
  email_bounced bigint
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_since timestamptz := coalesce(p_since, now() - interval '7 days');
begin
  if v_user_id is null then raise exception 'AUTH_REQUIRED' using errcode = '28000'; end if;
  if not exists (select 1 from public.operators o where o.user_id = v_user_id) then
    raise exception 'OPERATOR_REQUIRED' using errcode = '42501';
  end if;

  return query
  select
    (select count(*) from public.beta_operation_events e where e.created_at >= v_since and e.event_type = 'participation.joined')::bigint,
    (select count(*) from public.beta_operation_events e where e.created_at >= v_since and e.event_type = 'participation.canceled')::bigint,
    (select count(*) from public.beta_operation_events e where e.created_at >= v_since and e.event_type = 'participation.operator_canceled')::bigint,
    (select count(*) from public.beta_operation_events e where e.created_at >= v_since and e.event_type = 'participation.checked_in')::bigint,
    (select count(*) from public.beta_operation_events e where e.created_at >= v_since and e.event_type = 'match.completed')::bigint,
    (select count(*) from public.beta_notifications n where n.created_at >= v_since and n.email_status = 'sent')::bigint,
    (select count(*) from public.beta_notifications n where n.created_at >= v_since and n.email_delivery_status = 'delivered')::bigint,
    (select count(*) from public.beta_notifications n where n.created_at >= v_since and n.email_status = 'failed')::bigint,
    (select count(*) from public.beta_notifications n where n.created_at >= v_since and n.email_delivery_status = 'bounced')::bigint;
end;
$$;

revoke all on function public.operator_beta_funnel_metrics(timestamptz) from public, anon;
grant execute on function public.operator_beta_funnel_metrics(timestamptz) to authenticated;

commit;
