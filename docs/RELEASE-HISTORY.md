# FootMate Release History

이 문서는 FootMate의 현재 릴리스 상태와 이전 검증 기준만 간결하게 보존합니다. 세부 변경 내역은 Git commit / Pull Request / GitHub Actions 이력을 기준으로 추적합니다.

## Current development — v2.0.0-beta.1 Product Experience Architecture

- Product/runtime baseline: `70102da`
- GitHub: PR #19 merged to `main`
- Scope:
  - native ES module runtime boundary under `src/v2/`
  - Product / Portfolio mode separation
  - versioned v2 UI state and active-screen observer
  - canonical v2 design tokens
  - responsive gate expanded to 430 px
  - GitHub Actions Node 24 migration
- Product logic compatibility: Matching / ELO / Payment / Operations state machines unchanged
- GitHub Actions run #69:
  - Regression 36 PASS
  - Browser E2E + axe PASS
  - Product / Portfolio mode PASS
  - 320 / 375 / 390 / 430 px responsive gate PASS
  - Production HTTP smoke PASS
  - Production Chromium render smoke PASS
- Vercel: `70102da` verified commit / Production READY

## v1.1 — Experience Polish

- Core release baseline: `8d501bd`
- UI hotfix baseline: `ec3f8cf`
- PR #16: Visual polish, UI/UX refinement, Case Study synchronization, responsive/accessibility refinement
- PR #18: overlapping `매칭 로직 0/5` / `제품 검증` controls consolidated and onboarding overlap removed
- GitHub Actions run #64: Regression 36 / Browser E2E + axe / responsive / Production smoke PASS
- Vercel: `ec3f8cf` verified / Production READY
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
- During active major work, one current release/planning document may live in `docs/`.
- Dated QA, hardening, close-out, and per-version planning documents are removed after their relevant facts are absorbed here.
- Deleted documents remain recoverable through Git history.
