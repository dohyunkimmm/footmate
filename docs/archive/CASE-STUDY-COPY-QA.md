# FootMate Case Study Copy QA

이 문서는 Case Study 본문 카피와 레이아웃 검수 기준을 정리한다.

- 왼쪽 목차의 **section title과 subcopy는 영어**로 표기한다.
- 본문 설명은 한국어를 우선하고 Persona/JTBD, HITL, QA, Visual Regression, Production, OAuth, Supabase, Web Push처럼 제품·기술 의미가 분명한 용어만 필요한 범위에서 유지한다.
- 사용자에게 경로 문자열 `/app`, `/beta`를 설명 이름처럼 노출하지 않는다. 화면에서는 **Real App**, **Closed Beta**로 표현하고 실제 route는 링크 속성에서 유지한다.
- 도메인 내부 식별자 `recommendation`, `participation`, `matchday`, `return`은 코드 소유권을 설명할 때만 사용하고 독자용 설명을 함께 둔다.
- Case Study는 13개 section으로 유지하며 각 section은 하나의 역할을 갖는다. 중복된 Core Journey, Join/Payment, Provider/AI 설명은 각각 Scope & Priority, Sign in·Join, Domain & AI에 통합한다.
- desktop의 story section은 현재 승인된 visual center 배치를 유지하고, 본문과 구조화된 정보 블록의 좌측 기준선을 일관되게 맞춘다.
- **페이지 전체 배치와 표·카드 내부 여백은 별도 계약이다.** 특정 표의 여백을 다듬을 때 section 전체 `align-items`, slide 상하 padding, story gap, 제목/lead margin을 함께 바꾸지 않는다.
- 동일한 유형의 표·카드는 cell padding, gap, line-height, Korean word-break 규칙을 일관되게 사용한다. 단, 요청 범위를 다른 section의 표·카드 전체로 자동 확대하지 않는다.
- 1440×900 기준 각 section의 핵심 콘텐츠가 한 화면 안에서 읽히도록 구성하고, mobile은 자연스러운 세로 스크롤을 허용한다.
- 자동 QA는 반복 가능한 contract/E2E/axe/Visual Regression/Production smoke를 담당한다.
- 사람 검수(Human QA)는 실제 로그인, 실제 전달, OS·브라우저 표시처럼 사람이 결과를 확인해야 하는 항목을 담당한다.
- AI 보조 검수(AI-assisted QA)는 중복, 용어 혼용, section 역할 충돌, Source of Truth와 카피 불일치를 찾는 보조 수단이며 PASS 판정을 대신하지 않는다.

## 2026-09-25 recruiter scan · KPI 내부 열람 closure

PR #283에서는 최근 국내 대기업 AI/IT 서비스기획 JD에서 반복되는 요구사항 분석, User Research/Journey/Workflow, AI 적용 경계, 품질·QA·사용성 검증, 개발·QA 연계 관점을 **기존 FootMate 근거의 정보 우선순위에만 반영**했다. 새로운 경력·성과·협업 경험을 추가하지 않는다.

- 현재 Case Study runtime/Production baseline: PR #283 · SHA `205c1049109be2feadaedbb5937e00b812cd736e`
- 01 Cover: 기존 승인 visual과 `Role / Scope / Responsibility` 정보 구조를 유지한다. recruiter scan 개선을 이유로 cover visual baseline을 새로 만들지 않는다.
- 02–13 opening: 긴 title + 복수 문장 lead를 반복하지 않고 **title 1문장 + lead 1문장 + compact planning facts 3개** 순서로 핵심 기획 판단을 먼저 스캔할 수 있게 한다.
- Planning facts: 실제 근거가 있는 `결정 / 이유 / 검증 범위 / 상태 보존 / AI 역할 경계 / 다음 검증` 같은 정보를 해당 section에 맞게 사용하며 모든 section에 같은 라벨을 억지로 채우지 않는다.
- Phrase consistency: 상태명·단계명·CTA·짧은 값은 명사형 또는 짧은 구 + 마침표 없음. 이유·Trade-off·검증 설명처럼 완전한 문장은 문장형 + 마침표를 유지한다.
- 12 KPI & Validation: 독자용 `8개 지표의 계산·관찰 기준 보기`는 GitHub 외부 문서로 이탈시키지 않고 **Case Study 내부 modal**에서 8개 KPI의 계산 기준·관찰 기간·제외 기준을 확인하게 한다. GitHub evidence 문서는 Source of Truth로 유지할 수 있으나 reader CTA의 목적지는 아니다.
- Layout preservation: 02–13 desktop `align-items:center`, page-level spacing, 08 auth table spacing, 05 natural wrapping, green emphasis 의미 규칙을 그대로 유지한다.
- Regression guard: `tests/e2e/v5.1-case-study.spec.cjs`에서 reviewer hierarchy, phrase consistency, 12 내부 KPI evidence 열람을 직접 검사한다.
- PR QA: FootMate QA #1346 · run `36089398183` · SUCCESS · Change Impact PASS · Regression 36 PASS · Browser E2E + axe PASS · Mobile Safari/WebKit PASS
- Final main QA: FootMate QA #1349 · run `36089979474` · SUCCESS · Regression 36 PASS · Browser E2E + axe PASS · Mobile Safari/WebKit PASS · Production Smoke PASS
- Exact Production verification: Vercel exact deploy PASS · HTTP smoke PASS · AI inference PASS · Chromium smoke PASS
- 보존: 08 상태 보존/인증 spacing, 09 legacy 링크 제거, 12 Validation Metric과 실제 성과의 구분, Real App/Closed Beta 제품·API·data/state-machine 경계, 사용자 과업 검증의 해석 한계는 변경하지 않는다.

## 2026-09-25 08 로그인·인증 표 spacing closure

PR #271에서 page-wide density regression은 복구했지만, 08 Sign in · Join의 인증 flow와 증빙 표 자체는 공통 구조화 블록 spacing만 적용돼 사용자 요청이 충분히 드러나지 않았다. PR #273에서는 **08 내부 요소에만 전용 selector를 적용**해 실제 표/flow의 간격을 조정했다.

- 08 spacing implementation baseline: PR #273 · SHA `c51411ed164d50f1366d0f71aa3a220407dd41ff`
- Desktop auth flow: `둘러보기 → 참가 의도 → 인증/로그인 → 참가 상태`의 gap `6px`, 각 셀 padding `10px 12px`; 인증 flow 밖 page-level geometry는 변경하지 않는다.
- Desktop 증빙 표: `.fm-next-cs-scope` padding `10px 14px`, `Real App / Closed Beta / 상태 보존 / 검증 범위` 행 gap `0`, 각 행 상하 padding `5px`, label column `84px`, label-value column gap `14px`.
- Mobile 08: auth flow gap `10px`, 셀 padding `10px 12px`, scope padding `10px 12px`; 증빙 행은 1-column으로 쌓고 row gap `3px`, 각 행 상하 padding `7px`을 사용한다.
- Scope boundary: 위 수치는 `data-v5-content-role="auth-participation"`에만 적용하며 다른 section의 `.fm-cs-reasons`, 카드, 표에는 전파하지 않는다.
- Page preservation: 08 active story를 포함한 02–13 desktop의 `align-items:center`와 page-level 상하 padding/story gap/title·lead margin은 PR #271 기준을 유지한다.
- Regression guard: `v5.1-case-study-reader-polish.spec.cjs`가 08의 실제 flow gap/cell padding/scope padding/row geometry와 center alignment를 직접 검사하고, `v5.1-case-study-wrap.spec.cjs`의 P1–P13 audit에도 08 전용 spacing contract를 포함한다.
- 최종 main QA: FootMate QA #1302 · run `36081422283` · SUCCESS
- QA: Regression 36 PASS · Browser E2E + axe PASS · Mobile Safari/WebKit PASS · Production Smoke PASS
- Exact Production verification: HTTP smoke PASS · AI inference PASS · Chromium smoke PASS
- 보존: 08 상태 보존 문구, Google/Kakao OAuth Production 실로그인/실제 PG 미연동 경계, #268의 승인된 독자용 카피·증거 변경, 09 legacy 링크 제거, 12 KPI 계산 기준, green 강조 의미 규칙은 변경하지 않는다.

## 2026-09-25 페이지 리듬 복구 closure

PR #268에서 독자용 카피 정리와 함께 들어간 02–13 page-wide density override는 표 여백 조정 범위를 넘긴 변경이었다. `align-items:flex-start`, 38px 상하 padding, section 전체 story gap·제목/lead margin·광범위 card padding 축소는 PR #271에서 제거했으며, 현재 기준에서는 **02–13 desktop story를 기존 중앙 배치로 유지**한다.

- 페이지 리듬 baseline: PR #271 · SHA `50fa005edc2e62c288ac49581464bf4942e46148`
- Page-rhythm + 08 spacing baseline before PR #283: PR #273 · SHA `c51411ed164d50f1366d0f71aa3a220407dd41ff`; #271의 page-level center contract 위에 08 내부 spacing만 추가
- 현재 Case Study runtime/Production baseline은 위 `recruiter scan · KPI 내부 열람 closure`의 PR #283 · SHA `205c1049109be2feadaedbb5937e00b812cd736e`이다.
- 데스크톱 기준: 02–13 active slide `align-items:center`, PR #268의 강제 `38px` 상하 padding 비사용, story/slide 중심 오차 `<= 20px`, horizontal overflow 없음
- 구조화 영역 기준: 필요한 표·카드 내부 padding/gap/wrapping만 조정하며 page-level 위치를 바꾸지 않는다.
- 08 Sign in · Join: 인증·로그인/참가 flow와 범위 표의 행·셀 내부 여백과 문장 wrapping을 08 전용 selector로 조정하며 해당 section 전체의 세로 위치는 유지한다.
- 줄바꿈 기준: `.fm-cs-line`은 가능한 폭을 먼저 사용하도록 inline 흐름을 유지하고, 화면 폭이 부족할 때만 자연스럽게 줄바꿈한다.
- 05 Guest First: 짧은 비교 흐름은 1440px에서 공간이 있으면 같은 줄을 유지한다.
- Visual Regression 기준: cover 1728/1440/390 및 cover caption 320/390은 pixel baseline 비교를 유지한다. 02–13 본문은 #268에서 위로 붙은 상태를 저장한 stale screenshot을 정답으로 재사용하지 않고, center alignment·overflow·natural wrapping 같은 layout invariant를 직접 검증한다.
- #271 final main QA: FootMate QA #1289 · run `36074420880` · SUCCESS · Regression 36 PASS · Browser E2E + axe PASS · Mobile Safari/WebKit PASS · Production Smoke PASS
- #273 final main QA: FootMate QA #1302 · run `36081422283` · SUCCESS · Regression 36 PASS · Browser E2E + axe PASS · Mobile Safari/WebKit PASS · Production Smoke PASS
- Exact Production verification: HTTP smoke PASS · AI inference PASS · Chromium smoke PASS
- 보존: #268에서 확정한 내부 `PBL` 제거/교육생 6명 맥락, 08 상태 보존 문구, 09 legacy evidence-mode 외부 링크 제거, 12 `계산 기준 · A ÷ B`, green 강조 의미 규칙과 Real App/Closed Beta 제품 로직은 유지한다.

## 본문·줄바꿈·표 여백 검수 기준

- `word-break: keep-all`과 overflow 통과는 편집 검수 완료를 뜻하지 않는다. 모든 페이지의 실제 렌더를 별도로 확인한다.
- 02–13 opening은 **title 1문장 + lead 1문장 + compact planning facts 3개**를 기본으로 하며, 같은 의미를 title/lead에서 반복하지 않는다. 화면 폭에 따른 자연 줄바꿈을 허용하며 글자를 줄이거나 잘라서 맞추지 않는다.
- 상태명·단계명·CTA·짧은 값은 명사형 또는 짧은 구로 쓰고 마침표를 붙이지 않는다. 이유·Trade-off·검증 설명처럼 완전한 문장은 문장형과 마침표를 유지한다.
- 표·카드는 안쪽 여백, 행·열 간격, 제목과 설명 간격, 텍스트의 좌측 정렬을 함께 확인한다. 모바일의 결정 근거 행은 라벨 위·본문 아래로 바꾼다.
- KPI는 `계산 기준 · A ÷ B` 형식으로 표시하고, 8개 지표의 상세 계산·관찰·제외 기준은 **Case Study 내부 modal**에서 확인한다. 독자용 CTA가 GitHub 외부 문서로 이동하지 않는지 함께 검증한다.
- 데스크톱 1440×900의 13개 페이지와 모바일 320·390px의 **전체 본문**을 검수한다. 모바일 viewport 캡처만 보고 하단까지 확인했다고 기록하지 않는다.
- 후보 이미지 생성, 이미지 내용의 시각 검토, 승인한 이미지와의 재비교를 구분한다. 새 이미지를 만들었다는 이유만으로 Visual Regression PASS를 주장하지 않는다.
- 이 검수는 Case Study 13개 페이지와 표지의 정적 핵심 화면 프리뷰·캡션을 대상으로 한다. `/app`, `/beta`, `/demo`의 제품 기능 자체는 별도 Product QA 범위다.

## 2026-09-23 전체 편집 검수

검수 범위는 P1–P13의 본문이다. 데스크톱 1440×900 전체 페이지와 모바일 320·390px 전체 본문 이미지를 직접 읽고, 문장의 역할·줄 끝의 짧은 잔여 단어·표/카드의 내부 여백과 간격을 확인했다. 자동 overflow 검사와 별개의 렌더 이미지 검토이며, 사용자 대상 가독성 실험이나 서비스 성과 검증은 아니다.

| 페이지 | 내용 정리 | 줄바꿈·표/카드 검토 |
| --- | --- | --- |
| P1 Overview | 단독 기획·구현·검증 범위와 역할 구분 | 역할 카드 제목 축약, 설명을 의미별 두 줄로 정리; 미리보기 캡션을 프레임 아래로 분리 |
| P2 Problem & Goal | 문제 가설→서비스 목표→확인 지표, 대안의 검증 한계 구분 | 설명 문장 분리, 대안/선택/검증 범위의 라벨과 본문 정렬 |
| P3 Persona · JTBD | 설계 가정과 다음 Beta 관찰 질문 명시 | 상황·기준·불안 카드를 두 줄씩 정리, JTBD 하단까지 확인 |
| P4 Scope & Priority | 우선·확장·제외의 이유와 수익화 유보 설명 | 모바일 여정의 한·영을 한 행으로 묶어 과도한 세로 여백 축소 |
| P5 Guest First | 가입 우선은 비교한 대안으로 표시, 실제 실험 성과처럼 표현하지 않음 | 대안 카드와 결정/이유/Trade-off 행의 여백 확인 |
| P6 Recommendation | 입력 신호와 추천 순위·이유의 소유권 구분 | 추천 예시·입력 목록·정책 행의 줄바꿈과 카드 간격 확인 |
| P7 Decision Detail | 참가 판단 순서와 보조 행동의 범위 정리 | 가로/세로 흐름의 화살표 방향, 정보 셀과 정책 행의 여백 확인 |
| P8 Sign in · Join | 인증 전 선택 보존, 시뮬레이션과 실연동 구분 | 중복 흐름 제거, 보존 맥락 설명 축약, 인증 flow와 범위 표 내부 spacing을 section-specific contract로 검증 |
| P9 Operations | 운영 권한·대기열·변경 이력·알림 복구 구분 | 정책 표를 전폭으로 배치하고 CTA를 분리해 좁은 본문 열 해소 |
| P10 Recovery | 상황마다 보존할 상태와 다음 행동, 결제 시뮬레이션 표시 | 복구 카드의 두 설명 줄과 공통 원칙의 끝줄 균형 확인 |
| P11 Domain & AI | 추천/상태/실행 책임 및 개인 프로젝트의 협의 기준 설명 | 연동 목록과 개발·디자인·운영 항목 분리, 모바일 정책 표 전체 확인 |
| P12 KPI & Validation | Validation Metric과 QA 분리, 외부 분석 미연동·측정 전제 명시 | 4개 KPI를 실제 4열로 배치, `계산 기준 · A ÷ B` 표기, QA 카드·각주·내부 KPI 열람 modal까지 확인 |
| P13 Release & Learnings | 구현 결과·미검증 성과·배운 점·다음 판단 기준 구분 | 결과 카드와 회고 행을 나누고 마지막 CTA까지 확인 |

실제 렌더 검토에서 추가 수정한 항목은 P1 역할 카드 제목, P4 모바일 여정의 과도한 높이, P7 화살표 방향, P8 중복 흐름과 끝줄, P9 좁은 운영 정책 표, P12 비어 있던 다섯 번째 grid 열, 320·390px의 일부 문장/가운데점 줄바꿈이다. 전체 본문 캡처는 고정 헤더가 이미지 안에 겹치지 않도록 해당 캡처에서만 헤더를 숨기며, 기존 viewport·헤더 위치 검사는 그대로 유지한다.

- 당시 자동 시각 비교: 기존 viewport 27개 + 전체 본문 26개(13×2), 미리보기 캡션 2개 추가, 총 55개 `toHaveScreenshot`, `maxDiffPixels: 0`. **이 2026-09-23 이력은 당시 검수 사실이며 현재 자동 gate의 승인 기준과 동일하지 않다.**
- 현재 자동 gate: cover/caption pixel baseline + 02–13 center alignment·overflow·natural wrapping invariant + 08 auth flow/evidence table spacing + reviewer hierarchy/phrase consistency/내부 KPI evidence contract 검증
- 반응형 구조 검사: 1440/1180/900/430/390/375/320px, P1–P13; 정책 행의 `dt`/`dd` 글자 크기도 포함
- TOC: 부제 13개 한 줄, 잘림 없음
- 결과 증빙: 해당 PR의 QA 및 Release History Correction에 최종 run과 Production 결과를 별도 기록