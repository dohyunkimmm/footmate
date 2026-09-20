# FootMate v4.4.0 — Matchday Companion

FootMate는 **내 수준에 맞는 풋살 경기를 찾고, 왜 잘 맞는지 이해하고, 조건을 직접 좁힌 뒤 경기 상세에서 참가 판단을 마치고 결제 복구와 경기 당일까지 이어지는 경험**을 설계한 인터랙티브 서비스 기획 프로젝트입니다.

## Current release

- Release: **v4.4.0 · Join & Payment State Machine**
- Primary journey: **Find → Decide → Join → Play → Return**
- Real App: `/app`
- Guided Case Study: `/app?mode=guided`
- Evidence / Reviewer mode: `/app?mode=evidence`
- Case Study: `/`
- Compatibility aliases: `/demo`, `/next` → current v4 Real App
- Product/runtime baseline: `27f78394c32475e818afd97bf590d6448403f938`
- GitHub Actions: **FootMate QA #357 · run 35483442042 · PASS**
- Exact Vercel Production: `27f78394c32475e818afd97bf590d6448403f938` · `dpl_GS2Cotyf5UFdDA4gyoCfMFqfa5Pq` · **READY** · exact HTTP/Chromium smoke PASS
- Render backup: `27f78394c32475e818afd97bf590d6448403f938` · `dep-dank2n8jo6nc739k8egg` · **LIVE** at release verification time
- Evolution roadmap: `docs/V4.1-V5.0-ROADMAP.md`

## Product decisions

v4는 화면 수보다 사용자의 결정 비용과 경기 전후 연속성을 우선합니다.

1. **Value before account** — 계정 생성 전에 지역·포지션·레벨을 설정하고 추천 가치를 먼저 확인합니다.
2. **Reason before score** — 내부 적합도는 정렬에 사용하되 사용자에게는 생활권·레벨·포지션처럼 결정에 필요한 이유를 먼저 보여줍니다.
3. **Preference-aware ranking** — 지역·포지션·레벨 설정이 실제 경기 순위와 상세 추천 이유를 바꿉니다.
4. **Recommendation as a starting point** — 추천을 기준점으로 두고 날짜·시간·거리·가격·포지션을 직접 좁혀 탐색할 수 있습니다.
5. **Recoverable discovery** — 검색 결과가 없을 때 조건 넓히기와 전체 해제를 제공하며, 탐색 상태를 URL과 브라우저 저장소에 유지합니다.
6. **Decision Detail** — 경기 상세에서 추천 이유, 참가자/포지션 구성, 시설·운영 규칙, 취소·환불 기준, 남은 자리, 저장·비교 상태를 한 흐름으로 판단합니다.
7. **Recoverable participation** — `checkout → pending → success | failure | canceled`를 분리하고 retry·status check·reload recovery를 제공합니다.
8. **Authoritative snapshot** — 결제 시작 시 경기·금액·환불정책 snapshot을 고정하고 success에서만 참가를 확정합니다.
9. **Single participation CTA** — 경기 상세의 계약 행동은 `참가하기` 하나를 primary CTA로 유지하고 저장·비교는 보조 의도로 분리합니다.
10. **State-aware Matchday** — 참가 전 추천, 참가 후 다가오는 경기, 경기 당일 체크인, 경기 후 평가와 다음 행동으로 이어집니다.
11. **Real / Guided / Evidence separation** — 실제 사용자 화면과 리뷰어 설명·검증 UI를 분리합니다.

## Implemented scope

- Guest-first preferences → recommendation → discovery → decision detail → sign-in → checkout → payment state → confirmation
- Region / position / level-aware deterministic recommendation ranking and human-readable reasons
- Discovery date / time / distance / price / position filters, fit / distance / closing-soon sort, zero-result recovery and URL/session persistence
- Decision Detail recommendation evidence, disclosed sample capacity/participant composition, facility/operation information, refund timing, save intent and max-two comparison
- Separate `footmate:v4:participation` persistence for checkout/payment state
- Payment-method simulation: easy payment / card
- `checkout → pending → success | failure | canceled` state contract
- duplicate-submit guard while pending
- reload-safe pending restoration and explicit status check
- failure → retry → success recovery
- cancel recovery without creating `joinedMatchId`
- immutable selected match / amount / refund-policy snapshot during an attempt
- participation finalization only from the authoritative payment snapshot
- explicit disclosure that real PG/card authorization is not connected
- ID/password sign-in UI, sign-up validation and Kakao · Naver · Apple · Google SSO selection UI
- Selected-match continuity across sign-in and checkout
- Match-specific persistent check-in completion state and date-safe sample schedules
- SPA route focus management, responsive 320 / 375 / 390 / 430px, Real / Guided / Evidence isolation
- 16-section product-first Case Study with Recommendation Core + Discovery & Search + Decision Detail + Join & Payment evidence
- Browser E2E + axe and exact Production HTTP/Chromium gates

## Prototype boundary

FootMate v4.4.0은 서비스 기획 검증용 인터랙티브 프로토타입입니다. 추천은 **규칙 기반 explainable ranking + 샘플 데이터 + 브라우저 세션 상태**, 탐색은 deterministic filter/sort와 브라우저/URL persistence로 동작합니다. Decision Detail의 잔여 자리·참가자 구성·시설·운영 정보는 명시된 prototype sample data이며 realtime 운영 데이터가 아닙니다. Join & Payment의 결제 수단·pending·failure·retry·cancel·success 또한 deterministic simulation입니다. **외부 AI 모델, 회원 DB, 실제 OAuth, 실제 PG 결제, 실시간 수용량, 실시간 참가자 데이터, 실시간 알림 backend는 연결하지 않았습니다.**

## Architecture

- `src/v4/` — 공식 v4 Real App / Case Study runtime ownership
- `src/v4/experience.js` / `experience.css` — account UX, validation and interaction safeguards
- `src/v4/recommendation.js` — v4.1 preference-aware explainable ranking contract
- `src/v4/discovery.js` / `discovery.css` — v4.2 filtering, sorting, recovery, URL/session persistence
- `src/v4/decision.js` / `decision.css` — v4.3 Decision Detail save/compare/evidence/policy interaction
- `src/v4/participation.js` / `participation.css` — v4.4 payment-method simulation, payment state machine, attempt snapshot and recovery ownership
- `src/v4/case-study-recommendation.js` / `case-study-discovery.js` / `case-study-decision.js` / `case-study-participation.js` — staged Case Study evidence
- `tests/e2e/v4-app.spec.cjs` — browser / recommendation / responsive / accessibility / state gate
- `tests/e2e/v4-discovery.spec.cjs` — discovery gate
- `tests/e2e/v4-decision.spec.cjs` — Decision Detail gate
- `tests/e2e/v4-participation.spec.cjs` — participation state / snapshot / recovery / mobile / axe gate
- `tests/e2e/v4-case-study.spec.cjs` — 16-section editorial / layout / overflow / axe gate
- `tests/production-v4-smoke.cjs` / `tests/e2e/v4-production.spec.cjs` — exact Production gates
- `scripts/check-v4-boundary.cjs` — current-tree release and legacy-boundary checker
- `docs/V4.1-V5.0-ROADMAP.md` — staged product evolution plan

현재 public branch는 v4 소스와 v4 QA 계약만 유지합니다. `/demo`와 `/next`는 과거 제품을 노출하지 않고 현재 v4 Real App으로 연결됩니다.

## QA / release process

Protected `main`은 다음 순서를 따릅니다.

`branch → PR → GitHub Actions QA → merge → exact Vercel Production verification → Render verification → durable docs sync`

문서-only merge로 `main` SHA가 이동하더라도 위 **product/runtime baseline**과 exact Production SHA는 별도로 유지합니다. 각 minor release는 exact Production 검증과 durable release sync를 닫은 뒤 다음 단계로 이동합니다. 다음 단계는 **v4.5 · Matchday Operations**입니다.
