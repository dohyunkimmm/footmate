# FootMate — 저장소 운영·보호 상태

> 점검 기준일: **2026-10-22 (KST)**. 이 문서는 GitHub Ruleset, PR, GitHub Actions, Vercel 배포의 관측 스냅샷입니다. 제품 요구사항/릴리스 이력은 [docs/README.md](README.md)와 [RELEASE-HISTORY.md](RELEASE-HISTORY.md)를 우선합니다. CI 성공과 Production 검증은 별도 사실입니다.
>
> **배포 경로 변경 주의 (2026-10-25):** [PR #670](https://github.com/dohyunkimmm/footmate/pull/670)에서 Cloudflare Workers로 전환하고 [PR #671](https://github.com/dohyunkimmm/footmate/pull/671)에서 관련 Production Smoke를 수정했습니다. 현재 배포·검증 경로는 [GitHub Actions 워크플로](../.github/workflows/qa.yml)를 우선합니다. 아래 Vercel READY·WAF 기록은 **당시 운영 이력**이며 Cloudflare에서 같은 보호 정책이나 운영 상태가 검증됐다는 의미가 아닙니다.

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
