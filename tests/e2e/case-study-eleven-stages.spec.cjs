// Current eleven-section Case Study contract.
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
   expect(new URL(page.url()).hash).toBe('');
   await expect(page.locator('.topbar-count')).toHaveText(`${String(i+1).padStart(2,'0')} / 11`);
   await expect(page.locator('.toc-item').nth(i)).toHaveAttribute('aria-current','step');
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
   await slide.locator('details').evaluateAll(nodes=>nodes.forEach(n=>n.open=true));
   for(const image of await slide.locator('img').all()){
    await image.scrollIntoViewIfNeeded();await expect.poll(()=>image.evaluate(n=>n.complete&&n.naturalWidth>0)).toBe(true);
   }
   const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(scan.violations).toEqual([]);
   await page.waitForTimeout(200);
   if(width===1920)await testInfo.attach(`section-${i+1}-${width}`,{body:await page.screenshot({fullPage:true,animations:'disabled'}),contentType:'image/png'});
  }
  await expect(page.locator('.btn-next')).toBeDisabled();expect(errors).toEqual([]);
 });
}

test('section history, keyboard, deep links and reload retain their contract',async({page})=>{
 await page.goto('/#section-05');await expect(page.locator('.slide:visible')).toHaveAttribute('aria-label','IA & Navigation');
 await page.locator('.btn-next').click();await expect(page.locator('.slide:visible')).toHaveAttribute('aria-label','Flowchart & Recovery');await expect(page.locator('.slide:visible h1')).toBeFocused();
 await page.goBack();expect(new URL(page.url()).hash).toBe('');await expect(page.locator('.slide:visible')).toHaveAttribute('aria-label','IA & Navigation');
 await page.keyboard.press('ArrowLeft');await expect(page.locator('.slide:visible')).toHaveAttribute('aria-label','Scope & Priorities');
 await page.locator('.slide:visible summary').click();await expect(page.locator('.slide:visible details')).toHaveAttribute('open','');
 await page.reload();expect(new URL(page.url()).hash).toBe('');await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);
});

test('public Demo is linked and prototype wireframes are disclosed',async({page})=>{
 await page.goto('/');await expect(page.locator('#section-01 a[href="/demo"]')).toHaveCount(1);
 await expect(page.locator('#section-01')).toContainText('조건 선택 → AI 추천 → 참가 시 카카오·구글 로그인');
 await page.locator('.toc-item').nth(6).click();await expect(page.locator('#section-07 .wireframe-record')).toHaveCount(5);
 await expect(page.locator('#section-07')).toContainText('초기 프로토타입 와이어프레임');
 await expect(page.locator('#section-07 a[href*="figma.com/design/rvhwFauZFBsSnvHYitohgC"]')).toHaveCount(1);
 await page.locator('.toc-item').nth(8).click();await expect(page.locator('#section-09 a[href="/demo"]')).toHaveCount(0);
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
 const dialog=page.getByRole('dialog',{name:'홈 · 와이어프레임',exact:true});await expect(dialog).toBeVisible();
 await expect(dialog.locator('img')).toHaveAttribute('src',await preview.getAttribute('data-image'));
 await expect(page.getByRole('button',{name:'닫기 ×',exact:true})).toBeFocused();
 await page.keyboard.press('ArrowRight');expect(new URL(page.url()).hash).toBe('');
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
 test(`desktop shell and balanced overview preview remain at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:1080});await page.goto('/');
  const box=await page.locator('.fm-cs-shell').boundingBox();expect(box.width).toBe(1360);expect(Math.abs(box.x-(width-1360)/2)).toBeLessThan(2);
  const evidenceImage=page.locator('#section-01 .product-figure img');
  await expect.poll(()=>evidenceImage.evaluate(n=>n.complete&&n.naturalWidth>0)).toBe(true);
  const ratio=await evidenceImage.evaluate(n=>({rendered:n.getBoundingClientRect().width/n.getBoundingClientRect().height,original:n.naturalWidth/n.naturalHeight}));
  expect(await evidenceImage.evaluate(n=>n.getBoundingClientRect().height)).toBeLessThanOrEqual(420);
  await expect(evidenceImage).toHaveCSS('object-fit','cover');
  await expect(page.locator('.sidebar')).toHaveCSS('width','220px');
  for(let i=0;i<11;i++){
   await page.locator('.toc-item').nth(i).click();await expect(page.locator('.slide:visible .section-head h1')).toHaveCSS('font-size',i===0?'28px':'32px');
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  }
 });
}

for(const width of [320,390,1440,1920]){
 test('card typography and disclosure open/closed QA at '+width+'px',async({page},testInfo)=>{
  await page.setViewportSize({width,height:1080});await page.goto('/');
  const report=[];
  for(let i=0;i<11;i++){
   await page.locator('.toc-item').nth(i).click();
   const section=page.locator('.slide:visible');
   for(const disclosure of await section.locator('details').all()){
    const summary=disclosure.locator(':scope > summary');
    await summary.click();await expect(disclosure).toHaveAttribute('open','');
    await summary.click();await expect(disclosure).not.toHaveAttribute('open','');
    await summary.press('Enter');await expect(disclosure).toHaveAttribute('open','');
   }
   const audit=await section.evaluate(slide=>{
    const failures=[],cards=[];
    for(const card of slide.querySelectorAll('.story-card,.priority-card,.wireframe-record,.closing-note,.persona-panel,.jtbd-panel,.ia-branches article,.journey-map article')){
     const box=card.getBoundingClientRect(),css=getComputedStyle(card),texts=[];
     for(const node of card.querySelectorAll('h2,h3,p,dt,dd,li')){
      if(!node.getClientRects().length)continue;
      const b=node.getBoundingClientRect(),s=getComputedStyle(node),range=document.createRange();range.selectNodeContents(node);
      const rects=[...range.getClientRects()].filter(r=>r.width>0);
      if(rects.some(r=>r.left<b.left-2||r.right>b.right+2))failures.push(node.textContent+' text overflow');
      if(parseFloat(s.lineHeight)<parseFloat(s.fontSize)*1.5)failures.push(node.textContent+' tight leading');
      texts.push({text:node.textContent,size:parseFloat(s.fontSize),line:parseFloat(s.lineHeight)});
     }
     cards.push({class:card.className,width:box.width,height:box.height,padding:css.padding,texts});
    }
    for(const detail of slide.querySelectorAll('details[open]')){
     const body=detail.querySelector(':scope > .detail-body');if(!body)continue;
     const p=parseFloat(getComputedStyle(body).paddingTop);
     if(p<18)failures.push('disclosure has no top inset');
     for(const table of body.querySelectorAll('.table-wrap'))if(table.scrollWidth>table.clientWidth+1)failures.push('disclosure table overflow');
    }
    return {section:slide.id,failures,cards,overflow:document.documentElement.scrollWidth>innerWidth+1};
   });
   expect(audit.failures).toEqual([]);expect(audit.overflow).toBe(false);report.push(audit);
   if(width===1920){
    await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo(0,0);});
    await page.waitForTimeout(220);await testInfo.attach('card-qa-'+(i+1)+'-'+width,{body:await page.screenshot({fullPage:true,animations:'disabled'}),contentType:'image/png'});
   }
   if(width===1920){
    await page.locator('.slide:visible details').evaluateAll(nodes=>nodes.forEach(n=>n.open=false));
    await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo(0,0);});
    await testInfo.attach('card-qa-closed-'+(i+1)+'-'+width,{body:await page.screenshot({fullPage:true,animations:'disabled'}),contentType:'image/png'});
   }
  }
  await testInfo.attach('card-typography-and-disclosure-audit',{body:JSON.stringify(report,null,2),contentType:'application/json'});
 });
}

for(const width of [390,1440]){
 for(const mode of ['fallback','text-200-percent']){
  test('card typography '+mode+' at '+width+'px',async({page},testInfo)=>{
   if(mode==='fallback')await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//,route=>route.abort());
   await page.setViewportSize({width,height:1080});await page.goto('/');await page.evaluate(()=>document.fonts.ready);
   if(mode==='text-200-percent')await page.locator('.slide *').evaluateAll(nodes=>{
    const values=nodes.map(node=>({node,size:parseFloat(getComputedStyle(node).fontSize),line:parseFloat(getComputedStyle(node).lineHeight)}));
    for(const {node,size,line}of values){node.style.setProperty('font-size',size*2+'px','important');if(Number.isFinite(line))node.style.setProperty('line-height',line*2+'px','important');}
   });
   const report=[];
   for(let i=0;i<11;i++){
    await page.locator('.toc-item').nth(i).click();await page.locator('.slide:visible details').evaluateAll(nodes=>nodes.forEach(n=>n.open=true));
    const audit=await page.locator('.slide:visible').evaluate(slide=>{
     const failures=[];
     for(const n of slide.querySelectorAll('h1,h2,h3,p,dt,dd,li,th,td')){
      if(!n.getClientRects().length)continue;
      const b=n.getBoundingClientRect(),walker=document.createTreeWalker(n,NodeFilter.SHOW_TEXT);let child;
      while((child=walker.nextNode())){if(!child.textContent.trim())continue;const range=document.createRange();range.selectNodeContents(child);for(const r of range.getClientRects())if(r.width>0&&(r.left<b.left-2||r.right>b.right+2))failures.push(n.textContent.slice(0,60));}
     }
     return {section:slide.id,failures:[...new Set(failures)],overflow:document.documentElement.scrollWidth>innerWidth+1};
    });
    expect(audit.failures).toEqual([]);expect(audit.overflow).toBe(false);report.push(audit);
   }
   await testInfo.attach('card-font-adaptation',{body:JSON.stringify({width,mode,report},null,2),contentType:'application/json'});
  });
 }
}

for(const reducedMotion of ['no-preference','reduce']){
 test('desktop navigation and disclosures settle with '+reducedMotion+' motion',async({page},testInfo)=>{
  await page.emulateMedia({reducedMotion});
  await page.setViewportSize({width:1920,height:1080});
  await page.goto('/');await page.evaluate(()=>document.fonts.ready);
  await page.locator('.toc-item').nth(7).click();
  await page.locator('#section-08 summary').click();
  await expect(page.locator('#section-08 details')).toHaveAttribute('open','');
  if(reducedMotion==='reduce'){
   expect(await page.locator('#section-08').evaluate(n=>n.getAnimations({subtree:true}).filter(a=>a.playState==='running').length)).toBe(0);
  }
  await expect.poll(()=>page.locator('#section-08').evaluate(n=>n.getAnimations({subtree:true}).filter(a=>a.playState==='running').length)).toBe(0);
  await expect(page.locator('#section-08')).toHaveCSS('opacity','1');
  await expect(page.locator('#section-08 .detail-body')).toHaveCSS('transform','none');
  await expect(page.locator('#section-08 .detail-body')).toHaveCSS('opacity','1');
  await page.locator('#section-08 summary').press('Enter');
  await expect(page.locator('#section-08 details')).not.toHaveAttribute('open','');
  await page.locator('.btn-next').click();
  expect(new URL(page.url()).hash).toBe('');
  await expect(page.locator('#section-09 h1')).toBeFocused();
  await expect.poll(()=>page.locator('#section-09').evaluate(n=>n.getAnimations({subtree:true}).filter(a=>a.playState==='running').length)).toBe(0);
  expect(await page.evaluate(()=>scrollX)).toBe(0);
  await testInfo.attach('motion-settings',{body:JSON.stringify({reducedMotion,viewport:'1920x1080',settled:true}),contentType:'application/json'});
 });
}

test('wireframe gallery moves through five screens and restores the opening card',async({page})=>{
 await page.goto('/#section-07');
 const opening=page.getByRole('button',{name:'홈 · 와이어프레임 확대',exact:true});
 await opening.click();
 await expect(page.getByRole('dialog',{name:'홈 · 와이어프레임',exact:true})).toBeVisible();
 await expect(page.locator('.image-dialog-position')).toHaveText('01 / 05');
 await expect(page.getByRole('button',{name:'이전 와이어프레임',exact:true})).toBeDisabled();
 for(let index=1;index<5;index++){
  await page.getByRole('button',{name:'다음 와이어프레임',exact:true}).click();
  await expect(page.locator('.image-dialog-position')).toHaveText(String(index+1).padStart(2,'0')+' / 05');
 }
 await expect(page.getByRole('dialog',{name:'시작 화면 · 와이어프레임',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'다음 와이어프레임',exact:true})).toBeDisabled();
 await page.keyboard.press('ArrowLeft');
 await expect(page.getByRole('dialog',{name:'참가 시 로그인 · 와이어프레임',exact:true})).toBeVisible();
 expect(new URL(page.url()).hash).toBe('');
 await page.keyboard.press('Escape');
 await expect(page.locator('.image-dialog')).not.toBeVisible();
 await expect(opening).toBeFocused();
});

test('single evidence image does not display wireframe gallery controls',async({page})=>{
 await page.goto('/');
 await page.locator('#section-01 .evidence-preview').click();
 await expect(page.locator('.image-dialog')).toBeVisible();
 await expect(page.locator('.image-dialog-navigation')).toBeHidden();
 await expect(page.locator('.image-dialog-caption')).toContainText('원본 크기');
 await page.keyboard.press('Escape');
 await expect(page.locator('#section-01 .evidence-preview')).toBeFocused();
});

test('task steps and exception buttons connect their numbered paths',async({page})=>{
 await page.goto('/#section-06');
 const steps=page.locator('#section-06 .flow-step-button');
 const gates=page.locator('#section-06 .flow-gate-button');
 await steps.nth(3).click();
 await expect(gates.nth(0)).toHaveAttribute('aria-pressed','true');
 await expect(gates.nth(1)).toHaveAttribute('aria-pressed','true');
 await expect(gates.nth(2)).toHaveAttribute('aria-pressed','false');
 await gates.nth(2).focus();await page.keyboard.press('Enter');
 await expect(steps.nth(2)).toHaveAttribute('aria-pressed','true');
 await expect(steps.nth(4)).toHaveAttribute('aria-pressed','true');
 await expect(steps.nth(3)).toHaveAttribute('aria-pressed','false');
 await expect(page.locator('.flow-selection-status')).toContainText('03 · 05');
 expect(new URL(page.url()).hash).toBe('');
});

for(const width of [390,1440]){
 test('reader enhancements remain usable and accessible at '+width+'px',async({page})=>{
  await page.setViewportSize({width,height:1080});await page.goto('/#section-07');
  await page.getByRole('button',{name:'경기 상세 · 와이어프레임 확대',exact:true}).click();
  await expect(page.locator('.image-dialog-caption')).toContainText('경기 정보·모집 포지션');
  expect(await page.locator('.image-dialog').evaluate(n=>n.scrollWidth<=n.clientWidth+1)).toBe(true);
  await expect(page.getByRole('button',{name:'닫기 ×',exact:true})).toBeFocused();
  let scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(scan.violations).toEqual([]);
  await page.keyboard.press('Escape');
  await page.locator('.toc-item').nth(5).click();await page.locator('.flow-step-button').nth(2).click();
  scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(scan.violations).toEqual([]);
  await page.locator('.toc-item').nth(9).click();
  await expect(page.locator('.qa-confirmed-result')).toHaveCount(3);
  await expect(page.locator('#qa-table-hint')).toContainText('전환율·만족도 개선 성과를 의미하지 않음');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 });
}

for(const width of [320,390,1440,1920]){
 test('compact previews retain native-size enlargement at '+width+'px',async({page})=>{
  await page.setViewportSize({width,height:1080});await page.goto('/#section-07');
  const images=page.locator('#section-07 .wireframe-record img');
  await expect(images).toHaveCount(5);
  for(const img of await images.all()){
   await img.scrollIntoViewIfNeeded();
   await expect.poll(()=>img.evaluate(n=>n.complete&&n.naturalWidth>0)).toBe(true);
   const metrics=await img.evaluate(n=>({natural:n.naturalWidth,height:n.getBoundingClientRect().height}));
   expect(metrics.natural).toBeLessThanOrEqual(560);
   expect(metrics.height).toBeLessThanOrEqual(280);
   await expect(img).toHaveCSS('object-fit','contain');
   await expect(img).toHaveAttribute('src',/current-wireframe-.*\.svg$/);
  }
  await page.locator('#section-07 .evidence-preview').first().click();
  const expanded=page.locator('.image-dialog-body img');
  expect(await expanded.evaluate(n=>n.getBoundingClientRect().width/n.naturalWidth)).toBeGreaterThanOrEqual(1);
  expect(await page.getByRole('dialog').evaluate(n=>n.scrollWidth<=n.clientWidth+1)).toBe(true);
  await expect(page.locator('.image-dialog-caption')).toContainText('좌우로 이동');
  await page.keyboard.press('Escape');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 });
}
test('same-source readability comparison retains original and cropped evidence',async({page})=>{
 await page.setViewportSize({width:1920,height:1080});await page.goto('/#section-10');
 const before=page.locator('.ui-compare-window img'),after=page.locator('.ui-compare .evidence-preview img');
 await before.scrollIntoViewIfNeeded();await expect.poll(()=>before.evaluate(n=>n.complete&&n.naturalWidth>0)).toBe(true);
 await after.scrollIntoViewIfNeeded();await expect.poll(()=>after.evaluate(n=>n.complete&&n.naturalWidth>0)).toBe(true);
 expect(await before.evaluate(n=>n.naturalWidth)).toBe(1920);
 expect(await after.evaluate(n=>n.naturalWidth)).toBe(560);
 await expect(page.locator('#section-10')).toContainText('같은 캡처·같은 경기·같은 문구');
 for(const number of ['05','06','08','09'])expect(await page.locator('#section-'+number+' .ui-evidence img').count()).toBeGreaterThanOrEqual(2);
});

for(const width of [1440,1920]){
 test('image composition follows text height and limits section length at '+width+'px',async({page},testInfo)=>{
  await page.setViewportSize({width,height:1080});await page.goto('/');
  const overview=await page.locator('#section-01').evaluate(s=>{
   const text=s.querySelector('.overview-grid>div').getBoundingClientRect(),figure=s.querySelector('.product-figure').getBoundingClientRect();
   return {text:text.height,figure:figure.height,height:s.getBoundingClientRect().height};
  });
  expect(Math.abs(overview.figure-overview.text)).toBeLessThanOrEqual(2);
  expect(overview.figure).toBeLessThan(560);
  expect(overview.height).toBeLessThan(1100);
  const report=[{section:1,...overview}];
  for(const index of [4,5,6,7,8,9]){
   await page.locator('.toc-item').nth(index).click();
   const slide=page.locator('.slide:visible');
   for(const image of await slide.locator('.evidence-preview img:visible').all()){
    await image.scrollIntoViewIfNeeded();
    await expect.poll(()=>image.evaluate(n=>n.complete&&n.naturalWidth>0)).toBe(true);
   }
   const metrics=await slide.evaluate(s=>({section:s.id,height:s.getBoundingClientRect().height,images:[...s.querySelectorAll('.evidence-preview img')].filter(n=>n.getClientRects().length).map(n=>n.getBoundingClientRect().height)}));
   expect(metrics.images.length).toBeGreaterThan(0);
   expect(metrics.images.every(h=>h<=280)).toBe(true);
   if(index===6)expect(metrics.height).toBeLessThan(2800);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
   report.push(metrics);
  }
  await testInfo.attach('composition-and-scroll-audit',{body:JSON.stringify(report,null,2),contentType:'application/json'});
 });
}
