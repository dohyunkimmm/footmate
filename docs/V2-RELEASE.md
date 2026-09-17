# FootMate v2 — Product Experience Architecture

## Status

**v2.0.0-beta.1**

v2는 39개 화면과 기존 제품 정책을 새로 만드는 버전이 아니라, v1.x에서 누적된 runtime patch를 단계적으로 해소하면서 제품 경험과 포트폴리오 검증 경험을 분리하는 구조 전환 버전입니다.

## Goals

- 실제 사용자 흐름과 기술/PM 검증 UI를 분리
- 새 UI 동작에서 전역 함수 재래핑을 늘리지 않기
- 화면 상태 관찰, UI 상태 저장, 모드 판별을 ES module로 분리
- 디자인 토큰을 단일 v2 namespace로 정리
- 기존 Matching / ELO / Payment / Operations 정책과 persisted state 호환 유지
- QA runtime을 Node 24 기준으로 갱신

## Runtime boundary

```
src/v2/
  bootstrap.js
  core/
    mode.js
    screen-observer.js
    storage.js
  ui/
    validation-entry.js
  styles/
    tokens.css
    app.css
```

### Product mode

`/demo`

- 제품 사용자 흐름만 표시
- Portfolio Flow Nav / demo intro / Product Validation launcher 숨김
- 기존 39개 화면, 추천, 결제, 경기일, 평가 기능 유지

### Portfolio mode

`/demo?mode=portfolio`

- 포트폴리오용 Flow Nav 유지
- Product Validation inspector 접근 가능
- 추천 설명 / 운영 정책 / PM 이벤트·KPI를 별도 검증

## Compatibility

v2 beta는 기존 `footmate-core.js`, `footmate-product-core.js`, finalize/hardening layer를 즉시 재작성하지 않습니다. 먼저 새로운 변경이 들어갈 경계를 `src/v2/`로 만들고, 이후 기능 단위로 legacy runtime을 이동합니다.

더 이상 production shell에서 `footmate-v1.1.js`는 로드하지 않습니다. 해당 hotfix 동작은 `src/v2/ui/validation-entry.js`와 mode layer로 이전됩니다.

## Release gates

- Regression 36
- Browser E2E + axe WCAG A/AA
- Product mode 320 / 375 / 390 / 430 px responsive gate
- Portfolio mode validation inspector responsive gate
- Production HTTP smoke
- Production Chromium render smoke
- Vercel deployment SHA = GitHub main SHA

## Next migration slices

1. Home/filter/result rendering state를 v2 store로 이동
2. payment/participation UI adapter를 business state machine과 분리
3. inline style / global handler 의존도 축소
4. visual snapshot regression 추가
5. legacy finalize/patch 파일을 기능 단위로 축소
