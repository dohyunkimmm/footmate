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

## 13. Release gate

Pilot 변경은 변경 영향에 맞춰 다음 순서를 따른다.

- runtime / UI / domain / deployment 영향 변경: `branch → PR → Regression 36 / Browser E2E + axe → merge → 필요한 Supabase migration/Edge Function 적용 → Vercel Production verification → 실제 Beta path verification → 문서 sync`
- docs / workflow-only non-runtime 변경: `branch → PR → Change Impact → Docs-only QA (git diff --check + connected-platform contract) → merge → 문서 consistency 확인`; runtime Regression / Browser E2E / Production Smoke는 영향이 없으면 skip한다.

최종 runtime 또는 수동 Production QA가 확정된 뒤에는 README → Release History → Case Study → Runbook(절차 변경 시) → Notion 관련 페이지 순으로 동기화하고, 서로 상충하는 `pending` / `미검증` / `별도 확인 대상` 문구가 남지 않았는지 검색한 뒤 완료 처리한다.

Render는 backup/alternate deployment이며 모든 변경의 완료 조건이 아니다.
