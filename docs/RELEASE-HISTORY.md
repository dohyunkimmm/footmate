# FootMate Release History

## v4.0.1 — Matchday Companion hardening · 2026-09-19

**Status:** Verified patch release. Product/runtime baseline `b2509f5759194ab0db46a8c5429f3b422e9c59d8` passed FootMate QA #333 (run `35455137726`), including Regression 36, Browser E2E + axe, responsive/state/editorial gates, and exact Vercel Production HTTP + Chromium verification. Vercel deployment `dpl_AEtpPnZpPQqTXA4DhUuRB7yJgzE8` is **READY** and Render deployment `dep-danbgvbtqb8s73adkk00` is **LIVE** at the same exact SHA.

v4.0.1 hardens the official Matchday Companion experience and current repository structure without changing the core Find → Decide → Join → Play → Return product thesis.

### Release scope

- Guided / Evidence “Real App만 보기” returns to the official `/app` surface
- stale candidate / next-version public copy removed from the v4 runtime and Case Study narrative
- fixed calendar dates replaced by clearly disclosed date-safe sample schedules
- match-specific check-in persistence prevents state leakage between matches
- SPA screen transitions move programmatic focus to the active screen
- account validation, detail-return continuity and check-in safeguards consolidated into `src/v4/experience.js`
- redundant current-tree root HTML copies and split runtime hardening files removed while `/demo` and `/next` remain compatibility aliases
- v4 QA/checker filenames normalized around the official v4 release
- Case Study right-side companion panels enlarged and rebalanced on desktop; 901–1180px uses a full-width companion row instead of a squeezed narrow column
- Matchday / Recovery / Outcome / final-scope structured content restored as explicit card/grid layouts

### Release verification

- Runtime/repository hardening PR #92: merged main `27e6c8e4b3d463665b1158c7299c5ff6bd8ed36b`; PR QA passed. Its first post-merge exact Production run exposed a stale smoke-test path to the removed `release-hardening.js`, not a product-runtime failure.
- Case Study layout + Production smoke closure PR #93: PR QA #332 · run `35454879661` · PASS
- Verified product/runtime baseline: `b2509f5759194ab0db46a8c5429f3b422e9c59d8`
- Post-merge QA + exact Production verification: FootMate QA #333 · run `35455137726` · PASS
- Exact Vercel Production: `dpl_AEtpPnZpPQqTXA4DhUuRB7yJgzE8` · SHA `b2509f5759194ab0db46a8c5429f3b422e9c59d8` · **READY**
- Exact Production HTTP smoke: PASS
- Exact Production Chromium smoke: PASS
- Render backup: `dep-danbgvbtqb8s73adkk00` · SHA `b2509f5759194ab0db46a8c5429f3b422e9c59d8` · **LIVE**

### Scope boundary

This remains an interactive service-planning prototype. External AI inference, member DB, real OAuth, real payment gateway, realtime capacity and notification backend are not connected. Recommendation and state transitions use rules, sample data and browser/local session state.

### Repository handling

The current public branch keeps the official v4 source and QA contract. Redundant current-tree files are removed or consolidated; historical Git commit data is unchanged and remains visible while the repository is public.

## v4.0.0 — Matchday Companion · 2026-09-19

**Status:** Official Major release. Verified runtime + public-surface baseline `130231c935958651e9e2e50e1dbda3df3df978f3` passed FootMate QA #327 (run `35449553358`), including the v4 release boundary, Browser E2E + axe, 320 / 375 / 390 / 430 responsive and state gates, 16-section Case Study editorial QA, and exact Vercel Production HTTP/Chromium verification. Vercel deployment `dpl_69iQCJKfXtC3i8ZwWqKvLjJcfdEh` was the verified Production deployment for this baseline and Render deployment `dep-dan9ujrtqb8s73abvdjg` was the matching live backup deployment at release verification time.

FootMate v4.0 promoted Matchday Companion to the official product and Case Study baseline.

### Release scope

- Official Real App `/app`
- Case Study `/`
- `/demo` and `/next` compatibility aliases serve v4 only
- Guest-first Value → Preferences → Recommendation → Detail → Sign in → Checkout → Matchday flow
- Real App / Guided / Evidence separation
- account/sign-up validation and SSO selection UI
- selected-match continuity and entry-aware back navigation
- persistent matchday check-in state
- product-first 16-section Case Study
- source-level Case Study editorial cleanup with Korean text-flow hardening, mobile overflow coverage, desktop/mobile review evidence and WCAG axe gate
- v4 browser, responsive, accessibility, state and exact Production gates

### Scope boundary

This is an interactive service-planning prototype. External AI inference, member DB, real OAuth, real payment gateway, realtime capacity and notification backend are not connected. Recommendation and state transitions use rules, sample data and local/session state.

### Release verification

- PR #90 editorial/release closeout QA: FootMate QA #326 · run `35449028478` · PASS
- Merged runtime/public baseline: `130231c935958651e9e2e50e1dbda3df3df978f3`
- Post-merge QA + exact Production verification: FootMate QA #327 · run `35449553358` · PASS
- Exact Vercel Production: `dpl_69iQCJKfXtC3i8ZwWqKvLjJcfdEh` · SHA `130231c935958651e9e2e50e1dbda3df3df978f3` · **READY at verification time**
- Exact Production HTTP smoke: PASS
- Exact Production Chromium smoke: PASS
- Render backup: `dep-dan9ujrtqb8s73abvdjg` · SHA `130231c935958651e9e2e50e1dbda3df3df978f3` · **LIVE at verification time**

### Legacy handling

Pre-v4 runtime/source/test/checker material is removed from the current public branch and current product narrative. GitHub commit history remains historical repository data while the repository itself is public; it is not a current release surface.

Documentation-only merges may move `main` beyond the verified runtime SHA. The verified runtime/public baseline and exact Production SHA above remain the release verification reference until a later runtime change is promoted and re-verified.
