const { test, expect } = require('@playwright/test');

async function boot(page, mode='product') {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`/demo${mode==='portfolio'?'?mode=portfolio':''}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__footmateV3 === true && window.FootMateV3Runtime?.version === '3.0.0' && window.__footmateV2 === true);
  const intro=page.locator('#demoOnboarding');
  if(await intro.isVisible())await page.locator('.demo-onboarding-start').click();
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
    const legacyTab = screen.querySelector('.tab-bar');
    const legacyTabBox = legacyTab?.getBoundingClientRect();
    const appNav = document.getElementById('fm30AppNav');
    const appNavBox = appNav?.getBoundingClientRect();
    return {
      width: Math.round(box.width * 100) / 100,
      height: Math.round(box.height * 100) / 100,
      overflowX: screen.scrollWidth - screen.clientWidth,
      primaryHeight: primaryBox ? Math.round(primaryBox.height * 100) / 100 : null,
      cardRadius: cardStyle ? parseFloat(cardStyle.borderRadius) || 0 : null,
      legacyTabHeight: legacyTabBox ? Math.round(legacyTabBox.height * 100) / 100 : null,
      appNavHeight: appNavBox ? Math.round(appNavBox.height * 100) / 100 : null,
      currentRelease: document.documentElement.dataset.footmateCurrentRelease || null
    };
  });
}

test('v3 visual contract preserves the v2 product shell and surfaces in Product mode', async ({ page }) => {
  await boot(page, 'product');

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
    expect(contracts[id].currentRelease, `${id} current release`).toBe('3.0');
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
    expect(contracts[id].appNavHeight, `${id} Product mode v3 app navigation`).toBeNull();
  }

  expect(contracts['s-home'].legacyTabHeight).toBeGreaterThanOrEqual(72);
  expect(contracts['s-profile'].legacyTabHeight).toBeGreaterThanOrEqual(72);
});

test('v3 visual navigation ownership is isolated to Portfolio mode', async ({ page }) => {
  await boot(page, 'portfolio');
  await page.evaluate(() => window.goScreen('s-home'));
  const nav = page.locator('#fm30AppNav');
  await expect(nav).toBeVisible();
  const navHeight = await nav.evaluate(node => node.getBoundingClientRect().height);
  expect(navHeight).toBeGreaterThanOrEqual(70);
  const legacyHeight = await page.locator('#s-home .tab-bar').evaluate(node => node.getBoundingClientRect().height);
  expect(legacyHeight).toBe(0);
});
