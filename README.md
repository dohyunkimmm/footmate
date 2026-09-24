# FootMate — AI-assisted Futsal Match Discovery

FootMate는 **내 수준에 맞는 풋살 경기를 빠르게 찾고, 왜 나에게 맞는지 이해한 뒤 참가·경기 당일·경기 후까지 이어지는 경험**을 검증하는 인터랙티브 서비스 기획 프로젝트입니다.

현재 제품은 자연어 경기 탐색을 실제 AI inference와 연결하되, 경기 후보·순위·추천 이유는 deterministic recommendation engine이 계속 소유하도록 설계했습니다. AI 연결이 느리거나 실패해도 rules fallback으로 탐색을 이어가며, 참가와 결제는 항상 사용자가 직접 확인합니다.

## Product at a glance

- Primary journey: **Find → Decide → Join → Play → Return**
- Case Study: `/`
- Real App: `/app`
- Closed Beta: `/beta` — Supabase Auth / Postgres / Realtime / capacity / participation / waitlist / reminders / feedback / in-app notification / transactional email / opt-in Web Push / media upload connected
- Closed Beta Operator: `/beta/operator` — allowlisted + TOTP MFA operator match / participant / policy / check-in / completion / match media operations connected
- Guided Case Study: `/app?mode=guided`
- Evidence / Reviewer mode: `/app?mode=evidence`
- Compatibility aliases: `/demo`, `/next` → current Real App
- Case Study IA: **13 sections** — #228 기준 서비스 기획 서사 · 영문 section label · 한국어 story H2 · TOC 부제목 한 줄

## 서비스 기획 관점

Case Study는 역할·서비스 목표·우선순위·Trade-off·운영 정책·KPI·회고를 현재 13개 섹션 안에서 연결합니다. Persona와 대안 비교는 설계 가설이며, KPI는 실제 성과가 아닌 Validation Metric입니다. 분모·관찰 기간·제외 기준은 [서비스 기획 근거](docs/SERVICE-PLANNING-EVIDENCE.md)에서 확인할 수 있습니다.

## Product decisions

- **Value before account** — 추천과 경기 상세을 먼저 확인하고 참가 의도가 생겼을 때 로그인합니다.
- **Reason before score** — 내부 적합도는 정렬에 사용하되 사용자는 생활권·레벨·포지션·거리처럼 판단 가능한 이유를 먼저 봅니다.
- **AI interprets, deterministic engine ranks** — AI는 자연어를 검색 조건으로 바꾸고 실제 경기 후보·순위·추천 이유는 recommendation engine이 결정합니다.
- **Recoverable participation** — checkout → pending → success | failure | canceled를 분리하고 retry·status check·reload recovery를 제공합니다.
- **State-aware Matchday** — upcoming → matchday → checked-in과 late·update·cancel recovery를 분리합니다.
- **Return loop** — 경기 후 체감 난이도·완료·반복 의도를 다음 추천의 보조 신호로 사용합니다.
- **HITL for irreversible actions** — AI는 경기 탐색을 돕지만 참가와 결제를 자동 실행하지 않습니다.

## AI Agent Workflow

`Context → Plan → Tools → Guardrail → Observe`

- **Context** — 현재 region / position / level browser state와 사용자의 자연어 요청
- **Plan** — 지역·포지션·레벨·최대 가격·최대 이동 시간·시작 시간 조건으로 구조화
- **Tools** — Vercel AI Gateway + deterministic recommendation ranking + sample match catalog
- **Guardrail** — AI가 경기 ID·가격·잔여 자리·주소·순위·날짜를 생성하지 못하도록 validation을 적용하고 join/payment는 HITL로 유지
- **Observe** — connected-ai / rules-fallback, 실제 사용 model, fallback 여부와 마지막 검색 조건을 추적

## Implemented experience

- 자연어 경기 탐색 → structured constraints
- AI connected path + provider fallback + browser rules fallback
- deterministic recommendation ranking과 human-readable recommendation reason
- Discovery filter/sort, zero-result recovery, URL/session persistence
- Decision Detail, save, 최대 2경기 compare
- Sign in / checkout / pending / retry / cancel / reload recovery
- Matchday check-in과 운영 상태 복구
- postgame Return과 browser-local personalization
- Closed Beta email/password Auth, profile persistence, live match read, position-aware join/cancel, reload session recovery
- Closed Beta Google/Kakao OAuth entrypoint — Supabase에서 실제 provider가 활성화된 경우에만 노출; Production 실로그인 수동 QA 완료
- Closed Beta password recovery, recovery-link password update, signup verification email resend
- Closed Beta per-match cancellation cutoff with database-enforced join/cancel boundary
- Closed Beta Realtime change signal + authoritative REST refresh for match/capacity/participation/notification/waitlist/feedback
- Closed Beta position-aware waitlist + cancellation transaction 내 FIFO 자동 승급
- Closed Beta 24h / 2h pre-match reminder generation through the existing notification outbox
- Closed Beta real-match AI constraint interpretation + deterministic ranking over actual Supabase match records
- Closed Beta attendance history + completed-match feedback
- Closed Beta connected self check-in and DB-backed in-app operation notifications
- Closed Beta participant transactional email outbox + server worker + Resend final-delivery webhook
- Closed Beta browser Web Push opt-in + server-driven push outbox worker; Production 브라우저/OS 알림 표시까지 수동 QA 완료
- Closed Beta profile avatar + AAL2 operator match/venue image upload through Supabase Storage `beta-media`
- Closed Beta participant join / user cancellation / operator cancellation / check-in transactional email actual Production delivery verified
- Closed Beta operator TOTP MFA; operator-only RLS and SECURITY DEFINER RPC require `aal2`; raw Supabase SVG QR와 수동 설정 키 fallback 모두 지원
- Closed Beta operator match create/edit/cancel, MF/FW/DF/GK capacity allocation, participant cancel/capacity recovery
- Closed Beta operator cancellation/check-in policy management, participant on-site check-in, match completion
- Closed Beta request timeout / offline recovery / stale-tab refresh / last-sync state
- Closed Beta account deletion with authenticated server-side Edge Function and local-session cleanup
- Closed Beta minimal operation audit trail without email/name payloads, extended through check-in and match completion
- Real / Guided / Evidence mode 분리
- responsive 320 / 375 / 390 / 430px
- `/app` setup display terminology: `공격수` / `초급` / `고급` while canonical compatibility values stay internal
- `/app` active Auth v3: Google/Kakao only, actual previous-route back behavior, readable team-message simulation boundary, checked-in → postgame → next-match continuation
- desktop Real App shell: stable max 560px composition; unrequested 1040px expansion is not part of the Product contract
- Browser E2E + axe accessibility regression
- Mobile Safari/WebKit 자동 gate — 320 / 375 / 390 / 430px에서 overflow, fixed navigation, Detail/focus contract 검증
- Playwright screenshot visual regression — Ubuntu/Chromium baseline에서 changed Product / Case Study surfaces를 `toHaveScreenshot()`으로 실제 비교하고, 알려진 runner anti-alias 편차는 소수 pixel의 bounded allowance로 제한합니다. 1440px Real App은 max 560px shell과 1-column density, center/overflow geometry contract를 별도로 검증합니다

## Production / integration boundary

현재 실제 연결과 simulation 경계를 다음처럼 구분합니다.

- Vercel AI Gateway: **connected and Production-verified**
- `/app` recommendation ranking: **deterministic runtime logic**
- `/app` match catalog / capacity / participant composition: **sample records**
- `/app` auth / payment / capacity / notification providers: **deterministic mock**
- `/app` persistence: **browser local state** — `footmate:*` canonical keys를 primary로 사용하고 기존 `footmate:v4:*` 9개 key는 migration/rollback compatibility mirror로 유지
- `/beta` Auth / member profile / match catalog / position capacity / participation: **Supabase connected**
- `/beta` Realtime / waitlist / reminder / feedback / real-match recommendation loop: **Supabase connected**; Realtime event는 change signal로만 사용하고 authoritative row는 REST에서 다시 읽음
- `/beta` account recovery / signup verification resend: **Supabase Auth connected**
- `/beta` Google/Kakao OAuth: **provider-aware Supabase OAuth connected**; 활성화된 provider만 버튼을 노출하며 Google/Kakao Production 실로그인을 2026-09-22 수동 검증
- `/beta` join / cancel / check-in: **database transaction + row lock/RLS**, free-participation only; 경기별 취소 마감·체크인 오픈 정책을 DB에서 강제
- `/beta` operation notification: **Supabase DB-backed in-app notification connected**
- `/beta` transactional email: **Supabase notification outbox + server worker + Resend connected**; join / user cancel / operator cancel / check-in은 실제 Production `delivered`까지 검증
- `/beta` browser Web Push: **Service Worker + subscription RLS + server outbox worker + pg_cron connected**; 사용자의 명시적 브라우저 권한 승인 이후 활성화되며 Production 브라우저/OS 표시 수동 QA까지 완료. 서버 `sent`는 push service acceptance 상태로 별도 추적
- `/beta` media: **Supabase Storage `beta-media` connected**; profile avatar는 own-folder RLS, match/venue image는 operator `aal2` RLS
- `/beta` account deletion: **authenticated Supabase Edge Function**, privileged Auth deletion remains server-side
- `/beta` operation traceability: **operator-readable DB audit trail** with user/match UUID and event/time only; email/name are not stored in audit payloads
- `/beta/operator`: **Supabase connected + TOTP MFA** — explicit `public.operators` allowlist, AAL2 RLS/RPC, atomic match / participant RPC, policy/check-in/completion/media operations, browser service-role credentials 없음
- real PG / external analytics: **미연동**; OAuth provider는 외부 credential/config에 의존하고 Web Push의 향후 기기별 표시는 사용자 브라우저/OS 권한에 의존
- Render: static backup / alternate deployment이며 Vercel serverless AI inference parity를 의미하지 않습니다.

## Release readiness

FootMate는 기능 수를 계속 늘리는 대신 현재 사용자 여정의 완결성과 복구 가능성을 release 기준으로 관리합니다.

runtime-impacting 변경의 자동 release gate는 다음을 포함합니다. docs/workflow-only non-runtime 변경은 `Change Impact` 판정 후 `Docs-only QA`에서 `git diff --check`와 connected-platform contract를 실행하고, 영향이 없는 Regression / Browser E2E / Production Smoke는 skip합니다.

- Regression suite
- Browser E2E + axe
- Playwright screenshot visual regression — approved Ubuntu/Chromium baseline과 actual render를 비교하고 mismatch 시 expected / actual / diff evidence를 남김; changed Real App / Case Study surfaces와 1440px max 560px shell·center·overflow geometry를 함께 검증
- responsive 320 / 375 / 390 / 430px
- `/app` setup display terminology: `공격수` / `초급` / `고급` while canonical compatibility values stay internal
- `/app` active Auth v3: Google/Kakao only, actual previous-route back behavior, readable team-message simulation boundary, checked-in → postgame → next-match continuation
- desktop Real App shell: stable max 560px composition; unrequested 1040px expansion is not part of the Product contract
- Deep Link / State Consistency / persistence restoration
- Closed Beta backend config / Auth / join / cancel / reload recovery
- Closed Beta password recovery / signup verification resend / recovery-link password update
- Closed Beta network timeout / offline / duplicate-action boundary / stale-tab refresh
- Closed Beta cancellation cutoff / connected check-in / in-app notification / match completion
- Closed Beta transactional email outbox / Edge Function / Resend integration contract
- Closed Beta Realtime / reminder / waitlist / real-match recommendation / feedback contracts
- Closed Beta social OAuth provider-awareness / operator TOTP MFA + AAL2 boundary
- Closed Beta Web Push subscription/outbox/service-worker and media Storage/RLS contracts
- Closed Beta account deletion contract and audit traceability
- Closed Beta operator allowlist / match create-edit-cancel / participant cancel / capacity recovery / policy / check-in / completion
- Supabase RLS / RPC security boundary
- AI connected / provider fallback / browser fallback / timeout recovery
- exact Production HTTP / AI inference / Chromium smoke
- Vercel exact SHA verification
- 필요한 경우 Render backup verification

Closed Beta는 결제 없는 실제 참가 검증을 우선합니다. 사용자 `/beta`와 allowlisted 운영자 `/beta/operator`의 Auth·경기·포지션 정원·참가/취소·체크인·경기 종료 경로는 Supabase에 연결되어 있습니다. 참가 상태 transactional email은 Resend final-delivery webhook까지 연결되어 있고, Web Push는 사용자가 명시적으로 알림 권한을 승인한 기기에서 opt-in 방식으로 동작합니다. 운영자 계정은 self-service가 아니라 명시적 allowlist provisioning을 거치며 TOTP MFA(AAL2)를 통과해야 운영자 전용 데이터와 RPC에 접근할 수 있습니다. 실제 PG는 별도 release scope입니다. 2026-09-22 기준 Google/Kakao Production 실로그인과 Web Push 브라우저/OS 알림 표시를 수동 검증했고, raw SVG MFA QR 렌더링과 320/375/390/430px Operator/Beta UI는 자동 Browser E2E + axe로 검증합니다. 2026-09-21 사용자 수동 검증 기준 실제 iPhone / Android 물리기기 QA, 수동 접근성 QA, disposable 실제 Beta 계정 UI E2E도 PASS했으며 자동 gate 결과와 구분해 release history에 기록합니다.

## Architecture

- `api/ai-match-assistant.js` — AI Gateway, OIDC, provider fallback, request/time/cost guardrails
- `api/beta-config.js` — browser-safe Supabase URL / publishable key config boundary
- `src/v5/ai-match-assistant.js` — AI UI/application bridge, browser timeout/fallback, reload restoration
- `src/v5/beta.js` — Closed Beta Auth / profile / match / participation / freshness / account-data UI state
- `src/v5/beta-recovery-bootstrap.js` — recovery token bootstrap before base Beta Auth connection
- `src/v5/beta-readiness.js` — account recovery / cancellation policy / self check-in / in-app notification UI extension
- `src/v5/beta-growth.js` — Realtime / waitlist / live-match recommendation / attendance-feedback UI extension
- `src/v5/beta-social-auth.js` — provider-aware Google/Kakao OAuth entrypoint
- `src/v5/beta-push.js` + `beta-sw.js` — browser Web Push opt-in/subscription and service-worker notification surface
- `src/v5/beta-media.js` — profile and operator match-image Supabase Storage adapter/UI
- `src/v5/beta-operator.js` — allowlisted operator match / participant management UI state
- `src/v5/beta-operator-mfa.js` — TOTP enrollment/challenge/verify gate before operator console load; raw SVG QR normalization + manual setup-key fallback
- `src/v5/beta-operator-polish.js` — new-match policy defaults, picker bounds and narrow-screen Operator form polish
- `src/v5/beta-operator-readiness.js` — operator policy / participant check-in / match completion UI extension
- `src/v5/infrastructure/supabase-beta.js` — Supabase Auth / REST / RPC / account-deletion browser adapter
- `src/v5/infrastructure/supabase-beta-readiness.js` — Supabase Auth recovery / readiness REST / RPC / transactional email dispatch adapter
- `src/v5/domain/beta-match-contract.js` — connected match normalization contract
- `supabase/functions/delete-account/` — authenticated user account deletion; privileged Auth admin operation stays server-side
- `supabase/functions/process-beta-email-outbox/` + `resend-beta-email-webhook/` — server transactional email delivery/reconciliation
- `supabase/functions/process-beta-push-outbox/` — server-driven Web Push outbox worker with bounded retry and stale-subscription cleanup
- `supabase/migrations/` — profiles / operators / matches / match_slots / participation / notification / email+push outbox / waitlist / feedback / media / audit trail, RLS and atomic user/operator RPC ownership
- `src/v5/domain/` — recommendation / participation / matchday / return consistency ownership
- `src/v5/infrastructure/providers.js` — `/app` auth/payment/capacity/notification provider registry
- `src/v4/platform/domain/contracts.js` — version-neutral `footmate:*` canonical storage keys + `footmate:v4:*` legacy compatibility key contract
- `src/v4/platform/infrastructure/storage.js` — legacy promotion, canonical-first reconciliation, dual-write rollback mirror, JSON repository ownership
- `src/v4/platform/domain/recommendation.js` — deterministic recommendation score/reason/sort의 순수 domain Source of Truth
- `src/v4/recommendation.js` — domain 결과를 Home / Discover / Detail UI와 연결하는 presentation bridge
- `src/v4/data.js` — current `/app` sample match records and user-visible recommendation reasons

## Release engineering

버전 번호는 제품의 외부 이름이 아니라 개발·QA·배포 추적용 식별자로만 사용합니다.

- Current global release identifier: **v5.2.0** — root `package.json.version`이 public `/app` / Case Study release meta의 기준이며 CI가 drift를 차단
- Component compatibility identifiers such as connected-platform / AI Assistant `v5.1.1` are preserved independently from the global release
- Detailed release history and exact SHA/deployment facts: `docs/RELEASE-HISTORY.md`
- Closed Beta pilot operations: `docs/BETA-PILOT-RUNBOOK.md`
- Documentation index: `docs/README.md`
- Browser QA ownership: current `v5.1` component suites + `v5.2` Product/WebKit/Beta readiness + `v5.3` Beta growth/auth/push-media suites + 필요한 granular `v4` compatibility suites
- QA determinism: Playwright retry 0; Chromium visual/accessibility gate와 Mobile WebKit gate를 분리해 flaky retry가 critical failure를 숨기지 않음
- Performance budgets: first-party request/CSS/JS/HTML byte budget + max 560px shell / horizontal overflow / screen-ready runtime budget
- QA scope: runtime-impacting 변경은 full Regression / Browser E2E + axe / 필요한 Production verification을 유지하고, docs/workflow-only non-runtime 변경은 lightweight Docs-only QA를 사용
- Release flow: `branch → PR → impact-aware GitHub Actions QA → merge → runtime 영향 시 exact Vercel Production verification → durable release history sync`
- Final sync-up: `최종 runtime/수동 QA 확정 → README → Release History → Case Study → Runbook(절차 변경 시) → Notion 관련 페이지 → 상충하는 pending/미검증 문구 검색 → QA/merge`

