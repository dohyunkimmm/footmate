# FootMate Product Flow QA + Design System v2 QA

## Scope

- Product route set / IA, 39-screen scope, recommendation ownership, Matching/ELO ownership, and release identifiers: unchanged
- Product review fixes: terminology display aliases, AI Match Assistant prominence, connected OAuth entry, previous-route back behavior, team-message visibility, checked-in continuation, and fresh-entry reset policy
- Product visual layer: semantic color, type, spacing, surface, control, state, navigation, responsive and motion grammar consolidated in `src/v4/design-system-v2.css`
- Existing first-party asset request budget: preserved by keeping the v4.9 compatibility design contract inline at its original cascade position and loading the v2 coherence layer last
- Existing AI fallback state contract: preserved (`#fff4d6` background / `#e0c57f` border)
- Muted tag text on the subtle surface: WCAG AA contrast raised from about 4.45:1 to about 4.65:1
- Current `main` Case Study files and baselines are preserved by rebuilding the integration branch directly on current `main`

## Functional Flow QA

`tests/e2e/v5.1-release-flow-review.spec.cjs` covers:

- fresh `/app` entry starts at the first screen
- `공격수` / `초급` / `고급` display terminology while canonical compatibility values remain internal
- Google/Kakao active-provider navigation and Naver/Apple removal
- connected OAuth callback resumes checkout
- auth/detail back actions use the actual previous-route stack
- team message is readable without hover and exposes the deterministic simulation boundary
- checked-in → postgame feedback → next match discovery

`tests/e2e/v5.1-ai-assistant.spec.cjs` distinguishes fresh entry from intentional internal recovery. AI state persistence is verified through `?resume=1`; ordinary external/fresh entry is not allowed to restore an old internal route.

## Visual Regression

Changed Product surfaces are covered by the existing Product screenshot suites plus `tests/e2e/v5.1-design-system-v2.spec.cjs` and `tests/e2e/v5.1-release-flow-review.spec.cjs`.

Baselines are generated on Ubuntu 24.04 / Chromium, reviewed, committed, and then compared again in normal PR QA with `toHaveScreenshot()`. Geometry contracts stay exact; known runner anti-alias noise is bounded to a small pixel allowance instead of accepting layout drift.

Representative Product surfaces include:

- Home 1440
- Profile 1440
- Auth 1440
- Setup 390
- AI fallback 390
- AI core feature 1440
- Personalization panel 1440
- Detail decision surface 1440
- Team message 390
- Checked-in continuation 390

Geometry contracts additionally cover:

- desktop app-shell max 560px width and center alignment
- wide-viewport Detail / Checkout / Auth / Schedule / Profile remain narrow-stack rather than switching to the rejected 1040px desktop composition
- persistent navigation center alignment
- component-role radius families and control height
- 320 / 375 / 390 / 430 horizontal overflow safety

If the current Case Study embeds an affected live Product preview, its current-main screenshot suite must pass in the same normal comparison run. An older Case Study baseline set is not substituted.

## Completion gate

Baseline generation alone is not a PASS. This change is visually verified only after normal PR Browser E2E + axe runs the committed Product and any affected current-main Case Study baselines in comparison mode successfully. Production verification is a separate post-merge gate.


## Product audit contracts

- Welcome headline color is asserted directly in the Product full surface and the Case Study cover iframe; image equality alone cannot validate readability.
- Home and Discover share compact idle AI geometry. Loading/result status remains visible, examples retain at least 11px text, and fresh users do not see a memory-personalization claim.
- At 320/375/390/430, the first match name must finish at least 8px above the actual nav top; the final card must scroll fully above navigation.
- A scrolled match-list click must open Detail at scroll position zero. Same-route updates do not reset document scroll.
- Design System CSS owns the 560px single-column Product shell with zero shell radius. `app.html` no longer carries the late desktop geometry override.
- Detail save/compare controls retain readable dark text on their light surface, including hover.
- Changed Product surfaces and Case Study covers require reviewed baselines plus a separate normal screenshot comparison. These contracts describe required QA, not a release PASS.

## Audit baseline review · 2026-09-23

- Integration base: main `d0688bd70bd2022cd1919bc47c8f84ca0b541dc1`, including #228.
- Runtime/test candidate: `319510ea3fd573c3de63d04ed5636368f99bccfe` (#229).
- Candidate workflow `35862321102`: generation 70 PASS; separate ordinary comparison 70 PASS, zero retries/failures.
- 25 changed PNGs reviewed: Welcome 390/1440; Case Study cover 1440/1728; Home/Discover mobile compositions and 1440; AI idle/loading/fallback; context actions; Detail/Checkout/Success/Auth.
- The old Case Study cover diff isolates the unreadable headline. Detail's large diff is a corrected route starting position; a separate scrolled-list navigation contract verifies scroll zero.
- At 320×844, first match name bottom: Home 751.95px / Discover 739.47px; nav top 760px. All four widths preserve >=11px AI text and last-card clearance.
- Test measurement uses instant scroll to avoid reading an intermediate smooth-scroll frame; the application retains ordinary user scrolling.
- These candidate results do not replace the required full normal PR Browser E2E + axe comparison of the committed baselines. See #229 checks for the final exact-head result. Production is not verified by this PR run.
