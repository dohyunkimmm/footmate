# Nine-stage typography QA

## Text roles
The root case study keeps its 34px desktop title and 13px narrative body. Desktop journey-map and table content use a 13px minimum, journey labels 11px, and flow descriptions/figure captions 12px. These are project readability decisions, not WCAG minimum font-size claims. The document continues to scroll normally, with its scrollbar hidden.

P3 uses shared, content-sized subgrid rows above 1100px. Cards share heading tracks above 800px. This allows wrapping and increased text sizes to expand the content without independently shifting corresponding headings or row boundaries. Existing small-screen layouts remain in place.

## Required automated checks
Run `npx playwright test --project=chromium tests/e2e/case-study-nine-stages.spec.cjs`.

- Eight widths (320, 390, 800, 801, 1100, 1101, 1440, 1920), all nine sections, opened details, ordinary and forced-fallback fonts.
- Text-role minimum sizes, leading, descendant text geometry, ancestor clipping, title typography, and root horizontal overflow.
- Corresponding journey row top/bottom boundaries and card heading starts within 2 CSS pixels.
- Text-only 200% adaptation at 390, 801, 1101 and 1440px. This scales computed text size, line height and tracking; it is not a claim of testing real browser UI zoom.
- User text-spacing overrides at those widths: line height 1.5, paragraph spacing 2em, letter spacing .12em, word spacing .16em.
- Negative controls deliberately introduce clipping/invalid leading and a shifted journey row, confirming the audits detect failures.
- Required Inter 500/700/800 and Noto Sans KR 400/700/800 loading is reported separately for Latin/Korean samples. A missing external font is explicitly classified as fallback coverage, never as verified webfont coverage.

The existing 320px responsive test covers narrow reflow separately from the text-only adaptation test. Wide data tables may scroll inside their labelled, keyboard-focusable regions.

## Evidence and human review
At 390 and 1440px, capture every section in webfont-requested and forced-fallback contexts, including expanded details. Attach geometry reports and font-dependent line-count/height differences. Existing title audits flag more than three lines and unusually short final lines; these are review findings, not automatic copy rewrites.

Review flagged Korean meaning breaks, isolated trailing words, heading hierarchy and reading density in the attached screenshots. Compare section geometry and screenshots with the previous release's CI artifacts. Do not update a visual expectation just to silence a regression. Screenshot evidence is not a pixel-baseline pass/fail gate.

## Accessibility references
- https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html
- https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html
- https://www.w3.org/WAI/WCAG22/Understanding/reflow.html

These checks improve coverage but do not, by themselves, certify full WCAG conformance.
