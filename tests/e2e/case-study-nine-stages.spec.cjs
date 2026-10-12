// The filename is retained because the QA workflow already selects it.
const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
const titles=['Overview & Problem','User Research','Persona & Journey','Scope & Priorities','IA & Navigation','Flowchart & Recovery','Wireframe & Screens','Functions & Policies','AI & Prototype','Validation & UX','Reflection & Next'];

for(const width of [320,390,800,1440,1920]){
 test(`eleven-section navigation, evidence and accessibility at ${width}px`,async({page},testInfo)=>{
  await page.setViewportSize({width,height:1080});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('.toc-item')).toHaveCount(11);await expect(page.locator('.dot')).toHaveCount(11);
  await expect(page.locator('.btn-prev')).toBeDisabled();
  for(let i=0;i<titles.length;i++){
   await page.locator('.toc-item').nth(i).click();const slide=page.locator('.slide:visible');
   await expect(slide).toHaveCount(1);await expect(slide).toHaveAttribute('aria-label',titles[i]);
   await expect(page).toHaveURL(new RegExp(`#section-${String(i+1).padStart(2,'0')}$`));
   await expect(page.locator('.topbar-count')).toHaveText(`${String(i+1).padStart(2,'0')} / 11`);
   await expect(page.locator('.toc-item').nth(i)).toHaveAttribute('aria-current','step');
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
   for(const image of await slide.locator('img').all()){
    await image.scrollIntoViewIfNeeded();await expect.poll(()=>image.evaluate(n=>n.complete&&n.naturalWidth>0)).toBe(true);
   }
   await slide.locator('details').evaluateAll(nodes=>nodes.forEach(n=>n.open=true));
   const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(scan.violations).toEqual([]);
   await page.waitForTimeout(200);
   if([390,1440].includes(width))await testInfo.attach(`section-${i+1}-${width}`,{body:await page.screenshot({fullPage:true,animations:'disabled'}),contentType:'image/png'});
  }
  await expect(page.locator('.btn-next')).toBeDisabled();expect(errors).toEqual([]);
 });
}

test('section history, keyboard, deep links and reload retain their contract',async({page})=>{
 await page.goto('/#section-05');await expect(page.locator('.slide:visible')).toHaveAttribute('aria-label','IA & Navigation');
 await page.locator('.btn-next').click();await expect(page.locator('.slide:visible')).toHaveAttribute('aria-label','Flowchart & Recovery');await expect(page.locator('.slide:visible h1')).toBeFocused();
 await page.goBack();await expect(page.locator('.slide:visible')).toHaveAttribute('aria-label','IA & Navigation');
 await page.keyboard.press('ArrowLeft');await expect(page.locator('.slide:visible')).toHaveAttribute('aria-label','Scope & Priorities');
 await page.locator('.slide:visible summary').click();await expect(page.locator('.slide:visible details')).toHaveAttribute('open','');
 await page.reload();await expect(page).toHaveURL(/#section-01$/);await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);
});

test('existing Demo is linked unchanged and wireframes are disclosed as current implementation',async({page})=>{
 await page.goto('/');await expect(page.locator('#section-01 a[href="/demo"]')).toHaveCount(1);
 await expect(page.locator('#section-01')).toContainText('체험용 데이터 · 실제 참가·결제 없음');
 await page.locator('.toc-item').nth(6).click();await expect(page.locator('#section-07 .wireframe-record')).toHaveCount(5);
 await expect(page.locator('#section-07')).toContainText('현재 구현 기준 와이어프레임');
 await expect(page.locator('#section-07 a[href*="figma.com/design/rvhwFauZFBsSnvHYitohgC"]')).toHaveCount(1);
 await page.locator('.toc-item').nth(8).click();await expect(page.locator('#section-09 a[href="/demo"]')).toHaveCount(1);
 await expect(page.locator('#section-09')).toContainText('AI가 경기·자리·순위를 임의 생성하지 않음');
});

test('research, QA improvements and policy evidence have separate responsibilities',async({page})=>{
 await page.goto('/#section-02');await expect(page.locator('#section-02')).toContainText('6명 · iOS 4 / Android 2');
 await expect(page.locator('#section-02')).toContainText('탐색·가입 과업 8회');await expect(page.locator('#section-02')).toContainText('수정 연결은 미확정');
 await page.locator('.toc-item').nth(7).click();await expect(page.locator('#section-08 table')).toHaveCount(2);
 await page.locator('#section-08 summary').click();await expect(page.locator('#section-08')).toContainText('경기별 취소 마감');
 await page.locator('.toc-item').nth(9).click();await expect(page.locator('#section-10 .qa-evidence-table tbody tr')).toHaveCount(3);
 await expect(page.locator('#section-10')).toContainText('사용자 과업 검증에서 직접 도출된 결과로 연결하지 않습니다');
 await expect(page.locator('#section-10 .portfolio-method-details')).toHaveCount(0);
 await expect(page.locator('#section-10')).not.toContainText('8개 KPI');
});

test('wireframe enlargement preserves section and restores keyboard focus',async({page})=>{
 await page.goto('/#section-07');const preview=page.locator('#section-07 .evidence-preview').first();await preview.click();
 const dialog=page.getByRole('dialog',{name:'홈 와이어프레임',exact:true});await expect(dialog).toBeVisible();
 await expect(dialog.locator('img')).toHaveAttribute('src',await preview.getAttribute('data-image'));
 await expect(page.getByRole('button',{name:'닫기 ×',exact:true})).toBeFocused();
 await page.keyboard.press('ArrowRight');await expect(page).toHaveURL(/#section-07$/);
 const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(scan.violations).toEqual([]);
 await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();await expect(preview).toBeFocused();
});

for(const width of [320,390]){
 test(`mobile specifications read without internal horizontal overflow at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:844});await page.goto('/#section-02');
  for(const n of [2,7,8,10]){
   await page.locator('.toc-item').nth(n-1).click();await page.locator('.slide:visible details').evaluateAll(nodes=>nodes.forEach(n=>n.open=true));
   for(const table of await page.locator('.slide:visible .table-wrap').all())expect(await table.evaluate(n=>n.scrollWidth<=n.clientWidth+1)).toBe(true);
  }
 });
}

for(const width of [1440,1920]){
 test(`desktop shell and original image ratio remain at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:1080});await page.goto('/');
  const box=await page.locator('.fm-cs-shell').boundingBox();expect(box.width).toBe(1360);expect(Math.abs(box.x-(width-1360)/2)).toBeLessThan(2);
  await expect(page.locator('#section-01 .product-figure img')).toHaveCSS('aspect-ratio','1 / 2');
  await expect(page.locator('.sidebar')).toHaveCSS('width','220px');
  for(let i=0;i<11;i++){
   await page.locator('.toc-item').nth(i).click();await expect(page.locator('.slide:visible .section-head h1')).toHaveCSS('font-size',i===0?'28px':'32px');
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  }
 });
}
