# FootMate v4.9.0 — v5 Release Candidate

FootMate는 **내 수준에 맞는 풋살 경기를 찾고, 왜 잘 맞는지 이해하고, 조건을 직접 좁힌 뒤 참가·결제·경기 당일 운영·경기 후 피드백·개인화까지 이어지는 경험**을 검증하는 인터랙티브 서비스 기획 프로젝트입니다.

v4.9는 v4.8의 사용자 흐름과 Platform Architecture를 유지하면서 **v5 전환 전에 바뀌면 안 되는 IA·design system·성능·접근성·관측·provider·migration 계약을 고정한 Release Candidate**입니다.

## Current release

- Release: **v4.9.0 · v5 Release Candidate**
- Primary journey: **Find → Decide → Join → Play → Return → Personalize**
- Real App: `/app`
- Guided Case Study: `/app?mode=guided`
- Evidence / Reviewer mode: `/app?mode=evidence`
- Case Study: `/`
- Compatibility aliases: `/demo`, `/next` → current v4 Real App
- Product/runtime baseline: `702ed926f47749802e323a67c92e2552ceadd271`
- GitHub Actions: **FootMate QA #406 · run 35495900622 · PASS**
- Exact Vercel Production: `702ed926f47749802e323a67c92e2552ceadd271` · `dpl_Ar2C7xD2NopX1YN85RpXaQN4ShG6` · **READY** · exact HTTP/Chromium smoke PASS
- Render backup: `702ed926f47749802e323a67c92e2552ceadd271` · `dep-danob1navr4c73ajij90` · **LIVE** at release verification time
- Evolution roadmap: `docs/V4.1-V5.0-ROADMAP.md`

## Product decisions

1. **Value before account** — 계정 생성 전에 지역·포지션·레벨을 설정하고 추천 가치를 먼저 확인합니다.
2. **Reason before score** — 내부 적합도는 정렬에 사용하되 생활권·레벨·포지션처럼 판단 가능한 이유를 먼저 보여줍니다.
3. **Preference-aware ranking** — 지역·포지션·레벨 설정이 추천 순위와 이유를 바꿉니다.
4. **Recommendation as a starting point** — 추천을 기준점으로 날짜·시간·거리·가격·포지션을 직접 좁힐 수 있습니다.
5. **Recoverable discovery** — 결과가 없으면 조건을 넓히거나 초기화할 수 있고 탐색 상태를 URL과 브라우저 저장소에 유지합니다.
6. **Decision Detail** — 상세에서 추천 근거, 참가자/포지션 구성, 시설·운영 규칙, 환불 기준, 저장·비교를 한 흐름으로 판단합니다.
7. **Recoverable participation** — `checkout → pending → success | failure | canceled`를 분리하고 retry·status check·reload recovery를 제공합니다.
8. **Authoritative snapshot** — 결제 시작 시 경기·금액·환불정책 snapshot을 고정하고 success에서만 참가를 확정합니다.
9. **State-aware Matchday** — 참가 후 `upcoming → matchday → checked-in`과 late·update·cancel recovery를 분리합니다.
10. **Return as a product state** — postgame 체감 난이도·참여 완료·반복 의도를 개인 이력으로 저장하고 다음 추천의 보조 신호로 사용합니다.
11. **Local personalization, not hidden server memory** — 저장 프로필·최근 확인 경기·선호 지역/시간/포맷은 `footmate:v4:personalization`에 분리 저장하고 추천 보조 신호로만 사용합니다.
12. **Frozen IA for v5 handoff** — `welcome → setup → home → discover → detail → auth → checkout → success → schedule → profile`을 v5 handoff 기준으로 고정합니다.
13. **Semantic design-system contract** — 기존 v4 visual token을 semantic alias로 묶고 최소 44px control과 reduced-motion 기준을 공통 계약으로 둡니다.
14. **Performance as a release gate** — first-party HTML/CSS/JS/request 수에 정적 budget을 두고 PR/merge마다 검증합니다.
15. **Full-flow accessibility** — welcome → setup → home → detail → auth → checkout 전체 흐름에서 serious/critical axe violation 0을 RC 기준으로 확인합니다.
16. **Stable observability contract** — recommendation 선택, 참가 시작/완료, check-in, postgame 제출 이벤트 이름과 schema를 고정하고 현재는 local log에만 기록합니다.
17. **Provider contract, not fake integration** — auth/payment/capacity/notification을 interface-compatible deterministic mock으로 고정하되 외부 OAuth·PG·실시간 정원·알림 backend가 연결됐다고 표현하지 않습니다.
18. **Migration + rollback rehearsal** — session schema v2를 유지하면서 migration 전 snapshot checkpoint와 원본 rollback 가능성을 deterministic contract로 검증합니다.
19. **Real / Guided / Evidence separation** — 실제 사용자 화면과 리뷰어 설명·검증 UI를 분리합니다.

## Implemented scope

- Guest-first preferences → recommendation → discovery → decision detail → sign-in → checkout → payment state → matchday operations → postgame return → personalization
- Region / position / level-aware deterministic recommendation ranking and human-readable reasons
- Discovery filters, sorting, zero-result recovery and URL/session persistence
- Decision Detail recommendation evidence, disclosed sample capacity/participant composition, facility/operation information, refund timing, save intent and max-two comparison
- `footmate:v4:participation` payment state persistence and `checkout → pending → success | failure | canceled`
- duplicate-submit protection, reload-safe pending restoration, failure retry and cancel recovery
- immutable selected match / amount / refund-policy snapshot during an attempt
- `footmate:v4:matchday` post-join state with arrival/check-in/update/cancel recovery
- `footmate:v4:return` postgame state with perceived difficulty, completion history and repeat intent
- `footmate:v4:personalization` local profile / recent-match / favorite area·time·format state
- returning-user quick resume from a saved local preference profile
- session schema v2 migration for existing `footmate:v4:session` state
- domain → application → infrastructure → presentation platform boundary
- browser + memory storage provider interfaces and JSON repository boundary
- `footmate:v4:events` local event log with schema, sequence, dedupe and retention contract
- stable event catalog: recommendation.selected / join.started / join.completed / checkin.completed / postgame.submitted
- auth / payment / capacity / notification deterministic mock-provider contracts with `external: false`
- semantic v5 design token aliases, 44px control baseline and reduced-motion contract
- performance budget: app HTML ≤ 16KB, first-party CSS ≤ 180KB, JS ≤ 320KB, CSS/JS requests ≤ 24
- verified RC measurement: app HTML 2,337B · CSS 56,044B · JS 142,101B · first-party CSS/JS requests 20
- migration checkpoint / restore / rollback rehearsal against session schema v2
- ID/password sign-in UI, sign-up validation and Kakao · Naver · Apple · Google SSO selection UI as simulation
- SPA route focus management, responsive 320 / 375 / 390 / 430px, Real / Guided / Evidence isolation
- 16-section Case Study with v5 Release Candidate IA / design system / observability / provider / validation narrative
- deterministic platform + RC contract tests, Browser E2E + axe and exact Production HTTP/Chromium gates

## Prototype boundary

FootMate v4.9.0은 서비스 기획 검증용 인터랙티브 프로토타입입니다. 추천·Return Loop·Personalization은 **규칙 기반 explainable ranking + 샘플 데이터 + 브라우저 상태**로 동작합니다. Decision Detail의 잔여 자리·참가자 구성·시설·운영 정보, Join & Payment의 결제 수단과 결제 상태, Matchday Operations의 arrival/check-in/update/cancel, Return Loop의 postgame 피드백과 개인 이력은 deterministic sample/simulation입니다.

v4.9의 auth/payment/capacity/notification provider는 **v5 연결 인터페이스를 검증하기 위한 deterministic mock**입니다. 현재 session/repository/event persistence는 브라우저 로컬 저장소를 사용하며 event delivery도 local-only입니다. **외부 AI/ML inference, 회원 DB, server memory, cross-device sync, 실제 OAuth, 실제 PG 결제, 실시간 수용량·참가자 데이터, 실시간 위치·지도, 팀 채팅, 실시간 알림, 외부 reputation backend, external analytics는 연결하지 않았습니다.**

## Architecture

- `src/v4/platform/domain/contracts.js` — platform version, storage keys, session migration and event domain contract
- `src/v4/platform/domain/release-candidate.js` — frozen IA, stable event catalog, provider contracts, performance/accessibility budget, migration rollback contract
- `src/v4/platform/application/platform.js` — session/event application services
- `src/v4/platform/application/release-candidate.js` — provider-contract validation and v5 readiness gate
- `src/v4/platform/infrastructure/storage.js` — browser/memory storage provider and JSON repositories
- `src/v4/platform/infrastructure/provider-mocks.js` — deterministic auth/payment/capacity/notification mocks
- `src/v4/platform/presentation/bootstrap.js` — compatibility runtime bridge, migration bootstrap and local event capture
- `src/v4/platform/presentation/release-candidate.js` — RC runtime disclosure and setup accessibility hardening
- `src/v4/release-candidate.css` — semantic design-system aliases, control and reduced-motion contract
- `src/v4/case-study-release-candidate.js` — v5 RC Case Study evidence patch
- `docs/V4.9-V5-RELEASE-CANDIDATE.md` — frozen IA, provider, observability, migration, performance and promotion rules
- `tests/contracts/v4.8-platform.contract.mjs` — v4.8 platform regression contract
- `tests/contracts/v4.9-release-candidate.contract.mjs` — v4.9 provider/IA/observability/migration deterministic contract
- `tests/e2e/v4.9-core.spec.cjs`, `tests/e2e/v4-platform.spec.cjs` — core journey, full-flow axe, responsive, platform browser gates
- `tests/e2e/v4.9-case-study.spec.cjs` — 16-section v5 RC evidence / mobile / axe gate
- `scripts/check-v4.9-performance-budget.cjs` — current first-party asset budget gate
- `tests/production-v4.9-smoke.cjs`, `tests/e2e/v4.9-production.spec.cjs` — exact Production HTTP/Chromium gates
- `docs/V4.1-V5.0-ROADMAP.md` — staged product evolution plan

## QA / release process

Protected `main`은 다음 순서를 따릅니다.

`branch → PR → GitHub Actions QA → merge → exact Vercel Production verification → Render verification → durable docs sync`

문서-only merge로 `main` SHA가 이동하더라도 위 **product/runtime baseline**과 exact Production SHA는 별도로 유지합니다. 다음 staged release는 **v5.0 · Connected Matchday Platform**입니다.
