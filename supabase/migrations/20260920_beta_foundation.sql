begin;

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '풋살러',
  region text,
  position text,
  level text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.operators (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  venue_name text not null,
  address text,
  region text not null,
  level_min text,
  level_max text,
  positions text[] not null default '{}',
  starts_at timestamptz not null,
  price_krw integer not null default 0 check (price_krw >= 0),
  capacity_total integer not null check (capacity_total > 0),
  joined_count integer not null default 0 check (joined_count >= 0 and joined_count <= capacity_total),
  remaining_spots integer generated always as (greatest(capacity_total - joined_count, 0)) stored,
  status text not null default 'draft' check (status in ('draft','open','full','canceled','completed')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.participations (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'confirmed' check (status in ('confirmed','canceled')),
  joined_at timestamptz not null default now(),
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (match_id, user_id)
);

create index if not exists matches_starts_at_idx on public.matches(starts_at);
create index if not exists matches_region_status_idx on public.matches(region, status, starts_at);
create index if not exists participations_user_idx on public.participations(user_id, created_at desc);
create index if not exists participations_match_status_idx on public.participations(match_id, status);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists matches_touch_updated_at on public.matches;
create trigger matches_touch_updated_at
before update on public.matches
for each row execute function public.touch_updated_at();

drop trigger if exists participations_touch_updated_at on public.participations;
create trigger participations_touch_updated_at
before update on public.participations
for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), '풋살러')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (id, display_name)
select
  id,
  coalesce(nullif(raw_user_meta_data ->> 'display_name', ''), '풋살러')
from auth.users
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.operators enable row level security;
alter table public.matches enable row level security;
alter table public.participations enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists operators_select_self on public.operators;
create policy operators_select_self
on public.operators
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists matches_public_read on public.matches;
create policy matches_public_read
on public.matches
for select
to anon, authenticated
using (status <> 'draft');

drop policy if exists matches_operator_write on public.matches;
create policy matches_operator_write
on public.matches
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

drop policy if exists participations_select_own on public.participations;
create policy participations_select_own
on public.participations
for select
to authenticated
using (user_id = auth.uid());

revoke all on public.profiles from anon;
revoke all on public.operators from anon;
revoke insert, update, delete on public.matches from anon;
revoke insert, update, delete on public.participations from anon, authenticated;

grant select on public.matches to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.operators to authenticated;
grant insert, update, delete on public.matches to authenticated;
grant select on public.participations to authenticated;

create or replace function public.join_match(p_match_id uuid)
returns table (
  participation_id uuid,
  joined_match_id uuid,
  participation_status text,
  remaining_spots integer,
  already_joined boolean
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
  where match_id = p_match_id and user_id = v_user_id;

  if v_participation.id is not null and v_participation.status = 'confirmed' then
    return query
    select
      v_participation.id,
      v_match.id,
      v_participation.status,
      v_match.remaining_spots,
      true;
    return;
  end if;

  if v_match.status <> 'open' then
    if v_match.status = 'full' or v_match.joined_count >= v_match.capacity_total then
      raise exception 'MATCH_FULL' using errcode = 'P0001';
    end if;
    raise exception 'MATCH_NOT_JOINABLE' using errcode = 'P0001';
  end if;

  if v_match.joined_count >= v_match.capacity_total then
    update public.matches
    set status = 'full'
    where id = p_match_id;
    raise exception 'MATCH_FULL' using errcode = 'P0001';
  end if;

  if v_participation.id is null then
    insert into public.participations (match_id, user_id, status)
    values (p_match_id, v_user_id, 'confirmed')
    returning * into v_participation;
  else
    update public.participations
    set status = 'confirmed', joined_at = now(), canceled_at = null
    where id = v_participation.id
    returning * into v_participation;
  end if;

  update public.matches
  set
    joined_count = joined_count + 1,
    status = case
      when joined_count + 1 >= capacity_total then 'full'
      else 'open'
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

  update public.participations
  set status = 'canceled', canceled_at = now()
  where id = v_participation.id
  returning * into v_participation;

  update public.matches
  set
    joined_count = greatest(joined_count - 1, 0),
    status = case
      when status = 'full' then 'open'
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

revoke all on function public.join_match(uuid) from public, anon;
revoke all on function public.cancel_participation(uuid) from public, anon;
grant execute on function public.join_match(uuid) to authenticated;
grant execute on function public.cancel_participation(uuid) to authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'matches'
    ) then
      alter publication supabase_realtime add table public.matches;
    end if;
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'participations'
    ) then
      alter publication supabase_realtime add table public.participations;
    end if;
  end if;
end;
$$;

commit;
