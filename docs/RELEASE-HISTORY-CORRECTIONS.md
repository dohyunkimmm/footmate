# FootMate Release History Corrections

이 문서는 기존 `RELEASE-HISTORY.md`의 durable 이력을 삭제하지 않고, 이후 검증에서 범위 해석이나 승인 기준이 정정된 경우 **현재 적용되는 supersession**을 기록한다. 이 문서와 기존 Release History가 충돌하면 여기의 더 최신 correction이 현재 기준이다.

## Case Study page rhythm correction · 2026-09-25

- Supersedes: `RELEASE-HISTORY.md`의 `Case Study reader cleanup closure · 2026-09-25` 중 **02–13 desktop 여백·밀도를 page-wide로 조정했다는 현재 승인 해석**
- Root cause: PR #268에서 표/카드 여백 정리 요구를 02–13 전체 page density 변경으로 확대해 `align-items:flex-start`, 강제 38px 상하 padding, story gap·제목/lead margin·광범위 card padding 축소가 함께 들어갔다. 이 변경은 요청 범위를 넘겼고 02–13 본문을 위로 붙이는 regression을 만들었다.
- Current runtime correction: PR #271 · merged SHA `50fa005edc2e62c288ac49581464bf4942e46148`
- Current layout contract: 02–13 desktop story는 기존 **center alignment**를 유지한다. 표·카드 여백 변경은 요청된 structured block 내부 padding/gap/wrapping에 한정하고 slide `align-items`, page-level 상하 padding, story gap, 제목/lead margin으로 확대하지 않는다.
- 08 Sign in · Join: 인증·로그인/참가 범위 표를 다듬을 때는 해당 표의 행·셀 내부 여백과 wrapping을 조정하며 section 전체 세로 위치는 유지한다.
- Natural wrapping: `.fm-cs-line`을 inline 흐름으로 유지해 가능한 폭을 먼저 사용하고, 폭이 부족할 때만 자연스럽게 줄바꿈한다. 05 Guest First의 짧은 비교 흐름도 1440px에서 공간이 있으면 같은 줄을 유지한다.
- Visual regression correction: #268에서 위로 붙은 02–13 상태를 승인 snapshot으로 취급하지 않는다. 현재 자동 gate는 cover/caption pixel baseline을 유지하면서 02–13에 대해 `align-items:center`, 강제 38px padding 비사용, center geometry, horizontal overflow, natural wrapping을 직접 검사한다.
- Preserved from #268: 내부 `PBL` 제거와 같은 교육과정을 수강한 교육생 6명 맥락, 08 상태 보존 문구, 09 legacy evidence-mode 외부 링크 제거, 12 `계산 기준 · A ÷ B`, green 강조 의미 규칙, Real App/Closed Beta 제품·API·data/state-machine 경계
- PR QA: FootMate QA #1288 · run `36073846426` · SUCCESS · Regression 36 PASS · Browser E2E + axe PASS · Mobile Safari/WebKit PASS
- Final main QA: FootMate QA #1289 · run `36074420880` · SUCCESS · Regression 36 PASS · Browser E2E + axe PASS · Mobile Safari/WebKit PASS · Production Smoke PASS
- Exact Production verification: HTTP smoke PASS · AI inference PASS · Chromium smoke PASS
- Documentation boundary: root `README.md`는 제품 가치·연동 경계가 바뀌지 않아 수정하지 않는다. `docs/README.md`, `CASE-STUDY-COPY-QA.md`, 이 correction 기록과 공개 FootMate Notion 대표 프로젝트 페이지를 현재 기준으로 동기화한다. Closed Beta runbook과 AI architecture는 기능·운영 계약 변경이 없어 유지한다.
- Moving-main boundary: 이후 docs-only sync commit이 `main` SHA를 바꾸더라도 Case Study runtime/Production baseline은 `50fa005edc2e62c288ac49581464bf4942e46148`로 구분해 기록한다.
