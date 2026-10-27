# FootMate — 저장소 운영·보호 상태

> 점검 기준일: **2026-10-22 (KST)**. 이 문서는 GitHub Ruleset, PR, GitHub Actions, Vercel 배포의 관측 스냅샷입니다. 제품 요구사항/릴리스 이력은 [docs/README.md](README.md)와 [RELEASE-HISTORY.md](RELEASE-HISTORY.md)를 우선합니다. CI 성공과 Production 검증은 별도 사실입니다.
>
> **배포 경로 변경 주의 (2026-10-25):** [PR #670](https://github.com/dohyunkimmm/footmate/pull/670)에서 Cloudflare Workers로 전환하고 [PR #671](https://github.com/dohyunkimmm/footmate/pull/671)에서 관련 Production Smoke를 수정했습니다. 현재 배포·검증 경로는 [GitHub Actions 워크플로](../.github/workflows/qa.yml)를 우선합니다. 아래 Vercel READY·WAF 기록은 **당시 운영 이력**이며 Cloudflare에서 같은 보호 정책이나 운영 상태가 검증됐다는 의미가 아닙니다.

## 2026-10-27 · 남은 Security Advisor 경고의 운영 검증

- [보안 Advisor 결정 기록](SUPABASE-SECURITY-ADVISOR-2026-10-27.md)과 [RPC 실제 거부 검증 SQL](../tests/database/definer-rpc-readonly-guards.sql)을 추가했습니다. 운영 DB에서 `BEGIN READ ONLY … ROLLBACK` 성공: `SECURITY DEFINER` 20개 중 `anon` 실행 0, 전체 명시적 `search_path` 확인, `operator_*` 10개 전부 일반 사용자/AAL2에서는 `OPERATOR_REQUIRED`, 운영자/AAL1에서는 `MFA_REQUIRED`, 8개 사용자 호출 경로는 UID 누락 시 `AUTH_REQUIRED`를 확인했습니다. 이는 **모의 JWT + DB role 검사**이며 실제 서명된 Auth 토큰 통합 테스트는 아닙니다.
- Supabase 조직 API의 실제 요금제는 **Free / tier_free**로 확인했습니다. 유출 비밀번호 보호 기능은 공식 문서상 Pro 이상에서 이용할 수 있으므로 비용 승인·플랜 변경 없이 이를 활성화했다고 주장하지 않습니다. `auth_leaked_password_protection` 경고는 별도 의사결정이 필요합니다.
- `pg_net`는 `public` 설치이며 설치 버전 `relocatable=false`를 확인했습니다. `net` 스키마의 anon/authenticated USAGE 및 GET/POST EXECUTE 권한도 존재하므로 PostgREST 노출 여부·Cron 의존성·권한 변경 영향을 확인하지 않고 이동·재설치·REVOKE하지 않습니다. `extension_in_public` 경고는 남아 있습니다.
- Git 브랜치는 [로컬 읽기 전용 patch-equivalence 감사](../tests/tools/branch-hygiene.cjs)를 추가했습니다. `docs/compact-demo-release-654`는 2026-10-27 `main 136bb9b`에서 `ahead=0, behind=55`를 재확인했으나 Git ref는 변경하지 않았습니다. 이전 121개/behind 52 수치는 그 당시 관측값입니다.

## 2026-10-27 · RLS 성능 적용 및 안전성 재검증

- [PR #713](https://github.com/dohyunkimmm/footmate/pull/713)을 squash 병합(`a2037df7`). [PR QA #40502212534](https://github.com/dohyunkimmm/footmate/actions/runs/40502212534)의 `Regression 36` 및 `Browser E2E + axe` 통과. 운영 Supabase에는 `apply_migration`으로 `optimize_beta_operator_rls_jwt`를 적용했으며 **실제 migration version은 `20261027122602`**입니다. 버전관리 SQL은 [동일한 타임스탬프 파일](../supabase/migrations/20261027122602_optimize_beta_operator_rls_jwt.sql)로 맞췄습니다.
- 변경은 기존 **11개 정책의 `auth.jwt()` → `(select auth.jwt())` 최적화**에 한정합니다. 정책명·역할·허용 대상·운영자 AAL2·사용자별 소유권 검사·RPC 권한은 보존했습니다. 사전 마이그레이션 `ROLLBACK` 리허설 및 운영 반영 후 [읽기 전용 역할 테스트](../tests/database/rls-operator-readonly-roles.sql)(anon, 회원 AAL1/AAL2, 운영자 AAL1/AAL2, 참가자 AAL1) PASS.
- 운영 DB 반영 후 Supabase Performance Advisor **`auth_rls_initplan` 11 → 0** 확인. `unused_index` INFO 8건은 안전 검증 없이 제거하지 않았습니다. Security Advisor의 `authenticated_security_definer_function_executable` 20 WARN, `extension_in_public` 1 WARN, `auth_leaked_password_protection` 1 WARN 및 no-policy INFO 2건은 여전히 별도 검토입니다.
- 읽기 전용 테스트의 JWT는 SQL 역할에서 모의한 claim이며 실제 서명된 OAuth/JWT E2E를 증명하지 않습니다. 과거 이력·알림 Cron/pg_net·마이그레이션 수정·인덱스 제거 및 Git history rewrite는 하지 않았습니다.

## 2026-10-27 · 후속 감사 및 재현 가능한 검증

- GitHub [브랜치 전수 감사](BRANCH-HYGIENE-2026-10-27.md): 122개 브랜치 중 `main` 제외 121개 전부의 ahead/behind를 재조회했습니다. `docs/compact-demo-release-654`만 `ahead_by=0`, `behind_by=52`이며, 나머지 120개는 고유 커밋이 있는 분기 상태입니다. Patch equivalence와 브랜치별 운영 의존성 확인 전 삭제하지 않습니다. 이 조사는 아래의 과거 “31개 표본, 모두 ahead>0” 판단을 **전수 점검 결과로 정정**합니다. 이번에 ref를 삭제하거나 `main`을 재작성하지 않았습니다.
- Supabase [읽기 전용 보안/성능 쿼리](../tests/database/rls-advisor-readonly.sql)를 운영 DB에서 실행했습니다. 인증 사용자에게 실행 가능한 `SECURITY DEFINER` 함수 **20개 중 anon/PUBLIC 호출 가능 0개**, `operator_*` 함수 10개 중 `require_beta_operator_aal2` 가드 누락 0개, 대상 RLS 정책 14개 중 직접 `auth.jwt()` 호출 **11개**입니다. 이는 문자열·ACL 검사이며 실제 계정별 접근/부작용 검증을 대체하지 않습니다. `Regression 36`의 [beta Supabase 계약](../tests/contracts/beta-supabase-hardening.contract.mjs)이 감사 SQL의 읽기 전용 구조를 검사합니다. DB 변경, 마이그레이션 적용, 권한 변경은 하지 않았습니다.

## 2026-10-27 · 현행 점검 및 과거 지침 정정

- GitHub `main` [`bf3aa123`](https://github.com/dohyunkimmm/footmate/commit/bf3aa1238589e70e1ab046256f273824aba8c980) 기준, [Actions #40490413086](https://github.com/dohyunkimmm/footmate/actions/runs/40490413086)의 Change Impact·Regression 36·Browser E2E + axe·Deploy Cloudflare·Production Smoke 모두 **SUCCESS**. 이는 해당 SHA의 CI/자동 운영 검증이며 OAuth·실제 이용자 성과의 수동 확인은 아닙니다.
- [PR #686](https://github.com/dohyunkimmm/footmate/pull/686) 병합으로 `vercel.json`, `scripts/vercel-ignore-build.cjs`, `tests/contracts/vercel-preview-deployment.contract.cjs`는 **현재 main에서 제거된 상태**입니다. 아래 10월 26일 초반의 “삭제하지 않는다/보존한다” 문장은 당시 안전 검토 이력이며 현행 작업 지시가 아닙니다. `@vercel/oidc`는 별개의 AI Gateway 의존성으로 유지합니다.
- 아래 당시 “미병합 UI PR #630/#631” 항목은 현행 열린 PR을 뜻하지 않습니다. 두 PR은 **미병합 종료**되었고 현재 열린 PR은 0건(점검 시점 기준)입니다.
- **2026-10-27 추가 확인:** Vercel `footmate` 프로젝트(`prj_qC9oub221ki6TDxlDSK1Ys07eGUV`)는 감사 이벤트 `project-delete` **2026-10-26 18:23 KST**를 확인했으며 동일 팀/ID 재조회는 404, 프로젝트 목록 검색은 0건입니다. [#685](https://github.com/dohyunkimmm/footmate/issues/685)는 근거 댓글을 남기고 **완료 종료**했습니다. 이 삭제는 이번 점검에서 실행한 것이 아닙니다. 현재 미완료는 [#611](https://github.com/dohyunkimmm/footmate/issues/611) Supabase Security/RLS 실사용 권한 검토와 [#525](https://github.com/dohyunkimmm/footmate/issues/525) Git 브랜치·이력 용량 정리 2건입니다. DB 권한 변경·force push·브랜치 삭제는 완료된 것으로 주장하지 않습니다.
- Supabase 2026-10-27 읽기 전용 재점검에서 `SECURITY DEFINER` 함수 20개 전부의 익명/`PUBLIC` 실행 권한이 없음을 확인했습니다. `auth_rls_initplan` 성능 경고 11건, 미사용 인덱스 8건 등의 검증·개선은 여전히 별도 과제입니다. 현재 브랜치 122개 중 31개를 비교했으며 모두 `main`에 없는 고유 커밋이 남아 있어 임의 삭제하지 않았습니다. 현재 트리 6.32 MiB 대비 GitHub 표시 저장소 크기는 136.38 MiB입니다.
- 최근 제품 변경 #703–#709의 현재 설명은 [릴리스 이력](RELEASE-HISTORY.md)과 [측정 준비 기준](BETA-MEASUREMENT-READINESS.md)을 참조합니다. 아래 10월 22–26일 Vercel·QA 기록의 당시 관측 사실 자체는 보존합니다.

## 확인 완료

| 영역 | 관측 결과 | 근거 |
| --- | --- | --- |
| 기본 브랜치 | `main` / 문서 갱신 직전 기준 SHA `60fd6a5face8869f9ebbcfcf3ae944b889af17de` | [main](https://github.com/dohyunkimmm/footmate/commits/main) |
| 브랜치 보호 | `Protect main` [Ruleset #22835628](https://github.com/dohyunkimmm/footmate/settings/rules/22835628) **active**; PR 필수, 강제 푸시·삭제 제한, strict 최신 브랜치 검사 | GitHub ruleset 조회 |
| 필수 상태 검사 | 정확한 검사명 `Regression 36`, `Browser E2E + axe` (둘 다 통과) | [main CI](https://github.com/dohyunkimmm/footmate/actions/runs/39617435276) |
| 배포 | 이전 런타임 SHA `85b9dd6`의 Vercel Production **READY** 및 `Production Smoke` 성공. 최신 문서-only SHA `60fd6a5`의 신규 Production 배포는 **CANCELED**, 해당 SHA에서 smoke는 **SKIPPED**. 새 런타임 배포 성공으로 오인 금지 | [기존 런타임 Smoke](https://github.com/dohyunkimmm/footmate/actions/runs/39617435276) · [docs sync PR #647](https://github.com/dohyunkimmm/footmate/pull/647) |
| 적용된 Beta SQL 마이그레이션 | 중복처럼 보이는 **이미 적용된** 4개 마이그레이션은 이력 보존; 삭제·수정·재적용 금지. 운영 가이드만 보강 | [PR #644](https://github.com/dohyunkimmm/footmate/pull/644) |
| 의존성 | `@vercel/oidc` 4.0.1 반영 | [PR #646](https://github.com/dohyunkimmm/footmate/pull/646) |

## 2026-10-22 검증 이후 동기화

- [문서 동기화 PR #647](https://github.com/dohyunkimmm/footmate/pull/647) 병합으로 운영 문서와 README 연결이 최신 `main`에 반영됐습니다. 해당 `main` SHA `60fd6a5`의 `Change Impact` / `Docs-only QA`는 **SUCCESS**, `Regression 36` / `Browser E2E + axe` / `Production Smoke`는 문서 변경이므로 **SKIPPED**입니다. 그 직전 런타임 SHA `85b9dd6`에서는 필수 회귀·브라우저 검사와 Production Smoke 모두 통과했습니다.
- Vercel에서 최신 문서 커밋 `60fd6a5`의 production deployment는 **CANCELED**, 이전 런타임 SHA `85b9dd6`의 배포는 **READY**였습니다. 문서 갱신만으로 새 런타임 배포 성공을 주장하지 않습니다.
- [Ruleset #22835628](https://github.com/dohyunkimmm/footmate/settings/rules/22835628) **active**, 정확한 필수 검사 `Regression 36` / `Browser E2E + axe`, `strict=true`를 재조회했습니다.
- 2026-10-23 기준 사용자가 Vercel WAF 관찰 규칙을 생성·게시했으며, Vercel 감사 이벤트에서 `footmate-ai-rate-limit` **active 규칙 삽입 및 Firewall config version 1 publish**를 확인했습니다. 아래 'WAF 1단계 종료'의 증거와 검증 한계를 따릅니다.

## 2026-10-23 Vercel WAF 1단계 배포·운영 종료 기록

- **배포됨(감사 이벤트 확인):** 사용자가 Vercel 대시보드에서 `footmate-ai-rate-limit`을 설정·Publish 완료. Vercel `firewall-config-promoted` 이벤트(2026-10-23 11:28 KST)에 이 프로젝트의 Firewall **version #1** 게시 및 규칙 `rule_footmate_ai_rate_limit_cXJt9l`(`active=true`, `rules.insert`) 기록이 있습니다.
- **설정 의도(사용자 입력 기준):** `POST /api/ai-match-assistant`, IP별 **5분에 10회**, 제한 초과 시 **Log(관찰 전용)**. Vercel API `GET /v1/security/firewall/config/active` 및 `/1`에서 계속 `404 Seawall Config not found`를 반환하여 **정확한 조건·시간·후속 액션은 API로 독립 검증하지 못했습니다**. Publish 사실은 별도 감사 이벤트로 확인됐습니다.
- **초기 안전성:** 설정 직후 Vercel에서 이 API의 최근 30분 집계 런타임 오류 클러스터는 없었으며 사용자는 화면에서 문제를 발견하지 않았다고 확인했습니다. 이는 **WAF 매칭/초과 로그 발생 또는 오탐 없는 운영을 증명하지 않으며**, 해당 기간에 관련 요청이 있었는지도 알 수 없습니다.
- **정리 기준:** 관찰 규칙 **게시·기본 확인 작업**은 여기서 종료합니다. 실제 차단(429), 공유 IP 오탐, 인스턴스 간 전역 rate-limit 효과 및 비용·트래픽 영향은 **검증/적용하지 않았으므로 완료로 기록하지 않습니다**. 필요해질 때 별도 보호 강화 작업으로 진행하세요. 현재 규칙은 사용자 설정대로 Log 단계로 유지합니다.
- 추적 기록: [운영 WAF 이슈 #645](https://github.com/dohyunkimmm/footmate/issues/645).

## 진행 중 / 외부 운영 확인 필요

1. **WAF 관찰 규칙 게시 — 1단계 완료**: [#645](https://github.com/dohyunkimmm/footmate/issues/645). 아래 2026-10-23 기록 참조. 앱 자체의 `Map` 제한(기본 IP 10회/5분, 인스턴스 집계 60회/5분)은 인스턴스 간 공유되지 않습니다. Vercel 규칙 게시와 실제 전역 초과 차단·효과 확인은 별개이며, **강제 차단(429) 및 다중 인스턴스 영향 검증은 미실시**입니다.
2. **Git 용량·이력 및 브랜치 위생 — 미완료**: [#525](https://github.com/dohyunkimmm/footmate/issues/525). 릴리스 SHA를 깨는 `main` force rewrite, 미병합 브랜치 일괄 삭제를 하지 않습니다.
3. **Supabase Security/RLS Advisor 후속**: [#611](https://github.com/dohyunkimmm/footmate/issues/611). 별도 운영 검증이 필요합니다.
4. **미병합 UI PR**: [#630](https://github.com/dohyunkimmm/footmate/pull/630)과 [#631](https://github.com/dohyunkimmm/footmate/pull/631)은 현재 `main` 반영 사항으로 기술하지 않습니다.

## 운영 변경 시 원칙

- 변경은 PR로 진행하고 정확한 필수 체크 이름을 유지합니다. 문서 전용 QA와 런타임 영향 QA를 구분합니다.
- Vercel `READY`만으로 Production Smoke 통과를 추정하지 않습니다.
- SQL 마이그레이션은 배포·적용 이력을 우선하며 단순 파일 유사성만으로 제거하지 않습니다.
- 서비스 경계를 변경한 경우 [릴리스 이력](RELEASE-HISTORY.md)과 [Beta 운영 런북](BETA-PILOT-RUNBOOK.md)을 함께 갱신합니다.

## 관련 저장소

[mosigo 운영 현황](https://github.com/dohyunkimmm/mosigo/blob/main/docs/REPO-OPERATIONS.md) · [onboardos 운영 현황](https://github.com/dohyunkimmm/onboardos/blob/main/docs/REPO-OPERATIONS.md)

## 2026-10-26 · 안전 클렌징 점검

- `.gitignore`: `node_modules/`, `dist/`, `.dev.vars*` 중복을 제거하고 `.env`/ `.env.*`와 중복되는 포괄 규칙 `.env*`를 하나만 둡니다. `!.env.example`은 마지막 환경파일 규칙 다음에 배치해 **예제 파일만 예외**로 적용합니다. 실제 환경값 파일이나 기존 배포 파일은 변경하지 않습니다.
- **`vercel.json`은 현재 삭제하지 않습니다.** 공식 배포는 Cloudflare Workers로 이동했지만 기존 Vercel 프로젝트가 남아 있으며 `tests/contracts/vercel-preview-deployment.contract.cjs`에서 설정 파일을 읽습니다. `.github/workflows/qa.yml`의 변경 영향 판정은 `scripts/vercel-ignore-build.cjs`를 사용하고, Regression 36도 이전 Vercel preview 계약을 검사합니다. 무작정 삭제하면 CI/과거 배포 경로 검증을 깰 수 있습니다.
- Vercel 설정·스크립트·QA 계약 제거는 **Vercel Git 자동 배포 중단 여부 확인 → Cloudflare 기준 변경 영향 판정과 테스트로 교체 → 회귀 및 Production Smoke 검증**을 별도 PR로 진행할 때 판단합니다. `@vercel/oidc`는 AI Gateway 토큰 취득 경로에서 참조되므로 Vercel 호스팅 이관을 이유로 삭제하지 않습니다.
- 본 점검은 `src/`, `worker/`, `supabase/`와 배포 설정을 변경하지 않습니다. `.gitignore`와 운영 문서만 수정하며, 실제 CI 분류·결과는 PR과 병합 후 워크플로에서 확인합니다.

## 2026-10-26 · Cloudflare 변경 영향 판정 이관

- 공식 GitHub Actions 배포 판단은 `scripts/classify-cloudflare-impact.cjs`로 분리합니다. `.github/workflows/qa.yml`의 `Change Impact`는 전체 `git diff` 파일 목록을 전달해 `runtime`·`production`·`production_smoke`의 **정확한 불리언**을 출력합니다. 목록이 비어 있거나 비정상적이면 검증·배포를 건너뛰지 않는 보수적 기본값을 사용합니다.
- `README.md`·`docs/` 등 문서 전용은 경량 QA, 테스트 파일은 회귀 QA, 런타임·Worker·Wrangler·빌드 스크립트 변경은 전체 QA와 Cloudflare 배포 대상으로 분류합니다. Production Smoke 검증 코드나 워크플로만 바뀌면 기존 배포를 대상으로 Smoke를 실행할 수 있으나 무조건 새 배포를 생성하지 않습니다.
- 새 분류 계약은 `tests/contracts/cloudflare-deployment-impact.contract.cjs`에 추가합니다. 병합 전 `Regression 36`·`Browser E2E + axe`, 병합 후 해당 커밋의 `Deploy Cloudflare`·`Production Smoke`를 각각 확인합니다. 이 항목은 검사 완료 전에는 결과를 주장하지 않습니다.
- `tests/production-smoke.cjs`와 `tests/production-ai.cjs`의 환경변수 미설정 기본 주소도 과거 Vercel에서 현재 공개 Cloudflare 주소(`https://footmate.fmate.workers.dev`)로 정정합니다. CI에서 지정하는 `FOOTMATE_PRODUCTION_URL`이 우선하는 계약은 유지하며, `tests/contracts/production-smoke.contract.cjs`에 재발 방지 단언을 추가합니다.
- **Vercel 설정은 보존합니다.** 별도 확인한 Vercel `footmate` 프로젝트가 아직 존재하고 과거 `main`의 Production READY 배포·도메인을 보유합니다. Git 연동 해제 및 과거 도메인 이용 중단은 확인되지 않았습니다. 기존 `vercel.json`, `scripts/vercel-ignore-build.cjs`, Vercel preview 호환 계약은 이전 운영·자동 배포 경로를 깨지 않도록 분리 보존하고, 현재 CI 배포 판정에는 사용하지 않습니다.
- `@vercel/oidc`는 `api/ai-match-assistant.js`의 AI Gateway 토큰 취득 코드에서 사용하므로 유지합니다. 잔여 Vercel 설정 삭제는 Git 연동 비활성화, 레거시 도메인 이용 여부, 회귀 대체 확인을 마친 뒤 별도 검토합니다.

## 2026-10-26 · Vercel 저장소 전용 설정 퇴역 심사

- 실제 Vercel Git 연결 컨텍스트를 조회한 결과 같은 팀의 `toolflow`, `mosigo`는 연결 프로젝트로 표시됐지만 `footmate`는 표시되지 않았습니다. **현재 해당 계정의 연결 목록에서 FootMate Git 연결이 확인되지 않음**을 의미하며, 향후 Git 재연결 가능성까지 없다는 의미는 아닙니다.
- GitHub [PR #684](https://github.com/dohyunkimmm/footmate/pull/684)의 병합 SHA `44d80a45`에 대해 [Actions #40227264401](https://github.com/dohyunkimmm/footmate/actions/runs/40227264401)에서 Regression 36·Browser E2E + axe·Deploy Cloudflare·Production Smoke가 모두 성공했습니다. 현재 CI의 빌드 영향 판정은 `scripts/classify-cloudflare-impact.cjs`이고 더는 Vercel 스크립트를 호출하지 않습니다.
- 이에 따라 저장소에서 `vercel.json`, `scripts/vercel-ignore-build.cjs`, `tests/contracts/vercel-preview-deployment.contract.cjs`를 제거하고, `qa.yml`의 구 Vercel 계약 실행 단계를 삭제합니다. `scripts/check-app-boundary.cjs`는 실제 Worker의 `/demo`, `/beta`, `/beta/operator`, `/prototype` 라우팅을 검사하고, `scripts/check-ai-boundary.cjs`는 `AI_RATE_LIMITER` 및 Wrangler 제한을 검증하도록 교체합니다. 기존 Vercel 프로젝트·과거 READY 프로덕션 배포·도메인은 **삭제하거나 일시 중지하지 않습니다.** 이는 저장소의 미사용 파일 정리이지, 실제 Vercel 서비스 종료가 아닙니다.
- Vercel `footmate`의 기존 프로덕션 도메인 `footmate-black.vercel.app`이 여전히 등록되어 있고 과거 READY 배포가 존재합니다. Web Analytics가 비활성화됐으며 최근 30분 로그 그룹이 비어 있어 **과거 도메인의 이용자 0명 또는 OAuth 사용 중단은 입증되지 않았습니다.** `src/beta/social-auth.js`와 `src/beta/infrastructure/supabase.js`는 접속 origin을 인증 복귀 URL로 사용합니다. Supabase OAuth redirect 허용 목록은 별도로 검증해야 합니다.
- `@vercel/oidc` 및 `api/ai-match-assistant.js`의 Vercel AI Gateway 참조는 **현재 AI 추론 의존성**으로 유지합니다. 위 변경이 포함된 PR의 전체 QA 및 병합 후 Cloudflare 배포·Smoke 결과는 성공한 실제 검사 결과에 따라서만 완료 처리합니다.
- Vercel 외부 프로젝트의 실제 종료·도메인 리디렉션 또는 해제·OAuth 허용 목록 정리는 [이슈 #685](https://github.com/dohyunkimmm/footmate/issues/685)에서 사용 현황을 검증한 후 별도 실행합니다. 과거 2026-10-22~23 기록은 당시 이력으로 남깁니다.

## 2026-10-26 · 현행 Cloudflare 운영 및 Vercel 퇴역 진행 상태 정정

- **현행 기준:** [이슈 #685](https://github.com/dohyunkimmm/footmate/issues/685)에 따르면 FootMate 공식 호스팅은 Cloudflare Workers이고, 사용자가 구 Vercel 호스팅을 사용하지 않으며 Supabase의 관련 리디렉션 설정을 정리했다고 확인했다. Supabase Auth 설정값을 연결 도구로 직접 재조회해 독립 검증했다는 뜻은 아니다.
- 구 Vercel FootMate 프로젝트에는 `Pause Project` 명령을 실행했으며 후속 조회에서 `live=false`였다. Git 연결 목록에 FootMate는 확인되지 않았다. **프로젝트 영구 삭제는 아직 완료가 확인되지 않았고, 소유자의 대시보드 최종 승인이 남았다.** 실행하거나 삭제된 것으로 표현하지 않는다.
- `send-beta-notification-email`·`process-beta-email-outbox`의 기본 Beta URL은 [PR #687](https://github.com/dohyunkimmm/footmate/pull/687) 및 이슈 #685 기록에 따라 Cloudflare 주소로 변경됐다. 운영 배포 소스와 GitHub 파일의 일치가 확인됐으나 환경변수 설정값과 실 이메일 발송 성공은 검증되지 않았다.
- 구 Vercel Git 재연결·OAuth 허용 목록을 **미확인이라서 퇴역 보류해야 한다**는 위 과거 지침은 사용자 운영 확인과 이슈 #685의 정정 기록으로 대체한다. 과거 READY·WAF·배포 증빙 자체는 해당 시점 이력으로 보존한다.
- AI Gateway 사용과 `@vercel/oidc` 의존성은 호스팅 퇴역과 별도이므로 유지한다. 문서 동기화 직전 `main` SHA `e29134aac02da85b4529d41ddb642099c489ff19`의 [Actions #40295186529](https://github.com/dohyunkimmm/footmate/actions/runs/40295186529)는 Regression/Browser/Deploy Cloudflare/Production Smoke 모두 SUCCESS였다. 후속 변경은 별도 검사로 확인한다.
