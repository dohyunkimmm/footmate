# FootMate Release History

현재 릴리스 상태와 검증 기준만 간결하게 보존합니다. 세부 변경은 Git commit / Pull Request / GitHub Actions를 source of truth로 사용합니다.

## Current Release — v2.8.0 Matchday Visual Identity

- product/runtime baseline: `d8014978cf6a1a5621f09ff098f48ac4821b615b` · PR #71
- Release runtime version: `2.8.0`
- baseline visual experience: v2.7 Visual Experience
- release adapter: `src/v2/v28-release.js`
- visual identity module: `src/v2/ui/visual-identity-experience.js`
- visual token ownership: `src/v2/styles/visual-tokens.css`
- visual ownership: `src/v2/styles/visual-identity.css`
- visual guardrails: `src/v2/styles/visual-guardrails.css`
- Storage/schema/Product Hardening event contract: `2.1.0` compatibility 유지
- v2.2 / v2.3 / v2.4 / v2.5 / v2.6 / v2.7 runtime compatibility 유지
- Product / Portfolio mode: 유지
- Product screen baseline: 39 screens
- Case Study information architecture: 16 slides
- Matching / ELO / decision / payment / persistence semantics: 유지
- exact Production release gate: **CLOSED**

### v2.8 changes

PR #71 · `d8014978`
- 검증된 v2.7 Visual Experience를 회귀 기준으로 사용
- pitch green + lime 기반 Matchday visual tokens와 sports-specific visual identity 도입
- Home decision hero, Filter selection, Results match ticket/featured state, Detail Match Preview/preflight, Payment guard의 시각 위계 고도화
- `visual-identity-experience.js`가 v2.8 DOM identity ownership과 dynamic refresh를 소유
- `visual-identity.css` / `visual-tokens.css` / `visual-guardrails.css`로 visual ownership을 분리
- dynamic Results/Detail 렌더 이후 identity refresh, narrow-screen decorative containment, muted text contrast를 browser/axe gate 기준으로 보강
- 320 / 375 / 390 / 430 px responsive, >=44px touch target, reduced-motion compatibility 유지
- 39-screen Product, 16-slide Case Study, Matching/ELO, decision/recovery, availability boundary, trace persistence를 회귀 기준으로 유지
- 실제 backend capacity/freshness API, payment, DB, LLM 연동은 추가하지 않음

### QA

- PR #71 final run #220:
  - Regression 36 **PASS**
  - v2.4 component/source boundary **PASS**
  - v2.5 decision/recovery boundary **PASS**
  - v2.6 architecture ownership boundary **PASS**
  - v2.7 visual compatibility boundary **PASS**
  - v2.8 visual identity boundary **PASS**
  - Browser E2E + axe · responsive · v2.8 visual gate **PASS**
- main exact verification run #221 on `d8014978cf6a1a5621f09ff098f48ac4821b615b`:
  - Regression 36 **PASS**
  - Browser E2E + axe **PASS**
  - exact Vercel deployment wait **PASS**
  - Production HTTP smoke **PASS**
  - strict Production Chromium render smoke **PASS**

### Deployment / release gate

v2.8 product/runtime baseline:
- SHA: `d8014978cf6a1a5621f09ff098f48ac4821b615b`
- PR: #71
- exact verification run: #221

Exact verified Vercel Production:
- SHA: `d8014978cf6a1a5621f09ff098f48ac4821b615b`
- deployment: `dpl_GtHGNwyRuDYWVkuswgVHryTkHtVp`
- state: **READY**
- exact wait + strict HTTP + Chromium: **PASS**

Render exact product backup:
- SHA: `d8014978cf6a1a5621f09ff098f48ac4821b615b`
- deployment: `dep-damungojo6nc7392taug`
- state: **live**

Render backup is an independent deployment path and is not used as a substitute for Vercel exact Production verification.

### v2.8 ownership

```text
src/v2/
  bootstrap.js
  v28-release.js
  demo/
    runtime-boundary.js
    core-funnel-components.js
    decision-recovery-components.js
  domain/
    matching-engine.js
    elo-engine.js
    decision-engine.js
    availability-gateway.js
  core/
    mode.js
    screen-observer.js
    storage.js
  state/
    product-store.js
    scenario-store.js
    scenario-persistence.js
    decision-trace-persistence.js
  compat/
    scenario-persistence-bridge.js
  ui/
    visual-identity-experience.js
    scenario-presenter.js
    decision-recovery-experience.js
    home-controller.js
    filter-results-controller.js
    payment-controller.js
    secondary-controller.js
    product-inspector.js
    screen-effects.js
    validation-entry.js
  styles/
    visual-tokens.css
    visual-identity.css
    visual-guardrails.css
    visual-experience.css
    decision-recovery.css
    core-funnel.css
    compatibility-patches.css
    compatibility-finalize.css
    experience.css
    product-inspector.css
    tokens.css
    app.css
```

- v2.8 Matchday visual ownership은 `v28-release.js`, `visual-identity-experience.js`, `visual-tokens.css`, `visual-identity.css`, `visual-guardrails.css`가 소유합니다.
- v2.7 visual experience와 v2.6 architecture boundary는 compatibility baseline으로 유지됩니다.
- Matching score/ranking과 ELO 계산은 기존 v2 domain engine이 계속 소유합니다.
- `decision-engine`과 `decision-recovery-experience`의 판단/복구 semantics는 변경하지 않습니다.
- `availability-gateway`는 여전히 prototype/session 상태 기반 boundary이며 실제 server verification은 연결하지 않습니다.
- `decision-trace-persistence`는 browser persistence/replay를 유지합니다.
- `demo-source.html`은 39-screen regression fixture이고 신규 v2.8 visual ownership을 갖지 않습니다.
- `footmate-patches.js`에는 일부 legacy DOM/persistence compatibility가 남지만 신규 v2.8 ownership을 갖지 않습니다.

### Next candidates

- v3.0에서 v2.8 verified baseline을 회귀 기준으로 IA · component system · architecture 재설계
- 실제 backend 연동 시 `availability-gateway`를 server-side freshness/capacity verifier로 교체
- decision trace를 server-side durable audit/event storage로 확장
- `footmate-patches.js` legacy DOM/persistence compatibility ownership 추가 축소

## v2.7.0 — Visual Experience

- Product/runtime baseline: `c88c9d2` · PR #67
- Runtime: `2.7.0`
- visual ownership: `src/v2/styles/visual-experience.css`
- PR QA run #203: Regression / Browser E2E + axe **PASS**
- main run #204: Regression / Browser E2E + axe / Production compatibility HTTP + Chromium **PASS**
- v2.6 Architecture Hardening을 회귀 기준으로 typography, surfaces, CTA hierarchy, semantic state, responsive/accessibility visual system을 정리
- Matching/ELO/decision/payment/persistence semantics와 39 screens / 16 slides 유지

## v2.6.0 — Architecture Hardening

- Product/runtime baseline: `eddbaa60` · PR #65
- Exact verified Production SHA: `eddbaa607fcf1db516a1d5ab8ee27eb8dad9ad25`
- Vercel deployment: `dpl_9A1BD9X95NDccjrCMhEPsqXBBkyX`
- Exact Production QA: run #199 · Regression / Browser / exact wait / strict HTTP / Chromium **PASS**
- legacy source와 신규 runtime ownership 경계를 명시하고 availability verification / decision trace persistence boundary 추가
- v2.5 Decision & Recovery Experience, 39 screens, 16-slide Case Study, `2.1.0` contract 유지

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

- Current state: `README.md`
- Release history / compatibility boundary: 이 문서
- moving `main`은 QA/docs-only merge로 전진할 수 있으므로 product/runtime baseline과 exact verified Production SHA를 별도로 유지
- exact Production이 완료되지 않은 경우 `Not yet verified`로 기록
- temporary quota/rate-limit/canceled/pending 상태는 durable documentation에 누적하지 않음
- compatibility smoke와 exact Production verification을 구분
- Render와 Vercel은 독립적인 배포 경로로 기록
- 세부 작업 로그는 Git history / PR / Actions를 source of truth로 사용
