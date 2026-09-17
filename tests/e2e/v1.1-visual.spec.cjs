const { test, expect } = require('@playwright/test');

async function bootDemo(page) {
  await page.goto('/demo', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.goScreen === 'function' && document.querySelectorAll('.screen').length === 39);
  const onboarding = page.locator('#demoOnboarding');
  if (await onboarding.isVisible()) await page.locator('.demo-onboarding-start').click();
}

async function expectViewportFit(page) {
  const metrics = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    shell: (() => {
      const rect = document.querySelector('.device-shell')?.getBoundingClientRect();
      return rect ? { left: rect.left, right: rect.right, width: rect.width } : null;
    })()
  }));
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);
  expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);
  expect(metrics.shell).not.toBeNull();
  expect(metrics.shell.left).toBeGreaterThanOrEqual(-1);
  expect(metrics.shell.right).toBeLessThanOrEqual(metrics.innerWidth + 1);
}

async function expectTouchHeight(locator, minimum = 44) {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  expect(box.height).toBeGreaterThanOrEqual(minimum);
}

test('v1.1 design layer loads and representative screens fit the viewport', async ({ page }) => {
  await bootDemo(page);
  await expect(page.locator('link[href*="footmate-v1.1.css"]')).toHaveCount(1);

  const token = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--fm-brand-700').trim());
  expect(token).toBe('#173F8F');

  for (const id of ['s-home', 's-detail', 's-pay', 's-gameday', 's-postgame', 's-eloUpdate', 's-profile']) {
    await page.evaluate(screenId => window.goScreen(screenId), id);
    await expect(page.locator(`#${id}`)).toHaveClass(/active/);
    await expectViewportFit(page);
  }
});

test('representative interactive controls keep mobile-friendly touch height', async ({ page }) => {
  await bootDemo(page);

  await page.evaluate(() => window.goScreen('s-home'));
  await expectTouchHeight(page.locator('#s-home .day-tab').first());

  for (const id of ['s-detail', 's-pay']) {
    await page.evaluate(screenId => window.goScreen(screenId), id);
    await expectTouchHeight(page.locator(`#${id} .btn-primary`).first());
  }

  await page.evaluate(() => window.goScreen('s-gameday'));
  await expectTouchHeight(page.locator('#s-gameday .gameday-scenario-btn').first());

  await page.evaluate(() => window.goScreen('s-profile'));
  await expectTouchHeight(page.locator('#s-profile .profile-menu-item').first());
});

test('case study exposes the v1.1 iteration without rewriting the baseline source', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!document.getElementById('fmV11VersionNote'));
  await expect(page.locator('link[href*="index-v1.1.css"]')).toHaveCount(1);
  await expect(page.locator('#fmV11VersionNote')).toContainText('v1.1');
  await expect(page.locator('#fmDecisionSummary')).toContainText('Design System');
});
