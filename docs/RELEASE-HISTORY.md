# FootMate Release History

현재 릴리스 상태와 검증 기준만 간결하게 보존합니다. 세부 변경은 Git commit / Pull Request / GitHub Actions를 source of truth로 사용합니다.

## Current Release — v3.0.0 Unified App Architecture

- current product/runtime baseline: `23ff243b750d796561d9b4522972528a17a91fe9`
- v3 architecture release point: `50e63eeaa4939f7a397941e7c7a8af408ad4cf92` · PR #74
- visual baseline regression fix: PR #76
- Release runtime version: `3.0.0`
- preserved domain runtime baseline: v2.8 semantics
- schema / event contract: `2.1.0`
- primary destinations: `탐색 / 추천 / 참가 / 내 정보`
- compatibility product routes: 39 screens
- visual baseline: v2.8 Matchday Visual Identity
- exact Vercel Production release gate: **Not yet verified**

### v3.0 changes

PR #74 · `50e63eea`
- 39 compatibility routes를 4개 primary destination으로 단순화
- reusable app navigation / context / primitive component architecture 추가
- domain state와 분리된 `footmate:v3:view` view-state ownership 추가
- mobile bottom navigation + desktop left rail app shell 도입
- Matching/ELO/decision/payment/persistence와 schema `2.1.0` compatibility 유지

PR #76 · `23ff243b`
- v3 shell이 v2.8 legacy screen 배경, typography, surface geometry를 덮어쓰던 visual regression 수정
- legacy visual selector ownership을 다시 v2.8에 고정
- mobile은 v2.8 visual canvas + v3 bottom navigation만 유지
- desktop legacy product viewport를 약 456px로 제한해 과도한 확장 제거
- v2.8 effective visual baseline + 320px accessibility + bounded desktop scale browser gate 추가

### QA

PR #76 final QA · run #243:
- Regression 36 **PASS**
- v2.4 / v2.5 / v2.6 / v2.7 / v2.8 / v3.0 ownership boundaries **PASS**
- Browser E2E + axe · responsive · v2.8 visual baseline · v3 shell **PASS**

main QA · run #244 on `23ff243b750d796561d9b4522972528a17a91fe9`:
- Regression 36 **PASS**
- Browser E2E + axe **PASS**
- Production compatibility HTTP smoke **PASS**
- Production compatibility Chromium smoke **PASS**
- v3 exact Production HTTP / Chromium: **Not yet verified**

### Deployment / release gate

Current v3 product/runtime baseline:
- SHA: `23ff243b750d796561d9b4522972528a17a91fe9`
- visual fix PR: #76
- main QA: run #244

Render product/runtime release point:
- SHA: `23ff243b750d796561d9b4522972528a17a91fe9`
- deployment: `dep-dan0rl2jnfac738f9e20`
- state: **verified live at product release**

Exact v3 Vercel Production:
- **Not yet verified**

Last exact verified Vercel Production:
- release: v2.8.0
- SHA: `d8014978cf6a1a5621f09ff098f48ac4821b615b`
- deployment: `dpl_GtHGNwyRuDYWVkuswgVHryTkHtVp`
- state: **READY**
- exact wait + strict HTTP + Chromium: **PASS** · run #221

Render is an independent deployment path and is not used as a substitute for Vercel exact Production verification. Compatibility smoke is also not an exact Production verification.

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
    app-navigation.js
    context-bar.js
    primitives.js
  styles/
    tokens.css
    app-shell.css
    components.css
```

- v3 owns app shell / IA / view state / app chrome.
- v2.8 remains visual owner of legacy product screens.
- v2 runtime remains owner of Matching/ELO/decision/payment/persistence semantics.
- `demo-source.html` remains the 39-screen compatibility fixture.

## v2.8.0 — Matchday Visual Identity

- product/runtime baseline: `d8014978cf6a1a5621f09ff098f48ac4821b615b` · PR #71
- Runtime: `2.8.0`
- visual ownership: `src/v2/styles/visual-identity.css`
- visual tokens: `src/v2/styles/visual-tokens.css`
- visual module: `src/v2/ui/visual-identity-experience.js`
- PR QA run #220: Regression / Browser E2E + axe **PASS**
- exact Production QA run #221: Regression / Browser / exact wait / strict HTTP / Chromium **PASS**
- exact verified Vercel deployment: `dpl_GtHGNwyRuDYWVkuswgVHryTkHtVp` · READY
- 39 screens / 16-slide Case Study / schema `2.1.0` / Matching-ELO-decision semantics 유지

## v2.7.0 — Visual Experience

- product/runtime baseline: `c88c9d2` · PR #67
- Runtime: `2.7.0`
- visual ownership: `src/v2/styles/visual-experience.css`
- PR QA run #203: Regression / Browser E2E + axe **PASS**
- main run #204: Regression / Browser E2E + axe / Production compatibility HTTP + Chromium **PASS**

## v2.6.0 — Architecture Hardening

- product/runtime baseline: `eddbaa607fcf1db516a1d5ab8ee27eb8dad9ad25` · PR #65
- Vercel deployment: `dpl_9A1BD9X95NDccjrCMhEPsqXBBkyX`
- exact Production QA: run #199 **PASS**
- source ownership, availability verification boundary, decision trace persistence 강화

## v2.5.0 — Decision & Recovery Experience

- product/runtime baseline: `0e7c40c2d997798dbf71f74fef8f91055cca7abe` · PR #63
- Vercel deployment: `dpl_4rjLPCjoNVbLAbRB8rjcbqyUYXcj`
- exact Production QA: run #187 **PASS**
- 추천 비교 · preflight · payment guard · inline recovery · decision trace 도입

## v2.4.0 — Core Funnel Experience

- product/runtime baseline: `21c6ab4` · PR #58
- exact verified Production descendant: `b38e147` · PR #61
- Vercel deployment: `dpl_GyvevKkNYEgRkJKJrXLuAwekXmCm`
- exact Production QA: run #182 **PASS**

## v2.3.0 — Compatibility Boundary Reduction

- architecture baseline: `bf27784` · PR #52
- exact verified Production SHA: `aaacbdc` · PR #55
- Vercel deployment: `dpl_86HgVTqT4aK5aCx5vhyYLipaK4W8`

## v2.2.0 — Inspector UI Ownership

- product baseline: `94939d5` · PR #47
- exact verified Production descendant: `5fbdbf4` · PR #53
- Vercel deployment: `dpl_FnD7dPN9DgMnYQMoEsd5LaUHs5kY`

## v2.1.0 — Domain Engine

- stable product/runtime baseline: `59b5af1`
- Matching / ELO domain ownership을 `src/v2/domain/`으로 이동
- Product Hardening event contract `2.1.0`

## v2.0.0 — Product Experience

- stable source/runtime baseline: `a192ec1`
- Production verification: `9ff82c7`
- Product / Portfolio mode 분리
- 320 / 375 / 390 / 430 responsive + visual contract

## Earlier releases

- v2.0.0-beta.2 · `84c698b` · runtime/controller migration
- v2.0.0-beta.1 · `70102da` · Product Experience Architecture
- v1.1 · `8d501bd` / `ec3f8cf` · responsive/accessibility polish

## Documentation policy

- Current product/release state: `README.md`
- Release history / compatibility boundary: 이 문서
- moving `main`은 QA/docs-only merge로 전진할 수 있으므로 product/runtime baseline과 exact verified Production SHA를 별도로 유지
- Render current-main은 repo 문서 업데이트 자체가 main을 다시 움직이는 재귀를 피하기 위해 product/runtime release-point로 기록
- exact Production이 완료되지 않은 경우 `Not yet verified`로 기록
- temporary quota/rate-limit/canceled/pending 상태는 durable documentation에 누적하지 않음
- compatibility smoke와 exact Production verification을 구분
- Render와 Vercel은 독립적인 배포 경로로 기록
