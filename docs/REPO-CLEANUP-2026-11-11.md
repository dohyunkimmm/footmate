# FootMate 파일·폴더 정리 및 문서 동기화 — 2026-11-11

> **기준:** GitHub `main` [`caadcb6`](https://github.com/dohyunkimmm/footmate/commit/caadcb6e200241286607219a830a22bab5b4edeb)의 재귀 트리(`truncated=false`). 이번 문서 PR 생성 **전**의 저장소 스냅샷으로, 새 CI·운영 배포·DB 조회를 실시했다는 뜻이 아닙니다.

## 1. 현재 파일·폴더 목록

- **278개 파일·37개 디렉터리**, 전체 트리 항목 **315개**.
- 루트: **13개 파일·8개 디렉터리**.
- [2026-11-09 기록](README.md)과 [2026-11-08 점검](REPO-CLEANUP-2026-11-08.md)의 345·339개 파일은 당시 수치이며 현행 합계가 아닙니다.

| 현행 경로 | 재귀 파일 수 | 용도·보존 판단 |
| --- | ---: | --- |
| `.github/` | 5 | GitHub Actions·설정·PR 템플릿, 보존 |
| `api/` | 2 | AI 및 Beta API, 보존 |
| `docs/` | 33 | 제품·운영 설명과 과거 검증 근거, 상태 구분 후 보존 |
| `scripts/` | 11 | Cloudflare 빌드·서비스 QA 도구, 보존 |
| `src/` | 87 | 제품·Beta·도메인·플랫폼 구현, 보존 |
| `supabase/` | 36 | Edge Functions 및 적용 이력 SQL, 보존 |
| `tests/` | 89 | 서비스 계약·E2E·시각 회귀·운영 검증, 보존 |
| `worker/` | 2 | 경로 진입·AI Worker, 보존 |
| 루트 파일 | 13 | README·HTML 진입점·설정·자산·잠금 파일, 보존 |
| **합계** | **278** | 현행 서비스 저장소 |

## 2. 이동·중복·삭제 판정

- [PR #909](https://github.com/dohyunkimmm/footmate/pull/909)에서 보고서 원본·PPTX·XLSX·보고서 전용 QA가 [footmate-case-study](https://github.com/dohyunkimmm/footmate-case-study)로 분리됐습니다. 현재 이 저장소에는 `qa/`, `src/case-study/`, 이전 루트 `index.html`이 없습니다. 이미 이관된 경로를 새로 삭제하거나 복원하지 않습니다.
- Git blob SHA가 정확히 같은 파일은 마이그레이션 두 쌍입니다.
  1. `supabase/migrations/20260922012426_beta_push_media.sql` ↔ `supabase/migrations/20260922013306_beta_push_media.sql`
  2. `supabase/migrations/20260922012607_beta_push_worker_schedule.sql` ↔ `supabase/migrations/20260922013447_beta_push_worker_schedule.sql`
- 위 SQL은 실행 순서·적용 이력 보호를 위해 삭제·병합·이름 변경하지 않습니다. 기존 브라우저 시각 스냅샷, 운영·증빙 문서, 호환 경로도 미사용 증명 없이 제거하지 않습니다.
- 파일명 기준 `.bak`, `.old`, `.tmp`, `.log`, `.zip`으로 끝나는 명백한 임시 파일은 확인되지 않았습니다. **추가 삭제 확정 대상 0건**이며, 모든 파일이 실제 사용 중임을 전수 입증했다는 의미는 아닙니다.

## 3. 문서 동기화 범위

- 루트 [README](../README.md): 현행 파일·폴더 수와 보고서 이동 후 경로, 과거 수치 구분.
- [docs/README](README.md): 현행 폴더 목록, 외부 보고서 원본 위치, Case Study QA 관리 주체 정정.
- [REPO-OPERATIONS](REPO-OPERATIONS.md): 현재 인벤토리·보존 결정 및 이전 스냅샷 해석 기준 추가.
- 이전 [11월 8일 정리 기록](REPO-CLEANUP-2026-11-08.md), 릴리스·보안 감사 이력은 당시 기록으로 보존.

## 4. 미완료·검증 경계

- 조회 시 열린 PR **0건**, 열린 이슈 [#611](https://github.com/dohyunkimmm/footmate/issues/611) **1건**. 실서명 JWT·운영자 TOTP MFA 실제 세션 검증은 이번 정리로 완료되지 않았습니다.
- GitHub 트리·경로와 현행 문서 안내를 대조했습니다. 로컬 빌드·전체 회귀·브라우저 E2E·운영 스모크 또는 실제 DB/인증/Cloudflare 배포 테스트를 이번 결과로 주장하지 않습니다.
- 변경 후 Docs-only QA 및 링크 검사는 별도 Actions 결과 확인이 필요합니다. 이력 변경, 원격 브랜치/태그 삭제, Supabase 수정 및 서비스 재배포는 이번 범위가 아닙니다.
