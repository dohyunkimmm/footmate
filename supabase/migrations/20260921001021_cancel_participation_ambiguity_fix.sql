begin;

-- Hotfix: avoid PL/pgSQL output-column ambiguity in cancel_participation().
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

  select m.*
  into v_match
  from public.matches m
  where m.id = p_match_id
  for update;

  if v_match.id is null then
    raise exception 'MATCH_NOT_FOUND' using errcode = 'P0002';
  end if;

  select p.*
  into v_participation
  from public.participations p
  where p.match_id = p_match_id and p.user_id = v_user_id
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
    from public.match_slots s
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
  set
    joined_count = greatest(m.joined_count - 1, 0),
    status = case
      when m.status = 'full' and m.starts_at > now() then 'open'
      else m.status
    end
  where m.id = p_match_id
  returning m.remaining_spots into v_remaining;

  return query
  select
    v_participation.id,
    v_match.id,
    v_participation.status,
    v_remaining,
    false;
end;
$$;

revoke all on function public.cancel_participation(uuid) from public, anon;
grant execute on function public.cancel_participation(uuid) to authenticated;

commit;
