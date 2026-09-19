# FootMate Release History

## v4.0.0 — Matchday Companion · 2026-09-19

**Status:** Official Major release. Verified release baseline `fcb01400ecc6ee34bd70bf2da9c1ee8b114375f9` passed FootMate QA #316 (run `35445575340`) and exact Vercel Production HTTP/Chromium verification. Vercel deployment `dpl_AAvMY6CCkf8GpsFTVoir38TNxELh` is READY and Render deployment `dep-dan8p7e8bjmc73ab4os0` is LIVE at the same SHA.

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

Pre-v4 product/source material is removed from the current public branch and from the current product narrative. GitHub commit history remains historical repository data while the repository is public; it is not a current release surface.
