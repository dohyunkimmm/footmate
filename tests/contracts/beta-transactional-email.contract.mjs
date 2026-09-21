import assert from 'node:assert/strict';
import fs from 'node:fs';

const migration=fs.readFileSync('supabase/migrations/20260921_beta_transactional_email.sql','utf8');
const edge=fs.readFileSync('supabase/functions/send-beta-notification-email/index.ts','utf8');
const client=fs.readFileSync('src/v5/infrastructure/supabase-beta-readiness.js','utf8');
const beta=fs.readFileSync('src/v5/beta-readiness.js','utf8');
const operator=fs.readFileSync('src/v5/beta-operator-readiness.js','utf8');

for(const column of ['email_status','email_attempts','email_last_attempt_at','email_sent_at','email_message_id','email_last_error']){
  assert.match(migration,new RegExp(column));
}
assert.match(migration,/email_status in \('pending','sent','failed','skipped'\)/);
assert.match(migration,/set email_status = 'skipped'/);
assert.match(migration,/alter column email_status set default 'pending'/);
assert.match(migration,/beta_notifications_email_pending_idx/);

assert.match(edge,/withSupabase\(\{auth:'user'\}/);
assert.match(edge,/Deno\.env\.get\('RESEND_API_KEY'\)/);
assert.match(edge,/https:\/\/api\.resend\.com\/emails/);
assert.match(edge,/idempotency-key/);
assert.match(edge,/footmate-beta-notification-\$\{row\.id\}/);
assert.match(edge,/email_status:'sent'/);
assert.match(edge,/email_status:'failed'/);
assert.match(edge,/operators/);
assert.match(edge,/EMAIL_PROVIDER_NOT_CONFIGURED/);

assert.match(client,/\/functions\/v1\/send-beta-notification-email/);
assert.match(client,/dispatchNotificationEmailBestEffort/);
assert.match(client,/notifications=Object\.freeze/);
assert.match(client,/dispatchEmail:args=>dispatchNotificationEmailBestEffort\(args\)/);
assert.match(client,/checkIn:async/);
assert.match(client,/checkInParticipant:async/);

assert.match(beta,/scheduleOwnEmailDispatch/);
assert.match(beta,/baseAction==='join'\|\|baseAction==='cancel'/);
assert.match(operator,/scheduleMatchEmailDispatch/);
assert.match(operator,/baseAction==='cancel-participant'\|\|baseAction==='cancel-match'/);

console.log('beta transactional email contracts PASS');
