# FootMate Release History

## v4.0.0 — Matchday Companion · 2026-09-19

**Status:** Official Major release. Verified runtime + public-surface baseline `130231c935958651e9e2e50e1dbda3df3df978f3` passed FootMate QA #327 (run `35449553358`), including the v4 release boundary, Browser E2E + axe, 320 / 375 / 390 / 430 responsive and state gates, 16-section Case Study editorial QA, and exact Vercel Production HTTP/Chromium verification. Vercel deployment `dpl_69iQCJKfXtC3i8ZwWqKvLjJcfdEh` is **READY** and Render deployment `dep-dan9ujrtqb8s73abvdjg` is **LIVE** at the same verified runtime SHA.

FootMate v4.0 promotes Matchday Companion to the official product and Case Study baseline.

### Release scope

- Official Real App `/app`
- Case Study `/`
- `/demo` and `/next` compatibility aliases serve v4.0 only
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
- Exact Vercel Production: `dpl_69iQCJKfXtC3i8ZwWqKvLjJcfdEh` · SHA `130231c935958651e9e2e50e1dbda3df3df978f3` · **READY**
- Exact Production HTTP smoke: PASS
- Exact Production Chromium smoke: PASS
- Render backup: `dep-dan9ujrtqb8s73abvdjg` · SHA `130231c935958651e9e2e50e1dbda3df3df978f3` · **LIVE**

### Legacy handling

Pre-v4 runtime/source/test/checker material is removed from the current public branch and current product narrative. GitHub commit history remains historical repository data while the repository itself is public; it is not a current release surface.

Documentation-only merges may move `main` beyond the verified runtime SHA. The verified runtime/public baseline and exact Production SHA above remain the release verification reference until a later runtime change is promoted and re-verified.
