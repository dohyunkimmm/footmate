# FootMate Release History

## v4.0.0 — Matchday Companion · 2026-09-19

**Status:** Official Major release. Product/runtime + public-surface baseline `fa150f183f6a821edd04e49c3496559e5ebecc8e` passed FootMate QA #318 (run `35447147842`) including v4 release boundary, Browser E2E + axe, responsive/state gates and exact Vercel Production HTTP/Chromium verification. Vercel deployment `dpl_ALtasaHtBQZZthkEgMtxomN2p4GP` is **READY** and Render deployment `dep-dan989e8bjmc73abijrg` is **LIVE** at the same SHA.

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
- v4 browser, responsive, accessibility, state and exact Production gates

### Scope boundary

This is an interactive service-planning prototype. External AI inference, member DB, real OAuth, real payment gateway, realtime capacity and notification backend are not connected. Recommendation and state transitions use rules, sample data and local/session state.

### Legacy handling

Pre-v4 runtime/source/test/checker material is removed from the current public branch and current product narrative. GitHub commit history remains historical repository data while the repository itself is public; it is not a current release surface.
