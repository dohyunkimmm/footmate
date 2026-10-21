# FootMate — 저장소 운영·보호 상태

> 점검 기준일: **2026-10-22 (KST)**. 이 문서는 GitHub Ruleset, PR, GitHub Actions, Vercel 배포의 관측 스냅샷입니다. 제품 요구사항/릴리스 이력은 [docs/README.md](README.md)와 [RELEASE-HISTORY.md](RELEASE-HISTORY.md)를 우선합니다. CI 성공과 Production 검증은 별도 사실입니다.

## 확인 완료

| 영역 | 관측 결과 | 근거 |
| --- | --- | --- |
| 기본 브랜치 | `main` / 기준 SHA `85b9dd6c8e1918f2c9ce865fdda448f11c91552e` | [main](https://github.com/dohyunkimmm/footmate/commits/main) |
| 브랜치 보호 | `Protect main` [Ruleset #22835628](https://github.com/dohyunkimmm/footmate/settings/rules/22835628) **active**; PR 필수, 강제 푸시·삭제 제한, strict 최신 브랜치 검사 | GitHub ruleset 조회 |
| 필수 상태 검사 | 정확한 검사명 `Regression 36`, `Browser E2E + axe` (둘 다 통과) | [main CI](https://github.com/dohyunkimmm/footmate/actions/runs/39617435276) |
| 배포 | 같은 SHA의 Vercel Production 배포 **READY** 및 `Production Smoke` 성공 | [Production Smoke](https://github.com/dohyunkimmm/footmate/actions/runs/39617435276) |
| 적용된 Beta SQL 마이그레이션 | 중복처럼 보이는 **이미 적용된** 4개 마이그레이션은 이력 보존; 삭제·수정·재적용 금지. 운영 가이드만 보강 | [PR #644](https://github.com/dohyunkimmm/footmate/pull/644) |
| 의존성 | `@vercel/oidc` 4.0.1 반영 | [PR #646](https://github.com/dohyunkimmm/footmate/pull/646) |

## 진행 중 / 외부 운영 확인 필요

1. **분산 요청 제한 — 미완료**: [#645](https://github.com/dohyunkimmm/footmate/issues/645). `POST /api/ai-match-assistant`는 현재 애플리케이션 인스턴스별 메모리 제한(기본 IP 10회/5분, 인스턴스 집계 60회/5분)을 적용하지만 서버리스 인스턴스 간 공유되지 않습니다. Vercel Firewall/WAF에서 범위·플랜 제한을 확인하고 `log`로 먼저 관측한 후 차단 정책을 점진 도입해야 합니다. **WAF rate-limit 적용 완료로 기재하지 않습니다.**
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
