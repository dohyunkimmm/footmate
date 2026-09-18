# FootMate Release History

현재 릴리스 상태와 검증 기준만 간결하게 보존합니다. 세부 변경은 Git commit / Pull Request / GitHub Actions를 source of truth로 사용합니다.

## Current — v2.1.0 Domain Engine

- Stable product/runtime baseline: `59b5af1`
- Domain Engine extraction baseline: `4393403`
- Product release: PR #29
- Runtime version: `2.1.0`
- Product Hardening event contract: `2.1.0`
- Case Study badge/name: `v2.1.0 Domain Engine`
- Case Study information architecture: 16 slides
  - PR #34 consolidated User Journey, Product Strategy, and Operations & Recovery
  - PR #37 kept `Prototype Build · QA · Deployment` on one TOC line
  - PR #39 / `bba810f` synchronized Case Study runtime patch indices with the 16-slide order
- Recent stable-baseline changes:
  - `49d62c` — pre-next-version Case Study regression baseline
  - `1b1288b` · PR #41 — restored mobile vertical scrolling and Interactive Demo visibility
  - `54b540d` · PR #42 — simplified the initial Case Study loading message only
- Last exact verified Production: `3d83a01`
  - Vercel deployment: `dpl_EvQszpwfiNXXUa2zPn4rTAaNd2Mq`
  - state: **READY**
  - GitHub Actions run #134: required Regression check, Browser E2E + axe, Production HTTP smoke, Production Chromium render smoke **PASS**
  - deployment READY preceded the Production Smoke job
- Latest production-impacting main baseline: `d134d4b` · PR #44
  - single canonical prototype source: `demo-source.html`
  - duplicate ~354 KB `demo.html` artifact removed
  - legacy `/demo.html` preserved through `demo-shell.html`
  - PR QA run #140: Regression + Browser E2E/axe **PASS**
  - main run #141: Regression + Browser E2E/axe **PASS**
  - exact Vercel deployment: **PENDING** — `Deployment rate limited — retry in 24 hours`
- QA/operations patch: `4c90dfe` · PR #45
  - corrected Production compatibility-smoke behavior while exact deployment is rate-limited
  - main run #143: Regression + Browser E2E/axe + Production HTTP + Chromium smoke **PASS**
  - smoke target was the last exact verified Production in compatibility mode
- Render backup: **미확인**
  - the Render connector requires explicit workspace confirmation before service inspection
  - direct public URL fetch was unavailable in the current tool environment

### v2.2 architecture cleanup status

The first next-version architecture increment is merged to `main`, but it is not yet an exact Production-verified release. Runtime remains `2.1.0`.

Completed:
- canonicalize the 39-screen prototype source on `demo-source.html`
- remove the duplicate `demo.html` artifact
- preserve `/demo.html` as a compatibility route through the shell
- align local E2E routing, regression ownership checks, and strict Production HTTP smoke
- make rate-limit compatibility smoke validate only capabilities present on the last verified Production

Pending release gate:
- exact-SHA Vercel Production for the PR #44 product-impacting baseline
- strict Production HTTP + browser render smoke against that exact deployment

### Domain ownership


```
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
    screen-effects.js
    validation-entry.js
  styles/
    tokens.css
    app.css
```

- Matching score/ranking과 ELO update/tier 계산은 v2.1 domain engine이 소유합니다.
- `scenario-store`는 raw adapter snapshot에서 ranked/selected scenario를 파생합니다.
- Product Validation 추천 설명은 `v2.1-domain-store`를 우선 사용합니다.
- `footmate-patches.js`는 v2.1 부팅 후 계산을 domain engine에 위임하고 DOM render/persistence compatibility를 유지합니다.

### Case Study runtime synchronization

The 20→16 slide consolidation changed slide indices without changing product behavior. Before the next version, the Case Study runtime patch targets were aligned to the current order:

- IA Design runtime patch: slide index 7
- Matching Logic: slide index 8 remains untouched by the IA patch
- Service Data & Quality runtime note: slide index 10
- Validation runtime patch: slide index 14
- Browser regression verifies the IA title, 4-tab render, Matching Logic title, and Data Quality note on the intended slides.
- Strict Production smoke includes the same assertions and gates an exact-SHA Production promotion.

### Remaining compatibility boundary

다음 고도화 후보:

- `footmate-product-hardening.js`의 Inspector UI render를 `src/v2/ui/`로 이동
- `footmate-patches.js`에 남은 DOM render/persistence를 v2 controller/renderer로 추가 분리
- 큰 `demo-source.html` markup을 build-time source/component로 분리
- compatibility CSS를 component stylesheet로 추가 축소
- required status check key `Regression 36`을 실제 suite naming과 맞추려면 repository ruleset 변경과 workflow rename을 함께 수행
- Render backup 서비스의 exact deployment 상태를 workspace 확인 후 재검증

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
