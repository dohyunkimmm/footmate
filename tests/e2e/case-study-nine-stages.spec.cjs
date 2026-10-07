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
      for(const link of await page.locator('.slide:visible .evidence-link').all()){
        expect(await link.getAttribute('href')).toMatch(/^https:\/\/github\.com\/dohyunkimmm\/footmate(?:\/blob\/main\/docs\/[A-Z-]+\.md)?$/);
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
  await expect(page.locator('.slide:visible')).toContainText('실제 이용 기준값·목표치는 미확보');
  await page.getByText('8개 KPI의 계산·관찰 기준',{exact:true}).click();
  await expect(page.locator('.slide:visible details tbody tr')).toHaveCount(8);
  await page.reload();
  await expect(page).toHaveURL(/#section-01$/);
  await expect(page.getByRole('region',{name:'Overview & Problem',exact:true})).toBeVisible();
  await page.locator('.toc-item').first().click();
  await expect(page.getByRole('link',{name:'제품 체험하기',exact:true})).toHaveAttribute('href','/demo');
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
      if(!Number.isFinite(line)||line<size*1.3)failures.push(label+': line-height below 1.3');
      // Direct text only: nested paragraph/list boxes must not be counted twice.
      const rects=[];
      for(const child of node.childNodes){
        if(child.nodeType!==Node.TEXT_NODE||!child.textContent.trim())continue;
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
      }
    }
    const heading=getComputedStyle(slide.querySelector('.section-head h1'));
    return {section:slide.id,failures:[...new Set(failures)],review,
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
      const coverage=fonts==='fallback'?'forced fallback':fontState.faces.some(face=>face.status==='loaded')?'webfont loaded':'webfont unavailable; fallback only';
      const audits=[];
      for(let i=0;i<9;i++){
        await page.locator('.toc-item').nth(i).click();
        await expect(page.locator('.slide:visible')).toHaveCount(1);
        await page.locator('.slide:visible details').evaluateAll(nodes=>nodes.forEach(node=>node.open=true));
        const result=await typographyAudit(page);audits.push(result);
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
