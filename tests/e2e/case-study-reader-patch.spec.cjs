const {test,expect}=require('@playwright/test');
const snapshot='b97898d86a8e18450f9bac1ced51209f64545bee';
async function open(page,url='/'){
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(url);
  await page.waitForFunction(()=>document.documentElement.dataset.fmColorInteractionPolish==='true');
  await page.evaluate(()=>document.fonts.ready);
}
const active=page=>page.locator('.slide.on');

test('section links survive reload, history and canonicalize section numbers',async({page})=>{
  await open(page,'/?review=1#section-06');
  await expect(active(page)).toHaveAttribute('data-page-number','6');
  await expect(page.locator('.toc-item.on .toc-t')).toHaveText('Recommendations');
  await page.locator('.btn-next').click();await expect(page).toHaveURL(/\?review=1#section-07$/);
  await page.locator('.btn-next').click();await expect(active(page)).toHaveAttribute('data-page-number','8');
  await page.goBack();await expect(active(page)).toHaveAttribute('data-page-number','7');
  await expect(page.locator('.btn-next .fm-control-destination b')).toHaveText('Sign-in & Join');
  await page.goForward();await expect(active(page)).toHaveAttribute('data-page-number','8');
  await page.reload();await expect(active(page)).toHaveAttribute('data-page-number','8');
  await page.evaluate(()=>{location.hash='section-99';});
  await expect(active(page)).toHaveAttribute('data-page-number','13');
  await expect(page).toHaveURL(/#section-13$/);await expect(page.locator('.btn-next')).toBeDisabled();
  await page.evaluate(()=>{location.hash='section-0';});
  await expect(active(page)).toHaveAttribute('data-page-number','1');
  await expect(page).toHaveURL(/#section-01$/);
});

test('local examples own arrow keys and keep reading navigation separate',async({page})=>{
  await open(page,'/#section-06');
  const preset=page.locator('.slide.on [data-reco-preset]');
  await expect(preset.first()).toBeEnabled();await preset.first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(preset.nth(1)).toBeFocused();await expect(preset.nth(1)).toHaveAttribute('aria-pressed','true');
  await expect(active(page)).toHaveAttribute('data-page-number','6');
  await expect(active(page).locator('.fm-mock-match').first()).toHaveAttribute('data-match-id','giheung-2000');
  await page.keyboard.press('Home');await expect(preset.first()).toBeFocused();
  await expect(preset.first()).toHaveAttribute('aria-pressed','true');
  await page.keyboard.press('PageDown');await expect(active(page)).toHaveAttribute('data-page-number','6');
  await page.locator('.toc-item').nth(9).click();
  const retry=active(page).locator('[data-recovery-action="retry"]');
  const choose=active(page).locator('[data-recovery-action="choose"]');
  await retry.focus();await page.keyboard.press('ArrowRight');await expect(choose).toBeFocused();
  await expect(active(page).locator('.fm-recovery-demo')).toHaveAttribute('data-recovery-state','failed');
  await page.keyboard.press('Space');await expect(active(page).locator('.fm-recovery-demo')).toHaveAttribute('data-recovery-state','choose');
  await expect(active(page)).toHaveAttribute('data-page-number','10');
  await page.evaluate(()=>document.activeElement.blur());
  await page.keyboard.press('ArrowRight');await expect(active(page)).toHaveAttribute('data-page-number','11');
  await expect(page).toHaveURL(/#section-11$/);
});

test('readable evidence, compact architecture and pinned source links retain fixed white pages',async({page})=>{
  await open(page);
  for(let i=0;i<13;i++){
    await page.locator('.toc-item').nth(i).click();
    await expect.poll(()=>active(page).evaluate(n=>n.scrollHeight-n.clientHeight)).toBeLessThanOrEqual(1);
    expect(await active(page).evaluate(n=>getComputedStyle(n).backgroundColor)).toBe('rgb(255, 255, 255)');
    const codeLinks=await active(page).locator('a[href*="github.com/dohyunkimmm/footmate/blob/"]').evaluateAll(nodes=>nodes.map(n=>n.href));
    expect(codeLinks.every(href=>href.includes('/blob/'+snapshot+'/'))).toBeTruthy();
  }
  await page.locator('.toc-item').nth(5).click();
  await expect(active(page).locator('.fm-p0-annotations')).toContainText('이 목업의 비교에는 미적용');
  await page.locator('.toc-item').nth(9).click();
  const crop=active(page).locator('[data-evidence-crop="empty-actions"]');
  await expect(crop).toContainText('핵심 영역 확대');
  const evidence=await crop.locator('img').evaluate(n=>({width:n.getBoundingClientRect().width,source:n.getAttribute('src')}));
  expect(evidence.width).toBeGreaterThan(300);expect(evidence.source).toContain('recovery-discovery-empty.png');
  await page.locator('.toc-item').nth(10).click();
  await expect(active(page).locator('.fm-next-review-summary')).toBeHidden();
  await expect(active(page).locator('.fm-processing-path')).toBeVisible();
  await expect(active(page).locator('.fm-owner-column')).toHaveCount(3);
  await expect(active(page).locator('.fm-p0-arch-node')).toHaveCount(6);
  const title=await active(page).evaluate(n=>(parseFloat(getComputedStyle(n.querySelector('h2')).fontSize))*(parseFloat(getComputedStyle(n.querySelector('.fm-next-story')).zoom)||1));
  expect(title).toBeGreaterThanOrEqual(30);
});
