# Case Study UI, UX and Visual QA

The nine-stage case study uses native vertical scrolling. Visual review covers content relationships, emphasis, evidence accuracy and mobile navigation in addition to typography.

## Evidence accuracy
- Home and detail images are implementation records. Prices shown are sample match fees; the demo involves no real payment.
- The obsolete payment-failure image is removed from P6. Its replacement is explicitly labeled a recovery-flow summary, not a captured product screen.
- Product metrics remain labeled as measurement preparation, distinct from task records and development QA.

## Visual review
Review all nine sections at desktop and mobile widths, including expanded details.
Check hierarchy, related component alignment, whitespace, image and copy agreement, primary versus deferred emphasis, and navigation discoverability.
Keep dark green for key principles and actions, lime for the primary action or highest priority, subdued surfaces for support and deferred scope.
Do not add unverified results, change evidence claims, or compress text to fit a viewport.

## Evidence reading and mobile records (2026-10-08)
- P1/P6 product previews remain recognizable at desktop and mobile sizes; P6 compact previews must not leave large empty gaps beside their explanations.
- Open P1/P6 evidence in a named image dialog with the full product screen available. For the Home enlarged image, crop only the presentation backdrop, not the product screen. Review image scroll by keyboard, Escape dismissal, named close control, restored trigger focus, and background scroll containment.
- On mobile, P7 development-QA records must show the issue, change and verification item together in vertically readable records with accessible table roles and cell labels. Retain the desktop comparison table rather than hiding its verification column off-screen.
- Confirm P8's shorter heading preserves its meaning and font size; the KPI table should avoid redundant nested horizontal padding.

## Automated coverage
Existing navigation, axe, typography, fallback-font, 200% text and text-spacing checks remain.
Additional checks cover removal of obsolete payment evidence, recovery-summary labeling, visible active mobile contents after Next navigation, and six ordered flow steps.
The #548 browser checks additionally cover image-dialog keyboard scrolling, Escape, focus restoration and axe, and complete 320px mobile QA records. Manual visual review remains separate from automated pass results.
Screenshots require visual review; geometry and accessibility checks cannot judge overall design quality.
