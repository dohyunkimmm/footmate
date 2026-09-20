# FootMate v4.7.0 — Matchday Companion

FootMate는 **내 수준에 맞는 풋살 경기를 찾고, 왜 잘 맞는지 이해하고, 조건을 직접 좁힌 뒤 참가·결제·경기 당일 운영·경기 후 피드백을 거쳐 다음 방문의 추천 조건까지 이어지는 경험**을 검증하는 인터랙티브 서비스 기획 프로젝트입니다.

## Current release

- Release: **v4.7.0 · Personalization & Memory**
- Primary journey: **Find → Decide → Join → Play → Return**
- Real App: `/app`
- Guided Case Study: `/app?mode=guided`
- Evidence / Reviewer mode: `/app?mode=evidence`
- Case Study: `/`
- Compatibility aliases: `/demo`, `/next` → current v4 Real App
- Product/runtime baseline: `117c6ee36e91344355644811410a88898c279f21`
- GitHub Actions: **FootMate QA #381 · run 35487802885 · PASS**
- Exact Vercel Production: `117c6ee36e91344355644811410a88898c279f21` · `dpl_6TFsiiKXNzkrbxD6V1xdMQEhoJHF` · **READY** · exact HTTP/Chromium smoke PASS
- Render backup: `117c6ee36e91344355644811410a88898c279f21` · `dep-danli4btqb8s73alhnp0` · **LIVE** at release verification time
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
12. **Explain and reset** — 사용자는 `왜 추천됐나요?`에서 개인화 근거를 확인하고 개인화 기록을 별도로 초기화할 수 있습니다.
13. **Explicit integration boundary** — 실제 OAuth·PG·실시간 수용량·위치·채팅·알림·reputation backend·회원 DB·server memory·cross-device sync는 연결하지 않은 simulation/sample 영역으로 명시합니다.
14. **Real / Guided / Evidence separation** — 실제 사용자 화면과 리뷰어 설명·검증 UI를 분리합니다.

## Implemented scope

- Guest-first preferences → recommendation → discovery → decision detail → sign-in → checkout → payment state → matchday operations → postgame return
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
- explainable personalization adjustment layered on the verified Recommendation + Return ranking contract
- personalization reset isolated from participation and Return persistence
- explicit no-public-reputation and no-server-memory boundaries
- ID/password sign-in UI, sign-up validation and Kakao · Naver · Apple · Google SSO selection UI as simulation
- SPA route focus management, responsive 320 / 375 / 390 / 430px, Real / Guided / Evidence isolation
- 16-section Case Study with Recommendation Core + Discovery & Search + Decision Detail + Join & Payment + Matchday Operations + Return Loop + Personalization evidence
- Browser E2E + axe and exact Production HTTP/Chromium gates

## Prototype boundary

FootMate v4.7.0은 서비스 기획 검증용 인터랙티브 프로토타입입니다. 추천·Return Loop·Personalization은 **규칙 기반 explainable ranking + 샘플 데이터 + 브라우저 상태**로 동작합니다. Decision Detail의 잔여 자리·참가자 구성·시설·운영 정보, Join & Payment의 결제 수단과 결제 상태, Matchday Operations의 arrival/check-in/update/cancel, Return Loop의 postgame 피드백과 개인 이력은 deterministic sample/simulation입니다.

Personalization의 저장 프로필·최근 확인 경기·선호 지역/시간/포맷은 현재 브라우저 로컬 저장소에만 남습니다. **외부 AI 모델, 회원 DB, server memory, cross-device sync, 실제 OAuth, 실제 PG 결제, 실시간 수용량·참가자 데이터, 실시간 위치·지도, 팀 채팅, 실시간 알림, 외부 reputation backend는 연결하지 않았습니다.**

## Architecture

- `src/v4/` — 공식 v4 Real App / Case Study runtime ownership
- `src/v4/experience.js` / `experience.css` — account UX, validation and interaction safeguards
- `src/v4/recommendation.js` — v4.1 preference-aware explainable ranking contract
- `src/v4/discovery.js` / `discovery.css` — v4.2 filtering, sorting, recovery, URL/session persistence
- `src/v4/decision.js` / `decision.css` — v4.3 Decision Detail save/compare/evidence/policy interaction
- `src/v4/participation.js` / `participation.css` — v4.4 payment state, attempt snapshot and recovery ownership
- `src/v4/matchday.js` / `matchday.css` — v4.5 Matchday Operations state and recovery ownership
- `src/v4/return.js` / `return.css` — v4.6 postgame feedback, personal history and recommendation-adjustment ownership
- `src/v4/personalization.js` / `personalization.css` — v4.7 local preference memory, recent behavior, favorite signals, explanation and reset ownership
- `src/v4/case-study-*.js` — staged 16-section Case Study evidence patches
- `tests/e2e/v4.7-core.spec.cjs` — current core journey / modes / responsive / accessibility gate
- `tests/e2e/v4-discovery.spec.cjs`, `v4-decision.spec.cjs`, `v4-participation.spec.cjs`, `v4-matchday.spec.cjs`, `v4-return.spec.cjs`, `v4-personalization.spec.cjs` — staged regression and state gates
- `tests/e2e/v4.7-case-study.spec.cjs` — 16-section Personalization evidence / mobile / axe gate
- `tests/production-v4.7-smoke.cjs`, `tests/e2e/v4.7-production.spec.cjs` — exact Production HTTP/Chromium gates
- `scripts/check-v4.7-boundary.cjs` — current-tree v4.7 release boundary
- `docs/V4.1-V5.0-ROADMAP.md` — staged product evolution plan

## QA / release process

Protected `main`은 다음 순서를 따릅니다.

`branch → PR → GitHub Actions QA → merge → exact Vercel Production verification → Render verification → durable docs sync`

문서-only merge로 `main` SHA가 이동하더라도 위 **product/runtime baseline**과 exact Production SHA는 별도로 유지합니다. 다음 staged release는 **v4.8 · Platform Architecture**입니다.
