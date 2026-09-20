begin;

alter table public.matches
  add column if not exists area_label text,
  add column if not exists level text,
  add column if not exists format_label text,
  add column if not exists surface text,
  add column if not exists duration_minutes integer;

alter table public.matches
  drop constraint if exists matches_level_check;
alter table public.matches
  add constraint matches_level_check
  check (level is null or level in ('입문','초중급','중급','중급+'));

alter table public.matches
  drop constraint if exists matches_duration_minutes_check;
alter table public.matches
  add constraint matches_duration_minutes_check
  check (duration_minutes is null or (duration_minutes between 30 and 240));

alter table public.participations
  add column if not exists position text;

alter table public.participations
  drop constraint if exists participations_position_check;
alter table public.participations
  add constraint participations_position_check
  check (position is null or position in ('MF','FW','DF','GK'));

create table if not exists public.match_slots (
  match_id uuid not null references public.matches(id) on delete cascade,
  position text not null check (position in ('MF','FW','DF','GK')),
  capacity_total integer not null check (capacity_total > 0),
  joined_count integer not null default 0 check (joined_count >= 0 and joined_count <= capacity_total),
  remaining_spots integer generated always as (greatest(capacity_total - joined_count, 0)) stored,
  updated_at timestamptz not null default now(),
  primary key (match_id, position)
);

create index if not exists match_slots_match_idx on public.match_slots(match_id);

create or replace function public.validate_match_slot_capacity()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_match_capacity integer;
  v_other_capacity integer;
begin
  select capacity_total
  into v_match_capacity
  from public.matches
  where id = new.match_id;

  if v_match_capacity is null then
    raise exception 'MATCH_NOT_FOUND' using errcode = 'P0002';
  end if;

  select coalesce(sum(capacity_total), 0)::integer
  into v_other_capacity
  from public.match_slots
  where match_id = new.match_id
    and position <> new.position;

  if v_other_capacity + new.capacity_total > v_match_capacity then
    raise exception 'POSITION_CAPACITY_EXCEEDS_MATCH_CAPACITY' using errcode = '23514';
  end if;

  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists match_slots_validate_capacity on public.match_slots;
create trigger match_slots_validate_capacity
before insert or update on public.match_slots
for each row execute function public.validate_match_slot_capacity();

create or replace function public.validate_open_match_contract()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.status in ('open','full') then
    if nullif(btrim(new.title), '') is null
      or nullif(btrim(new.venue_name), '') is null
      or nullif(btrim(new.region), '') is null
      or nullif(btrim(new.address), '') is null
      or nullif(btrim(new.level), '') is null
      or nullif(btrim(new.format_label), '') is null
      or nullif(btrim(new.surface), '') is null
      or new.duration_minutes is null
    then
      raise exception 'MATCH_CONTRACT_INCOMPLETE' using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists matches_validate_open_contract on public.matches;
create trigger matches_validate_open_contract
before insert or update on public.matches
for each row execute function public.validate_open_match_contract();

alter table public.match_slots enable row level security;

drop policy if exists match_slots_public_read on public.match_slots;
create policy match_slots_public_read
on public.match_slots
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.matches m
    where m.id = match_id and m.status <> 'draft'
  )
);

drop policy if exists match_slots_operator_write on public.match_slots;
create policy match_slots_operator_write
on public.match_slots
for all
to authenticated
using (
  exists (
    select 1 from public.operators o where o.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.operators o where o.user_id = auth.uid()
  )
);

grant select on public.match_slots to anon, authenticated;
grant insert, update, delete on public.match_slots to authenticated;

revoke execute on function public.join_match(uuid) from authenticated;

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
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED' using errcode = '28000';
  end if;

  if v_position not in ('MF','FW','DF','GK') then
    raise exception 'INVALID_POSITION' using errcode = '22023';
  end if;

  select *
  into v_match
  from public.matches
  where id = p_match_id
  for update;

  if v_match.id is null then
    raise exception 'MATCH_NOT_FOUND' using errcode = 'P0002';
  end if;

  select *
  into v_participation
  from public.participations
  where match_id = p_match_id and user_id = v_user_id
  for update;

  if v_participation.id is not null and v_participation.status = 'confirmed' then
    select remaining_spots
    into v_position_remaining
    from public.match_slots
    where match_id = p_match_id and position = v_participation.position;

    return query
    select
      v_participation.id,
      v_match.id,
      v_participation.position,
      v_participation.status,
      coalesce(v_position_remaining, 0),
      v_match.remaining_spots,
      true;
    return;
  end if;

  if v_match.starts_at <= now() then
    raise exception 'MATCH_STARTED' using errcode = 'P0001';
  end if;

  if v_match.status <> 'open' then
    if v_match.status = 'full' or v_match.joined_count >= v_match.capacity_total then
      raise exception 'MATCH_FULL' using errcode = 'P0001';
    end if;
    raise exception 'MATCH_NOT_JOINABLE' using errcode = 'P0001';
  end if;

  select *
  into v_slot
  from public.match_slots
  where match_id = p_match_id and position = v_position
  for update;

  if v_slot.match_id is null then
    raise exception 'POSITION_NOT_AVAILABLE' using errcode = 'P0002';
  end if;

  if v_slot.joined_count >= v_slot.capacity_total then
    raise exception 'POSITION_FULL' using errcode = 'P0001';
  end if;

  if v_match.joined_count >= v_match.capacity_total then
    update public.matches
    set status = 'full'
    where id = p_match_id;
    raise exception 'MATCH_FULL' using errcode = 'P0001';
  end if;

  if v_participation.id is null then
    insert into public.participations (match_id, user_id, position, status)
    values (p_match_id, v_user_id, v_position, 'confirmed')
    returning * into v_participation;
  else
    update public.participations
    set
      position = v_position,
      status = 'confirmed',
      joined_at = now(),
      canceled_at = null
    where id = v_participation.id
    returning * into v_participation;
  end if;

  update public.match_slots
  set joined_count = joined_count + 1
  where match_id = p_match_id and position = v_position
  returning remaining_spots into v_position_remaining;

  update public.matches
  set
    joined_count = joined_count + 1,
    status = case
      when joined_count + 1 >= capacity_total then 'full'
      else 'open'
    end
  where id = p_match_id
  returning remaining_spots into v_match_remaining;

  return query
  select
    v_participation.id,
    v_match.id,
    v_position,
    v_participation.status,
    v_position_remaining,
    v_match_remaining,
    false;
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
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED' using errcode = '28000';
  end if;

  select *
  into v_match
  from public.matches
  where id = p_match_id
  for update;

  if v_match.id is null then
    raise exception 'MATCH_NOT_FOUND' using errcode = 'P0002';
  end if;

  select *
  into v_participation
  from public.participations
  where match_id = p_match_id and user_id = v_user_id
  for update;

  if v_participation.id is null then
    raise exception 'PARTICIPATION_NOT_FOUND' using errcode = 'P0002';
  end if;

  if v_participation.status = 'canceled' then
    return query
    select
      v_participation.id,
      v_match.id,
      v_participation.status,
      v_match.remaining_spots,
      true;
    return;
  end if;

  if v_participation.position is not null then
    perform 1
    from public.match_slots
    where match_id = p_match_id and position = v_participation.position
    for update;

    update public.match_slots
    set joined_count = greatest(joined_count - 1, 0)
    where match_id = p_match_id and position = v_participation.position;
  end if;

  update public.participations
  set status = 'canceled', canceled_at = now()
  where id = v_participation.id
  returning * into v_participation;

  update public.matches
  set
    joined_count = greatest(joined_count - 1, 0),
    status = case
      when status = 'full' and starts_at > now() then 'open'
      else status
    end
  where id = p_match_id
  returning remaining_spots into v_remaining;

  return query
  select
    v_participation.id,
    v_match.id,
    v_participation.status,
    v_remaining,
    false;
end;
$$;

revoke all on function public.join_match_position(uuid, text) from public, anon;
grant execute on function public.join_match_position(uuid, text) to authenticated;

revoke all on function public.cancel_participation(uuid) from public, anon;
grant execute on function public.cancel_participation(uuid) to authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'match_slots'
    ) then
      alter publication supabase_realtime add table public.match_slots;
    end if;
  end if;
end;
$$;

commit;
