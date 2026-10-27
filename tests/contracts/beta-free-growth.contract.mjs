import fs from 'node:fs';
import assert from 'node:assert/strict';

const migration=fs.readFileSync('supabase/migrations/20260921143648_beta_free_growth.sql','utf8');
const hotfix=fs.readFileSync('supabase/migrations/20260922035936_beta_push_cancel_hotfix.sql','utf8');
const fkIndexMigration=fs.readFileSync('supabase/migrations/20261012003739_beta_fk_index_hardening_20261012.sql','utf8');
const growth=fs.readFileSync('src/beta/growth.js','utf8');
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

for(const token of ['realtime/v1/websocket','postgres_changes','matchesConstraint','join_beta_waitlist','submit_beta_match_feedback','/api/ai-match-assistant'])
  assert.ok(growth.includes(token),`missing browser growth contract: ${token}`);
assert.ok(!growth.includes('Math.random'),'live recommendation must remain deterministic');
assert.ok(html.includes('/src/beta/growth.css?v=1'));
assert.ok(html.includes("import('/src/beta/growth.js?v=8')"));


// Keep the applied advisor-driven FK indexes represented in versioned migrations.
for(const [index,table,column] of [
  ['beta_match_feedback_match_idx','beta_match_feedback','match_id'],
  ['beta_waitlist_user_idx','beta_waitlist','user_id']
]){
  assert.ok(
    new RegExp(`create index if not exists ${index}\\s+on public\\.${table} \\(\\s*${column}\\s*\\)`,'i').test(fkIndexMigration),
    `missing additive FK covering index for ${table}.${column}`
  );
}

console.log('beta free growth contracts: PASS');

// Demo fixtures must stay usable without creating live matches or participations.
const demoMemory=new Map();
globalThis.location={pathname:'/demo'};
globalThis.localStorage={getItem:key=>demoMemory.get(key)||null,setItem:(key,value)=>demoMemory.set(key,value)};
globalThis.window={dispatchEvent(){}};
const demo=await import('../../src/beta/demo-catalog.js');
const before=demo.demoCatalog('demo-user');
assert.equal(before.length,24);
assert.ok(before.every(demo.isFutsalMatch));
assert.ok(before.every(m=>m.capacity_total===(m.format_label==='5 vs 5'?10:12)));
for(const region of ['수원 · 영통','수원 · 인계','용인 · 기흥','서울 · 강남'])for(const level of ['입문','초중급','중급','중급+'])assert.ok(before.some(m=>m.region===region&&m.level===level&&new Date(new Date(m.starts_at).getTime()+9*3600000).getUTCHours()>=20));
assert.ok(before.every(m=>m.is_demo&&new Date(m.starts_at)>new Date()));
assert.ok(before.every(m=>m.capacity_total===m.match_slots.reduce((n,s)=>n+s.capacity_total,0)));
const target=before[0],spots=target.match_slots.find(s=>s.position==='MF').remaining_spots;
demo.joinDemoMatch('demo-user',target.id,'MF');
assert.equal(demo.demoParticipations('demo-user').filter(p=>p.status==='confirmed').length,1);
assert.equal(demo.demoCatalog('demo-user').find(m=>m.id===target.id).match_slots.find(s=>s.position==='MF').remaining_spots,spots-1);
assert.equal(demo.demoParticipations('other-user').length,0);
demo.cancelDemoMatch('demo-user',target.id);
assert.equal(demo.demoCatalog('demo-user').find(m=>m.id===target.id).match_slots.find(s=>s.position==='MF').remaining_spots,spots);
console.log('PASS isolated demo catalog, future dates, user-scoped join and cancellation');

