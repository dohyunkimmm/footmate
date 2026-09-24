const { test } = require('@playwright/test');
const fs = require('node:fs');

const OUT = 'visual-review-output';
fs.mkdirSync(OUT, { recursive: true });

async function selectSection(page, index) {
  await page.evaluate((i) => {
    const items = [...document.querySelectorAll('.toc-item')].filter((el) => el.dataset.csHidden !== 'true');
    items[i]?.click();
  }, index);
  await page.waitForTimeout(120);
}

async function captureSet(page, width, height, label) {
  await page.setViewportSize({ width, height });
  await page.goto('/');
  await page.waitForFunction(() => document.documentElement.dataset.footmateCaseStudySections === '13');
  for (let i = 0; i < 13; i += 1) {
    await selectSection(page, i);
    await page.screenshot({
      path: `${OUT}/${label}-${String(i + 1).padStart(2, '0')}.png`,
      fullPage: false,
      animations: 'disabled'
    });
  }
}

test('capture current 13-section case study desktop and mobile', async ({ page }) => {
  await captureSet(page, 1440, 900, 'desktop');
  await captureSet(page, 390, 844, 'mobile');
});
