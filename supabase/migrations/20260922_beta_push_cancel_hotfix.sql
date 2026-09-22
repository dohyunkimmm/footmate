begin;

-- Browser Push subscriptions are protected by RLS, but the table still needs
-- explicit DML privileges for authenticated users. The worker uses service_role.
revoke select, insert, update, delete on table public.beta_push_subscriptions from anon;
grant select, insert, update, delete on table public.beta_push_subscriptions to authenticated;
grant select, insert, update, delete on table public.beta_push_subscriptions to service_role;

-- RETURNS TABLE exposes match_id as an output parameter. Qualify beta_waitlist
-- columns so PL/pgSQL never resolves match_id against the output parameter.
create or replace function public.operator_cancel_match(p_match_id uuid)
returns table(match_id uuid, match_status text, canceled_participants integer)
language plpgsql
security definer
set search_path='public','pg_temp'
as $$
declare
  v_user_id uuid:=auth.uid();
  v_match public.matches%rowtype;
  v_count integer:=0;
begin
  perform public.require_beta_operator_aal2();
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED' using errcode='28000';
  end if;
  if not exists(select 1 from public.operators o where o.user_id=v_user_id) then
    raise exception 'OPERATOR_REQUIRED' using errcode='42501';
  end if;

  select m.* into v_match
  from public.matches m
  where m.id=p_match_id
  for update;

  if v_match.id is null then
    raise exception 'MATCH_NOT_FOUND' using errcode='P0002';
  end if;
  if v_match.status='completed' then
    raise exception 'MATCH_NOT_CANCELABLE' using errcode='P0001';
  end if;
  if v_match.status='canceled' then
    return query select v_match.id,v_match.status,0;
    return;
  end if;

  update public.beta_waitlist w
  set status='canceled',canceled_at=now()
  where w.match_id=p_match_id and w.status='queued';

  update public.participations p
  set status='canceled',canceled_at=now()
  where p.match_id=p_match_id and p.status='confirmed';
  get diagnostics v_count=row_count;

  update public.match_slots s
  set joined_count=0
  where s.match_id=p_match_id;

  update public.matches m
  set joined_count=0,status='canceled'
  where m.id=p_match_id;

  return query select p_match_id,'canceled'::text,v_count;
end;
$$;

revoke all on function public.operator_cancel_match(uuid) from public,anon;
grant execute on function public.operator_cancel_match(uuid) to authenticated;

commit;
