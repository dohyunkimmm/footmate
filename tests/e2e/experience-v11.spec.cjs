const { test, expect } = require('@playwright/test');

async function waitForDemo(page) {
  await page.goto('/demo', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.goScreen === 'function' && document.querySelectorAll('.screen').length === 39);
  const onboarding = page.locator('#demoOnboarding');
  if (await onboarding.isVisible()) await page.locator('.demo-onboarding-start').click();
}

test('v1.1 experience layer is loaded in demo and case study', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('link[href*="case-study-experience-v11.css"]')).toHaveCount(1);
  await expect(page.locator('#fmV11Release')).toContainText('v1.1');
  await expect(page.locator('#fmDecisionSummary')).toContainText('Design System');

  await waitForDemo(page);
  await expect(page.locator('link[href*="footmate-experience-v11.css"]')).toHaveCount(1);
  const tokens = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return {
      brand: style.getPropertyValue('--fm-brand').trim(),
      surface: style.getPropertyValue('--fm-surface').trim(),
      radius: style.getPropertyValue('--fm-radius-lg').trim()
    };
  });
  expect(tokens.brand).toBe('#2F6FD3');
  expect(tokens.surface).toBe('#FFFFFF');
  expect(tokens.radius).toBe('18px');
});

for (const viewport of [
  { name: 'compact-320', width: 320, height: 700 },
  { name: 'iphone-375', width: 375, height: 812 },
  { name: 'mobile-390', width: 390, height: 844 }
]) {
  test(`core flow remains usable at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await waitForDemo(page);

    for (const id of ['s-home', 's-detail', 's-pay', 's-gameday', 's-postgame', 's-profile']) {
      await page.evaluate(screenId => window.goScreen(screenId), id);
      await expect(page.locator(`#${id}`)).toHaveClass(/active/);

      const geometry = await page.evaluate(screenId => {
        const active = document.getElementById(screenId);
        const layout = document.querySelector('.prototype-layout');
        const rect = layout?.getBoundingClientRect();
        const primary = active?.querySelector('.btn-primary, button');
        const primaryRect = primary?.getBoundingClientRect();
        return {
          viewportWidth: window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          layoutLeft: rect?.left ?? 0,
          layoutRight: rect?.right ?? 0,
          buttonHeight: primaryRect?.height ?? 0
        };
      }, id);

      expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.viewportWidth + 1);
      expect(geometry.layoutLeft).toBeGreaterThanOrEqual(-1);
      expect(geometry.layoutRight).toBeLessThanOrEqual(geometry.viewportWidth + 1);
      expect(geometry.buttonHeight).toBeGreaterThanOrEqual(24);
    }
  });
}
