# FootMate Release History

현재 릴리스 상태와 검증 기준만 간결하게 보존합니다. 세부 변경은 Git commit / Pull Request / GitHub Actions를 source of truth로 사용합니다.

## Current Release — v2.3.0 Compatibility Boundary Reduction

- v2.3 architecture baseline: `bf27784` · PR #52
- exact verified Production SHA: `aaacbdc` · PR #55
- Release runtime version: `2.3.0`
- Storage/schema/Product Hardening event contract: `2.1.0` compatibility 유지
- v2.2 runtime alias/event: compatibility 유지
- Product / Portfolio mode: 유지
- Product screen baseline: 39 screens
- Case Study information architecture: 16 slides
- Matching / ELO ownership: `src/v2/domain/`
- Product Validation Inspector UI ownership: `src/v2/ui/product-inspector.js`

### v2.3 changes

PR #52 · `bf27784`
- Product Experience와 runtime patch/finalize CSS canonical ownership을 `src/v2/styles/`로 이동
- legacy CSS entry는 canonical v2 styles를 가리키는 compatibility alias로 유지
- canonical scenario persistence `footmate:v2:scenario` 도입
- legacy runtime state를 보호하는 guarded canonical-to-legacy hydration bridge 도입
- Filter / Results / Recommendation Reason presentation을 `src/v2/ui/scenario-presenter.js`로 이동
- `FootMateV23` + `footmate:v2.3:ready`를 정식 v2.3 release contract로 승격
- `FootMateV22` + `footmate:v2.2:ready` compatibility contract 유지
- Case Study release badge/note를 v2.3 Compatibility Boundary로 동기화

PR #55 · `aaacbdc`
- strict Production browser smoke의 historical v2.2 assertion을 v2.3 release contract로 동기화
- v2.3 release metadata, scenario persistence/presentation, CSS ownership, v2.2 compatibility를 strict Production assertion에 포함
- `/demo` bootstrap cache key를 갱신해 수정된 strict contract를 exact Production SHA에서 재검증
- functional product logic 변경 없음

### QA

- PR #52 run #163:
  - Regression 36 **PASS**
  - Browser E2E + axe **PASS**
- first v2.3 main `bf27784` run #164:
  - Regression 36 **PASS**
  - Browser E2E + axe **PASS**
  - exact Vercel deployment wait **PASS**
  - strict Production HTTP smoke **PASS**
  - strict Production Chromium smoke가 historical `V2.2` test assertion 때문에 실패
  - Production 실제 렌더는 의도한 `V2.3 · COMPATIBILITY BOUNDARY`였으며 runtime defect는 확인되지 않음
- PR #55 run #167:
  - Regression 36 **PASS**
  - Browser E2E + axe **PASS**
- exact Production verification main `aaacbdc` run #168:
  - Regression 36 **PASS**
  - Browser E2E + axe **PASS**
  - exact Vercel deployment wait **PASS**
  - strict Production HTTP smoke **PASS**
  - strict Production Chromium render smoke **PASS**
  - v2.3 release metadata / canonical scenario ownership / v2.2 compatibility assertions **PASS**

### Deployment / release gate

v2.3 exact verified Vercel Production:
- architecture baseline: `bf27784d8cf260d9558b5411c9bd1ba669d6ec08`
- exact verified SHA: `aaacbdc5edccdc7dd89404e6fde439f36e1df091`
- deployment: `dpl_86HgVTqT4aK5aCx5vhyYLipaK4W8`
- state: **READY**
- GitHub Actions run #168: Regression 36, Browser E2E + axe, exact deployment wait, strict Production HTTP, strict Production Chromium **PASS**
- v2.3 Production release gate: **CLOSED**

Render backup verification:
- service: `footmate-backup`
- URL: `https://footmate-backup.onrender.com`
- branch: `main`
- auto deploy: enabled
- verified SHA: `aaacbdc5edccdc7dd89404e6fde439f36e1df091`
- deployment: `dep-damil8h7lnhs73ccu1r0`
- state at verification: **live**
- Render service/deploy control plane 기준 exact SHA 일치 확인
- Vercel strict HTTP/Chromium verification과는 독립된 배포 경로로 구분

### v2.3 ownership

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
    compatibility-patches.css
    compatibility-finalize.css
    experience.css
    product-inspector.css
    tokens.css
    app.css
```

- Matching score/ranking과 ELO update/tier 계산은 v2 domain engine이 소유합니다.
- `scenario-store`는 raw adapter snapshot에서 ranked/selected scenario를 파생합니다.
- `scenario-persistence`는 canonical browser persistence를 소유합니다.
- `scenario-persistence-bridge`는 legacy adapter hydration compatibility만 담당합니다.
- `scenario-presenter`는 Filter / Results / Recommendation Reason presentation을 소유합니다.
- Product Validation Inspector UI는 v2.2에서 이동한 ownership을 그대로 유지합니다.
- `footmate-patches.js`에는 아직 일부 DOM render/persistence compatibility가 남아 있습니다.

### Case Study runtime synchronization

- 16-slide IA 유지
- User Journey: slide index 4
- IA Design runtime patch: slide index 7
- Matching Logic: slide index 8
- Service Data & Quality runtime note: slide index 10
- Validation runtime patch: slide index 14
- release badge/note: `v2.3.0 Compatibility Boundary`
- strict Production smoke는 16-slide 구조와 v2.3 runtime ownership + v2.2 compatibility를 함께 검증합니다.

### Next architecture candidates

- 큰 `demo-source.html` markup을 build-time source/component로 분리
- `footmate-patches.js`에 남은 DOM/persistence compatibility ownership 추가 축소
- required status check key `Regression 36` rename은 repository ruleset과 workflow를 함께 변경

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
- moving `main`은 docs-only merge로 전진할 수 있으므로 product/runtime baseline과 exact verified Production SHA를 별도로 유지
- per-version working docs와 날짜별 QA docs는 현재 tree에 누적하지 않음
- 삭제된 상세 문서는 Git history에서 복원 가능
