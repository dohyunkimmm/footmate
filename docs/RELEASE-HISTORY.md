# FootMate Release History

현재 릴리스 상태와 검증 기준만 간결하게 보존합니다. 세부 변경은 Git commit / Pull Request / GitHub Actions를 source of truth로 사용합니다.

## Current Release — v3.0.0 Unified App Architecture

- product/runtime baseline: `cf766cb047b23ef302f06a80429765f45511bdcf` · PR #79
- architecture introduction: `50e63eeaa4939f7a397941e7c7a8af408ad4cf92` · PR #74
- Release runtime version: `3.0.0`
- Storage/schema/Product Hardening event contract: `2.1.0` compatibility 유지
- Product visual baseline: v2.8 Matchday Visual Identity
- Product screen baseline: 39 screens
- Portfolio primary destinations: 4 · 탐색 / 추천 / 참가 / 내 정보
- Product / Portfolio visual ownership 분리
- Matching / ELO / decision / payment / persistence semantics: 유지
- exact Production release gate: **CLOSED**

### v3.0 changes

PR #74 · `50e63eea`
- v3 release/runtime boundary와 unified app architecture 도입
- 39 legacy compatibility routes를 4 primary destinations에 매핑
- `src/v3/app-shell.js`, `src/v3/ia/navigation.js`, `src/v3/state/view-state.js`, reusable components/tokens 추가
- v2.8 domain/state/matching/ELO/decision/payment contracts 유지

PR #79 · `cf766cb0`
- v3.0 Product mode의 시각 회귀를 v2.8 exact baseline 기준으로 복구
- Product는 375×780 phone/frame, notch/status bar, legacy tab navigation과 39-screen visual baseline 유지
- Portfolio mode만 v3 app rail/context/four-destination chrome 소유
- Splash/SSO readable auth surfaces와 provider identity 복구
- ELO update horizontal overflow, 320px touch target, route mapping, full-registry accessibility findings 보강
- exact v2.8 baseline과 39-screen structural/pixel/accessibility regression gate 추가

PR #81
- moving main의 v3 runtime source를 exact deployed product baseline `cf766cb0`와 다시 동일화
- Production smoke를 mutable CSS comment가 아닌 semantic Portfolio scope/ownership 기준으로 강화
- strict desktop Product geometry selector를 실제 legacy tab owner 기준으로 정렬
- product/runtime 변경 없이 QA contract만 유지

### QA

- PR #79 final run #254:
  - Regression 36 **PASS**
  - v2.4–v3.0 ownership / compatibility boundaries **PASS**
  - Browser E2E + axe **PASS**
  - 39-screen Product structure / overflow at 320 / 375 / 390 / 430 / 1280 **PASS**
  - exact v2.8 visual parity with documented corrections **PASS**
  - Portfolio full 39-route containment/accessibility **PASS**
- PR #81 final run #260:
  - Regression 36 **PASS**
  - Browser E2E + axe · full 39-screen regression **PASS**
- Exact Production baseline verification:
  - workflow `FootMate Exact Production Baseline`
  - run #2 · GitHub run ID `35427738247`
  - strict Production HTTP smoke **PASS**
  - strict Production Chromium smoke **PASS**

### Deployment / release gate

v3.0 product/runtime baseline:
- SHA: `cf766cb047b23ef302f06a80429765f45511bdcf`
- PR: #79

Exact verified Vercel Production:
- SHA: `cf766cb047b23ef302f06a80429765f45511bdcf`
- deployment: `dpl_51Gki6ZZhy2shP6QH9U1yifT98zG`
- target: `production`
- state: **READY**
- strict HTTP + Chromium: **PASS** · exact baseline run #2

Render backup is an independent deployment path and is not used as a substitute for Vercel exact Production verification. Render current-main exact SHA/deployment/live 상태는 moving main을 재귀적으로 repo 문서에 고정하지 않고 deployment source와 Notion current-state에서 유지합니다.

### v3 ownership

```text
src/v3/
  release.js
  app-shell.js
  ia/
    navigation.js
  state/
    view-state.js
  components/
  styles/
    tokens.css
    app-shell.css
    components.css
```

- v3 owns release/app-shell/IA/view-state/Portfolio chrome.
- v2.8 remains the Product visual baseline.
- `src/v2/domain/`, `src/v2/state/`, Product controllers and payment/recovery semantics remain compatibility owners.
- 39 legacy Product screens remain available.

### Next candidates

- 실제 backend 연동 시 `availability-gateway`를 server-side freshness/capacity verifier로 교체
- decision trace를 server-side durable audit/event storage로 확장
- legacy DOM/persistence compatibility ownership 추가 축소

## v2.8.0 — Matchday Visual Identity

- Product/runtime baseline: `d8014978cf6a1a5621f09ff098f48ac4821b615b` · PR #71
- Runtime: `2.8.0`
- Exact Vercel Production: `d8014978cf6a1a5621f09ff098f48ac4821b615b` · `dpl_GtHGNwyRuDYWVkuswgVHryTkHtVp` · READY
- Exact Production QA: run #221 · Regression / Browser / exact wait / strict HTTP / Chromium **PASS**
- v2.7 Visual Experience를 회귀 기준으로 sports-specific Matchday visual tokens / identity 추가
- 39 screens / 16-slide Case Study / Matching/ELO/decision/payment/persistence semantics 유지

## v2.7.0 — Visual Experience

- Product/runtime baseline: `c88c9d2` · PR #67
- Runtime: `2.7.0`
- PR QA run #203: Regression / Browser E2E + axe **PASS**
- typography, surfaces, CTA hierarchy, semantic state, responsive/accessibility visual system 정리

## v2.6.0 — Architecture Hardening

- Product/runtime baseline: `eddbaa60` · PR #65
- Exact verified Production SHA: `eddbaa607fcf1db516a1d5ab8ee27eb8dad9ad25`
- Vercel deployment: `dpl_9A1BD9X95NDccjrCMhEPsqXBBkyX`
- Exact Production QA: run #199 · Regression / Browser / exact wait / strict HTTP / Chromium **PASS**
- availability verification / decision trace persistence boundary 추가

## v2.5.0 — Decision & Recovery Experience

- Product/runtime baseline: `0e7c40c` · PR #63
- Exact verified Production SHA: `0e7c40c2d997798dbf71f74fef8f91055cca7abe`
- Vercel deployment: `dpl_4rjLPCjoNVbLAbRB8rjcbqyUYXcj`
- Exact Production QA: run #187 · Regression / Browser / exact wait / strict HTTP / Chromium **PASS**
- 추천 비교 · preflight · Payment guard · inline recovery · decision trace 도입

## v2.4.0 — Core Funnel Experience

- Product/runtime baseline: `21c6ab4` · PR #58
- Exact verified Production SHA: `b38e147` · PR #61
- Vercel deployment: `dpl_GyvevKkNYEgRkJKJrXLuAwekXmCm`
- Exact Production QA: run #182 · Regression / Browser / exact wait / strict HTTP / Chromium **PASS**
- Home → Filter → Results → Detail → Payment core funnel 고도화

## v2.3.0 — Compatibility Boundary Reduction

- Architecture baseline: `bf27784` · PR #52
- Exact verified Production SHA: `aaacbdc` · PR #55
- Vercel deployment: `dpl_86HgVTqT4aK5aCx5vhyYLipaK4W8`
- scenario persistence/presenter와 Product Experience CSS ownership을 `src/v2/`로 이동

## v2.2.0 — Inspector UI Ownership

- Product baseline: `94939d5` · PR #47
- Exact verified Production descendant: `5fbdbf4` · PR #53
- Vercel deployment: `dpl_FnD7dPN9DgMnYQMoEsd5LaUHs5kY`
- Product Validation Inspector UI ownership을 `src/v2/ui/product-inspector.js`로 이동

## v2.1.0 — Domain Engine

- Stable product/runtime baseline: `59b5af1`
- Domain Engine extraction baseline: `4393403`
- Matching / ELO 계산 ownership을 `src/v2/domain/`으로 이동
- Product Hardening event contract `2.1.0`

## v2.0.0 — Product Experience

- Stable source/runtime baseline: `a192ec1`
- Production verification: `9ff82c7`
- Product / Portfolio mode 분리
- product/scenario store 및 UI controller ownership
- 320 / 375 / 390 / 430 responsive + visual contract

## Earlier releases

- v2.0.0-beta.2 · `84c698b` · runtime/controller migration
- v2.0.0-beta.1 · `70102da` · Product Experience Architecture
- v1.1 · `8d501bd` / `ec3f8cf` · responsive/accessibility polish · manual iPhone/Android accessibility QA

## Documentation policy

- Current product/release state: `README.md`
- Release history / compatibility boundary: 이 문서
- moving `main`은 QA/docs-only merge로 전진할 수 있으므로 product/runtime baseline과 exact verified Production SHA를 별도로 유지
- Render current-main exact SHA/deployment/live 상태는 deployment source와 Notion current-state에서 유지
- exact Production이 완료되지 않은 경우 `Not yet verified`로 기록
- compatibility smoke와 exact Production verification을 구분
- Render와 Vercel은 독립적인 배포 경로로 기록
- temporary quota/rate-limit/canceled/pending 상태는 durable documentation에 누적하지 않음
- 세부 작업 로그는 Git history / PR / Actions를 source of truth로 사용
