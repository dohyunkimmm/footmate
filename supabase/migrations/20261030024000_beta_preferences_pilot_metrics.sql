-- Account-scoped recommendation settings. No guest/demo persistence and no anonymous Data API access.
create table if not exists public.beta_user_preferences (
 user_id uuid primary key references auth.users(id) on delete cascade,
 preferences jsonb not null check (jsonb_typeof(preferences)='object' and octet_length(preferences::text)<=2048),
 updated_at timestamptz not null default now()
);
alter table public.beta_user_preferences enable row level security;
revoke all on public.beta_user_preferences from public, anon, authenticated;
grant select, insert, update on public.beta_user_preferences to authenticated;
drop policy if exists beta_user_preferences_read_own on public.beta_user_preferences;
create policy beta_user_preferences_read_own on public.beta_user_preferences
 for select to authenticated using (user_id=(select auth.uid()));
drop policy if exists beta_user_preferences_insert_own on public.beta_user_preferences;
create policy beta_user_preferences_insert_own on public.beta_user_preferences
 for insert to authenticated with check (user_id=(select auth.uid()));
drop policy if exists beta_user_preferences_update_own on public.beta_user_preferences;
create policy beta_user_preferences_update_own on public.beta_user_preferences
 for update to authenticated using (user_id=(select auth.uid()))
 with check (user_id=(select auth.uid()));

-- Pilot-only cohort baselines, never expose per-user events to operators.
-- AAL2 operator guard comes before reading privileged data.
create or replace function public.operator_discovery_kpi_baseline(
 p_since timestamptz default (now()-interval '7 days')
)
returns table (
 metric_name text,
 numerator bigint,
 denominator bigint,
 eligible_users bigint,
 rate_percent numeric,
 window_start timestamptz,
 window_end timestamptz
)
language plpgsql security definer
set search_path=public,pg_temp
as $$
declare
 v_since timestamptz := greatest(least(coalesce(p_since,now()-interval '7 days'),now()),now()-interval '90 days');
 v_end timestamptz := now();
 v_users bigint;
begin
 perform public.require_beta_operator_aal2();

 select count(*) into v_users
 from public.discovery_cohorts c
 join public.discovery_consents consent on consent.user_id=c.user_id and consent.enabled
 where c.cohort='pilot'
 and not exists(select 1 from public.operators o where o.user_id=c.user_id);

 return query
 with eligible as (
  select c.user_id
  from public.discovery_cohorts c
  join public.discovery_consents consent on consent.user_id=c.user_id and consent.enabled
  where c.cohort='pilot'
  and not exists(select 1 from public.operators o where o.user_id=c.user_id)
 ), events as (
  select e.user_id,e.session_id,e.event_name,e.match_id,e.result_count,e.occurred_at
  from public.discovery_events e
  join eligible p on p.user_id=e.user_id
  where e.occurred_at>=v_since and e.occurred_at<v_end
 ), views as (
  select distinct on (user_id,session_id)
   user_id,session_id,occurred_at
  from events where event_name='recommendation_viewed'
  order by user_id,session_id,occurred_at
 ), detail_sessions as (
  select distinct on (user_id,session_id,match_id)
   user_id,session_id,match_id,occurred_at
  from events where event_name='match_detail_opened' and match_id is not null
  order by user_id,session_id,match_id,occurred_at
 ), totals as (
  select 'search_to_detail'::text name,
   (select count(*) from views v where exists (
    select 1 from events d where d.user_id=v.user_id and d.session_id=v.session_id
    and d.event_name='match_detail_opened' and d.occurred_at>=v.occurred_at
   ))::bigint n,
   (select count(*) from views)::bigint d
  union all
  select 'zero_result',count(*) filter(where result_count=0)::bigint,count(*)::bigint
  from events where event_name='recommendation_completed' and result_count is not null
  union all
  select 'detail_to_join',
   (select count(*) from detail_sessions d where exists (
    select 1 from events j where j.user_id=d.user_id and j.session_id=d.session_id
    and j.match_id=d.match_id and j.event_name='join_succeeded'
    and j.occurred_at>=d.occurred_at and j.occurred_at<d.occurred_at+interval '24 hours'
   ))::bigint,
   (select count(*) from detail_sessions)::bigint
 )
 select totals.name,
  case when v_users>=5 and totals.d>=5 then totals.n else null end,
  case when v_users>=5 and totals.d>=5 then totals.d else null end,
  case when v_users>=5 then v_users else null end,
  case when v_users>=5 and totals.d>=5 then round(100.0*totals.n/nullif(totals.d,0),2) else null end,
  v_since,v_end
 from totals;
end; $$;
revoke all on function public.operator_discovery_kpi_baseline(timestamptz) from public,anon;
grant execute on function public.operator_discovery_kpi_baseline(timestamptz) to authenticated;
