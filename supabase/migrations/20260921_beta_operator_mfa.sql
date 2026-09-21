begin;

create or replace function public.require_beta_operator_aal2()
returns void
language plpgsql
security definer
set search_path='public','pg_temp'
as $$
declare
  v_user_id uuid:=auth.uid();
  v_aal text:=coalesce(auth.jwt()->>'aal','aal1');
begin
  if v_user_id is null then raise exception 'AUTH_REQUIRED' using errcode='28000'; end if;
  if not exists(select 1 from public.operators o where o.user_id=v_user_id) then
    raise exception 'OPERATOR_REQUIRED' using errcode='42501';
  end if;
  if v_aal<>'aal2' then raise exception 'MFA_REQUIRED' using errcode='42501'; end if;
end;$$;
revoke execute on function public.require_beta_operator_aal2() from public,anon;
grant execute on function public.require_beta_operator_aal2() to authenticated,service_role;

drop policy if exists matches_authenticated_read on public.matches;
create policy matches_authenticated_read on public.matches
for select to authenticated using (
  status<>'draft'
  or (
    coalesce(auth.jwt()->>'aal','aal1')='aal2'
    and exists(select 1 from public.operators o where o.user_id=(select auth.uid()))
  )
);

drop policy if exists matches_operator_insert on public.matches;
create policy matches_operator_insert on public.matches for insert to authenticated
with check (coalesce(auth.jwt()->>'aal','aal1')='aal2' and exists(select 1 from public.operators o where o.user_id=(select auth.uid())));
drop policy if exists matches_operator_update on public.matches;
create policy matches_operator_update on public.matches for update to authenticated
using (coalesce(auth.jwt()->>'aal','aal1')='aal2' and exists(select 1 from public.operators o where o.user_id=(select auth.uid())))
with check (coalesce(auth.jwt()->>'aal','aal1')='aal2' and exists(select 1 from public.operators o where o.user_id=(select auth.uid())));
drop policy if exists matches_operator_delete on public.matches;
create policy matches_operator_delete on public.matches for delete to authenticated
using (coalesce(auth.jwt()->>'aal','aal1')='aal2' and exists(select 1 from public.operators o where o.user_id=(select auth.uid())));

drop policy if exists match_slots_authenticated_read on public.match_slots;
create policy match_slots_authenticated_read on public.match_slots for select to authenticated using (
  exists(select 1 from public.matches m where m.id=match_slots.match_id and m.status<>'draft')
  or (
    coalesce(auth.jwt()->>'aal','aal1')='aal2'
    and exists(select 1 from public.operators o where o.user_id=(select auth.uid()))
  )
);
drop policy if exists match_slots_operator_insert on public.match_slots;
create policy match_slots_operator_insert on public.match_slots for insert to authenticated
with check (coalesce(auth.jwt()->>'aal','aal1')='aal2' and exists(select 1 from public.operators o where o.user_id=(select auth.uid())));
drop policy if exists match_slots_operator_update on public.match_slots;
create policy match_slots_operator_update on public.match_slots for update to authenticated
using (coalesce(auth.jwt()->>'aal','aal1')='aal2' and exists(select 1 from public.operators o where o.user_id=(select auth.uid())))
with check (coalesce(auth.jwt()->>'aal','aal1')='aal2' and exists(select 1 from public.operators o where o.user_id=(select auth.uid())));
drop policy if exists match_slots_operator_delete on public.match_slots;
create policy match_slots_operator_delete on public.match_slots for delete to authenticated
using (coalesce(auth.jwt()->>'aal','aal1')='aal2' and exists(select 1 from public.operators o where o.user_id=(select auth.uid())));

drop policy if exists participations_authenticated_read on public.participations;
create policy participations_authenticated_read on public.participations for select to authenticated using (
  user_id=(select auth.uid())
  or (coalesce(auth.jwt()->>'aal','aal1')='aal2' and exists(select 1 from public.operators o where o.user_id=(select auth.uid())))
);

drop policy if exists profiles_authenticated_read on public.profiles;
create policy profiles_authenticated_read on public.profiles for select to authenticated using (
  id=(select auth.uid())
  or (coalesce(auth.jwt()->>'aal','aal1')='aal2' and exists(select 1 from public.operators o where o.user_id=(select auth.uid())))
);

drop policy if exists beta_operation_events_operator_read on public.beta_operation_events;
create policy beta_operation_events_operator_read on public.beta_operation_events for select to authenticated using (
  coalesce(auth.jwt()->>'aal','aal1')='aal2'
  and exists(select 1 from public.operators o where o.user_id=(select auth.uid()))
);

do $$
declare
  v_name text;
  v_oid oid;
  v_def text;
  v_patched text;
begin
  foreach v_name in array array[
    'operator_save_match',
    'operator_save_match_v2',
    'operator_cancel_match',
    'operator_cancel_participant',
    'operator_check_in_participant',
    'operator_complete_match',
    'operator_retry_beta_notification_email',
    'operator_beta_email_health',
    'operator_beta_funnel_metrics'
  ] loop
    for v_oid in
      select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where n.nspname='public' and p.proname=v_name
    loop
      v_def:=pg_get_functiondef(v_oid);
      if position('require_beta_operator_aal2' in v_def)=0 then
        v_patched:=regexp_replace(v_def,E'\nbegin\n',E'\nbegin\n  perform public.require_beta_operator_aal2();\n','i');
        if v_patched=v_def then
          raise exception 'MFA_GUARD_PATCH_FAILED:%',v_oid::regprocedure using errcode='P0001';
        end if;
        execute v_patched;
      end if;
      if position('require_beta_operator_aal2' in pg_get_functiondef(v_oid))=0 then
        raise exception 'MFA_GUARD_VERIFY_FAILED:%',v_oid::regprocedure using errcode='P0001';
      end if;
    end loop;
  end loop;
end $$;

commit;