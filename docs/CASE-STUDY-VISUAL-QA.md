# Case Study UI, UX and Visual QA

## 현행 11개 섹션 검토 기준 (2026-10-13 확인)

- [CASE-STUDY-ELEVEN-STAGES.md](CASE-STUDY-ELEVEN-STAGES.md)를 현재 구성의 기준으로 사용합니다. 01 Overview부터 11 Reflection까지 11개 섹션이며 07은 현재 Demo를 바탕으로 재구성한 홈·경기 찾기·상세·참가 확인·MY 와이어프레임 5개와 Figma 링크를 제공합니다. 과거 제작 당시 원본으로 표현하지 않습니다.
- 320/390/800/1440/1920px에서 11개 섹션·목차 이동·직접 링크·키보드·펼침 상태·가로 넘침·axe 검사를 대상으로 합니다. 현재 `tests/e2e/case-study-nine-stages.spec.cjs`는 이름만 이전 9단계에서 유지됐고 11개 섹션을 검증합니다.
- 1920×1080에서 기본/펼침 화면과 07 와이어프레임 확대·표의 읽기 순서·표시 정보·키보드 초점·모션 감소를 검토합니다. 해당 자동화/캡처 수행은 사람이 모든 화면을 승인했다는 뜻이 아닙니다.
- [#616](https://github.com/dohyunkimmm/footmate/pull/616)~[#620](https://github.com/dohyunkimmm/footmate/pull/620)의 현행 구성/시각 수정은 과거 9단계 항목보다 우선합니다. Case Study 코드·Demo·Beta는 이 문서 갱신만으로 변경되지 않습니다.

## 과거 9단계 QA 지침 (2026-10-08 당시 기준, 현행 승인 기준 아님)

The nine-stage case study uses native vertical scrolling. Visual review covers content relationships, emphasis, evidence accuracy and mobile navigation in addition to typography.

### Evidence accuracy
- Home and detail images are implementation records. Prices shown are sample match fees; the demo involves no real payment.
- The obsolete payment-failure image is removed from P6. Its replacement is explicitly labeled a recovery-flow summary, not a captured product screen.
- Product metrics remain labeled as measurement preparation, distinct from task records and development QA.

### Visual review
Review all nine sections at desktop and mobile widths, including expanded details.
Check hierarchy, related component alignment, whitespace, image and copy agreement, primary versus deferred emphasis, and navigation discoverability.
Keep dark green for key principles and actions, lime for the primary action or highest priority, subdued surfaces for support and deferred scope.
Do not add unverified results, change evidence claims, or compress text to fit a viewport.

### Evidence reading and mobile records (2026-10-08)
- P1/P6 product previews remain recognizable at desktop and mobile sizes; P6 compact previews must not leave large empty gaps beside their explanations.
- Open P1/P6 evidence in a named image dialog with the full product screen available. For the Home enlarged image, crop only the presentation backdrop, not the product screen. Review image scroll by keyboard, Escape dismissal, named close control, restored trigger focus, and background scroll containment.
- On mobile, P7 development-QA records must show the issue, change and verification item together in vertically readable records with accessible table roles and cell labels. Retain the desktop comparison table rather than hiding its verification column off-screen.
- Confirm P8's shorter heading preserves its meaning and font size; the KPI table should avoid redundant nested horizontal padding.

### Automated coverage
Existing navigation, axe, typography, fallback-font, 200% text and text-spacing checks remain.
Additional checks cover removal of obsolete payment evidence, recovery-summary labeling, visible active mobile contents after Next navigation, and six ordered flow steps.
The #548 browser checks additionally cover image-dialog keyboard scrolling, Escape, focus restoration and axe, and complete 320px mobile QA records. Manual visual review remains separate from automated pass results.
Screenshots require visual review; geometry and accessibility checks cannot judge overall design quality.
