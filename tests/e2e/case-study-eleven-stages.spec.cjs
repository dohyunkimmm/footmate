// IT기획·전략기획 Case Study acceptance: content, source integrity, navigation and responsive reading.
const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
const titles=["추진 배경·검토 결론","시장·경쟁 분석","사업모델·역할","수요·공급 시나리오","수익성·손익분기점","IT 투자·시스템 구조","운영 위험·통제","실행계획·성과관리","종합 판단·근거"];
for(const width of [320,390,800,1440,1920]){
 test('strategy sections remain readable and accessible at '+width+'px',async({page},testInfo)=>{
  await page.setViewportSize({width,height:1080});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('.toc-item')).toHaveCount(9);
  await expect(page.locator('.dot')).toHaveCount(9);
  await expect(page.locator('.btn-prev')).toBeDisabled();
  for(let i=0;i<titles.length;i++){
   await page.locator('.toc-item').nth(i).click();
   const slide=page.locator('.slide:visible');
   await expect(slide).toHaveAttribute('aria-label',titles[i]);
   await expect(slide.locator('h1')).toBeFocused();
   await expect(page.locator('.topbar-count')).toHaveText(String(i+1).padStart(2,'0')+' / 09');
   await expect(page.locator('.toc-item').nth(i)).toHaveAttribute('aria-current','step');
   expect(new URL(page.url()).hash).toBe('');
   await slide.locator('details').evaluateAll(nodes=>nodes.forEach(n=>n.open=true));
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
   for(const table of await slide.locator('.table-wrap').all())expect(await table.evaluate(n=>n.scrollWidth<=n.clientWidth+1)).toBe(true);
   const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   expect(scan.violations).toEqual([]);
   if(width===1920||width===390)await testInfo.attach('strategy-'+(i+1)+'-'+width,{body:await page.screenshot({fullPage:true,animations:'disabled'}),contentType:'image/png'});
  }
  await expect(page.locator('.btn-next')).toBeDisabled();expect(errors).toEqual([]);
 });
}
test('history, direct links, keyboard and reload retain their navigation contract',async({page})=>{
 await page.goto('/#section-04');await expect(page.locator('.slide:visible')).toHaveAttribute('aria-label',titles[3]);
 await page.locator('.btn-next').click();await expect(page.locator('.slide:visible')).toHaveAttribute('aria-label',titles[4]);
 await page.goBack();await expect(page.locator('.slide:visible')).toHaveAttribute('aria-label',titles[3]);
 await page.keyboard.press('ArrowLeft');await expect(page.locator('.slide:visible')).toHaveAttribute('aria-label',titles[2]);
 const summary=page.locator('.slide:visible summary');await summary.click();await summary.press('Enter');
 await expect(page.locator('.slide:visible details')).not.toHaveAttribute('open','');
 await page.reload();await expect(page.locator('.slide:visible')).toHaveAttribute('aria-label',titles[0]);
});
test('business assumptions and actual implementation are visibly separate',async({page})=>{
 await page.goto('/');
 await expect(page.locator('#section-01 a[href="/demo"]')).toHaveCount(1);
 await expect(page.locator('.track')).not.toContainText('Persona');
 await expect(page.locator('.track')).not.toContainText('와이어프레임');
 await expect(page.locator('.track')).not.toContainText('User Research');
 await expect(page.locator('#section-04')).toContainText('월 완료 예약 · 반올림');
 await expect(page.locator('#section-04')).toContainText('1,169건');
 await expect(page.locator('#section-05')).toContainText('340원');
 await expect(page.locator('#section-05')).toContainText('1,765건');
 await expect(page.locator('#section-05')).toContainText('7,648건');
 await expect(page.locator('#section-05')).toContainText('−202,540원');
 await expect(page.locator('#section-05')).toContainText('가정');
 await expect(page.locator('#section-06')).toContainText('실제 PG·사업자 정산 미연동');
 await expect(page.locator('#section-08')).toContainText('계획이며 과거 수행 실적이 아니다');
 await expect(page.locator('#section-09 a[href*="mcst.go.kr"]')).toHaveCount(1);
});
test('200 percent text and reduced motion do not hide business evidence',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await page.addStyleTag({content:'.slide{font-size:30px}.slide p,.slide th,.slide td{font-size:28px!important;line-height:1.85!important}'});
 for(let i=0;i<titles.length;i++){
  await page.locator('.toc-item').nth(i).click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 }
});


for(const width of [320,390,1440]){
 test('typography preserves words and currency units at '+width+'px',async({page})=>{
  await page.setViewportSize({width,height:1080});await page.goto('/');await page.evaluate(()=>document.fonts.ready);
  for(let i=0;i<titles.length;i++){
   await page.locator('.toc-item').nth(i).click();
   await page.locator('.slide:visible details').evaluateAll(nodes=>nodes.forEach(n=>n.open=true));
   const failures=await page.locator('.slide:visible').evaluate(slide=>{
    const failures=[],canvas=document.createElement('canvas'),context=canvas.getContext('2d');
    for(const element of slide.querySelectorAll('p,li,th,td,caption,summary')){
     if(!element.getClientRects().length)continue;
     const style=getComputedStyle(element);context.font=style.font;
     const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT);let node;
     while((node=walker.nextNode())){
      const text=node.textContent;
      for(const match of text.matchAll(/[−-]?\d[\d,]*(?:원|건|명|곳|회|주)|[가-힣]{2,}/gu)){
       if(context.measureText(match[0]).width>element.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight))continue;
       const range=document.createRange();range.setStart(node,match.index);range.setEnd(node,match.index+match[0].length);
       const tops=[...range.getClientRects()].filter(r=>r.width>0).map(r=>Math.round(r.top));
       if(new Set(tops).size>1)failures.push(match[0]+' splits inside '+element.tagName);
      }
     }
    }
    return failures;
   });
   expect(failures).toEqual([]);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  }
  if(width<=800){
   await expect(page.locator('.btn-next')).toHaveCSS('font-size','14px');
   await page.locator('.toc-item').nth(4).click();
   const labelSize=await page.locator('.slide:visible td').first().evaluate(n=>getComputedStyle(n,'::before').fontSize);
   expect(labelSize).toBe('13px');
  }
 });
}
