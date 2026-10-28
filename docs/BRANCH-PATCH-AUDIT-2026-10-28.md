# Git branch patch-equivalence audit — 2026-10-28

## Subsequent independently verified backup and deletion-benefit finding (2026-10-28)

The original patch-equivalence matrix below remains a historical snapshot. Later [PR #722](https://github.com/dohyunkimmm/footmate/pull/722) added a reproducible Git history audit; [PR #724](https://github.com/dohyunkimmm/footmate/pull/724) generated an intentionally one-time, **verified full-ref** `git bundle` using [Actions #40610280210](https://github.com/dohyunkimmm/footmate/actions/runs/40610280210), on `main` SHA `435585341a9aa748ccb96883b39589862cba0ea3`.

- Archive ZIP GitHub artifact [#12782910625](https://github.com/dohyunkimmm/footmate/actions/runs/40610280210/artifacts/12782910625): 142,816,059 bytes, expires **2026-11-04 UTC**; SHA-256 `6d9a02415fbae38d010369b17068619b2ab6128daca6460f0408983e58518be8`.
- The ZIP was also copied into the private ChatGPT File Library; this is separate from the expiring Actions artifact, but **is not proof of owner-controlled durable external backup or retention guarantees**. Keep a separate durable owner-managed copy before authorizing branch deletion.
- Independent clean bare-repository restore succeeded: 121 remote branch refs and one release tag recovered; `main` and **all eight candidate tip SHAs** matched; `git fsck --full --no-reflogs` passed. No remote branch ref changed.
- A further **simulation on the restored repository** computed reachability excluding only the six patch-equivalent branches whose historical PRs merged: their unique reachable objects were **six commit objects, no blobs or trees** (sum of six `objectsize:disk` entries **435 bytes**, not actual reclaimable GitHub size). Excluding all eight instead would remove eight commits and one tree, **no blobs**; the two closed-unmerged branches **must remain preserved** absent explicit approval.
- Deleting these candidate branches would not remove the large historical screenshot blobs retained by other refs/history. **Do not delete branches just to chase repository size; no `main` rewrite or bulk pruning.**
- The single-use `[one-time-bundle]` *push trigger* has served its purpose and was retired in a subsequent cleanup PR. Manual `workflow_dispatch` with `make_temporary_bundle=true` remains as the opt-in rebuild path; it still creates a seven-day artifact, not an owner-retained backup.

**Open gate:** independently owner-retain the verified archive, review any external reference to original SHAs, and obtain explicit deletion authorization. Without that, keep Issues [#525](https://github.com/dohyunkimmm/footmate/issues/525) and [#611](https://github.com/dohyunkimmm/footmate/issues/611) open where applicable.

## Verified full-clone results

- **Source:** [GitHub Actions #40604043505](https://github.com/dohyunkimmm/footmate/actions/runs/40604043505) — `Audit all Git branch patches (read only)`, **SUCCESS**, on `main db418ff6768a2029134808da2a88b05905e931e5`.
- [Full TSV artifact](https://github.com/dohyunkimmm/footmate/actions/runs/40604043505/artifacts/12780555911): `patches.tsv` and `tree-equality.tsv`; uploaded 2026-10-28, **30-day artifact retention**. Store outside Actions before expiry if the complete evidence is needed.
- Full Git clone fetched all `origin/*` refs; compared exactly **120 non-main branches**, with `git cherry origin/main <branch>` and an exact working-tree comparison. No ref deletion, force push or repository history rewrite in this audit.

| Result | Count | Treatment |
| --- | ---: | --- |
| Ancestry-contained (`ahead=0`) | **0** | No new ancestry-safe branch deletion candidates |
| Patch-equivalent (`ahead>0`, `patch_unique=0`) | **8** | Review old PR and original Git SHA; patch equality does **not** preserve old object identity |
| At least one unique patch | **112** | Preserve branch; do not prune automatically |
| Exact branch-tip tree equal to current main | **0** | No tree-identical candidates |

## All eight patch-equivalent-review candidates (NOT approved for deletion)

The individual `git cherry` output showed **ahead=1, patch_unique=0, patch_equivalent=1** for all eight. `behind` is relative to audit base `db418ff`, not current release head.

| Branch (origin/) | Exact original tip SHA | Behind | Historical PR | Outcome |
| --- | --- | ---: | --- | --- |
| `chore/retry-cardcopy-production` | `11e3299e0c2e73714b053586cde7bc85c879fa3b` | 225 | [#469](https://github.com/dohyunkimmm/footmate/pull/469) | **Closed, not merged — preserve** |
| `chore/retry-vercel-deploy` | `75c390b648542780ca0515e7637a0fbb0d28c99c` | 604 | [#12](https://github.com/dohyunkimmm/footmate/pull/12) | Merged — archive / original-object check before pruning |
| `docs/add-evidence-index` | `2b3ff9efece25c66c8b5bb0959a24091a1739bd8` | 607 | [#9](https://github.com/dohyunkimmm/footmate/pull/9) | Merged — archive / original-object check |
| `docs/add-verification-matrix` | `afd0e049a010f4128ba05f2ef6cbe4cae1615f60` | 608 | [#8](https://github.com/dohyunkimmm/footmate/pull/8) | Merged — archive / original-object check |
| `docs/footmate-closeout` | `febb351d477950971365a708caa6b3aeca073bcf` | 603 | [#13](https://github.com/dohyunkimmm/footmate/pull/13) | Merged — archive / original-object check |
| `docs/sync-final-qa` | `e051486c6c2fc5b2826bdd1eee3e08331a443e29` | 611 | [#5](https://github.com/dohyunkimmm/footmate/pull/5) | Merged — archive / original-object check |
| `docs/sync-qa-record` | `56c716e36fcc30d6cab9fbe2a7cc157bc08d3e1e` | 609 | [#7](https://github.com/dohyunkimmm/footmate/pull/7) | Merged — archive / original-object check |
| `qa/webkit-my-selector-20260928` | `8223f9c295a39c2d88d951ab6f9f44fee2851777` | 305 | [#375](https://github.com/dohyunkimmm/footmate/pull/375) | **Closed, not merged — preserve** |

All eight branches were independently rechecked through GitHub's branch API as **unprotected**. Historical closed-but-unmerged status makes #469 and #375 especially unsuitable for automatic pruning even though Git reports patch equivalence. `git cherry` matches a patch ID; it is **not proof of full merge semantics**, original SHA reachability, or absence of external users.

## Repository size and safety

At audit time `git count-objects -v` on the full clone reported **12,199 packed Git objects, one pack, `size-pack=139864` KiB (~136.6 MiB)**, no local garbage objects reported. The GitHub repository API reported about **136.21 MiB**, while the then-current working-tree blob sum was roughly **6.33 MiB**; these metrics are different and **cannot estimate reclaimable history** from a ref delete. We did not rewrite protected main history or purge Git objects.

**Required follow-up:** before any further deletion, create an off-repository `git bundle` backup covering candidate tip SHAs, check release/CI/environment references and PR ownership, confirm current tip SHA and `git cherry` findings again, and get explicit owner decision for history preservation. No bulk or automated deletion of these 120 diverged refs.

Previously deleted `docs/compact-demo-release-654` (actual ancestor of main, ahead 0, PR #654 merge tip) was a **different, already completed** one-ref cleanup, verified by [Actions #40597913047](https://github.com/dohyunkimmm/footmate/actions/runs/40597913047).

The audit workflow `.github/workflows/audit-branch-patches.yml` remains checked in as the reproducible source of this read-only report. It does not run on ordinary pushes (path filter only fires if the workflow itself changes). Avoid treating its retention-limited artifacts as a durable backup.
