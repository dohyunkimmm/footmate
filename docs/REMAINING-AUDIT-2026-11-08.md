# FootMate 미반영 패치·무료 운영 보안 잔여 검증 — 2026-11-08

> **읽기 전용 점검.** 별도 브랜치의 커밋이 `main`에 없는 것과 필요한 제품 기능이 누락된 것은 다릅니다. 이 문서는 코드/DB/인증정보 변경 또는 브랜치 삭제 승인이 아닙니다. 기준 `main`: [`850db56`](https://github.com/dohyunkimmm/footmate/commit/850db56c865966e8a0dcb742e14b084694e04272)(PR #887 병합 후).

## 1. 미반영 브랜치 판정

- GitHub Compare API로 **비기본 브랜치 124개** 전부의 `main...branch` 커밋 차이와 변경 파일 목록을 검사했습니다(이번 추가 감사/문서 브랜치 생성 전). 124개 모두 `ahead>0`이며 이전 `main` 변경을 다수 포함하지 않는 **분기된 역사적 브랜치**입니다. 이것만으로 실제 기능 미반영이라고 확정하지 않습니다.
- 이미 구축된 [읽기 전용 패치 감사](../.github/workflows/audit-branch-patches.yml)의 [PR #888 감사 실행 #42485591883](https://github.com/dohyunkimmm/footmate/actions/runs/42485591883) 성공. 감사 당시 remote 브랜치는 **126개(기본 `main` 포함)**, 비교한 비기본 브랜치는 **125개(이번 감사용 PR 브랜치 포함)**입니다. `git cherry` 패치 기준: **동등 패치 후보 8개·고유 패치가 존재하는 브랜치 117개·조상에 포함된 브랜치 0개**. 해당 시점 정확히 동일한 작업 트리는 **0개**.
- **동등 패치 8개:** `chore/retry-cardcopy-production`, `chore/retry-vercel-deploy`, `docs/add-evidence-index`, `docs/add-verification-matrix`, `docs/footmate-closeout`, `docs/sync-final-qa`, `docs/sync-qa-record`, `qa/webkit-my-selector-20260928`. 이 분류는 변경 내용이 다른 커밋에 패치 수준으로 재현됐다는 뜻이며, 원본 SHA·외부 참조·백업이 사라져도 된다는 뜻은 아닙니다.
- 나머지 고유 패치는 오래된 버전의 `src/v4/`, `src/v5/`, 이전 Case Study·QA 파일, 문서·스냅샷, 시점이 다른 PPT 생성물 등을 포함합니다. **고유 패치 = 적용해야 할 제품 기능**이 아닙니다. 실제 누락 기능인지 판단할 신규 요구·현행 재현 테스트 없이 역방향 병합하거나 파일을 덮어쓰지 않습니다.
- `main`을 보호하고 과거 [#858](https://github.com/dohyunkimmm/footmate/pull/858)처럼 [#859](https://github.com/dohyunkimmm/footmate/pull/859)에서 의도적으로 취소된 UI 변경을 재도입하지 않습니다. 기존 [#525](https://github.com/dohyunkimmm/footmate/issues/525)는 `closed/not_planned`(보존)입니다. 개별 외부 SHA 의존성/영구 백업/소유자 승인 없이 삭제·강제 푸시·Git 이력 재작성 **0건**.

## 2. CI 감사 보완

[PR #888](https://github.com/dohyunkimmm/footmate/pull/888)은 감사 워크플로 변경 시뿐 아니라 실제 패치 검사 코드 `tests/tools/branch-hygiene.cjs` 변경 시에도 감사를 실행하고, 조회한 원격 브랜치 수와 TSV 결과 수가 다르면 실패하도록 보완합니다. 자동 패치 머지·자동 브랜치 삭제는 추가하지 않았습니다. 최종 `main` 병합 및 CI 결과는 개별 Actions 실행으로 판정합니다.

## 3. Supabase `footmate-beta` 실운영 읽기 전용 감사

2026-11-08 연결된 프로젝트 상태는 `ACTIVE_HEALTHY`. Security/Performance/Health Advisor 및 운영 PostgreSQL 카탈로그에 **SELECT만** 수행했습니다.

| 항목 | 확인된 상태 | 조치 |
| --- | --- | --- |
| `public` 테이블 | 총 16개·RLS 16개 활성 | 유지 |
| 정책 없는 테이블 | `beta_match_reminder_marks`, `beta_public_config` 2개; 익명/인증 사용자 SELECT·INSERT 불허 | 서버 전용 경계 유지 |
| `public` SECURITY DEFINER | 38개, 전부 명시적 `search_path`; 익명 실행 가능 0, 인증 사용자 실행 가능 21 | 21개 실제 인가 검증 과제 유지 |
| 정책 속 수정 가능한 사용자 메타데이터 참조 | `raw_user_meta_data` 0개 | 읽기 전용 확인 |
| `pg_net` | `public` 확장 1개; Cron 3/3 활성 | 의존성 무단 변경 금지 |
| Security Advisor | `authenticated_security_definer_function_executable` 21 WARN, `extension_in_public` 1 WARN, `auth_leaked_password_protection` 1 WARN, `rls_enabled_no_policy` 2 INFO | 기존 위험·예외 분리 유지 |
| Performance Advisor | `unused_index` 8 INFO | 사용량·대표 실행계획 없이 삭제하지 않음 |
| Health Advisor | 현행 결과 0건 | 전체 보안 검증 합격이란 의미 아님 |

미사용 경고 인덱스 8개는 `idx_scan=0`(관측 통계 기준)이지만 대부분 표본 테이블이 작고, 크기도 각각 8~16KiB 수준입니다. 장기 호출/운영 패턴을 대표하지 못하므로 삭제가 이득이라고 단정하지 않습니다. 코드 마이그레이션/운영 DB에는 **DDL, 권한 변경, 데이터 수정, 인덱스 삭제, Cron 비활성화, 요금제 변경을 수행하지 않았습니다.**

## 4. 실제 미완료 작업

[이슈 #611](https://github.com/dohyunkimmm/footmate/issues/611)은 **OPEN 유지**. 사용자 승인·보안 채널로 관리되는 **테스트 전용 일반 사용자/운영자 계정과 운영자 TOTP**가 있어야 [기존 실행 가이드](REAL-SIGNED-MFA-QA.md)에 따라 실제 서명 JWT 비운영자 AAL1 / 운영자 AAL1·AAL2 허용·차단, refresh·local logout·복구 테스트를 수행할 수 있습니다. 모의 계약 테스트 및 위 읽기 전용 카탈로그 점검은 실계정 MFA 테스트가 아닙니다. 이 자격증명을 커밋, 채팅, GitHub 이슈 또는 Actions 로그에 남기지 않습니다.

추가로 21개 RPC의 실행 경계 및 대표 쿼리 계획·인덱스 사용 추이를 확인한 다음에야 개별 권한·성능 변경의 적정성을 판단할 수 있습니다. 무료 요금제의 `auth_leaked_password_protection` 경고는 **2026-11-01 결정에 따라 미해결·수용 예외**로 유지합니다. 추가 비용이나 유료 기능을 완료 조건으로 요구하지 않습니다.

관련 문서: [11월 8일 파일 목록·보존 기준](REPO-CLEANUP-2026-11-08.md) · [기존 브랜치 감사](BRANCH-PATCH-AUDIT-2026-10-28.md) · [보안 Advisor 개별 검토](SUPABASE-SECURITY-ADVISOR-REVIEW-2026-10-28.md).
