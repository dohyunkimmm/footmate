# FootMate

FootMate is an interactive service-planning prototype for explainable futsal matching, Matchday continuity, operations states, QA, and deployment validation.

## Current release state

- **Current protected main:** `77d47d6be6f854af8bc480cf063753346fd0f48e` (`docs(v3.0): sync verified release state (#82)`)
- **Current stable product/runtime baseline:** `cf766cb047b23ef302f06a80429765f45511bdcf`
- **Exact verified Vercel Production:** `cf766cb047b23ef302f06a80429765f45511bdcf` · `dpl_51Gki6ZZhy2shP6QH9U1yifT98zG` · `READY`
- **Render backup current main:** `77d47d6be6f854af8bc480cf063753346fd0f48e` · `dep-dan38j0jo6nc7395r60g` · `LIVE`
- **Latest verified main QA:** FootMate QA #263 · run `35428389979` · PASS

`main` can move for docs/QA-only changes while the product/runtime baseline remains unchanged. A docs-only Vercel ignored build is not an exact Production verification.

## Stable v3.0 baseline

The current stable experience remains available at:

- Case Study: `/`
- Product: `/demo`
- Portfolio reviewer mode: `/demo?mode=portfolio`

The stable Product baseline preserves the v2.8 Matchday visual identity and the v3.0 Unified App Architecture over the 39-screen compatibility surface. Matching, ELO, decision, payment, and persistence semantics remain owned by `src/v2/domain/` and the existing compatibility layers.

## Next Major candidate — Matchday Companion

A new candidate experience is being developed separately on PR #83 and is **not yet promoted to stable Production**. The current candidate route is `/next` after merge/deployment verification.

The redesign reframes FootMate from a match-search prototype into a **Matchday Companion** around five user actions:

`Find → Decide → Join → Play → Return`

Key changes in the candidate:

- Guest-first entry: `Value → Preferences → Recommendation → Detail → Sign in to Join`
- Recommendation cards prioritize human-readable fit reasons such as level, distance, and open position instead of leading with a percentage score
- Match detail uses one primary participation CTA and orders information around the decision users need to make
- Sign in combines **ID/password login + Kakao · Naver · Apple · Google SSO UI**, with account creation available from the sign-in surface
- The selected match and preference context remain intact across sign in → checkout → participation confirmation
- Home changes by participation state: discover → upcoming → matchday → postgame
- Real App, Guided Case Study, and Evidence modes are separated so reviewer/debug language does not appear in the user-facing app
- Case Study narrative is reorganized around Problem → Persona/JTBD → Product Thesis → Design Decisions → Recovery → System Evidence → Validation → Limits

### Authentication scope

The candidate implements the sign-in, sign-up, account-gate, and session-state UX. **Kakao/Naver/Apple/Google OAuth, a real member database, and server authentication sessions are not integrated.** These remain simulated product-planning states and must not be described as live external integrations.

## QA policy

Protected `main` follows:

`branch → PR → GitHub Actions QA → merge → exact Production verification`

PR QA uses GitHub Actions first to preserve Vercel quota. Preview deployments are not required unless visual or Production-like verification specifically needs them.

For the Next Major candidate, QA covers:

- existing v2.4–v3.0 architecture/regression contracts
- exact v2.8 39-screen visual parity baseline for the stable `/demo`
- guest-first recommendation flow
- account login + SSO + sign-up surface
- selected-match continuity through sign in and checkout
- Real App / Guided / Evidence isolation
- responsive widths 320 / 375 / 390 / 430
- axe serious/critical accessibility gate
- Case Study mobile vertical scrolling and embedded `/next` interaction

## Implementation reality

FootMate is an interactive service-planning prototype using rules, sample data, and session/local state. It does **not** currently integrate a real external AI model, database, payment processor, realtime capacity backend, notification backend, or OAuth provider.

## Release history

Durable release details are maintained in [`docs/RELEASE-HISTORY.md`](docs/RELEASE-HISTORY.md). Temporary deployment queue, quota, retry, canceled-preview, or rate-limit conditions are intentionally not recorded as long-term product state.
