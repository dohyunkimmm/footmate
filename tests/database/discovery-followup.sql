-- Run transactionally with a database admin connection; all QA rows roll back.
begin;
select set_config('qa.discovery_uid',gen_random_uuid()::text,true),set_config('qa.discovery_other',gen_random_uuid()::text,true);
insert into auth.users(id,email) values(current_setting('qa.discovery_uid')::uuid,'discovery-qa@example.invalid'),(current_setting('qa.discovery_other')::uuid,'discovery-other-qa@example.invalid');
insert into public.discovery_cohorts(user_id,cohort) values(current_setting('qa.discovery_uid')::uuid,'pilot');
set local role authenticated;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('qa.discovery_uid'),'role','authenticated','aal','aal1')::text,true);
do $$begin
 begin insert into public.discovery_events(event_id,session_id,event_name) values(gen_random_uuid(),gen_random_uuid(),'entry_viewed');raise exception 'QA:no-consent write accepted';exception when insufficient_privilege then null;end;
 insert into public.discovery_consents(user_id,enabled) values(auth.uid(),true);
 begin insert into public.discovery_consents(user_id,enabled) values(current_setting('qa.discovery_other')::uuid,true);raise exception 'QA:cross-user consent accepted';exception when insufficient_privilege then null;end;
 begin insert into public.discovery_cohorts(user_id,cohort) values(auth.uid(),'pilot');raise exception 'QA:client cohort accepted';exception when insufficient_privilege then null;end;
 begin insert into public.discovery_events(event_id,session_id,event_name) values(gen_random_uuid(),gen_random_uuid(),'join_succeeded');raise exception 'QA:unverified join accepted';exception when insufficient_privilege then null;end;
 insert into public.discovery_events(event_id,session_id,event_name) values(gen_random_uuid(),gen_random_uuid(),'entry_viewed');
 if (select count(*) from public.discovery_events)<>1 then raise exception 'QA:owner read failed';end if;
 begin perform public.operator_discovery_metrics(now());raise exception 'QA:non-operator aggregate accepted';exception when others then if sqlerrm not in ('OPERATOR_REQUIRED','MFA_REQUIRED') then raise;end if;end;
end;$$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('qa.discovery_other'),'role','authenticated','aal','aal1')::text,true);
do $$begin if exists(select 1 from public.discovery_events) then raise exception 'QA:cross-user read accepted';end if;end;$$;
reset role;
insert into public.operators(user_id) values(current_setting('qa.discovery_other')::uuid);
set local role authenticated;
do $$begin
 begin perform public.operator_discovery_metrics(now());raise exception 'QA:MFA bypass';exception when others then if sqlerrm<>'MFA_REQUIRED' then raise;end if;end;
end;$$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('qa.discovery_other'),'role','authenticated','aal','aal2')::text,true);
do $$begin if (select coalesce(sum(events),0) from public.operator_discovery_metrics(now()))<>1 then raise exception 'QA:pilot aggregate incorrect';end if;end;$$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('qa.discovery_uid'),'role','authenticated','aal','aal1')::text,true);
update public.discovery_consents set enabled=false where user_id=auth.uid();
do $$begin if exists(select 1 from public.discovery_events) then raise exception 'QA:withdrawal did not delete';end if;end;$$;
set local role anon;
do $$begin begin perform * from public.discovery_events;raise exception 'QA:anonymous access accepted';exception when insufficient_privilege then null;end;end;$$;
reset role;
rollback;
