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
  await expect(page.locator('#section-01 .kpi-note')).toHaveCount(0);
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
test('last section stays readable without forced desktop height',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const [width,height] of [[1440,900],[1920,1080]]){
  await page.setViewportSize({width,height});await page.goto('/');
  await page.locator('.toc-item').nth(8).click();
  await expect(page.locator('.toc-item').nth(8)).toHaveAttribute('aria-current','location');
  const section=page.locator('#section-09');
  const sectionHeight=await section.evaluate(el=>el.getBoundingClientRect().height);
  expect(sectionHeight).toBeLessThan(height);
  await expect(section.locator('.section-title')).toBeInViewport();
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
  const report=page.locator('#section-08 > details').filter({has:page.getByText('월간 경영보고 · KPI·손익 비교 (가상 데이터)',{exact:true})});
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
  await expect(techCards.nth(2)).toContainText('실결제·환불·정산 미구현');
  await expect(page.locator('#section-06 .architecture li').last()).toContainText('결제·정산 미구현');
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
 await expect(page.locator('#section-05 .reader-summary')).toContainText('23곳');
 await expect(page.locator('#section-05 .reader-summary')).toContainText('28곳');
 await expect(page.locator('#section-05 .reader-summary')).toContainText('12%·결제비 0% · 23곳 / 관리비 포함 28곳.');
 await expect(page.locator('#section-05 .reader-summary')).not.toContainText('현금 손익분기');
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
 await expect(page.locator('#section-09')).toContainText('월 현금 −387,160원·확장 −1,986,980원(기회비용 포함).');
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
 await expect(page.locator('#section-08')).toContainText('추진 일정과 목표, 예산 및 결정 기준.');
 await expect(page.locator('#section-01')).toContainText('수행 범위');
 await expect(page.locator('.track')).not.toContainText('김도현');
 await expect(page.locator('#section-01')).not.toContainText('실제 계약·매출 실적이 아닙니다');
 await expect(page.locator('#section-01 .lead')).toContainText('사업 요구사항을 IT 구축·투자·운영 기준으로 구체화한 기획 사례');
 await expect(page.locator('#section-06')).toContainText('직접 구축·외부 활용·후속 투자 구분. 접근·복구·비용 검토.');
 await expect(page.locator('#section-09')).toContainText('참가·정원 기능과 유료 전환 과제 정리');
 await expect(page.locator('#section-06')).toContainText('구현·검증 요약');
 await expect(page.locator('a[href*="github.com"]')).toHaveCount(0);
 await expect(page.locator('#section-06')).toContainText('가상 데이터');
 await expect(page.locator('#section-06')).toContainText('실제 서버의 동시 요청 처리는 별도 검증');
 await expect(page.locator('#section-07 .transaction-flow')).toContainText('로그인·중복·잔여 정원 확인 후 반영');
 await expect(page.locator('#section-08')).toContainText('30일 경과 이용자');
 await expect(page.locator('#section-09')).toContainText('−1,986,980원');
 await expect(page.locator('#section-09')).not.toContainText('−202,540원');
 await expect(page.locator('#section-09')).not.toContainText('발표자료(PPT)·분석 모델(Excel) 보기');
 await expect(page.locator('#section-09')).not.toContainText(/첨부 자료 대조|대조 기준|자동 재검사|B8·B9|model\.json/);
 await expect(page.locator('#section-09 .table-wrap')).toHaveCount(0);
 await expect(page.locator('#case-materials-frame')).toHaveCount(0); // Avoid the duplicate embedded report and its large preview payload.
 await expect(page.locator('#section-09 a[href="/src/case-study/materials.html"]')).toHaveCount(0);
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
 await expect(page.locator('#section-08')).toContainText('현금 지출 상한 461만 원');
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:1080});
  for(const id of ['#section-05','#section-06','#section-08']){
   await page.locator(id+' details').evaluateAll(nodes=>nodes.forEach(n=>n.open=true));
   expect(await page.locator(id).evaluate(n=>n.scrollWidth<=n.clientWidth+1)).toBe(true);
  }
  for(const label of ['8주 자원 산정·승인 범위','현장 검증 결과별 의사결정']){
   const detail=page.locator('#section-08 details').filter({has:page.getByText(label,{exact:true})});
   await testInfo.attach('investment-'+width+'-'+(label.startsWith('8주')?'budget':'decision'),{body:await detail.screenshot({animations:'disabled'}),contentType:'image/png'});
  }
 }
 await expect(page.locator('#section-08')).toContainText('8,310,000원');
 await expect(page.locator('#section-08')).toContainText('취소 전·전체 채널');
 await expect(page.locator('#section-08')).toContainText('자료 부족');await expect(page.locator('#section-08')).toContainText('측정 기간 미완료');
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
 await expect(detail).toContainText('잔여 자리 재확인 후 참가·취소 처리.');
 await expect(page.locator('a[href*="github.com"]')).toHaveCount(0);
});

test('removed ledger ZIP stays unpublished while PPT and Excel remain available',async({request})=>{
 const material=await request.get('/src/case-study/materials.html');expect(material.ok()).toBe(true);const html=await material.text();
 expect(html).not.toContain('footmate_materials.zip');expect(html).not.toContain('원장·가정 포함 전체 자료 ZIP');
 expect(html).not.toContain('downloads/footmate_report.pptx');expect(html).not.toContain('downloads/footmate_model.xlsx');
 const removed=await request.get('/src/case-study/downloads/footmate_materials.zip');
 expect(removed.headers()['content-type']||'').not.toMatch(/zip/i);
 expect((await removed.body()).subarray(0,4).toString('hex')).not.toBe('504b0304');
});


test('single resource section, inline financial model and PPT viewer',async({page,request},testInfo)=>{
 for(const width of [320,390,1440]){
  await page.setViewportSize({width,height:900});await page.goto('/');
  await expect(page.locator('.sidebar .docs-link')).toHaveCount(0);
  await expect(page.locator('#section-09 .case-materials')).toHaveCount(0);
  await expect(page.locator('a[href="/src/case-study/materials.html"]')).toHaveCount(0);
  const documents=page.locator('#attachments');
  await documents.scrollIntoViewIfNeeded();
  await expect(documents.getByRole('heading',{name:'자료',exact:true})).toBeVisible();
  await expect(documents.locator('.case-file')).toHaveCount(2);
  await expect(page.getByRole('link',{name:'PPT 다운로드 ↓'})).toHaveCount(1);
  await expect(page.getByRole('link',{name:'Excel 다운로드 ↓'})).toHaveCount(1);
  await expect(documents.getByRole('link',{name:'PPT 다운로드 ↓'})).toHaveAttribute('download','footmate_report.pptx');
  await expect(documents.getByRole('link',{name:'Excel 다운로드 ↓'})).toHaveAttribute('download','footmate_model.xlsx');
  await expect(page.locator('a[href="/src/case-study/forecast.html"]')).toHaveCount(0);
  const model=page.locator('#case-profit-model');
  await model.scrollIntoViewIfNeeded();
  await expect(model.getByRole('heading',{name:'공급 확대 손익 계산'})).toBeVisible();
  await expect(model.locator('#case-profit-orders')).toHaveText('3,506건');
  await expect(model.locator('#case-profit-economic')).toHaveText('+5,640원');
  await expect(model.locator('#case-profit-bep')).toHaveText('28곳');
  await testInfo.attach('visual-'+width+'-financial-model',{body:await model.screenshot({animations:'disabled'}),contentType:'image/png'});
  await model.locator('#case-profit-partners').fill('23');
  await expect(model.locator('#case-profit-economic')).toHaveText('-432,800원');
  await model.getByRole('button',{name:'초기화'}).click();
  await expect(model.locator('#case-profit-economic')).toHaveText('+5,640원');
  await model.locator('#case-profit-rate').fill('101');
  await expect(model.locator('#case-profit-error')).toBeVisible();
  await model.getByRole('button',{name:'초기화'}).click();
  await expect(model.locator('#case-profit-error')).toBeHidden();
  await documents.scrollIntoViewIfNeeded();
  const preview=documents.locator('.case-doc-preview');
  const frame=preview.locator('.case-ppt-frame');
  await expect(preview).not.toHaveAttribute('open',/.+/);
  await expect(frame).toHaveAttribute('data-src','/src/case-study/materials.html?preview=1');
  const summary=preview.locator('summary');
  await expect(summary).toContainText('PPT 9장 보기');
  await expect(summary).toHaveCSS('background-color','rgb(11, 66, 49)');
  // Verify rendered palette contrast, not just hard-coded expected colors.
  const colorAudit=await documents.evaluate(root=>{
    const selectors=[
      ['PPT CTA','summary',null],
      ['PPT file label','.case-file-type',null],
      ['PPT download','.case-file>a','.case-file'],
      ['Section heading','.case-documents-head h2','.case-documents'],
      ['Section note','.case-documents-head p','.case-documents']
    ];
    const rgb=value=>(value.match(/[\d.]+/g)||[]).slice(0,3).map(Number);
    const luminance=value=>{
      const linear=rgb(value).map(v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)});
      return .2126*linear[0]+.7152*linear[1]+.0722*linear[2];
    };
    return selectors.map(([label,selector,backgroundSelector])=>{
      const node=root.querySelector(selector);
      const foreground=getComputedStyle(node).color;
      const background=getComputedStyle(backgroundSelector?node.closest(backgroundSelector):node).backgroundColor;
      const bg=background==='rgba(0, 0, 0, 0)'?'rgb(255, 255, 255)':background;
      const [a,b]=[luminance(foreground),luminance(bg)];
      return {label,contrast:Number(((Math.max(a,b)+.05)/(Math.min(a,b)+.05)).toFixed(2))};
    });
  });
  for(const item of colorAudit)expect(item.contrast,JSON.stringify(item)).toBeGreaterThanOrEqual(4.5);
  await summary.focus();
  await expect(summary).toBeFocused();
  await expect(summary).toHaveCSS('outline-color','rgb(255, 255, 255)');
  await testInfo.attach('visual-'+width+'-PPT-closed-focus',{body:await documents.screenshot({animations:'disabled'}),contentType:'image/png'});
  await summary.click();
  await expect(frame).toHaveAttribute('src','/src/case-study/materials.html?preview=1');
  const slides=frame.contentFrame();
  await expect(slides.locator('#page')).toHaveText('1 / 9',{timeout:15000});
  await expect(preview.locator('.case-preview-actions')).toBeVisible();
  await expect(preview.getByRole('button',{name:'미리보기 접기'})).toBeVisible();
  const thumbnails=slides.locator('.slide-thumbnails .slide-thumb');
  await expect(thumbnails).toHaveCount(9);
  await expect(thumbnails.nth(0)).toHaveAttribute('aria-current','true');
  await thumbnails.nth(3).click();
  await expect(slides.locator('#page')).toHaveText('4 / 9');
  await expect(thumbnails.nth(3)).toHaveAttribute('aria-current','true');
  await thumbnails.nth(0).click();
  await expect(slides.locator('#page')).toHaveText('1 / 9');
  await testInfo.attach('visual-'+width+'-PPT-expanded',{body:await documents.screenshot({animations:'disabled'}),contentType:'image/png'});
  await expect(slides.getByRole('button',{name:'슬라이드 크게 보기'})).toBeVisible();
  // Mobile slide controls must be readable and finger-friendly.
  const toolbar=slides.locator('.toolbar');
  const controls=await toolbar.locator('button').evaluateAll(nodes=>nodes.map(node=>{
    const rect=node.getBoundingClientRect();
    return {name:node.textContent.trim(),width:rect.width,height:rect.height};
  }));
  for(const control of controls){
    expect(control.width,control.name+' target width').toBeGreaterThanOrEqual(44);
    expect(control.height,control.name+' target height').toBeGreaterThanOrEqual(44);
  }
  await expect(toolbar.locator('#expand')).toHaveCSS('background-color','rgb(11, 66, 49)');
  expect(await toolbar.evaluate(node=>node.scrollWidth<=node.clientWidth+1)).toBe(true);
  // Fullscreen temporarily stretches the viewer; exit must restore its natural
  // slide + toolbar height without leaving blank space inside the iframe.
  const enlarge=slides.getByRole('button',{name:'슬라이드 크게 보기'});
  await enlarge.click();
  await expect.poll(()=>slides.locator('html').evaluate(el=>Boolean(el.ownerDocument.fullscreenElement)),{timeout:10000}).toBe(true);
  await slides.getByRole('button',{name:'슬라이드 원래 크기'}).click();
  await expect.poll(()=>slides.locator('html').evaluate(el=>Boolean(el.ownerDocument.fullscreenElement)),{timeout:10000}).toBe(false);
  await expect.poll(async()=>{
    const outer=await frame.evaluate(el=>el.getBoundingClientRect().height);
    const natural=await slides.locator('.viewer').evaluate(el=>el.getBoundingClientRect().height);
    return Math.abs(outer-natural);
  },{timeout:15000}).toBeLessThan(12);
  await testInfo.attach('visual-'+width+'-PPT-after-fullscreen',{body:await documents.screenshot({animations:'disabled'}),contentType:'image/png'});
  await expect.poll(async()=>{
    const outer=await frame.evaluate(el=>el.getBoundingClientRect().height);
    const inner=await slides.locator('html').evaluate(el=>el.scrollHeight);
    return Math.abs(outer-inner);
  },{timeout:15000}).toBeLessThan(12);
  await slides.getByRole('button',{name:'다음 슬라이드'}).click();
  await expect(slides.locator('#page')).toHaveText('2 / 9');
  await slides.getByRole('button',{name:'이전 슬라이드'}).click();
  await expect(slides.locator('#page')).toHaveText('1 / 9');
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

test('scenario hierarchy, input guidance and responsive readability evidence',async({page},testInfo)=>{
 test.setTimeout(90000);
 await page.emulateMedia({reducedMotion:'reduce'});
 const failures=[];page.on('pageerror',error=>failures.push(error.message));
 for(const width of [320,390,800,1440,1920]){
  await page.setViewportSize({width,height:900});await page.goto('/');
  await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('#section-01 .case-scenario-note')).toContainText('05 확대');
  expect((await page.locator('#section-01 .case-scenario-note').textContent()).trim().length).toBeLessThanOrEqual(65);
  await expect(page.locator('#section-05 .case-model-context')).toContainText('기회비용 포함');
  await expect(page.locator('#section-08 .case-decision-points > div')).toHaveCount(3);
  await expect(page.locator('#section-08 .reader-summary')).toContainText('현금 지출 상한 461만 원');
  await expect(page.locator('#section-08 .reader-summary')).toContainText('30일 재참가율 30%');
  await expect(page.locator('#attachments .case-preview-context')).toHaveCount(0);
  expect(await page.locator('#section-05 .numeric-value').count()).toBeGreaterThan(1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  const touchTargets=await page.locator('#section-05 > details > summary,#section-08 > details > summary').evaluateAll(nodes=>nodes.map(el=>el.getBoundingClientRect().height));
  expect(Math.min(...touchTargets)).toBeGreaterThanOrEqual(44);
  const model=page.locator('#case-profit-model'),rate=model.locator('#case-profit-rate');
  const borderContrast=await rate.evaluate(input=>{
   const channel=(v)=>{const n=v/255;return n<=0.04045?n/12.92:Math.pow((n+0.055)/1.055,2.4)};
   const lum=(color)=>{
    const rgb=(color.match(/[0-9.]+/g)||[]).slice(0,3).map(Number);
    return .2126*channel(rgb[0])+.7152*channel(rgb[1])+.0722*channel(rgb[2]);
   };
   const a=lum(getComputedStyle(input).borderTopColor),b=lum(getComputedStyle(input).backgroundColor);
   return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  });
  expect(borderContrast).toBeGreaterThanOrEqual(3);
  await expect(model.locator('#case-profit-economic')).toHaveText('+5,640원');
  await expect(model.locator('#case-profit-error')).toBeHidden();
  await testInfo.attach('ux-qa-'+width+'-01-context',{body:await page.locator('#section-01 .case-scenario-note').screenshot({animations:'disabled'}),contentType:'image/png'});
  await testInfo.attach('ux-qa-'+width+'-08-decision',{body:await page.locator('#section-08 .reader-summary').screenshot({animations:'disabled'}),contentType:'image/png'});
  await rate.fill('101');
  await expect(rate).toHaveAttribute('aria-invalid','true');
  await expect(rate).toHaveAttribute('aria-describedby','case-profit-error');
  await expect(model.locator('#case-profit-error')).toContainText('수수료율은 0~100% 범위');
  await expect(model.locator('#case-profit-orders')).toHaveText('—');
  await testInfo.attach('ux-qa-'+width+'-05-validation',{body:await model.screenshot({animations:'disabled'}),contentType:'image/png'});
  await model.locator('#case-profit-reset').click();
  await expect(rate).toHaveValue('12');
  await expect(rate).toHaveAttribute('aria-invalid','false');
  await expect(rate).not.toHaveAttribute('aria-describedby',/case-profit-error/);
  await expect(model.locator('#case-profit-error')).toBeHidden();
  await expect(model.locator('#case-profit-economic')).toHaveText('+5,640원');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 }
 expect(failures).toEqual([]);
});

test('reader-facing copy avoids accidental adjacent repetition',async({page})=>{
 await page.goto('/');
 const texts=await page.locator('.slide p,.slide h2,.slide h3,.slide caption,.slide summary,.slide dt,.slide dd').evaluateAll(nodes=>nodes.map(node=>node.textContent.replace(/\s+/g,' ').trim()));
 for(const value of texts){
  expect(value).not.toMatch(/(?:^|\s)([가-힣A-Za-z0-9]{2,})\s+\1(?=$|\s|[.,!?])/u);
 }
 await expect(page.locator('#section-08')).not.toContainText('30일 30일');
 await expect(page.locator('.track')).not.toContainText('시간 기회비용');
 await expect(page.locator('.track')).not.toContainText('창업자 시간 기회비용');
 await expect(page.locator('#section-05 .case-profit-results')).toContainText('기회비용 포함');
});

test('PPT preview closes explicitly and previous-section navigation stays safe',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [320,390,800,1440]){
  await page.setViewportSize({width,height:900});
  await page.goto('/');
  const previous=width<=800?page.locator('.mobile-reader-back'):page.locator('.reader-back');
  await expect(previous).toBeVisible();
  await expect(previous).toBeDisabled();
  await page.locator('.toc-item').nth(3).click();
  await expect(page).toHaveURL(/#section-04$/);
  await expect(previous).toBeEnabled();
  await previous.click();
  await expect(page).toHaveURL(/#section-03$/);
  await expect(page.locator('#section-03 .section-title')).toBeFocused();
  await page.locator('.toc-item').first().click();
  await expect(previous).toBeDisabled();
  const preview=page.locator('.case-doc-preview');
  await preview.locator('summary').click();
  await expect(preview).toHaveAttribute('open','');
  await expect(preview.locator('.case-preview-actions')).toBeVisible();
  const close=preview.getByRole('button',{name:'미리보기 접기'});
  await expect(close).toBeVisible();
  await expect(close).toHaveJSProperty('disabled',false);
  await close.click();
  await expect(preview).not.toHaveAttribute('open','');
  await expect(preview.locator('summary')).toBeFocused();
  await preview.locator('summary').click();
  await expect(preview).toHaveAttribute('open','');
  await expect(preview.locator('.case-ppt-frame')).toHaveAttribute('src','/src/case-study/materials.html?preview=1');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 }
});

test('cross-engine case study navigation and preview controls',async({page})=>{
 test.setTimeout(120000);
 const {firefox,webkit,devices}=require('@playwright/test');
 await page.goto('/');
 const site=new URL('/',page.url()).href;
 for(const [name,engine] of [['firefox',firefox],['webkit',webkit]]){
  // The CI container launches as root; Firefox requires a root-owned HOME.
  // Override Chromium-only launch flags inherited from the test project.
  const browser=await engine.launch({env:{...process.env,HOME:'/root'},args:[]});
  try{
   const context=await browser.newContext(name==='webkit'
    ? {...devices['iPhone 13'],viewport:{width:390,height:844},reducedMotion:'reduce'}
    : {viewport:{width:390,height:844},reducedMotion:'reduce'});
   try{
    const cross=await context.newPage();
    for(const width of [320,390,800]){
     await cross.setViewportSize({width,height:844});
     const errors=[];cross.on('pageerror',error=>errors.push(error.message));
     await cross.goto(site);
     await expect(cross.locator('.slide')).toHaveCount(9);
     await expect(cross.locator('.mobile-reader-back')).toBeVisible();
     await expect(cross.locator('.mobile-reader-back')).toBeDisabled();
     await cross.locator('.toc-item').nth(2).click();
     await expect(cross).toHaveURL(/#section-03$/);
     await cross.locator('.mobile-reader-back').click();
     await expect(cross).toHaveURL(/#section-02$/);
     const model=cross.locator('#case-profit-model');
     await expect(model.locator('#case-profit-economic')).toHaveText('+5,640원');
     await expect(model.locator('#case-profit-error')).toBeHidden();
     expect(await cross.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),name+' at '+width+'px').toBe(true);
     expect(errors,name+' script errors at '+width+'px').toEqual([]);
    }
    const preview=cross.locator('.case-doc-preview');
    await preview.locator('summary').click();
    await expect(preview.getByRole('button',{name:'미리보기 접기'})).toBeVisible();
    await preview.getByRole('button',{name:'미리보기 접기'}).click();
    await expect(preview).not.toHaveAttribute('open','');
   }finally{await context.close();}
  }finally{await browser.close();}
 }
});

test('case study download contents and static performance budgets',async({page})=>{
 const fs=require('node:fs');
 const {spawnSync}=require('node:child_process');
 const sizes=[
  ['src/case-study/downloads/footmate_report.pptx',2_000_000],
  ['src/case-study/downloads/footmate_model.xlsx',1_000_000],
  ['src/case-study/nine-sections.js',200_000],
  ['src/case-study/nine-sections.css',100_000]
 ];
 for(const [file,budget] of sizes)expect(fs.statSync(file).size,file+' static byte budget').toBeLessThan(budget);
 const audit=spawnSync('python3',['-c',String.raw`
from pathlib import Path
from zipfile import ZipFile
import re,xml.etree.ElementTree as ET
root=Path('src/case-study/downloads')
pptx=root/'footmate_report.pptx'
xlsx=root/'footmate_model.xlsx'
with ZipFile(pptx) as p:
    paths=set(p.namelist())
    slides=sorted(x for x in paths if re.fullmatch(r'ppt/slides/slide[0-9]+\.xml',x))
    assert len(slides)==9, 'PPTX slide count: '+str(len(slides))
    pres=ET.fromstring(p.read('ppt/presentation.xml'))
    assert len(pres.findall('.//{http://schemas.openxmlformats.org/presentationml/2006/main}sldId'))==9
    for name in slides:
        node=ET.fromstring(p.read(name))
        shapes=node.findall('.//{http://schemas.openxmlformats.org/presentationml/2006/main}sp')
        images=node.findall('.//{http://schemas.openxmlformats.org/presentationml/2006/main}pic')
        assert shapes or images, 'empty PPT slide: '+name
with ZipFile(xlsx) as x:
    paths=set(x.namelist())
    workbook=ET.fromstring(x.read('xl/workbook.xml'))
    ns='{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
    sheets=workbook.findall('.//'+ns+'sheet')
    assert len(sheets)>=1, 'no Excel worksheets'
    parts=[n for n in paths if re.fullmatch(r'xl/worksheets/sheet[0-9]+\.xml',n)]
    assert len(parts)>=len(sheets),'missing Excel sheet parts'
    formulas=0
    errors=[]
    for n in parts:
        node=ET.fromstring(x.read(n))
        formulas+=len(node.findall('.//'+ns+'f'))
        errors.extend(c.attrib.get('r') for c in node.findall('.//'+ns+'c') if c.attrib.get('t')=='e')
    assert formulas>0, 'Excel file has no formulas'
    assert not errors, 'Excel cached error values: '+str(errors[:10])
    print('PASS: 9 PPT slides, '+str(len(sheets))+' Excel sheets, '+str(formulas)+' formulas, zero cached errors')
`],{encoding:'utf8',timeout:25000});
 expect(audit.status,audit.stderr+' '+audit.stdout).toBe(0);
 await page.goto('/');
 const entries=await page.evaluate(()=>{
  const n=performance.getEntriesByType('navigation')[0];
  return {dom:n?Math.round(n.domContentLoadedEventEnd-n.startTime):-1,load:n?Math.round(n.loadEventEnd-n.startTime):-1};
 });
 expect(entries.dom).toBeGreaterThanOrEqual(0);
 expect(entries.load).toBeGreaterThanOrEqual(0);
 expect(entries.load).toBeLessThan(15000);
 console.log('Case Study local browser navigation (ms):',JSON.stringify(entries));
});

test('body card descriptions stay concise',async({page})=>{
 await page.goto('/');
 const descriptions=await page.locator('.story-card p,.decision-card>p:last-child').allTextContents();
 expect(descriptions).toHaveLength(15);
 for(const description of descriptions){
  expect([...description.trim()].length,description).toBeLessThanOrEqual(40);
 }
});
test('all supporting prose stays concise outside page titles and descriptions',async({page})=>{
 await page.goto('/');
 const copy=await page.locator('.slide p:not(.lead):not(.formula),.slide h2,.slide h3,.slide summary,.slide caption,.slide th,.slide td,.slide dt,.slide dd,.slide li').evaluateAll(nodes=>nodes.map(node=>({text:node.textContent.replace(/\s+/g,' ').trim(),tag:node.tagName.toLowerCase(),className:node.className||''})).filter(x=>x.text));
 for(const item of copy){
  expect([...item.text].length,item.tag+' '+item.className+': '+item.text).toBeLessThanOrEqual(45);
 }
 await expect(page.locator('#section-02')).toContainText('시장·경쟁은 공개 자료로 검토. 유료 의향은 면담·가격 실험으로 검증.');
 await expect(page.locator('#section-03')).toContainText('초기 모델은 운영자 제휴형. 직접 운영·구독은 후속 대안.');
 await expect(page.locator('#section-05')).toContainText('손익분기 · 현금 1,765건 / 기회비용 포함 7,648건');
 await expect(page.locator('#section-08')).toContainText('2027 상반기 가상 데이터, 하반기 공급 전망.');
});

test('case-study body copy stays concise and terminology stays consistent',async({page})=>{
 await page.goto('/');
 const bodyParagraphs=await page.locator('.track p:not(.lead)').evaluateAll(nodes=>nodes.map(n=>n.innerText.trim()).filter(Boolean));
 expect(bodyParagraphs.filter(t=>t.length>85)).toEqual([]);
 for(const phrase of ['시장·경쟁은 공개 자료로 검토. 유료 의향은 면담·가격 실험으로 검증.','수수료 매출 차이 − 취소·노쇼 비용 − 완료 건 비용 − 고정비 차이','유지율=실제 공급처 비중. 플랫폼 예약 비중 48%(기준 −20%).','예산 · 구축 300만 / 월 기회비용 200만 / 시범 50만 원.'])await expect(page.locator('.track')).toContainText(phrase);
 for(const url of ['/src/case-study/materials.html','/src/case-study/forecast.html','/src/case-study/decision-memos.html']){
  await page.goto(url);
  const body=page.locator('body');
  await expect(body).not.toContainText('무단 불참');
  await expect(body).not.toContainText('획득비');
  const longParagraphs=await page.locator('main p').evaluateAll(nodes=>nodes.map(n=>n.innerText.trim()).filter(t=>t.length>165));
  expect(longParagraphs,url).toEqual([]);
 }
 await page.goto('/src/case-study/materials.html');
 for(const phrase of ['가정을 바꿔 손익 변화를 확인하세요.','2027년 가상 예약 데이터입니다.','기회비용 포함 9,660만 원'])await expect(page.locator('body')).toContainText(phrase);
 await page.goto('/src/case-study/forecast.html');
 for(const phrase of ['기준 5곳과 별도인 확대안입니다.','손익분기 공급처: 1~500곳 중 월 손익이 0 이상인 최소 수.','실제 수요·계약 미검증.'])await expect(page.locator('body')).toContainText(phrase);
 await page.goto('/src/case-study/decision-memos.html');
 for(const phrase of ['초기 운영은 운영자 제휴형으로 추진합니다.','월 손익 −2,387,160원','실제 계약 효과는 미검증입니다.'])await expect(page.locator('body')).toContainText(phrase);
});
