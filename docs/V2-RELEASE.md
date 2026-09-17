# FootMate v2 — Product Experience Architecture

## Status

**v2.0.0-beta.2 · Runtime Migration**

- Product/runtime baseline: `84c698b`
- Product PR: #21
- Vercel: exact product/runtime SHA Production READY
- Verification: GitHub Actions run #79 full PASS after QA-only smoke alignment

v2는 39개 화면과 기존 제품 정책을 새로 만드는 버전이 아니라, v1.x에서 누적된 runtime patch의 상태·UI 소유권을 명확한 ES module 경계로 이동하는 구조 전환 버전입니다.

## Completed goals

- 실제 사용자 흐름과 기술/PM 검증 UI 분리
- 새 UI 동작에서 `goScreen` 재래핑 제거
- active screen observer 기반 side effect 처리
- product/scenario state를 v2 store로 분리
- Home / Filter / Result interaction을 v2 controller로 이동
- Payment / Participation adapter를 business state machine과 분리
- Evaluation / Favorite / Friend / Chat persistence를 v2 controller로 이동
- 핵심 flow inline handler 제거 및 thin compatibility bridge만 유지
- 디자인 토큰을 v2 namespace로 정리
- duplicate charge와 legacy boolean migration 회귀 보호
- 대표 화면 visual contract regression 추가
- Node 24 및 production-impact aware CI 적용

## Runtime boundary

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

### Product mode

`/demo`

- 실제 사용자 흐름만 표시
- Portfolio Flow Nav / demo intro / Product Validation launcher 숨김
- 기존 39개 화면과 추천·결제·경기일·평가 정책 유지

### Portfolio mode

`/demo?mode=portfolio`

- 포트폴리오용 Flow Nav 유지
- Product Validation inspector 접근 가능
- 추천 설명 / 운영 정책 / PM 이벤트·KPI 별도 검증

## Compatibility boundary

v2 beta2는 대규모 rewrite 대신 기능 경계를 단계적으로 이전합니다.

- `footmate-finalize.js` — persisted state migration/render를 위한 **compatibility-state-bridge**
- `footmate-patches.js` — Matching/ELO scenario와 기존 render 구현 일부를 유지하되 `FootMateScenarioAdapter`로 v2 store에 노출
- `footmate-product-hardening.js` — 운영 state machine과 Product Validation의 compatibility adapter
- `footmate-core.js` / `footmate-product-core.js` — 순수 계산 및 제품 정책 core
- `footmate-persist-extra.js` — 제거됨
- legacy patch / hardening의 navigation wrapper — 제거됨
- `footmate-v1.1.js` — 제거됨

즉, beta2의 목표는 “legacy 파일 0개”가 아니라 **상태와 사용자 interaction의 소유권을 v2로 옮기고, 남은 legacy 계산/render 코드를 명시적 adapter 뒤로 격리**하는 것입니다.

## QA gates

- Regression 36
- Browser E2E + axe WCAG A/AA
- Product / Portfolio mode
- v2 state store and adapter ownership
- duplicate payment/participation charging guard
- critical inline-handler removal
- Product mode 320 / 375 / 390 / 430 px responsive gate
- Portfolio validation inspector responsive gate
- representative visual contract regression
- Production HTTP smoke
- Production Chromium render smoke
- Product/runtime change: Vercel deployment SHA = GitHub main product SHA
- QA/docs-only change: current Production smoke without requiring a redundant Vercel deployment

## Migration result

이전 계획의 핵심 migration slice는 beta2에서 완료했습니다.

1. Home / Filter / Result state → v2 store/controller **완료**
2. Payment / Participation UI adapter 분리 **완료**
3. critical inline/global handler 의존 축소 **완료**
4. representative visual regression gate **완료**
5. finalize/patch navigation wrapper 축소 **완료**
6. duplicate persistence layer 제거 **완료**

## Optional future cleanup

현재 기능·QA를 위해 필수인 미완료 작업은 없습니다. 구조를 더 순수하게 만들고 싶을 경우 다음은 후속 refactor 후보입니다.

- `footmate-patches.js`에 남은 Matching/ELO scenario render를 `src/v2/` 내부 모듈로 더 세분화
- 거대한 `demo-source.html`의 화면 markup을 build-time component/source로 분리
- 현재 compatibility CSS를 component 단위 stylesheet로 추가 축소

이 작업들은 beta2의 검증된 제품 동작을 바꾸지 않고 진행할 수 있는 기술 부채 정리 범위입니다.
