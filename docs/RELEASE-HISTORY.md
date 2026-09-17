# FootMate Release History

이 문서는 FootMate의 현재 릴리스 상태, 이전 검증 기준, 다음 구조 정리 후보만 간결하게 보존합니다. 세부 변경 내역은 Git commit / Pull Request / GitHub Actions 이력을 기준으로 추적합니다.

## Current — v2.0.0 Product Experience

- Stable source/runtime baseline: `a192ec1`
- GitHub: PR #26 merged to `main`
- Version contract:
  - runtime `2.0.0`
  - Product Hardening event contract `2.0.0`
  - Case Study badge/name `v2.0.0 Product Experience`
- Active asset names:
  - `footmate-experience.css`
  - `case-study-experience.css`
  - `index-experience.js`
- Removed active legacy names:
  - `footmate-v1.1.css`
  - `case-study-v1.1.css`
  - `index-v1.1.js`
- GitHub Actions:
  - run #85: Regression 36 PASS · Browser E2E + axe PASS
  - run #87: Regression 36 PASS · Browser E2E + axe PASS · Production HTTP smoke PASS · Production Chromium render smoke PASS
- Vercel stable Production verification: `9ff82c7` · verified · READY
- Deployment incident:
  - `a192ec1` 직후 Vercel이 일시적으로 `Deployment rate limited — retry in 24 hours`를 반환
  - 다음 main 배포 `9ff82c7`에서 정상 배포되어 해소
  - 코드/브라우저 QA 실패는 아니었음

### v2 runtime ownership

```
src/v2/
  bootstrap.js
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

### Compatibility boundary

- `footmate-finalize.js` — persisted state compatibility bridge only
- `footmate-patches.js` — Matching/ELO scenario 및 기존 render 일부를 `FootMateScenarioAdapter` 뒤에서 제공
- `footmate-product-hardening.js` — Operations state machine / Product Validation compatibility adapter
- `footmate-core.js`, `footmate-product-core.js` — core calculation / product policy
- legacy patch / hardening navigation wrapper — 제거 완료

현재 기능·QA를 위해 필수인 미완료 구현 작업은 없습니다.

### Optional future cleanup

- `footmate-patches.js`의 Matching/ELO scenario render를 `src/v2/` 내부 모듈로 추가 분리
- 큰 `demo-source.html` 화면 markup을 build-time component/source로 분리
- compatibility CSS를 component 단위 stylesheet로 추가 축소

## v2.0.0-beta.2 — Runtime Migration

- Product/runtime baseline: `84c698b`
- GitHub: PR #21
- product/scenario store와 주요 UI controller 이전 완료
- finalize state bridge 축소, navigation wrapper 제거, duplicate persistence 제거
- 320 / 375 / 390 / 430 responsive gate 및 visual contract regression
- GitHub Actions run #79: Regression · Browser E2E + axe · Production HTTP/Chromium smoke PASS
- Vercel: `84c698b` verified / Production READY

## v2.0.0-beta.1 — Product Experience Architecture

- Product/runtime baseline: `70102da`
- GitHub: PR #19
- Product / Portfolio mode 분리
- native ES module bootstrap, mode, observer, storage, design token 경계 도입
- GitHub Actions run #69 / Vercel Production 검증 완료

## v1.1 — Experience Polish

- Core release baseline: `8d501bd`
- UI hotfix baseline: `ec3f8cf`
- PR #16: Visual polish, UI/UX refinement, Case Study synchronization, responsive/accessibility refinement
- PR #18: overlapping `매칭 로직 0/5` / `제품 검증` controls consolidated and onboarding overlap removed
- GitHub Actions run #64: Regression 36 / Browser E2E + axe / responsive / Production smoke PASS
- Vercel: `ec3f8cf` verified / Production READY
- Manual device QA: iPhone Safari + VoiceOver and Android Chrome + TalkBack core flows checked by user; no blocking issue reported

The previous `Portfolio Freeze 2026.09.12` is a historical snapshot only. It no longer represents a development lock.

## Historical baselines

### 2026-09-12 — Portfolio close-out snapshot

- `eff58f3` — close-out documentation baseline
- GitHub required checks and Vercel Production smoke were passing at the snapshot
- This state is retained only as historical evidence

### 2026-09-11 — P0–P2 Product Hardening

- `a6cb6fe` — implementation baseline for operations state machines, recommendation explainability, event/KPI contracts, and Product Validation
- Regression / Browser E2E + axe / Production Smoke passed at this baseline

### First complete Production QA pass

- `15151a5` — first complete Production routing and smoke pass
- `1a450f2` — follow-up accessibility refinement baseline

## Documentation policy

To keep `main` readable:

- Current product description and verification status live in `README.md`.
- Release history, compatibility boundary, and optional cleanup items live in this file.
- Per-version planning/release documents are removed after their relevant facts are absorbed here.
- Dated QA, hardening, and close-out documents are not kept in the current tree after consolidation.
- Deleted documents remain recoverable through Git history.
