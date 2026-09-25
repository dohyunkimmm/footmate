# FootMate Release History Corrections

이 문서는 기존 `RELEASE-HISTORY.md`의 durable 이력을 삭제하지 않고, 이후 검증에서 범위 해석이나 승인 기준이 정정된 경우 **현재 적용되는 supersession**을 기록한다. 이 문서와 기존 Release History가 충돌하면 여기의 더 최신 correction이 현재 기준이다.

## Case Study repetition polish · final clarity closure · 2026-09-25

- Scope: Case Study 02–13을 페이지별로 재검토해 title·lead·summary·card·table의 동일 핵심어 반복을 줄이고, 각 section의 한 가지 기획 판단이 먼저 읽히도록 final clarity를 정리
- Runtime PR: #314 · merged SHA `d12a806d7a9a76987ef1ff08b250f79e91fb187a`
- Current Case Study content/runtime baseline: `d12a806d7a9a76987ef1ff08b250f79e91fb187a`
- Moving main boundary: 이 문서 sync 시점의 repository `main`은 `ae3cfedd5a9d1a4852fc19615dea8ac029768096`이며 Real App mobile shell 변경이다. `index.html`과 `case-study-final-clarity.js` blob은 #314 baseline과 동일해 Case Study 표시 내용은 변경되지 않았다.
- Copy ownership: 기존 connected/heading/service-planner/reviewer/lead-tighten/structured-copy 계층을 유지하되 최종 reader-facing 표시 문구와 페이지별 반복어 closure는 `case-study-final-clarity.js`가 마지막으로 적용
- Repetition contract: 02–13의 핵심어 반복을 E2E로 직접 제한. 대표적으로 10 `보존` 0회, 11 `결정론적` 최대 1회, 12 `계산 기준` 최대 1회이며 `참가`·`탐색`·`추천`·`로그인`·`검증` 등도 페이지별 상한 적용
- 10 Recovery: 원인 · 유지 상태 · 재시도/대체 행동을 직접 표시하고 `보존` 반복 라벨 제거
- 11 Domain & AI: lead는 AI 조건 해석과 판단/실행 책임 분리에 집중하고 `결정론적 추천 엔진`은 상세 책임 근거에서 1회만 유지. AI가 경기 사실·가격·정원·순위를 생성하지 않고 참가·결제는 사용자 최종 확인하는 기존 guardrail 유지
- 12 KPI & Validation: KPI와 QA, 측정 준비를 분리하고 Case Study 내부 8개 KPI modal 유지. 추가 지표·제외 기준·Baseline 준비 문구를 compact phrase로 정리하고 `connected-ai`와 `rules-fallback`, 사용률과 품질 판단을 분리
- 13 Release & Learnings: `구현 / 검증 / 다음 단계` 3개 summary만 유지하고 Real App/Closed Beta 중복, 검증 표본·과업 상세, Production QA 반복, 중복 Real App CTA 제거
- Phrase contract correction: 현재 02–13 structured label/value·table·flow·card는 명사형·짧은 구 + 무마침표가 기준이다. #286의 `이유·Trade-off·검증 설명은 항상 문장형` 해석은 현재 structured runtime과 충돌하는 범위에서 supersede되며, lead 등 long-form explanatory prose는 문장형을 유지
- Preserved: 01 Cover, 13-section IA, 02–13 desktop center alignment, 08 auth 전용 spacing, 09 legacy link 제거, 12 KPI 내부 evidence modal, Validation Metric과 Measured Result 분리, 사용자 과업 검증의 해석 한계, Real App/Closed Beta 기능·API·state-machine 경계
- #314 closure QA: FootMate QA #1558 · run `36148319925` · SUCCESS · Change Impact PASS · Regression 36 PASS · Browser E2E + axe PASS · Mobile Safari/WebKit PASS · Production Smoke PASS
- #314 exact Production verification: exact Vercel deployment PASS · HTTP smoke PASS · AI inference PASS · Chromium smoke PASS
- Documentation boundary: 이 correction과 `CASE-STUDY-COPY-QA-CORRECTIONS.md`만 #314 current Case Study baseline으로 동기화한다. 제품 기능과 장기 제품 사실이 바뀐 변경이 아니므로 root README, Beta runbook, AI architecture를 중복 수정하지 않는다.
- Notion boundary: 사용자 수동 수정본과 장기 제품·검증 기준을 우선한다. #314의 release 실행 이력이나 reader-facing 반복어 polish를 Notion에 자동 sync하지 않는다.

### Supersession

아래 #286 / #283 / #273 / #271 기록은 도입 이력과 보존 계약으로 유지한다. 현재 Case Study content/runtime baseline, 최종 표시 copy, structured phrase grammar와 페이지별 repetition contract는 PR #314 / SHA `d12a806d7a9a76987ef1ff08b250f79e91fb187a`가 우선한다.

## Case Study structured copy grammar closure · 2026-09-25

- Scope: 문서에 정의돼 있던 `상태명·단계명·CTA·짧은 값 = 명사형/짧은 구 + 마침표 없음` 규칙을 실제 01–13 Case Study의 표·flow·card runtime에 적용하고, 이유·Trade-off·검증 설명·회고는 설명 문장으로 유지
- Runtime PR: #286 · merged SHA `ea8659502b5adc8afca24934591adb73ed399cce`
- Cover preservation: 01 Cover의 기존 승인 copy/visual은 변경하지 않음
- Phrase contract: 02 Problem facts, 03 Persona compact values, 04 priority facts, 05 비교·결정, 06 결정, 07 CTA, 08 인증 증빙, 09 운영 상태, 10 recovery, 11 Domain/AI 책임, 12 KPI/QA compact values는 명사형·짧은 구 중심으로 정리하고 terminal punctuation을 제거
- Sentence contract: 이유·Trade-off·검증 범위·추천 품질 기준·Validation boundary와 13의 `과업 범위`·`학습·다음 단계`는 완전한 문장과 마침표 유지. 13 `검증 표본`은 compact evidence value라 무마침표 유지
- Regression guard: 전용 structured-copy Playwright gate를 Browser E2E + axe에 포함해 phrase-only component와 설명 문장을 의미별로 직접 검증
- Preserved: PR #285의 01/03 lead 축약, PR #283 recruiter hierarchy·12 KPI 내부 modal, PR #273 08 auth spacing, PR #271 02–13 center alignment, 승인된 evidence와 상태 보존 의미
- PR QA: FootMate QA #1377 · run `36113020210` · SUCCESS · Change Impact PASS · Regression 36 PASS · Browser E2E + axe PASS · Mobile Safari/WebKit PASS
- Final main QA: FootMate QA #1378 · run `36113545309` · SUCCESS · Change Impact PASS · Regression 36 PASS · Browser E2E + axe PASS · Mobile Safari/WebKit PASS · Production Smoke PASS
- Exact Production verification: Vercel exact deploy PASS · HTTP smoke PASS · AI inference PASS · Chromium smoke PASS
- Current Case Study runtime/Production baseline: `ea8659502b5adc8afca24934591adb73ed399cce`
- Notion boundary: 사용자 수동 수정본을 우선한다. 이 closure와 중복되거나 의미가 겹치는 Notion 내용은 자동 덮어쓰지 않는다.

## Case Study recruiter scan · KPI internal evidence closure · 2026-09-25

- Scope: 02–13 opening을 recruiter/manager scan 중심으로 재구성하고, 상태명·단계명·짧은 값의 phrase 규칙을 통일하며, 12 KPI 상세 근거를 GitHub 외부 이탈 없이 Case Study 내부에서 열람하도록 변경
- Runtime PR: #283 · merged SHA `205c1049109be2feadaedbb5937e00b812cd736e`
- JD framing: 최근 국내 대기업 AI/IT 서비스기획 JD에서 반복되는 요구사항 분석, User Research/Journey/Workflow, AI 적용 경계, 품질·QA·사용성 검증, 개발·QA 연계 관점을 기존 FootMate 근거의 정보 우선순위에만 사용. 새로운 경력·성과·협업 경험은 추가하지 않음
- Cover preservation: 01 Cover의 기존 승인 visual과 `Role / Scope / Responsibility` 구조는 유지. recruiter scan 개선을 이유로 cover pixel baseline을 변경하지 않음
- 02–13 opening contract: title 1문장 + lead 1문장 + compact planning facts 3개. 같은 의미를 긴 title과 복수 lead 문장으로 반복하지 않음
- Phrase contract: 상태명·단계명·CTA·짧은 값은 명사형/짧은 구 + 마침표 없음. 이유·Trade-off·검증 설명 같은 완전한 문장은 문장형 + 마침표 유지
- KPI internal evidence: `8개 지표의 계산·관찰 기준 보기`는 GitHub 외부 문서 대신 Case Study 내부 modal을 열어 계산 기준·관찰 기간·제외 기준을 확인. GitHub evidence 문서는 Source of Truth로 유지 가능하지만 reader CTA의 목적지는 아님
- Layout preservation: PR #271의 02–13 center alignment, PR #273의 08 auth table spacing, 05 natural wrapping, green 강조 의미 규칙을 유지
- Regression guard: `tests/e2e/v5.1-case-study.spec.cjs`에서 reviewer hierarchy, phrase consistency, internal KPI evidence를 직접 검증
- PR QA: FootMate QA #1346 · run `36089398183` · SUCCESS · Change Impact PASS · Regression 36 PASS · Browser E2E + axe PASS · Mobile Safari/WebKit PASS
- Final main QA: FootMate QA #1349 · run `36089979474` · SUCCESS · Regression 36 PASS · Browser E2E + axe PASS · Mobile Safari/WebKit PASS · Production Smoke PASS
- Exact Production verification: Vercel exact deploy PASS · HTTP smoke PASS · AI inference PASS · Chromium smoke PASS
- Preserved: 08 상태 보존/인증 spacing, 09 legacy 링크 제거, 12 Validation Metric과 실제 성과의 구분, Real App/Closed Beta 제품·API·data/state-machine 경계, 사용자 과업 검증의 해석 한계
- Current Case Study runtime/Production baseline at this closure: `205c1049109be2feadaedbb5937e00b812cd736e`; current baseline is superseded by the #286 closure above.
- Notion boundary: 사용자 수동 수정본을 우선한다. 이 closure와 중복되거나 의미가 겹치는 Notion 내용은 자동 덮어쓰지 않는다.

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
- Current Case Study runtime/Production baseline at this closure: `c51411ed164d50f1366d0f71aa3a220407dd41ff`; current baseline is superseded by the #286 closure above.

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
- Moving-main boundary: #271의 page-rhythm baseline은 `50fa005edc2e62c288ac49581464bf4942e46148`로 보존하고, 이후 08 내부 spacing closure가 반영된 당시 Case Study runtime/Production baseline은 `c51411ed164d50f1366d0f71aa3a220407dd41ff`로 구분해 기록한다. 현재 baseline은 위 #286 closure를 따른다.
