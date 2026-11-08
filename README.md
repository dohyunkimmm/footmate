# FootMate

**처음 조건을 선택하고 AI 추천 경기를 확인한 뒤, 참가할 때 로그인하는 풋살 앱입니다.**

활동 지역·실력·포지션·시간으로 실제 후보를 정한 뒤 AI가 후보 안에서 추천 순서를 정합니다. 추천 이유와 잔여 자리는 실제 경기 정보로 표시하며, 참가·취소·체크인·피드백은 기존 서버와 연결합니다.

**사용자 여정:** `Find → Decide → Join → Play → Return`

공개 화면 이름은 **FootMate Demo**입니다. 로그인 후에도 Demo 표기를 유지하며, `/beta`는 기존 인증·연동 기능의 경로 이름으로 구분합니다.

## 화면 구성

| 경로 | 설명 |
| --- | --- |
| `/` | 시장·사업성·IT 투자·운영 통제·성과관리를 검토하는 IT기획·전략기획 Case Study |
| `/demo` | 로그인 전 조건 선택·풋살 추천 미리보기. 인증 후 /beta 홈으로 이동 |
| `/beta` | 인증 후 추천·내 경기·MY. 실제 경기 우선, 없을 때 구분된 풋살 예시 경기 |
| `/prototype` | 보관된 로컬 프로토타입(참고용) |
| `/beta/operator` | 허용된 운영자만 접근하는 TOTP MFA 운영 화면 |

**포트폴리오 검토 포인트**

- **케이스 스터디:** 시장·경쟁, 사업모델·손익, IT 투자·운영 통제와 단계별 투자 판단을 **9개 섹션**으로 정리했습니다. **05번에 12개월 예상 ROI**(보수·기준·확장·관리비 반영), **09번에 최종 판단**을 배치했습니다. 신규 사업 가정과 구축·배포 근거를 구분합니다.
- **데이터 경계:** 실제 경기는 기존 서버 참가·정원을 사용합니다. 실제 모집이 없는 경우 표시가 붙은 풋살 예시 경기 24개를 제공하며 예시 참가·취소는 계정별 브라우저 기록으로 격리합니다.

**주요 링크:** [Case Study](https://footmate.fmate.workers.dev/) · [발표자료 10장 미리보기](https://footmate.fmate.workers.dev/src/case-study/materials.html?preview=1) · [발표자료 PPT 다운로드](https://footmate.fmate.workers.dev/src/case-study/downloads/footmate_report.pptx) · [FootMate Demo](https://footmate.fmate.workers.dev/demo)

**경영기획 중심 산출물:** 월별 예산·가상 실적·CAPEX/OPEX·인력 비용·투자 판단을 검토합니다. 기존 AI 구현·QA는 사업계획의 실행 가능성 근거로 유지합니다.

## 주요 경험

- **조건 선택·추천:** 첫 방문에는 ① 활동 지역 ② 실력·포지션·시간을 짧게 선택합니다. 데모에는 예시 경기가 준비되어 있으며, 재방문에는 저장한 조건의 추천 홈을 엽니다.
- **필터·다른 경기 추천:** 결과 화면에서 지역·실력·포지션·시간을 바로 바꿉니다. 추천 순서를 고려해 아직 보지 않은 후보를 무작위로 보여주며, 다시 뽑을 때는 AI를 재호출하지 않습니다. 마감 경기와 선택 포지션 잔여 0인 경기는 추천에서 제외하고 대기 신청은 별도 메뉴에 유지합니다.
- **로그인·참가:** 추천을 먼저 확인하고 참가 시 기존 Google/Kakao·이메일로 로그인합니다. 로그인 후 `/beta` 추천 홈과 추천·내 경기·MY 메뉴로 진입합니다. 선택 경기·포지션을 유지하며 로그인만으로 자동 참가하지 않습니다.
- **경기 당일·이후:** 실제 Beta의 참가 기록·체크인·피드백을 서버에 저장합니다. 데모 참가·취소는 현재 브라우저에만 기록합니다. 다음 추천에 피드백을 활용하는 개선은 추가 검증 과제입니다.

재방문 시 브라우저의 추천 순서와 기존 Beta 계정·서버 기록을 복구합니다. **실제 로그인 계정의 추천 조건은 Supabase에 사용자별로 동기화**하며 연결 실패 시 이 기기의 저장값을 사용합니다. 데모·게스트의 조건 및 예시 참가 기록은 브라우저에만 남습니다. 체험 선택·중복 시작 메뉴는 공개 앱에 두지 않습니다.

## AI 설계 원칙

`Context → Plan → Tools → Guardrail → Observe`

선택한 조건으로 실제 후보를 제한하고, 기존 Vercel AI Gateway에 최대 12개 후보를 보내 **추천 순서**를 받습니다. 알 수 없거나 중복된 경기 ID는 제거하며 **경기 사실·추천 이유는 실제 데이터와 규칙**으로 확인합니다. 선택 조건은 임의로 추가·완화하지 않습니다.

AI 모델 대체·시간 제한을 유지합니다. AI 실패 시 선택 조건의 기본 결과를 계속 사용할 수 있고, 참가 확정은 사용자가 직접 수행합니다. **로그인 계정의 추천 조건만** Supabase 사용자별 RLS 정책에 따라 기기 간 동기화합니다. 추천 순서·데모/게스트 조건은 브라우저에 보관하며, 이 기능을 AI 모델 학습이나 추천 반응·참가 기록 전체의 기기 간 동기화로 표현하지 않습니다.

## 구현 및 연동 범위

| 영역 | 현재 상태 |
| --- | --- |
| 선택형 AI 추천 | 실제 적격 후보 안에서 AI가 순서를 정하고, 사실·이유는 경기 데이터로 확인. 운영 검증 범위는 릴리스 이력 참조 |
| 제품 데모 `/demo` | 기존 카카오·구글·이메일 인증, 예시 경기·데모 참가/취소·재방문 복원 |
| 이전 프로토타입 `/prototype` | 샘플 데이터와 로컬 저장 기반 검증용 화면. 실제 계정·참가 기록과 구분 |
| Closed Beta `/beta` | Supabase 인증·경기·포지션별 정원·참가/취소·대기열·체크인·피드백, 로그인 계정의 추천 조건 서버 동기화(로컬 대체) |
| Beta 알림·미디어 | Resend 이메일, 동의 기반 Web Push, Supabase Storage 연동 |
| 운영자 `/beta/operator` | 허용 계정 및 TOTP MFA 기반 경기·참가자·운영 정책 관리 |

Google/Kakao OAuth는 기존 `/beta` 인증 복귀 경로를 사용합니다. 이메일·소셜 로그인 모두 `/beta` 홈으로 이어집니다. 실제 경기에는 기존 서버 참가·취소를 사용하며, 예시 경기는 어느 화면에서도 격리된 브라우저 기록만 변경하고 실제 경기·정원·대기·알림·이메일을 생성하지 않습니다.

**실제 결제(PG)와 외부 분석 도구는 연결되지 않았습니다.** 내부 탐색 통계는 별개로, 로그인한 사용자가 MY/설정에서 명시적으로 동의한 이후의 실제 경기 탐색 이벤트만 서버에 전송합니다. 데모·게스트·미동의 기록은 전송하지 않으며, 동의 해제와 삭제 확인 절차·측정 한계는 [Beta 측정 준비 기준](docs/BETA-MEASUREMENT-READINESS.md)을 따릅니다.

## 기술과 검증

- **기술:** JavaScript, Cloudflare Workers(배포·API), Vercel AI Gateway(AI 추론), Supabase(Auth·Postgres·Realtime·Storage), Resend, Web Push
- **검증:** 회귀 테스트, Playwright 브라우저 E2E·시각 회귀, axe 접근성, 모바일 WebKit
- **릴리스:** 제품 식별자 `v6.0.0`. 코드 변경은 영향에 맞는 QA와 배포 검증을 거치며, 문서만 변경할 때는 경량 QA를 적용합니다.

## 저장소 파일·폴더 안내

**`main` 구조 재점검(2026-11-06):** 기준 HEAD `070dabe`에서 파일 323개·디렉터리 41개(루트 파일 14개·최상위 폴더 9개)를 확인했습니다. [현행 문서 목록](docs/README.md)과 [2026-11-05 점검 당시 기록](docs/REPO-CLEANUP-2026-11-05.md)을 구분해 참조합니다.

- **공개 진입 파일:** [Case Study](index.html) · [이전 프로토타입](app.html) · [Demo/Beta](beta.html) · [운영자](beta-operator.html) · [개인정보 안내](beta-data-notice.html). 경로 별칭(`/demo`, `/beta`, `/prototype`)은 [Worker](worker/index.js)가 처리하므로 파일 이동 없이 보존합니다.
- **화면·원본 자료:** [앱·Beta·플랫폼·공용 코드](src/) · [Case Study 및 PPTX/XLSX 원본](src/case-study/). 화면 증빙·자동 생성 미리보기는 참조 관계를 확인하기 전 삭제하지 않습니다.
- **서버·데이터:** [API](api/) · [Worker](worker/) · [Supabase 함수/마이그레이션](supabase/). 적용 가능한 SQL 이력은 동일 내용이라도 보존합니다.
- **검증·도구:** [테스트](tests/) · [점검·빌드 스크립트](scripts/) · [시각 자료 작업 도구](qa/) · [GitHub 자동화](.github/).
- **문서:** [기획·운영·QA 현행 목록](docs/README.md) · [저장소 운영 및 미완료 확인](docs/REPO-OPERATIONS.md) · [2026-11-05 파일 점검 스냅샷](docs/REPO-CLEANUP-2026-11-05.md) · [2026-11-03 이전 점검](docs/REPO-CLEANUP-2026-11-03.md). 이전 문서의 파일 수·PR 상태는 당시 기준이며, 미완료 과제는 최신 이슈 상태를 우선합니다.

## 자세한 문서

- [문서 전체 목록](docs/README.md) · [현재 풋살 매칭 방향](docs/MATCHING-DIRECTION.md)
- [Case Study 현행 문서 · 05번 ROI·09번 최종 판단](docs/IT-STRATEGY-CASE-STUDY.md) · [9개 섹션 목차(이전 파일명 유지)](docs/CASE-STUDY-ELEVEN-STAGES.md) · [Case Study 화면 근거](docs/CASE-STUDY-SCREEN-EVIDENCE.md)
- [릴리스·QA 이력](docs/RELEASE-HISTORY.md) · [Closed Beta 운영](docs/BETA-PILOT-RUNBOOK.md)
- [저장소 운영 기록](docs/REPO-OPERATIONS.md) — 2026-10-22~23 Vercel 당시 검증 스냅샷
- [이전 프로토타입 Release App 기록](docs/RELEASE-APP.md)


