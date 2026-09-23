# FootMate Design System v2 QA

## Scope

- Product IA, routes, copy, state machines, recommendation / participation ownership, release identifiers: unchanged
- Product visual layer: semantic color, type, spacing, surface, control, state, navigation, responsive and motion grammar consolidated in `src/v4/design-system-v2.css`
- Existing first-party asset request budget: preserved by keeping the v4.9 compatibility design contract inline at its original cascade position and loading the v2 coherence layer last
- Existing AI fallback state contract: preserved (`#fff4d6` background / `#e0c57f` border)
- Muted tag text on the subtle surface: WCAG AA contrast raised from about 4.45:1 to about 4.65:1

## Visual Regression

Changed Product surfaces are covered by the existing Product screenshot suites plus `tests/e2e/v5.1-design-system-v2.spec.cjs`.

The Design System v2 baseline set is generated on Ubuntu 24.04 / Chromium, reviewed for representative desktop/mobile composition, committed, and then must be compared again in normal PR QA with `toHaveScreenshot()` and `maxDiffPixels: 0`.

Representative reviewed Product surfaces:

- Home 1440
- Profile 1440
- Auth 1440
- Setup 390
- AI fallback 390
- Personalization panel 1440
- Detail decision surface 1440

The Case Study cover contains a live Product preview, so the Product design-system change also affects its cover screenshot. The dependent Case Study cover baselines are therefore refreshed and reviewed at:

- 1728 × 900
- 1440 × 900
- 390 × 844

Geometry contracts additionally cover:

- desktop app-shell width and center alignment
- persistent navigation center alignment
- component-role radius families and control height
- 320 / 375 / 390 / 430 horizontal overflow safety

## Completion gate

Baseline generation alone is not a PASS. Design System v2 is considered visually verified only after normal PR Browser E2E + axe runs the committed Product and dependent Case Study baselines in comparison mode successfully.
