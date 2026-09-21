import fs from 'node:fs';
import assert from 'node:assert/strict';

const migration=fs.readFileSync('supabase/migrations/20260922_beta_push_media.sql','utf8');
const schedule=fs.readFileSync('supabase/migrations/20260922_beta_push_worker_schedule.sql','utf8');
const worker=fs.readFileSync('supabase/functions/process-beta-push-outbox/index.ts','utf8');
const push=fs.readFileSync('src/v5/beta-push.js','utf8');
const media=fs.readFileSync('src/v5/beta-media.js','utf8');
const sw=fs.readFileSync('beta-sw.js','utf8');
const beta=fs.readFileSync('beta.html','utf8');
const operator=fs.readFileSync('beta-operator.html','utf8');

for(const token of [
  'beta_push_subscriptions','get_beta_push_public_key','get_beta_web_push_private_key','claim_beta_notification_pushes',
  "push_status in ('pending','processing','sent','failed','skipped')",'beta-media','5242880',
  'beta_media_profile_insert','beta_media_match_insert',"auth.jwt()->>'aal'",'avatar_path','image_path'
]) assert.ok(migration.includes(token),`missing push/media migration contract: ${token}`);
assert.ok(migration.includes("(storage.foldername(name))[2]=(select auth.uid())::text"),'profile objects must be scoped to the current user folder');
assert.ok(migration.includes("coalesce(auth.jwt()->>'aal','aal1')='aal2'"),'match media writes must require operator AAL2');
assert.ok(!migration.includes('iihitfjphowjplxzfxtn'),'migration must not hard-code the Production project ref');

for(const token of ['configure_beta_push_worker_schedule','process-beta-push-outbox','footmate-beta-push-outbox','footmate_beta_email_worker_token'])
  assert.ok(schedule.includes(token),`missing push schedule contract: ${token}`);
assert.ok(schedule.includes('INVALID_SUPABASE_PROJECT_URL'));
assert.ok(!schedule.includes('iihitfjphowjplxzfxtn'),'push schedule must be environment configured');

for(const token of ['npm:web-push@3.6.7','setVapidDetails','get_beta_web_push_private_key','claim_beta_notification_pushes','beta_push_subscriptions','statusCode===404||statusCode===410'])
  assert.ok(worker.includes(token),`missing push worker contract: ${token}`);
assert.ok(!worker.includes('PRIVATE KEY'),'worker source must not contain a VAPID private key');

for(const token of ["navigator.serviceWorker.register('/beta-sw.js'",'Notification.requestPermission','pushManager.subscribe','get_beta_push_public_key','beta_push_subscriptions'])
  assert.ok(push.includes(token),`missing browser push contract: ${token}`);
assert.ok(!push.includes('get_beta_web_push_private_key'),'browser must never request the VAPID private key');

for(const token of ['/storage/v1/object/beta-media/','profiles/${userId}/avatar.','matches/${matchId}/cover.','image/jpeg','image/png','image/webp','MAX_BYTES=5*1024*1024'])
  assert.ok(media.includes(token),`missing media browser contract: ${token}`);

assert.ok(sw.includes("self.addEventListener('push'"));
assert.ok(sw.includes("self.addEventListener('notificationclick'"));
assert.ok(sw.includes('showNotification'));
assert.ok(beta.includes("import('/src/v5/beta-push.js?v=1')"));
assert.ok(beta.includes("import('/src/v5/beta-media.js?v=1')"));
assert.ok(operator.includes('/src/v5/beta-media.js?v=1'));
assert.ok(beta.includes('/src/v5/beta-enhancements.css?v=1'));
assert.ok(operator.includes('/src/v5/beta-enhancements.css?v=1'));

console.log('beta web push + media contracts: PASS');
