begin;

create table if not exists public.beta_operation_events (
  id bigint generated always as identity primary key,
  event_type text not null check (char_length(event_type) between 3 and 80),
  actor_id uuid references auth.users(id) on delete set null,
  subject_user_id uuid references auth.users(id) on delete set null,
  match_id uuid references public.matches(id) on delete set null,
  participation_id uuid references public.participations(id) on delete set null,
  position text check (position is null or position in ('MF','FW','DF','GK')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists beta_operation_events_created_at_idx
  on public.beta_operation_events(created_at desc);
create index if not exists beta_operation_events_match_created_idx
  on public.beta_operation_events(match_id, created_at desc)
  where match_id is not null;

alter table public.beta_operation_events enable row level security;

drop policy if exists beta_operation_events_operator_read on public.beta_operation_events;
create policy beta_operation_events_operator_read
on public.beta_operation_events
for select
to authenticated
using (
  exists (
    select 1 from public.operators o
    where o.user_id = (select auth.uid())
  )
);

revoke all on public.beta_operation_events from anon;
revoke insert, update, delete on public.beta_operation_events from authenticated;
grant select on public.beta_operation_events to authenticated;

create or replace function public.audit_beta_participation_transition()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor uuid := auth.uid();
  v_event text := null;
begin
  if tg_op = 'INSERT' and new.status = 'confirmed' then
    v_event := 'participation.joined';
  elsif tg_op = 'UPDATE' and old.status is distinct from new.status then
    if old.status = 'canceled' and new.status = 'confirmed' then
      v_event := 'participation.joined';
    elsif old.status = 'confirmed' and new.status = 'canceled' then
      if v_actor is not null
        and v_actor <> new.user_id
        and exists (select 1 from public.operators o where o.user_id = v_actor)
      then
        v_event := 'participation.operator_canceled';
      else
        v_event := 'participation.canceled';
      end if;
    end if;
  end if;

  if v_event is not null then
    insert into public.beta_operation_events (
      event_type, actor_id, subject_user_id, match_id, participation_id, position, details
    ) values (
      v_event,
      v_actor,
      new.user_id,
      new.match_id,
      new.id,
      new.position,
      jsonb_build_object('status', new.status)
    );
  end if;

  return new;
end;
$$;

revoke all on function public.audit_beta_participation_transition() from public, anon, authenticated;

drop trigger if exists participations_beta_audit on public.participations;
create trigger participations_beta_audit
after insert or update of status on public.participations
for each row execute function public.audit_beta_participation_transition();

create or replace function public.audit_beta_match_transition()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_event text := null;
begin
  if tg_op = 'INSERT' then
    v_event := 'match.created';
  elsif tg_op = 'UPDATE'
    and old.status is distinct from new.status
    and new.status = 'canceled'
  then
    v_event := 'match.canceled';
  end if;

  if v_event is not null then
    insert into public.beta_operation_events (
      event_type, actor_id, match_id, details
    ) values (
      v_event,
      auth.uid(),
      new.id,
      jsonb_build_object(
        'status', new.status,
        'capacity_total', new.capacity_total,
        'joined_count', new.joined_count
      )
    );
  end if;

  return new;
end;
$$;

revoke all on function public.audit_beta_match_transition() from public, anon, authenticated;

drop trigger if exists matches_beta_audit on public.matches;
create trigger matches_beta_audit
after insert or update of status on public.matches
for each row execute function public.audit_beta_match_transition();

commit;
