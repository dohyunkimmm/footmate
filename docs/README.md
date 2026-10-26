# FootMate Documentation

현행 제품 안내는 저장소 루트 [README](../README.md), [매칭 방향](MATCHING-DIRECTION.md), 현재 `main` 코드와 검증 결과를 우선합니다. 이 목록은 **2026-10-26 문서 색인 점검** 결과이며, 별도의 실시간 운영 가용성 검증을 뜻하지 않습니다. 제품 버전 번호는 사용자 화면 이름이 아니라 릴리스·검증 이력에 사용합니다.

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

## 운영·릴리스 핵심 문서

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
