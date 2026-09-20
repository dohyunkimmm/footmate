# FootMate v4.3.0 — Matchday Companion

FootMate는 **내 수준에 맞는 풋살 경기를 찾고, 왜 잘 맞는지 이해하고, 조건을 직접 좁힌 뒤 경기 상세에서 참가 판단을 마치고 경기 당일까지 이어지는 경험**을 설계한 인터랙티브 서비스 기획 프로젝트입니다.

## Current release

- Release: **v4.3.0 · Decision Detail**
- Primary journey: **Find → Decide → Join → Play → Return**
- Real App: `/app`
- Guided Case Study: `/app?mode=guided`
- Evidence / Reviewer mode: `/app?mode=evidence`
- Case Study: `/`
- Compatibility aliases: `/demo`, `/next` → current v4 Real App
- Product/runtime baseline: `5f21bdaac8ab68fe5ccbf323caef0ffdb4213746`
- GitHub Actions: **FootMate QA #351 · run 35476071931 · PASS**
- Exact Vercel Production: `5f21bdaac8ab68fe5ccbf323caef0ffdb4213746` · `dpl_G2Bg6oTEq4LJDWetzwoXYQtXMz6K` · **READY** · exact HTTP/Chromium smoke PASS
- Render backup: `5f21bdaac8ab68fe5ccbf323caef0ffdb4213746` · `dep-danhjl7lk1mc73fd27u0` · **LIVE** at release verification time
- Evolution roadmap: `docs/V4.1-V5.0-ROADMAP.md`

## Product decisions

v4는 화면 수보다 사용자의 결정 비용과 경기 전후 연속성을 우선합니다.

1. **Value before account** — 계정 생성 전에 지역·포지션·레벨을 설정하고 추천 가치를 먼저 확인합니다.
2. **Reason before score** — 내부 적합도는 정렬에 사용하되 사용자에게는 생활권·레벨·포지션처럼 결정에 필요한 이유를 먼저 보여줍니다.
3. **Preference-aware ranking** — 지역·포지션·레벨 설정이 실제 경기 순위와 상세 추천 이유를 바꿉니다.
4. **Recommendation as a starting point** — 추천을 기준점으로 두고 날짜·시간·거리·가격·포지션을 직접 좁혀 탐색할 수 있습니다.
5. **Recoverable discovery** — 검색 결과가 없을 때 조건 넓히기와 전체 해제를 제공하며, 탐색 상태를 URL과 브라우저 저장소에 유지합니다.
6. **Decision Detail** — v4.3부터 경기 상세에서 추천 이유, 참가자/포지션 구성, 시설·운영 규칙, 취소·환불 기준, 남은 자리, 저장·비교 상태를 한 흐름으로 판단합니다.
7. **Single participation CTA** — 경기 상세의 계약 행동은 `참가하기` 하나를 primary CTA로 유지하고 저장·비교는 보조 의도로 분리합니다.
8. **State-aware Matchday** — 참가 전 추천, 참가 후 다가오는 경기, 경기 당일 체크인, 경기 후 평가와 다음 행동으로 이어집니다.
9. **Real / Guided / Evidence separation** — 실제 사용자 화면과 리뷰어 설명·검증 UI를 분리합니다.

## Implemented scope

- Guest-first preferences → recommendation → discovery → decision detail → sign-in → checkout → confirmation
- Region / position / level-aware deterministic recommendation ranking
- Human-readable recommendation reasons shared across Home / Discover / Detail
- Discovery filters: date / time / distance / price / available position
- Discovery sorting: fit / distance / closing-soon
- Active filter summary, per-filter removal and clear-all
- Zero-result recovery with condition widening
- Discovery state persistence in `footmate:v4:discovery` + `d_*` URL query parameters
- Accessible responsive filter sheet: dialog semantics, Escape close, focus trap/restore and 44px+ targets
- Decision Detail recommendation reason breakdown
- Clearly disclosed sample remaining-seat and participant-position composition
- Facility / operating-rule / gear information with prototype sample-data disclosure
- Cancellation / refund timing visualization without inventing unsupported policy rules
- Persistent saved-match intent in `footmate:v4:decision`
- Max-two-match comparison with accessible dialog, Escape close and focus restore
- Non-exaggerated availability wording; sample capacity is not presented as realtime inventory
- Sample match coverage across Suwon, Yongin and Seoul
- ID/password sign-in UI, sign-up validation and consent UX
- Kakao · Naver · Apple · Google SSO selection UI
- Selected-match continuity across sign-in and checkout
- Entry-aware detail return navigation
- Match-specific persistent check-in completion state
- Date-safe, clearly disclosed sample schedules for the prototype
- SPA route focus management for keyboard / screen-reader continuity
- Responsive 320 / 375 / 390 / 430px
- Real App / Guided / Evidence mode isolation
- 16-section product-first Case Study with Recommendation Core + Discovery & Search + Decision Detail evidence
- Case Study desktop companion panels rebalanced for readable width and spacing; structured Matchday / Recovery / Outcome panels retain card/grid hierarchy
- Case Study source-level editorial QA: Korean copy, heading/body text flow, mobile overflow, desktop/mobile review screenshots and axe accessibility gate

## Prototype boundary

FootMate v4.3.0은 서비스 기획 검증용 인터랙티브 프로토타입입니다. 현재 추천은 **규칙 기반 explainable ranking + 샘플 데이터 + 브라우저 세션 상태**로 동작하고, 탐색은 deterministic filter/sort와 브라우저/URL persistence로 동작합니다. Decision Detail의 **잔여 자리, 참가자 구성, 시설·운영 정보는 명시된 prototype sample data**이며 realtime 운영 데이터가 아닙니다. **외부 AI 모델, 회원 DB, 실제 OAuth, 실제 PG 결제, 실시간 수용량, 실시간 참가자 데이터, 실시간 알림 backend는 연결하지 않았습니다.** 로그인·결제·운영 상태는 서비스 계약을 검증하기 위한 시뮬레이션입니다.

## Architecture

- `src/v4/` — 공식 v4 Real App, Case Study, experience, recommendation, discovery and decision ownership
- `app.html` — official Real App entry
- `index.html` — official v4 Case Study entry
- `src/v4/experience.js` / `experience.css` — account UX, validation and interaction safeguards
- `src/v4/recommendation.js` — v4.1 preference-aware explainable ranking layer retained as the ranking contract
- `src/v4/discovery.js` / `discovery.css` — v4.2 filtering, sorting, recovery, URL/session persistence and filter-sheet interaction
- `src/v4/decision.js` / `decision.css` — v4.3 Decision Detail save/compare state, detail evidence, policy and accessibility interaction
- `src/v4/case-study-recommendation.js` — Recommendation Core Case Study evidence
- `src/v4/case-study-discovery.js` — Discovery & Search Case Study evidence
- `src/v4/case-study-decision.js` — v4.3 Decision Detail Case Study evidence
- `tests/e2e/v4-app.spec.cjs` — browser / recommendation / responsive / accessibility / state gate
- `tests/e2e/v4-discovery.spec.cjs` — filter / sort / persistence / zero-result / mobile dialog gate
- `tests/e2e/v4-decision.spec.cjs` — Decision Detail disclosure / save / compare / keyboard / accessibility gate
- `tests/e2e/v4-case-study.spec.cjs` — 16-section editorial / layout / overflow / axe gate
- `tests/production-v4-smoke.cjs` — exact Production HTTP gate
- `tests/e2e/v4-production.spec.cjs` — exact Production Chromium gate
- `scripts/check-v4-boundary.cjs` — current-tree release and legacy-boundary checker
- `docs/V4.1-V5.0-ROADMAP.md` — staged product evolution plan

현재 public branch는 v4 소스와 v4 QA 계약만 유지합니다. `/demo`와 `/next`는 과거 제품을 노출하지 않고 현재 v4 Real App으로 연결됩니다. GitHub 저장소가 public인 동안 과거 commit history 자체는 GitHub 특성상 공개 이력으로 남습니다.

## QA / release process

Protected `main`은 다음 순서를 따릅니다.

`branch → PR → GitHub Actions QA → merge → exact Vercel Production verification → Render verification → durable docs sync`

문서-only merge로 `main` SHA가 이동하더라도 위 **product/runtime baseline**과 exact Production SHA는 별도로 유지해 제품 검증 기준과 moving `main`을 구분합니다. 각 minor release는 exact Production 검증과 durable release sync를 닫은 뒤 다음 단계로 이동합니다. 다음 단계는 **v4.4 · Join & Payment State Machine**입니다.
