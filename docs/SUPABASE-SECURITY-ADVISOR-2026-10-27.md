# FootMate Supabase Security Advisor · 2026-10-27 disposition

Scope: production Supabase project `footmate-beta` (`iihitfjphowjplxzfxtn`), read-only DB catalog and `BEGIN READ ONLY ... ROLLBACK` role tests. These tests exercise PostgreSQL roles with **simulated** JWT claims; they are **not** signed-token Auth API or browser/device integration tests.

## Live checks and findings

| Advisor | Current result | Evidence / safe action |
| --- | --- | --- |
| `auth_rls_initplan` | **0** after applied migration `20261027122602` | Eleven original policies use `(select auth.jwt())`; existing operator AAL2/ownership tests passed before and after |
| `authenticated_security_definer_function_executable` | **20 WARN** | All 20 are intentionally executable by authenticated beta clients; **0** have effective `anon` EXECUTE. All 20 pin `search_path=public, pg_temp`. The [runtime negative test](../tests/database/definer-rpc-readonly-guards.sql) proves all ten `operator_*` calls reject nonoperators (even AAL2) and operators at AAL1, and eight auth-dependent entry points reject a missing user ID. WARNING IS NOT REMOVED and this is not a comprehensive proof of function-body safety |
| `rls_enabled_no_policy` | **2 INFO** | `beta_public_config` and `beta_match_reminder_marks` have RLS enabled and no direct `anon`/`authenticated` SELECT/INSERT grant. Do not add general-user policies to quiet this |
| `extension_in_public` | **1 WARN**, `pg_net` | `pg_net` is installed in `public` and **the installed version reports `relocatable=false`**. Its `net` schema has effective USAGE and HTTP GET/POST EXECUTE for both `anon` and `authenticated`; this does not itself establish PostgREST schema exposure. Scheduling functions `configure_beta_email_worker_schedule` and `configure_beta_push_worker_schedule` reference `net.http_*`. Do not attempt `ALTER EXTENSION SET SCHEMA`, reinstall, or revoke calls until cron dependencies and Data API-exposed schemas are tested. Review this remaining exposure deliberately; advisor is not cleared |
| `auth_leaked_password_protection` | **1 WARN** | Project organization is **`free` / `tier_free`** as reported by the connected Supabase organization API. Supabase documents breached-password rejection as a **Pro-and-above** feature. A billing plan change and Auth setting adjustment were **not** authorized/performed. See owner-only action below |
| `unused_index` | **8 INFO** | Few beta rows and no workload observation; do not DROP indexes on the basis of this report |

## Reproducible tests

Run `tests/database/definer-rpc-readonly-guards.sql` through an authorized admin SQL editor on a **known compatible test fixture**. It uses a read-only transaction and deliberately never invokes any stateful function successfully. It checks:

1. Twenty authenticated SECURITY DEFINER functions, zero anon grants, explicit search paths.
2. Ten operator RPCs: a nonoperator with AAL2 is denied `OPERATOR_REQUIRED`; an operator with AAL1 is denied `MFA_REQUIRED`.
3. Eight authenticated RPCs: an absent user ID is denied `AUTH_REQUIRED`; discovery event budget with no user returns false.

The SQL checks assume the current count of 20 functions, ten `operator_*` functions, and existing operator/nonoperator pilot profiles. If the API changes, update the contract only after reviewing every new function's permissions and authorization, not by relaxing the expected counts. The SQL uses a mocked `request.jwt.claims` setting inside PostgreSQL; separately validate real signed tokens, authentication recovery, MFA session claims, role changes and actual HTTP calls in a controlled environment.

The existing [RLS role matrix](../tests/database/rls-operator-readonly-roles.sql) covers anon, ordinary member, participant, operator AAL1/AAL2 reads. Both scripts are checked by `Regression 36`, but CI checks their **source contracts**, not a live Supabase connection.

## Owner-only blocked action: leaked password protection

Current Supabase organization is Free. If the owner elects to upgrade to Pro or above, then in [Authentication → Sign In / Providers](https://supabase.com/dashboard/project/iihitfjphowjplxzfxtn/auth/providers) open Email and enable leaked-password protection, save, then rerun the [Security Advisor](https://supabase.com/dashboard/project/iihitfjphowjplxzfxtn/advisors/security). This requires a plan/billing decision and appropriate dashboard permissions. **Do not claim the feature is enabled** until the advisor confirms the notice has disappeared. [Supabase password-security documentation](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

## Release rule for #611

Do not blanket-REVOKE authenticated EXECUTE on intended user/operational RPCs or switch them to SECURITY INVOKER without end-to-end tests: participation, waitlist, email retry, notifications and operator workflows may break. Do not relocate/reinstall `pg_net` or introduce broad RLS policies to suppress informational warnings. Keep issue #611 open for Auth Pro decision, network privilege/data API exposure review, and signed-session/full lifecycle tests.
