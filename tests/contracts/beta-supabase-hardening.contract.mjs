import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const migration=await readFile(new URL('../../supabase/migrations/20260920223306_supabase_hardening.sql',import.meta.url),'utf8');

for(const required of [
  'alter function public.touch_updated_at()',
  'set search_path = public, pg_temp',
  'revoke execute on function public.handle_new_user() from public, anon, authenticated',
  "to_regprocedure('public.rls_auto_enable()')",
  'revoke execute on function public.rls_auto_enable() from public, anon, authenticated',
  'create index if not exists matches_created_by_idx',
  'using (id = (select auth.uid()))',
  'using (user_id = (select auth.uid()))',
  'create policy matches_operator_insert',
  'create policy matches_operator_update',
  'create policy matches_operator_delete',
  'create policy match_slots_operator_insert',
  'create policy match_slots_operator_update',
  'create policy match_slots_operator_delete'
])assert.ok(migration.includes(required),`missing Supabase hardening contract: ${required}`);

assert.ok(!migration.includes('service_role'),'service-role credentials must not be embedded in hardening migration');
assert.ok(!migration.includes('for all\nto authenticated'),'operator write policy must not overlap public SELECT');


const readOnlyAudit=await readFile(new URL('../database/rls-advisor-readonly.sql',import.meta.url),'utf8');
for(const required of [
  "n.nspname = 'public'",
  "has_function_privilege('authenticated', p.oid, 'EXECUTE')",
  "has_function_privilege('anon', oid, 'EXECUTE')",
  "aclexplode(coalesce(proacl, acldefault('f', proowner)))",
  "position('require_beta_operator_aal2' in definition)",
  "'rls_policies_direct_jwt_call'",
  "'matches', 'match_slots', 'participations'",
  "'profiles', 'beta_operation_events'"
])assert.ok(readOnlyAudit.includes(required),`missing read-only RLS audit contract: ${required}`);
assert.doesNotMatch(readOnlyAudit,/^\s*(?:insert|update|delete|alter|drop|create|truncate|grant|revoke|execute|call|do|begin|commit)\b/im,
  'advisor triage must remain read-only and must not mutate production schema');


const jwtMigration=await readFile(new URL('../../supabase/migrations/20261027122602_optimize_beta_operator_rls_jwt.sql',import.meta.url),'utf8');
const expectedJwtPolicies=[
  'beta_operation_events_operator_read',
  'match_slots_authenticated_read',
  'match_slots_operator_delete',
  'match_slots_operator_insert',
  'match_slots_operator_update',
  'matches_authenticated_read',
  'matches_operator_delete',
  'matches_operator_insert',
  'matches_operator_update',
  'participations_authenticated_read',
  'profiles_authenticated_read'
];
assert.equal((jwtMigration.match(/^alter policy /gm)||[]).length,expectedJwtPolicies.length,
  'JWT performance migration must touch exactly 11 existing policies');
for(const name of expectedJwtPolicies)
  assert.ok(jwtMigration.includes('alter policy "'+name+'" on public.'),
    'JWT performance migration must preserve policy name: '+name);
assert.match(jwtMigration,/set local lock_timeout/);
assert.match(jwtMigration,/RLS_INITPLAN_PRECONDITION_FAILED/);
assert.match(jwtMigration,/RLS_INITPLAN_POSTCONDITION_FAILED/);
assert.match(jwtMigration,/\(select auth\.jwt\(\)\)/,
  'JWT helper must be statement-cached');
assert.doesNotMatch(jwtMigration,/^\s*(?:drop policy|create policy|grant|revoke|alter table|create function)\b/im,
  'JWT performance migration may not replace policies or alter grants');
assert.match(jwtMigration,/^commit;\s*$/m);

const rlsRoleQA=await readFile(new URL('../database/rls-operator-readonly-roles.sql',import.meta.url),'utf8');
assert.match(rlsRoleQA,/^begin read only;/m);
assert.match(rlsRoleQA,/^rollback;/m);
for(const required of ['set local role anon','set local role authenticated',
  "'aal', 'aal1'","'aal', 'aal2'",'RLS_QA_OPERATOR_AAL1_GUARD_BYPASS',
  'RLS_QA_OPERATOR_AAL2_PROFILE_ACCESS_CHANGED',
  'RLS_QA_MEMBER_AAL2_OPERATOR_GUARD_BYPASS','RLS_QA_PARTICIPANT_AAL1_OWNERSHIP_CHANGED'
])assert.ok(rlsRoleQA.includes(required),'missing read-only RLS role QA: '+required);
assert.doesNotMatch(rlsRoleQA,/^\s*(?:insert|update|delete|alter|drop|create|truncate|grant|revoke)\b/im,
  'RLS role QA must not mutate the database');


const rpcGuards=await readFile(new URL('../database/definer-rpc-readonly-guards.sql',import.meta.url),'utf8');
assert.match(rpcGuards,/^begin read only;/im);
assert.match(rpcGuards,/^rollback;/im);
for(const required of [
  "has_function_privilege('anon',p.oid,'EXECUTE')",
  "current_user<>'authenticated'",
  "'nonoperator_aal2','qa.member_uid','aal2','OPERATOR_REQUIRED'",
  "'operator_aal1','qa.operator_uid','aal1','MFA_REQUIRED'",
  "'QA_MISSING_UID_COUNT:%'",
  "'AUTH_REQUIRED'",
  "public.discovery_event_budget_available() is distinct from false",
  "if total<>21 or exposed<>0 or bad_paths<>0",
  "if rejected<>11",
  "if rejected<>8"
])assert.ok(rpcGuards.includes(required),'missing Definer RPC read-only assertion: '+required);
assert.doesNotMatch(rpcGuards,/^\s*(?:insert|update|delete|alter|drop|create|truncate|grant|revoke)\b/im,
  'Definer RPC negative tests must remain read-only and must not mutate production state');


const pgNetReadOnly=await readFile(new URL('../database/pgnet-boundary-readonly.sql',import.meta.url),'utf8');
assert.match(pgNetReadOnly,/^begin read only;/im);
assert.match(pgNetReadOnly,/^rollback;/im);
assert.match(pgNetReadOnly,/^set local statement_timeout/im);
for(const required of [
  "'footmate-beta-email-outbox'",
  "'footmate-beta-push-outbox'",
  "'footmate-beta-match-reminders'",
  "active and username='postgres'",
  "'configure_beta_email_worker_schedule'",
  "'configure_beta_push_worker_schedule'",
  "not has_function_privilege('anon',p.oid,'EXECUTE')",
  "'anon','authenticated'",
  "has_function_privilege('anon',p.oid,'EXECUTE')"
])assert.ok(pgNetReadOnly.includes(required),'missing pg_net read-only audit: '+required);
assert.doesNotMatch(pgNetReadOnly,/^\s*(?:insert|update|delete|alter|drop|create|truncate|grant|revoke|call|execute)\b/im,
  'pg_net audit must not alter privileges, worker state or queued requests');
assert.doesNotMatch(pgNetReadOnly,/net\.http_(?:get|post|delete)\s*\(/i,
  'pg_net read-only audit must not send outbound HTTP requests');

const branchManifest=await readFile(new URL('../../docs/BRANCH-REFS-2026-10-28.csv',import.meta.url),'utf8');
const branchLines=branchManifest.trim().split('\n');
assert.equal(branchLines.shift(),'branch,head_sha,protected');
assert.equal(branchLines.length,122,'branch snapshot must retain all 122 observed refs');
const branchRefs=new Map();
for(const line of branchLines){
  const match=/^"([^"]+)","([0-9a-f]{40})","(true|false)"$/.exec(line);
  assert.ok(match,'malformed immutable ref snapshot row');
  assert.ok(!branchRefs.has(match[1]),'duplicate branch snapshot ref');
  branchRefs.set(match[1],{sha:match[2],protected:match[3]==='true'});
}
assert.equal(branchRefs.get('main')?.protected,true);
assert.equal(branchRefs.get('docs/compact-demo-release-654')?.sha,
  '81819f79d011f084c2f1aaf87d398aacae089438');

console.log('PASS beta Supabase hardening contracts');
