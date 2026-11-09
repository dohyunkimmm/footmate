-- Restored from the applied migration history (20261106132111).
-- The production database is unchanged; this file restores source parity.
CREATE OR REPLACE FUNCTION public.operator_complete_match(p_match_id uuid)
 RETURNS TABLE(match_id uuid, match_status text, checked_in_participants integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_operator_id uuid := auth.uid();
  v_match public.matches%rowtype;
  v_checked integer := 0;
begin
  perform public.require_beta_operator_aal2();
  if v_operator_id is null then raise exception 'AUTH_REQUIRED' using errcode = '28000'; end if;
  if not exists (select 1 from public.operators o where o.user_id = v_operator_id) then
    raise exception 'OPERATOR_REQUIRED' using errcode = '42501';
  end if;

  select * into v_match from public.matches where id = p_match_id for update;
  if v_match.id is null then raise exception 'MATCH_NOT_FOUND' using errcode = 'P0002'; end if;
  if v_match.status = 'canceled' then raise exception 'MATCH_NOT_COMPLETABLE' using errcode = 'P0001'; end if;
  if v_match.status = 'completed' then
    select count(*)::integer into v_checked from public.participations
    where match_id = p_match_id and status = 'confirmed' and checked_in_at is not null;
    return query select v_match.id, v_match.status, v_checked;
    return;
  end if;
  if now() < v_match.starts_at then raise exception 'MATCH_NOT_STARTED' using errcode = 'P0001'; end if;

  update public.matches set status = 'completed' where id = p_match_id;
  select count(*)::integer into v_checked from public.participations
  where match_id = p_match_id and status = 'confirmed' and checked_in_at is not null;

  insert into public.beta_notifications (user_id,event_type,match_id,participation_id,title,body)
  select p.user_id,'match.completed',p_match_id,p.id,'경기가 종료됐습니다','경기 종료가 기록되었습니다. 참여 경험을 확인해주세요.'
  from public.participations p
  where p.match_id = p_match_id and p.status = 'confirmed';

  return query select p_match_id, 'completed'::text, v_checked;
end;
$function$;
