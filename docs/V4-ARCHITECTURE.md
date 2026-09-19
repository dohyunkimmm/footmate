# FootMate v4.0 Architecture

## Product contract

FootMate v4.0 defines the product as a **Matchday Companion** rather than a screen collection. The primary journey is:

`Find → Decide → Join → Play → Return`

The release separates three audiences without mixing reviewer language into the real product surface.

- Real App: `/app`
- Guided: `/app?mode=guided`
- Evidence: `/app?mode=evidence`

## Runtime ownership

- `app.html` — official v4 entry and release metadata
- `src/v4/app.js` — route/state/render ownership
- `src/v4/data.js` — release metadata, sample match contract, persisted session defaults
- `src/v4/real-app-experience.js` — account/sign-up presentation layer
- `src/v4/release-hardening.js` — validation, detail-return navigation, check-in persistence and guest identity hardening
- `src/v4/app.css` + `real-app-experience.css` — Deep Pitch / Off-white / Charcoal + Lime visual system
- `index.html` + `src/v4/case-study*` — product-first Case Study

## State model

The user-facing state is intentionally small and explainable:

- `setupComplete`
- `region`
- `position`
- `level`
- `selectedMatchId`
- `signedIn`
- `joinedMatchId`
- `matchStage: discover | upcoming | matchday | postgame`
- persisted check-in completion in the v4 interaction state

Normal, empty, error, retry and recovery states are represented at the UX-contract level; external services are not fabricated.

## Data / matching boundary

The current v4 UI uses sample match records and deterministic client-side state. Historical Matching/ELO domain logic under `src/v2/domain/` remains a regression/reference boundary but is not presented as an external AI integration. A future backend can replace sample providers without changing the user-facing state contract.

## Integration boundary

Not connected in v4.0:

- external AI/ML inference
- member database
- OAuth provider APIs
- payment gateway
- realtime match capacity
- notification backend
- operator console backend

These are represented only where necessary to validate interaction and recovery contracts.

## Compatibility

`/demo` and `/next` remain compatibility aliases to the official v4 Real App. They no longer expose the pre-v4 product surface. Pre-v4 implementation is retained only as repository regression/history material where required by engineering QA.
