import fs from 'node:fs';
import assert from 'node:assert/strict';

const migration=fs.readFileSync('supabase/migrations/20260921_beta_operator_mfa.sql','utf8');
const beta=fs.readFileSync('beta.html','utf8');
const operator=fs.readFileSync('beta-operator.html','utf8');
const social=fs.readFileSync('src/v5/beta-social-auth.js','utf8');
const socialBootstrap=fs.readFileSync('src/v5/beta-social-auth-bootstrap.js','utf8');
const mfa=fs.readFileSync('src/v5/beta-operator-mfa.js','utf8');

for(const token of [
  'require_beta_operator_aal2',
  "auth.jwt()->>'aal'",
  "'aal2'",
  'matches_authenticated_read',
  'match_slots_authenticated_read',
  'participations_authenticated_read',
  'profiles_authenticated_read',
  'beta_operation_events_operator_read',
  'operator_save_match_v2',
  'operator_cancel_match',
  'operator_cancel_participant',
  'operator_check_in_participant',
  'operator_complete_match',
  'operator_retry_beta_notification_email',
  'operator_beta_email_health',
  'operator_beta_funnel_metrics'
]) assert.ok(migration.includes(token),`missing operator MFA contract: ${token}`);
assert.ok(migration.includes("raise exception 'MFA_REQUIRED'"),'DB must reject aal1 operator RPC access');
assert.ok(migration.includes("position('require_beta_operator_aal2' in v_def)=0"),'security-definer RPCs must be patched idempotently');
assert.ok(migration.includes('MFA_GUARD_PATCH_FAILED'),'migration must fail if an RPC definition cannot be patched');
assert.ok(migration.includes('MFA_GUARD_VERIFY_FAILED'),'migration must verify every patched RPC before commit');
assert.ok(migration.includes("position('require_beta_operator_aal2' in pg_get_functiondef(v_oid))=0"),'post-patch verification must inspect the live function definition');

assert.ok(beta.includes('/src/v5/beta-social-auth-bootstrap.js?v=1'));
assert.ok(beta.includes("import('/src/v5/beta-social-auth.js?v=1')"));
assert.ok(social.includes('/auth/v1/settings'),'social buttons must reflect actually enabled providers');
assert.ok(social.includes('/auth/v1/authorize'),'social auth must use Supabase OAuth authorize flow');
assert.ok(social.includes('payload?.external?.google'));
assert.ok(social.includes('payload?.external?.kakao'));
assert.ok(social.includes("provider==='google'?'Google':'Kakao'"));
assert.ok(socialBootstrap.includes("params.get('type')==='recovery'"),'social callback must not steal password recovery flow');

assert.ok(operator.includes('/src/v5/beta-operator-mfa.js?v=1'));
assert.ok(!operator.includes('src="/src/v5/beta-operator.js?v=1"'),'base operator console must not load before MFA gate');
for(const token of ['/auth/v1/factors','/challenge','/verify','aal2','operatorMembership'])
  assert.ok(mfa.includes(token),`missing operator browser MFA contract: ${token}`);
assert.ok(mfa.includes("await import('/src/v5/beta-operator.js?v=1')"),'operator console loads only after MFA decision');

console.log('beta social auth + operator MFA contracts: PASS');
