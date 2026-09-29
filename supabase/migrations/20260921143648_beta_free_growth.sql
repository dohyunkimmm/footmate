begin;

create table if not exists public.beta_waitlist (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  position text not null check (position in ('MF','FW','DF','GK')),
  status text not null default 'queued' check (status in ('queued','promoted','canceled')),
  created_at timestamptz not null default now(),
  promoted_at timestamptz,
  canceled_at timestamptz
);
create unique index if not exists beta_waitlist_one_queued_user_match_idx
  on public.beta_waitlist(match_id,user_id) where status='queued';
create index if not exists beta_waitlist_promotion_idx
  on public.beta_waitlist(match_id,position,created_at,id) where status='queued';

alter table public.beta_waitlist enable row level security;
drop policy if exists beta_waitlist_select_own on public.beta_waitlist;
create policy beta_waitlist_select_own on public.beta_waitlist
  for select to authenticated using (user_id=(select auth.uid()));
grant select on public.beta_waitlist to authenticated;
revoke insert,update,delete on public.beta_waitlist from anon,authenticated;

create table if not exists public.beta_match_feedback (
  id uuid primary key default gen_random_uuid(),
  participation_id uuid not null unique references public.participations(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  difficulty integer not null check (difficulty between 1 and 5),
  satisfaction integer not null check (satisfaction between 1 and 5),
  repeat_intent boolean not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(coalesce(note,'')) <= 500)
);
create index if not exists beta_match_feedback_user_idx on public.beta_match_feedback(user_id,created_at desc);
alter table public.beta_match_feedback enable row level security;
drop policy if exists beta_match_feedback_select_own on public.beta_match_feedback;
create policy beta_match_feedback_select_own on public.beta_match_feedback
  for select to authenticated using (user_id=(select auth.uid()));
grant select on public.beta_match_feedback to authenticated;
revoke insert,update,delete on public.beta_match_feedback from anon,authenticated;

create table if not exists public.beta_match_reminder_marks (
  participation_id uuid not null references public.participations(id) on delete cascade,
  reminder_type text not null check (reminder_type in ('24h','2h')),
  created_at timestamptz not null default now(),
  primary key(participation_id,reminder_type)
);
revoke all on public.beta_match_reminder_marks from anon,authenticated;

create or replace function public.join_beta_waitlist(p_match_id uuid,p_position text)
returns table(waitlist_id uuid, queued_match_id uuid, queued_position text, waitlist_status text, already_queued boolean)
language plpgsql security definer set search_path='public','pg_temp' as $$
declare
  v_user uuid:=auth.uid();
  v_position text:=upper(btrim(coalesce(p_position,'')));
  v_match public.matches%rowtype;
  v_slot public.match_slots%rowtype;
  v_row public.beta_waitlist%rowtype;
begin
  if v_user is null then raise exception 'AUTH_REQUIRED' using errcode='28000'; end if;
  if v_position not in ('MF','FW','DF','GK') then raise exception 'INVALID_POSITION' using errcode='22023'; end if;
  select m.* into v_match from public.matches m where m.id=p_match_id for update;
  if v_match.id is null then raise exception 'MATCH_NOT_FOUND' using errcode='P0002'; end if;
  if v_match.status not in ('open','full') or v_match.starts_at<=now() then raise exception 'MATCH_NOT_WAITLISTABLE' using errcode='P0001'; end if;
  if v_match.cancel_cutoff_at is not null and now()>=v_match.cancel_cutoff_at then raise exception 'JOIN_CLOSED' using errcode='P0001'; end if;
  if exists(select 1 from public.participations p where p.match_id=p_match_id and p.user_id=v_user and p.status='confirmed') then
    raise exception 'ALREADY_JOINED' using errcode='P0001';
  end if;
  select s.* into v_slot from public.match_slots s where s.match_id=p_match_id and s.position=v_position for update;
  if v_slot.match_id is null then raise exception 'POSITION_NOT_AVAILABLE' using errcode='P0002'; end if;
  if v_match.joined_count<v_match.capacity_total and v_slot.joined_count<v_slot.capacity_total then
    raise exception 'POSITION_AVAILABLE' using errcode='P0001';
  end if;
  select w.* into v_row from public.beta_waitlist w where w.match_id=p_match_id and w.user_id=v_user and w.status='queued' for update;
  if v_row.id is not null then
    return query select v_row.id,p_match_id,v_row.position,v_row.status,true; return;
  end if;
  insert into public.beta_waitlist(match_id,user_id,position) values(p_match_id,v_user,v_position) returning * into v_row;
  insert into public.beta_operation_events(event_type,actor_id,subject_user_id,match_id,position,details)
    values('participation.waitlisted',v_user,v_user,p_match_id,v_position,jsonb_build_object('status','queued'));
  return query select v_row.id,p_match_id,v_position,v_row.status,false;
end;$$;

create or replace function public.cancel_beta_waitlist(p_match_id uuid)
returns table(waitlist_id uuid, waitlist_status text)
language plpgsql security definer set search_path='public','pg_temp' as $$
declare v_user uuid:=auth.uid(); v_row public.beta_waitlist%rowtype;
begin
  if v_user is null then raise exception 'AUTH_REQUIRED' using errcode='28000'; end if;
  select w.* into v_row from public.beta_waitlist w where w.match_id=p_match_id and w.user_id=v_user and w.status='queued' for update;
  if v_row.id is null then raise exception 'WAITLIST_NOT_FOUND' using errcode='P0002'; end if;
  update public.beta_waitlist set status='canceled',canceled_at=now() where id=v_row.id returning * into v_row;
  insert into public.beta_operation_events(event_type,actor_id,subject_user_id,match_id,position,details)
    values('participation.waitlist_canceled',v_user,v_user,p_match_id,v_row.position,jsonb_build_object('status','canceled'));
  return query select v_row.id,v_row.status;
end;$$;

create or replace function public.promote_beta_waitlist_for_slot(p_match_id uuid,p_position text)
returns uuid
language plpgsql security definer set search_path='public','pg_temp' as $$
declare
  v_position text:=upper(btrim(coalesce(p_position,'')));
  v_match public.matches%rowtype; v_slot public.match_slots%rowtype; v_wait public.beta_waitlist%rowtype; v_part public.participations%rowtype;
begin
  select m.* into v_match from public.matches m where m.id=p_match_id for update;
  if v_match.id is null or v_match.status in ('draft','canceled','completed') or v_match.starts_at<=now() then return null; end if;
  if v_match.cancel_cutoff_at is not null and now()>=v_match.cancel_cutoff_at then return null; end if;
  select s.* into v_slot from public.match_slots s where s.match_id=p_match_id and s.position=v_position for update;
  if v_slot.match_id is null or v_slot.joined_count>=v_slot.capacity_total or v_match.joined_count>=v_match.capacity_total then return null; end if;
  select w.* into v_wait from public.beta_waitlist w
   where w.match_id=p_match_id and w.position=v_position and w.status='queued'
   order by w.created_at,w.id for update skip locked limit 1;
  if v_wait.id is null then return null; end if;
  update public.beta_waitlist set status='promoted',promoted_at=transaction_timestamp() where id=v_wait.id returning * into v_wait;
  select p.* into v_part from public.participations p where p.match_id=p_match_id and p.user_id=v_wait.user_id for update;
  if v_part.id is null then
    insert into public.participations(match_id,user_id,position,status) values(p_match_id,v_wait.user_id,v_position,'confirmed') returning * into v_part;
  else
    update public.participations p set position=v_position,status='confirmed',joined_at=now(),canceled_at=null,checked_in_at=null where p.id=v_part.id returning p.* into v_part;
  end if;
  update public.match_slots s set joined_count=s.joined_count+1 where s.match_id=p_match_id and s.position=v_position;
  update public.matches m set joined_count=m.joined_count+1,status=case when m.joined_count+1>=m.capacity_total then 'full' else 'open' end where m.id=p_match_id;
  return v_part.id;
end;$$;
revoke execute on function public.promote_beta_waitlist_for_slot(uuid,text) from public,anon,authenticated;
grant execute on function public.promote_beta_waitlist_for_slot(uuid,text) to service_role;

grant execute on function public.join_beta_waitlist(uuid,text),public.cancel_beta_waitlist(uuid) to authenticated;
revoke execute on function public.join_beta_waitlist(uuid,text),public.cancel_beta_waitlist(uuid) from anon;

create or replace function public.audit_beta_participation_transition()
returns trigger language plpgsql security definer set search_path='public','pg_temp' as $$
declare v_actor uuid:=auth.uid(); v_event text:=null; v_promoted boolean:=false;
begin
  if new.status='confirmed' and (tg_op='INSERT' or (tg_op='UPDATE' and old.status is distinct from new.status)) then
    select exists(select 1 from public.beta_waitlist w where w.match_id=new.match_id and w.user_id=new.user_id and w.position=new.position and w.status='promoted' and w.promoted_at=transaction_timestamp()) into v_promoted;
  end if;
  if tg_op='INSERT' and new.status='confirmed' then v_event:=case when v_promoted then 'participation.waitlist_promoted' else 'participation.joined' end;
  elsif tg_op='UPDATE' and old.status is distinct from new.status then
    if old.status='canceled' and new.status='confirmed' then v_event:=case when v_promoted then 'participation.waitlist_promoted' else 'participation.joined' end;
    elsif old.status='confirmed' and new.status='canceled' then
      if v_actor is not null and v_actor<>new.user_id and exists(select 1 from public.operators o where o.user_id=v_actor) then v_event:='participation.operator_canceled'; else v_event:='participation.canceled'; end if;
    end if;
  elsif tg_op='UPDATE' and old.checked_in_at is null and new.checked_in_at is not null then v_event:='participation.checked_in'; end if;
  if v_event is not null then
    insert into public.beta_operation_events(event_type,actor_id,subject_user_id,match_id,participation_id,position,details)
    values(v_event,v_actor,new.user_id,new.match_id,new.id,new.position,jsonb_build_object('status',new.status,'checked_in_at',new.checked_in_at));
  end if;
  return new;
end;$$;

create or replace function public.notify_beta_participation_transition()
returns trigger language plpgsql security definer set search_path='public','pg_temp' as $$
declare v_actor uuid:=auth.uid(); v_operator boolean:=false; v_title text:=null; v_body text:=null; v_event text:=null; v_promoted boolean:=false;
begin
  if v_actor is not null then select exists(select 1 from public.operators o where o.user_id=v_actor) into v_operator; end if;
  if new.status='confirmed' and (tg_op='INSERT' or (tg_op='UPDATE' and old.status is distinct from new.status)) then
    select exists(select 1 from public.beta_waitlist w where w.match_id=new.match_id and w.user_id=new.user_id and w.position=new.position and w.status='promoted' and w.promoted_at=transaction_timestamp()) into v_promoted;
  end if;
  if tg_op='INSERT' and new.status='confirmed' then
    if v_promoted then v_event:='participation.waitlist_promoted';v_title:='대기에서 참가로 전환됐습니다';v_body:='빈 자리가 생겨 대기 신청이 자동으로 참가 확정되었습니다.';
    else v_event:='participation.joined';v_title:='참가가 확정됐습니다';v_body:='선택한 경기 참가가 확정되었습니다. 경기 전 운영 공지를 확인해주세요.'; end if;
  elsif tg_op='UPDATE' and old.status is distinct from new.status then
    if old.status='canceled' and new.status='confirmed' then
      if v_promoted then v_event:='participation.waitlist_promoted';v_title:='대기에서 참가로 전환됐습니다';v_body:='빈 자리가 생겨 대기 신청이 자동으로 참가 확정되었습니다.';
      else v_event:='participation.joined';v_title:='참가가 다시 확정됐습니다';v_body:='취소했던 경기 참가가 다시 확정되었습니다.'; end if;
    elsif old.status='confirmed' and new.status='canceled' then
      if v_operator and v_actor is distinct from new.user_id then v_event:='participation.operator_canceled';v_title:='참가 상태가 변경됐습니다';v_body:='운영자 조치로 경기 참가가 취소되었습니다. 자세한 내용은 운영 안내를 확인해주세요.';
      else v_event:='participation.canceled';v_title:='참가를 취소했습니다';v_body:='경기 참가 취소가 반영되었습니다.'; end if;
    end if;
  elsif tg_op='UPDATE' and old.checked_in_at is null and new.checked_in_at is not null then v_event:='participation.checked_in';v_title:='체크인이 완료됐습니다';v_body:='경기 체크인이 기록되었습니다. 현장 운영 안내를 따라주세요.'; end if;
  if v_event is not null then insert into public.beta_notifications(user_id,event_type,match_id,participation_id,title,body) values(new.user_id,v_event,new.match_id,new.id,v_title,v_body); end if;
  return new;
end;$$;

create or replace function public.cancel_participation(p_match_id uuid)
returns table(participation_id uuid,canceled_match_id uuid,participation_status text,remaining_spots integer,already_canceled boolean)
language plpgsql security definer set search_path='public','pg_temp' as $$
declare v_user_id uuid:=auth.uid();v_match public.matches%rowtype;v_participation public.participations%rowtype;v_remaining integer;v_position text;
begin
  if v_user_id is null then raise exception 'AUTH_REQUIRED' using errcode='28000'; end if;
  select m.* into v_match from public.matches m where m.id=p_match_id for update;
  if v_match.id is null then raise exception 'MATCH_NOT_FOUND' using errcode='P0002'; end if;
  select p.* into v_participation from public.participations p where p.match_id=p_match_id and p.user_id=v_user_id for update;
  if v_participation.id is null then raise exception 'PARTICIPATION_NOT_FOUND' using errcode='P0002'; end if;
  if v_participation.status='canceled' then return query select v_participation.id,v_match.id,v_participation.status,v_match.remaining_spots,true;return;end if;
  if v_match.cancel_cutoff_at is not null and now()>=v_match.cancel_cutoff_at then raise exception 'CANCELLATION_CLOSED' using errcode='P0001'; end if;
  v_position:=v_participation.position;
  if v_position is not null then perform 1 from public.match_slots s where s.match_id=p_match_id and s.position=v_position for update; update public.match_slots s set joined_count=greatest(s.joined_count-1,0) where s.match_id=p_match_id and s.position=v_position; end if;
  update public.participations p set status='canceled',canceled_at=now() where p.id=v_participation.id returning p.* into v_participation;
  update public.matches m set joined_count=greatest(m.joined_count-1,0),status=case when m.status='full' and m.starts_at>now() then 'open' else m.status end where m.id=p_match_id returning m.remaining_spots into v_remaining;
  if v_position is not null then perform public.promote_beta_waitlist_for_slot(p_match_id,v_position); end if;
  select m.remaining_spots into v_remaining from public.matches m where m.id=p_match_id;
  return query select v_participation.id,v_match.id,v_participation.status,v_remaining,false;
end;$$;

create or replace function public.operator_cancel_participant(p_match_id uuid,p_user_id uuid)
returns table(participation_id uuid,match_id uuid,user_id uuid,participation_status text)
language plpgsql security definer set search_path='public','pg_temp' as $$
declare v_operator_id uuid:=auth.uid();v_participation public.participations%rowtype;v_match public.matches%rowtype;v_position text;
begin
  if v_operator_id is null then raise exception 'AUTH_REQUIRED' using errcode='28000'; end if;
  if not exists(select 1 from public.operators o where o.user_id=v_operator_id) then raise exception 'OPERATOR_REQUIRED' using errcode='42501'; end if;
  select * into v_match from public.matches m where m.id=p_match_id for update;if v_match.id is null then raise exception 'MATCH_NOT_FOUND' using errcode='P0002';end if;
  select * into v_participation from public.participations p where p.match_id=p_match_id and p.user_id=p_user_id for update;
  if v_participation.id is null then raise exception 'PARTICIPATION_NOT_FOUND' using errcode='P0002';end if;
  if v_participation.status='canceled' then return query select v_participation.id,p_match_id,p_user_id,v_participation.status;return;end if;
  v_position:=v_participation.position;
  update public.participations p set status='canceled',canceled_at=now() where p.id=v_participation.id;
  if v_position is not null then update public.match_slots s set joined_count=greatest(s.joined_count-1,0) where s.match_id=p_match_id and s.position=v_position;end if;
  update public.matches m set joined_count=greatest(m.joined_count-1,0),status=case when m.status in('canceled','completed','draft') then m.status else 'open' end where m.id=p_match_id;
  if v_position is not null then perform public.promote_beta_waitlist_for_slot(p_match_id,v_position); end if;
  return query select v_participation.id,p_match_id,p_user_id,'canceled'::text;
end;$$;

create or replace function public.operator_cancel_match(p_match_id uuid)
returns table(match_id uuid,match_status text,canceled_participants integer)
language plpgsql security definer set search_path='public','pg_temp' as $$
declare v_user_id uuid:=auth.uid();v_match public.matches%rowtype;v_count integer:=0;
begin
  if v_user_id is null then raise exception 'AUTH_REQUIRED' using errcode='28000';end if;
  if not exists(select 1 from public.operators o where o.user_id=v_user_id) then raise exception 'OPERATOR_REQUIRED' using errcode='42501';end if;
  select * into v_match from public.matches m where m.id=p_match_id for update;if v_match.id is null then raise exception 'MATCH_NOT_FOUND' using errcode='P0002';end if;
  if v_match.status='completed' then raise exception 'MATCH_NOT_CANCELABLE' using errcode='P0001';end if;
  if v_match.status='canceled' then return query select v_match.id,v_match.status,0;return;end if;
  update public.beta_waitlist set status='canceled',canceled_at=now() where match_id=p_match_id and status='queued';
  update public.participations p set status='canceled',canceled_at=now() where p.match_id=p_match_id and p.status='confirmed';get diagnostics v_count=row_count;
  update public.match_slots s set joined_count=0 where s.match_id=p_match_id;
  update public.matches m set joined_count=0,status='canceled' where m.id=p_match_id;
  return query select p_match_id,'canceled'::text,v_count;
end;$$;

create or replace function public.submit_beta_match_feedback(p_match_id uuid,p_difficulty integer,p_satisfaction integer,p_repeat_intent boolean,p_note text default null)
returns public.beta_match_feedback
language plpgsql security definer set search_path='public','pg_temp' as $$
declare v_user uuid:=auth.uid();v_part public.participations%rowtype;v_match public.matches%rowtype;v_row public.beta_match_feedback%rowtype;
begin
  if v_user is null then raise exception 'AUTH_REQUIRED' using errcode='28000';end if;
  if p_difficulty not between 1 and 5 or p_satisfaction not between 1 and 5 then raise exception 'INVALID_FEEDBACK_SCORE' using errcode='22023';end if;
  if char_length(coalesce(p_note,''))>500 then raise exception 'FEEDBACK_NOTE_TOO_LONG' using errcode='22023';end if;
  select p.* into v_part from public.participations p where p.match_id=p_match_id and p.user_id=v_user and p.status='confirmed';
  if v_part.id is null or v_part.checked_in_at is null then raise exception 'CHECKED_IN_PARTICIPATION_REQUIRED' using errcode='P0001';end if;
  select m.* into v_match from public.matches m where m.id=p_match_id;
  if v_match.status<>'completed' then raise exception 'MATCH_NOT_COMPLETED' using errcode='P0001';end if;
  insert into public.beta_match_feedback(participation_id,match_id,user_id,difficulty,satisfaction,repeat_intent,note)
  values(v_part.id,p_match_id,v_user,p_difficulty,p_satisfaction,p_repeat_intent,nullif(btrim(coalesce(p_note,'')),''))
  on conflict(participation_id) do update set difficulty=excluded.difficulty,satisfaction=excluded.satisfaction,repeat_intent=excluded.repeat_intent,note=excluded.note,updated_at=now()
  returning * into v_row;
  insert into public.beta_operation_events(event_type,actor_id,subject_user_id,match_id,participation_id,position,details)
  values('match.feedback_submitted',v_user,v_user,p_match_id,v_part.id,v_part.position,jsonb_build_object('difficulty',p_difficulty,'satisfaction',p_satisfaction,'repeat_intent',p_repeat_intent));
  return v_row;
end;$$;
grant execute on function public.submit_beta_match_feedback(uuid,integer,integer,boolean,text) to authenticated;
revoke execute on function public.submit_beta_match_feedback(uuid,integer,integer,boolean,text) from anon;

create or replace function public.generate_beta_match_reminders()
returns table(reminder_type text,created_count integer)
language plpgsql security definer set search_path='public','pg_temp' as $$
declare v_24 integer:=0;v_2 integer:=0;
begin
  with candidates as (
    select p.id,p.user_id,p.match_id from public.participations p join public.matches m on m.id=p.match_id
    where p.status='confirmed' and m.status in('open','full') and m.starts_at>now()+interval '2 hours' and m.starts_at<=now()+interval '24 hours'
  ), marks as (
    insert into public.beta_match_reminder_marks(participation_id,reminder_type)
    select id,'24h' from candidates on conflict do nothing returning participation_id
  ), ins as (
    insert into public.beta_notifications(user_id,event_type,match_id,participation_id,title,body)
    select c.user_id,'match.reminder_24h',c.match_id,c.id,'경기가 하루 안에 시작됩니다','참가 경기 시작이 24시간 이내로 다가왔습니다. 시간과 장소를 다시 확인해주세요.' from candidates c join marks m on m.participation_id=c.id returning 1
  ) select count(*)::integer into v_24 from ins;
  with candidates as (
    select p.id,p.user_id,p.match_id from public.participations p join public.matches m on m.id=p.match_id
    where p.status='confirmed' and m.status in('open','full') and m.starts_at>now() and m.starts_at<=now()+interval '2 hours'
  ), marks as (
    insert into public.beta_match_reminder_marks(participation_id,reminder_type)
    select id,'2h' from candidates on conflict do nothing returning participation_id
  ), ins as (
    insert into public.beta_notifications(user_id,event_type,match_id,participation_id,title,body)
    select c.user_id,'match.reminder_2h',c.match_id,c.id,'경기 시작이 가까워졌습니다','참가 경기 시작이 2시간 이내입니다. 이동과 체크인 준비를 확인해주세요.' from candidates c join marks m on m.participation_id=c.id returning 1
  ) select count(*)::integer into v_2 from ins;
  return query values('24h',v_24),('2h',v_2);
end;$$;
revoke execute on function public.generate_beta_match_reminders() from public,anon,authenticated;
grant execute on function public.generate_beta_match_reminders() to service_role;

-- Small-Beta live change signals. Clients re-fetch authoritative rows after each event.
do $$ begin
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='beta_notifications') then alter publication supabase_realtime add table public.beta_notifications; end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='beta_waitlist') then alter publication supabase_realtime add table public.beta_waitlist; end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='beta_match_feedback') then alter publication supabase_realtime add table public.beta_match_feedback; end if;
end $$;

select cron.unschedule(jobid) from cron.job where jobname='footmate-beta-match-reminders';
select cron.schedule('footmate-beta-match-reminders','*/5 * * * *',$$select public.generate_beta_match_reminders();$$);

commit;
