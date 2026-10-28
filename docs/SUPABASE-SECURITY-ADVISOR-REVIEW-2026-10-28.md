# Supabase Security/Performance Advisor — per-item review (2026-10-28)

> Scope: footmate-beta production **read-only** catalog/statistics review. This is **not** real signed-JWT authentication E2E, a Data API exposure confirmation, a change approval, or a claim that the Advisor warnings are resolved.

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
3. **Leaked-password protection:** The organization is on **Free**. Per [Supabase password-security documentation](https://supabase.com/docs/guides/auth/password-security), breached-password protection requires Pro or above. No billing change without an owner cost decision.
4. **No-policy tables:** `beta_match_reminder_marks` and `beta_public_config` both have RLS on, zero policies, and no `anon`/`authenticated` SELECT/INSERT/UPDATE/DELETE grants. Treat as intentionally server-only; do not add permissive policies.

## Acceptance boundary

This static, read-only **per-item assessment is complete**, but Issue #611 stays open. Required follow-up: authenticated session E2E, Data API exposed-schema confirmation, billing decision, and representative live caller/plan evidence. No schema, grants, data, secrets, account, or billing changes were performed.
