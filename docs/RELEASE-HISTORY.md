# FootMate Release History

현재 릴리스 상태와 검증 기준만 간결하게 보존합니다. 세부 변경은 Git commit / Pull Request / GitHub Actions를 source of truth로 사용합니다.

## Current Release — v2.4.0 Core Funnel Experience

- architecture baseline: `9afd19e` · PR #57
- product/runtime baseline: `21c6ab4` · PR #58
- exact verified Production descendant: `b38e147` · PR #61
- Release runtime version: `2.4.0`
- Storage/schema/Product Hardening event contract: `2.1.0` compatibility 유지
- v2.2 / v2.3 runtime alias/event: compatibility 유지
- Product / Portfolio mode: 유지
- Product screen baseline: 39 screens
- Case Study information architecture: 16 slides
- Matching / ELO ownership: `src/v2/domain/`
- v2.4 release gate: **CLOSED**

### v2.4 changes

PR #57 · `9afd19e`
- Home → Filter → Results → Detail → Payment를 하나의 core funnel journey로 재설계
- 조건 요약, 추천 비교, 추천 근거, 상태 피드백, 복구 행동, 결제 단계 안내 추가
- 새 funnel markup을 `src/v2/demo/core-funnel-components.js`가 소유
- v2.4 funnel visual ownership을 `src/v2/styles/core-funnel.css`로 분리
- Detail presentation ownership을 `src/v2/ui/scenario-presenter.js`로 확장
- legacy 39-screen source에 v2.4 markup이 재유입되지 않도록 component/source boundary gate 추가
- 320px 모바일 CTA/터치 타깃과 접근성 기준 강화
- v2.3 canonical persistence와 `2.1.0` compatibility contract 유지

PR #58 · `21c6ab4`
- checkout completed-state foreground 대비를 axe 기준보다 충분한 수준으로 강화
- 접근성 회귀 방지 테스트 추가
- functional funnel/state behavior 변경 없음

PR #59 · QA-only descendant
- Production compatibility smoke와 exact Production verification assertion을 명시적으로 분리
- compatibility mode는 현재 배포된 v2 runtime/39-screen Product·Portfolio 동작을 확인
- exact strict mode에서만 v2.4 release metadata와 v2.4-only UI ownership을 요구
- 이 변경은 product/runtime baseline을 변경하지 않음

PR #61 · `b38e147`
- protected main → Vercel Production 경로를 동작 변경 없이 재트리거
- exact SHA `b38e14765a169715d4309036aeb8eb07663e304e`가 Vercel Production `READY`로 배포됨
- strict Production HTTP + Chromium 검증을 통과해 v2.4 release gate를 닫음
- product/runtime baseline은 `21c6ab4`로 유지

### QA

- PR #57 run #173:
  - Regression 36 **PASS**
  - Browser E2E + axe **PASS**
  - responsive / representative visual / v2.4 funnel gate **PASS**
- PR #58 run #175:
  - Regression 36 **PASS**
  - Browser E2E + axe **PASS**
  - checkout completion contrast regression **PASS**
- QA contract sync PR #59 run #177:
  - Regression 36 **PASS**
  - Browser E2E + axe **PASS**
- compatibility main run #178:
  - Regression 36 **PASS**
  - Browser E2E + axe **PASS**
  - Production compatibility HTTP smoke **PASS**
  - Production compatibility Chromium render smoke **PASS**
- exact Production main run #182:
  - Regression 36 **PASS**
  - Browser E2E + axe **PASS**
  - exact Vercel deployment wait **PASS**
  - Production HTTP smoke **PASS**
  - strict Production Chromium render smoke **PASS**

Compatibility smoke는 exact Production verification으로 간주하지 않습니다.

### Deployment / release gate

v2.4 exact Vercel Production:
- product/runtime baseline: `21c6ab4b3d7bbed1b3ffaae202452aed98208834`
- exact verified SHA: `b38e14765a169715d4309036aeb8eb07663e304e`
- deployment: `dpl_GyvevKkNYEgRkJKJrXLuAwekXmCm`
- state: **READY**
- exact verification run: #182 · exact wait + strict HTTP + Chromium **PASS**
- release gate: **CLOSED**

Render exact release deployment:
- SHA: `b38e14765a169715d4309036aeb8eb07663e304e`
- deployment: `dep-damk034s728c73c5ood0`
- state: **live**

Render backup is an independent deployment path. Current exact-main/live status is verified from the Render control plane after important merges and is not used as a substitute for Vercel exact Production verification.

### v2.4 ownership

```text
src/v2/
  bootstrap.js
  demo/
    core-funnel-components.js
  domain/
    matching-engine.js
    elo-engine.js
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
    home-controller.js
    filter-results-controller.js
    payment-controller.js
    secondary-controller.js
    product-inspector.js
    screen-effects.js
    validation-entry.js
  styles/
    core-funnel.css
    compatibility-patches.css
    compatibility-finalize.css
    experience.css
    product-inspector.css
    tokens.css
    app.css
```

- Matching score/ranking과 ELO update/tier 계산은 v2 domain engine이 소유합니다.
- `scenario-store`는 ranked/selected scenario를 domain engine에서 파생합니다.
- `scenario-persistence`는 canonical browser persistence를 소유합니다.
- `scenario-persistence-bridge`는 legacy adapter hydration compatibility만 담당합니다.
- `scenario-presenter`는 Filter / Results / Recommendation Reason / Detail presentation을 소유합니다.
- `core-funnel-components.js`는 새 v2.4 funnel markup을 legacy `demo-source.html` 밖에서 소유합니다.
- `footmate-patches.js`에는 아직 일부 DOM/persistence compatibility가 남아 있습니다.

### Next architecture candidates

- 큰 `demo-source.html`의 build-time source/component 분리 확대
- `footmate-patches.js`에 남은 DOM/persistence compatibility ownership 추가 축소
- required status check key `Regression 36` rename은 repository ruleset과 workflow를 함께 변경

## v2.3.0 — Compatibility Boundary Reduction

- Architecture baseline: `bf27784` · PR #52
- Exact verified Production SHA: `aaacbdc` · PR #55
- Vercel deployment: `dpl_86HgVTqT4aK5aCx5vhyYLipaK4W8`
- Exact Production QA: run #168 · Regression / Browser / strict HTTP / Chromium **PASS**
- Product Experience CSS, canonical scenario persistence, Filter/Results/Recommendation Reason presentation ownership을 `src/v2/`로 이동
- v2.2 compatibility contract와 `2.1.0` storage/schema/event contract 유지
- Product / Portfolio mode, 39 screens, 16-slide Case Study 유지

## v2.2.0 — Inspector UI Ownership

- Product baseline: `94939d5` · PR #47
- Exact verified Production descendant: `5fbdbf4` · PR #53
- Vercel deployment: `dpl_FnD7dPN9DgMnYQMoEsd5LaUHs5kY`
- Exact Production QA: run #159 · Regression / Browser / strict HTTP / Chromium **PASS**
- Product Validation Inspector DOM/render/focus/keyboard ownership을 `src/v2/ui/product-inspector.js`로 이동
- Inspector component styles를 `src/v2/styles/product-inspector.css`로 이동
- Product / Portfolio mode, 39 screens, 16-slide Case Study 유지

## v2.1.0 — Domain Engine

- Stable product/runtime baseline: `59b5af1`
- Domain Engine extraction baseline: `4393403`
- Product release: PR #29
- Matching / ELO 계산 ownership을 `src/v2/domain/`으로 이동
- `scenario-store`가 ranked/selected scenario를 domain engine에서 파생
- Product / Portfolio mode, 39 screens, 16-slide Case Study 유지
- Product Hardening event contract `2.1.0`

## v2.0.0 — Product Experience

- Stable source/runtime baseline: `a192ec1`
- Production verification: `9ff82c7`
- PR #26 stable promotion
- Product / Portfolio mode 분리
- product/scenario store 및 UI controller ownership
- finalize state bridge 축소, navigation wrapper 제거
- 320 / 375 / 390 / 430 responsive + visual contract
- GitHub Actions run #87: Regression · Browser E2E + axe · Production HTTP/Chromium **PASS**

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
