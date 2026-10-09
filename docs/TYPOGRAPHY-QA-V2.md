# FootMate 타이포그래피 QA v2 · P0–P3

## 범위

- Case Study (/): 기존 9단계의 8개 화면 폭·대체폰트·확대·간격·스크린샷 검사를 유지한다.
- Real App (/app): Home, Discover, Detail, 무료 Join, MY의 텍스트 기하·글꼴·한글 줄바꿈 검사를 확대한다.
- /beta 및 /beta/operator, 기능·문구·IA·색상·이미지·인증 흐름은 변경하지 않는다.

## P0 · CI 경로

- 현재 저장소에 없는 구형 Case Study 테스트 파일 8개 참조를 제거한다.
- node scripts/check-qa-test-paths.cjs 로 워크플로에 적힌 E2E 테스트 경로의 실재 여부를 확인한다.
- 기존 Case Study 및 Real App, Chromium·WebKit 회귀 검사를 유지한다.

## P1 · Real App 글자 검증

- 320, 390, 960, 1440px: Welcome, Home, Discover의 글자 영역·최소 크기·행간·가로 넘침을 확인한다.
- 390, 1440px: Detail → 무료 Join → MY의 텍스트도 검사한다.
- 390, 1440px: Google Fonts 요청을 차단한 대체폰트 검증을 추가한다. 웹폰트 로드 실패는 성공한 웹폰트 검사로 보고하지 않는다.
- 390, 1440px: 텍스트 크기를 2배로 높이는 시뮬레이션 및 간격 변경(행간 1.5, 문단 간격 2em, 자간 .12em, 단어 간격 .16em)을 별도 기록한다. 이는 실제 브라우저 UI 확대 테스트가 아니다.

## P2 · 한국어 줄바꿈

- 경기명은 어절 경계를 우선하도록 word-break:keep-all, overflow-wrap:break-word, white-space:normal을 적용한다.
- 긴 안내·오류 문구에 안전한 줄바꿈을 허용한다.
- 제목 마지막 줄이 지나치게 짧거나 의도된 말줄임이 있으면 자동 수정 대신 수동 검토 표식을 남긴다.
- 인위적으로 글자 영역을 잘라 실제 감지기가 실패를 찾아내는 음성 대조(negative control)를 추가한다.

## P3 · 증거와 보고

- 각 Playwright 시나리오에서 typography-qa.json, 스크린샷, 실패 trace를 기록한다.
- node scripts/typography-qa-report.cjs 는 verification/typography-qa-summary.json 및 verification/typography-qa-summary.md 를 생성한다.
- 브라우저 QA GitHub Actions 아티팩트에 집계와 개별 증거를 포함한다.
- 일반/대체폰트의 같은 문구를 화면 폭별로 비교해 줄 수·높이 변화 목록을 생성한다.
- 사전에 정의된 14개 검사 시나리오의 증거가 모자라면 보고서를 incomplete로 표시한다. 일부 테스트만 수행해도 전체 통과로 표기하지 않는다.
- node --test tests/contracts/typography-report.contract.cjs 가 보고서 집계·진단 구분을 확인한다.

## 실행

1. node scripts/check-qa-test-paths.cjs
2. node --test tests/contracts/typography-report.contract.cjs
3. npx playwright test --project=chromium tests/e2e/case-study-nine-stages.spec.cjs
4. npx playwright test --project=chromium tests/e2e/typography-real-app.spec.cjs
5. node scripts/typography-qa-report.cjs

Playwright 도구와 서버 설정은 현재 playwright.config.cjs 및 package.json의 QA 도구 버전에 따른다.

## 검증의 범위와 한계

- 자동 차단: 평상시·강제 대체폰트·주요 사용자 흐름의 텍스트 영역 잘림, 역할별 최소 글자 크기, 비정상 행간, 문서 가로 넘침.
- 진단: 텍스트 전용 200% 시뮬레이션과 사용자 글자 간격 변경. 발견 사항을 감추거나 자동 통과로 표시하지 않고 추후 교정 대상으로 유지한다.
- 수동 검토: 한국어 의미 단위, 고립된 마지막 행, 글자 밀도, 시각적 위계 및 글꼴별 미세한 이미지 차이.
- 이번 QA는 실제 브라우저 확대·완전한 WCAG 준수·사용자 성과·Production의 모든 상태를 인증하지 않는다. 기존 시각 기준 이미지를 오류를 감추기 위해 재생성하지 않는다.

참고: WCAG 2.2 Resize Text, Text Spacing, Reflow (W3C Understanding 문서).
