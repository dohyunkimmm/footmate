import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const migration=await readFile(new URL('../../supabase/migrations/20260920_beta_operator_console.sql',import.meta.url),'utf8');
const hotfix=await readFile(new URL('../../supabase/migrations/20260921_operator_save_match_conflict_fix.sql',import.meta.url),'utf8');
const adapter=await readFile(new URL('../../src/v5/infrastructure/supabase-beta.js',import.meta.url),'utf8');

for(const required of [
  'create policy profiles_authenticated_read',
  'create policy participations_authenticated_read',
  'create policy matches_anon_read',
  'create policy matches_authenticated_read',
  'create policy match_slots_anon_read',
  'create policy match_slots_authenticated_read',
  'create or replace function public.operator_save_match(',
  'create or replace function public.operator_cancel_match(',
  'create or replace function public.operator_cancel_participant(',
  "raise exception 'OPERATOR_REQUIRED'",
  "raise exception 'POSITION_CAPACITY_INCOMPLETE'",
  "raise exception 'POSITION_HAS_PARTICIPANTS'",
  'security definer',
  'set search_path = public, pg_temp',
  'grant execute on function public.operator_save_match',
  'grant execute on function public.operator_cancel_match',
  'grant execute on function public.operator_cancel_participant'
])assert.ok(migration.includes(required),`missing operator DB contract: ${required}`);

for(const required of [
  'const operator=Object.freeze({',
  'self:({accessToken})=>',
  'listMatches:({accessToken,limit=50})=>',
  'saveMatch:({accessToken,match})=>',
  'cancelMatch:({accessToken,matchId})=>',
  'listParticipants:async({accessToken,matchId})=>',
  'cancelParticipant:({accessToken,matchId,userId})=>',
  '/rest/v1/rpc/operator_save_match',
  '/rest/v1/rpc/operator_cancel_match',
  '/rest/v1/rpc/operator_cancel_participant'
])assert.ok(adapter.includes(required),`missing operator adapter contract: ${required}`);

assert.ok(!migration.includes('service_role'),'operator migration must not embed service-role credentials');
assert.ok(!adapter.includes('service_role'),'browser adapter must not use service-role credentials');
assert.ok(migration.includes("p_status not in ('draft','open')"),'operator save must restrict editable statuses');
assert.ok(migration.includes("price_krw = 0"),'closed beta operator save must keep payment disabled');
assert.ok(hotfix.includes('create or replace function public.operator_save_match('),'hotfix must replace operator save RPC');
assert.ok(hotfix.includes('on conflict on constraint match_slots_pkey'),'operator save hotfix must target the slot primary-key constraint explicitly');
assert.ok(!hotfix.includes('on conflict (match_id, position)'),'operator save hotfix must not reintroduce PL/pgSQL output-column ambiguity');

console.log('PASS beta operator console contracts');
