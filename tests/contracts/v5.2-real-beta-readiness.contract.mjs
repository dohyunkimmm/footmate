import assert from 'node:assert/strict';
import fs from 'node:fs';

// Branch protection keeps the historical required check name "Regression 36" while this file adds the v5.2 contract.
const migration=fs.readFileSync('supabase/migrations/20260921_v5_2_real_beta_readiness.sql','utf8');
const notificationIndexMigration=fs.readFileSync('supabase/migrations/20260921_v5_2_notification_fk_index.sql','utf8');
const operatorCheckInFix=fs.readFileSync('supabase/migrations/20260921_operator_check_in_ambiguity_fix.sql','utf8');
const client=fs.readFileSync('src/v5/infrastructure/supabase-beta-readiness.js','utf8');
const beta=fs.readFileSync('src/v5/beta-readiness.js','utf8');
const operator=fs.readFileSync('src/v5/beta-operator-readiness.js','utf8');
const betaBootstrap=fs.readFileSync('src/v5/beta-recovery-bootstrap.js','utf8');
const betaHtml=fs.readFileSync('beta.html','utf8');
const operatorHtml=fs.readFileSync('beta-operator.html','utf8');

for(const column of ['cancel_cutoff_at','check_in_opens_at','checked_in_at'])assert.match(migration,new RegExp(column));
for(const rpc of ['check_in_participation','operator_check_in_participant','operator_complete_match','mark_beta_notification_read','operator_save_match_v2'])assert.match(migration,new RegExp(`function public\\.${rpc}`));
assert.match(migration,/create table if not exists public\.beta_notifications/);
assert.match(migration,/beta_notifications_select_own/);
assert.match(migration,/JOIN_CLOSED/);
assert.match(migration,/CANCELLATION_CLOSED/);
assert.match(migration,/CHECKIN_NOT_OPEN/);
assert.match(migration,/CANCEL_CUTOFF_REQUIRED/);
assert.match(migration,/CHECKIN_OPEN_REQUIRED/);
assert.match(migration,/revoke execute on function public\.operator_save_match_v2/);
assert.match(migration,/grant execute on function public\.operator_save_match_v2[\s\S]*to authenticated/);
assert.match(migration,/exists \(select 1 from public\.operators o where o\.user_id = v_user_id\)/);
assert.match(notificationIndexMigration,/create index if not exists beta_notifications_participation_idx/);
assert.match(notificationIndexMigration,/on public\.beta_notifications\(participation_id\)/);
assert.match(notificationIndexMigration,/where participation_id is not null/);
assert.match(operatorCheckInFix,/function public\.operator_check_in_participant\(p_match_id uuid, p_user_id uuid\)/);
assert.match(operatorCheckInFix,/update public\.participations p[\s\S]*set checked_in_at = coalesce\(p\.checked_in_at, now\(\)\)[\s\S]*where p\.id = v_participation\.id/);
assert.doesNotMatch(operatorCheckInFix,/coalesce\(checked_in_at, now\(\)\)/);

assert.match(client,/\/auth\/v1\/recover/);
assert.match(client,/\/auth\/v1\/resend/);
assert.match(client,/updatePassword/);
assert.match(client,/\/rest\/v1\/rpc\/check_in_participation/);
assert.match(client,/\/rest\/v1\/beta_notifications/);
assert.match(client,/operator_save_match_v2/);
assert.match(client,/operator_complete_match/);

assert.match(betaBootstrap,/type'\)!=='recovery'/);
assert.match(betaBootstrap,/footmate:beta:recovery:v1/);
assert.match(beta,/비밀번호 찾기/);
assert.match(beta,/가입 인증메일 다시 보내기/);
assert.match(beta,/경기 체크인/);
assert.match(beta,/취소 마감/);
assert.match(beta,/운영 알림/);
assert.match(beta,/lastRefresh=Date\.now\(\);\n\s*notice\(/);

assert.match(operator,/사용자 취소 마감/);
assert.match(operator,/체크인 오픈/);
assert.match(operator,/현장 체크인/);
assert.match(operator,/경기 종료 처리/);
assert.match(operator,/stopImmediatePropagation/);

assert.match(betaHtml,/beta-recovery-bootstrap\.js/);
assert.ok(betaHtml.indexOf('beta-recovery-bootstrap.js')<betaHtml.indexOf('beta.js'));
assert.match(betaHtml,/import\('\/src\/v5\/beta-readiness\.js\?v=1'\)/);
assert.match(betaHtml,/data-beta-state/);
assert.match(operatorHtml,/import\('\/src\/v5\/beta-operator-readiness\.js\?v=1'\)/);
assert.match(operatorHtml,/data-operator-state/);

console.log('v5.2 real beta readiness contracts PASS');
