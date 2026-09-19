# FootMate v3.0 Unified App Architecture

## Release intent

v3.0 is the major product-structure release that promotes FootMate from a 39-screen prototype navigation model to a unified application architecture while preserving the verified v2.8 domain, state, decision, payment, persistence, and visual baseline contracts.

## Primary information architecture

The user-facing app chrome is organized around four primary destinations:

- **Discover (`discover`)** — today’s matches and filtering (`s-home`, `s-filter`)
- **Recommendations (`recommendations`)** — ranked results, match detail, and recommendation reasons (`s-results`, `s-detail`, `s-reason`)
- **Participation (`participation`)** — payment, confirmation, check-in, match day, result, evaluation, and ELO update flows
- **My (`profile`)** — profile, messages, friends, notifications, and settings

The existing 39 routes remain available as compatibility routes. v3.0 changes the navigation model and application chrome; it does not delete the verified scenario coverage.

## Ownership boundaries

- `src/v3/release.js` — public v3 release adapter and runtime promotion
- `src/v3/app-shell.js` — app shell lifecycle and route-to-destination synchronization
- `src/v3/ia/navigation.js` — four-destination IA and route mapping
- `src/v3/components/` — reusable app navigation, contextual header, and primitives
- `src/v3/state/view-state.js` — v3-only view state; domain state stays in the v2.8 runtime
- `src/v3/styles/` — unified app tokens, responsive shell, and reusable component presentation

## Preserved contracts

- Product and Portfolio modes
- 39 compatibility screens
- 16-slide Case Study
- Matching / ELO domain ownership in `src/v2/domain/`
- Decision / recovery semantics
- Payment and participation semantics
- Scenario and decision-trace persistence
- storage/schema/event contract `2.1.0`
- v2.8 Matchday Visual Identity as visual regression baseline

## QA release gates

v3.0 is not considered closed until all of the following are verified:

1. v2.4–v2.8 ownership and compatibility gates remain green.
2. v3.0 architecture boundary and contract tests pass.
3. Browser E2E validates four-destination navigation, 39-route compatibility, mobile 320 px containment/touch targets, desktop responsive workspace, and axe serious/critical = 0.
4. The merged runtime SHA receives an exact Vercel Production deployment.
5. Production HTTP smoke serves the v3 runtime, IA, view-state, and style ownership files.
6. Strict Chromium Production smoke confirms the v3 runtime and responsive app shell.
7. Render auto-deploy for the merged main SHA is live.
