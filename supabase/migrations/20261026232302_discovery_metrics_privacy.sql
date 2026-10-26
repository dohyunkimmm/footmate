drop policy discovery_cohorts_read on public.discovery_cohorts;
create policy discovery_cohorts_read on public.discovery_cohorts for select to authenticated using(user_id=(select auth.uid()));
drop policy discovery_events_read on public.discovery_events;
create policy discovery_events_read on public.discovery_events for select to authenticated using(user_id=(select auth.uid()));
