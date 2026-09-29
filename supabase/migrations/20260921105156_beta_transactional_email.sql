begin;

alter table public.beta_notifications
  add column if not exists email_status text,
  add column if not exists email_attempts integer not null default 0,
  add column if not exists email_last_attempt_at timestamptz,
  add column if not exists email_sent_at timestamptz,
  add column if not exists email_message_id text,
  add column if not exists email_last_error text;

-- Historical in-app notifications predate the email integration and must not be backfilled to users.
update public.beta_notifications
set email_status = 'skipped'
where email_status is null;

alter table public.beta_notifications
  alter column email_status set default 'pending',
  alter column email_status set not null;

alter table public.beta_notifications
  drop constraint if exists beta_notifications_email_status_check,
  add constraint beta_notifications_email_status_check
    check (email_status in ('pending','sent','failed','skipped')),
  drop constraint if exists beta_notifications_email_attempts_check,
  add constraint beta_notifications_email_attempts_check
    check (email_attempts >= 0);

create index if not exists beta_notifications_email_pending_idx
  on public.beta_notifications(created_at, id)
  where email_status in ('pending','failed');

comment on column public.beta_notifications.email_status is
  'Server-side transactional email outbox status. Existing rows at rollout are skipped; new rows default to pending.';
comment on column public.beta_notifications.email_message_id is
  'Provider message identifier returned by Resend after a successful API request.';

commit;
