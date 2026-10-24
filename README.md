# FootMate

**AI로 원하는 풋살 경기를 찾고, 로그인부터 무료 참가·경기 후 피드백까지 연결한 베타 앱입니다.**

개인 → 경기 매칭을 중심으로, AI가 자연어 요청을 해석하고 규칙 기반 추천 엔진이 경기 적합도·후보·판단 근거를 제공합니다. 탐색부터 참가 결정, 경기 당일, 경기 후 피드백까지 하나의 흐름으로 연결합니다.

**사용자 여정:** `Find → Decide → Join → Play → Return`

## 화면 구성

| 경로 | 설명 |
| --- | --- |
| `/` | 문제 정의·설계·검증 근거를 소개하는 Case Study |
| `/demo` | **출시 Beta 앱 진입**: 실제 계정·경기·참가 데이터와 연결 |
| `/beta` | 같은 출시 Beta 앱과 OAuth 복귀 경로 |\n| `/prototype` | 이전 브라우저 로컬 프로토타입·검증 기록 |
| `/beta/operator` | 허용된 운영자만 접근하는 TOTP MFA 운영 화면 |

**포트폴리오 검토 포인트**

- **근거 화면:** Case Study에 실제 모바일 QA 캡처를 연결했습니다.
- **Guided Mode:** 추천, 두 경기 비교, 마감 포지션, MY 바로가기를 제공합니다.
- **데이터 경계:** 선호 포지션 마감과 예시 이동시간은 실제 정원·경로 계산과 구분합니다. Demo의 공유 미리보기는 Case Study와 다른 제목·이미지를 사용합니다.

**주요 링크:** [Case Study](https://footmate-black.vercel.app/) · [FootMate Beta](https://footmate-black.vercel.app/demo)

**체험 안내:** [6단계 Guided Mode](https://footmate-black.vercel.app/prototype?mode=guided)는 단계별 안내용이며, `/prototype?mode=evidence`는 구현·검증 근거 확인용입니다.

## 주요 경험

- **경기 검색:** AI가 자연어 조건을 해석하고 실제 공개 경기에서 후보를 찾습니다.
- **로그인·참가:** 기존 Google/Kakao·이메일 인증, 프로필·포지션 설정과 서버 참가·취소를 사용합니다.
- **경기 당일·이후:** 참가 기록·체크인·피드백을 서버에 저장합니다. 다음 추천에 피드백을 활용하는 개선은 추가 검증 과제입니다.

재방문 시 기존 Beta 계정과 서버 기록을 복구합니다. 체험 선택·중복 시작 메뉴는 공개 앱에 두지 않습니다.

## AI 설계 원칙

`Context → Plan → Tools → Guardrail → Observe`

AI는 자연어 요청을 지역·레벨·포지션 등의 **검색 조건으로 해석**합니다. 실제 경기 후보·정렬·추천 이유는 **결정론적 추천 엔진**이 담당합니다.

AI 모델 대체 경로로 복구를 시도합니다. 조건 해석에 실패해도 기존 경기 목록은 유지하며, 참가 확정은 사용자가 직접 수행합니다.

**최근 검색 보정(2026-10-18):** 오전/오후 12시 등 시간 표현, 복합 금액, 지역·포지션 제외 조건의 해석을 개선했습니다. AI 실패 시 규칙 기반 대체 검색에도 해당 보정을 적용합니다.

경기 후보·순위·추천 이유는 규칙 엔진이 결정합니다. [PR #639 검증 이력](docs/RELEASE-HISTORY.md)은 해당 PR 기준이며, 후속 `main` 배포 확인과는 구분합니다.

## 구현 및 연동 범위

| 영역 | 현재 상태 |
| --- | --- |
| AI 검색 | Vercel AI Gateway가 조건을 해석하고 추천은 규칙 엔진이 결정. 운영 검증 범위는 릴리스 이력 참조 |
| 출시 Beta `/demo` · `/beta` | 기존 서버 인증·경기·참가 상태를 사용하는 앱 |\n| 이전 프로토타입 `/prototype` | 샘플 데이터와 로컬 저장 기반 검증용 화면. 실제 계정·참가 기록과 구분 |
| Closed Beta `/beta` | Supabase 인증·경기·포지션별 정원·참가/취소·대기열·체크인·피드백 연동 |
| Beta 알림·미디어 | Resend 이메일, 동의 기반 Web Push, Supabase Storage 연동 |
| 운영자 `/beta/operator` | 허용 계정 및 TOTP MFA 기반 경기·참가자·운영 정책 관리 |

Google/Kakao OAuth와 서버 기반 참가·취소는 출시 Beta에서 진행합니다. 기존 프로토타입의 샘플 기록은 실제 Beta 계정으로 이전하지 않습니다.

**실제 결제(PG)와 외부 분석 도구는 연결되지 않았습니다.**

## 기술과 검증

- **기술:** JavaScript, Vercel AI Gateway, Supabase(Auth·Postgres·Realtime·Storage), Resend, Web Push
- **검증:** 회귀 테스트, Playwright 브라우저 E2E·시각 회귀, axe 접근성, 모바일 WebKit
- **릴리스:** 제품 식별자 `v6.0.0`. 코드 변경은 영향에 맞는 QA와 배포 검증을 거치며, 문서만 변경할 때는 경량 QA를 적용합니다.

## 자세한 문서

- [저장소 운영·브랜치 보호·남은 과제](docs/REPO-OPERATIONS.md) — 2026-10-22 GitHub/Vercel 검증 스냅샷
- [문서 전체 목록](docs/README.md) · [Release App 상세](docs/RELEASE-APP.md)
- [서비스 기획 근거](docs/SERVICE-PLANNING-EVIDENCE.md) · [사용자 검증 근거](docs/USER-TEST-EVIDENCE.md)
- [릴리스·QA 이력](docs/RELEASE-HISTORY.md) · [Closed Beta 운영](docs/BETA-PILOT-RUNBOOK.md)
