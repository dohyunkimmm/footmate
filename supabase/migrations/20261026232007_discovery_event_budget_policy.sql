create function public.discovery_event_budget_available() returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select auth.uid() is not null and (select count(*) from public.discovery_events e where e.user_id=(select auth.uid()) and e.occurred_at>=date_trunc('day',now()))<500;
$$;
revoke all on function public.discovery_event_budget_available() from public,anon;
grant execute on function public.discovery_event_budget_available() to authenticated;
drop policy discovery_events_insert on public.discovery_events;
create policy discovery_events_insert on public.discovery_events for insert to authenticated with check(
 user_id=(select auth.uid())
 and exists(select 1 from public.discovery_consents c where c.user_id=(select auth.uid()) and c.enabled)
 and (event_name<>'join_succeeded' or exists(select 1 from public.participations p where p.user_id=(select auth.uid()) and p.match_id=discovery_events.match_id and p.status='confirmed'))
 and (select public.discovery_event_budget_available())
);
