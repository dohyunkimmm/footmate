import fs from 'node:fs';
import assert from 'node:assert/strict';

const migration=fs.readFileSync('supabase/migrations/20260921_beta_operator_mfa.sql','utf8');
const beta=fs.readFileSync('beta.html','utf8');
const operator=fs.readFileSync('beta-operator.html','utf8');
const social=fs.readFileSync('src/v5/beta-social-auth.js','utf8');
const socialBootstrap=fs.readFileSync('src/v5/beta-social-auth-bootstrap.js','utf8');
const mfa=fs.readFileSync('src/v5/beta-operator-mfa.js','utf8');
const operatorPolish=fs.readFileSync('src/v5/beta-operator-polish.js','utf8');
const betaCss=fs.readFileSync('src/v5/beta.css','utf8');
const authCss=fs.readFileSync('src/v5/beta-auth.css','utf8');
const operatorCss=fs.readFileSync('src/v5/beta-operator.css','utf8');
const enhancementCss=fs.readFileSync('src/v5/beta-enhancements.css','utf8');

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
assert.ok(!migration.includes("E'\\\\nbegin"),'MFA patch must not double-escape newline sequences');

assert.ok(beta.includes('/src/v5/beta-social-auth-bootstrap.js?v=1'));
assert.ok(beta.includes("import('/src/v5/beta-social-auth.js?v=1')"));
assert.ok(social.includes('/auth/v1/settings'),'social buttons must reflect actually enabled providers');
assert.ok(social.includes('/auth/v1/authorize'),'social auth must use Supabase OAuth authorize flow');
assert.ok(social.includes('payload?.external?.google'));
assert.ok(social.includes('payload?.external?.kakao'));
assert.ok(social.includes("provider==='google'?'Google':'Kakao'"));
assert.ok(socialBootstrap.includes("params.get('type')==='recovery'"),'social callback must not steal password recovery flow');
assert.ok(socialBootstrap.includes('friendlyAuthError'),'OAuth callback errors must be normalized before they reach the user');
assert.ok(socialBootstrap.includes('소셜 로그인 연결을 완료하지 못했습니다.'),'technical OAuth exchange errors must have user-facing Korean copy');

assert.ok(operator.includes('/src/v5/beta-operator-mfa.js?v=1'));
assert.ok(!operator.includes('src="/src/v5/beta-operator.js?v=1"'),'base operator console must not load before MFA gate');
for(const token of ['/auth/v1/factors','/challenge','/verify','aal2','operatorMembership'])
  assert.ok(mfa.includes(token),`missing operator browser MFA contract: ${token}`);
assert.ok(mfa.includes("await import('/src/v5/beta-operator.js?v=1')"),'operator console loads only after MFA decision');
assert.ok(mfa.includes("await import('/src/v5/beta-operator-polish.js?v=1')"),'operator UX polish must load after the guarded console');
for(const token of ['qrImageSource','data:image/svg+xml;charset=utf-8','encodeURIComponent(raw.slice(svgStart))','설정 키 · 시간 기반(TOTP)'])
  assert.ok(mfa.includes(token),`missing safe MFA QR/fallback contract: ${token}`);
assert.ok(!mfa.includes('src="${esc(enrollment?.totp?.qr_code'), 'raw TOTP QR response must never be rendered directly as an image URL');

for(const token of ['cancelCutoffAt','checkInOpensAt','autoPolicy','-2*60*60*1000','-60*60*1000','cancel.max=offsetValue(max,-60*1000)','checkIn.max=max'])
  assert.ok(operatorPolish.includes(token),`missing operator policy polish contract: ${token}`);
assert.ok(betaCss.includes('.fm-beta-field small{'),'operator helper text must use the shared secondary-text style');
assert.ok(betaCss.includes('.fm-beta-button:focus-visible,.fm-beta-link:focus-visible'),'button/link focus visibility must be explicit');
assert.ok(betaCss.includes('.fm-beta-link{display:inline-flex;align-items:center;min-height:44px'),'text-style actions must keep a 44px touch target');
assert.ok(betaCss.includes('@media(max-width:430px)')&&betaCss.includes('.fm-beta-button{min-height:44px}'),'mobile buttons must retain the 44px touch target');
assert.ok(operatorCss.includes('.fm-operator-email-state .fm-beta-button{min-height:44px'),'operator email actions must retain the 44px touch target');
assert.ok(enhancementCss.includes('.fm-beta-media-input{width:100%;min-height:44px'),'media file controls must retain the 44px touch target');
assert.ok(authCss.includes('user-select:all'),'manual TOTP setup key must be easy to select');

console.log('beta social auth + operator MFA contracts: PASS');
