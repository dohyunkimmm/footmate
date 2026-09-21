begin;

-- Qualify checked_in_at with the participation table alias because the
-- RETURNS TABLE output column has the same name inside PL/pgSQL.
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

  select p.* into v_participation
  from public.participations p
  where p.match_id = p_match_id and p.user_id = p_user_id
  for update;
  if v_participation.id is null or v_participation.status <> 'confirmed' then
    raise exception 'PARTICIPATION_NOT_CONFIRMED' using errcode = 'P0001';
  end if;

  update public.participations p
  set checked_in_at = coalesce(p.checked_in_at, now())
  where p.id = v_participation.id
  returning p.* into v_participation;

  return query select v_participation.id, p_match_id, p_user_id, v_participation.checked_in_at;
end;
$$;

commit;
