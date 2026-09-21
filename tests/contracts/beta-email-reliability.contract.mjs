import assert from 'node:assert/strict';
import fs from 'node:fs';

const migration=fs.readFileSync('supabase/migrations/20260921_beta_email_reliability.sql','utf8');
const schedule=fs.readFileSync('supabase/migrations/20260921_beta_email_worker_schedule.sql','utf8');
const userSender=fs.readFileSync('supabase/functions/send-beta-notification-email/index.ts','utf8');
const worker=fs.readFileSync('supabase/functions/process-beta-email-outbox/index.ts','utf8');
const webhook=fs.readFileSync('supabase/functions/resend-beta-email-webhook/index.ts','utf8');
const client=fs.readFileSync('src/v5/infrastructure/supabase-beta-readiness.js','utf8');
const operator=fs.readFileSync('src/v5/beta-operator-readiness.js','utf8');

for(const column of ['email_next_attempt_at','email_claimed_at','email_claim_token','email_delivery_status','email_delivery_updated_at'])assert.match(migration,new RegExp(column));
assert.match(migration,/email_status in \('pending','processing','sent','failed','skipped'\)/);
assert.match(migration,/function public\.claim_beta_notification_emails/);
assert.match(migration,/for update skip locked/i);
assert.match(migration,/email_attempts < 5/);
assert.match(migration,/email_claimed_at < now\(\) - interval '10 minutes'/);
assert.match(migration,/grant execute on function public\.claim_beta_notification_emails[\s\S]*to service_role/i);
assert.match(migration,/function public\.record_beta_email_delivery/);
assert.match(migration,/footmate_beta_email_worker_token/);
assert.match(migration,/extensions\.gen_random_bytes\(32\)/);
assert.match(migration,/get_resend_webhook_signing_secret/);
assert.match(migration,/operator_beta_email_health/);
assert.match(migration,/operator_retry_beta_notification_email/);
assert.match(migration,/operator_beta_funnel_metrics/);

assert.match(schedule,/create extension if not exists pg_net/);
assert.match(schedule,/create extension if not exists pg_cron/);
assert.match(schedule,/cron\.schedule/);
assert.match(schedule,/footmate-beta-email-outbox/);
assert.match(schedule,/net\.http_post/);
assert.match(schedule,/x-footmate-worker-token/);
assert.match(schedule,/process-beta-email-outbox/);

for(const source of [userSender,worker]){
  assert.match(source,/claim_beta_notification_emails/);
  assert.match(source,/email_claim_token/);
  assert.match(source,/MAX_ATTEMPTS=5/);
  assert.match(source,/BACKOFF_SECONDS=\[60,300,900,3600\]/);
  assert.match(source,/idempotency-key/);
  assert.match(source,/email_delivery_status:'accepted'/);
  assert.match(source,/DOCTYPE html/);
  assert.match(source,/FootMate Closed Beta 열기/);
}
assert.match(userSender,/withSupabase\(\{auth:'user'\}/);
assert.match(worker,/withSupabase\(\{auth:'none'\}/);
assert.match(worker,/get_beta_email_worker_token/);
assert.match(worker,/constantEqual/);
assert.match(worker,/WORKER_AUTH_INVALID/);

assert.match(webhook,/withSupabase\(\{auth:'none'\}/);
assert.match(webhook,/svix-id/);
assert.match(webhook,/svix-timestamp/);
assert.match(webhook,/svix-signature/);
assert.match(webhook,/crypto\.subtle\.sign/);
assert.match(webhook,/MAX_CLOCK_SKEW_SECONDS=300/);
assert.match(webhook,/record_beta_email_delivery/);
for(const event of ['email.delivered','email.delivery_delayed','email.bounced','email.complained','email.suppressed','email.failed'])assert.ok(webhook.includes(`'${event}'`));

assert.match(client,/operator_beta_email_health/);
assert.match(client,/operator_retry_beta_notification_email/);
assert.match(client,/operator_beta_funnel_metrics/);
assert.match(operator,/Transactional email 운영 상태/);
assert.match(operator,/data-readiness-action="retry-email"/);
assert.match(operator,/서버 worker가 자동으로 처리합니다/);

console.log('beta email reliability contracts PASS');
