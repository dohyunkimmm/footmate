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
   expect(metrics.hidden).toBe(false);expect(metrics.overflow).toBe(false);if(i<8)expect(Math.abs(metrics.top)).toBeLessThan(width<=800?80:40);else await expect(section.locator('.section-title')).toBeInViewport();
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
test('KPI summary and mobile section navigation stay usable at 320 and 390px',async({page},testInfo)=>{
 for(const width of [320,390]){
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width,height:844});
  await page.goto('/');
  const kpis=page.locator('#section-01 .case-kpis');
  await expect(kpis).toBeVisible();
  for(const text of ['626','340','−38.7'])await expect(kpis).toContainText(text);
  await expect(page.locator('#section-01 .kpi-note')).toContainText('기준 시나리오 · 월 추정치');
  await expect(page.locator('.mobile-reader-nav')).toBeVisible();
  await expect(page.locator('.mobile-reader-count')).toHaveText('01 / 09');
  await testInfo.attach('manual-kpi-'+width,{body:await page.locator('#section-01').screenshot({animations:'disabled'}),contentType:'image/png'});
  await page.locator('.toc-item').nth(5).click();
  await expect(page.locator('.mobile-reader-count')).toHaveText('06 / 09');
  await expect(page.locator('.mobile-reader-name')).toHaveText('IT 투자·시스템 구조');
  await expect(page.locator('#section-06 td[data-label="구현 상태"]')).toHaveCount(5);
  await expect(page.locator('#section-06 td[data-label="후속 조건"]')).toHaveCount(5);
  await testInfo.attach('manual-section6-'+width,{body:await page.screenshot({animations:'disabled'}),contentType:'image/png'});
  await page.getByRole('button',{name:'목차'}).click();
  await expect(page.locator('.toc-item').nth(5)).toBeFocused();
  await expect(page.locator('.toc-item').nth(5)).toBeInViewport();
  await testInfo.attach('manual-return-to-toc-'+width,{body:await page.screenshot({animations:'disabled'}),contentType:'image/png'});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 }
});
test('desktop KPI cards remain three columns without mobile navigation',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto('/');
 await expect(page.locator('.mobile-reader-nav')).toBeHidden();
 await expect(page.locator('.case-kpi')).toHaveCount(3);
 const columns=await page.locator('.case-kpi').evaluateAll(nodes=>nodes.map(n=>Math.round(n.getBoundingClientRect().top)));
 expect(new Set(columns).size).toBe(1);
});
test('tables only enter Tab order when horizontally scrollable',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await expect(page.locator('.table-wrap[tabindex="0"]')).toHaveCount(0);
 await page.locator('#section-08 details').evaluateAll(nodes=>nodes.forEach(node=>node.open=true));
 await expect(page.locator('.table-wrap[tabindex="0"]')).toHaveCount(0);
 await page.setViewportSize({width:1440,height:900});
 await expect.poll(()=>page.locator('.table-wrap').evaluateAll(nodes=>nodes.every(node=>{
  const scrollable=getComputedStyle(node).overflowX!=='visible' && node.scrollWidth>node.clientWidth+1;
  return (node.tabIndex===0)===scrollable;
 }))).toBe(true);
});
test('mobile TOC stays readable while the first decision enters the opening viewport',async({page})=>{
 for(const [width,height] of [[320,740],[390,844],[800,900]]){
  await page.setViewportSize({width,height});await page.goto('/');
  const labels=page.locator('.toc-item');
  await expect(labels).toHaveCount(9);
  const layout=await page.evaluate(()=>{
   const toc=document.querySelector('.toc');
   const nodes=[...toc.querySelectorAll('.toc-item')];
   return {
    tocScrollWidth:toc.scrollWidth,tocClientWidth:toc.clientWidth,
    labelLayouts:nodes.map(n=>({top:Math.round(n.getBoundingClientRect().top),height:n.getBoundingClientRect().height,
     labelOverflow:n.querySelector('.toc-t').scrollWidth-n.querySelector('.toc-t').clientWidth})),
    firstDecisionTop:document.querySelector('#section-01 .decision-card').getBoundingClientRect().top,
    documentOverflow:document.documentElement.scrollWidth>innerWidth+1
   };
  });
  expect(new Set(layout.labelLayouts.map(x=>x.top)).size).toBe(1);
  expect(layout.tocScrollWidth).toBeGreaterThan(layout.tocClientWidth+1);
  expect(layout.labelLayouts.every(x=>x.height>=44&&x.labelOverflow<=1)).toBe(true);
  expect(layout.firstDecisionTop).toBeLessThan(height);
  expect(layout.documentOverflow).toBe(false);
  await labels.last().click();
  await expect(labels.last()).toHaveAttribute('aria-current','location');
  await expect(page.locator('#section-09 .section-title')).toBeInViewport();
 }
});
test('last section heading aligns near the top in desktop reading',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const [width,height] of [[1440,900],[1920,1080]]){
  await page.setViewportSize({width,height});await page.goto('/');
  await page.locator('.toc-item').nth(8).click();
  await expect(page.locator('.toc-item').nth(8)).toHaveAttribute('aria-current','location');
  const top=await page.locator('#section-09').evaluate(el=>el.getBoundingClientRect().top);
  expect(top).toBeGreaterThanOrEqual(-1);
  expect(top).toBeLessThanOrEqual(55);
  await expect(page.locator('#section-09 .section-title')).toBeInViewport();
 }
});

test('05 and 08 keep one representative table visible and preserve expandable evidence',async({page})=>{
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:900});await page.goto('/');
  for(const section of ['#section-05','#section-08']){
   await expect(page.locator(section+' > .table-wrap')).toHaveCount(1);
   expect(await page.locator(section+' > details').count()).toBeGreaterThanOrEqual(5);
  }
  const scenarios=page.locator('#section-05 > details').filter({has:page.getByText('월 사업 손익 민감도 · 보수·기준·확장 (가정)',{exact:true})});
  await expect(scenarios.locator('table')).toBeHidden();
  await scenarios.locator('summary').click();
  await expect(scenarios.locator('table')).toBeVisible();
  const report=page.locator('#section-08 > details').filter({has:page.getByText('월간 경영보고 · KPI·손익 비교 (합성 데이터)',{exact:true})});
  await expect(report.locator('table')).toBeHidden();
  await report.locator('summary').click();
  await expect(report.locator('table')).toBeVisible();
  await expect(page.locator('#section-08 .reader-summary')).toContainText('831만 원');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 }
});


test('recruiter scanning: 01 ownership, 03 options, 06 evidence remain concise and expandable',async({page})=>{
 for(const width of [320,390,1440]){
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width,height:900});
  await page.goto('/');
  const roleCards=page.locator('#section-01 .decision-card');
  await expect(roleCards).toHaveCount(3);
  await expect(roleCards.nth(0)).toContainText('지역 공급과 참가 수요');
  await expect(roleCards.nth(1)).toContainText('수행 범위');
  await expect(roleCards.nth(2)).toContainText('기존 운영자 제휴 우선');
  await expect(page.locator('#section-01 .case-kpi')).toHaveCount(3);
  await expect(page.locator('#section-03 > .table-wrap')).toHaveCount(1);
  await expect(page.locator('#section-03 table')).toHaveCount(4);
  await expect(page.locator('#section-03 > details')).toHaveCount(2);
  const optionDetails=page.locator('#section-03 > details').last();
  await expect(optionDetails.locator('table').first()).toBeHidden();
  await optionDetails.locator('summary').click();
  await expect(optionDetails.locator('table')).toHaveCount(2);
  await expect(optionDetails.locator('table').first()).toBeVisible();
  const techCards=page.locator('#section-06 .decision-card');
  await expect(techCards).toHaveCount(3);
  await expect(techCards.nth(0)).toContainText('기존 서비스 연결');
  await expect(techCards.nth(1)).toContainText('가상 데이터로 동작 확인');
  await expect(techCards.nth(2)).toContainText('실제 결제·환불·운영자 정산은 미연동');
  await expect(page.locator('#section-06 .architecture li').last()).toContainText('결제·정산 (미연동)');
  await expect(page.locator('#section-06 > .table-wrap')).toHaveCount(1);
  await expect(page.locator('#section-06 table')).toHaveCount(4);
  await expect(page.locator('.track table')).toHaveCount(26);
  for(const id of ['#section-01','#section-03','#section-06'])
   expect(await page.locator(id).evaluate(n=>n.scrollWidth<=n.clientWidth+1)).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 }
});

test('reader summary, detailed numbers and optional tables remain consistent',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await expect(page.locator('#section-01 .case-kpi').nth(2)).toContainText('약 −38.7만 원');
 await expect(page.locator('#section-05 .reader-summary')).toContainText('약 23곳');
 await expect(page.locator('#section-05 .reader-summary')).toContainText('약 28곳');
 await expect(page.locator('#section-08 .reader-summary')).toContainText('831만 원');
 await expect(page.locator('.track table')).toHaveCount(26);
 await expect(page.locator('#section-04 .model-funnel')).toContainText('약 1,559석');
 for(const [section,label] of [['#section-05','기준 거래 계산·수수료 협상 비교표 자세히 보기'],['#section-06','월 IT·운영 예산 세부 내역'],['#section-08','월간 지표 관리·정정 책임표']]){
  const summary=page.locator(section+' details summary').filter({hasText:label});
  await expect(summary).toBeVisible();
  await summary.click();
  await expect(summary.locator('..')).toHaveAttribute('open','');
 }
 await expect(page.locator('#section-05')).toContainText('−387,160원');
 await expect(page.locator('#section-09')).toContainText('−1,986,980원');
 await page.goto('/src/case-study/forecast.html');
 await expect(page.getByRole('heading',{name:'기준 손익 가정'})).toBeVisible();
 await expect(page.locator('#expansion')).toContainText('약 23곳');
 await expect(page.locator('#expansion')).toContainText('약 28곳');
 await page.goto('/src/case-study/materials.html');
 await expect(page.locator('body')).toContainText('2027년');
 await expect(page.locator('body')).toContainText('약 28곳');
 await expect(page.locator('a[href$=".zip"]')).toHaveCount(0);
});
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
 await expect(page.locator('.sidebar a[href="/demo"]')).toHaveCount(0);
 await expect(page.locator('a[href="/demo"]')).toHaveCount(1);
 await expect(page.locator('#section-06 a[href="/demo"]')).toHaveText('서비스 Demo 보기 ↗');
 await expect(page.locator('#section-06 a[href="/demo"]')).toHaveAttribute('target','_blank');
 for(const text of ['626건','340원','1,765건','7,648건','−387,160원'])await expect(page.locator('.track')).toContainText(text);
 await expect(page.locator('#section-08')).toContainText('8주 실증 일정·목표·투자 판단 기준.');
 await expect(page.locator('#section-01')).toContainText('수행 범위');
 await expect(page.locator('.track')).not.toContainText('김도현');
 await expect(page.locator('#section-01')).not.toContainText('실제 계약·매출 실적이 아닙니다');
 await expect(page.locator('#section-06')).toContainText('구현·검증 요약');
 await expect(page.locator('a[href*="github.com"]')).toHaveCount(0);
 await expect(page.locator('#section-06')).toContainText('가상 데이터');
 await expect(page.locator('#section-06')).toContainText('실제 서버의 동시 요청 처리는 별도 검증');
 await expect(page.locator('#section-07 .transaction-flow')).toContainText('정원 변경까지 한 번에 처리');
 await expect(page.locator('#section-08')).toContainText('관측 완료자만 분모 포함');
 await expect(page.locator('#section-09')).toContainText('−1,986,980원');
 await expect(page.locator('#section-09')).not.toContainText('−202,540원');
 await expect(page.locator('#section-09')).toContainText('발표자료(PPT)·분석 모델(Excel) 보기');
 await expect(page.locator('#section-09')).not.toContainText(/첨부 자료 대조|대조 기준|자동 재검사|B8·B9|model\.json/);
 await expect(page.locator('#section-09 .table-wrap')).toHaveCount(0);
 await expect(page.locator('#case-materials-frame')).toHaveCount(0); // Avoid the duplicate embedded report and its large preview payload.
 await expect(page.locator('#section-09 a[href="/src/case-study/materials.html"]')).toHaveCount(1);
 await expect(page.locator('link[href*="tossface.css"]')).toHaveCount(0);
 await expect(page.locator('#section-08')).not.toContainText('포트폴리오용 합성 데이터·가정.');

 for(const id of ['#section-01','#section-04','#section-05','#section-09']){
  await expect(page.locator(id)).toContainText('626건');
  if(id==='#section-01')await expect(page.locator(id)).toContainText('약 −38.7');
  else if(id!=='#section-04')await expect(page.locator(id)).toContainText('−387,160원');
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
  for(const label of ['8주 자원 산정·승인 범위','실증 결과별 의사결정']){
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


test('MOSIGO-style document entry, in-page PPT preview and Excel access',async({page,request})=>{
 for(const width of [320,390,1440]){
  await page.setViewportSize({width,height:900});await page.goto('/');
  await expect(page.getByRole('link',{name:'PPT·Excel 자료 보기 ↓'})).toBeVisible();
  await expect(page.locator('#section-09 a[href="/src/case-study/materials.html"]')).toContainText('PPT');
  await expect(page.locator('#section-09 a[href="/src/case-study/materials.html"]')).toContainText('Excel');
  await page.getByRole('link',{name:'PPT·Excel 자료 보기 ↓'}).click();
  await expect(page).toHaveURL(/#attachments$/);
  const documents=page.locator('#attachments');
  await expect(documents).toBeInViewport();
  await expect(documents.getByRole('heading',{name:'자료 바로보기'})).toBeVisible();
  await expect(documents.getByRole('link',{name:'발표자료 PPT 저장'})).toHaveAttribute('download','footmate_report.pptx');
  await expect(documents.getByRole('link',{name:'분석 모델 Excel 저장'})).toHaveAttribute('download','footmate_model.xlsx');
  await expect(documents.getByRole('link',{name:'손익 모형 화면에서 보기'})).toHaveAttribute('href','/src/case-study/materials.html');
  const details=documents.locator('.case-doc-preview');
  await expect(details).not.toHaveAttribute('open',/.+/);
  const frame=documents.locator('.case-ppt-frame');
  await expect(frame).toHaveAttribute('data-src','/src/case-study/materials.html?preview=1');
  await details.locator('summary').click();
  await expect(details).toHaveAttribute('open','');
  await expect(frame).toHaveAttribute('src','/src/case-study/materials.html?preview=1');
  const slides=frame.contentFrame();
  await expect(slides.locator('#page')).toHaveText('1 / 9',{timeout:15000});
  await expect(slides.locator('#slide')).toHaveAttribute('src',/^data:image\/png;base64,/);
  await expect(slides.getByRole('button',{name:'이전'})).toBeDisabled();
  await slides.getByRole('button',{name:'다음'}).click();
  await expect(slides.locator('#page')).toHaveText('2 / 9');
  await slides.getByRole('button',{name:'이전'}).click();
  await expect(slides.locator('#page')).toHaveText('1 / 9');
  await expect(slides.getByRole('heading',{name:'FootMate 분석 자료'})).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 }
 for(const [path,type] of [
  ['/src/case-study/downloads/footmate_report.pptx','presentation'],
  ['/src/case-study/downloads/footmate_model.xlsx','spreadsheet']
 ]){
  const response=await request.get(path);
  expect(response.ok()).toBe(true);
  expect(['application/octet-stream',type].some(expected=>(response.headers()['content-type']||'').includes(expected))).toBe(true);
  expect((await response.body()).subarray(0,2).toString()).toBe('PK');
 }
});
