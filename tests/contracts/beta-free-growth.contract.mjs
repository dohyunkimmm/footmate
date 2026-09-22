import fs from 'node:fs';
import assert from 'node:assert/strict';

const migration=fs.readFileSync('supabase/migrations/20260921_beta_free_growth.sql','utf8');
const hotfix=fs.readFileSync('supabase/migrations/20260922_beta_push_cancel_hotfix.sql','utf8');
const growth=fs.readFileSync('src/v5/beta-growth.js','utf8');
const html=fs.readFileSync('beta.html','utf8');

for(const token of [
  'create table if not exists public.beta_waitlist',
  'create table if not exists public.beta_match_feedback',
  'create table if not exists public.beta_match_reminder_marks',
  'join_beta_waitlist',
  'cancel_beta_waitlist',
  'promote_beta_waitlist_for_slot',
  "'participation.waitlist_promoted'",
  'submit_beta_match_feedback',
  'generate_beta_match_reminders',
  "cron.schedule('footmate-beta-match-reminders'",
  'alter publication supabase_realtime add table public.beta_notifications',
  'alter publication supabase_realtime add table public.beta_waitlist',
  'alter publication supabase_realtime add table public.beta_match_feedback'
]) assert.ok(migration.includes(token),`missing growth migration contract: ${token}`);

assert.ok(migration.includes('for update skip locked'),'waitlist promotion must claim oldest queued row atomically');
assert.ok(migration.includes('transaction_timestamp()'),'waitlist promotion must be distinguishable inside the participation trigger transaction');
assert.ok(migration.includes("perform public.promote_beta_waitlist_for_slot(p_match_id,v_position)"),'user/operator participant cancellation must refill from waitlist');
assert.ok(migration.includes("update public.beta_waitlist set status='canceled'"),'match cancellation must cancel queued waitlist rows');
assert.ok(migration.includes("if v_match.status<>'completed' then raise exception 'MATCH_NOT_COMPLETED'"),'feedback requires a completed real match');
assert.ok(migration.includes("v_part.checked_in_at is null"),'feedback requires a real check-in');

assert.ok(hotfix.includes('create or replace function public.operator_cancel_match(p_match_id uuid)'),'hotfix must replace operator match cancellation');
assert.ok(hotfix.includes('perform public.require_beta_operator_aal2()'),'operator match cancellation must preserve AAL2 enforcement');
assert.ok(hotfix.includes("update public.beta_waitlist w\n  set status='canceled',canceled_at=now()\n  where w.match_id=p_match_id and w.status='queued'"),'waitlist cancellation must qualify match_id against the table alias');
assert.ok(!hotfix.includes("where match_id=p_match_id and status='queued'"),'hotfix must not reintroduce the ambiguous unqualified match_id reference');

for(const token of ['realtime/v1/websocket','postgres_changes','Live catalog','join_beta_waitlist','submit_beta_match_feedback','/api/ai-match-assistant'])
  assert.ok(growth.includes(token),`missing browser growth contract: ${token}`);
assert.ok(!growth.includes('Math.random'),'live recommendation must remain deterministic');
assert.ok(html.includes('/src/v5/beta-growth.css?v=1'));
assert.ok(html.includes("import('/src/v5/beta-growth.js?v=1')"));

console.log('beta free growth contracts: PASS');
