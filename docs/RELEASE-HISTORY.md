# FootMate Release History

## v4.0.0 — Matchday Companion · 2026-09-19

**Status:** Major promotion merged only after required QA. Exact Vercel Production verification: **Not yet verified** until post-merge release verification finishes.

FootMate v4.0 promotes the redesigned Matchday Companion experience to the official product baseline.

### Release scope

- Official Real App entry: `/app`
- Case Study entry: `/`
- Compatibility aliases `/demo` and `/next` serve the v4.0 surface; the previous public Product/Portfolio routes are no longer current release surfaces.
- Guest-first flow: Value → Preferences → Recommendation → Detail → Sign in → Checkout → Matchday
- Real App / Guided / Evidence modes
- ID/password + sign-up validation, SSO selection UI, selected-match continuity
- Entry-aware detail back navigation
- Persistent check-in completion state
- Product-first 16-section Case Study
- v4.0-specific browser, responsive, accessibility and exact Production gates

### Scope boundary

This remains an interactive service-planning prototype. External AI model inference, member DB, real OAuth, real payment gateway, realtime capacity and notification backend are not connected. Recommendation and state transitions use rules, sample data and local/session state.

### Previous releases

Pre-v4 releases are archived as regression/history references and are intentionally removed from the current public product narrative and long-lived release documentation. Exact historical implementation remains available through repository history where GitHub visibility permits; it is not presented as the current product.
