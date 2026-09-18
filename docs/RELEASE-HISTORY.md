# FootMate Release History

현재 릴리스 상태와 검증 기준만 간결하게 보존합니다. 세부 변경은 Git commit / Pull Request / GitHub Actions를 source of truth로 사용합니다.

## Current main — v2.2.0 Inspector UI Ownership

- v2.2 product baseline: `94939d5` · PR #47
- Release runtime version: `2.2.0`
- Storage/schema/Product Hardening event contract: `2.1.0` compatibility 유지
- Product / Portfolio mode: 유지
- Product screen baseline: 39 screens
- Case Study information architecture: 16 slides
- Matching / ELO ownership: `src/v2/domain/`
- Product Validation Inspector UI ownership: `src/v2/ui/product-inspector.js`
- Inspector component styles: `src/v2/styles/product-inspector.css`

### v2.2 changes

PR #44 · `d134d4b`
- canonical prototype source를 `demo-source.html`로 단일화
- 중복 ~354 KB `demo.html` artifact 제거
- legacy `/demo.html` compatibility route를 `demo-shell.html`로 유지
- local E2E routing, regression ownership checks, strict Production HTTP smoke 동기화

PR #45 · `4c90dfe`
- exact Vercel deployment를 사용할 수 없을 때 Production smoke가 마지막 verified Production을 compatibility mode로 검증하도록 수정

PR #47 · `94939d5`
- Product Validation Inspector DOM/render/focus/keyboard ownership을 `src/v2/ui/product-inspector.js`로 이동
- Inspector styles를 `src/v2/styles/product-inspector.css`로 이동
- `footmate-product-hardening.js`를 policy/state/analytics adapter + UI bridge로 축소
- 중복 Inspector launcher bridge 제거
- Case Study badge/note를 v2.2 UI Ownership 기준으로 동기화
- release version을 `2.2.0`으로 노출하면서 storage/schema/event contract는 `2.1.0` 호환 유지
- strict exact-Production browser smoke에 v2.2 runtime/Inspector ownership assertion 추가

### QA

- PR #47 run #146: required Regression check + Browser E2E/axe **PASS**
- v2.2 product-baseline main `94939d5` run #147:
  - Regression 36 **PASS**
  - Browser E2E + axe **PASS**
  - Production HTTP smoke **PASS**
  - Production Chromium render smoke **PASS**
  - 마지막 exact verified Production 대상 compatibility mode
- TODO / FIXME search: 없음

### Deployment / release gate

Last exact verified Vercel Production:
- SHA: `3d83a01`
- deployment: `dpl_EvQszpwfiNXXUa2zPn4rTAaNd2Mq`
- state: **READY**
- GitHub Actions run #134: required Regression check, Browser E2E + axe, Production HTTP smoke, Production Chromium render smoke **PASS**

v2.2 product baseline exact Vercel Production verification:
- production-impacting SHA: `94939d5`
- current docs-only main may advance while carrying the same v2.2 product tree
- required before calling v2.2 Vercel Production-verified:
  - `94939d5` product tree를 포함한 current main descendant가 Vercel Production READY
  - strict Production HTTP smoke PASS
  - strict Production Chromium render smoke PASS
  - Product/Portfolio + v2.2 Inspector ownership assertions PASS

Render backup verification baseline:
- service: `footmate-backup`
- URL: `https://footmate-backup.onrender.com`
- branch: `main`
- auto deploy: enabled
- verified SHA: `b3125bf28ba8d1a44201950c55b11c841b77b383`
- deployment: `dep-damd0h6gekts73e6hlm0`
- state at verification: **live**
- verified SHA는 당시 GitHub current main과 exact 일치
- current main을 따라가는 백업 배포 경로이며, 이 검증은 Render service/deploy control plane 기준임
- strict HTTP/Chromium Production smoke는 기존 Vercel release gate와 구분

### v2.2 ownership

```text
src/v2/
  bootstrap.js
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
  ui/
    home-controller.js
    filter-results-controller.js
    payment-controller.js
    secondary-controller.js
    product-inspector.js
    screen-effects.js
    validation-entry.js
  styles/
    tokens.css
    app.css
    product-inspector.css
```

- Matching score/ranking과 ELO update/tier 계산은 v2 domain engine이 소유합니다.
- `scenario-store`는 raw adapter snapshot에서 ranked/selected scenario를 파생합니다.
- Product Validation Inspector UI는 v2.2 module이 소유합니다.
- `footmate-product-hardening.js`는 operations/recommendation/analytics policy adapter와 Inspector UI bridge 역할만 유지합니다.
- `footmate-patches.js`는 아직 일부 DOM render/persistence compatibility를 유지합니다.

### Case Study runtime synchronization

- 16-slide IA 유지
- User Journey: slide index 4
- IA Design runtime patch: slide index 7
- Matching Logic: slide index 8
- Service Data & Quality runtime note: slide index 10
- Validation runtime patch: slide index 14
- strict Production smoke는 16-slide 구조와 v2.2 release badge/Inspector ownership을 함께 검증합니다.

### Deferred to v2.3

v2.2 release scope를 불필요하게 키우지 않기 위해 아래 구조 변경은 다음 minor architecture increment로 이관합니다.

- `footmate-patches.js`에 남은 DOM render/persistence를 v2 controller/renderer로 추가 분리
- 큰 `demo-source.html` markup을 build-time source/component로 분리
- compatibility CSS 추가 축소
- required status check key `Regression 36` rename은 repository ruleset과 workflow rename을 함께 수행

## v2.1.0 — Domain Engine

- Stable product/runtime baseline: `59b5af1`
- Domain Engine extraction baseline: `4393403`
- Product release: PR #29
- Matching / ELO 계산 ownership을 `src/v2/domain/`으로 이동
- `scenario-store`가 ranked/selected scenario를 domain engine에서 파생
- Product / Portfolio mode, 39 screens, 16-slide Case Study 유지
- Product Hardening event contract `2.1.0`
- Mobile Case Study scroll + Interactive Demo visibility: `1b1288b` · PR #41
- Initial Case Study loading-copy polish: `54b540d` · PR #42
- Last exact v2.1 Production baseline before v2.2 work: `3d83a01`

## v2.0.0 — Product Experience

- Stable source/runtime baseline: `a192ec1`
- Production verification: `9ff82c7`
- PR #26 stable promotion
- Product / Portfolio mode 분리
- product/scenario store 및 UI controller ownership
- finalize state bridge 축소, navigation wrapper 제거
- 320 / 375 / 390 / 430 responsive + visual contract
- GitHub Actions run #87: Regression · Browser E2E + axe · Production HTTP/Chromium PASS
- Vercel: `9ff82c7` verified / READY

## v2.0.0-beta.2 — Runtime Migration

- Baseline: `84c698b`
- PR #21
- Home/Filter/Result/Payment/Participation/Evaluation/Favorite/Friend/Chat controller migration
- duplicate persistence 제거, inline handler migration

## v2.0.0-beta.1 — Product Experience Architecture

- Baseline: `70102da`
- PR #19
- native ES module bootstrap, Product/Portfolio mode, observer, storage, design token 경계 도입

## v1.1 — Experience Polish

- Core release baseline: `8d501bd`
- UI hotfix baseline: `ec3f8cf`
- PR #16 / #18
- responsive/accessibility polish와 Product Validation launcher 정리
- Manual device QA: iPhone Safari + VoiceOver / Android Chrome + TalkBack 사용자 확인 PASS

## Historical baselines

- `eff58f3` — 2026-09-12 Portfolio close-out snapshot
- `a6cb6fe` — P0–P2 Product Hardening implementation baseline
- `15151a5` — first complete Production routing/smoke pass
- `1a450f2` — accessibility refinement baseline

이전 Portfolio Freeze는 historical snapshot일 뿐 현재 개발 잠금이 아닙니다.

## Documentation policy

- Current state: `README.md`
- Release history / compatibility boundary: 이 문서
- per-version working docs와 날짜별 QA docs는 현재 tree에 누적하지 않음
- 삭제된 상세 문서는 Git history에서 복원 가능
