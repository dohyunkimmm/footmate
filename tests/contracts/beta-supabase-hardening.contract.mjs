import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const migration=await readFile(new URL('../../supabase/migrations/20260920_supabase_hardening.sql',import.meta.url),'utf8');

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

console.log('PASS beta Supabase hardening contracts');
