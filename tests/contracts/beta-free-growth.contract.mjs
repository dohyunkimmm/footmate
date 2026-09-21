import fs from 'node:fs';
import assert from 'node:assert/strict';

const migration=fs.readFileSync('supabase/migrations/20260921_beta_free_growth.sql','utf8');
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
assert.ok(migration.includes("m.status='completed'"),'feedback requires a completed real match');
assert.ok(migration.includes("p.checked_in_at is null"),'feedback requires a real check-in');

for(const token of ['realtime/v1/websocket','postgres_changes','Live catalog','join_beta_waitlist','submit_beta_match_feedback','/api/ai-match-assistant'])
  assert.ok(growth.includes(token),`missing browser growth contract: ${token}`);
assert.ok(!growth.includes('Math.random'),'live recommendation must remain deterministic');
assert.ok(html.includes('/src/v5/beta-growth.css?v=1'));
assert.ok(html.includes("import('/src/v5/beta-growth.js?v=1')"));

console.log('beta free growth contracts: PASS');
