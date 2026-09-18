# FootMate Release History

현재 릴리스 상태와 검증 기준만 간결하게 보존합니다. 세부 변경은 Git commit / Pull Request / GitHub Actions를 source of truth로 사용합니다.

## Current Release — v2.5.0 Decision & Recovery Experience

- product/runtime baseline: `0e7c40c` · PR #63
- exact verified Production SHA: `0e7c40c2d997798dbf71f74fef8f91055cca7abe`
- Release runtime version: `2.5.0`
- Storage/schema/Product Hardening event contract: `2.1.0` compatibility 유지
- v2.2 / v2.3 / v2.4 runtime alias/event: compatibility 유지
- Product / Portfolio mode: 유지
- Product screen baseline: 39 screens
- Case Study information architecture: 16 slides
- Matching / ELO ownership: `src/v2/domain/`
- Decision / Recovery ownership: `src/v2/domain/decision-engine.js`
- v2.5 release gate: **CLOSED**

### v2.5 changes

PR #63 · `0e7c40c`
- v2.4 Core Funnel Experience 위에 deterministic decision/guardrail layer 추가
- Home next-action, Filter impact preview, Results comparison, Detail/Reason preflight, Payment preflight UI/IX 추가
- 정원 마감 · 저잔액 · 결제 실패 · 조건 불일치에 대한 inline recovery 제공
- 실제 차단 조건에서 Payment CTA를 비활성화하고 idempotent 참가 상태는 중복 과금 없이 확인 화면으로 이동
- decision trace ID와 in-session history/replay contract 추가
- decision engine ownership: `src/v2/domain/decision-engine.js`
- component ownership: `src/v2/demo/decision-recovery-components.js`
- interaction ownership: `src/v2/ui/decision-recovery-experience.js`
- visual ownership: `src/v2/styles/decision-recovery.css`
- v2.4 core funnel, 39-screen Product, 16-slide Case Study, Matching/ELO domain behavior, `2.1.0` storage/schema/event contract 유지
- v2.5 markup이 `demo-source.html`에 유입되지 않도록 source boundary gate 추가

### QA

- PR #63 final run #186:
  - Regression 36 **PASS**
  - v2.4 component/source boundary **PASS**
  - v2.5 decision/recovery boundary **PASS**
  - Browser E2E + axe · responsive · v2.5 UI/IX gate **PASS**
- exact Production main run #187:
  - Regression 36 **PASS**
  - Browser E2E + axe **PASS**
  - exact Vercel deployment wait **PASS**
  - Production HTTP smoke **PASS**
  - strict Production Chromium render smoke **PASS**

Compatibility smoke는 exact Production verification으로 간주하지 않습니다.

### Deployment / release gate

v2.5 exact Vercel Production:
- product/runtime baseline / exact verified SHA: `0e7c40c2d997798dbf71f74fef8f91055cca7abe`
- deployment: `dpl_4rjLPCjoNVbLAbRB8rjcbqyUYXcj`
- state: **READY**
- exact verification run: #187 · exact wait + strict HTTP + Chromium **PASS**
- release gate: **CLOSED**

Render exact release deployment:
- SHA: `0e7c40c2d997798dbf71f74fef8f91055cca7abe`
- deployment: `dep-dams4bjrjlhs738c7fq0`
- state: **live**

Render backup is an independent deployment path. Current exact-main/live status is verified from the Render control plane after important merges and is not used as a substitute for Vercel exact Production verification.

### v2.5 ownership

```text
src/v2/
  bootstrap.js
  demo/
    core-funnel-components.js
    decision-recovery-components.js
  domain/
    matching-engine.js
    elo-engine.js
    decision-engine.js
  core/
    mode.js
    screen-observer.js
    storage.js
  state/
    product-store.js
    scenario-store.js
    scenario-persistence.js
  compat/
    scenario-persistence-bridge.js
  ui/
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
    decision-recovery.css
    core-funnel.css
    compatibility-patches.css
    compatibility-finalize.css
    experience.css
    product-inspector.css
    tokens.css
    app.css
```

- Matching score/ranking과 ELO update/tier 계산은 v2 domain engine이 소유합니다.
- `decision-engine`은 현재 scenario/product/operation 상태를 읽어 allow/block/recovery와 trace를 파생합니다.
- `decision-recovery-experience`는 decision을 UI action · preflight · inline recovery와 연결합니다.
- `scenario-persistence`는 canonical browser persistence를 소유합니다.
- v2.4 core funnel은 v2.5 아래 compatibility/regr layer로 유지됩니다.
- `footmate-patches.js`에는 아직 일부 DOM/persistence compatibility가 남아 있습니다.

### Next architecture candidates

- 큰 `demo-source.html`의 build-time source/component 분리 확대
- `footmate-patches.js`에 남은 DOM/persistence compatibility ownership 추가 축소
- 실제 backend 연동 단계에서 server-side freshness/capacity check와 decision trace 영속 저장 추가
- required status check key `Regression 36` rename은 repository ruleset과 workflow를 함께 변경

## v2.4.0 — Core Funnel Experience

- Architecture baseline: `9afd19e` · PR #57
- Product/runtime baseline: `21c6ab4` · PR #58
- Exact verified Production SHA: `b38e147` · PR #61
- Vercel deployment: `dpl_GyvevKkNYEgRkJKJrXLuAwekXmCm`
- Exact Production QA: run #182 · Regression / Browser / exact wait / strict HTTP / Chromium **PASS**
- Home → Filter → Results → Detail → Payment core funnel과 component/presenter/style ownership 확장
- Product / Portfolio mode, 39 screens, 16-slide Case Study, `2.1.0` compatibility 유지

## v2.3.0 — Compatibility Boundary Reduction

- Architecture baseline: `bf27784` · PR #52
- Exact verified Production SHA: `aaacbdc` · PR #55
- Vercel deployment: `dpl_86HgVTqT4aK5aCx5vhyYLipaK4W8`
- Exact Production QA: run #168 · Regression / Browser / strict HTTP / Chromium **PASS**
- Product Experience CSS, canonical scenario persistence, Filter/Results/Recommendation Reason presentation ownership을 `src/v2/`로 이동
- v2.2 compatibility contract와 `2.1.0` storage/schema/event contract 유지

## v2.2.0 — Inspector UI Ownership

- Product baseline: `94939d5` · PR #47
- Exact verified Production descendant: `5fbdbf4` · PR #53
- Vercel deployment: `dpl_FnD7dPN9DgMnYQMoEsd5LaUHs5kY`
- Exact Production QA: run #159 · Regression / Browser / strict HTTP / Chromium **PASS**
- Product Validation Inspector DOM/render/focus/keyboard ownership을 `src/v2/ui/product-inspector.js`로 이동

## v2.1.0 — Domain Engine

- Stable product/runtime baseline: `59b5af1`
- Domain Engine extraction baseline: `4393403`
- Product release: PR #29
- Matching / ELO 계산 ownership을 `src/v2/domain/`으로 이동
- Product Hardening event contract `2.1.0`

## v2.0.0 — Product Experience

- Stable source/runtime baseline: `a192ec1`
- Production verification: `9ff82c7`
- PR #26 stable promotion
- Product / Portfolio mode 분리
- product/scenario store 및 UI controller ownership
- 320 / 375 / 390 / 430 responsive + visual contract

## Earlier releases

- v2.0.0-beta.2 · `84c698b` · runtime/controller migration
- v2.0.0-beta.1 · `70102da` · Product Experience Architecture
- v1.1 · `8d501bd` / `ec3f8cf` · responsive/accessibility polish · manual iPhone/Android accessibility QA

## Historical baselines

- `eff58f3` — 2026-09-12 Portfolio close-out snapshot
- `a6cb6fe` — P0–P2 Product Hardening implementation baseline
- `15151a5` — first complete Production routing/smoke pass
- `1a450f2` — accessibility refinement baseline

이전 Portfolio Freeze는 historical snapshot일 뿐 현재 개발 잠금이 아닙니다.

## Documentation policy

- Current state: `README.md`
- Release history / compatibility boundary: 이 문서
- moving `main`은 QA/docs-only merge로 전진할 수 있으므로 product/runtime baseline과 exact verified Production SHA를 별도로 유지
- temporary quota/rate-limit/canceled/pending 상태는 durable documentation에 누적하지 않음
- compatibility smoke와 exact Production verification을 구분
- per-version working docs와 날짜별 QA docs는 현재 tree에 누적하지 않음
- 삭제된 상세 문서는 Git history에서 복원 가능
