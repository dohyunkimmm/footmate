const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
const titles=['Overview & Problem','Persona & JTBD','Journey Map','Scope & Priorities','IA & UX Flow','Design Decisions & Demo','Validation & Metrics','Reflection','Next Steps'];

for(const width of [1440,800,390,320]){
  test(`nine-stage navigation, evidence and layout at ${width}px`,async({page})=>{
    await page.setViewportSize({width,height:900});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto('/');
    await expect(page.locator('.toc-item')).toHaveCount(9);
    await expect(page.locator('.dot')).toHaveCount(9);
    await expect(page.getByRole('button',{name:'이전 섹션',exact:true})).toBeDisabled();
    for(let i=0;i<9;i++){
      await page.locator('.toc-item').nth(i).click();
      await expect(page.locator('.slide:visible')).toHaveCount(1);
      await expect(page.locator('.slide:visible')).toHaveAttribute('aria-label',titles[i]);
      await expect(page).toHaveURL(new RegExp(`#section-${String(i+1).padStart(2,'0')}$`));
      await expect(page.locator('.topbar-count')).toHaveText(`${String(i+1).padStart(2,'0')} / 09`);
      await expect(page.locator('.toc-item').nth(i)).toHaveAttribute('aria-current','step');
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
      for(const img of await page.locator('.slide:visible img').all()){
        await img.scrollIntoViewIfNeeded();
        await expect.poll(()=>img.evaluate(node=>node.complete&&node.naturalWidth>0)).toBe(true);
      }
      for(const link of await page.locator('.slide:visible .evidence-link').all()){
        expect(await link.getAttribute('href')).toMatch(/^https:\/\/github\.com\/dohyunkimmm\/footmate\/blob\/main\/docs\/[A-Z-]+\.md$/);
      }
      const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      expect(scan.violations).toEqual([]);
    }
    await expect(page.getByRole('button',{name:'다음 섹션',exact:true})).toBeDisabled();
    expect(errors).toEqual([]);
  });
}

test('direct links, history, keyboard and hidden content focus',async({page})=>{
  await page.goto('/#section-05');
  await expect(page.getByRole('region',{name:'IA & UX Flow',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'다음 섹션',exact:true}).click();
  await expect(page.getByRole('region',{name:'Design Decisions & Demo',exact:true})).toBeVisible();
  await expect(page.locator('.slide:visible h1')).toBeFocused();
  await page.goBack();
  await expect(page.getByRole('region',{name:'IA & UX Flow',exact:true})).toBeVisible();
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('region',{name:'Scope & Priorities',exact:true})).toBeVisible();
  await page.locator('.slide:visible summary').click();
  await expect(page.locator('.slide:visible details')).toHaveAttribute('open','');
  await page.locator('.toc-item').nth(6).click();
  await expect(page.locator('.slide:visible')).toContainText('실제 이용자 기준값과 목표치는 아직 없습니다.');
  await page.getByText('8개 KPI의 계산·관찰 기준',{exact:true}).click();
  await expect(page.locator('.slide:visible details tbody tr')).toHaveCount(8);
  await page.locator('.toc-item').first().click();
  await expect(page.getByRole('link',{name:'제품 직접 체험하기',exact:true})).toHaveAttribute('href','/demo');
});
