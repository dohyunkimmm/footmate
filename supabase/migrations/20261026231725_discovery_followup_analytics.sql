-- Optional authenticated discovery analytics. No anonymous writes or client-defined cohorts.
create table public.discovery_consents (
 user_id uuid primary key references auth.users(id) on delete cascade,
 enabled boolean not null default false,
 updated_at timestamptz not null default now()
);
create table public.discovery_cohorts (
 user_id uuid primary key references auth.users(id) on delete cascade,
 cohort text not null check(cohort in ('pilot','test')),
 created_at timestamptz not null default now()
);
create table public.discovery_events (
 event_id uuid primary key,
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 session_id uuid not null,
 event_name text not null check(event_name in ('entry_viewed','recommendation_requested','recommendation_completed','recommendation_viewed','recommendation_redrawn','match_detail_opened','filters_applied','reaction_submitted','join_attempt','join_succeeded','join_failed')),
 variant text not null default 'control' check(variant in ('control','quick')),
 match_id uuid references public.matches(id) on delete set null,
 result_count integer check(result_count between 0 and 1000000),
 duration_ms integer check(duration_ms between 0 and 1000000),
 mode text check(mode in ('ai','rules')),
 occurred_at timestamptz not null default now()
);
create index discovery_events_user_time_idx on public.discovery_events(user_id,occurred_at);
create index discovery_events_match_idx on public.discovery_events(match_id);
alter table public.discovery_consents enable row level security;
alter table public.discovery_cohorts enable row level security;
alter table public.discovery_events enable row level security;
revoke all on public.discovery_consents,public.discovery_cohorts,public.discovery_events from anon,authenticated;
grant select,insert,update on public.discovery_consents to authenticated;
grant select on public.discovery_cohorts to authenticated;
grant select,delete on public.discovery_events to authenticated;
grant insert(event_id,session_id,event_name,variant,match_id,result_count,duration_ms,mode) on public.discovery_events to authenticated;
create policy discovery_consents_own on public.discovery_consents for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy discovery_cohorts_read on public.discovery_cohorts for select to authenticated using(user_id=(select auth.uid()) or ((select auth.jwt()->>'aal')='aal2' and exists(select 1 from public.operators o where o.user_id=(select auth.uid()))));
create policy discovery_events_read on public.discovery_events for select to authenticated using(user_id=(select auth.uid()) or ((select auth.jwt()->>'aal')='aal2' and exists(select 1 from public.operators o where o.user_id=(select auth.uid()))));
create policy discovery_events_delete on public.discovery_events for delete to authenticated using(user_id=(select auth.uid()));
create policy discovery_events_insert on public.discovery_events for insert to authenticated with check(
 user_id=(select auth.uid())
 and exists(select 1 from public.discovery_consents c where c.user_id=(select auth.uid()) and c.enabled)
 and (event_name<>'join_succeeded' or exists(select 1 from public.participations p where p.user_id=(select auth.uid()) and p.match_id=discovery_events.match_id and p.status='confirmed'))
 and (select count(*) from public.discovery_events e where e.user_id=(select auth.uid()) and e.occurred_at>=date_trunc('day',now()))<500
);
create function public.discovery_consent_cleanup() returns trigger language plpgsql security invoker set search_path=public,pg_temp as $$
begin
 new.updated_at=now();
 if not new.enabled then delete from public.discovery_events where user_id=new.user_id; end if;
 return new;
end;$$;
revoke all on function public.discovery_consent_cleanup() from public,anon;
create trigger discovery_consent_cleanup before update on public.discovery_consents for each row execute function public.discovery_consent_cleanup();
create function public.operator_discovery_metrics(p_since timestamptz default now()-interval '7 days')
returns table(event_name text,variant text,sessions bigint,users bigint,events bigint)
language plpgsql security definer set search_path=public,pg_temp as $$
begin
 perform public.require_beta_operator_aal2();
 return query select e.event_name,e.variant,count(distinct e.session_id),count(distinct e.user_id),count(*)
 from public.discovery_events e join public.discovery_cohorts c on c.user_id=e.user_id and c.cohort='pilot'
 join public.discovery_consents consent on consent.user_id=e.user_id and consent.enabled
 where e.occurred_at>=greatest(coalesce(p_since,now()-interval '7 days'),now()-interval '90 days')
 and not exists(select 1 from public.operators o where o.user_id=e.user_id)
 group by e.event_name,e.variant;
end;$$;
revoke all on function public.operator_discovery_metrics(timestamptz) from public,anon;
grant execute on function public.operator_discovery_metrics(timestamptz) to authenticated;
