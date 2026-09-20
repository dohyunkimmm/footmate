begin;

create or replace function public.validate_open_match_contract()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_slot_capacity integer;
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

    select coalesce(sum(capacity_total), 0)::integer
    into v_slot_capacity
    from public.match_slots
    where match_id = new.id;

    if v_slot_capacity <> new.capacity_total then
      raise exception 'POSITION_CAPACITY_INCOMPLETE' using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;

commit;
