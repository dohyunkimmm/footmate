# FootMate Git branch hygiene audit — 2026-10-27

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

## Required follow-up before closing #525

1. Confirm `docs/compact-demo-release-654` is unreferenced by automated/manual work, then repeat `main...branch` comparison. Delete it through authorized GitHub UI/CLI only after that check.
2. For each diverged branch, preserve its PR and unique patch history as needed; generate patch-equivalence evidence before considering deletion.
3. Inspect unreachable/large historical Git objects using an authorized clone, with backups and without rewriting `main` or invalidating release SHA/QA evidence.
4. Re-measure GitHub repository size after any approved cleanup and record actual changes.

This is an audit record, not confirmation that branches were deleted.
