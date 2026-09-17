# FootMate Release History

이 문서는 FootMate의 현재 릴리스 상태와 이전 검증 기준만 간결하게 보존합니다. 세부 변경 내역은 Git commit / Pull Request / GitHub Actions 이력을 기준으로 추적합니다.

## Current — v1.1 Experience Polish

- Core v1.1 release baseline: `8d501bd`
- Release: **v1.1 · Experience Polish**
- Scope: Visual polish, UI/UX refinement, Case Study synchronization, responsive QA, accessibility refinement
- GitHub: PR #16 merged to `main`
- v1.1 UI hotfix: PR #18 consolidates the overlapping `매칭 로직 0/5` / `제품 검증` utilities into one `제품 검증` entry, hides it during onboarding, and keeps funnel progress inside the validation inspector
- Automated QA: GitHub Actions run #57 PASS; hotfix PR must also pass the same Regression / Browser / axe / responsive gates before merge
  - Regression 36 PASS
  - Browser E2E + axe PASS
  - 320 / 375 / 390 px responsive gate PASS
  - Production HTTP smoke PASS
  - Production browser render smoke PASS
- Vercel: v1.1 baseline verified / Production READY
- Production endpoints: Case Study `/` and Live Demo `/demo` HTTP 200 verified
- Manual device QA: iPhone Safari + VoiceOver and Android Chrome + TalkBack core flows checked by user; no blocking issue reported

The previous `Portfolio Freeze 2026.09.12` is a historical snapshot only. It no longer represents a development lock.

## Historical baselines

### 2026-09-12 — Portfolio close-out snapshot

- `eff58f3` — close-out documentation baseline
- GitHub required checks and Vercel Production smoke were passing at the snapshot
- This state is retained only as historical evidence

### 2026-09-11 — P0–P2 Product Hardening

- `a6cb6fe` — implementation baseline for operations state machines, recommendation explainability, event/KPI contracts, and Product Validation
- Regression / Browser E2E + axe / Production Smoke passed at this baseline

### First complete Production QA pass

- `15151a5` — first complete Production routing and smoke pass
- `1a450f2` — follow-up accessibility refinement baseline

## Documentation policy

To keep `main` readable:

- Current product description and verification status live in `README.md`.
- Release history is consolidated in this file.
- Dated QA, hardening, close-out, and per-version planning documents are removed from the working tree after their relevant facts are absorbed here.
- Deleted documents remain recoverable through Git history.
- For new major work such as v2, create one current planning/release document and fold it into this history after release instead of accumulating dated snapshots.
