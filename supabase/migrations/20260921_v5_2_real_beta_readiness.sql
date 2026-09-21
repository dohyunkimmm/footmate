begin;

alter table public.matches
  add column if not exists cancel_cutoff_at timestamptz,
  add column if not exists check_in_opens_at timestamptz;

alter table public.participations
  add column if not exists checked_in_at timestamptz;

alter table public.matches
  drop constraint if exists matches_cancel_cutoff_before_start,
  add constraint matches_cancel_cutoff_before_start
    check (cancel_cutoff_at is null or cancel_cutoff_at < starts_at),
  drop constraint if exists matches_check_in_before_start,
  add constraint matches_check_in_before_start
    check (check_in_opens_at is null or check_in_opens_at <= starts_at);

create table if not exists public.beta_notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (char_length(event_type) between 3 and 80),
  match_id uuid references public.matches(id) on delete set null,
  participation_id uuid references public.participations(id) on delete set null,
  title text not null check (char_length(title) between 1 and 120),
  body text not null check (char_length(body) between 1 and 400),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists beta_notifications_user_created_idx
  on public.beta_notifications(user_id, created_at desc);
create index if not exists beta_notifications_match_idx
  on public.beta_notifications(match_id, created_at desc)
  where match_id is not null;

alter table public.beta_notifications enable row level security;

drop policy if exists beta_notifications_select_own on public.beta_notifications;
create policy beta_notifications_select_own
on public.beta_notifications
for select
to authenticated
using (user_id = (select auth.uid()));

revoke all on public.beta_notifications from anon;
revoke insert, update, delete on public.beta_notifications from authenticated;
grant select on public.beta_notifications to authenticated;

create or replace function public.notify_beta_participation_transition()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor uuid := auth.uid();
  v_operator boolean := false;
  v_title text := null;
  v_body text := null;
  v_event text := null;
begin
  if v_actor is not null then
    select exists(select 1 from public.operators o where o.user_id = v_actor) into v_operator;
  end if;

  if tg_op = 'INSERT' and new.status = 'confirmed' then
    v_event := 'participation.joined';
    v_title := '참가가 확정됐습니다';
    v_body := '선택한 경기 참가가 확정되었습니다. 경기 전 운영 공지를 확인해주세요.';
  elsif tg_op = 'UPDATE' and old.status is distinct from new.status then
    if old.status = 'canceled' and new.status = 'confirmed' then
      v_event := 'participation.joined';
      v_title := '참가가 다시 확정됐습니다';
      v_body := '취소했던 경기 참가가 다시 확정되었습니다.';
    elsif old.status = 'confirmed' and new.status = 'canceled' then
      if v_operator and v_actor is distinct from new.user_id then
        v_event := 'participation.operator_canceled';
        v_title := '참가 상태가 변경됐습니다';
        v_body := '운영자 조치로 경기 참가가 취소되었습니다. 자세한 내용은 운영 안내를 확인해주세요.';
      else
        v_event := 'participation.canceled';
        v_title := '참가를 취소했습니다';
        v_body := '경기 참가 취소가 반영되었습니다.';
      end if;
    end if;
  elsif tg_op = 'UPDATE'
    and old.checked_in_at is null
    and new.checked_in_at is not null
  then
    v_event := 'participation.checked_in';
    v_title := '체크인이 완료됐습니다';
    v_body := '경기 체크인이 기록되었습니다. 현장 운영 안내를 따라주세요.';
  end if;

  if v_event is not null then
    insert into public.beta_notifications (
      user_id, event_type, match_id, participation_id, title, body
    ) values (
      new.user_id, v_event, new.match_id, new.id, v_title, v_body
    );
  end if;

  return new;
end;
$$;

revoke all on function public.notify_beta_participation_transition() from public, anon, authenticated;

drop trigger if exists participations_beta_notify on public.participations;
create trigger participations_beta_notify
after insert or update of status, checked_in_at on public.participations
for each row execute function public.notify_beta_participation_transition();

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
  elsif tg_op = 'UPDATE'
    and old.checked_in_at is null
    and new.checked_in_at is not null
  then
    v_event := 'participation.checked_in';
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
      jsonb_build_object('status', new.status, 'checked_in_at', new.checked_in_at)
    );
  end if;

  return new;
end;
$$;

revoke all on function public.audit_beta_participation_transition() from public, anon, authenticated;

drop trigger if exists participations_beta_audit on public.participations;
create trigger participations_beta_audit
after insert or update of status, checked_in_at on public.participations
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
  elsif tg_op = 'UPDATE' and old.status is distinct from new.status then
    if new.status = 'canceled' then v_event := 'match.canceled'; end if;
    if new.status = 'completed' then v_event := 'match.completed'; end if;
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

create or replace function public.join_match_position(p_match_id uuid, p_position text)
returns table (
  participation_id uuid,
  joined_match_id uuid,
  joined_position text,
  participation_status text,
  remaining_position_spots integer,
  remaining_match_spots integer,
  already_joined boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_position text := upper(btrim(coalesce(p_position, '')));
  v_match public.matches%rowtype;
  v_slot public.match_slots%rowtype;
  v_participation public.participations%rowtype;
  v_position_remaining integer;
  v_match_remaining integer;
begin
  if v_user_id is null then raise exception 'AUTH_REQUIRED' using errcode = '28000'; end if;
  if v_position not in ('MF','FW','DF','GK') then raise exception 'INVALID_POSITION' using errcode = '22023'; end if;

  select * into v_match from public.matches where id = p_match_id for update;
  if v_match.id is null then raise exception 'MATCH_NOT_FOUND' using errcode = 'P0002'; end if;

  select * into v_participation
  from public.participations
  where match_id = p_match_id and user_id = v_user_id
  for update;

  if v_participation.id is not null and v_participation.status = 'confirmed' then
    select remaining_spots into v_position_remaining
    from public.match_slots
    where match_id = p_match_id and position = v_participation.position;
    return query select v_participation.id, v_match.id, v_participation.position,
      v_participation.status, coalesce(v_position_remaining, 0), v_match.remaining_spots, true;
    return;
  end if;

  if v_match.starts_at <= now() then raise exception 'MATCH_STARTED' using errcode = 'P0001'; end if;
  if v_match.cancel_cutoff_at is not null and now() >= v_match.cancel_cutoff_at then
    raise exception 'JOIN_CLOSED' using errcode = 'P0001';
  end if;
  if v_match.status <> 'open' then
    if v_match.status = 'full' or v_match.joined_count >= v_match.capacity_total then
      raise exception 'MATCH_FULL' using errcode = 'P0001';
    end if;
    raise exception 'MATCH_NOT_JOINABLE' using errcode = 'P0001';
  end if;

  select * into v_slot
  from public.match_slots
  where match_id = p_match_id and position = v_position
  for update;
  if v_slot.match_id is null then raise exception 'POSITION_NOT_AVAILABLE' using errcode = 'P0002'; end if;
  if v_slot.joined_count >= v_slot.capacity_total then raise exception 'POSITION_FULL' using errcode = 'P0001'; end if;
  if v_match.joined_count >= v_match.capacity_total then
    update public.matches set status = 'full' where id = p_match_id;
    raise exception 'MATCH_FULL' using errcode = 'P0001';
  end if;

  if v_participation.id is null then
    insert into public.participations (match_id, user_id, position, status)
    values (p_match_id, v_user_id, v_position, 'confirmed')
    returning * into v_participation;
  else
    update public.participations
    set position = v_position,
        status = 'confirmed',
        joined_at = now(),
        canceled_at = null,
        checked_in_at = null
    where id = v_participation.id
    returning * into v_participation;
  end if;

  update public.match_slots
  set joined_count = joined_count + 1
  where match_id = p_match_id and position = v_position
  returning remaining_spots into v_position_remaining;

  update public.matches
  set joined_count = joined_count + 1,
      status = case when joined_count + 1 >= capacity_total then 'full' else 'open' end
  where id = p_match_id
  returning remaining_spots into v_match_remaining;

  return query select v_participation.id, v_match.id, v_position, v_participation.status,
    v_position_remaining, v_match_remaining, false;
end;
$$;

create or replace function public.cancel_participation(p_match_id uuid)
returns table (
  participation_id uuid,
  canceled_match_id uuid,
  participation_status text,
  remaining_spots integer,
  already_canceled boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_match public.matches%rowtype;
  v_participation public.participations%rowtype;
  v_remaining integer;
begin
  if v_user_id is null then raise exception 'AUTH_REQUIRED' using errcode = '28000'; end if;

  select m.* into v_match from public.matches m where m.id = p_match_id for update;
  if v_match.id is null then raise exception 'MATCH_NOT_FOUND' using errcode = 'P0002'; end if;

  select p.* into v_participation
  from public.participations p
  where p.match_id = p_match_id and p.user_id = v_user_id
  for update;
  if v_participation.id is null then raise exception 'PARTICIPATION_NOT_FOUND' using errcode = 'P0002'; end if;
  if v_participation.status = 'canceled' then
    return query select v_participation.id, v_match.id, v_participation.status, v_match.remaining_spots, true;
    return;
  end if;
  if v_match.cancel_cutoff_at is not null and now() >= v_match.cancel_cutoff_at then
    raise exception 'CANCELLATION_CLOSED' using errcode = 'P0001';
  end if;

  if v_participation.position is not null then
    perform 1 from public.match_slots s
    where s.match_id = p_match_id and s.position = v_participation.position
    for update;
    update public.match_slots s
    set joined_count = greatest(s.joined_count - 1, 0)
    where s.match_id = p_match_id and s.position = v_participation.position;
  end if;

  update public.participations p
  set status = 'canceled', canceled_at = now()
  where p.id = v_participation.id
  returning p.* into v_participation;

  update public.matches m
  set joined_count = greatest(m.joined_count - 1, 0),
      status = case when m.status = 'full' and m.starts_at > now() then 'open' else m.status end
  where m.id = p_match_id
  returning m.remaining_spots into v_remaining;

  return query select v_participation.id, v_match.id, v_participation.status, v_remaining, false;
end;
$$;

create or replace function public.check_in_participation(p_match_id uuid)
returns table (
  participation_id uuid,
  checked_in_match_id uuid,
  checked_in_at timestamptz,
  already_checked_in boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_match public.matches%rowtype;
  v_participation public.participations%rowtype;
begin
  if v_user_id is null then raise exception 'AUTH_REQUIRED' using errcode = '28000'; end if;

  select * into v_match from public.matches where id = p_match_id for update;
  if v_match.id is null then raise exception 'MATCH_NOT_FOUND' using errcode = 'P0002'; end if;
  if v_match.status not in ('open','full') then raise exception 'MATCH_NOT_CHECKINABLE' using errcode = 'P0001'; end if;
  if v_match.check_in_opens_at is null or now() < v_match.check_in_opens_at then
    raise exception 'CHECKIN_NOT_OPEN' using errcode = 'P0001';
  end if;
  if now() > v_match.starts_at + make_interval(mins => v_match.duration_minutes) then
    raise exception 'CHECKIN_CLOSED' using errcode = 'P0001';
  end if;

  select * into v_participation
  from public.participations
  where match_id = p_match_id and user_id = v_user_id
  for update;
  if v_participation.id is null or v_participation.status <> 'confirmed' then
    raise exception 'PARTICIPATION_NOT_CONFIRMED' using errcode = 'P0001';
  end if;
  if v_participation.checked_in_at is not null then
    return query select v_participation.id, v_match.id, v_participation.checked_in_at, true;
    return;
  end if;

  update public.participations
  set checked_in_at = now()
  where id = v_participation.id
  returning * into v_participation;

  return query select v_participation.id, v_match.id, v_participation.checked_in_at, false;
end;
$$;

create or replace function public.operator_check_in_participant(p_match_id uuid, p_user_id uuid)
returns table (participation_id uuid, match_id uuid, user_id uuid, checked_in_at timestamptz)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_operator_id uuid := auth.uid();
  v_participation public.participations%rowtype;
begin
  if v_operator_id is null then raise exception 'AUTH_REQUIRED' using errcode = '28000'; end if;
  if not exists (select 1 from public.operators o where o.user_id = v_operator_id) then
    raise exception 'OPERATOR_REQUIRED' using errcode = '42501';
  end if;

  select * into v_participation
  from public.participations p
  where p.match_id = p_match_id and p.user_id = p_user_id
  for update;
  if v_participation.id is null or v_participation.status <> 'confirmed' then
    raise exception 'PARTICIPATION_NOT_CONFIRMED' using errcode = 'P0001';
  end if;

  update public.participations
  set checked_in_at = coalesce(checked_in_at, now())
  where id = v_participation.id
  returning * into v_participation;

  return query select v_participation.id, p_match_id, p_user_id, v_participation.checked_in_at;
end;
$$;

create or replace function public.operator_complete_match(p_match_id uuid)
returns table (match_id uuid, match_status text, checked_in_participants integer)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_operator_id uuid := auth.uid();
  v_match public.matches%rowtype;
  v_checked integer := 0;
begin
  if v_operator_id is null then raise exception 'AUTH_REQUIRED' using errcode = '28000'; end if;
  if not exists (select 1 from public.operators o where o.user_id = v_operator_id) then
    raise exception 'OPERATOR_REQUIRED' using errcode = '42501';
  end if;

  select * into v_match from public.matches where id = p_match_id for update;
  if v_match.id is null then raise exception 'MATCH_NOT_FOUND' using errcode = 'P0002'; end if;
  if v_match.status = 'canceled' then raise exception 'MATCH_NOT_COMPLETABLE' using errcode = 'P0001'; end if;
  if v_match.status = 'completed' then
    select count(*)::integer into v_checked from public.participations
    where match_id = p_match_id and checked_in_at is not null;
    return query select v_match.id, v_match.status, v_checked;
    return;
  end if;
  if now() < v_match.starts_at then raise exception 'MATCH_NOT_STARTED' using errcode = 'P0001'; end if;

  update public.matches set status = 'completed' where id = p_match_id;
  select count(*)::integer into v_checked from public.participations
  where match_id = p_match_id and checked_in_at is not null;

  insert into public.beta_notifications (user_id,event_type,match_id,participation_id,title,body)
  select p.user_id,'match.completed',p_match_id,p.id,'경기가 종료됐습니다','경기 종료가 기록되었습니다. 참여 경험을 확인해주세요.'
  from public.participations p
  where p.match_id = p_match_id and p.status = 'confirmed';

  return query select p_match_id, 'completed'::text, v_checked;
end;
$$;

create or replace function public.mark_beta_notification_read(p_notification_id bigint)
returns table (notification_id bigint, read_at timestamptz)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_read_at timestamptz;
begin
  if v_user_id is null then raise exception 'AUTH_REQUIRED' using errcode = '28000'; end if;

  update public.beta_notifications n
  set read_at = coalesce(n.read_at, now())
  where n.id = p_notification_id and n.user_id = v_user_id
  returning n.read_at into v_read_at;

  if v_read_at is null then raise exception 'NOTIFICATION_NOT_FOUND' using errcode = 'P0002'; end if;
  return query select p_notification_id, v_read_at;
end;
$$;

create or replace function public.operator_save_match_v2(
  p_match_id uuid,
  p_title text,
  p_venue_name text,
  p_area_label text,
  p_address text,
  p_region text,
  p_level text,
  p_starts_at timestamptz,
  p_cancel_cutoff_at timestamptz,
  p_check_in_opens_at timestamptz,
  p_capacity_total integer,
  p_format_label text,
  p_surface text,
  p_duration_minutes integer,
  p_status text,
  p_slots jsonb
)
returns table (match_id uuid, match_status text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_match_id uuid := p_match_id;
  v_existing public.matches%rowtype;
  v_slot jsonb;
  v_position text;
  v_capacity integer;
  v_positions text[] := '{}';
  v_slot_total integer := 0;
  v_old_capacity integer := 0;
  v_work_capacity integer;
  v_final_status text;
begin
  if v_user_id is null then raise exception 'AUTH_REQUIRED' using errcode = '28000'; end if;
  if not exists (select 1 from public.operators o where o.user_id = v_user_id) then
    raise exception 'OPERATOR_REQUIRED' using errcode = '42501';
  end if;
  if p_status not in ('draft','open') then raise exception 'INVALID_MATCH_STATUS' using errcode = '22023'; end if;
  if p_capacity_total is null or p_capacity_total <= 0 then raise exception 'INVALID_MATCH_CAPACITY' using errcode = '22023'; end if;
  if p_starts_at is null then raise exception 'MATCH_START_REQUIRED' using errcode = '22023'; end if;
  if p_status = 'open' and p_starts_at <= now() then raise exception 'MATCH_START_NOT_FUTURE' using errcode = '22023'; end if;
  if p_status = 'open' and p_cancel_cutoff_at is null then raise exception 'CANCEL_CUTOFF_REQUIRED' using errcode = '22023'; end if;
  if p_status = 'open' and p_check_in_opens_at is null then raise exception 'CHECKIN_OPEN_REQUIRED' using errcode = '22023'; end if;
  if p_cancel_cutoff_at is not null and p_cancel_cutoff_at >= p_starts_at then raise exception 'INVALID_CANCEL_CUTOFF' using errcode = '22023'; end if;
  if p_status = 'open' and p_cancel_cutoff_at <= now() then raise exception 'CANCEL_CUTOFF_NOT_FUTURE' using errcode = '22023'; end if;
  if p_check_in_opens_at is not null and p_check_in_opens_at > p_starts_at then raise exception 'INVALID_CHECKIN_OPEN' using errcode = '22023'; end if;
  if jsonb_typeof(coalesce(p_slots, '[]'::jsonb)) <> 'array' then raise exception 'INVALID_POSITION_SLOTS' using errcode = '22023'; end if;

  for v_slot in select value from jsonb_array_elements(coalesce(p_slots, '[]'::jsonb)) loop
    v_position := upper(btrim(coalesce(v_slot ->> 'position', '')));
    begin
      v_capacity := coalesce((v_slot ->> 'capacity_total')::integer, 0);
    exception when invalid_text_representation then
      raise exception 'INVALID_POSITION_CAPACITY' using errcode = '22023';
    end;
    if v_position not in ('MF','FW','DF','GK') then raise exception 'INVALID_POSITION' using errcode = '22023'; end if;
    if array_position(v_positions, v_position) is not null then raise exception 'DUPLICATE_POSITION' using errcode = '22023'; end if;
    if v_capacity < 0 then raise exception 'INVALID_POSITION_CAPACITY' using errcode = '22023'; end if;
    if v_capacity > 0 then
      v_positions := array_append(v_positions, v_position);
      v_slot_total := v_slot_total + v_capacity;
    end if;
  end loop;
  if cardinality(v_positions) = 0 or v_slot_total <> p_capacity_total then
    raise exception 'POSITION_CAPACITY_INCOMPLETE' using errcode = '23514';
  end if;

  if v_match_id is not null then
    select * into v_existing from public.matches m where m.id = v_match_id for update;
    if v_existing.id is null then raise exception 'MATCH_NOT_FOUND' using errcode = 'P0002'; end if;
    if v_existing.status in ('canceled','completed') then raise exception 'MATCH_NOT_EDITABLE' using errcode = 'P0001'; end if;
    v_old_capacity := v_existing.capacity_total;
    v_work_capacity := greatest(v_old_capacity, p_capacity_total);
    update public.matches m set status = 'draft', capacity_total = v_work_capacity where m.id = v_match_id;
  else
    insert into public.matches (
      title, venue_name, area_label, address, region, level, positions, starts_at,
      cancel_cutoff_at, check_in_opens_at, price_krw, capacity_total,
      format_label, surface, duration_minutes, status, created_by
    ) values (
      coalesce(p_title,''), coalesce(p_venue_name,''), p_area_label, coalesce(p_address,''),
      coalesce(p_region,''), p_level, v_positions, p_starts_at,
      p_cancel_cutoff_at, p_check_in_opens_at, 0, p_capacity_total,
      p_format_label, p_surface, p_duration_minutes, 'draft', v_user_id
    ) returning id into v_match_id;
  end if;

  if exists (
    select 1 from public.match_slots s
    where s.match_id = v_match_id and not (s.position = any(v_positions)) and s.joined_count > 0
  ) then raise exception 'POSITION_HAS_PARTICIPANTS' using errcode = '23514'; end if;

  delete from public.match_slots s
  where s.match_id = v_match_id and not (s.position = any(v_positions));

  for v_slot in select value from jsonb_array_elements(coalesce(p_slots, '[]'::jsonb)) loop
    v_position := upper(btrim(coalesce(v_slot ->> 'position', '')));
    v_capacity := coalesce((v_slot ->> 'capacity_total')::integer, 0);
    if v_capacity > 0 then
      insert into public.match_slots (match_id, position, capacity_total)
      values (v_match_id, v_position, v_capacity)
      on conflict on constraint match_slots_pkey
      do update set capacity_total = excluded.capacity_total;
    end if;
  end loop;

  select * into v_existing from public.matches m where m.id = v_match_id for update;
  if v_existing.joined_count > p_capacity_total then raise exception 'MATCH_CAPACITY_BELOW_JOINED' using errcode = '23514'; end if;

  v_final_status := case
    when p_status = 'open' and v_existing.joined_count >= p_capacity_total then 'full'
    else p_status
  end;

  update public.matches m
  set title = coalesce(p_title,''),
      venue_name = coalesce(p_venue_name,''),
      area_label = p_area_label,
      address = coalesce(p_address,''),
      region = coalesce(p_region,''),
      level = p_level,
      positions = v_positions,
      starts_at = p_starts_at,
      cancel_cutoff_at = p_cancel_cutoff_at,
      check_in_opens_at = p_check_in_opens_at,
      price_krw = 0,
      capacity_total = p_capacity_total,
      format_label = p_format_label,
      surface = p_surface,
      duration_minutes = p_duration_minutes,
      status = v_final_status
  where m.id = v_match_id;

  return query select v_match_id, v_final_status;
end;
$$;

revoke execute on function public.join_match_position(uuid,text) from public, anon;
revoke execute on function public.cancel_participation(uuid) from public, anon;
revoke execute on function public.check_in_participation(uuid) from public, anon;
revoke execute on function public.operator_check_in_participant(uuid,uuid) from public, anon;
revoke execute on function public.operator_complete_match(uuid) from public, anon;
revoke execute on function public.mark_beta_notification_read(bigint) from public, anon;
revoke execute on function public.operator_save_match_v2(uuid,text,text,text,text,text,text,timestamptz,timestamptz,timestamptz,integer,text,text,integer,text,jsonb) from public, anon;

grant execute on function public.join_match_position(uuid,text) to authenticated;
grant execute on function public.cancel_participation(uuid) to authenticated;
grant execute on function public.check_in_participation(uuid) to authenticated;
grant execute on function public.operator_check_in_participant(uuid,uuid) to authenticated;
grant execute on function public.operator_complete_match(uuid) to authenticated;
grant execute on function public.mark_beta_notification_read(bigint) to authenticated;
grant execute on function public.operator_save_match_v2(uuid,text,text,text,text,text,text,timestamptz,timestamptz,timestamptz,integer,text,text,integer,text,jsonb) to authenticated;

commit;
