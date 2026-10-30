// Independent Case Study: continuous reading, desktop typography and navigation.
const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
for(const width of [1920,1440,800,390,320]){
 test('continuous case study reading and typography at '+width+'px',async({page},testInfo)=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width,height:1080});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('.toc-item')).toHaveCount(9);
  await expect(page.locator('.slide')).toHaveCount(9);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('.cs-controls,.dot,.btn-next,.btn-prev')).toHaveCount(0);
  for(let i=0;i<9;i++){
   const link=page.locator('.toc-item').nth(i),section=page.locator('.slide').nth(i);
   await link.click();
   await expect(section.locator('.section-title')).toBeFocused();
   await expect(link).toHaveAttribute('aria-current','location');
   expect(new URL(page.url()).hash).toBe('#section-'+String(i+1).padStart(2,'0'));
   const metrics=await section.evaluate(n=>({hidden:n.hidden,overflow:n.scrollWidth>n.clientWidth+1,top:n.getBoundingClientRect().top}));
   expect(metrics.hidden).toBe(false);expect(metrics.overflow).toBe(false);if(i<8)expect(Math.abs(metrics.top)).toBeLessThan(40);else await expect(section.locator('.section-title')).toBeInViewport();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
   for(const table of await section.locator('.table-wrap').all())expect(await table.evaluate(n=>n.scrollWidth<=n.clientWidth+1)).toBe(true);
   if(width===1920){
    const typography=await section.evaluate(n=>({body:parseFloat(getComputedStyle(n).fontSize),heading:parseFloat(getComputedStyle(n.querySelector('.section-title')).fontSize),table:[...n.querySelectorAll('td')].every(td=>parseFloat(getComputedStyle(td).fontSize)>=16),width:n.clientWidth}));
    expect(typography.body).toBeGreaterThanOrEqual(17);expect(typography.heading).toBe(36);expect(typography.table).toBe(true);expect(typography.width).toBeLessThanOrEqual(1200);
    await testInfo.attach('desktop-1920-section-'+(i+1),{body:await page.screenshot({animations:'disabled'}),contentType:'image/png'});
   }
   if(width===390) await testInfo.attach('mobile-390-section-'+(i+1),{body:await page.screenshot({animations:'disabled'}),contentType:'image/png'});
  }
  const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(scan.violations).toEqual([]);expect(errors).toEqual([]);
 });
}
test('scroll position, deep links and browser history work without page switching',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:1920,height:1080});
 await page.goto('/#section-04');await expect(page.locator('.toc-item').nth(3)).toHaveAttribute('aria-current','location');
 await page.locator('.toc-item').nth(5).click();await page.goBack();await expect(page.locator('.toc-item').nth(3)).toHaveAttribute('aria-current','location');
 await page.reload();await expect(page.locator('.toc-item').nth(3)).toHaveAttribute('aria-current','location');
 await page.locator('#section-08').evaluate(n=>n.scrollIntoView());await expect(page.locator('.toc-item').nth(7)).toHaveAttribute('aria-current','location');
 await expect(page.locator('.slide[hidden]')).toHaveCount(0);
});
test('case study distinguishes implementation evidence from proposed business results',async({page})=>{
 await page.goto('/');
 await expect(page.locator('body')).not.toContainText(/2026\.06\.08|교육과정/);
 await expect(page.locator('a[href="/demo"]')).toHaveCount(1);await expect(page.locator('a[href="/demo"]')).toHaveText('Demo ↗');
 await expect(page.locator('.track a[href="/demo"]')).toHaveCount(0);
 for(const text of ['626건','340원','1,765건','7,648건','−387,160원'])await expect(page.locator('.track')).toContainText(text);
 await expect(page.locator('#section-08')).toContainText('계획이며 과거 수행 실적이 아니다');
 await expect(page.locator('#section-01')).toContainText('담당 범위 · 김도현');
 await expect(page.locator('#section-06')).toContainText('구현·검증 요약');
 await expect(page.locator('a[href*="github.com"]')).toHaveCount(0);
 await expect(page.locator('#section-06')).toContainText('가상 데이터');
 await expect(page.locator('#section-06')).toContainText('실제 서버의 동시 요청 처리는 별도 검증');
 await expect(page.locator('#section-07 .transaction-flow')).toContainText('정원 변경까지 한 번에 처리');
 await expect(page.locator('#section-08')).toContainText('관측 완료자만 분모 포함');
 await expect(page.locator('#section-09')).toContainText('−1,986,980원');
 await expect(page.locator('#section-09')).not.toContainText('−202,540원');
 await expect(page.locator('#section-09')).toContainText('발표자료·손익 모형 보기');
 await expect(page.locator('#section-09')).not.toContainText(/첨부 자료 대조|대조 기준|자동 재검사|B8·B9|model\.json/);
 await expect(page.locator('#section-09 .table-wrap')).toHaveCount(0);
 for(const id of ['#section-01','#section-04','#section-05','#section-09']){
  await expect(page.locator(id)).toContainText('626건');
  if(id!=='#section-04')await expect(page.locator(id)).toContainText('−387,160원');
 }
 await expect(page.locator('#section-04')).not.toContainText(/이전 단순|기존 1,169건/);
});
test('200 percent text retains the full report without horizontal page overflow',async({page})=>{
 await page.setViewportSize({width:1920,height:1080});await page.goto('/');
 await page.addStyleTag({content:'.slide,.slide p,.slide th,.slide td{font-size:34px!important;line-height:1.85!important}'});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await expect(page.locator('.slide[hidden]')).toHaveCount(0);
});

test('continuous reader restores back navigation after a legacy manual-scroll session',async({page})=>{
 await page.addInitScript(()=>{history.scrollRestoration='manual';});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.setViewportSize({width:1920,height:1080});
 await page.goto('/');
 expect(await page.evaluate(()=>history.scrollRestoration)).toBe('auto');
 await page.locator('.toc-item').nth(0).click();
 await page.locator('.toc-item').nth(8).click();
 await expect(page.locator('.toc-item').nth(8)).toHaveAttribute('aria-current','location');
 await page.goBack();
 await expect(page).toHaveURL(/#section-01$/);
 await expect(page.locator('.toc-item').nth(0)).toHaveAttribute('aria-current','location');
 expect(await page.locator('#section-01').evaluate(n=>Math.abs(n.getBoundingClientRect().top))).toBeLessThan(40);
});

test('normal-motion back and forward restore the section heading and keyboard focus',async({page})=>{
 await page.setViewportSize({width:1920,height:1080});
 await page.goto('/');
 await page.locator('.toc-item').nth(0).click();
 await page.locator('.toc-item').nth(8).click();
 await expect(page.locator('.toc-item').nth(8)).toHaveAttribute('aria-current','location');
 await page.goBack();
 await expect(page.locator('#section-01 .section-title')).toBeFocused();
 await expect(page.locator('.toc-item').nth(0)).toHaveAttribute('aria-current','location');
 await expect.poll(()=>page.locator('#section-01').evaluate(n=>Math.abs(n.getBoundingClientRect().top))).toBeLessThan(40);
 await page.goForward();
 await expect(page.locator('#section-09 .section-title')).toBeFocused();
 await expect(page.locator('.toc-item').nth(8)).toHaveAttribute('aria-current','location');
 await expect(page.locator('#section-09 .section-title')).toBeInViewport();
});


test('expansion assumptions include added cost and supply loss without changing the base ledger',async({page},testInfo)=>{
 await page.goto('/src/case-study/forecast.html#expansion');
 const base=await page.locator('#kpis').innerText(),ledger=await page.locator('#monthly').innerText();
 const result=page.locator('#expansion-result');
 await expect(result).toContainText('2,880건');await expect(result).toContainText('-432,800원');await expect(result).toContainText('28곳');
 await page.locator('#expansion-cost').fill('0');await expect(result).toContainText('107,200원');await expect(result).toContainText('23곳');
 await page.locator('#expansion-reset').click();
 await page.locator('#expansion-retention').fill('80');await expect(result).toContainText('-974,240원');
 await page.locator('#expansion-share').fill('48');await expect(result).toContainText('1,843건');await expect(result).toContainText('-1,407,580원');
 await page.locator('#expansion-retention').fill('0');await expect(result).toContainText('500곳 이내 미달');
 await page.locator('#expansion-reset').click();await page.locator('#expansion-partners').fill('28');await expect(result).toContainText('5,640원');
 await page.locator('#expansion-partners').fill('');await expect(result).toHaveText('입력 범위를 확인하세요.');
 await page.locator('#expansion-partners').fill('23.5');await expect(result).toHaveText('입력 범위를 확인하세요.');
 await page.locator('#expansion-reset').click();
 expect(await page.locator('#kpis').innerText()).toBe(base);expect(await page.locator('#monthly').innerText()).toBe(ledger);
 for(const width of [320,390,1440]){
  await page.setViewportSize({width,height:1080});await page.locator('#expansion').scrollIntoViewIfNeeded();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await testInfo.attach('expansion-'+width,{body:await page.locator('#expansion').screenshot({animations:'disabled'}),contentType:'image/png'});
 }
 const scan=await new AxeBuilder({page}).include('#expansion').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(scan.violations).toEqual([]);
});

test('investment evidence exposes budget scope and separates missing data from unmet targets',async({page},testInfo)=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/#section-08');
 await expect(page.locator('#section-08')).toContainText('현금 461만원');
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:1080});
  for(const id of ['#section-05','#section-06','#section-08']){
   await page.locator(id+' details').evaluateAll(nodes=>nodes.forEach(n=>n.open=true));
   expect(await page.locator(id).evaluate(n=>n.scrollWidth<=n.clientWidth+1)).toBe(true);
  }
  for(const label of ['8주 자원 산정·승인 범위','목표 미달·자료 부족·중단 기준']){
   const detail=page.locator('#section-08 details').filter({has:page.getByText(label,{exact:true})});
   await testInfo.attach('investment-'+width+'-'+(label.startsWith('8주')?'budget':'decision'),{body:await detail.screenshot({animations:'disabled'}),contentType:'image/png'});
  }
 }
 await expect(page.locator('#section-08')).toContainText('8,310,000원');
 await expect(page.locator('#section-08')).toContainText('취소 전·전체 모집 채널 합산');
 await expect(page.locator('#section-08')).toContainText('자료 부족');await expect(page.locator('#section-08')).toContainText('관측 미완료');
 const scan=await new AxeBuilder({page}).include('#section-05').include('#section-06').include('#section-08').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(scan.violations).toEqual([]);
});



test('implementation decisions stay readable inside the case study',async({page},testInfo)=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/#section-06');
 const detail=page.locator('#section-06 details').filter({has:page.getByText('참가·정원 관리의 설계 이유',{exact:true})});await detail.locator('summary').click();
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:1080});
  await testInfo.attach('inline-evidence-'+width,{body:await page.locator('#section-06 .table-wrap').filter({has:page.getByText('구현·검증 요약',{exact:true})}).screenshot({animations:'disabled'}),contentType:'image/png'});
  await testInfo.attach('inline-decision-'+width,{body:await detail.screenshot({animations:'disabled'}),contentType:'image/png'});
  expect(await page.locator('#section-06').evaluate(n=>n.scrollWidth<=n.clientWidth+1)).toBe(true);
 }
 await expect(detail).toContainText('마지막 자리에 요청이 몰리거나');
 await expect(page.locator('a[href*="github.com"]')).toHaveCount(0);
});

test('removed ledger ZIP stays unpublished while PPT and Excel remain available',async({request})=>{
 const material=await request.get('/src/case-study/materials.html');expect(material.ok()).toBe(true);const html=await material.text();
 expect(html).not.toContain('footmate_materials.zip');expect(html).not.toContain('원장·가정 포함 전체 자료 ZIP');
 expect(html).toContain('downloads/footmate_report.pptx');expect(html).toContain('downloads/footmate_model.xlsx');
 const removed=await request.get('/src/case-study/downloads/footmate_materials.zip');
 expect(removed.headers()['content-type']||'').not.toMatch(/zip/i);
 expect((await removed.body()).subarray(0,4).toString('hex')).not.toBe('504b0304');
});
