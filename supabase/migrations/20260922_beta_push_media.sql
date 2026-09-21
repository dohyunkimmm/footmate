begin;

alter table public.profiles add column if not exists avatar_path text;
alter table public.matches add column if not exists image_path text;

create table if not exists public.beta_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_success_at timestamptz,
  last_error text
);

create index if not exists beta_push_subscriptions_user_idx
  on public.beta_push_subscriptions(user_id, updated_at desc);

alter table public.beta_push_subscriptions enable row level security;

drop policy if exists beta_push_subscriptions_own_read on public.beta_push_subscriptions;
create policy beta_push_subscriptions_own_read on public.beta_push_subscriptions
for select to authenticated using (user_id=(select auth.uid()));
drop policy if exists beta_push_subscriptions_own_insert on public.beta_push_subscriptions;
create policy beta_push_subscriptions_own_insert on public.beta_push_subscriptions
for insert to authenticated with check (user_id=(select auth.uid()));
drop policy if exists beta_push_subscriptions_own_update on public.beta_push_subscriptions;
create policy beta_push_subscriptions_own_update on public.beta_push_subscriptions
for update to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
drop policy if exists beta_push_subscriptions_own_delete on public.beta_push_subscriptions;
create policy beta_push_subscriptions_own_delete on public.beta_push_subscriptions
for delete to authenticated using (user_id=(select auth.uid()));

create table if not exists public.beta_public_config (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);
alter table public.beta_public_config enable row level security;

create or replace function public.get_beta_push_public_key()
returns text
language sql
security definer
set search_path=public,pg_temp
as $$
  select value from public.beta_public_config where key='web_push_vapid_public_key' limit 1;
$$;
revoke all on function public.get_beta_push_public_key() from public,anon;
grant execute on function public.get_beta_push_public_key() to authenticated,service_role;

create or replace function public.get_beta_web_push_private_key()
returns text
language sql
security definer
set search_path=public,vault,pg_temp
as $$
  select decrypted_secret from vault.decrypted_secrets where name='footmate_beta_web_push_private_key' limit 1;
$$;
revoke all on function public.get_beta_web_push_private_key() from public,anon,authenticated;
grant execute on function public.get_beta_web_push_private_key() to service_role;

create or replace function public.get_beta_web_push_subject()
returns text
language sql
security definer
set search_path=public,vault,pg_temp
as $$
  select decrypted_secret from vault.decrypted_secrets where name='footmate_beta_web_push_subject' limit 1;
$$;
revoke all on function public.get_beta_web_push_subject() from public,anon,authenticated;
grant execute on function public.get_beta_web_push_subject() to service_role;

alter table public.beta_notifications
  add column if not exists push_status text,
  add column if not exists push_attempts integer not null default 0,
  add column if not exists push_last_attempt_at timestamptz,
  add column if not exists push_next_attempt_at timestamptz,
  add column if not exists push_claimed_at timestamptz,
  add column if not exists push_claim_token uuid,
  add column if not exists push_sent_at timestamptz,
  add column if not exists push_last_error text;

update public.beta_notifications set push_status='skipped' where push_status is null;
alter table public.beta_notifications alter column push_status set default 'pending';
alter table public.beta_notifications alter column push_status set not null;
alter table public.beta_notifications drop constraint if exists beta_notifications_push_status_check;
alter table public.beta_notifications add constraint beta_notifications_push_status_check
  check (push_status in ('pending','processing','sent','failed','skipped'));

create index if not exists beta_notifications_push_due_idx
  on public.beta_notifications(push_next_attempt_at,created_at,id)
  where push_status in ('pending','failed','processing');

create or replace function public.claim_beta_notification_pushes(p_limit integer default 10)
returns table (
  id bigint,
  user_id uuid,
  event_type text,
  match_id uuid,
  title text,
  body text,
  push_attempts integer,
  push_claim_token uuid,
  created_at timestamptz
)
language sql
security definer
set search_path=public,extensions,pg_temp
as $$
  with candidates as (
    select n.id
    from public.beta_notifications n
    where (
      n.push_status in ('pending','failed')
      or (n.push_status='processing' and n.push_claimed_at<now()-interval '10 minutes')
    )
      and n.push_attempts<5
      and (n.push_next_attempt_at is null or n.push_next_attempt_at<=now())
    order by n.created_at asc,n.id asc
    for update skip locked
    limit greatest(1,least(coalesce(p_limit,10),50))
  ), claimed as (
    update public.beta_notifications n
    set push_status='processing',push_claimed_at=now(),push_claim_token=gen_random_uuid(),push_last_error=null
    from candidates c
    where n.id=c.id
    returning n.id,n.user_id,n.event_type,n.match_id,n.title,n.body,n.push_attempts,n.push_claim_token,n.created_at
  )
  select * from claimed order by created_at asc,id asc;
$$;
revoke all on function public.claim_beta_notification_pushes(integer) from public,anon,authenticated;
grant execute on function public.claim_beta_notification_pushes(integer) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('beta-media','beta-media',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public=excluded.public,
  file_size_limit=excluded.file_size_limit,
  allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists beta_media_profile_insert on storage.objects;
create policy beta_media_profile_insert on storage.objects for insert to authenticated
with check (
  bucket_id='beta-media'
  and (storage.foldername(name))[1]='profiles'
  and (storage.foldername(name))[2]=(select auth.uid())::text
);
drop policy if exists beta_media_profile_update on storage.objects;
create policy beta_media_profile_update on storage.objects for update to authenticated
using (
  bucket_id='beta-media'
  and (storage.foldername(name))[1]='profiles'
  and (storage.foldername(name))[2]=(select auth.uid())::text
)
with check (
  bucket_id='beta-media'
  and (storage.foldername(name))[1]='profiles'
  and (storage.foldername(name))[2]=(select auth.uid())::text
);
drop policy if exists beta_media_profile_delete on storage.objects;
create policy beta_media_profile_delete on storage.objects for delete to authenticated
using (
  bucket_id='beta-media'
  and (storage.foldername(name))[1]='profiles'
  and (storage.foldername(name))[2]=(select auth.uid())::text
);

drop policy if exists beta_media_match_insert on storage.objects;
create policy beta_media_match_insert on storage.objects for insert to authenticated
with check (
  bucket_id='beta-media'
  and (storage.foldername(name))[1]='matches'
  and coalesce(auth.jwt()->>'aal','aal1')='aal2'
  and exists(select 1 from public.operators o where o.user_id=(select auth.uid()))
);
drop policy if exists beta_media_match_update on storage.objects;
create policy beta_media_match_update on storage.objects for update to authenticated
using (
  bucket_id='beta-media'
  and (storage.foldername(name))[1]='matches'
  and coalesce(auth.jwt()->>'aal','aal1')='aal2'
  and exists(select 1 from public.operators o where o.user_id=(select auth.uid()))
)
with check (
  bucket_id='beta-media'
  and (storage.foldername(name))[1]='matches'
  and coalesce(auth.jwt()->>'aal','aal1')='aal2'
  and exists(select 1 from public.operators o where o.user_id=(select auth.uid()))
);
drop policy if exists beta_media_match_delete on storage.objects;
create policy beta_media_match_delete on storage.objects for delete to authenticated
using (
  bucket_id='beta-media'
  and (storage.foldername(name))[1]='matches'
  and coalesce(auth.jwt()->>'aal','aal1')='aal2'
  and exists(select 1 from public.operators o where o.user_id=(select auth.uid()))
);

comment on table public.beta_push_subscriptions is 'Per-device browser Web Push subscriptions owned by authenticated Closed Beta users.';
comment on column public.beta_notifications.push_status is 'Server-side Web Push outbox state. sent means accepted by the push service, not device-level delivery confirmation.';
comment on column public.profiles.avatar_path is 'Public beta-media object path for the user-selected profile image.';
comment on column public.matches.image_path is 'Public beta-media object path for the operator-selected venue/match image.';

commit;
