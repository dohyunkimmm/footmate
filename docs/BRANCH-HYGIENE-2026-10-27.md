## Later full-clone audit · 2026-10-28

A real full-history [120-branch patch/tree audit](BRANCH-PATCH-AUDIT-2026-10-28.md) was executed successfully by [Actions #40604043505](https://github.com/dohyunkimmm/footmate/actions/runs/40604043505): **0 ahead=0; 8 patch-equivalent review candidates (6 merged PRs, 2 unmerged/closed PRs); 112 with unique patches; 0 exact-tree equals**. No further branches were deleted. The earlier claim that remaining diverged branches had not been audited was accurate at that time and is superseded by this result. **Patch equivalence is not deletion authorization**; preserve old tip SHAs with a Git bundle and inspect external refs before any future ref deletion.

# FootMate Git branch hygiene audit — 2026-10-27

## Superseding state · 2026-10-28 (verified deletion)

- [PR #718](https://github.com/dohyunkimmm/footmate/pull/718) added a strict one-shot branch prune and merged as `main a4a6bfc2ad09de0f5b9a89314e54b220060fce20`.
- The one-shot [GitHub Actions #40597913047](https://github.com/dohyunkimmm/footmate/actions/runs/40597913047) **finished SUCCESS** after validating exact tip SHA, PR #654 merge SHA, protected=false, ahead=0 and no open PR, then deleting the only target `docs/compact-demo-release-654` (SHA `81819f79d011f084c2f1aaf87d398aacae089438`).
- Re-enumerated the GitHub branches API pages 1–3: **the deleted branch is absent**, and `main` was unchanged by the prune workflow. No force rewrite. The stored [2026-10-28 pre-cleanup SHA manifest](BRANCH-REFS-2026-10-28.csv) is an **historical record, not a current ref list**; its inclusion of that deleted branch is expected.
- The **remaining diverged refs are not automatically safe to delete**. Continue patch-equivalence review using [local read-only audit script](../tests/tools/branch-hygiene.cjs), preserve relevant Git objects, and check external consumers. Issue [#525](https://github.com/dohyunkimmm/footmate/issues/525) stays open for those remaining tasks.

The older branch statuses and deletion instructions below document **earlier snapshots** and have been superseded for this one now-deleted candidate.

## Inspection boundary

- Base: `main` at `91beadd7fb6fb6a667466d4f5bff144f0f97f684`.
- Enumerated the GitHub branches API with pagination: **122 branches** in total, including `main`.
- Compared **all 121 non-main branches** against `main` using GitHub's ahead/behind comparison.
- **1 behind-only branch** (`ahead_by=0`), **120 diverged branches** (`ahead_by>0`).
- No refs were deleted, no forced history rewrite, no merged PRs were modified.
- These numbers are ancestry comparisons, **not patch-equivalence tests**. Squash-merged feature branches can retain distinct commit IDs with changes already incorporated into `main`.

## Candidate for non-destructive cleanup

| Branch | Ahead of main | Behind main | Status | Decision |
| --- | ---: | ---: | --- | --- |
| `docs/compact-demo-release-654` | 0 | 52 | `behind` | Eligible for a final ref/PR check, then deletion by a GitHub user with ref-delete permission |

The branch has no commits missing from `main` **as of the comparison**. Recheck it against the latest `main` and ensure no external workflow or human process still references it before deleting.

Other 120 branches, including historical `noop-*`, `docs/*`, `qa/*`, `fix/*`, and `feat/*`, are **not certified safe for automatic deletion**. Determine relevant PR outcome and patch equivalence (for example with `git cherry main <branch>` in a full clone) before any ref mutation. The currently connected GitHub actions do not expose a branch ref-delete operation.

## Repository size observations

- The 2026-10-27 GitHub API snapshot reported 282 blobs, approximately 6.32 MiB in the current tracked tree, versus approximately 136.38 MiB in GitHub's repository-size field.
- The difference does not identify the location or deletion safety of past blobs, objects, snapshots, or Git references. Repository-size fields and checked-out tree sizes are not directly comparable.
- The investigation cannot measure recoverable Git objects or guarantee that deleting one ref will shrink GitHub storage.

## Follow-up verification — 2026-10-27

- On `main a2037df7`, `docs/compact-demo-release-654` remains **ahead 0 / behind 54** and points to `81819f79d011f084c2f1aaf87d398aacae089438`, the already-merged commit from [PR #654](https://github.com/dohyunkimmm/footmate/pull/654).
- The only repository workflow in the current Git tree is `.github/workflows/qa.yml`, scoped to `main`; external automations and personal clones cannot be established from this scan.
- The exact user-confirmed, guarded `gh` deletion sequence (branch SHA check, ahead=0, no open PR, explicit branch-name confirmation) is recorded in [issue #525](https://github.com/dohyunkimmm/footmate/issues/525#issuecomment-6441702777). The connected GitHub app lacks ref deletion, so the branch still exists. No deletion was attempted here.
- Historical Git tree spot checks: `2049edc8` and `489ad73f`: 269 blobs / **5.20 MiB** each; `bf3aa123`: 282 blobs / **6.32 MiB**; `e5105a2f`: 284 blobs / **6.33 MiB**. Reported GitHub repository size in the latest check: **139,469 KiB (136.20 MiB)**. These samples do not quantify reachable and unreachable object storage, so no shrinkage guarantee is possible.
- The original 121-branch inventory is an earlier snapshot; later PR branches may add refs. Do not use the old counts as a live branch deletion list.

## Reproducible patch-equivalence audit (read-only)

Use [`tests/tools/branch-hygiene.cjs`](../tests/tools/branch-hygiene.cjs) in a **full local Git clone** with already-fetched `origin/*` remote-tracking refs:

```bash
git fetch origin '+refs/heads/*:refs/remotes/origin/*'
node tests/tools/branch-hygiene.cjs > branch-review.tsv
```

The script only reads local refs through `git rev-list` and `git cherry`. Its TSV includes `ahead`, `behind`, `patch_unique` and `patch_equivalent`; **it never deletes or rewrites refs**. A branch with `patch_unique=0` but `ahead>0` is **not automatically safe**: binary changes, deleted files, merges, external references and history retention must be checked separately. Branch counts depend on when refs were fetched and can change after PRs.

- Latest GitHub comparison at `main 136bb9b335993ec1c9c20616f6883873324f9a71`: `docs/compact-demo-release-654` **ahead 0 / behind 55**, tip unchanged `81819f79d011f084c2f1aaf87d398aacae089438`. It remains a qualified manual deletion candidate, not a deleted branch.
- The GitHub connector does not expose a branch ref DELETE action. Do not replace deletion with `update_ref` or force-push: either would distort historical refs. Require a separate user-authorized GitHub CLI/UI action with the safeguards recorded in [#525](https://github.com/dohyunkimmm/footmate/issues/525#issuecomment-6441702777).

## 2026-10-28 · full tip-SHA preservation snapshot

- [`BRANCH-REFS-2026-10-28.csv`](BRANCH-REFS-2026-10-28.csv) records **all 122 branch refs** returned from GitHub branch API pages 1–3 (the third page was empty), with exact tip SHA and protected flag. Snapshot base `main 8ece33712326386b9d8cbc0cf89f93a8eb5e7e3c`. This is a **ref manifest, not a backup of all Git objects**; deleting a ref can still make historical blobs unreachable. Download a `git bundle`/clone before approved deletes.
- The single previously verified ancestry-contained candidate `docs/compact-demo-release-654` still points at `81819f79d011f084c2f1aaf87d398aacae089438` and was **ahead 0 / behind 56** at this fixed base. No deletion has been executed; still check external consumers and the current upstream SHA before owner-authorized ref deletion.
- Other branch rows in the CSV are **not** individually patch-equivalence-certified. Use [`branch-hygiene.cjs`](../tests/tools/branch-hygiene.cjs) in a full clone to produce per-ref `git cherry` evidence. Never treat the snapshot alone as a branch removal allowlist.

## Required follow-up before closing #525

1. Confirm `docs/compact-demo-release-654` is unreferenced by automated/manual work, then repeat `main...branch` comparison. Delete it through authorized GitHub UI/CLI only after that check.
2. For each diverged branch, preserve its PR and unique patch history as needed; generate patch-equivalence evidence before considering deletion.
3. Inspect unreachable/large historical Git objects using an authorized clone, with backups and without rewriting `main` or invalidating release SHA/QA evidence.
4. Re-measure GitHub repository size after any approved cleanup and record actual changes.

This is an audit record, not confirmation that branches were deleted.
