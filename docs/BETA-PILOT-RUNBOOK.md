# FootMate Closed Beta Pilot Runbook

이 문서는 `/beta`와 `/beta/operator`를 실제 Pilot에서 운영할 때 사용하는 최소 운영 기준이다. 일시적인 deployment ID, quota, pending 상태는 누적하지 않고 durable한 절차와 복구 기준만 유지한다.

## 1. 운영 범위

- `/beta`: Supabase Auth, Google/Kakao OAuth, profile, match, position capacity, participation, Realtime, waitlist, reminders, feedback, cancellation cutoff, check-in, in-app operation notification, transactional email, opt-in Web Push, profile media
- `/beta/operator`: allowlisted + TOTP MFA operator match/policy/participant/check-in/completion/match-media operations
- Transactional email: Supabase `beta_notifications` outbox → server Cron worker → Resend → delivery webhook
- Web Push: Service Worker + user subscription → push outbox → server worker; 사용자 브라우저/OS 권한이 있어야 실제 표시
- 현재 참가 정책: free-only
- 미연동: real PG, external analytics

## 2. Pilot 시작 전 체크

**계정·인증 경계**
- `/demo`은 브라우저-로컬 체험이고, Google/Kakao 실제 인증은 `/beta`에서 수행한다. 샘플 참가 기록은 Beta 계정으로 이전하지 않는다.
- `/beta` OAuth 제공자 진입과 인증 완료(세션 유효성)를 별도 검증한다. 공급자 로그인 페이지 도달만으로 인증 성공이라고 판단하지 않는다.
- `public.join_beta_waitlist`, `public.cancel_beta_waitlist`, `public.submit_beta_match_feedback`는 `PUBLIC/anon` EXECUTE를 철회하고 `authenticated/service_role`에만 허용한다. 익명 RPC는 401/403으로 차단하고, 운영자 MFA 및 기존 RLS는 유지한다.
- Supabase Free 플랜에는 유출 비밀번호 차단(Leaked Password Protection)이 제공되지 않는다. 유료 플랜 전환 시 Supabase Authentication → Email provider 보안 설정에서 활성화하고 Security Advisor를 재검증한다. 전환 전에는 충분히 긴 비밀번호, MFA 등 현재 이용 가능한 보호 조치를 유지한다.
- `pg_net`의 extension-in-public 경고 및 일부 `SECURITY DEFINER` 경고는 실제 의존성·권한 확인 후 별도 변경한다. 설정/스키마를 검증 없이 이동하거나 함수의 definer 속성을 제거하지 않는다.

1. 운영자 계정이 `public.operators` allowlist에 등록되어 있고 TOTP MFA(AAL2)를 통과할 수 있는지 확인한다.
2. 경기 장소·주소·시작 시간·레벨·포지션별 정원을 실제 정보로 입력한다.
3. 공개(`open`) 전 사용자 취소 마감과 체크인 오픈 시간을 확인한다. 새 경기 폼은 시작 시간 기준 취소 마감 -2h, 체크인 오픈 -1h를 기본값으로 제안하지만 운영 정책에 맞게 수정할 수 있다.
4. 포지션 정원 합계와 경기 전체 정원이 일치하는지 확인한다.
5. `/beta`에서 공개 경기와 남은 자리, 취소 마감, 체크인 상태가 정상 노출되는지 확인한다.
6. `beta_notifications`에 장기 `pending`/`failed` email/push가 없는지 확인한다.
7. Resend sending domain과 transactional email API가 정상인지 확인한다.
8. Web Push를 사용하는 Pilot이면 일반 브라우저에서 사용자가 직접 알림 권한을 허용하고 subscription 저장이 성공하는지 확인한다.

## 3. 정상 운영 흐름

`경기 생성 → 공개 → 사용자 참가 → 참가 확정 in-app/email/push → 취소 마감 → 체크인 → 경기 진행 → 경기 종료`

- 사용자가 참가하면 participation과 position/match capacity를 같은 DB transaction 경계에서 갱신한다.
- 참가/취소/체크인은 `beta_operation_events` audit trail과 `beta_notifications`를 생성한다.
- transactional email 또는 Web Push 실패가 참가 transaction 자체를 롤백시키지 않는다. 참가 상태가 Source of Truth이고 알림 채널은 별도 outbox에서 복구한다.
- 경기 종료 후에는 운영자 편집 범위를 제한한다.

## 4. 참가 취소와 운영자 조치

### 사용자 취소

- 취소 마감 전만 허용한다.
- participation을 `canceled`로 바꾸고 경기/포지션 잔여 자리를 복구한다.
- in-app notification과 transactional email을 생성한다.

### 운영자 참가 취소

- 참가자 상태와 경기/포지션 정원을 함께 갱신한다.
- `participation.operator_canceled` audit/notification 경로를 사용한다.
- 사용자에게 운영자 조치임을 구분해서 안내한다.

### 경기 전체 취소

- 운영자만 실행한다.
- confirmed participation을 취소하고 slot/match joined count를 복구한다.
- 실제 Pilot에서는 취소 대상 참가자 알림/메일 결과를 반드시 확인한다.

## 5. 체크인

- `check_in_opens_at` 이전에는 체크인을 허용하지 않는다.
- confirmed participation만 체크인할 수 있다.
- 사용자 self check-in과 operator on-site check-in은 같은 participation 상태를 Source of Truth로 사용한다.
- 체크인 완료는 audit/notification 경로에 남긴다.

## 6. Transactional email 관측

현재 durable DB 필드:

- `email_status`: outbox 처리 상태
- `email_attempts`: 처리 시도 횟수
- `email_last_attempt_at`: 마지막 시도 시각
- `email_sent_at`: Resend API accepted 시각
- `email_message_id`: Resend provider email ID
- `email_last_error`: 마지막 provider/recipient 오류
- `delivery_status`: Resend webhook 기반 최종 delivery lifecycle 상태
- `delivery_updated_at`: 마지막 delivery event 반영 시각

운영 시 구분:

- `pending`: 아직 처리 전
- `sent`: Resend API가 발송 요청을 accepted
- `failed`: 발송 시도 실패
- `skipped`: email rollout 이전 historical notification 또는 의도적으로 email을 보내지 않는 notification

`sent`와 실제 최종 `delivered`는 같은 의미가 아니다. 최종 전달 상태는 Resend webhook의 delivery event를 기준으로 확인한다.

## 7. Web Push 관측

- 브라우저 권한 요청은 반드시 사용자의 명시적 클릭으로 시작한다.
- subscription은 `beta_push_subscriptions`에 저장하고 RLS/DML grant 경계를 유지한다.
- notification의 `push_status`, attempts, last error와 push outbox worker 결과를 확인한다.
- 서버 `sent`는 push service acceptance를 의미하며 OS 표시 자체를 보장하지 않는다.
- device-level QA에서는 탭을 background/minimize한 뒤 실제 브라우저/OS notification 표시까지 확인한다.
- stale/expired subscription은 worker의 bounded retry와 cleanup 경로로 복구한다.

## 8. 이메일·Push 장애 복구

1. 사용자 참가/취소 상태를 먼저 확인한다. 알림 실패 때문에 참가 상태를 되돌리지 않는다.
2. `beta_notifications`에서 event type, email/push status, attempts, last error를 확인한다.
3. 이메일이면 Resend API/domain/webhook 상태를, Push면 subscription/worker/VAPID 경계를 확인한다.
4. credential을 채팅·브라우저·client bundle에 노출하지 않는다.
5. 재시도 시 동일 notification ID 기준 idempotency를 유지한다.
6. 반복 실패는 사용자 액션을 재실행시키지 말고 outbox만 복구한다.

## 9. 네트워크 / stale state 복구

- timeout/offline에서는 사용자에게 재시도 가능한 상태를 유지한다.
- reload 후 서버 상태를 다시 읽어 local 화면을 복구한다.
- Realtime event는 change signal로 사용하고 authoritative row는 REST로 다시 읽는다.
- stale-tab 충돌이 의심되면 서버 상태를 우선하고 refresh한다.
- duplicate join/cancel/check-in은 RPC의 idempotent/guarded 경계를 유지한다.

## 10. 개인정보 / 보안

- browser에는 publishable key만 둔다. service-role credential을 넣지 않는다.
- 현재 Cloudflare Worker의 `/api/ai-match-assistant` POST 요청은 `AI_RATE_LIMITER` 바인딩으로 검사한다(`worker/index.js`, `wrangler.jsonc` 참조). 운영에서 실제 429, 공유 IP 영향과 비용·트래픽 제한은 Cloudflare 설정 및 Production Smoke와 별도로 점검한다. 2026-10-23 Vercel WAF 기록은 과거 배포용이며 현재 Cloudflare 보안 정책의 검증 근거가 아니다.
- 운영자 권한은 `public.operators` allowlist + TOTP MFA(AAL2) + RLS/RPC 내부 권한 재검증으로 보호한다.
- MFA QR/설정 키는 운영자 본인 Authenticator 등록에만 사용하고 로그·문서·채팅에 남기지 않는다.
- audit payload에는 email/name을 저장하지 않는다.
- 계정 삭제는 authenticated server-side Edge Function에서 처리한다.
- password 정책과 hosted Auth 보안 설정은 Pilot 확대 전 Supabase advisor 기준으로 점검한다.

## 11. Pilot QA 체크리스트

- 회원가입 / 이메일 확인 / 로그인 / 로그아웃
- Google / Kakao OAuth 실제 로그인
- 비밀번호 복구 / 새 비밀번호 설정
- 경기 조회 / 참가 / duplicate 참가 방어
- 사용자 취소 / 취소 마감 이후 차단
- waitlist / 자동 승급 / reminder
- self check-in / operator check-in
- operator participant cancel / capacity recovery
- operator match cancel
- match completion / feedback / attendance history
- in-app notification read
- transactional email: join / user cancel / operator cancel / check-in + final delivery webhook
- Web Push: permission → subscription → server worker → 실제 browser/OS 표시
- profile avatar / operator match image upload
- operator TOTP MFA: QR 또는 수동 설정 키 → AAL2 console access
- reload restoration / offline / timeout / stale-tab recovery
- 320 / 375 / 390 / 430px
- keyboard / axe serious-critical 0
- console error / pageerror

## 12. QA 데이터 정리

- `[QA]` 목적 경기와 테스트 계정은 실제 Pilot 경기와 구분한다.
- 테스트 종료 후 공개 상태의 QA 경기를 방치하지 않는다.
- QA 데이터를 정리할 때 Production 사용자 데이터를 직접 SQL로 임의 변경하지 않는다. 제품 RPC/운영자 경로를 우선한다.
- durable QA 결과는 `docs/RELEASE-HISTORY.md`에 남기고 일시적인 실패·재시도 대기는 기록하지 않는다.

## 12-1. 2026-10-30 · 운영 파일럿 KPI와 실계정 MFA 사전 확인

- P2·P3 운영 DB에는 migration `20261030032856_beta_preferences_pilot_metrics`가 적용됐습니다. 계정별 추천 조건 동기화는 인증 사용자 전용이며, 데모/게스트 조건은 로컬에 남고 동기화 실패 시에도 로컬 복구를 우선합니다.
- 운영자 `operator_discovery_metrics`는 최근 **7일 이벤트 집계**, `operator_discovery_kpi_baseline`은 **21일 파일럿 KPI 기준선**입니다. 4개 KPI는 유효 사용자 또는 분모가 5명/5건 미만이면 N/A입니다. 현재 파일럿 지정 사용자 0명으로 개선률·전환 성과를 보고하지 않습니다. 계정의 통계 동의와 `pilot` 분류는 별도 조건이며 자동 등록하지 않습니다.
- 실계정 보안 QA는 [#611](https://github.com/dohyunkimmm/footmate/issues/611)을 따릅니다. 모의 AAL1/AAL2·JWT 및 CI의 MFA 화면 QA 통과는 실제 Supabase Auth **서명 JWT**·운영자 TOTP·토큰 갱신/로그아웃/복구 실계정 E2E를 대체할 수 없습니다. 승인된 격리 테스트 계정 외 운영 계정은 변경하거나 비밀정보를 CI/이슈에 남기지 않습니다. [PR #729](https://github.com/dohyunkimmm/footmate/pull/729)의 전용 도구와 문서는 실계정 실행 전 준비물로만 취급합니다.
- 배포 전에 DB 마이그레이션 적용 상태와 권한·RLS를 확인하고, PR CI가 완전 성공한 경우에만 `main` 병합 및 Cloudflare 배포를 진행합니다. 배포 후 Production Smoke를 확인합니다. DB 마이그레이션이 먼저 적용된 #727의 배포 이력을 과거 경계와 구분합니다.

## 13. Release gate

Pilot 변경은 변경 영향에 맞춰 다음 순서를 따른다.

- runtime / UI / domain / deployment 영향 변경: `branch → PR → Regression 36 / Browser E2E + axe → merge → 필요한 Supabase migration/Edge Function 적용 → Deploy Cloudflare → Production Smoke → 실제 Beta path verification → 문서 sync`
- docs-only 변경: `branch → PR → Change Impact → Docs-only QA (git diff --check + connected-platform contract) → merge → 문서 consistency 확인`; runtime Regression / Browser E2E / Production Smoke는 영향이 없으면 skip한다. CI 워크플로 변경은 docs-only가 아니므로 Regression 36 / Browser E2E + axe 및 필요 시 Production Smoke를 실행한다.

최종 runtime 또는 수동 Production QA가 확정된 뒤에는 [docs/README.md](README.md)의 공통 sync-up 순서를 따른다: README → Release History/Correction → Runbook(운영 절차 변경 시) → Notion(장기 제품 사실 변경 시) → Case Study(설명·핵심 흐름·근거에 실질적 변경이 있을 때) → 상충하는 `pending` / `미검증` / `별도 확인 대상` 문구 검색 → QA/merge. 단순한 Beta 운영·시각 수정만으로 Case Study를 중복 업데이트하지 않는다.

Render는 backup/alternate deployment이며 모든 변경의 완료 조건이 아니다.

## 14. 적용된 Supabase 마이그레이션 보존

운영 프로젝트의 `supabase_migrations` 기록에는 아래 4개 버전이 **모두 적용된 이력**으로 존재한다. 각 쌍의 SQL 내용은 같지만 버전은 다르다.

- `20260922012426_beta_push_media.sql` / `20260922013306_beta_push_media.sql`
- `20260922012607_beta_push_worker_schedule.sql` / `20260922013447_beta_push_worker_schedule.sql`

저장소 크기 정리를 이유로 어느 한쪽을 임의 삭제하거나 마이그레이션 이력을 직접 수정하지 않는다. 먼저 모든 연결 환경(운영·개발·복구)의 적용 버전과 재구축 방법을 검증하고, 기존 버전을 보존한 상태에서 새 마이그레이션부터 중복을 방지한다. 운영 스키마를 수정해야 할 때는 별도의 순방향 마이그레이션으로 처리한다.
