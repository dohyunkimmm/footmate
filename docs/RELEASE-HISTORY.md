# FootMate Release History

이 문서는 현재 public branch의 **검증된 durable release 사실**을 기록한다. 일시적인 Preview 취소·quota·대기 상태는 누적하지 않는다. docs-only merge로 moving `main`이 바뀌어도 각 release의 product/runtime baseline과 exact Production SHA는 별도로 유지한다.

## v5.1.1 — AI Match Assistant Resilience Patch · 2026-09-20

**Status:** Verified patch release · release-readiness surface freeze complete.

- Scope: AI primary provider 안정화, bounded server/browser timeout, provider/rules fallback recovery, reload state consistency, request/cost guard, 제품 사실 문구 정정, release-facing surface 정리
- User-facing release surface: 제품명·Case Study·README는 버전 독립적인 현재 제품 설명을 사용하고 내부 release/QA/deployment 식별자는 `v5.1.1`로 유지
- AI Agent Workflow: `Context → Plan → Tools → Guardrail → Observe`
- Ranking boundary: AI는 자연어 검색 조건만 해석하며 실제 경기 후보·순위·추천 이유는 기존 deterministic recommendation engine이 소유
- Primary AI model: `inclusionai/ling-3.0-flash-vl-free`
- Provider fallback model: `inclusionai/ling-3.0-flash-fin-free`
- Reasoning boundary: constraint extraction은 `reasoning.effort = none`
- Timeout boundary: provider request 3s / browser request 7s / Vercel Function maxDuration 10s
- Request guard: same-origin, Fetch Metadata, JSON content-type, 16KB body limit, instance-local per-IP/global rate window
- Persistence: 기존 `footmate:v5.1:ai` key 유지; reload 후 UI mode와 `window.__FOOTMATE_AI__.mode` 복원
- HITL: join/payment 자동 실행 없음
- Data boundary: `/app` 경기·가격·잔여 자리·주소·참가자 구성은 sample records 기준이며 AI가 생성하지 않음; `/beta`는 별도 Supabase connected 경로
- Hotfix implementation PRs: #123 · #124
- Version sync PR: #125
- Release-readiness surface cleanup PR: #128 · PR QA #448 · run `35510271305` · PASS
- Product/runtime baseline at surface freeze: `ed6b084719738a70bdc93f3bcca78f5f1ecf1e48`
- Post-merge QA: FootMate QA #449 · run `35510438544` · PASS
- Regression 36: PASS
- Browser E2E + axe: PASS
- Exact Vercel Production at surface freeze: `dpl_F9SKqKt2his5v7K1PogXH2HSwMzz` · SHA `ed6b084719738a70bdc93f3bcca78f5f1ecf1e48` · READY
- Exact Production HTTP smoke: PASS
- Exact Production AI inference: PASS · `inclusionai/ling-3.0-flash-vl-free` · `fallbackUsed=false`
- Exact Production Chromium smoke: PASS · 2/2
- Render backup at surface freeze: `dep-dant04ss728c73b4g6t0` · SHA `ed6b084719738a70bdc93f3bcca78f5f1ecf1e48` · LIVE at verification time

### Closed Beta release-readiness closure · 2026-09-20

- Scope: Supabase backend foundation, position-aware capacity, RLS/security hardening, connected user Beta, allowlisted operator match/participant operations
- Backend foundation / capacity / security PRs: #130 · #131 · #132
- Connected user runtime: PR #133
- Production Chromium smoke selector fix: PR #134
- Operator blocker closure: PR #135 · PR QA #471 · run `35543950160` · PASS
- Product/runtime baseline at blocker closure: `b84b571c4d62070109089cf515fa9eb63f338f53`
- Post-merge QA: FootMate QA #472 · run `35544089076` · PASS
- Regression 36: PASS
- Browser E2E + axe: PASS
- Supabase: `beta_operator_console` migration applied; Auth/profile/match/position capacity/participation/user join-cancel/operator match-participant operations connected
- Security boundary: RLS + authenticated RPC; operator RPC는 추가로 `public.operators` allowlist를 검증하며 browser service-role credentials 없음
- Operator provisioning boundary: normal Beta account를 만든 뒤 `public.operators`에 명시적으로 allowlist; self-service admin bootstrap 없음
- Exact Vercel Production at blocker closure: `dpl_AA4AbahVZK65imQ1Tb12TMFBs6Zm` · SHA `b84b571c4d62070109089cf515fa9eb63f338f53` · READY
- Exact Production HTTP smoke: PASS
- Exact Production AI inference: PASS
- Exact Production Chromium smoke: PASS
- Render backup at blocker closure: `dep-dao6hvbtqb8s73b3ms7g` · SHA `b84b571c4d62070109089cf515fa9eb63f338f53` · LIVE at verification time
- Integration boundary: Closed Beta participation은 free-only; 실제 PG·notification delivery·external analytics는 미연동

### Closed Beta Must hardening · 2026-09-21

- Scope: network timeout/offline recovery, real DB cancellation hotfix, operation audit trail, freshness recovery, 8-character signup minimum, authenticated account deletion, audit FK indexing, Case Study/product fact sync preparation
- Must runtime PRs: #141 · #142 · #144
- Current verified runtime baseline: `ef091b85ce0c8476bafdb6ed1c10cf590015cd80`
- Post-merge QA: FootMate QA run `35547957515` · final rerun PASS
- Regression 36: PASS
- Browser E2E + axe: PASS
- Exact Vercel Production: `dpl_CEaaaDf7byTQxaJcZAGYK5ZwXj8H` · SHA `ef091b85ce0c8476bafdb6ed1c10cf590015cd80` · READY
- Exact Production HTTP smoke: PASS
- Exact Production AI inference: PASS
- Exact Production Chromium smoke: PASS
- Supabase migration: `beta_operation_audit_indexes` applied; audit foreign-key coverage warnings cleared
- Supabase Edge Function: `delete-account` ACTIVE with JWT verification enabled; browser에 privileged Auth key를 노출하지 않음
- Privacy boundary: Beta UI는 저장 데이터 범위를 명시하고, 계정 삭제는 사용자의 명시적 확인 뒤 server-side Auth deletion으로 처리하며 성공 시 local session을 제거
- Observability boundary: `beta_operation_events`는 event type / actor·subject UUID / match·participation UUID / position / time 중심의 최소 audit를 저장하고 email/name을 payload에 저장하지 않음
- Security advisor remaining warnings: authenticated SECURITY DEFINER RPC 5개는 의도된 user/operator transaction entrypoint이며 각 함수 내부 auth/operator 검증을 유지; leaked-password protection은 현재 Supabase 프로젝트에서 비활성
- Automated responsive coverage: 320 / 375 / 390 / 430px PASS
- Manual gates: 물리 기기와 수동 접근성 검증은 자동 QA와 분리하며 이 문서에서 완료로 주장하지 않음
- Integration boundary: `/app`는 sample/mock 경계를 유지하고 `/beta`는 Supabase connected; 실제 PG·notification delivery·external analytics는 미연동

## v5.1.0 — AI Match Assistant · 2026-09-20

**Status:** Verified AI feature release.

- Scope: 자연어 경기 탐색, Vercel AI Gateway inference, structured constraint extraction, provider fallback, browser rules fallback, HITL join/payment boundary
- AI Agent Workflow: `Context → Plan → Tools → Guardrail → Observe`
- Ranking boundary: AI는 검색 조건만 해석하며 실제 경기 후보·순위·추천 이유는 기존 deterministic recommendation engine이 소유
- Primary AI model: `openai/gpt-5.4-mini`
- Provider fallback model: `inclusionai/ling-3.0-flash-vl-free`
- Authentication: configured AI Gateway credential 또는 Vercel deployment OIDC
- Compatibility boundary: v5.0 recommendation / participation / matchday / return domain ownership, browser persistence, v4.9 compatibility runtime 유지
- HITL: join/payment 자동 실행 없음
- Data boundary: 경기·가격·잔여 자리·주소·참가자 구성은 current runtime sample records 기준; AI가 생성하지 않음
- Feature PR: #118
- Production fixes: #119 · #120 · #121
- Product/runtime baseline: `7d0ee9307ba952e386c97b14c185fa24ebb38ed1`
- Post-merge QA: FootMate QA #435 · run `35504620675` · PASS
- Regression 36: PASS
- Browser E2E + axe: PASS
- Exact Vercel Production: `dpl_4FChZeQLWWgPdcUBdG6uSZVExQrV` · SHA `7d0ee9307ba952e386c97b14c185fa24ebb38ed1` · READY
- Exact Production HTTP smoke: PASS
- Exact Production AI inference: PASS
- Exact Production Chromium smoke: PASS
- Render backup: `dep-danr55p7lnhs73edu80g` · SHA `7d0ee9307ba952e386c97b14c185fa24ebb38ed1` · LIVE at verification time

## v5.0.0 — Connected Matchday Platform · 2026-09-20

**Status:** Verified major architecture release.

- Scope: recommendation / participation / matchday / return domain separation, injectable provider registry, provider connection disclosure, cross-domain state consistency guardrail, v5 Case Study/QA/Production gates
- Journey contract: `Find → Decide → Join → Play → Return`
- Compatibility boundary: v4.9 product UX, session schema v2, local persistence/event contract, recovery and accessibility behavior retained
- Domain boundary: recommendation / participation / matchday / return ownership and normalization are explicit
- Consistency guardrail: selected match → participation success → matchday check-in → Return의 match identity와 상태 순서를 deterministic contract로 검증
- Provider boundary: auth/payment/capacity/notification은 injectable registry로 분리되었으나 current Production mode는 `mock-only`; connected providers 없음
- Integration boundary: 실제 OAuth·회원 DB·PG·realtime capacity/participant backend·notification delivery·external AI inference·external analytics 미연동
- Performance measurement: app HTML `2,422B` · CSS `56,112B` · JS `144,952B` · first-party CSS/JS requests `21` · frozen budget PASS
- Accessibility / responsive: full decision flow serious/critical axe violations 0, 320/375/390/430 coverage and existing recovery regression PASS
- Case Study: 16-section IA 유지; Domain Architecture / Provider Registry / v5 Validation / Production Boundary evidence로 v5 구현과 한계를 동기화
- Feature PR: #115
- Final PR QA: FootMate QA #411 · run `35497512505` · PASS
- Product/runtime baseline: `031873c2d6e83a0b531ee1503bd6845aa95b7618`
- Post-merge QA: FootMate QA #412 · run `35497619885` · PASS
- Exact Vercel Production: `dpl_EhsahEM5UAD85BbytAjiWcge3enU` · SHA `031873c2d6e83a0b531ee1503bd6845aa95b7618` · READY
- Exact Production HTTP smoke: PASS
- Exact Production Chromium smoke: PASS
- Render backup: `dep-danot26q1p3s73ckn19g` · SHA `031873c2d6e83a0b531ee1503bd6845aa95b7618` · LIVE at verification time

## v4.9.0 — v5 Release Candidate · 2026-09-20

**Status:** Verified release candidate.

- Scope: final IA, semantic design-system contract, performance budget, full-flow accessibility, stable event naming, auth/payment/capacity/notification provider mocks, session migration/rollback rehearsal, v5 Case Study narrative
- Frozen IA: `welcome → setup → home → discover → detail → auth → checkout → success → schedule → profile`
- Design-system boundary: 기존 v4 visual token을 semantic alias로 묶고 44px control baseline과 reduced-motion 기준을 공통 contract로 고정
- Observability boundary: recommendation.selected / join.started / join.completed / checkin.completed / postgame.submitted event names와 schema를 유지하며 delivery는 `local-only`; external analytics 미연동
- Provider boundary: auth/payment/capacity/notification은 deterministic mock이며 `external: false`; 실제 OAuth·회원 DB·PG·realtime capacity·notification backend 미연동
- Migration boundary: session schema v2 유지; migration 전 checkpoint와 원본 rollback rehearsal을 deterministic contract로 검증
- Performance budget: app HTML ≤ 16KB · first-party CSS ≤ 180KB · JS ≤ 320KB · first-party CSS/JS requests ≤ 24
- Verified performance measurement: app HTML `2,337B` · CSS `56,044B` · JS `142,101B` · first-party CSS/JS requests `20`
- Accessibility: welcome → setup → home → detail → auth → checkout full-flow serious/critical axe violations 0; 320/375/390/430 responsive coverage
- Feature PR: #113
- Final PR QA: FootMate QA #405 · run `35495751133` · PASS
- Product/runtime baseline: `702ed926f47749802e323a67c92e2552ceadd271`
- Post-merge QA: FootMate QA #406 · run `35495900622` · PASS
- Exact Vercel Production: `dpl_Ar2C7xD2NopX1YN85RpXaQN4ShG6` · SHA `702ed926f47749802e323a67c92e2552ceadd271` · READY
- Exact Production HTTP smoke: PASS
- Exact Production Chromium smoke: PASS
- Render backup: `dep-danob1navr4c73ajij90` · SHA `702ed926f47749802e323a67c92e2552ceadd271` · LIVE at verification time

## v4.8.0 — Platform Architecture · 2026-09-20

**Status:** Verified staged architecture release.

- Scope: domain → application → infrastructure → presentation bridge 경계, session schema migration, browser/memory storage provider, JSON repository, local event contract
- Session boundary: 기존 `footmate:v4:session`의 unversioned/legacy 상태를 schema v2로 정규화하면서 v4.7 runtime UX를 compatibility layer로 보존
- Provider boundary: runtime persistence는 browser `localStorage`; memory provider는 deterministic contract test용이며 회원 DB·원격 저장소는 미연동
- Event boundary: `footmate:v4:events`에 recommendation.selected / join.started / join.completed / checkin.completed / postgame.submitted를 sequence·dedupe 계약으로 기록; external analytics 미연동
- Compatibility fix: 취소된 participation snapshot을 checkout observer가 덮어쓰지 않도록 `canceled` 상태 ownership 보강
- Feature PR: #111
- Final PR QA: FootMate QA #400 · run `35494541917` · PASS
- Product/runtime baseline: `076950f257fce3c5e445d0801c998fc935265dd8`
- Post-merge QA: FootMate QA #401 · run `35494664726` · PASS
- Exact Vercel Production: `dpl_Av3cxidUfJ2vj5hHowCtFg3zAfHq` · SHA `076950f257fce3c5e445d0801c998fc935265dd8` · READY
- Exact Production HTTP smoke: PASS
- Exact Production Chromium smoke: PASS
- Render backup: `dep-danntpgjo6nc739md83g` · SHA `076950f257fce3c5e445d0801c998fc935265dd8` · LIVE at verification time

## v4.7.0 — Personalization & Memory · 2026-09-20

**Status:** Verified staged feature release.

- Scope: saved local preference profile, returning-user quick resume, recent-match behavior, favorite area/time/format signals, personalized recommendation reasons, explicit reset/edit controls
- Persistence: `footmate:v4:personalization`
- Ranking boundary: verified Recommendation + Return contract 위에 deterministic personalization adjustment를 보조 신호로 추가
- Privacy boundary: 회원 DB·server memory·cross-device sync 미연동; 개인화 상태는 현재 브라우저 로컬 저장소에만 유지
- Accessibility hardening: personalization controls 44px+, 320/375/390/430 responsive coverage, inactive navigation contrast 보강
- Feature PR: #108
- Final PR QA: FootMate QA #380 · run `35487691154` · PASS
- Product/runtime baseline: `117c6ee36e91344355644811410a88898c279f21`
- Post-merge QA: FootMate QA #381 · run `35487802885` · PASS
- Exact Vercel Production: `dpl_6TFsiiKXNzkrbxD6V1xdMQEhoJHF` · SHA `117c6ee36e91344355644811410a88898c279f21` · READY
- Exact Production HTTP smoke: PASS
- Exact Production Chromium smoke: PASS
- Render backup: `dep-danli4btqb8s73alhnp0` · SHA `117c6ee36e91344355644811410a88898c279f21` · LIVE at verification time

## v4.6.0 — Return Loop & Reputation · 2026-09-20

**Status:** Verified staged feature release.

- Scope: postgame perceived-difficulty feedback, attendance/completion history, repeat intent, feedback-aware next recommendation, personal-history disclosure
- Persistence: `footmate:v4:return`
- Reputation boundary: 개인 히스토리와 추천 보조 신호만 저장하며 공개 신뢰도·스포츠맨십 점수는 만들지 않음
- Integration boundary: external reputation backend 미연동
- Feature PR: #106
- Final PR QA: FootMate QA #373 · run `35486637299` · PASS
- Product/runtime baseline: `409adefd40698a7c30202ad6e570445bde8dea8c`
- Post-merge QA: FootMate QA #374 · run `35486719124` · PASS
- Exact Vercel Production: `dpl_Cz6RLRiM9DgSTod8QrNGCxEDQghA` · SHA `409adefd40698a7c30202ad6e570445bde8dea8c` · READY
- Exact Production HTTP smoke: PASS
- Exact Production Chromium smoke: PASS
- Render backup: `dep-danl6cp7lnhs73ea5cp0` · SHA `409adefd40698a7c30202ad6e570445bde8dea8c` · LIVE at verification time

## v4.5.0 — Matchday Operations · 2026-09-20

**Status:** Verified staged feature release.

- Scope: separate Matchday Operations persistence, `upcoming → matchday → checked-in`, arrival/late recovery, operational update acknowledgement, cancellation recovery, venue/check-in/team-notice UX
- Persistence: `footmate:v4:matchday`
- Integration boundary: realtime location, map routing, team chat and notification backend 미연동
- Feature PR: #103 · final PR QA #364 · run `35484349288` · PASS
- Production locator fix PR: #104 · QA #366 · run `35485163542` · PASS
- Product/runtime baseline: `072eff6e597c98bb370ece61cba4e74d5975c4a3`
- Post-merge QA: FootMate QA #367 · run `35485268368` · PASS
- Exact Vercel Production: `dpl_DQWXcq8BHG5ZHsudN2YWaEZz8xUY` · exact SHA · READY
- Exact Production HTTP/Chromium smoke: PASS
- Render backup: `dep-dankmf2jnfac738vj0u0` · exact SHA · LIVE at verification time

## v4.4.0 — Join & Payment State Machine · 2026-09-20

**Status:** Verified staged feature release.

- Scope: `checkout → pending → success | failure | canceled`, payment-method simulation, duplicate-submit guard, reload-safe pending restoration, failure retry, cancel recovery, immutable attempt snapshot
- Persistence: `footmate:v4:participation`
- Integration boundary: 실제 PG 미연동; payment states/methods는 deterministic simulation
- Feature PR: #101 · final PR QA #356 · run `35483267720` · PASS
- Product/runtime baseline: `27f78394c32475e818afd97bf590d6448403f938`
- Post-merge QA: FootMate QA #357 · run `35483442042` · PASS
- Exact Vercel Production: `dpl_GS2Cotyf5UFdDA4gyoCfMFqfa5Pq` · exact SHA · READY
- Exact Production HTTP/Chromium smoke: PASS
- Render backup: `dep-dank2n8jo6nc739k8egg` · exact SHA · LIVE at verification time

## v4.3.0 — Decision Detail · 2026-09-20

**Status:** Verified staged feature release.

- Scope: recommendation reason breakdown, disclosed sample participant/position composition, facility/operation information, refund timing, save intent, max-two comparison
- Persistence: `footmate:v4:decision`
- Data boundary: capacity/participant/facility data는 prototype sample이며 realtime inventory가 아님
- Feature PR: #99 · final PR QA #350 · run `35475947701` · PASS
- Product/runtime baseline: `5f21bdaac8ab68fe5ccbf323caef0ffdb4213746`
- Post-merge QA: FootMate QA #351 · run `35476071931` · PASS
- Exact Vercel Production: `dpl_G2Bg6oTEq4LJDWetzwoXYQtXMz6K` · exact SHA · READY
- Exact Production HTTP/Chromium smoke: PASS
- Render backup: `dep-danhjl7lk1mc73fd27u0` · exact SHA · LIVE at verification time

## v4.2.0 — Discovery & Search · 2026-09-20

**Status:** Verified staged feature release.

- Scope: date/time/distance/price/position filters, fit/distance/closing-soon sort, zero-result recovery, URL/session persistence, accessible mobile filter sheet
- Persistence: `footmate:v4:discovery` + `d_*` URL query parameters
- Feature PR: #97 · final PR QA #343 · run `35473512165` · PASS
- Product/runtime baseline: `896be56a2e2438fd383c46152ad8f1d5f11e89b0`
- Post-merge QA: FootMate QA #344 · run `35473666410` · PASS
- Exact Vercel Production: `dpl_oiHYN6EaeNumD3GsmQKDQyjt6xpg` · exact SHA · READY
- Exact Production HTTP/Chromium smoke: PASS
- Render backup: `dep-dangrd17lnhs73e7cr40` · exact SHA · LIVE at verification time

## v4.1.0 — Recommendation Core · 2026-09-20

**Status:** Verified staged feature release.

- Scope: region/position/level-aware deterministic ranking, human-readable recommendation reasons, Home/Discover/Detail shared recommendation contract
- Ranking boundary: external AI inference가 아닌 sample records + deterministic rules
- Feature PR: #95 · final PR QA #338 · run `35456601863` · PASS
- Product/runtime baseline: `352ffe08a72e145311e043f1292950d8a3041859`
- Post-merge QA: FootMate QA #339 · run `35456762270` · PASS
- Exact Vercel Production: `dpl_HyZn9wb5boHQ3wZTUNMFsuMSRkVC` · exact SHA · READY
- Exact Production HTTP/Chromium smoke: PASS
- Render backup: `dep-danbvlvavr4c73aab5s0` · exact SHA · LIVE at verification time

## v4.0.1 — Matchday Companion hardening · 2026-09-19

**Status:** Verified patch release.

- Scope: Guided/Evidence return path, date-safe sample schedules, match-specific check-in persistence, SPA focus, validation/detail continuity, repository/runtime consolidation, Case Study layout hardening
- Runtime/repository hardening PR: #92
- Case Study/Production smoke closure PR: #93 · PR QA #332 · run `35454879661` · PASS
- Product/runtime baseline: `b2509f5759194ab0db46a8c5429f3b422e9c59d8`
- Post-merge QA: FootMate QA #333 · run `35455137726` · PASS
- Exact Vercel Production: `dpl_AEtpPnZpPQqTXA4DhUuRB7yJgzE8` · exact SHA · READY at verification time
- Exact Production HTTP/Chromium smoke: PASS
- Render backup: `dep-danbgvbtqb8s73adkk00` · exact SHA · LIVE at verification time

## v4.0.0 — Matchday Companion · 2026-09-19

**Status:** Official Major release.

- Scope: official `/app`, Case Study `/`, `/demo` and `/next` compatibility aliases, guest-first Value → Preferences → Recommendation → Detail → Sign in → Checkout → Matchday flow, Real/Guided/Evidence separation, product-first 16-section Case Study
- PR #90 editorial/release closeout QA: FootMate QA #326 · run `35449028478` · PASS
- Product/runtime baseline: `130231c935958651e9e2e50e1dbda3df3df978f3`
- Post-merge QA: FootMate QA #327 · run `35449553358` · PASS
- Exact Vercel Production: `dpl_69iQCJKfXtC3i8ZwWqKvLjJcfdEh` · exact SHA · READY at verification time
- Exact Production HTTP/Chromium smoke: PASS
- Render backup: `dep-dan9ujrtqb8s73abvdjg` · exact SHA · LIVE at verification time

## Shared prototype boundary

v4.x → v5.0은 인터랙티브 서비스 기획 프로토타입의 단계적 제품/아키텍처 진화다. v5.1에서는 AI Match Assistant의 Vercel AI Gateway inference가 실제 Production에서 검증되었다. v5.1.1에서는 AI primary path, bounded recovery, state consistency와 request guard를 강화했고, release-readiness 단계에서 `/beta`의 Supabase Auth·member profile·match catalog·position capacity·participation 및 `/beta/operator`의 allowlisted 경기/참가자 운영 경로를 실제 backend에 연결했다. 이후 Must hardening에서 network/offline recovery, minimal audit, account deletion, data-freshness boundary를 추가했다. 현재 `/app`의 경기 데이터와 추천 순위는 sample records + deterministic recommendation engine이 Source of Truth이며, `/beta`는 별도의 connected data path다. 실제 OAuth, PG 결제, notification delivery, realtime map/location, team chat, reputation backend, external analytics는 현재도 연결하지 않았다.

GitHub commit history는 historical repository data로 유지되며 current product surface와 구분한다.
