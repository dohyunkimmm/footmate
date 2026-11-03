# FootMate 저장소 클렌징 점검 — 2026-11-03

> **기준:** `main` 커밋 `659a762283bb3f92afda1853bbe9c53b6bdd5fa1` (2026-11-03 11:09 KST). 작업 브랜치 생성 이전의 원격 상태를 기록합니다. 로컬 미커밋 파일, 외부 서비스 데이터, 인증 세션 및 실제 DB 마이그레이션 적용 여부를 이번 점검에서 새로 검사한 것은 아닙니다.

## 메인 경로와 파일·폴더

| 위치 | 역할 |
| --- | --- |
| [`index.html`](../index.html) | 공개 IT·전략기획 Case Study 9개 섹션 |
| [`app.html`](../app.html) · [`beta.html`](../beta.html) · [`beta-operator.html`](../beta-operator.html) | 데모·Beta·운영자 진입 화면 |
| [`src/app/`](../src/app/) · [`src/beta/`](../src/beta/) · [`src/platform/`](../src/platform/) | 프런트엔드 제품, Beta, 플랫폼 구현 |
| [`src/case-study/`](../src/case-study/) | 보고서·자료실·원본 PPTX/XLSX·증빙 이미지·미리보기 스크립트 |
| [`api/`](../api/) · [`worker/`](../worker/) | AI 추천 연동과 Worker 요청 라우팅 |
| [`supabase/`](../supabase/) | 배포/운영에 연결된 함수와 **적용 이력을 보존해야 하는** SQL 마이그레이션 |
| [`scripts/`](../scripts/) · [`tests/`](../tests/) · [`.github/workflows/`](../.github/workflows/) | 빌드·계약/회귀·브라우저 QA·Git 읽기 전용 감사 |
| [`docs/`](./) | 전략·출시·운영·보안 및 과거 감사 기록 |

GitHub `main` 재귀 트리에서 **309개 파일·40개 디렉터리**를 확인했습니다. 메인 HTML(`index.html`, `app.html`, `beta.html`, `beta-operator.html`)과 Case Study 자료/이전 URL 호환 페이지의 정적 `src`·`href`를 대조한 범위에서 **없는 내부 정적 파일을 발견하지 않았습니다**. 동적 요청·외부 URL의 실시간 접근성을 전수 검증했다는 뜻은 아닙니다.

## 중복·보존 기준

- 동일 Git blob SHA를 공유하는 파일은 아래 **SQL 마이그레이션 2쌍**입니다.
  - `supabase/migrations/20260922012426_beta_push_media.sql` ↔ `20260922013306_beta_push_media.sql`
  - `supabase/migrations/20260922012607_beta_push_worker_schedule.sql` ↔ `20260922013447_beta_push_worker_schedule.sql`
- 코드/설정상 중복 파일처럼 보여도 **이미 적용된 migration 이력은 변경·삭제·재적용하지 않습니다**. 과거 [운영 검토](REPO-OPERATIONS.md)의 보존 결정에 따릅니다.
- `src/case-study/report-previews.js`(약 1.03 MB), 현행 발표자료, `src/case-study/evidence/` 스크린샷, Playwright 스냅샷은 뷰어/검증 증빙입니다. 크기만으로 삭제하지 않습니다.
- `CASE-STUDY-ELEVEN-STAGES.md`는 현행 **9개 섹션을 설명하는 과거 호환 파일명**이므로 임의로 개명하지 않습니다.

## 원격 브랜치·미반영 항목

- 점검 시작 시 원격 브랜치 **124개**(`main` 1개, 기타 123개). `main`은 보호 설정이 활성화되어 있습니다.
- [2026-11-02 읽기 전용 전수 감사](https://github.com/dohyunkimmm/footmate/actions/runs/41475080654)는 **123개 비-main 브랜치**를 검사하여 조상에 완전히 포함된 브랜치 0개, 패치 동등성 검토 후보 8개, 독립 패치 115개, main과 동일한 전체 트리 0개를 기록했습니다. **패치 동등성만으로 원본 HEAD가 불필요하다고 단정하지 않습니다.**
- 후보 8개의 과거 PR 분류와 원본 SHA는 [브랜치 패치 감사](BRANCH-PATCH-AUDIT-2026-10-28.md) 참조. 이 중 2개는 과거 미병합 종료 PR과 연결됩니다. 기존 보관 이력과 외부 참조·복구 검증 없이 브랜치를 일괄 삭제하지 않습니다.
- [Issue #525](https://github.com/dohyunkimmm/footmate/issues/525)의 **소유자 관리 오프-GitHub 영구 백업, 외부 참조 확인 및 명시적 삭제 승인**은 완료가 확인되지 않았습니다. 따라서 이번 작업에서는 Git ref 삭제, force push, history rewrite 또는 Git 객체 회수를 수행하지 않습니다.
- 열린 PR: [#799 Wrangler 4.156.0](https://github.com/dohyunkimmm/footmate/pull/799) (기존 PR head에서 FootMate QA 성공, 배포/운영 Smoke 생략), [#800 @vercel/oidc 4.0.5](https://github.com/dohyunkimmm/footmate/pull/800) (기존 PR head에서 Browser E2E 실패). 두 PR 모두 감사 기준 `main`보다 15개 커밋 뒤처져 있어 해당 기록을 최신 `main` 통합 검증으로 취급하지 않습니다. 재기반·검사 후 별도 판단하며 일괄 병합하거나 종료하지 않습니다.
- 열린 일반 이슈 [#525 Git 이력/브랜치](https://github.com/dohyunkimmm/footmate/issues/525), [#611 Beta 보안 검증](https://github.com/dohyunkimmm/footmate/issues/611)은 실제 미완료 조건이 있으므로 유지합니다.

## 검증 및 이번 작업 범위

- 기준 `main`의 [FootMate QA #41564352694](https://github.com/dohyunkimmm/footmate/actions/runs/41564352694) 전체 워크플로 결과는 **success**였습니다. 개별 배포·운영 실계정 시나리오까지 통과했다고 해석하지 않습니다.
- `README.md`와 `docs/README.md`에 현행 파일·폴더 안내/이 점검 기록으로 이동하는 링크만 정리합니다.
- 런타임 HTML·JS·CSS, PPTX·XLSX, Worker, Supabase DB/함수, 의존성 버전, 브랜치 참조·태그·배포 설정은 변경하지 않습니다.
- 이 문서의 브랜치 수와 PR/QA 상태는 **점검 시점의 스냅샷**이며, 별도 PR 병합 및 작업 브랜치 생성 후 바뀔 수 있습니다.
