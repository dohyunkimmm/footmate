const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
const titles=['Overview & Problem','Persona & JTBD','Journey Map','Scope & Priorities','IA & UX Flow','Design Decisions & Demo','Validation & Metrics','Reflection','Next Steps'];

for(const width of [1920,1440,800,390,320]){
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
      await expect(page.locator('.slide:visible a[href*="github.com"]')).toHaveCount(0);
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
  await expect(page.locator('.slide:visible')).toContainText('실제 이용 기준값·목표치는 미확보');
  await page.getByText('8개 KPI의 계산·관찰 기준',{exact:true}).click();
  await expect(page.locator('.slide:visible details tbody tr')).toHaveCount(8);
  await page.reload();
  await expect(page).toHaveURL(/#section-01$/);
  await expect(page.getByRole('region',{name:'Overview & Problem',exact:true})).toBeVisible();
  await page.locator('.toc-item').first().click();
  await expect(page.getByRole('link',{name:'Interactive Demo 체험하기',exact:true})).toHaveAttribute('href','/demo');
  await expect(page.getByRole('link',{name:'Closed Beta 살펴보기',exact:true})).toHaveAttribute('href','/beta');
  await expect(page.locator('#section-01 .experience-disclosure')).toContainText('체험용 데이터 · 실제 참가·결제 없음');
  await expect(page.locator('#section-01 .experience-disclosure')).toContainText('실제 서버 연결 · 무료 참가 · 결제 없음');
});

test('body copy stays concise outside section intros, including collapsed details',async({page})=>{
  await page.goto('/');
  const audit=await page.locator('.slide').evaluateAll(slides=>slides.map(slide=>{
    const nodes=[...slide.querySelectorAll('h2,h3,p,blockquote,li,summary,td,th,figcaption,.decision-path')]
      .filter(node=>!node.closest('.section-head')&&!node.querySelector('h2,h3,p,li,td,th'));
    const blocks=nodes.map(node=>node.textContent.trim()).filter(Boolean);
    const sentences=blocks.filter(text=>/(?:습니다|합니다|입니다|싶다)[.!?]/.test(text));
    const longLines=nodes.flatMap(node=>{
      const copy=node.cloneNode(true);
      copy.querySelectorAll('br').forEach(br=>br.replaceWith('\n'));
      return copy.textContent.split('\n').map(line=>line.trim());
    }).filter(line=>line.length>65);
    const seen=new Set();
    const duplicates=blocks.filter(text=>{if(seen.has(text))return true;seen.add(text);return false;});
    return {section:slide.id,sentences,longLines,duplicates};
  }));
  expect(audit).toHaveLength(9);
  for(const result of audit){
    expect(result.sentences,result.section+' sentence endings').toEqual([]);
    expect(result.longLines,result.section+' long body lines').toEqual([]);
    expect(result.duplicates,result.section+' duplicate copy').toEqual([]);
  }
});


// Current nine-stage typography contract. Background and production CSS are unchanged.
const typographyWidths=[320,390,800,801,1100,1101,1440,1920];
async function typographyAudit(page){
  return page.locator('.slide:visible').evaluate(slide=>{
    const failures=[],review=[];
    const describe=node=>node.tagName.toLowerCase()+(node.className?'.'+String(node.className).trim().replace(/\s+/g,'.'):'');
    const textNodes=[...slide.querySelectorAll('h1,h2,h3,p,blockquote,li,summary,td,th,figcaption,dt,dd,.eyebrow,.flow strong,.flow span')];
    for(const node of textNodes){
      if(!node.getClientRects().length)continue;
      const css=getComputedStyle(node),box=node.getBoundingClientRect();
      const size=parseFloat(css.fontSize),line=parseFloat(css.lineHeight);
      const label=describe(node)+' '+node.textContent.trim().slice(0,55);
      if(!Number.isFinite(size)||size<10)failures.push(label+': font below 10px');
      const roleMinimum=node.matches('.journey-map p,td,th,.story-card p,.priority-card p,.decision-row p:not(.small-copy),.next-list p:not(.small-copy),.detail-body p')?13:
        node.matches('.small-copy,.source-note,figcaption,.flow span,dt,dd')?12:
        node.matches('.eyebrow')?11:10;
      if(size<roleMinimum)failures.push(label+': role minimum '+roleMinimum+'px');

      if(!Number.isFinite(line)||line<size*1.3)failures.push(label+': line-height below 1.3');
      // Direct text only: nested paragraph/list boxes must not be counted twice.
      const rects=[];
      const textWalker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);let child;
      while((child=textWalker.nextNode())){
        if(!child.textContent.trim()||child.parentElement.closest('.sr-only'))continue;
        const range=document.createRange();range.selectNodeContents(child);
        rects.push(...range.getClientRects());range.detach();
      }
      for(const rect of rects){
        if(rect.width<1)continue;
        if(rect.left<box.left-2||rect.right>box.right+2)
          failures.push(label+': text extends outside its block');
        for(let parent=node;parent&&parent!==document.body;parent=parent.parentElement){
          const style=getComputedStyle(parent),bounds=parent.getBoundingClientRect();
          if(/hidden|clip/.test(style.overflowX)&&(rect.left<bounds.left-2||rect.right>bounds.right+2))
            failures.push(label+': horizontally clipped by '+describe(parent));
          if(/hidden|clip/.test(style.overflowY)&&(rect.top<bounds.top-2||rect.bottom>bounds.bottom+2))
            failures.push(label+': vertically clipped by '+describe(parent));
        }
      }
      if(node.matches('h1,h2,h3')){
        const lines=[...new Set(rects.map(rect=>Math.round(rect.top)))];
        if(lines.length>3)review.push({label,lines:lines.length,reason:'long heading; manual review'});
        const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);
        const lineWidths=new Map();let child;
        while((child=walker.nextNode())){
          if(!child.textContent.trim())continue;
          const range=document.createRange();range.selectNodeContents(child);
          for(const rect of range.getClientRects()){
            if(rect.width<1)continue;
            const key=Math.round(rect.top),current=lineWidths.get(key)||{left:rect.left,right:rect.right};
            current.left=Math.min(current.left,rect.left);current.right=Math.max(current.right,rect.right);lineWidths.set(key,current);
          }
        }
        const actualLines=[...lineWidths.values()].map(rect=>rect.right-rect.left);
        if(actualLines.length>1&&actualLines.at(-1)<Math.max(...actualLines)*.25)
          review.push({label,lines:actualLines.length,reason:'short final heading line; manual review',widths:actualLines});
      }
    }
    const heading=getComputedStyle(slide.querySelector('.section-head h1'));
    return {section:slide.id,failures:[...new Set(failures)],review,
      body:[...slide.querySelectorAll('.lead,.story-card p,.priority-card p,.decision-row p,.next-list p:not(.small-copy)')].filter(node=>node.getClientRects().length).map(node=>{const style=getComputedStyle(node);return {selector:describe(node),lead:node.matches('.lead'),readableBody:node.matches('.story-card p,.priority-card p,.decision-row p:not(.small-copy)'),size:parseFloat(style.fontSize),line:parseFloat(style.lineHeight)};}),
      heading:{size:parseFloat(heading.fontSize),weight:heading.fontWeight,line:parseFloat(heading.lineHeight),tracking:parseFloat(heading.letterSpacing)}};
  });
}
for(const fonts of ['normal','fallback']){
  for(const width of typographyWidths){
    test('typography '+fonts+' at '+width+'px',async({page},testInfo)=>{
      if(fonts==='fallback')await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//,route=>route.abort());
      await page.setViewportSize({width,height:900});
      await page.goto('/');
      await page.evaluate(()=>document.fonts.ready);
      await expect(page.locator('.toc-item')).toHaveCount(9);
      const fontState=await page.evaluate(()=>({
        family:getComputedStyle(document.body).fontFamily,
        faces:[...document.fonts].map(face=>({family:face.family,weight:face.weight,status:face.status})),
        background:getComputedStyle(document.body).backgroundColor
      }));
      expect(fontState.background).toBe('rgb(255, 255, 255)');
      expect(fontState.family).toContain('Inter');
      expect(fontState.family).toContain('Noto Sans KR');
      // A failed external font load is reported explicitly rather than confused with loaded-font coverage.
      const requiredFaces=await page.evaluate(async()=>{
        const requirements=[['Inter','500','FootMate'],['Inter','700','FootMate'],['Inter','800','FootMate'],['Noto Sans KR','400','경기 참가'],['Noto Sans KR','700','경기 참가'],['Noto Sans KR','800','경기 참가']];
        return Promise.all(requirements.map(async([family,weight,sample])=>{
          let faces=[];try{faces=await document.fonts.load(weight+' 16px "'+family+'"',sample);}catch{}
          return {family,weight,loaded:faces.length>0&&faces.every(face=>face.status==='loaded')};
        }));
      });
      const coverage=fonts==='fallback'?'forced fallback':requiredFaces.every(face=>face.loaded)?'required webfonts loaded':'required webfonts unavailable; fallback coverage';
      await testInfo.attach('required-font-coverage',{body:JSON.stringify({coverage,requiredFaces},null,2),contentType:'application/json'});
      if(fonts==='fallback')expect(requiredFaces.every(face=>!face.loaded)).toBe(true);
      const audits=[];
      for(let i=0;i<9;i++){
        await page.locator('.toc-item').nth(i).click();
        await expect(page.locator('.slide:visible')).toHaveCount(1);
        await page.locator('.slide:visible details').evaluateAll(nodes=>nodes.forEach(node=>node.open=true));
        const result=await typographyAudit(page);audits.push(result);
        await testInfo.attach(result.section+'-typography',{body:JSON.stringify({width,coverage,fontState,result},null,2),contentType:'application/json'});
        for(const body of result.body){
          expect(body.size,result.section+' '+body.selector+' body size').toBe(body.lead?14:width>800?(body.readableBody?14:13):14);
          expect(body.line/body.size,result.section+' '+body.selector+' body leading').toBeGreaterThanOrEqual(1.7);
        }
        expect(result.failures,result.section+' text geometry').toEqual([]);
        const expected=width>800?34:width<=370?30:34;
        expect(result.heading.size,result.section+' title size').toBe(expected);
        expect(result.heading.weight,result.section+' title weight').toBe('800');
        expect(result.heading.line/result.heading.size).toBeCloseTo(width>800?1.4:1.3,2);
        expect(result.heading.tracking/result.heading.size).toBeCloseTo(-.055,3);
        expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
      }
      await testInfo.attach('typography-audit',{body:JSON.stringify({width,coverage,fontState,audits},null,2),contentType:'application/json'});
      if(fonts==='normal'&&[390,1440].includes(width)){
        await page.locator('.toc-item').first().click();
        await testInfo.attach('typography-overview',{body:await page.locator('.slide:visible').screenshot({animations:'disabled'}),contentType:'image/png'});
      }
    });
  }
}
test('typography audit detects text clipping and invalid line height',async({page})=>{
  await page.setViewportSize({width:390,height:900});await page.goto('/');
  await expect(page.locator('.slide:visible .lead')).toBeVisible();
  await page.locator('.slide:visible .lead').evaluate(node=>{
    node.style.cssText='width:20px;height:8px;overflow:hidden;white-space:nowrap;line-height:8px';
  });
  const audit=await typographyAudit(page);
  expect(audit.failures.some(message=>message.includes('line-height'))).toBe(true);
  expect(audit.failures.some(message=>message.includes('clipped'))).toBe(true);
});


async function alignmentAudit(page){
  return page.locator('.slide:visible').evaluate(slide=>{
    const failures=[];
    for(const grid of slide.querySelectorAll('.card-grid,.priority-grid,.ia-branches')){
      const rows=new Map();
      for(const card of grid.children){
        const top=Math.round(card.getBoundingClientRect().top),items=rows.get(top)||[];
        items.push(card);rows.set(top,items);
      }
      for(const cards of rows.values()){
        if(cards.length<2)continue;
        const headings=cards.map(card=>card.querySelector('h2,h3')).filter(Boolean);
        const tops=headings.map(node=>node.getBoundingClientRect().top);
        if(tops.length>1&&Math.max(...tops)-Math.min(...tops)>2)failures.push('card heading start positions differ');
      }
    }
    if(innerWidth>1100&&slide.id==='section-03'){
      const articles=[...slide.querySelectorAll('.journey-map article')];
      for(let row=0;row<3;row++){
        const boxes=articles.map(article=>article.querySelectorAll(':scope > div')[row].getBoundingClientRect());
        for(const edge of ['top','bottom']){
          const values=boxes.map(box=>box[edge]);
          if(Math.max(...values)-Math.min(...values)>2)failures.push('journey row '+row+' '+edge+' boundaries differ');
        }
      }
    }
    return [...new Set(failures)];
  });
}
async function typographyEvidence(page){
  return page.locator('.slide:visible').evaluate(slide=>{
    const result=[];
    for(const node of slide.querySelectorAll('h1,h2,h3,p,td,th,figcaption')){
      if(!node.getClientRects().length||node.classList.contains('sr-only'))continue;
      const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT),tops=new Set();let text;
      while((text=walker.nextNode())){
        if(!text.textContent.trim())continue;
        const range=document.createRange();range.selectNodeContents(text);
        for(const rect of range.getClientRects())if(rect.width>0)tops.add(Math.round(rect.top));
      }
      const box=node.getBoundingClientRect(),style=getComputedStyle(node);
      result.push({tag:node.tagName,text:node.textContent.trim(),lines:tops.size,height:box.height,size:parseFloat(style.fontSize)});
    }
    return result;
  });
}

for(const width of [390,801,1101,1440]){
  for(const mode of ['text-200-percent','user-text-spacing']){
    test('typography adaptation '+mode+' at '+width+'px',async({page},testInfo)=>{
      await page.setViewportSize({width,height:900});
      await page.goto('/');await page.evaluate(()=>document.fonts.ready);
      if(mode==='user-text-spacing')await page.addStyleTag({content:
        '.slide *{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}.slide p{margin-bottom:2em!important}'});
      if(mode==='text-200-percent'){
        await page.locator('.slide *').evaluateAll(nodes=>{
          const values=nodes.map(node=>{const s=getComputedStyle(node);return {node,size:parseFloat(s.fontSize),line:parseFloat(s.lineHeight),tracking:parseFloat(s.letterSpacing)};});
          for(const {node,size,line,tracking} of values){
            node.style.setProperty('font-size',size*2+'px','important');
            if(Number.isFinite(line))node.style.setProperty('line-height',line*2+'px','important');
            if(Number.isFinite(tracking))node.style.setProperty('letter-spacing',tracking*2+'px','important');
          }
        });
      }
      const results=[];
      for(let i=0;i<9;i++){
        await page.locator('.toc-item').nth(i).click();
        await page.locator('.slide:visible details').evaluateAll(nodes=>nodes.forEach(node=>node.open=true));
        const audit=await typographyAudit(page),alignment=await alignmentAudit(page);
        results.push({audit,alignment});
        expect(audit.failures,audit.section+' '+mode).toEqual([]);
        expect(alignment,audit.section+' alignment '+mode).toEqual([]);
        expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
        await expect(page.locator('.slide:visible h1')).toBeVisible();
        // Controls stay usable even when the content grows beyond the viewport.
        await page.locator('.btn-next').scrollIntoViewIfNeeded();
        await expect(page.locator('.btn-next')).toBeVisible();
      }
      await testInfo.attach('adaptation-audit',{body:JSON.stringify({width,mode,results},null,2),contentType:'application/json'});
    });
  }
}

test('typography alignment audit detects a shifted journey row',async({page})=>{
  await page.setViewportSize({width:1440,height:900});await page.goto('/#section-03');
  expect(await alignmentAudit(page)).toEqual([]);
  await page.locator('#section-03 .journey-map article').nth(1).locator('.pain').evaluate(node=>node.style.transform='translateY(8px)');
  expect((await alignmentAudit(page)).some(message=>message.includes('boundaries'))).toBe(true);
});

for(const width of [390,1440]){
  test('webfont and fallback wrapping comparison at '+width+'px',async({browser},testInfo)=>{
    const observations={};
    for(const mode of ['webfont','fallback']){
      const context=await browser.newContext({viewport:{width,height:900}});
      const page=await context.newPage();
      if(mode==='fallback')await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//,route=>route.abort());
      await page.goto(testInfo.project.use.baseURL||'http://127.0.0.1:4173');
      await page.evaluate(()=>document.fonts.ready);
      observations[mode]=[];
      for(let i=0;i<9;i++){
        await page.locator('.toc-item').nth(i).click();
        await page.locator('.slide:visible details').evaluateAll(nodes=>nodes.forEach(node=>node.open=true));
        observations[mode].push({section:i+1,blocks:await typographyEvidence(page),alignment:await alignmentAudit(page)});
        await testInfo.attach('section-'+(i+1)+'-'+mode+'-'+width,{body:await page.locator('.slide:visible').screenshot({animations:'disabled'}),contentType:'image/png'});
      }
      await context.close();
    }
    const differences=[];
    observations.webfont.forEach((section,i)=>section.blocks.forEach((block,j)=>{
      const fallback=observations.fallback[i].blocks[j];
      if(fallback&&(block.lines!==fallback.lines||Math.abs(block.height-fallback.height)>2))
        differences.push({section:section.section,text:block.text,webfont:{lines:block.lines,height:block.height},fallback:{lines:fallback.lines,height:fallback.height},reason:'font-dependent wrapping; review'});
    }));
    await testInfo.attach('font-wrap-comparison',{body:JSON.stringify({width,observations,differences},null,2),contentType:'application/json'});
    for(const sections of Object.values(observations))for(const section of sections)expect(section.alignment).toEqual([]);
  });
}

test('visual evidence, scope and mobile reading cues stay coherent',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/#section-06');
  await expect(page.locator('#section-06 img[src*="recovery-participation-failure"]')).toHaveCount(0);
  await expect(page.locator('.recovery-diagram')).toContainText('현재 복구 흐름 · 구조 요약');
  await expect(page.locator('.recovery-diagram')).not.toContainText('결제');
  await page.getByRole('button',{name:'다음 섹션',exact:true}).click();
  await expect(page.locator('#qa-table-hint')).toBeVisible();
  await expect(page.locator('#section-07 .table-wrap').first()).toHaveAttribute('aria-describedby','qa-table-hint');
  const active=await page.locator('.toc-item.on').evaluate(node=>{
    const b=node.getBoundingClientRect(),parent=node.parentElement.getBoundingClientRect();
    return b.left>=parent.left-1&&b.right<=parent.right+1;
  });
  expect(active).toBe(true);
  await page.locator('#section-07 details summary').filter({hasText:'8개 KPI'}).click();
  await expect(page.locator('#kpi-table-hint')).toBeVisible();
  await page.locator('.toc-item').nth(4).click();
  await expect(page.locator('.flow-number')).toHaveText(['01','02','03','04','05','06']);
});

test('evidence images expand without changing section and restore keyboard focus',async({page})=>{
  await page.goto('/#section-06');
  const preview=page.locator('#section-06 .evidence-preview').first();
  await preview.click();
  const dialog=page.getByRole('dialog',{name:'조건 설정과 추천이 보이는 홈 화면',exact:true});
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('img')).toHaveAttribute('src',await preview.getAttribute('data-image'));
  await expect(page.getByRole('button',{name:'닫기 ×',exact:true})).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/#section-06$/);
  const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(scan.violations).toEqual([]);
  await page.keyboard.press('Tab');
  const imageRegion=dialog.getByRole('region',{name:'확대 이미지',exact:true});
  await expect(imageRegion).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect.poll(()=>imageRegion.evaluate(node=>node.scrollTop)).toBeGreaterThan(0);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(preview).toBeFocused();
  await preview.press('Enter');
  await expect(dialog).toBeVisible();
  await page.getByRole('button',{name:'닫기 ×',exact:true}).click();
  await expect(preview).toBeFocused();
});

test('mobile QA records expose complete problem, change and verification without horizontal scrolling',async({page})=>{
  await page.setViewportSize({width:320,height:844});
  await page.goto('/#section-07');
  const records=page.locator('.qa-evidence-table');
  await expect(records.locator('tbody tr')).toHaveCount(3);
  await expect(records.getByRole('cell',{name:'점검 항목 · 모바일 첫 화면의 추천 카드 노출·스크롤 범위 점검',exact:true})).toBeVisible();
  const geometry=await records.evaluate(node=>({width:node.clientWidth,scroll:node.scrollWidth,rows:[...node.querySelectorAll('tbody tr')].map(row=>row.getBoundingClientRect().top)}));
  expect(geometry.scroll).toBeLessThanOrEqual(geometry.width+1);
  expect(geometry.rows[1]).toBeGreaterThan(geometry.rows[0]);
  expect(geometry.rows[2]).toBeGreaterThan(geometry.rows[1]);
  await page.locator('#section-07 details summary').filter({hasText:'8개 KPI'}).click();
  expect(await page.locator('#section-07 .detail-body .table-wrap').evaluate(node=>node.clientWidth)).toBeGreaterThanOrEqual(280);
});

test('Typography QA: Case Study navigation, evidence hint and responsive headings',async({page})=>{
  await page.setViewportSize({width:320,height:900});
  await page.goto('/');
  await expect(page.locator('.toc-t').first()).toHaveCSS('font-size','13px');
  await expect(page.locator('body')).toHaveCSS('font-family',/Noto Sans KR/);
  await expect(page.locator('.slide:visible h1 br.cs-title-break')).toHaveCSS('display','none');
  await page.locator('.toc-item').nth(6).click();
  await page.getByText('8개 KPI의 계산·관찰 기준',{exact:true}).click();
  await expect(page.locator('#kpi-table-hint')).toBeVisible();
  await page.setViewportSize({width:1440,height:900});
  await expect(page.locator('.toc-s').first()).toHaveCSS('font-size','12px');
  await expect(page.locator('#kpi-table-hint')).toBeHidden();
  await page.locator('.toc-item').nth(2).click();
  await expect(page.locator('#section-03 .journey-map p').first()).toHaveCSS('font-size','14px');
  await page.locator('.toc-item').first().click();
  await expect(page.locator('#section-01 .story-card p').first()).toHaveCSS('font-size','14px');
});

// Portfolio P0–P2: explicit evidence boundaries and functioning content hierarchy.
for(const width of [320,390,1440,1920]){
  test('portfolio reasoning and evidence taxonomy at '+width+'px',async({page})=>{
    await page.setViewportSize({width,height:900});
    await page.goto('/#section-03');
    await expect(page.locator('#section-03 .journey-checkpoints > div')).toHaveCount(3);
    await page.locator('.toc-item').nth(4).click();
    await expect(page.locator('#section-05 .flow-gate-track > div')).toHaveCount(3);
    await page.locator('.toc-item').nth(5).click();
    await expect(page.locator('#section-06 .decision-proof')).toHaveCount(3);
    await expect(page.locator('#section-06 .decision-proof dt')).toHaveCount(12);
    await expect(page.locator('#section-06')).toContainText('서버 참가·정원 확인');
    await page.locator('.toc-item').nth(6).click();
    await expect(page.locator('#section-07 .validation-source-keys span')).toHaveCount(3);
    await expect(page.locator('#section-07')).toContainText('실제 측정 전');
    await expect(page.locator('#section-07 .portfolio-method-details')).toHaveCount(1);
    await expect(page.locator('#section-07 .portfolio-optional-sources .evidence-record')).toHaveCount(3);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  });
}

// GitHub is supplementary, not a prerequisite for understanding any of the nine pages.
for(const width of [320,390,1440]){
  test('07 and 09 explain evidence without external navigation at '+width+'px',async({page})=>{
    await page.setViewportSize({width,height:900});
    await page.goto('/#section-01');
    await expect(page.locator('#section-01 .experience-actions > a')).toHaveCount(2);
    const ctas=await page.locator('#section-01 .experience-actions > a').evaluateAll(nodes=>nodes.map(node=>({left:node.getBoundingClientRect().left,right:node.getBoundingClientRect().right})));
    expect(ctas.every(({left,right})=>left>=0&&right<=width+1)).toBe(true);
    await page.locator('.toc-item').nth(6).click();
    await expect(page.locator('#section-07 .portfolio-optional-sources .validation-doc-links')).toBeHidden();
    await page.locator('#section-07 .portfolio-method-details summary').click();
    await expect(page.locator('#section-07 .portfolio-task-grid article')).toHaveCount(4);
    await expect(page.locator('#section-07 .portfolio-method-details')).toContainText('개인별 발견·버그 빈도·수정 인과 미확정');
    await expect(page.locator('#section-07 .qa-evidence-table tbody tr')).toHaveCount(3);
    await page.locator('#section-07 details summary').filter({hasText:'8개 KPI'}).click();
    await expect(page.locator('#section-07 details:has(summary:has-text("8개 KPI")) table tbody tr')).toHaveCount(8);
    if(width<=800)await expect(page.locator('#section-07 #kpi-table-hint')).toBeVisible();
    else await expect(page.locator('#section-07 #kpi-table-hint')).toBeHidden();
    await page.locator('#section-07 .portfolio-optional-sources summary').click();
    await expect(page.locator('#section-07 .portfolio-optional-sources .evidence-record')).toHaveCount(3);
    await page.locator('.toc-item').nth(8).click();
    await expect(page.locator('#section-09 .next-list li')).toHaveCount(4);
    await expect(page.locator('#section-09 .technical-resources')).toContainText('프로젝트 증빙 · 기록 항목');
    await expect(page.locator('#section-09 .technical-resources .evidence-record')).toHaveCount(5);
    await expect(page.locator('#section-09 a[href*="github.com"]')).toHaveCount(0);
    await page.locator('.toc-item').nth(3).click();
    await page.locator('#section-04 details summary').click();
    await expect(page.locator('#section-04 details')).toContainText('Interactive Demo · 기능 체험');
    await expect(page.locator('#section-04 details')).toContainText('Closed Beta · 실제 서버 연결');
    await page.locator('.toc-item').nth(5).click();
    await expect(page.locator('#section-06 a[href="/beta"]')).toContainText('Closed Beta 살펴보기');
    await expect(page.locator('#section-06 a[href="/demo"]')).toContainText('Interactive Demo 체험하기');
    await expect(page.locator('#section-06')).toContainText('체험용 데이터 · 실제 결제·참가 없음');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  });
}
