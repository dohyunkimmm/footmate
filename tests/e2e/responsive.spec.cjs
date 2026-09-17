const { test, expect } = require('@playwright/test');

async function boot(page, width, height, target = '/demo') {
  await page.setViewportSize({ width, height });
  await page.goto(target, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() =>
    typeof window.goScreen === 'function' &&
    document.querySelectorAll('.screen').length === 39 &&
    window.__footmateV2 === true
  );
  const onboarding = page.locator('#demoOnboarding');
  if (await onboarding.isVisible()) await page.locator('.demo-onboarding-start').click();
}

for (const viewport of [
  { name: '320', width: 320, height: 700 },
  { name: '375', width: 375, height: 812 },
  { name: '390', width: 390, height: 844 },
  { name: '430', width: 430, height: 932 }
]) {
  test(`v2 product mode remains usable at ${viewport.name}px`, async ({ page }) => {
    await boot(page, viewport.width, viewport.height);

    await expect(page.locator('.top-bar')).toBeHidden();
    await expect(page.locator('.flow-nav')).toBeHidden();
    await expect(page.locator('#v3Launcher')).toBeHidden();

    for (const id of ['s-splash', 's-home', 's-detail', 's-pay', 's-profile']) {
      await page.evaluate(screenId => window.goScreen(screenId), id);
      const screen = page.locator(`#${id}`);
      await expect(screen).toHaveClass(/active/);
      const box = await screen.boundingBox();
      expect(box).not.toBeNull();
      expect(box.width).toBeGreaterThan(250);
      expect(box.height).toBeGreaterThan(500);

      const primary = screen.locator('.btn-primary:visible').first();
      if (await primary.count()) {
        const target = await primary.boundingBox();
        if (target) expect(target.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
}

test('v2 portfolio validation remains usable at 375px', async ({ page }) => {
  await boot(page, 375, 812, '/demo?mode=portfolio');
  await page.evaluate(() => window.goScreen('s-home'));

  const launcher = page.getByRole('button', { name: '제품 검증 패널 열기' });
  await expect(launcher).toBeVisible();
  const launcherBox = await launcher.boundingBox();
  expect(launcherBox).not.toBeNull();
  expect(launcherBox.height).toBeGreaterThanOrEqual(44);

  await launcher.click();
  const inspector = page.locator('#fmProductInspector');
  await expect(inspector).toHaveAttribute('aria-hidden', 'false');
  const inspectorBox = await inspector.locator('.fm-inspector-card').boundingBox();
  expect(inspectorBox).not.toBeNull();
  expect(inspectorBox.width).toBeLessThanOrEqual(376);
});
