# FootMate Release History

## v4.3.0 — Decision Detail · 2026-09-20

**Status:** Verified staged feature release. Product/runtime baseline `5f21bdaac8ab68fe5ccbf323caef0ffdb4213746` passed FootMate QA #351 (run `35476071931`), including Regression 36, Recommendation Core regression, Discovery & Search regression, Decision Detail disclosure/save/compare E2E, Browser E2E + axe, responsive/state/Case Study gates, and exact Vercel Production HTTP + Chromium verification. Vercel deployment `dpl_G2Bg6oTEq4LJDWetzwoXYQtXMz6K` is **READY** and Render deployment `dep-danhjl7lk1mc73fd27u0` is **LIVE** at the same exact SHA at release verification time.

v4.3 builds on the verified v4.2 Discovery & Search release by turning match detail into the actual participation-decision surface. Recommendation evidence, participant/position composition, facility and operation information, refund timing, availability context, save intent and comparison are brought into one decision flow without changing the v4.1 recommendation or v4.2 discovery contracts.

### Release scope

- recommendation reason breakdown on Match Detail
- clearly disclosed prototype sample remaining-seat and participant-position composition
- facility / operating-rule / gear information with sample-data disclosure
- cancellation / refund timing visualization using the existing prototype policy boundary
- non-exaggerated availability wording; sample capacity is not presented as realtime inventory
- persistent save intent stored in `footmate:v4:decision`
- max-two-match comparison state and accessible comparison dialog
- Escape close and focus restore for compare interaction
- `참가하기` retained as the participation-contract primary CTA while save/compare remain secondary intents
- v4.1 Recommendation Core and v4.2 Discovery & Search remain regression contracts
- 16-section Case Study updated with Decision Detail evidence

### Release verification

- Decision Detail PR #99: final PR QA #350 · run `35475947701` · PASS
- Verified product/runtime baseline: `5f21bdaac8ab68fe5ccbf323caef0ffdb4213746`
- Post-merge QA + exact Production verification: FootMate QA #351 · run `35476071931` · PASS
- Exact Vercel Production: `dpl_G2Bg6oTEq4LJDWetzwoXYQtXMz6K` · SHA `5f21bdaac8ab68fe5ccbf323caef0ffdb4213746` · **READY**
- Exact Production HTTP smoke: PASS
- Exact Production Chromium smoke: PASS
- Render backup: `dep-danhjl7lk1mc73fd27u0` · SHA `5f21bdaac8ab68fe5ccbf323caef0ffdb4213746` · **LIVE at verification time**

### Scope boundary

This remains an interactive service-planning prototype. Recommendation is deterministic rules-based ranking over sample records; Discovery is deterministic filtering/sorting over those records with browser/URL persistence. Decision Detail capacity, participant composition and facility information are explicit sample data. External AI inference, member DB, real OAuth, real payment gateway, realtime capacity, realtime participant data and notification backend are not connected.

### Next staged release

v4.4 is **Join & Payment State Machine**: explicit auth → checkout → confirmation states, pending/success/failure/retry/cancel recovery, payment-method simulation, duplicate-submit protection, selected-match/price/policy snapshot consistency and reload-safe participation state.

## v4.2.0 — Discovery & Search · 2026-09-20

**Status:** Verified staged feature release. Product/runtime baseline `896be56a2e2438fd383c46152ad8f1d5f11e89b0` passed FootMate QA #344 (run `35473666410`), including Regression 36, recommendation regression, Discovery filter/sort/persistence/recovery E2E, Browser E2E + axe, responsive/state/Case Study layout gates, and exact Vercel Production HTTP + Chromium verification. Vercel deployment `dpl_oiHYN6EaeNumD3GsmQKDQyjt6xpg` is **READY** and Render deployment `dep-dangrd17lnhs73e7cr40` was **LIVE** at the same exact SHA at release verification time.

v4.2 builds on the verified v4.1 Recommendation Core by turning recommendation into a starting point for user-controlled exploration. Users can narrow currently relevant matches without losing the underlying explainable recommendation contract.

### Release scope

- date / time / distance / price / available-position filters on 경기 찾기
- fit / distance / closing-soon sorting
- active filter summary with per-filter removal and clear-all
- zero-result recovery with condition widening and full reset
- discovery state persistence through `footmate:v4:discovery` and `d_*` URL query parameters
- responsive mobile filter sheet with dialog semantics, Escape close, focus trap/restore and 44px+ targets
- v4.1 region / position / level recommendation scoring retained as the ranking baseline
- 16-section Case Study updated with Discovery & Search journey and zero-result recovery evidence
- existing guest-first auth timing, recommendation explanations, selected-match continuity, detail-return navigation, match-specific check-in, responsive layout, Case Study panel sizing and accessibility remain regression gates

### Release verification

- Discovery & Search PR #97: final PR QA #343 · run `35473512165` · PASS
- Verified product/runtime baseline: `896be56a2e2438fd383c46152ad8f1d5f11e89b0`
- Post-merge QA + exact Production verification: FootMate QA #344 · run `35473666410` · PASS
- Exact Vercel Production: `dpl_oiHYN6EaeNumD3GsmQKDQyjt6xpg` · SHA `896be56a2e2438fd383c46152ad8f1d5f11e89b0` · **READY**
- Exact Production HTTP smoke: PASS
- Exact Production Chromium smoke: PASS
- Render backup: `dep-dangrd17lnhs73e7cr40` · SHA `896be56a2e2438fd383c46152ad8f1d5f11e89b0` · **LIVE at verification time**

### Scope boundary

This remains an interactive service-planning prototype. Recommendation is deterministic rules-based ranking over sample records; Discovery is deterministic filtering/sorting over those records with browser/URL persistence. External AI inference, member DB, real OAuth, real payment gateway, realtime capacity and notification backend are not connected.

### Next staged release

v4.3 is **Decision Detail**: recommendation reason breakdown, participant/position composition, facility and operation rules, cancellation/refund policy hierarchy, non-exaggerated availability urgency, and save/compare intent states.

## v4.1.0 — Recommendation Core · 2026-09-20

**Status:** Verified staged feature release. Product/runtime baseline `352ffe08a72e145311e043f1292950d8a3041859` passed FootMate QA #339 (run `35456762270`), including Regression 36, preference-aware recommendation E2E, Browser E2E + axe, responsive/state/Case Study layout gates, and exact Vercel Production HTTP + Chromium verification. Vercel deployment `dpl_HyZn9wb5boHQ3wZTUNMFsuMSRkVC` is **READY** and Render deployment `dep-danbvlvavr4c73aab5s0` is **LIVE** at the same exact SHA.

v4.1 starts the staged v4.1 → v5.0 product evolution plan by connecting the preferences collected in the guest-first setup to actual recommendation ordering and human-readable recommendation reasons.

### Release scope

- region / position / level preferences now change the actual recommendation order
- explainable deterministic ranking uses living area fit, level gap, preferred-position availability and distance
- internal fit values are used for sorting and QA evidence; the product UI remains reason-first rather than exposing a numeric score as the primary decision signal
- Home / Discover / Detail share the same recommendation contract
- sample match coverage expanded across Suwon, Yongin and Seoul to make preference changes observable
- deterministic QA profiles verify that different preference combinations produce different top matches
- Case Study Decision 02 now documents that recommendation reasons are backed by actual ranking behavior
- existing v4.0.1 guest-first auth timing, selected-match continuity, detail-return navigation, match-specific check-in, responsive layout, Case Study panel sizing and accessibility remain regression gates
- staged roadmap added in `docs/V4.1-V5.0-ROADMAP.md`

### Release verification

- Recommendation Core PR #95: final PR QA #338 · run `35456601863` · PASS
- Verified product/runtime baseline: `352ffe08a72e145311e043f1292950d8a3041859`
- Post-merge QA + exact Production verification: FootMate QA #339 · run `35456762270` · PASS
- Exact Vercel Production: `dpl_HyZn9wb5boHQ3wZTUNMFsuMSRkVC` · SHA `352ffe08a72e145311e043f1292950d8a3041859` · **READY**
- Exact Production HTTP smoke: PASS
- Exact Production Chromium smoke: PASS
- Render backup: `dep-danbvlvavr4c73aab5s0` · SHA `352ffe08a72e145311e043f1292950d8a3041859` · **LIVE**

### Scope boundary

This remains an interactive service-planning prototype. The v4.1 Recommendation Core is deterministic rules-based ranking over sample match records and browser/session state. External AI inference, member DB, real OAuth, real payment gateway, realtime capacity and notification backend are not connected.

### Next staged release

v4.2 is **Discovery & Search**: filters, sorting, zero-result recovery and persisted discovery state. It starts only after this v4.1 durable release sync is merged and verified as a documentation-only change.

## v4.0.1 — Matchday Companion hardening · 2026-09-19

**Status:** Verified patch release. Product/runtime baseline `b2509f5759194ab0db46a8c5429f3b422e9c59d8` passed FootMate QA #333 (run `35455137726`), including Regression 36, Browser E2E + axe, responsive/state/editorial gates, and exact Vercel Production HTTP + Chromium verification. Vercel deployment `dpl_AEtpPnZpPQqTXA4DhUuRB7yJgzE8` is **READY** and Render deployment `dep-danbgvbtqb8s73adkk00` was **LIVE** at the same exact SHA at release verification time.

v4.0.1 hardens the official Matchday Companion experience and current repository structure without changing the core Find → Decide → Join → Play → Return product thesis.

### Release scope

- Guided / Evidence “Real App만 보기” returns to the official `/app` surface
- stale candidate / next-version public copy removed from the v4 runtime
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
- Exact Vercel Production: `dpl_AEtpPnZpPQqTXA4DhUuRB7yJgzE8` · SHA `b2509f5759194ab0db46a8c5429f3b422e9c59d8` · **READY at verification time**
- Exact Production HTTP smoke: PASS
- Exact Production Chromium smoke: PASS
- Render backup: `dep-danbgvbtqb8s73adkk00` · SHA `b2509f5759194ab0db46a8c5429f3b422e9c59d8` · **LIVE at verification time**

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
