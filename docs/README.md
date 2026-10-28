## 2026-10-28 · Git branch full-clone patch audit

- [BRANCH-PATCH-AUDIT-2026-10-28.md](BRANCH-PATCH-AUDIT-2026-10-28.md): 실제 `git cherry` 및 작업 트리 비교로 남은 120개 브랜치 검사 완료. 중복 패치 후보 8개(병합 PR 6, 미병합 종료 PR 2), 독립 패치 112개, 현재 main 동일 트리 0개. 추가 브랜치 삭제 없음. [감사 Actions](https://github.com/dohyunkimmm/footmate/actions/runs/40604043505) 및 제한 기간 TSV artifact 참조.

## 2026-10-28 · 최종 후속 검증과 잔여 승인 항목

- 현재 `main` `435585341a9aa748ccb96883b39589862cba0ea3`의 [FootMate QA #40610280350](https://github.com/dohyunkimmm/footmate/actions/runs/40610280350)은 **Regression 36, Browser E2E + axe SUCCESS**. 이번 워크플로 전용 변경은 런타임 무영향이므로 Deploy Cloudflare / Production Smoke가 skipped. 이전 프로덕션 스모크 성공 기록을 이 실행의 성과로 오인하지 않습니다.
- [Supabase 20 SECURITY DEFINER / 8 미사용 인덱스 개별 검토와 실제 API 응답](SUPABASE-SECURITY-ADVISOR-REVIEW-2026-10-28.md): `net`·`extensions` 스키마 REST 비노출(406/PGRST106), 읽기 전용 운영자 RPC 익명 요청 거부(401/42501). 이것은 확장 이동·RPC WARN 해결이나 실계정 JWT MFA/복구 E2E 완료를 뜻하지 않습니다. 실제 서명 JWT 실계정 QA 및 Pro 비용 결정을 [#611](https://github.com/dohyunkimmm/footmate/issues/611)에 미완료로 유지합니다.
- [Git 120개 브랜치 패치 감사 / 전체 참조 검증 백업 / 복원 및 삭제 효과 분석](BRANCH-PATCH-AUDIT-2026-10-28.md): [Actions #40610280210](https://github.com/dohyunkimmm/footmate/actions/runs/40610280210)의 ZIP 보관 만료는 **2026-11-04 UTC**. 별도 ChatGPT 파일 라이브러리 복사와 독립 복원·8개 tip SHA 검사를 완료했으나, **소유자 관리 영구 오프-GitHub 보관·외부 참조 검토·삭제 승인은 미완료**. 6개 병합 과거 후보를 가상 제거해도 대형 blob은 0개 해제되므로 크기 절감 명목의 브랜치 삭제는 권장하지 않습니다. [#525](https://github.com/dohyunkimmm/footmate/issues/525) 참고.
- 1회성 대형 백업을 위해 쓰인 `[one-time-bundle]` push 마커 자동 실행은 정리 대상이므로 CI 설정에서 제거하며, 이후에는 명시적 수동 `workflow_dispatch` 요청만 7일 임시 bundle을 만듭니다. 실운영 데이터/권한/인증/요금제/원격 Git ref 및 `main` 이력을 변경하지 않습니다.

# FootMate Documentation

현행 제품 안내는 저장소 루트 [README](../README.md), [매칭 방향](MATCHING-DIRECTION.md), 현재 `main` 코드와 검증 결과를 우선합니다. 이 목록은 **2026-10-27 문서 색인·구현 동기화 점검** 결과이며, 별도의 실시간 운영 가용성 검증을 뜻하지 않습니다. 제품 버전 번호는 사용자 화면 이름이 아니라 릴리스·검증 이력에 사용합니다.

## 저장소 폴더 안내 (`main` 기준)

| 경로 | 역할 |
| --- | --- |
| `src/app/`, `src/platform/`, `src/domain/`, `src/shared/` | 보관 중인 프로토타입·공유 도메인·플랫폼 코드 |
| `src/beta/` | 현재 공개 `/demo`·`/beta` 앱과 인증·서버 연동 |
| `src/case-study/` | 현재 11개 섹션 Case Study와 화면 근거 이미지 (`nine-sections`는 호환 파일명) |
| `api/`, `worker/` | AI/API 구현과 Cloudflare Workers 진입점 |
| `supabase/` | Edge Function·적용 이력이 있는 SQL 마이그레이션 (임의 삭제·이름 변경 금지) |
| `tests/`, `scripts/`, `.github/` | 계약·브라우저 QA, 빌드/검증 스크립트, CI 워크플로 |
| `docs/` | 현행 안내·운영 기록·과거 검증 근거 (아래 목록으로 상태 구분) |

실행 코드와 기존 링크·스냅샷·SQL 이력을 유지하기 위해 이번 정리는 폴더 이동이 아니라 문서 색인과 참조 정합성을 기준으로 합니다. 공개 Case Study에서 참조하는 원본 `docs/` 문서는 Cloudflare 정적 빌드에 포함되지 않으므로 GitHub의 `main/docs/` 원본 링크로 연결합니다.

## 현재 제품·운영 기준

- [루트 README](../README.md) — 제품 가치, `Find → Decide → Join → Play → Return`, 공개 화면·데이터·AI 책임 경계
- [MATCHING-DIRECTION.md](MATCHING-DIRECTION.md) — **현행 풋살 매칭 방향**: 활동 지역 → 실력·포지션·시간 → 추천 미리보기 → 참가 시 로그인 → `/beta`
- [Case Study `/`](https://footmate.fmate.workers.dev/) — 11개 섹션의 설명·근거. 현재 구현은 `src/case-study/nine-sections.{js,css}`이고, 파일명은 과거 호환 이름
- [FootMate Demo `/demo`](https://footmate.fmate.workers.dev/demo) — 로그인 전 풋살 조건 선택·예시 경기/추천 미리보기. 인증 후 `/beta`로 진입
- `/beta` — 인증 후 추천·내 경기·MY. 실제 서버 경기·참가를 우선하고, 실제 모집이 없을 때는 명시된 예시 경기/브라우저 기록과 분리
- `/beta/operator` — 허용된 운영자 전용 TOTP MFA 경로
- `/prototype` — 이전 로컬 프로토타입 보관용. Guided/Evidence 등 과거 실험 흐름은 현행 공개 앱 기준으로 사용하지 않음

## 2026-10-27 동기화 점검

- 이번 제품 코드 변경 점검 당시 확인한 `main`은 [`bf3aa123`](https://github.com/dohyunkimmm/footmate/commit/bf3aa1238589e70e1ab046256f273824aba8c980)입니다. [FootMate QA #40490413086](https://github.com/dohyunkimmm/footmate/actions/runs/40490413086)에서 Change Impact·Regression 36·Browser E2E + axe·Deploy Cloudflare·Production Smoke가 모두 성공했습니다. CI 결과는 실제 이용자 OAuth·통계 표본·외부 서비스 설정의 수동 검증을 뜻하지 않습니다.
- PR [#703](https://github.com/dohyunkimmm/footmate/pull/703)–[#709](https://github.com/dohyunkimmm/footmate/pull/709)의 날짜·시간 선택, 추천 갱신, 중복 없는 다시 추천, 동의형 탐색 계측, 추천 반응 및 필터 조작 후속 변경을 현재 코드와 비교했습니다. 기능·데이터 수집 범위는 [매칭 방향](MATCHING-DIRECTION.md) 및 [Beta 측정 기준](BETA-MEASUREMENT-READINESS.md)을 우선합니다. 실제 전환 성과는 미측정입니다.
- 후속 확인에서 [Vercel 프로젝트 영구 삭제 #685](https://github.com/dohyunkimmm/footmate/issues/685)는 Vercel 감사 이벤트와 삭제 후 API 조회로 검증한 뒤 **종료**했습니다. 현재 남은 두 이슈는 [Supabase 보안·RLS 검토 #611](https://github.com/dohyunkimmm/footmate/issues/611)과 [브랜치/이력 위생 #525](https://github.com/dohyunkimmm/footmate/issues/525)입니다. DB 권한 변경·브랜치 삭제·이력 강제 변경은 진행하지 않았습니다. 과거 운영 지침의 현재 해석은 [저장소 운영 기록](REPO-OPERATIONS.md) 상단을 참조합니다.
- 2026-10-27 후속 점검에서 비공개 Notion [AI 기능 확장 PRD](https://app.notion.com/p/3cf21460c9348184bfbad953b0a1b305), [Service Flow · Data Quality](https://app.notion.com/p/3cf21460c934815c89bed8f7ee337092), [AI Agent Workflow](https://app.notion.com/p/3cf21460c934815799a4fd44af094cee)를 직접 비교·수정·재조회했습니다. 현재 `/demo`와 과거 `/prototype`을 구분하고 날짜·시간 필터/추천 반응/동의형 탐색 계측 기준을 반영했습니다. 이 세 문서 외의 전체 Notion·외부 OAuth·실제 이용자 성과는 일괄 검증한 것이 아닙니다.

## 2026-10-27 보안·브랜치 후속 현행 상태

- [PR #713](https://github.com/dohyunkimmm/footmate/pull/713)과 [#714](https://github.com/dohyunkimmm/footmate/pull/714)에서 운영 RLS 정책 11개의 JWT InitPlan 최적화 및 실제 Supabase migration version `20261027122602` 동기화를 완료했습니다. 이후 `auth_rls_initplan` 경고 0건, Cloudflare Production Smoke [#40505456839](https://github.com/dohyunkimmm/footmate/actions/runs/40505456839) SUCCESS입니다. 위의 “DB 권한 변경 없음” 문장은 **당시 문서 동기화 시점**을 설명하며 현행 정책 변경 여부가 아닙니다.
- [Supabase Security Advisor 판정](SUPABASE-SECURITY-ADVISOR-2026-10-27.md): authenticated SECURITY DEFINER RPC 권한 경계 검증, 남은 `pg_net` 경고 및 Free 플랜으로 제한된 유출 비밀번호 보호 안내. 경고를 억지로 없애려고 사용자 RPC/알림 Cron을 깨는 변경은 하지 않습니다.
- [Git 브랜치 위생 감사](BRANCH-HYGIENE-2026-10-27.md): `ahead=0` 단일 후보 확인, 이력 차이가 있는 브랜치는 별도 patch-equivalence 감사로 보존. 브랜치 삭제나 `main` 이력 재작성은 완료되지 않았습니다.

## 2026-10-28 · 브랜치 실제 정리 현황

- [PR #718](https://github.com/dohyunkimmm/footmate/pull/718)로 [일회성 GitHub Actions](https://github.com/dohyunkimmm/footmate/actions/runs/40597913047) **SUCCESS** 후 `docs/compact-demo-release-654` 브랜치 1개 삭제를 API로 재확인했습니다. 안전 점검 증거는 [브랜치 위생 기록](BRANCH-HYGIENE-2026-10-27.md)에 반영했고, 남은 diverged 브랜치와 Git 용량 정리는 #525에서 계속합니다. pre-cleanup CSV는 당시 ref를 보존한 **기록**이지 실시간 브랜치 목록이 아닙니다.

## 2026-10-28 · 운영 안전성 후속

- Supabase [pg_net 권한·Cron 읽기 전용 감사](../tests/database/pgnet-boundary-readonly.sql): 실행 중인 알림 Cron 3개와 `postgres` 실행 계정 검증. 비이동 확장과 기본 grant의 위험 때문에 임의의 `REVOKE`/재설치를 실행하지 않았으며, 이후 **실제 REST Data API**에서 공개 anon JWT로 `public` 200 / `net`·`extensions` **406(PGRST106, 스키마 비노출)**을 확인했습니다. [2026-10-28 개별 검토](SUPABASE-SECURITY-ADVISOR-REVIEW-2026-10-28.md)를 우선합니다. 확장 설치 위치 경고는 여전히 잔존합니다.
- GitHub [전체 브랜치 tip-SHA 스냅샷](BRANCH-REFS-2026-10-28.csv): 총 122개 ref·보호 여부를 보존했습니다. Git 객체 자체 백업/브랜치 삭제는 아닙니다.

## 운영·릴리스 핵심 문서

- [SUPABASE-SECURITY-ADVISOR-2026-10-27.md](SUPABASE-SECURITY-ADVISOR-2026-10-27.md) — 남은 Auth·RPC·pg_net 보안 경고와 운영별 제약·검증 범위
- [BRANCH-HYGIENE-2026-10-27.md](BRANCH-HYGIENE-2026-10-27.md) — 121개 비기본 브랜치 전수 비교, 미삭제 안전 후보 및 용량 조사 한계
- [REPO-OPERATIONS.md](REPO-OPERATIONS.md) — **2026-10-22~23 당시** GitHub Ruleset·Vercel 배포·WAF·마이그레이션 보존 기록. **현행 Cloudflare 운영 상태의 최신 보고서가 아님**
- [RELEASE-HISTORY.md](RELEASE-HISTORY.md) — 날짜·PR·SHA별 구현·검증·배포 기록. 이전 Vercel/Render 및 이후 변경 기록을 각각의 시점 기준으로 해석
- [RELEASE-HISTORY-CORRECTIONS.md](RELEASE-HISTORY-CORRECTIONS.md) — 당시 기록을 보존하며 이후 바뀐 승인·해석 기준 구분
- [BETA-PILOT-RUNBOOK.md](BETA-PILOT-RUNBOOK.md) — 연결된 Beta 운영·알림 복구·QA 데이터 정리
- [BETA-MEASUREMENT-READINESS.md](BETA-MEASUREMENT-READINESS.md) — 실제 이용자 지표의 표본·코호트·측정 인정 기준
- [PRODUCT-UX-P0-P2.md](PRODUCT-UX-P0-P2.md) — 2026-10-10 P0–P2 개선·검증 기록. 과거 Demo IA의 현재 적용 여부는 루트 README와 최근 구현을 우선
- [RELEASE-APP.md](RELEASE-APP.md) — **이전 로컬 프로토타입 Release App v6의 구현·QA 이력**. 현재 `/demo` 내비게이션·인증 기준으로 오인하지 않음

현재 배포 워크플로는 [`.github/workflows/qa.yml`](../.github/workflows/qa.yml)의 **Deploy Cloudflare / Production Smoke**를 확인합니다. 문서 인덱스를 갱신했다는 이유만으로 운영 배포·실사용 성과를 새로 검증했다고 표기하지 않습니다.

## 2026-10-10 Release App 내부 Notion 동기화 이력

- [FootMate AI 기능 확장 PRD](https://app.notion.com/p/3cf21460c9348184bfbad953b0a1b305) — 당시 Release App P0–P2 수용 기준과 운영 검증 상태. 이전 배포 실패 기록은 당시의 이력으로 보존
- [FootMate Service Flow · Data Quality](https://app.notion.com/p/3cf21460c934815c89bed8f7ee337092) — 신규/재방문 분기, 상태·데이터 소유권, AI 조건 수정·제로결과 완화, MY/Return 일관성
- [FootMate 기능정의서 · AI Agent Workflow](https://app.notion.com/p/3cf21460c934815799a4fd44af094cee) — AI inference의 조건 소유권과 deterministic search 경계

위 3개 비공개 내부 문서는 PR #577 운영 반영 결과를 기준으로 2026-10-10 동기화했으며, GitHub의 [문서 동기화 PR #578](https://github.com/dohyunkimmm/footmate/pull/578)에서 변경 검증을 추적합니다. 이는 2026-10-10 당시 동기화 기록입니다. 이번 GitHub 문서 색인 정리는 비공개 Notion의 최신 내용을 재검증하거나 수정한 작업이 아닙니다. 릴리스 커밋·QA·배포 이력은 GitHub [RELEASE-HISTORY.md](RELEASE-HISTORY.md)를 기준으로 확인합니다.

## 현재 근거·품질 문서

- [SERVICE-PLANNING-EVIDENCE.md](SERVICE-PLANNING-EVIDENCE.md) — 역할·우선순위·설계 가정 및 KPI 8개 측정 설계·한계
- [USER-TEST-EVIDENCE.md](USER-TEST-EVIDENCE.md) — 교육생 6명·가입/탐색 과업 8회의 관찰 범위와 해석 한계
- [CASE-STUDY-ELEVEN-STAGES.md](CASE-STUDY-ELEVEN-STAGES.md) — 현행 11개 섹션 구성 및 E2E 기준
- [CASE-STUDY-SCREEN-EVIDENCE.md](CASE-STUDY-SCREEN-EVIDENCE.md) — 2026-10-25 Demo·Case Study 원본 캡처의 출처와 가독성 검증 범위
- [TYPOGRAPHY-QA-V2.md](TYPOGRAPHY-QA-V2.md) — 타이포그래피 QA 시나리오·증거 무결성·수동 검토 경계

## 과거 구성·개선 기록 (보존, 현재 승인 기준 아님)

- [CASE-STUDY-NINE-STAGES.md](CASE-STUDY-NINE-STAGES.md) — 과거 9단계 구성
- [CASE-STUDY-PORTFOLIO-P0-P2.md](CASE-STUDY-PORTFOLIO-P0-P2.md) — 과거 9단계 포트폴리오 개선 근거
- [CASE-STUDY-TYPOGRAPHY-QA.md](CASE-STUDY-TYPOGRAPHY-QA.md) — 과거 9단계 타이포그래피 검사
- [CASE-STUDY-VISUAL-QA.md](CASE-STUDY-VISUAL-QA.md) — 과거 9단계 이미지·시각 위계 검사
- [CASE-STUDY-COPY-QA-CORRECTIONS.md](CASE-STUDY-COPY-QA-CORRECTIONS.md) — 과거 13단계 문구 정정
- [CASE-STUDY-5.2-COMPOSITION.md](CASE-STUDY-5.2-COMPOSITION.md) — 과거 13단계 구성 기록

Case Study의 현행 구조와 캡처는 `CASE-STUDY-ELEVEN-STAGES.md`, `CASE-STUDY-SCREEN-EVIDENCE.md`, 최근 E2E와 `main` 상태를 우선합니다. 릴리스 이력과 이미 적용된 SQL 마이그레이션은 파일명이나 내용 유사성만으로 삭제·이동하지 않습니다.

## Impact-aware QA

GitHub Actions QA는 변경 영향에 맞게 실행한다.

- runtime/product 변경: `Regression 36` + `Browser E2E + axe`를 실행하고, `main` push에서 필요한 `Production Smoke`까지 수행한다.
- UI/UX/layout 변경: 승인된 픽셀 기준을 보유한 Product 화면은 Playwright `toHaveScreenshot()`으로 실제 화면과 비교하고, baseline 생성만으로 PASS 처리하지 않는다. 현재 11개 섹션 Case Study는 전용 E2E·geometry·axe와 캡처 수동 검토로 검증하며, 캡처만으로 픽셀 baseline 통과를 주장하지 않는다.
- docs-only 변경: `README.md`·`docs/` 등의 변경은 `Change Impact`에서 non-runtime으로 분류되며, `Docs-only QA`가 `git diff --check`, connected-platform·release-app 문서 계약을 실행한다. 이때 Regression/Browser E2E/Production Smoke는 skip한다.
- workflow-only 변경: `.github/workflows/qa.yml`은 현행 `classify-cloudflare-impact.cjs`에서 runtime 영향으로 분류된다. 회귀·브라우저 검사를 실행하고, 새 Cloudflare 배포 없이 기존 운영 대상 `Production Smoke`를 실행할 수 있다. 따라서 문서 전용과 동일한 경량 QA라고 표현하지 않는다.
- `queued` / `in_progress`는 실패나 stuck을 의미하지 않으며, 실제 failure/cancel/timeout 또는 progress 정지 근거가 있을 때만 이상 상태로 판단한다.

## Final sync-up rule

중요 runtime 변경이나 Production 수동 QA가 최종 확정된 뒤에는 아래 순서로 durable 상태를 닫는다.

`최종 runtime/수동 QA 확정 → README → Release History/Correction → Runbook(절차 변경 시) → Notion 관련 페이지(장기 제품 사실이 바뀐 경우) → Case Study 설명·대표 화면 점검(material change인 경우) → 서로 상충하는 pending/미검증 문구 검색 → QA/merge`

완료 사실이 새로 확정되면 과거 문서의 `별도 확인 대상`, `미검증`, `pending` 같은 표현과 충돌하지 않는지 반드시 다시 검색한다. 제품/배포 사실과 절차 문서가 모두 일치하기 전에는 최종 sync-up 완료로 표현하지 않는다. 과거 Release History 자체를 보존해야 하는 경우에는 `RELEASE-HISTORY-CORRECTIONS.md`에 supersession을 명시해 현재 해석을 분리한다.

Case Study는 Product package release와 version-coupling하지 않는다. FootMate의 작은 visual polish, spacing, density, copy, screenshot baseline 변화만으로는 Case Study sync 사유로 보지 않는다. FootMate의 설명·기능 구조·핵심 flow·성과 근거·대표 화면이 materially 달라지면 Case Study sync 필요 여부를 점검한다. 사용자가 Case Study 수정을 명시적으로 요청한 경우에는 현재 11개 섹션 원본(`src/case-study/nine-sections.js`, `nine-sections.css`)을 수정하고, 변경된 `/` 화면의 동작·접근성·모바일 표시를 검증한다. 과거 13단계 생성 번들과 빌드 검사 의존성은 제거하며, 현재 11개 섹션의 진입점·버전 검사 및 E2E를 유지한다.

제품 사실을 업데이트할 때는 사용자-facing 현재 상태와 release engineering 기록을 분리합니다. 일시적인 quota, pending, canceled 같은 운영 상태는 durable 문서에 누적하지 않습니다. QA 파일도 현재 gate에서 사용하는 suite와 필요한 compatibility regression만 유지하고, 과거 release marker에 고정된 snapshot은 current parity를 이관한 뒤 제거합니다.
