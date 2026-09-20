# FootMate v5.0.0 — Connected Matchday Platform

FootMate는 **내 수준에 맞는 풋살 경기를 찾고, 왜 잘 맞는지 이해하고, 조건을 직접 좁힌 뒤 참가·결제·경기 당일 운영·경기 후 피드백까지 이어지는 경험**을 검증하는 인터랙티브 서비스 기획 프로젝트입니다.

v5.0은 v4.9에서 고정한 사용자 UX·IA·품질 계약을 유지하면서 **recommendation / participation / matchday / return domain ownership과 provider registry, cross-domain consistency guardrail을 분리한 connected-capable architecture**로 전환했습니다. 실제로 연결되지 않은 외부 서비스는 Production 기능으로 표현하지 않습니다.

## Current release

- Release: **v5.0.0 · Connected Matchday Platform**
- Primary journey: **Find → Decide → Join → Play → Return**
- Real App: `/app`
- Guided Case Study: `/app?mode=guided`
- Evidence / Reviewer mode: `/app?mode=evidence`
- Case Study: `/`
- Compatibility aliases: `/demo`, `/next` → current Real App
- Product/runtime baseline: `031873c2d6e83a0b531ee1503bd6845aa95b7618`
- Feature PR: **#115**
- Final PR QA: **FootMate QA #411 · run 35497512505 · PASS**
- Post-merge QA: **FootMate QA #412 · run 35497619885 · PASS**
- Exact Vercel Production: `031873c2d6e83a0b531ee1503bd6845aa95b7618` · `dpl_EhsahEM5UAD85BbytAjiWcge3enU` · **READY** · exact HTTP/Chromium smoke PASS
- Render backup: `031873c2d6e83a0b531ee1503bd6845aa95b7618` · `dep-danot26q1p3s73ckn19g` · **LIVE** at release verification time
- Evolution roadmap: `docs/V4.1-V5.0-ROADMAP.md`

## Product decisions

1. **Value before account** — 계정 생성 전에 지역·포지션·레벨을 설정하고 추천 가치를 먼저 확인합니다.
2. **Reason before score** — 내부 적합도는 정렬에 사용하되 생활권·레벨·포지션처럼 판단 가능한 이유를 먼저 보여줍니다.
3. **Recommendation as a starting point** — 추천을 기준점으로 날짜·시간·거리·가격·포지션을 직접 좁힐 수 있습니다.
4. **Recoverable participation** — `checkout → pending → success | failure | canceled`를 분리하고 retry·status check·reload recovery를 유지합니다.
5. **State-aware Matchday** — 참가 후 `upcoming → matchday → checked-in`과 late·update·cancel recovery를 분리합니다.
6. **Domain ownership** — recommendation / participation / matchday / return의 상태와 이벤트 ownership을 명시적으로 분리합니다.
7. **Cross-domain consistency** — 선택 경기 → 참가 성공 → 경기 당일 체크인 → 경기 후 Return의 match identity와 상태 전이를 guardrail로 검증합니다.
8. **Provider registry** — auth / payment / capacity / notification을 동일 interface의 provider로 주입할 수 있게 하고 연결 상태를 `mock / connected / hybrid`로 구분합니다.
9. **Connected only when verified** — `external: true` provider는 `connected: true`와 method contract를 함께 만족해야 하며 실제 연결·검증된 provider만 Production capability로 승격합니다.
10. **No fake integration** — 현재 Production의 auth/payment/capacity/notification provider는 모두 deterministic mock이며 외부 side effect가 없습니다.
11. **Compatibility before replacement** — v4.9 UI, session schema v2, local event contract, recovery/persistence 동작을 compatibility boundary로 유지합니다.
12. **Real / Guided / Evidence separation** — 실제 사용자 화면과 리뷰어 설명·검증 UI를 계속 분리합니다.

## Implemented scope

- Guest-first preferences → recommendation → discovery → decision detail → sign-in → checkout → payment state → matchday operations → postgame return
- Region / position / level-aware deterministic recommendation ranking and human-readable reasons
- Discovery filters, sorting, zero-result recovery and URL/session persistence
- Decision Detail evidence, sample capacity/participant composition disclosure, facility/operation information, refund timing, save and compare
- Participation state persistence with duplicate-submit guard, pending reload/status-check, failure retry and cancel recovery
- Matchday arrival/check-in/update/cancel recovery and Return feedback/personal history
- Existing session schema v2 migration, local event log, browser persistence and v4.9 semantic design/accessibility contracts
- v5 recommendation / participation / matchday / return domain contracts
- injectable auth / payment / capacity / notification provider registry
- provider connection catalog and runtime disclosure through `window.__FOOTMATE_V5__`
- cross-domain journey consistency validation
- 16-section Case Study with Domain Architecture / Provider Registry / v5 Validation / Production Boundary evidence
- responsive 320 / 375 / 390 / 430px, Browser E2E + axe, recovery regression and exact Production HTTP/Chromium gates
- verified performance measurement: app HTML `2,422B` · first-party CSS `56,112B` · JS `144,952B` · first-party CSS/JS requests `21`

## Prototype / integration boundary

FootMate v5.0.0은 **connected-capable architecture를 검증하는 인터랙티브 프로토타입**입니다. 추천·탐색·참가·Matchday·Return의 데이터와 상태는 현재 sample records, deterministic rules, browser persistence 및 deterministic provider mock을 사용합니다.

현재 Production provider 상태는 다음과 같습니다.

- auth: **mock**
- payment: **mock**
- capacity: **mock**
- notification: **mock**
- connected providers: **없음**

**외부 AI/ML inference, 회원 DB, server memory, cross-device sync, 실제 OAuth, 실제 PG 결제, realtime capacity/participant backend, realtime location/map, team chat, 실제 notification delivery, external reputation backend, external analytics는 연결하지 않았습니다.** 실제 구현과 검증을 마친 provider만 `connected` 및 Production capability로 승격할 수 있습니다.

## Architecture

- `src/v5/domain/recommendation.js` — recommendation ownership and normalization
- `src/v5/domain/participation.js` — participation state ownership and allowed status contract
- `src/v5/domain/matchday.js` — matchday state ownership and status contract
- `src/v5/domain/return.js` — postgame return ownership
- `src/v5/domain/journey.js` — Find → Decide → Join → Play → Return cross-domain consistency guardrail
- `src/v5/infrastructure/providers.js` — injectable provider registry and mock/connected classification
- `src/v5/application/connected-platform.js` — connected-capable application facade
- `src/v5/presentation/bootstrap.js` — runtime version/domain/provider disclosure and current-journey validation bridge
- `src/v5/case-study-connected.js` — v5 Case Study evidence patch
- `docs/V5.0-CONNECTED-MATCHDAY-PLATFORM.md` — v5 architecture, provider boundary and acceptance contract
- `tests/contracts/v5.0-connected-platform.contract.mjs` — deterministic domain/provider contracts
- `tests/e2e/v5.0-core.spec.cjs` — full-flow accessibility, consistency, responsive and mode gates
- `tests/e2e/v5.0-case-study.spec.cjs` — 16-section v5 evidence gate
- `tests/production-v5.0-smoke.cjs`, `tests/e2e/v5.0-production.spec.cjs` — exact Production HTTP/Chromium gates
- `src/v4/` — verified v4.9 compatibility runtime, persistence, event and UX layer

## QA / release process

Protected `main`은 다음 순서를 따릅니다.

`branch → PR → GitHub Actions QA → merge → exact Vercel Production verification → Render verification → durable docs sync`

문서-only merge로 `main` SHA가 이동하더라도 **product/runtime baseline `031873c2d6e83a0b531ee1503bd6845aa95b7618`**과 exact Production SHA는 별도로 유지합니다.
