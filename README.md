# FootMate — AI-assisted Futsal Match Discovery

FootMate는 **내 수준에 맞는 풋살 경기를 빠르게 찾고, 왜 나에게 맞는지 이해한 뒤 참가·경기 당일·경기 후까지 이어지는 경험**을 검증하는 인터랙티브 서비스 기획 프로젝트입니다.

현재 제품은 자연어 경기 탐색을 실제 AI inference와 연결하되, 경기 후보·순위·추천 이유는 deterministic recommendation engine이 계속 소유하도록 설계했습니다. AI 연결이 느리거나 실패해도 rules fallback으로 탐색을 이어가며, 참가와 결제는 항상 사용자가 직접 확인합니다.

## Product at a glance

- Primary journey: **Find → Decide → Join → Play → Return**
- Case Study: `/`
- Real App: `/app`
- Closed Beta: `/beta` — Supabase Auth / Postgres / capacity / participation connected
- Closed Beta Operator: `/beta/operator` — allowlisted operator match / participant operations connected
- Guided Case Study: `/app?mode=guided`
- Evidence / Reviewer mode: `/app?mode=evidence`
- Compatibility aliases: `/demo`, `/next` → current Real App
- Case Study IA: **16 sections**

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
- Closed Beta operator match create/edit/cancel, MF/FW/DF/GK capacity allocation, participant cancel/capacity recovery
- Closed Beta request timeout / offline recovery / stale-tab refresh / last-sync state
- Closed Beta account deletion with authenticated server-side Edge Function and local-session cleanup
- Closed Beta minimal operation audit trail without email/name payloads
- Real / Guided / Evidence mode 분리
- responsive 320 / 375 / 390 / 430px
- Browser E2E + axe accessibility regression

## Production / integration boundary

현재 실제 연결과 simulation 경계를 다음처럼 구분합니다.

- Vercel AI Gateway: **connected and Production-verified**
- `/app` recommendation ranking: **deterministic runtime logic**
- `/app` match catalog / capacity / participant composition: **sample records**
- `/app` auth / payment / capacity / notification providers: **deterministic mock**
- `/app` persistence: **browser local state** — `footmate:*` canonical keys를 primary로 사용하고 기존 `footmate:v4:*` 9개 key는 migration/rollback compatibility mirror로 유지
- `/beta` Auth / member profile / match catalog / position capacity / participation: **Supabase connected**
- `/beta` join/cancel: **database transaction + row lock + RLS**, free-participation only
- `/beta` account deletion: **authenticated Supabase Edge Function**, privileged Auth deletion remains server-side
- `/beta` operation traceability: **operator-readable DB audit trail** with user/match UUID and event/time only; email/name are not stored in audit payloads
- `/beta/operator`: **Supabase connected** — explicit `public.operators` allowlist, atomic match / participant RPC, browser service-role credentials 없음
- real OAuth / real PG / notification delivery / external analytics: **미연동**
- Render: static backup / alternate deployment이며 Vercel serverless AI inference parity를 의미하지 않습니다.

## Release readiness

FootMate는 기능 수를 계속 늘리는 대신 현재 사용자 여정의 완결성과 복구 가능성을 release 기준으로 관리합니다.

자동 release gate는 다음을 포함합니다.

- Regression suite
- Browser E2E + axe
- responsive 320 / 375 / 390 / 430px
- Deep Link / State Consistency / persistence restoration
- Closed Beta backend config / Auth / join / cancel / reload recovery
- Closed Beta network timeout / offline / duplicate-action boundary / stale-tab refresh
- Closed Beta account deletion contract and audit traceability
- Closed Beta operator allowlist / match create-edit-cancel / participant cancel / capacity recovery
- Supabase RLS / RPC security boundary
- AI connected / provider fallback / browser fallback / timeout recovery
- exact Production HTTP / AI inference / Chromium smoke
- Vercel exact SHA verification
- 필요한 경우 Render backup verification

Closed Beta는 결제 없는 실제 참가 검증을 우선합니다. 사용자 `/beta`와 allowlisted 운영자 `/beta/operator`의 Auth·경기·포지션 정원·참가/취소 경로는 Supabase에 연결되어 있습니다. 운영자 계정은 self-service가 아니라 명시적 allowlist provisioning을 거치며, PG와 notification은 이후 별도 release gate로 다룹니다. 2026-09-21 사용자 수동 검증 기준 실제 iPhone / Android 물리기기 QA, 수동 접근성 QA, disposable 실제 Beta 계정 UI E2E는 PASS했으며 자동 gate 결과와 구분해 release history에 기록합니다.

## Architecture

- `api/ai-match-assistant.js` — AI Gateway, OIDC, provider fallback, request/time/cost guardrails
- `api/beta-config.js` — browser-safe Supabase URL / publishable key config boundary
- `src/v5/ai-match-assistant.js` — AI UI/application bridge, browser timeout/fallback, reload restoration
- `src/v5/beta.js` — Closed Beta Auth / profile / match / participation / freshness / account-data UI state
- `src/v5/beta-operator.js` — allowlisted operator match / participant management UI state
- `src/v5/infrastructure/supabase-beta.js` — Supabase Auth / REST / RPC / account-deletion browser adapter
- `src/v5/domain/beta-match-contract.js` — connected match normalization contract
- `supabase/functions/delete-account/` — authenticated user account deletion; privileged Auth admin operation stays server-side
- `supabase/migrations/` — profiles / operators / matches / match_slots / participation / audit trail, RLS and atomic user/operator RPC ownership
- `src/v5/domain/` — recommendation / participation / matchday / return consistency ownership
- `src/v5/infrastructure/providers.js` — `/app` auth/payment/capacity/notification provider registry
- `src/v4/platform/domain/contracts.js` — version-neutral `footmate:*` canonical storage keys + `footmate:v4:*` legacy compatibility key contract
- `src/v4/platform/infrastructure/storage.js` — legacy promotion, canonical-first reconciliation, dual-write rollback mirror, JSON repository ownership
- `src/v4/recommendation.js` — deterministic ranking Source of Truth for the current `/app` runtime
- `src/v4/data.js` — current `/app` sample match records and user-visible recommendation reasons

## Release engineering

버전 번호는 제품의 외부 이름이 아니라 개발·QA·배포 추적용 식별자로만 사용합니다.

- Current internal release identifier: **v5.1.1**
- Detailed release history and exact SHA/deployment facts: `docs/RELEASE-HISTORY.md`
- Documentation index: `docs/README.md`
- Browser QA ownership: current `v5.1` suites + 필요한 granular `v4` compatibility suites; release marker가 만료된 aggregate snapshot은 parity 이관 후 제거
- Release flow: `branch → PR → GitHub Actions QA → merge → exact Vercel Production verification → durable release history sync`
