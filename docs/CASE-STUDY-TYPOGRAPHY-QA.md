# Case Study typography QA — 11개 섹션 현행 / 9단계 이력

## 현행 11개 섹션 수용 기준 (2026-10-13 확인)

- **우선 기준:** [11개 섹션 구성](CASE-STUDY-ELEVEN-STAGES.md), `index.html`, `src/case-study/nine-sections.{js,css}`, 실제 현행 테스트 `tests/e2e/case-study-nine-stages.spec.cjs`. 두 `nine-sections` 파일명과 테스트 파일명은 과거 호환 이름이며 화면·테스트는 11개 섹션을 사용합니다.
- **구현 검사:** 현재 테스트는 320/390/800/1440/1920px에서 11개 섹션 탐색·펼침·가로 넘침·axe를 확인합니다. 320/390/1440/1920px의 카드 텍스트 기하·행간·펼침 상태 및 일부 폭에서 대체 폰트와 CSS 텍스트 두 배 확대를 점검하며, 1920px에서 모션·모션 감소 설정을 검사합니다. 검사 파일의 실제 assertions가 우선하며 이 항목은 CI 실행 성공을 새로 보증하지 않습니다.
- **최근 변경:** [#619](https://github.com/dohyunkimmm/footmate/pull/619)는 1920px 데스크톱 카드·표 글자, 간격, 모션을 다듬었고 [#620](https://github.com/dohyunkimmm/footmate/pull/620)은 현재 사용하지 않는 CSS만 제거했습니다. 기존 9단계의 숫자형 타이포그래피 기준을 새 화면에 그대로 적용하지 않습니다.
- **검증 한계:** 자동 CSS 텍스트 확대는 실제 브라우저 배율 200%의 사람 검수와 다릅니다. 전체 화면의 시각적 합격·운영 배포 일치는 별도 증빙 없이는 단정하지 않습니다.

## 과거 9단계 QA 기록 (2026-10-08 당시 기준, 현행 수용 기준 아님)

### Text roles
The root case study keeps its 34px desktop title and 13px narrative body. Desktop journey-map and table content use a 13px minimum, journey labels 11px, and flow descriptions/figure captions 12px. These are project readability decisions, not WCAG minimum font-size claims. The document continues to scroll normally, with its scrollbar hidden.

P3 uses shared, content-sized subgrid rows above 1100px. Cards share heading tracks above 800px. This allows wrapping and increased text sizes to expand the content without independently shifting corresponding headings or row boundaries. Existing small-screen layouts remain in place.

### Required automated checks
Run `npx playwright test --project=chromium tests/e2e/case-study-nine-stages.spec.cjs`.

- Eight widths (320, 390, 800, 801, 1100, 1101, 1440, 1920), all nine sections, opened details, ordinary and forced-fallback fonts.
- Text-role minimum sizes, leading, descendant text geometry, ancestor clipping, title typography, and root horizontal overflow.
- Corresponding journey row top/bottom boundaries and card heading starts within 2 CSS pixels.
- Text-only 200% adaptation at 390, 801, 1101 and 1440px. This scales computed text size, line height and tracking; it is not a claim of testing real browser UI zoom.
- User text-spacing overrides at those widths: line height 1.5, paragraph spacing 2em, letter spacing .12em, word spacing .16em.
- Negative controls deliberately introduce clipping/invalid leading and a shifted journey row, confirming the audits detect failures.
- Required Inter 500/700/800 and Noto Sans KR 400/700/800 loading is reported separately for Latin/Korean samples. A missing external font is explicitly classified as fallback coverage, never as verified webfont coverage.

The existing 320px responsive test covers narrow reflow separately from the text-only adaptation test. Wide data tables may scroll inside their labelled, keyboard-focusable regions.

### Evidence and human review
At 390 and 1440px, capture every section in webfont-requested and forced-fallback contexts, including expanded details. Attach geometry reports and font-dependent line-count/height differences. Existing title audits flag more than three lines and unusually short final lines; these are review findings, not automatic copy rewrites.

Review flagged Korean meaning breaks, isolated trailing words, heading hierarchy and reading density in the attached screenshots. Compare section geometry and screenshots with the previous release's CI artifacts. Do not update a visual expectation just to silence a regression. Screenshot evidence is not a pixel-baseline pass/fail gate.

### Accessibility references
- https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html
- https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html
- https://www.w3.org/WAI/WCAG22/Understanding/reflow.html

These checks improve coverage but do not, by themselves, certify full WCAG conformance.
