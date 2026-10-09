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

- 320, **375**, 390, 430, 560, 699, 700, 960, **1366**, 1440, **1920**px: Welcome, Home, Discover의 글자 영역·최소 크기·행간·가로 넘침을 확인한다.
- 390, 1440px: Detail → 무료 Join → MY의 텍스트도 검사한다.
- 390, 1440px: Google Fonts 요청을 차단한 대체폰트 검증을 추가한다. 웹폰트 로드 실패는 성공한 웹폰트 검사로 보고하지 않는다.
- 390, 1440px: 텍스트 크기를 2배로 높이는 시뮬레이션 및 간격 변경(행간 1.5, 문단 간격 2em, 자간 .12em, 단어 간격 .16em)을 별도 기록한다. 이는 실제 브라우저 UI 확대 테스트가 아니다.

## P2 · 한국어 줄바꿈

- 경기명은 어절 경계를 우선하도록 word-break:keep-all, overflow-wrap:break-word, white-space:normal을 적용한다.
- 긴 안내·오류 문구에 안전한 줄바꿈을 허용한다.
- 320·**375**·390px에서 실제 긴 한국어 경기명·띄어쓰기 없는 장문·한영 혼합 문구를 테스트 DOM에 주입하여 줄바꿈과 가로 넘침을 실측한다. 사용자가 보는 운영 데이터는 변경하지 않는다.
- 텍스트 자체뿐 아니라 상위 overflow:hidden/clip 컨테이너에서 일부 보이는 글자가 잘리는 경우도 검사하고 음성 대조로 검증한다.
- 제목 마지막 줄이 지나치게 짧거나 의도된 말줄임이 있으면 자동 수정 대신 수동 검토 표식을 남긴다.
- 인위적으로 글자 영역을 잘라 실제 감지기가 실패를 찾아내는 음성 대조(negative control)를 추가한다.

## P3 · 증거와 보고

- 각 Playwright 시나리오에서 typography-qa.json, **화면별로 구분된 스크린샷**, 실패 trace를 기록한다.
- node scripts/typography-qa-report.cjs 는 verification/typography-qa-summary.json 및 verification/typography-qa-summary.md 를 생성한다.
- 브라우저 QA GitHub Actions 아티팩트에 집계와 개별 증거를 포함한다.
- 일반/대체폰트의 같은 문구를 화면 폭별로 비교해 줄 수·높이 변화 목록을 생성한다.
- 각 글자 샘플의 fontSize·lineHeight·fontFamily·fontWeight·color·letterSpacing·textAlign을 기록하고 화면별 PNG 해시·파일 경로와 함께 시각 검토 매니페스트를 생성한다.
- **육안 시각 검토 상태는 pending-human-review로 유지**하며, 색 대비/텍스트 위계/한국어 자연스러운 줄바꿈을 자동 합격으로 표기하지 않는다.
- 사전에 정의된 **23개 검사 시나리오 / 화면별 PNG 56개** 중 증거가 모자라면 보고서를 incomplete/failed로 표시하고 **CI를 실패**시킨다. 일부 테스트만 수행해도 전체 통과로 표기하지 않는다.
- 스크린샷의 이름만 확인하지 않고 테스트 출력 디렉터리의 **실제 PNG 원본**을 열어 PNG 서명, 파일 크기, SHA-256을 대조한다. 누락/변조/중복/상위경로 이동/심볼릭 링크를 오류 처리한다.
- PNG 원본과 Playwright 첨부본은 CI 아티팩트에 함께 보관한다. 파일 무결성 통과는 시각적 품질 합격이 아니다.
- Chromium 종료 후 WebKit을 별도 outputDir(`test-results/playwright-webkit`)에서 실행해 PNG 원본 56개와 JSON이 삭제되지 않게 하고, 업로드 직전에 보고서를 **재실행**하여 실제 파일 무결성을 확인한다. 아티팩트 ZIP 안에 실물이 존재하는지 내려받아 확인하는 것은 최종 Release 확인 단계다.
- 문서 가로 넘침(documentOverflow)도 평상시·대체폰트·사용자 여정의 게이트 오류로 집계한다. 200% 텍스트·사용자 간격 시뮬레이션은 진단 모드로 유지한다.
- 음성 대조에서는 본문/상위 컨테이너의 인위적 잘림이 감지됐는지도 증거 검사에 포함한다.
- node --test tests/contracts/typography-report.contract.cjs 가 보고서 집계·진단 구분을 확인한다.

## 실행

1. node scripts/check-qa-test-paths.cjs
2. node --test tests/contracts/typography-report.contract.cjs
3. npx playwright test --project=chromium tests/e2e/case-study-nine-stages.spec.cjs
4. npx playwright test --project=chromium tests/e2e/typography-real-app.spec.cjs
5. node scripts/typography-qa-report.cjs

Playwright 도구와 서버 설정은 현재 playwright.config.cjs 및 package.json의 QA 도구 버전에 따른다.

## 검증의 범위와 한계

- 자동 차단: 평상시·강제 대체폰트·주요 사용자 흐름의 본문/상위 컨테이너 텍스트 영역 잘림, 역할별 최소 글자 크기, 비정상 행간, 문서 가로 넘침, 보고서 증거 누락.
- 진단: 텍스트 전용 200% 시뮬레이션과 사용자 글자 간격 변경. 발견 사항을 감추거나 자동 통과로 표시하지 않고 추후 교정 대상으로 유지한다.
- 수동 검토: 한국어 의미 단위, 고립된 마지막 행, 글자 밀도, 시각적 위계 및 글꼴별 미세한 이미지 차이. 자동 검증된 PNG 56개를 화면별로 비교하고 리뷰 결과/이슈 링크를 PR에 남긴 뒤 승인한다.
- 이번 QA는 실제 브라우저 확대·완전한 WCAG 준수·사용자 성과·Production의 모든 상태를 인증하지 않는다. 기존 시각 기준 이미지를 오류를 감추기 위해 재생성하지 않는다.

참고: WCAG 2.2 Resize Text, Text Spacing, Reflow (W3C Understanding 문서).

## Preview 배포 P1 안정화

- GitHub PR 브랜치의 마지막 커밋만 보지 않고 main 분기점 기준 전체 파일 변경을 검사한다.
- Vercel의 얕은 checkout에 origin/main이 없으면 제한된 Git fetch로 main과 현재 PR 브랜치 이력을 가져와 비교한다. 네트워크/이력 복구에 실패하면 배포를 생략하지 않고 빌드한다.
- vercel.json의 `feat/typography-qa-p0-p2-20261009` 배포 예외는 **PR #559를 main에 병합한 이후** 후속 패치로 제거해야 한다. PR 미병합 중에는 Preview 확인을 위해 유지한다. Git 커밋 서명 검증 보안은 끄지 않는다.

## P0–P2 추가 검증 및 승인 체크리스트

- **P0 / 증거 무결성:** 23개 시나리오 및 PNG 56개가 실제 파일·SHA-256까지 일치해야 함. CI 계약 테스트는 정상·누락·PNG 손상·해시 변조·경로 이탈·심볼릭 링크를 검증.
- **P1 / 읽기 가능성:** 모바일 320/375/390/430px과 브레이크포인트 560/699/700/960px, 데스크톱 1366/1440/1920px에서 Welcome·Home·Discover의 텍스트 잘림/최소 크기/가로 넘침이 없어야 함. Detail→Join→MY 390/1440px, 대체폰트 390/1440px, 한국어 긴 문구 320/375/390px 확인.
- **P1 / 확대·간격:** 200% 텍스트·사용자 간격은 현재 **자동 차단 아님**. 진단 결과의 issue 건수를 별도 집계하고 실제 브라우저 확대(WCAG Resize Text) 검증이라고 주장하지 않음. 발견된 문제 교정 및 브라우저/디바이스 실측 후 별도 게이트 승격.
- **P2 / 사람의 시각 검토:** PNG별로 (1) 한국어 어절·영문 혼합/줄바꿈, (2) 제목·본문·보조문구 위계, (3) 좁은 카드/경계의 줄 수·정보 손실, (4) 웹폰트 실패, (5) 진단 확대/간격 결과를 검토. `verification/typography-qa-summary.md`의 매니페스트를 사용하고 PR 리뷰에 검토자·날짜·이슈·합격 여부를 남김.
- 기존 시각 기준 스냅샷은 명시적인 사람의 검토 및 승인 없이 덮어쓰거나 재생성하지 않음.

**검증 상태 구분:** `gateStatus=no-reported-issues`는 자동 검사 범위에서 문제를 검출하지 않았다는 뜻이며, `visualReviewStatus=pending-human-review`가 남아 있으면 최종 타이포그래피 시각 적합성 승인이 끝난 것이 아니다.
