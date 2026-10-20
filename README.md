# FootMate

**내 수준에 맞는 풋살 경기를 찾고, 참가부터 경기 후까지 이어지는 경험을 설계한 서비스 기획 프로젝트입니다.**

자연어로 경기 조건을 입력하면 AI가 요청을 해석하고, 규칙 기반 추천 엔진이 경기 후보와 추천 이유를 제공합니다. 탐색부터 참가 결정, 경기 당일, 경기 후 피드백까지 하나의 흐름으로 연결합니다.

**사용자 여정:** `Find → Decide → Join → Play → Return`

## 화면 구성

| 경로 | 설명 |
| --- | --- |
| `/` | 문제 정의·설계·검증 근거를 소개하는 Case Study |
| `/demo` | **포트폴리오 제출용 Interactive Demo**: 샘플 경기로 실제 사용자 흐름을 조작하는 Home / 경기 찾기 / MY |
| `/beta` | **Closed Beta**: Supabase 서버 연동 기반 무료 참가 서비스 (실제 결제 없음) |
| `/beta/operator` | 허용된 운영자만 접근하는 TOTP MFA 운영 화면 |

**이번 제출 개선:** Case Study에 실제 모바일 QA 화면 캡처를 연결했고, Guided Mode에 추천·두 경기 비교·마감 포지션·MY 바로가기를 추가했습니다. 추천 카드의 선호 포지션 마감과 예시 이동시간은 실제 정원·경로 계산과 구분해 표시합니다. Interactive Demo의 공유 미리보기는 Case Study와 다른 제목·이미지를 사용합니다.

**제출 링크 2개:** [Case Study](https://footmate-black.vercel.app/) + [Interactive Demo](https://footmate-black.vercel.app/demo). 안내에 따라 체험하려면 [6단계 Guided Mode](https://footmate-black.vercel.app/demo?mode=guided)를 이용할 수 있습니다. `/demo?mode=evidence`는 구현·검증 근거 확인용입니다.

## 주요 경험

- **경기 탐색:** 자연어 검색, 조건 필터·정렬, 적합한 경기 추천과 이유 제공. AI 해석 레벨은 Discover에서 직접 정정할 수 있고, 결과가 없으면 시간·가격 등 조건을 단계적으로 완화
- **참가 결정:** 경기 상세 확인, 저장·비교, 로그인 후 무료 참가 확인
- **경기 당일:** 참가 일정 확인, 체크인과 변경·취소 상황 대응
- **경기 후:** 피드백을 다음 추천에 반영하고 새로운 경기 탐색으로 연결. 경기 후 평가가 완료된 샘플 경기는 다음 검색 결과에서 제외

**재방문 흐름:** `/demo`를 직접 열면 축구공 로고와 FootMate 이름이 있는 앱 시작 화면을 먼저 보여줍니다. 저장한 설정은 추천 이어보기, 참가 기록은 내 경기 이어보기로 연결하며 데이터는 유지합니다. 샘플 참가·평가는 브라우저에만 기록되고 다른 기기로 동기화되지 않습니다.

## AI 설계 원칙

`Context → Plan → Tools → Guardrail → Observe`

AI는 자연어 요청을 지역·레벨·포지션 등의 **검색 조건으로 해석**합니다. 실제 경기 목록·정렬·추천 이유는 **결정론적 추천 엔진**이 담당하며, AI 연결에 실패해도 규칙 기반 탐색으로 전환합니다. 참가 확정은 사용자가 직접 수행합니다.

**최근 검색 보정(2026-10-18):** 오전/오후 12시를 포함한 시간 표현, 복합 금액 조건, 지역·포지션 제외 표현을 AI 및 규칙 기반 대체 검색의 조건 해석에 반영했습니다. 후보·순위·추천 이유는 여전히 규칙 엔진이 결정합니다. [릴리스 이력](docs/RELEASE-HISTORY.md)의 #639 운영 URL 검증은 해당 PR 검증이며, 병합된 이후 `main`의 배포 상태까지 자동 보증하지는 않습니다.

## 구현 및 연동 범위

| 영역 | 현재 상태 |
| --- | --- |
| AI 검색 | Vercel AI Gateway 연결 및 운영 환경 검증; 추천 순위는 규칙 기반 엔진에서 결정 |
| Release App `/demo` | 샘플 경기 데이터와 브라우저 내 상태 저장을 사용하는 체험 환경. 실제 결제·경기 참가 확정은 연동되지 않음 |
| Closed Beta `/beta` | Supabase 인증·경기·포지션별 정원·참가/취소·대기열·체크인·피드백 연동 |
| Beta 알림·미디어 | Resend 이메일, 동의 기반 Web Push, Supabase Storage 연동 |
| 운영자 `/beta/operator` | 허용 계정 및 TOTP MFA 기반 경기·참가자·운영 정책 관리 |

`/demo`의 체험 로그인은 **아이디·비밀번호 입력 없이 브라우저에만 저장되는 샘플 체험**입니다. 실제 서비스 이용 안내를 펼치면 실제 서버 인증을 소유한 `/beta`로 이동할 수 있으며, Demo의 선택 경기·로컬 참가 기록을 Beta 계정에 이전하지 않습니다. 실제 Google/Kakao OAuth 로그인 및 실서버 참가·취소는 `/beta`에서만 진행합니다. **실제 결제(PG)와 외부 분석 도구는 미연동** 상태입니다.

## 기술과 검증

- **기술:** JavaScript, Vercel AI Gateway, Supabase(Auth·Postgres·Realtime·Storage), Resend, Web Push
- **검증:** 회귀 테스트, Playwright 브라우저 E2E·시각 회귀, axe 접근성, 모바일 WebKit
- **릴리스:** 제품 식별자 `v6.0.0`. 코드 변경은 영향에 맞는 QA와 배포 검증을 거치며, 문서만 변경할 때는 경량 QA를 적용합니다.

## 자세한 문서

- [문서 전체 목록](docs/README.md) · [Release App 상세](docs/RELEASE-APP.md)
- [서비스 기획 근거](docs/SERVICE-PLANNING-EVIDENCE.md) · [사용자 검증 근거](docs/USER-TEST-EVIDENCE.md)
- [릴리스·QA 이력](docs/RELEASE-HISTORY.md) · [Closed Beta 운영](docs/BETA-PILOT-RUNBOOK.md)
