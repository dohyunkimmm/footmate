# FootMate Documentation

## 현재 기준 · 2026-11-15

- 점검 기준: [`main` `349a9fa`](https://github.com/dohyunkimmm/footmate/commit/349a9fab33f9c117c5a7aca5ac81e91b58a9db9d)의 재귀 트리(`truncated=false`) **파일 279개·디렉터리 37개**. 루트 파일 13개·최상위 폴더 8개입니다. 이 문서 정리로 이력 파일 1개를 추가하므로 **변경 반영 시 파일 280개(`docs/` 35개) 예상**입니다. [루트 목록](../README.md#저장소-파일폴더-안내)을 참조하세요.
- **2026-11-15 후속 최종:** [PR #946](https://github.com/dohyunkimmm/footmate/pull/946)은 반영된 기능과 중복되어 미병합 종료, [PR #938](https://github.com/dohyunkimmm/footmate/pull/938)은 충돌하는 구형 diff를 재사용하지 않고 [후속 PR #951](https://github.com/dohyunkimmm/footmate/pull/951)로 대체·종료했습니다. #951은 [전체 QA SUCCESS](https://github.com/dohyunkimmm/footmate/actions/runs/43658590778) 후 `main` [`ca75408`](https://github.com/dohyunkimmm/footmate/commit/ca754081f26b047cf4afb17dab63c5eed2289e64)에 병합됐습니다. 이전 '열린 PR 2건'은 정리 전 스냅샷입니다. [이슈 #611](https://github.com/dohyunkimmm/footmate/issues/611)은 실서명 JWT·운영자 MFA 검증 증빙이 없어 OPEN 유지합니다.
- 점검 기준 `main`의 [FootMate QA #43650979599](https://github.com/dohyunkimmm/footmate/actions/runs/43650979599)는 **SUCCESS**입니다. 이번 문서 변경의 CI·운영 배포·DB 검증을 대신하지 않습니다.
- `qa/`·`src/case-study/`와 보고서 원본은 [footmate-case-study](https://github.com/dohyunkimmm/footmate-case-study)로 분리된 상태입니다. SQL 적용 이력 2쌍·브라우저 스냅샷·호환 진입점은 삭제 근거가 없어 보존했습니다. **이번 정리에서 파일·폴더 삭제 0건**, 원격 브랜치 변경 0건입니다.
- 기존 날짜별 감사·이슈·외부 문서 동기화 기록은 [저장소 점검 이력](REPO-AUDIT-TIMELINE.md)으로 분리했습니다. 과거 숫자는 현재 수치로 해석하지 않습니다.


현행 제품 안내는 저장소 루트 [README](../README.md), [매칭 방향](MATCHING-DIRECTION.md), 현재 `main` 코드와 검증 결과를 우선합니다. 아래 문서들은 용도·시점을 구분해 탐색하세요.

## 저장소 폴더 안내 (`main` 기준)

| 경로 | 역할 |
| --- | --- |
| `src/app/`, `src/platform/`, `src/domain/`, `src/shared/` | 보관 중인 프로토타입·공유 도메인·플랫폼 코드 |
| `src/beta/` | 현재 공개 `/demo`·`/beta` 앱과 인증·서버 연동 |
| 보고서 전용 소스(별도 저장소) | 현행 HTML·JS·CSS·증빙·PPTX·XLSX는 [footmate-case-study](https://github.com/dohyunkimmm/footmate-case-study)에서 관리. 이 저장소에 `src/case-study/`는 없음 |
| `api/`, `worker/` | AI/API 구현과 Cloudflare Workers 진입점 |
| `supabase/` | Edge Function·적용 이력이 있는 SQL 마이그레이션 (임의 삭제·이름 변경 금지) |
| `tests/`, `scripts/`, `.github/` | 계약·브라우저 QA, 빌드/검증 스크립트, CI 워크플로 |
| 보고서 전용 QA(별도 저장소) | 발표자료·차트·시각 QA는 [footmate-case-study/qa](https://github.com/dohyunkimmm/footmate-case-study/tree/main/qa)로 이전. 이 저장소에 `qa/`는 없음 |
| `docs/` | 현행 안내·운영 기록·과거 검증 근거 (아래 목록으로 상태 구분) |

실행 코드와 기존 링크·스냅샷·SQL 이력을 유지하기 위해 추가 파일을 임의 삭제하지 않습니다. 위 보고서 전용 경로는 별도 저장소로 분리된 현재 위치이며, 이 저장소의 과거 `docs/` 기록을 현행 보고서 소스로 취급하지 않습니다.

## 현재 제품·운영 기준

- [루트 README](../README.md) — 제품 가치, `Find → Decide → Join → Play → Return`, 공개 화면·데이터·AI 책임 경계
- [MATCHING-DIRECTION.md](MATCHING-DIRECTION.md) — **현행 풋살 매칭 방향**: 활동 지역 → 실력·포지션·시간 → 추천 미리보기 → 참가 시 로그인 → `/beta`
- [Case Study `/`](https://footmate-case-study.fmate.workers.dev/) — IT기획·전략기획 9개 섹션. 현행 구현은 [별도 저장소의 `src/case-study/`](https://github.com/dohyunkimmm/footmate-case-study/tree/main/src/case-study)에서 관리
- [FootMate Demo `/demo`](https://footmate.fmate.workers.dev/demo) — 로그인 전 풋살 조건 선택·예시 경기/추천 미리보기. 인증 후 `/beta`로 진입
- `/beta` — 인증 후 추천·내 경기·MY. 실제 서버 경기·참가를 우선하고, 실제 모집이 없을 때는 명시된 예시 경기/브라우저 기록과 분리
- `/beta/operator` — 허용된 운영자 전용 TOTP MFA 경로
- `/prototype` — 이전 로컬 프로토타입 보관용. Guided/Evidence 등 과거 실험 흐름은 현행 공개 앱 기준으로 사용하지 않음

## 지난 점검·외부 문서 동기화 이력

2026-10-27~28의 보안·브랜치·Notion 관련 기록 및 그 이전 정리 로그는 [보존 이력](REPO-AUDIT-TIMELINE.md)에 있습니다. 현재 운영 판단은 이 문서 상단의 기준과 [저장소 운영 기록](REPO-OPERATIONS.md)을 우선합니다.

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

## 현재 근거·품질 문서

- [SERVICE-PLANNING-EVIDENCE.md](SERVICE-PLANNING-EVIDENCE.md) — 역할·우선순위·설계 가정 및 KPI 8개 측정 설계·한계
- [USER-TEST-EVIDENCE.md](USER-TEST-EVIDENCE.md) — 교육생 6명·가입/탐색 과업 8회의 관찰 범위와 해석 한계
- [CASE-STUDY-ELEVEN-STAGES.md](CASE-STUDY-ELEVEN-STAGES.md) — 이전 파일명을 유지한 9개 섹션 목차 기록. 현재 보고서 원본과 QA는 [별도 저장소](https://github.com/dohyunkimmm/footmate-case-study) 기준
- [CASE-STUDY-SCREEN-EVIDENCE.md](CASE-STUDY-SCREEN-EVIDENCE.md) — 2026-10-25 Demo·Case Study 원본 캡처의 출처와 가독성 검증 범위
- [TYPOGRAPHY-QA-V2.md](TYPOGRAPHY-QA-V2.md) — 타이포그래피 QA 시나리오·증거 무결성·수동 검토 경계

## 과거 구성·개선 기록 (보존, 현재 승인 기준 아님)

- [CASE-STUDY-NINE-STAGES.md](CASE-STUDY-NINE-STAGES.md) — 과거 9단계 구성
- [CASE-STUDY-PORTFOLIO-P0-P2.md](CASE-STUDY-PORTFOLIO-P0-P2.md) — 과거 9단계 포트폴리오 개선 근거
- [CASE-STUDY-TYPOGRAPHY-QA.md](CASE-STUDY-TYPOGRAPHY-QA.md) — 과거 9단계 타이포그래피 검사
- [CASE-STUDY-VISUAL-QA.md](CASE-STUDY-VISUAL-QA.md) — 과거 9단계 이미지·시각 위계 검사
- [CASE-STUDY-COPY-QA-CORRECTIONS.md](CASE-STUDY-COPY-QA-CORRECTIONS.md) — 과거 13단계 문구 정정
- [CASE-STUDY-5.2-COMPOSITION.md](CASE-STUDY-5.2-COMPOSITION.md) — 과거 13단계 구성 기록

Case Study의 현행 구조와 캡처는 [별도 보고서 저장소](https://github.com/dohyunkimmm/footmate-case-study)의 구현·검증 자료를 우선합니다. 이 저장소의 `CASE-STUDY-ELEVEN-STAGES.md`와 `CASE-STUDY-SCREEN-EVIDENCE.md`는 작성 당시 근거 기록입니다. 이미 적용된 SQL 마이그레이션 및 릴리스 이력은 이름·내용 유사성만으로 삭제하거나 이동하지 않습니다.

## Impact-aware QA

GitHub Actions QA는 변경 영향에 맞게 실행한다.

- runtime/product 변경: `Regression 36` + `Browser E2E + axe`를 실행하고, `main` push에서 필요한 `Production Smoke`까지 수행한다.
- UI/UX/layout 변경: 제품 화면은 기존 Playwright 시각 회귀·E2E·접근성 검증 기준을 따릅니다. Case Study 전용 E2E·시각 QA는 [보고서 저장소의 워크플로](https://github.com/dohyunkimmm/footmate-case-study/blob/main/.github/workflows/report-qa.yml)에서 별도 관리합니다. 보고서 QA를 제품 저장소에서 실행한다고 기록하지 않습니다.
- docs-only 변경: `README.md`·`docs/` 등의 변경은 `Change Impact`에서 non-runtime으로 분류되며, `Docs-only QA`가 `git diff --check`, README·문서의 저장소 내 링크 검사, connected-platform·release-app 문서 계약을 실행한다. 이때 Regression/Browser E2E/Production Smoke는 skip한다.
- workflow-only 변경: `.github/workflows/qa.yml`은 현행 `classify-cloudflare-impact.cjs`에서 runtime 영향으로 분류된다. 회귀·브라우저 검사를 실행하고, 새 Cloudflare 배포 없이 기존 운영 대상 `Production Smoke`를 실행할 수 있다. 따라서 문서 전용과 동일한 경량 QA라고 표현하지 않는다.
- `queued` / `in_progress`는 실패나 stuck을 의미하지 않으며, 실제 failure/cancel/timeout 또는 progress 정지 근거가 있을 때만 이상 상태로 판단한다.

## Final sync-up rule

중요 runtime 변경이나 Production 수동 QA가 최종 확정된 뒤에는 아래 순서로 durable 상태를 닫는다.

`최종 runtime/수동 QA 확정 → README → Release History/Correction → Runbook(절차 변경 시) → Notion 관련 페이지(장기 제품 사실이 바뀐 경우) → Case Study 설명·대표 화면 점검(material change인 경우) → 서로 상충하는 pending/미검증 문구 검색 → QA/merge`

완료 사실이 새로 확정되면 과거 문서의 `별도 확인 대상`, `미검증`, `pending` 같은 표현과 충돌하지 않는지 반드시 다시 검색한다. 제품/배포 사실과 절차 문서가 모두 일치하기 전에는 최종 sync-up 완료로 표현하지 않는다. 과거 Release History 자체를 보존해야 하는 경우에는 `RELEASE-HISTORY-CORRECTIONS.md`에 supersession을 명시해 현재 해석을 분리한다.

Case Study는 Product package release와 버전을 묶지 않습니다. 작은 시각적 수정만으로 보고서 동기화를 요구하지 않습니다. 제품의 핵심 기능·사용자 흐름·대표 화면·근거가 실제로 바뀌었을 때 [footmate-case-study](https://github.com/dohyunkimmm/footmate-case-study)의 해당 원본과 전용 QA를 별도 검토합니다. 이 저장소의 과거 `src/case-study/`와 13단계 생성 번들을 현행 수정 대상으로 보지 않습니다.

제품 사실을 업데이트할 때는 사용자-facing 현재 상태와 release engineering 기록을 분리합니다. 일시적인 quota, pending, canceled 같은 운영 상태는 durable 문서에 누적하지 않습니다. QA 파일도 현재 gate에서 사용하는 suite와 필요한 compatibility regression만 유지하고, 과거 release marker에 고정된 snapshot은 current parity를 이관한 뒤 제거합니다.

