import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const migration=await readFile(new URL('../../supabase/migrations/20260921_beta_operation_audit.sql',import.meta.url),'utf8');

for(const required of [
  'create table if not exists public.beta_operation_events',
  'actor_id uuid references auth.users(id) on delete set null',
  'subject_user_id uuid references auth.users(id) on delete set null',
  'alter table public.beta_operation_events enable row level security',
  'create policy beta_operation_events_operator_read',
  'revoke insert, update, delete on public.beta_operation_events from authenticated',
  'create or replace function public.audit_beta_participation_transition()',
  "v_event := 'participation.joined'",
  "v_event := 'participation.canceled'",
  "v_event := 'participation.operator_canceled'",
  'create trigger participations_beta_audit',
  'create or replace function public.audit_beta_match_transition()',
  "v_event := 'match.created'",
  "v_event := 'match.canceled'",
  'create trigger matches_beta_audit'
])assert.ok(migration.includes(required),`missing operation audit contract: ${required}`);

for(const forbidden of ['email text','display_name','service_role']){
  assert.ok(!migration.includes(forbidden),`audit migration must not persist ${forbidden}`);
}

console.log('PASS beta minimal operation audit contract');
