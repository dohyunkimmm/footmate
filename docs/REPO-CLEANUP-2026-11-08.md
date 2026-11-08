# FootMate `main` 파일·폴더 점검 및 문서 동기화 — 2026-11-08

> **조회 기준:** [`main` 커밋 `dcc98b0`](https://github.com/dohyunkimmm/footmate/commit/dcc98b0af61474265c13fad8492fa1aa6d836d8e)의 GitHub 재귀 트리(`truncated=false`). 아래 숫자는 **이번 문서 PR 생성 전** 관측한 스냅샷입니다. 로컬 작업 디렉터리, 서비스 데이터, 원격 브랜치별 전체 코드 비교를 대신하지 않습니다.

## 1. 미반영·자동 검사·이슈

| 확인 항목 | 점검 시점 결과 |
| --- | --- |
| `main` HEAD | `dcc98b0af61474265c13fad8492fa1aa6d836d8e` |
| 열린 PR | **0건** (이 점검용 문서 PR 생성 전) |
| 열린 이슈 | **1건**, [#611 무료 환경 실계정 보안 검증](https://github.com/dohyunkimmm/footmate/issues/611) |
| 브랜치 | **125개**(보호된 `main` 포함, 새 점검 브랜치 생성 전); 브랜치가 있다는 사실만으로 코드 미반영 여부를 판정할 수 없음 |
| 최신 `main` QA | [FootMate QA #42482120022](https://github.com/dohyunkimmm/footmate/actions/runs/42482120022): Change Impact·Case Study QA·Cloudflare 배포·Case Study Production Smoke **성공**. Docs-only·Regression 36·Browser E2E는 **생략** |
| 최신 PPT 검증 | [PPT preview #42482119997](https://github.com/dohyunkimmm/footmate/actions/runs/42482119997) **성공** |

최근 [PR #886](https://github.com/dohyunkimmm/footmate/pull/886)는 `dcc98b0`으로 **병합**됐습니다. 따라서 '열린 PR 없음'은 최근 수정의 누락을 뜻하지 않습니다. 과거 미병합 종료 PR 또는 의도적으로 되돌린 변경을 현재 기능으로 소급하지 않습니다. 개별 브랜치의 고유 패치·외부 참조 전수 재검증은 이번 조회 범위가 아니므로, **브랜치 단위 반영 완료를 주장하지 않습니다**.

## 2. `main` 파일·폴더 재귀 목록

- **339개 파일, 43개 디렉터리**, 총 382개 트리 항목. 루트는 **14개 파일, 9개 디렉터리**.
- 최상위 폴더와 그 아래 파일 수(재귀 포함): `.github/` 7, `api/` 2, `docs/` 32, `qa/` 8, `scripts/` 12, `src/` 138, `supabase/` 35, `tests/` 89, `worker/` 2. 루트 파일 14개.
- 공개 진입점은 `index.html`, `app.html`, `beta.html`, `beta-operator.html`, `beta-data-notice.html`. `worker/`의 경로 별칭을 고려하지 않고 같은 페이지의 중복 파일로 제거하지 않습니다.
- `.gitignore`는 `node_modules/`, `dist/`, 테스트 출력·환경 파일·임시 파일 등을 제외합니다. 이 트리의 파일명에서 `.bak`, `.old`, `.tmp`, `.log`, `.zip`으로 끝나는 명백한 임시 산출물은 확인되지 않았습니다. 개별 파일의 미사용 여부를 전수 입증한 결과는 아닙니다.

## 3. 중복·보존 판단

정확히 같은 Git blob SHA는 **Supabase SQL 마이그레이션 2쌍**입니다.

1. `supabase/migrations/20260922012426_beta_push_media.sql` ↔ `supabase/migrations/20260922013306_beta_push_media.sql`
2. `supabase/migrations/20260922012607_beta_push_worker_schedule.sql` ↔ `supabase/migrations/20260922013447_beta_push_worker_schedule.sql`

마이그레이션의 적용 이력과 의존성을 깨지 않도록 삭제·합치기·이름 변경을 하지 않습니다. `tests/e2e/` 시각 스냅샷, `src/case-study/evidence/` 증빙, `report-previews.js`, 원본 PPTX/XLSX, 과거 파일명의 9개 섹션 문서 `docs/CASE-STUDY-ELEVEN-STAGES.md`도 보존합니다. 삭제 가능한 미사용 파일이 **증명된 것은 없습니다**.

## 4. 본문·발표자료·문서 반영 사항

- 현재 공개 Case Study는 **9개 본문 섹션**입니다. 발표자료는 **사업·IT 기획 9장 + 5개년 전략 6장**입니다. [#876](https://github.com/dohyunkimmm/footmate/pull/876)에서 Rolling Forecast 관련 내용을 제거하면서 본편 10장을 9장으로 변경했고, [#874](https://github.com/dohyunkimmm/footmate/pull/874)의 전략 6장 미리보기를 별도로 유지합니다.
- [#878](https://github.com/dohyunkimmm/footmate/pull/878)은 본문·본편 PPT·전략 PPT 교차검증을 QA에 연결했고, [#880](https://github.com/dohyunkimmm/footmate/pull/880)은 미리보기를 슬라이드 썸네일 목록으로 변경했습니다.
- [#881](https://github.com/dohyunkimmm/footmate/pull/881)은 **공개 Excel 다운로드 버튼만 제거**했고, 계산용 XLSX 원본과 내부 검사는 유지했습니다. [#884](https://github.com/dohyunkimmm/footmate/pull/884)의 글꼴 점검과 [#886](https://github.com/dohyunkimmm/footmate/pull/886)의 중복 문구 정리도 `main`에 병합됐습니다.
- 기존 `docs/README.md`, `docs/RELEASE-HISTORY.md`의 11월 2일 '10장'은 **당시 기준의 이력**입니다. 이 문서와 각 문서의 최상단 현행 항목에서 현재 **9장+6장**을 명시하고, 과거 변경 기록은 수정하지 않습니다.

## 5. 남은 일 및 안전 경계

- [#611](https://github.com/dohyunkimmm/footmate/issues/611)의 실제 서명 JWT·일반 사용자/운영자 AAL1/AAL2·MFA 및 RPC/RLS 검증은 **미완료**입니다. 무료 요금제 유지와 기존 보안 경고의 수용 기준을 따르며, 인증정보·DB 권한·운영 데이터를 이번 문서 작업에서 변경하지 않습니다.
- [#525](https://github.com/dohyunkimmm/footmate/issues/525)는 11월 6일 **closed/not_planned**입니다. 10월의 패치 감사 결과를 현재 125개 브랜치의 일괄 삭제 허가로 해석하지 않습니다. 외부 참조·영구 백업·소유자 승인 없이 브랜치/태그 삭제, 강제 푸시, 이력 재작성을 하지 않습니다.
- 변경 범위는 **문서만**입니다. 이 보고서 생성 이후의 커밋·PR·CI·브랜치 수는 최신 GitHub 상태로 따로 확인해야 합니다. 자동 검사 성공을 실제 사용자 성과나 실계정 보안 검증 완료로 간주하지 않습니다.

관련 기록: [이전 점검(11월 5일)](REPO-CLEANUP-2026-11-05.md) · [문서 색인](README.md) · [저장소 운영](REPO-OPERATIONS.md) · [릴리스 이력](RELEASE-HISTORY.md).
