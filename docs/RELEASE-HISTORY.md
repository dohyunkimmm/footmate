# FootMate Release History

현재 릴리스 상태와 검증 기준만 간결하게 보존합니다. 세부 변경은 Git commit / Pull Request / GitHub Actions를 source of truth로 사용합니다.

## Current — v2.1.0 Domain Engine

- Product/runtime baseline: `59b5af1`
- Domain Engine extraction baseline: `4393403`
- GitHub: PR #29 merged to `main`
- Runtime version: `2.1.0`
- Product Hardening event contract: `2.1.0`
- Case Study badge/name: `v2.1.0 Domain Engine`
- GitHub Actions run #102:
  - Regression 36 PASS
  - Browser E2E + axe PASS
  - matching domain parity PASS
  - ELO domain parity PASS
  - 320 / 375 / 390 / 430 responsive PASS
  - representative visual contract PASS
  - Production HTTP smoke PASS
  - Production Chromium render smoke PASS
- Vercel Production: `4f8a55a` · deployment `dpl_6qdJWivcQ2KP2zZJwiRWhsRMACQc` · verified · READY
- PR #32 / `4f8a55a` contains no source changes; it retriggered deployment for the already-verified v2.1 product tree from `59b5af1`.
- The earlier Vercel rate-limit incident was resolved by the successful retry deployment.

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

### Remaining compatibility boundary

필수 미완료 기능은 없습니다. 향후 선택적 정리 후보:

- `footmate-patches.js`에 남은 DOM render/persistence 자체를 v2 controller/renderer로 추가 분리
- `footmate-product-hardening.js`의 Inspector UI render를 `src/v2/ui/`로 이동
- 큰 `demo-source.html` markup을 build-time source/component로 분리
- compatibility CSS를 component stylesheet로 추가 축소

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
