const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
const ready=async page=>{await page.goto('/');await page.waitForFunction(()=>document.documentElement.dataset.fmConciseReady==='true');await page.evaluate(()=>document.fonts.ready);};
for(const [width,height] of [[1920,1080]]){
  test(`seven-page case study stays readable and accessible at ${width}px`,async({page})=>{
    await page.setViewportSize({width,height});await ready(page);
    await expect(page.locator('.track>.slide')).toHaveCount(7);
    await expect(page.locator('.toc-item')).toHaveCount(7);
    await expect(page.locator('.fm-next-cover h1')).toContainText('내 수준에 맞는 경기부터');
    await expect(page.locator('.fm-cs-real-home-preview')).toBeVisible();
    await expect(page.getByRole('link',{name:'제품 직접 체험하기'})).toHaveAttribute('href','/demo');
    for(let i=0;i<7;i++){
      if(width>900)await page.locator('.toc-item').nth(i).click();
      else await page.locator('.slide').nth(i).scrollIntoViewIfNeeded();
      const slide=page.locator('.slide').nth(i);
      await expect(slide).toBeVisible();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
      if(i){
        await expect(slide.locator('h2')).toHaveCount(1);
        await expect(slide.locator('.fm-concise-visual> *')).toHaveCount(1);
        await expect(slide.locator('.fm-next-cs-card,details')).toHaveCount(0);
        const copy=await slide.locator('.fm-concise-copy').innerText();
        expect(copy.length).toBeLessThan(290);
        const textStyle=await slide.locator('.fm-concise-lead').evaluate(n=>({font:parseFloat(getComputedStyle(n).fontSize),line:parseFloat(getComputedStyle(n).lineHeight)}));
        expect(textStyle.font).toBeGreaterThanOrEqual(15);expect(textStyle.line).toBeGreaterThanOrEqual(25);
        if(width>900){
          const box=await slide.locator('.fm-concise-layout').boundingBox();
          expect(box.y).toBeGreaterThanOrEqual(54);expect(box.y+box.height).toBeLessThanOrEqual(height-64);
        }
      }
      const results=await new AxeBuilder({page}).include(width>900?'.slide.on':'.track').analyze();
      expect(results.violations.filter(v=>['serious','critical'].includes(v.impact))).toEqual([]);
    }
    expect(await page.locator('.fm-concise-screen img').evaluateAll(nodes=>nodes.every(n=>n.complete&&n.naturalWidth>0))).toBe(true);
    await expect(page.locator('.slide').nth(6)).toContainText('성과는 다음 검증');
  });
}
test('section links, history, keyboard and reload work with seven sections',async({page})=>{
  await page.setViewportSize({width:1920,height:1080});await page.goto('/?review=1#section-04');
  await expect(page.locator('.slide.on')).toHaveAttribute('data-page-number','4');
  await page.locator('.btn-next').click();await expect(page).toHaveURL(/section-05$/);
  await page.goBack();await expect(page.locator('.slide.on')).toHaveAttribute('data-page-number','4');
  await page.goForward();await expect(page.locator('.slide.on')).toHaveAttribute('data-page-number','5');
  await page.locator('body').click({position:{x:10,y:10}});await page.keyboard.press('ArrowRight');
  await expect(page.locator('.slide.on')).toHaveAttribute('data-page-number','6');
  await page.reload();await expect(page).toHaveURL(/\?review=1#section-01$/);
  await expect(page.locator('.topbar-count')).toHaveText('01 / 07');
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);
  await expect(page.locator('.btn-prev')).toBeDisabled();
  await page.goto('/#section-13');await expect(page).toHaveURL(/section-07$/);
  await expect(page.locator('.btn-next')).toBeDisabled();
  await expect(page.locator('.fm-reader-position')).toHaveText('07 / 07 · Validation & Learning');
  await expect(page.locator('.slide.on')).toContainText('다음 검증');
  const inactiveTabStops=await page.locator('.slide:not(.on) a').evaluateAll(nodes=>nodes.filter(n=>n.getAttribute('tabindex')!=='-1').length);
  expect(inactiveTabStops).toBe(0);
});
