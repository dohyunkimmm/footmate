# FootMate

**풋살 매칭 플랫폼의 사업성 검토, 수익성 개선안 및 중장기 경영계획을 정리한 신사업 기획 프로젝트입니다.**

보조 구현 자료에서는 활동 지역·실력·포지션·시간으로 실제 후보를 정한 뒤 AI가 후보 안에서 추천 순서를 정합니다. 추천 이유와 잔여 자리는 실제 경기 정보로 표시하며, 참가·취소·체크인·피드백은 기존 서버와 연결합니다.

**사용자 여정:** `Find → Decide → Join → Play → Return`

보조 구현 화면의 이름은 **FootMate Demo**입니다. 로그인 후에도 Demo 표기를 유지하며, `/beta`는 기존 인증·연동 기능의 경로 이름으로 구분합니다.

## 2026-11-20 `main`·QA·브랜치 점검

- GitHub `main` [`720ffc4`](https://github.com/dohyunkimmm/footmate/commit/720ffc45948b0b2d8e95f658f65b4883e8af246a)의 파일 **280개·디렉터리 37개**, 루트 13개·최상위 8개를 확인했습니다. 새 [현황 문서](docs/REPOSITORY-STATUS-20261120.md)를 병합하면 **파일 281개·디렉터리 37개**입니다. 아래 2026-11-17 숫자는 당시 기준입니다.
- 원격 브랜치 **132개**(`main` 포함), 열린 PR **0건**. 일부 이전 브랜치는 독자적 패치가 있어 일괄 삭제하지 않습니다. 오래된 검토 브랜치는 **SHA 보존·최신 패치 감사·오프-GitHub 백업 확인** 없이 삭제하지 않습니다.
- 최신 [`main` QA #44263406614](https://github.com/dohyunkimmm/footmate/actions/runs/44263406614)는 회귀·브라우저·Cloudflare 배포·운영 스모크 **모두 성공**했습니다. 운영 보안 [이슈 #611](https://github.com/dohyunkimmm/footmate/issues/611)의 실서명 인증/MFA E2E는 별도 미검증입니다.
- [별도 FootMate 보고서 저장소](https://github.com/dohyunkimmm/footmate-case-study)의 `main`은 [`53d7e64`](https://github.com/dohyunkimmm/footmate-case-study/commit/53d7e64c24bc828caf8e6949aa877cd932fc5f7a)(파일 117개·디렉터리 15개)입니다. 보고서와 제품 소스는 중복 저장하지 않습니다.

## 화면 구성

| 경로 | 설명 |
| --- | --- |
| `/` | 서비스 데모(`/demo`)로 이동 |
| `/report` · `/case-study` | [별도 보고서 사이트](https://footmate-case-study.fmate.workers.dev/)로 이동 |
| `/demo` | 로그인 전 조건 선택·풋살 추천 미리보기. 인증 후 /beta 홈으로 이동 |
| `/beta` | 인증 후 추천·내 경기·MY. 실제 경기 우선, 없을 때 구분된 풋살 예시 경기 |
| `/prototype` | 보관된 로컬 프로토타입(참고용) |
| `/beta/operator` | 허용된 운영자만 접근하는 TOTP MFA 운영 화면 |

**포트폴리오 검토 포인트**

- **사업성 분석·경영계획:** 시장·경쟁, 사업모델·손익, IT 투자·운영 통제와 단계별 투자 판단을 **9개 섹션**으로 정리했습니다. **05번에 12개월 예상 ROI**(보수·기준·확장·관리비 반영), **09번에 최종 판단**을 배치했습니다. 본편 9장·5개년 전략 6장 외에 사업 전략 6장 자료는 별도 보고서 저장소에서 관리합니다. 신규 사업 가정과 구축·배포 근거를 구분합니다.
- **데이터 경계:** 실제 경기는 기존 서버 참가·정원을 사용합니다. 실제 모집이 없는 경우 표시가 붙은 풋살 예시 경기 24개를 제공하며 예시 참가·취소는 계정별 브라우저 기록으로 격리합니다.

**주요 링크:** [사업성 분석·경영계획](https://footmate-case-study.fmate.workers.dev/) · [발표자료 9장 미리보기](https://footmate-case-study.fmate.workers.dev/src/case-study/materials.html?preview=1) · [5개년 전략 6장 미리보기](https://footmate-case-study.fmate.workers.dev/src/case-study/materials.html?preview=1&deck=strategy) · [사업 전략 6장](https://footmate-case-study.fmate.workers.dev/src/case-study/strategy-brief.html) · [발표자료 PPT 다운로드](https://footmate-case-study.fmate.workers.dev/src/case-study/downloads/footmate_report.pptx) · [FootMate Demo](https://footmate.fmate.workers.dev/demo)

**경영기획 중심 산출물:** 월별 예산·가상 실적·CAPEX/OPEX·인력 비용·투자 판단을 검토합니다. 기존 AI 구현은 사업계획의 실행 가능성 근거로 구분해 제시합니다.

## 주요 경험

- **조건 선택·추천:** 기본 `/demo`에서는 로고 오프닝 이후 추천 카드와 빠른 필터를 한 화면에 표시합니다. 지역·실력·포지션·시간은 추천 화면에서 변경하며, 이전의 2단계 조건 설정을 기본 진입에서 강제하지 않습니다. 재방문에는 저장한 조건을 활용합니다.
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

## 기술 구성

- **기술:** JavaScript, Cloudflare Workers(배포·API), Vercel AI Gateway(AI 추론), Supabase(Auth·Postgres·Realtime·Storage), Resend, Web Push
- **릴리스:** 제품 식별자 `v6.0.0`. 상세 변경·검증 이력은 릴리스 문서에서 관리합니다.

## 저장소 파일·폴더 안내

**점검 기준(2026-11-17):** [#954 병합 후 `main` `bf01a25`](https://github.com/dohyunkimmm/footmate/commit/bf01a25ad098b55cd4922141e8a5823edc1d8293) 재귀 트리(`truncated=false`)에서 **파일 280개·디렉터리 37개**, 루트 파일 13개·최상위 폴더 8개를 확인했습니다. 아래 표는 확인된 **실제 구조**입니다. 11월 15일의 `279개 → 280개 반영 예정` 및 이전 수치는 [당시 기록](docs/REPO-AUDIT-TIMELINE.md)으로 보존합니다.

| 최상위 경로 | 현재 파일 수 | 역할 |
| --- | ---: | --- |
| `.github/` | 5 | CI·설정 |
| `api/` | 2 | AI/API |
| `docs/` | 35 | 현행 문서 목록·운영 근거·보존 이력 |
| `scripts/` | 11 | 빌드·검사 도구 |
| `src/` | 87 | 앱·Beta·플랫폼 코드 |
| `supabase/` | 36 | 함수·마이그레이션 |
| `tests/` | 89 | 계약·E2E·회귀 검사 |
| `worker/` | 2 | Worker 라우팅 |
| 루트 파일 | 13 | 진입점·설정·자산 |
| **합계** | **280** | **디렉터리 37개** |

**클렌징 결과:** 보고서 전용 `qa/`·`src/case-study/` 원본은 [footmate-case-study](https://github.com/dohyunkimmm/footmate-case-study)로 이관된 상태입니다. 실제 `main`에서 중복 Git blob은 적용 이력이 있는 SQL 마이그레이션 **2쌍**뿐이며, 루트 HTML·테스트 스냅샷·배포/QA 자산도 사용 또는 보존 근거가 있습니다. **추가 삭제 확정 0건**(브랜치/SQL/이력 미삭제)입니다.

**과거 PR 처리 현황(2026-11-15):** [PR #946](https://github.com/dohyunkimmm/footmate/pull/946)은 이후 `main`에 구현된 내용과 중복되어 미병합 종료했습니다. [PR #938](https://github.com/dohyunkimmm/footmate/pull/938)은 충돌하는 구형 구현을 병합하지 않고, 필요한 화면 전환만 최신 코드로 옮긴 [PR #951](https://github.com/dohyunkimmm/footmate/pull/951)을 **QA 성공 후 `main` `ca75408`에 병합**한 뒤 대체·미병합 종료했습니다. [PR #951 QA](https://github.com/dohyunkimmm/footmate/actions/runs/43658590778)는 Change Impact·Regression 36·Browser E2E + axe **SUCCESS**이며, 새 운영 배포·실계정 보안 검증 결과는 아닙니다. [보안 이슈 #611](https://github.com/dohyunkimmm/footmate/issues/611)은 운영 권한·Advisor를 읽기 전용 재점검했지만 **실서명 JWT·MFA E2E는 테스트 전용 인증 세션 부재로 미완료**입니다. 앞선 '열린 PR 2건'은 정리 전 기록입니다.

- **공개 진입 파일:** [프로토타입](app.html) · [Demo/Beta](beta.html) · [운영자](beta-operator.html) · [개인정보 안내](beta-data-notice.html). `/` 경로는 [Worker](worker/index.js)가 `/demo`로 연결합니다.
- **앱·서버·검증:** [제품 소스](src/) · [API](api/) · [Worker](worker/) · [Supabase](supabase/) · [테스트](tests/) · [도구](scripts/) · [자동화](.github/).
- **문서:** [현행 문서 안내](docs/README.md) · [과거 점검 이력](docs/REPO-AUDIT-TIMELINE.md) · [저장소 운영](docs/REPO-OPERATIONS.md) · [2026-11-11 정리 스냅샷](docs/REPO-CLEANUP-2026-11-11.md).

**2026-11-17 후속:** [Wrangler PR #954](https://github.com/dohyunkimmm/footmate/pull/954)와 [OIDC PR #955](https://github.com/dohyunkimmm/footmate/pull/955)는 각각 최신 기준 회귀·브라우저 QA 통과 후 `main`에 병합됐습니다([#954 QA](https://github.com/dohyunkimmm/footmate/actions/runs/43779402635) · [#955 QA](https://github.com/dohyunkimmm/footmate/actions/runs/44023302859)). 동일 파일 변경의 [중복 PR #956](https://github.com/dohyunkimmm/footmate/pull/956)은 미병합 종료했습니다. [실서명 MFA 이슈 #611](https://github.com/dohyunkimmm/footmate/issues/611)은 승인된 테스트 세션/증빙이 없어 미완료입니다. 보고서 문서 [PR #58](https://github.com/dohyunkimmm/footmate-case-study/pull/58)은 보고서 QA 성공 후 별도 저장소 `main`에 병합했습니다. 이번 목록 점검은 운영 DB·실계정 보안 검증을 새로 완료했다는 의미가 아닙니다.

## 자세한 문서

- [문서 전체 목록](docs/README.md) · [현재 풋살 매칭 방향](docs/MATCHING-DIRECTION.md)
- [사업성·경영계획 현행 문서 · 05번 ROI·09번 최종 판단](https://github.com/dohyunkimmm/footmate-case-study/blob/main/docs/IT-STRATEGY-CASE-STUDY.md) · [보고서 원본·QA 저장소](https://github.com/dohyunkimmm/footmate-case-study) · [이전 구성 목차 기록](docs/CASE-STUDY-ELEVEN-STAGES.md) · [기획 화면 근거(역사 기록)](docs/CASE-STUDY-SCREEN-EVIDENCE.md)
- [릴리스 이력](docs/RELEASE-HISTORY.md) · [Closed Beta 운영](docs/BETA-PILOT-RUNBOOK.md)
- [저장소 운영 기록](docs/REPO-OPERATIONS.md) — 2026-10-22~23 Vercel 당시 검증 스냅샷
- [이전 프로토타입 Release App 기록](docs/RELEASE-APP.md)


