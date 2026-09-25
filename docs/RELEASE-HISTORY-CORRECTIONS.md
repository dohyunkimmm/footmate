# FootMate Release History Corrections

이 문서는 기존 `RELEASE-HISTORY.md`의 durable 이력을 삭제하지 않고, 이후 검증에서 범위 해석이나 승인 기준이 정정된 경우 **현재 적용되는 supersession**을 기록한다. 이 문서와 기존 Release History가 충돌하면 여기의 더 최신 correction이 현재 기준이다.

## Case Study 08 auth table spacing closure · 2026-09-25

- Scope: 08 Sign in · Join 안의 인증 flow와 로그인·참가 증빙 표 내부 여백만 조정하고, section 전체 세로 위치와 02–13 page rhythm은 변경하지 않음
- Runtime PR: #273 · merged SHA `c51411ed164d50f1366d0f71aa3a220407dd41ff`
- Auth flow: `둘러보기 → 참가 의도 → 인증/로그인 → 참가 상태` 셀의 gap과 내부 padding을 08 전용 selector로 조정
- Evidence table: `Real App / Closed Beta / 상태 보존 / 검증 범위` 4개 행의 panel padding, 행 간격, label/value column 간격을 08 전용 selector로 조정하며 다른 `.fm-cs-reasons` 표에는 적용하지 않음
- Desktop preservation: 08을 포함한 02–13 active story의 `align-items:center` 계약과 page-level padding/story gap/title·lead margin은 유지
- Mobile: 08 증빙 표는 label 위·본문 아래의 1-column 구조를 유지하면서 해당 행 내부 spacing만 별도 고정
- Cache boundary: Case Study visual hierarchy stylesheet query를 갱신해 official Production alias에서 이전 stylesheet 재사용 가능성을 줄임
- Regression guard: reader-polish E2E에서 08의 실제 flow gap/cell padding/scope padding/row geometry를 직접 검사하고, P1–P13 wrapping/spacing audit에도 08 전용 spacing contract를 추가
- PR QA: FootMate QA #1301 · run `36078936502` · SUCCESS · Regression 36 PASS · Browser E2E + axe PASS · Mobile Safari/WebKit PASS
- Final main QA: FootMate QA #1302 · run `36081422283` · SUCCESS · Regression 36 PASS · Browser E2E + axe PASS · Mobile Safari/WebKit PASS · Production Smoke PASS
- Exact Production verification: HTTP smoke PASS · AI inference PASS · Chromium smoke PASS
- Preserved: PR #271 page-rhythm correction, #268에서 승인된 독자용 카피·증거 변경, 08 상태 보존 문구, 09 legacy 링크 제거, 12 KPI 계산 기준, green 강조 의미 규칙, Real App/Closed Beta 제품·API·data/state-machine 경계
- Current Case Study runtime/Production baseline: `c51411ed164d50f1366d0f71aa3a220407dd41ff`

## Case Study page rhythm correction · 2026-09-25

- Supersedes: `RELEASE-HISTORY.md`의 `Case Study reader cleanup closure · 2026-09-25` 중 **02–13 desktop 여백·밀도를 page-wide로 조정했다는 현재 승인 해석**
- Root cause: PR #268에서 표/카드 여백 정리 요구를 02–13 전체 page density 변경으로 확대해 `align-items:flex-start`, 강제 38px 상하 padding, story gap·제목/lead margin·광범위 card padding 축소가 함께 들어갔다. 이 변경은 요청 범위를 넘겼고 02–13 본문을 위로 붙이는 regression을 만들었다.
- Page-rhythm correction: PR #271 · merged SHA `50fa005edc2e62c288ac49581464bf4942e46148`
- Current layout contract: 02–13 desktop story는 기존 **center alignment**를 유지한다. 표·카드 여백 변경은 요청된 structured block 내부 padding/gap/wrapping에 한정하고 slide `align-items`, page-level 상하 padding, story gap, 제목/lead margin으로 확대하지 않는다.
- 08 Sign in · Join: 인증·로그인/참가 범위 표를 다듬을 때는 해당 표의 행·셀 내부 여백과 wrapping을 조정하며 section 전체 세로 위치는 유지한다. 실제 08 전용 spacing 구현과 QA는 위 #273 closure가 현재 기준이다.
- Natural wrapping: `.fm-cs-line`을 inline 흐름으로 유지해 가능한 폭을 먼저 사용하고, 폭이 부족할 때만 자연스럽게 줄바꿈한다. 05 Guest First의 짧은 비교 흐름도 1440px에서 공간이 있으면 같은 줄을 유지한다.
- Visual regression correction: #268에서 위로 붙은 02–13 상태를 승인 snapshot으로 취급하지 않는다. 현재 자동 gate는 cover/caption pixel baseline을 유지하면서 02–13에 대해 `align-items:center`, 강제 38px padding 비사용, center geometry, horizontal overflow, natural wrapping을 직접 검사한다.
- Preserved from #268: 내부 `PBL` 제거와 같은 교육과정을 수강한 교육생 6명 맥락, 08 상태 보존 문구, 09 legacy evidence-mode 외부 링크 제거, 12 `계산 기준 · A ÷ B`, green 강조 의미 규칙, Real App/Closed Beta 제품·API·data/state-machine 경계
- PR QA: FootMate QA #1288 · run `36073846426` · SUCCESS · Regression 36 PASS · Browser E2E + axe PASS · Mobile Safari/WebKit PASS
- Final main QA: FootMate QA #1289 · run `36074420880` · SUCCESS · Regression 36 PASS · Browser E2E + axe PASS · Mobile Safari/WebKit PASS · Production Smoke PASS
- Exact Production verification: HTTP smoke PASS · AI inference PASS · Chromium smoke PASS
- Documentation boundary: root `README.md`는 제품 가치·연동 경계가 바뀌지 않아 수정하지 않는다. `docs/README.md`, `CASE-STUDY-COPY-QA.md`, 이 correction 기록과 공개 FootMate Notion 대표 프로젝트 페이지를 현재 기준으로 동기화한다. Closed Beta runbook과 AI architecture는 기능·운영 계약 변경이 없어 유지한다.
- Moving-main boundary: #271의 page-rhythm baseline은 `50fa005edc2e62c288ac49581464bf4942e46148`로 보존하고, 이후 08 내부 spacing closure가 반영된 현재 Case Study runtime/Production baseline은 `c51411ed164d50f1366d0f71aa3a220407dd41ff`로 구분해 기록한다.
