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

Baselines are generated on Ubuntu 24.04 / Chromium, reviewed, committed, and then must be compared again in normal PR QA with `toHaveScreenshot()` and `maxDiffPixels: 0`.

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

- desktop app-shell width and center alignment
- persistent navigation center alignment
- component-role radius families and control height
- 320 / 375 / 390 / 430 horizontal overflow safety

If the current Case Study embeds an affected live Product preview, its current-main screenshot suite must pass in the same normal comparison run. An older Case Study baseline set is not substituted.

## Completion gate

Baseline generation alone is not a PASS. This change is visually verified only after normal PR Browser E2E + axe runs the committed Product and any affected current-main Case Study baselines in comparison mode successfully. Production verification is a separate post-merge gate.