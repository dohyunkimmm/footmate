begin;

-- Hotfix: avoid PL/pgSQL output-column ambiguity in operator_save_match upsert.
create or replace function public.operator_save_match(
  p_match_id uuid,
  p_title text,
  p_venue_name text,
  p_area_label text,
  p_address text,
  p_region text,
  p_level text,
  p_starts_at timestamptz,
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
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED' using errcode = '28000';
  end if;
  if not exists (select 1 from public.operators o where o.user_id = v_user_id) then
    raise exception 'OPERATOR_REQUIRED' using errcode = '42501';
  end if;
  if p_status not in ('draft','open') then
    raise exception 'INVALID_MATCH_STATUS' using errcode = '22023';
  end if;
  if p_capacity_total is null or p_capacity_total <= 0 then
    raise exception 'INVALID_MATCH_CAPACITY' using errcode = '22023';
  end if;
  if p_starts_at is null then
    raise exception 'MATCH_START_REQUIRED' using errcode = '22023';
  end if;
  if p_status = 'open' and p_starts_at <= now() then
    raise exception 'MATCH_START_NOT_FUTURE' using errcode = '22023';
  end if;
  if jsonb_typeof(coalesce(p_slots, '[]'::jsonb)) <> 'array' then
    raise exception 'INVALID_POSITION_SLOTS' using errcode = '22023';
  end if;

  for v_slot in select value from jsonb_array_elements(coalesce(p_slots, '[]'::jsonb)) loop
    v_position := upper(btrim(coalesce(v_slot ->> 'position', '')));
    begin
      v_capacity := coalesce((v_slot ->> 'capacity_total')::integer, 0);
    exception when invalid_text_representation then
      raise exception 'INVALID_POSITION_CAPACITY' using errcode = '22023';
    end;
    if v_position not in ('MF','FW','DF','GK') then
      raise exception 'INVALID_POSITION' using errcode = '22023';
    end if;
    if array_position(v_positions, v_position) is not null then
      raise exception 'DUPLICATE_POSITION' using errcode = '22023';
    end if;
    if v_capacity < 0 then
      raise exception 'INVALID_POSITION_CAPACITY' using errcode = '22023';
    end if;
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
    if v_existing.id is null then
      raise exception 'MATCH_NOT_FOUND' using errcode = 'P0002';
    end if;
    if v_existing.status in ('canceled','completed') then
      raise exception 'MATCH_NOT_EDITABLE' using errcode = 'P0001';
    end if;
    v_old_capacity := v_existing.capacity_total;
    v_work_capacity := greatest(v_old_capacity, p_capacity_total);
    update public.matches m set status = 'draft', capacity_total = v_work_capacity where m.id = v_match_id;
  else
    insert into public.matches (
      title, venue_name, area_label, address, region, level, positions, starts_at,
      price_krw, capacity_total, format_label, surface, duration_minutes, status, created_by
    ) values (
      coalesce(p_title,''), coalesce(p_venue_name,''), p_area_label, coalesce(p_address,''),
      coalesce(p_region,''), p_level, v_positions, p_starts_at, 0, p_capacity_total,
      p_format_label, p_surface, p_duration_minutes, 'draft', v_user_id
    ) returning id into v_match_id;
  end if;

  if exists (
    select 1 from public.match_slots s
    where s.match_id = v_match_id
      and not (s.position = any(v_positions))
      and s.joined_count > 0
  ) then
    raise exception 'POSITION_HAS_PARTICIPANTS' using errcode = '23514';
  end if;

  delete from public.match_slots s
  where s.match_id = v_match_id
    and not (s.position = any(v_positions));

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
  if v_existing.joined_count > p_capacity_total then
    raise exception 'MATCH_CAPACITY_BELOW_JOINED' using errcode = '23514';
  end if;

  v_final_status := case
    when p_status = 'open' and v_existing.joined_count >= p_capacity_total then 'full'
    else p_status
  end;

  update public.matches m
  set
    title = coalesce(p_title,''),
    venue_name = coalesce(p_venue_name,''),
    area_label = p_area_label,
    address = coalesce(p_address,''),
    region = coalesce(p_region,''),
    level = p_level,
    positions = v_positions,
    starts_at = p_starts_at,
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

revoke execute on function public.operator_save_match(uuid,text,text,text,text,text,text,timestamptz,integer,text,text,integer,text,jsonb) from public, anon;
grant execute on function public.operator_save_match(uuid,text,text,text,text,text,text,timestamptz,integer,text,text,integer,text,jsonb) to authenticated;

commit;
