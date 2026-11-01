# Supabase Security/Performance Advisor — per-item review (2026-10-28)

> Scope: footmate-beta production **read-only** catalog/statistics review. This is **not** real signed-JWT authentication E2E, a change approval, or a claim that the Advisor warnings are resolved. Later Data API exposure tests are documented below.

## 2026-11-01 운영 방침 — 무료 요금제 고정 / Advisor 예외 분리

**운영 결정:** `footmate-beta`는 무료 요금제로 유지한다. 요금제 변경 및 무료 범위 밖의 기능은 **작업·인수 기준에서 제외**하며, 향후 반복적으로 비용 승인을 요구하지 않는다. 아래의 이전 날짜 기록은 감사 이력으로만 남기고, 현재 완료/미완료 판단은 이 방침을 우선한다.

| Advisor 항목 | 무료 운영 기준 처리 |
| --- | --- |
| `auth_leaked_password_protection` 1 WARN | **요금제 제약으로 예외 수용**. 경고가 실제 남아 있음을 명시하고 보안상 무위험/해결 완료로 표기하지 않는다. 이 경고 자체는 무료 운영의 작업 차단 조건에서 제외한다. |
| `authenticated_security_definer_function_executable` 21 WARN | **검증 대상 유지**. 익명 실행 0개, 운영자 `operator_*` 11개 가드 존재는 읽기 전용 확인 사항일 뿐, 실제 서명 JWT·AAL1/AAL2·세션 경계 E2E로 권한을 검증해야 한다. 일괄 REVOKE로 숫자만 줄이지 않는다. |
| `extension_in_public` 1 WARN (`pg_net`) | **운영 의존성 예외/개별 검토**. 확장은 비이동형이며 Cron 3개가 동작한다. 이전 운영 REST 검사에서 `net` API 미노출을 확인했으나, 확장 설치 위치 경고 자체가 해결된 것은 아니다. |
| `rls_enabled_no_policy` 2 INFO | **의도적 서버 전용 테이블**. RLS 활성/정책 0/익명 및 인증 사용자 SELECT 권한 없음 확인. 접근 허용 정책을 추가하지 않는다. |
| `unused_index` 8 INFO | **보존·관찰**. 데이터 규모 및 대표 실행계획 근거로 임의 삭제하지 않는다. |

**실제 남은 무료 범위 검증:** 허가된 테스트 계정에서 발급한 실제 서명 JWT로 비운영자 AAL1·운영자 AAL1/AAL2 허용/거부 및 갱신·로그아웃·복구를 확인하고, RPC별 인가·RLS·성능을 사례별로 검증한다. 이 작업이 끝나지 않았으므로 [이슈 #611](https://github.com/dohyunkimmm/footmate/issues/611)은 OPEN 유지한다.

## 2026-10-30 후속 · 신규 KPI RPC 반영 (과거 10월 28일 감사는 아래에 보존)

- [PR #727](https://github.com/dohyunkimmm/footmate/pull/727)으로 `public.beta_user_preferences`와 `public.operator_discovery_kpi_baseline(timestamptz)`이 추가됐고, Supabase 운영 migration `20261030032856_beta_preferences_pilot_metrics` 적용을 확인했습니다. 설정 변경이 아닌 후속 스키마/권한 확인 결과입니다.
- 신규 preferences 테이블은 RLS 사용, 본인 `user_id = auth.uid()`에 대한 SELECT·INSERT·UPDATE 정책 3개 적용, `anon` SELECT/ authenticated DELETE 불허. 신규 KPI RPC는 `anon EXECUTE`를 허용하지 않으며, 공통 `require_beta_operator_aal2()`를 호출하는 SECURITY DEFINER 함수입니다. 모의 AAL1에서는 `MFA_REQUIRED`, 비인증에서는 `AUTH_REQUIRED` 차단 및 모의 AAL2 KPI 4행 정상 실행을 확인했지만 **실제 Auth 서명 JWT E2E가 아닙니다**.
- **현재 Security Advisor:** `authenticated_security_definer_function_executable` **21 WARN**(기존 20 + 신규 파일럿 KPI RPC 1), `extension_in_public` **1 WARN**(`pg_net`), `auth_leaked_password_protection` **1 WARN**, `rls_enabled_no_policy` **2 INFO**. 기존 10월 28일 보고서의 20 WARN은 작성 당시 스냅샷으로 유지합니다. 새 WARN을 해결 처리하거나 `pg_net`·Cron 권한을 변경하지 않았습니다. 경고 확인: [Supabase 권한 린터](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).
- 실계정 운영자/비운영자 AAL1·AAL2, TOTP, refresh/logout/복구는 [이슈 #611](https://github.com/dohyunkimmm/footmate/issues/611)에 **미완료**로 유지합니다. [PR #729](https://github.com/dohyunkimmm/footmate/pull/729)은 별도 승인된 테스트 계정을 위한 도구/모의 계약 QA이며, 도구가 있다는 이유로 실서명 JWT 검증을 완료 처리하지 않습니다.
- 실제 파일럿 cohort 사용자 0명으로 신규 KPI 비율은 N/A입니다. 이 수치가 개인정보 억제/집계 함수 동작과 실사용 사업 성과를 동시에 검증하는 것은 아닙니다.

## Subsequent live API / Auth evidence (2026-10-28; supersedes initial "not verified" caveat)

The sections below retain the **initial static review** as historical evidence; the following negative checks were later performed against the real Supabase Data API using its **public anon JWT**, without any service-role key or configuration change:

| Live request | Observed response | Interpretation |
| --- | --- | --- |
| GET `/rest/v1/matches?select=id&limit=0` with `Accept-Profile: public` | **200** / `[]` (request 104411) | Valid baseline against exposed `public` schema; zero rows requested |
| Same URL and key with `Accept-Profile: net` | **406 / PGRST106**, `Invalid schema: net` (request 104412) | **`net` is not exposed by the live Data API at test time** |
| Same URL and key with `Accept-Profile: extensions` | **406 / PGRST106**, `Invalid schema: extensions` (request 104415) | `extensions` is likewise not exposed through this Data API |
| POST `/rest/v1/rpc/operator_discovery_metrics` with `{}` and public anon JWT | **401 / 42501**, `permission denied for function operator_discovery_metrics` (request 104418) | Anonymous execution of this read-only operator report RPC is denied at the real API boundary |

This **closes the Data API `net` exposure verification task only**. It does **not** resolve the `extension_in_public` Advisor WARN: `pg_net` is non-relocatable and is used by the live email/push cron jobs. Their previous 24-hour execution audit recorded 1,440/1,440 success each (cron completion is not delivery confirmation). Database-level grants remain untouched; PostgreSQL grant visibility is not equivalent to Data API exposure. The public anon RPC rejection is not a signed **authenticated** operator/nonoperator AAL1/AAL2 test.

Production Auth metadata without exposing identities: 4 user rows, 1 operator membership, 1 verified MFA factor, and an operator-associated AAL2 session record. Those preconditions are **not** real signed-token recovery/refresh or allow/deny E2E. `pg_stat_statements` also recorded normalized RPC statements; with `track_functions=none` those are not exact successful invocation counts.

**Current Free-only gates:** (1) explicitly authorized real-account signed JWT tests, including AAL1 vs AAL2, nonoperator, recovery, refresh, and safe cross-user negative cases; (2) representative query/index workload evidence before any index drop. The plan-gated password protection WARN is documented as an accepted exception, not an outstanding billing request. Do not modify production identities, credentials, API grants, or billing just to clear the Advisor.

See [GitHub Issue #611](https://github.com/dohyunkimmm/footmate/issues/611) for the audit log and acceptance status. The initial table and separate-decision section below document the earlier review; where they say API exposure was unverified, **this follow-up is newer**.

## Evidence and limits

- Supabase `pg_proc`, `pg_namespace`, `pg_stat_user_indexes`, `pg_stat_user_tables`, `pg_db_role_setting` examined without DDL, GRANT/REVOKE, inserts, or test-account logins.
- Security Advisor: 20 `authenticated_security_definer_function_executable` WARN, 1 `extension_in_public` WARN (`pg_net`), 1 leaked-password-protection WARN, 2 `rls_enabled_no_policy` INFO. Performance Advisor: 8 `unused_index` INFO; `auth_rls_initplan` absent.
- All 20 listed public security-definer functions: `has_function_privilege('anon', ... ,'EXECUTE')=false`, corresponding authenticated privilege=true, and a function-local `search_path` is set. **This does not prove the functions are safe for all inputs.** The functions run with definer privileges and must enforce authorization inside their bodies.
- Operator RPCs are independently documented as passing negative simulated AAL/role checks by PR #715–#717. Their definitions start by calling `public.require_beta_operator_aal2()`; that guard checks `auth.uid()`, membership in `public.operators`, and JWT `aal='aal2'`. The guard also rejects missing AAL by normalizing it to `aal1`. Real signed-JWT session-refresh/recovery E2E is still pending.
- `track_functions=none` means there is **no database function invocation counter** for this review. Static references and existing synthetic tests are not an actual production request trace.

## All 20 executable SECURITY DEFINER findings

| Function | Intended route / static boundary observed | Disposition |
| --- | --- | --- |
| `cancel_beta_waitlist` | Cancel the authenticated user's own queued waitlist entry (`auth.uid()`, `match_id`, queued status) | Keep pending real-owner negative test |
| `cancel_participation` | Cancel only the caller's participation, enforcing match cancellation cutoff | Keep pending cross-user/cutoff E2E |
| `check_in_participation` | Caller-owned confirmed participation plus check-in time window | Keep pending cross-user/window E2E |
| `discovery_event_budget_available` | Per-caller discovery-event budget evaluated using `auth.uid()` | Keep pending request-volume/identity E2E |
| `get_beta_push_public_key` | Read the VAPID **public** key from otherwise server-only `beta_public_config` | Keep intentional authenticated public-key reader; ensure response never includes private key |
| `join_beta_waitlist` | Caller-identified waitlist creation; enforces allowed positions, match/slot capacity and timing | Keep pending cross-user/match-state E2E |
| `join_match_position` | Caller-identified participation, position/capacity and cutoff checks | Keep pending cross-user/position E2E |
| `mark_beta_notification_read` | Update notification only when `n.user_id = auth.uid()` | Keep pending foreign-notification E2E |
| `operator_beta_email_health` | Operator diagnostics; first statement invokes common AAL2 guard | Keep authenticated EXECUTE with runtime operator+AAL2 gate |
| `operator_beta_funnel_metrics` | Operator reporting; first statement invokes common AAL2 guard | Same; real JWT/role negative tests pending |
| `operator_cancel_match` | Operator match cancellation; first statement invokes common AAL2 guard | Same; mutation E2E pending |
| `operator_cancel_participant` | Operator participant cancellation; first statement invokes common AAL2 guard | Same; mutation E2E pending |
| `operator_check_in_participant` | Operator participant check-in; first statement invokes common AAL2 guard | Same; mutation E2E pending |
| `operator_complete_match` | Operator match completion; first statement invokes common AAL2 guard | Same; mutation E2E pending |
| `operator_discovery_metrics` | Operator discovery metrics; uses AAL2 guard rather than a direct `auth.uid()` in this function | Keep; guard is essential, real-session negative tests pending |
| `operator_retry_beta_notification_email` | Operator email retry; first statement invokes common AAL2 guard | Keep; verify mutation/retry authorization with real session |
| `operator_save_match` | Operator match save; first statement invokes common AAL2 guard | Keep; real JWT role+AAL2 mutation QA pending |
| `operator_save_match_v2` | Operator match save v2; first statement invokes common AAL2 guard | Same; verify legacy/v2 call surfaces |
| `require_beta_operator_aal2` | Common authorization guard checking user identity, operator membership and AAL2 | Retain intentional authenticated EXECUTE; no anonymous call grant |
| `submit_beta_match_feedback` | Caller-owned checked-in participation and completed match required to submit scores | Keep pending cross-user/invalid-match E2E |

**Decision:** No mass `REVOKE EXECUTE`, no `SECURITY INVOKER` conversion, and no unconditional claim of remediation. The remaining 20 warnings can reflect deliberately exposed authenticated RPCs; runtime allow/deny evidence must precede any grant changes.

## All eight unused-index findings

`pg_stat_user_indexes.idx_scan=0` for all eight, but the affected tables are small and these index stats are not a reliable proof of dead code. The eight indexes occupy **120 KiB total** at observation time. These are review candidates, **not DROP approvals**.

| Index | Definition/purpose | Observed result |
| --- | --- | --- |
| `matches_created_by_idx` | `matches(created_by)`; creator-based match listing/ownership patterns | Retain; measure real creator filtering |
| `beta_operation_events_actor_idx` | Partial index on non-null operation `actor_id`; event audit filtering | Retain; assess operator/audit query plan when populated |
| `beta_operation_events_subject_user_idx` | Partial index on non-null `subject_user_id`; account-focused auditing | Retain; test subject-specific audit lookup |
| `beta_notifications_match_idx` | `match_id, created_at DESC` for notifications with match | Retain; assess per-match notification trace |
| `beta_notifications_email_due_idx` | Partial composite index on email next-attempt/creation/id for pending, failed, processing statuses | Retain; preserve email worker scheduling performance |
| `beta_notifications_push_due_idx` | Partial composite index on push next-attempt/creation/id for pending, failed, processing statuses | Retain; preserve push worker scheduling performance |
| `discovery_events_match_idx` | `discovery_events(match_id)` event analytics | Retain; collect pilot analytics query plan |
| `beta_match_feedback_match_idx` | `beta_match_feedback(match_id)` feedback lookup/aggregation | Retain; no pilot feedback data for representative plan |

Before dropping any: collect representative non-sensitive SQL query patterns and `EXPLAIN (ANALYZE, BUFFERS)` on a safe dataset, estimate future pilot growth, verify FK/workflow dependencies, repeat actual `idx_scan` trend after traffic, and obtain explicit approval.

## Separate unresolved decisions

1. **Real Auth MFA tests:** operator vs non-operator, AAL1 vs AAL2, expired/malformed token, account recovery, session refresh, and protected RPC authorization need **real Supabase Auth-signed JWTs** from authorized test accounts. Synthetic `request.jwt.claim` SQL cannot substitute. Do not create/delete production users without an approved test plan.
2. **`pg_net` Data API exposure:** Extension `pg_net` is installed in `public` and is not relocatable. Schema `net` grants USAGE to anon/authenticated, with `net.http_get`, `http_post`, `http_delete` executable by both. A PostgreSQL connection has no `pgrst.db_schemas` setting; no matching `pg_db_role_setting` entry was found. **None of these facts proves whether the live PostgREST/Data API exposes the `net` schema.** Verify in [Supabase Data API Settings](https://supabase.com/dashboard/project/iihitfjphowjplxzfxtn/integrations/data_api/settings). Do not change extension/cron grants without dependency review.
3. **Leaked-password protection — Free-only accepted exception (2026-11-01):** This Advisor WARN remains visible because the feature is not included in the selected free operating scope. Document the limitation and residual risk; do not list billing changes as a remaining acceptance condition.
4. **No-policy tables:** `beta_match_reminder_marks` and `beta_public_config` both have RLS on, zero policies, and no `anon`/`authenticated` SELECT/INSERT/UPDATE/DELETE grants. Treat as intentionally server-only; do not add permissive policies.

## Acceptance boundary

This static, read-only **per-item assessment is complete**, but Issue #611 stays open. Required Free-only follow-up: authenticated session E2E and representative live caller/query-plan evidence. The plan-limited password-protection warning is an accepted exception, not a requested change. Data API `net` and `extensions` non-exposure was independently confirmed in the later section above. No schema, grants, data, secrets, account, or billing changes were performed.
