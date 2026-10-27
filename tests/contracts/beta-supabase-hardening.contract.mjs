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


const jwtMigration=await readFile(new URL('../../supabase/migrations/20261027121500_optimize_beta_operator_rls_jwt.sql',import.meta.url),'utf8');
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

console.log('PASS beta Supabase hardening contracts');
