const { test, expect } = require('@playwright/test');

async function boot(page) {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/demo', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__footmateV2 === true);
}

async function visualContract(page, id) {
  await page.evaluate(screenId => window.goScreen(screenId), id);
  await expect(page.locator(`#${id}`)).toHaveClass(/active/);

  return page.locator(`#${id}`).evaluate(screen => {
    const box = screen.getBoundingClientRect();
    const primary = screen.querySelector('.btn-primary:not([hidden])');
    const primaryBox = primary?.getBoundingClientRect();
    const card = screen.querySelector('.card,.match-card,.profile-menu-item,.profile-elo-card,.ticket,.result-card');
    const cardStyle = card ? getComputedStyle(card) : null;
    const tab = screen.querySelector('.tab-bar');
    const tabBox = tab?.getBoundingClientRect();
    return {
      width: Math.round(box.width * 100) / 100,
      height: Math.round(box.height * 100) / 100,
      overflowX: screen.scrollWidth - screen.clientWidth,
      primaryHeight: primaryBox ? Math.round(primaryBox.height * 100) / 100 : null,
      cardRadius: cardStyle ? parseFloat(cardStyle.borderRadius) || 0 : null,
      tabHeight: tabBox ? Math.round(tabBox.height * 100) / 100 : null
    };
  });
}

test('v2 visual contract stays stable across representative product screens', async ({ page }) => {
  await boot(page);

  const tokens = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return {
      brand: style.getPropertyValue('--fm-color-brand-500').trim(),
      surface: style.getPropertyValue('--fm-color-surface').trim(),
      controlRadius: style.getPropertyValue('--fm-radius-control').trim(),
      cardRadius: style.getPropertyValue('--fm-radius-card').trim(),
      space2: style.getPropertyValue('--fm-space-2').trim()
    };
  });

  expect(tokens).toEqual({
    brand: '#356FC7',
    surface: '#FFFFFF',
    controlRadius: '14px',
    cardRadius: '18px',
    space2: '8px'
  });

  const contracts = {};
  for (const id of ['s-home', 's-detail', 's-pay', 's-profile']) {
    contracts[id] = await visualContract(page, id);
    expect(contracts[id].width, `${id} width`).toBeGreaterThan(330);
    expect(contracts[id].width, `${id} width`).toBeLessThanOrEqual(375);
    expect(contracts[id].height, `${id} height`).toBeGreaterThan(700);
    expect(contracts[id].overflowX, `${id} horizontal overflow`).toBeLessThanOrEqual(1);
    if (contracts[id].primaryHeight != null) {
      expect(contracts[id].primaryHeight, `${id} primary target`).toBeGreaterThanOrEqual(44);
    }
    if (contracts[id].cardRadius != null) {
      expect(contracts[id].cardRadius, `${id} card radius`).toBeGreaterThanOrEqual(10);
    }
  }

  expect(contracts['s-home'].tabHeight).toBeGreaterThanOrEqual(70);
  expect(contracts['s-profile'].tabHeight).toBeGreaterThanOrEqual(70);
});
