const {test,expect}=require('@playwright/test');

for(const viewport of [{width:1440,height:1000},{width:1280,height:720},{width:390,height:844},{width:320,height:740}]){
  test(`13 sections preserve readable composition at ${viewport.width}px`,async({page})=>{
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.setViewportSize(viewport);
    await page.goto('/',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.documentElement.dataset.fmPageComposition==='true');
    const contrast=await page.evaluate(()=>{
      const luminance=color=>{
        const values=color.match(/[\d.]+/g).slice(0,3).map(Number).map(value=>{
          const channel=value/255;return channel<=.04045?channel/12.92:((channel+.055)/1.055)**2.4;
        });
        return values[0]*.2126+values[1]*.7152+values[2]*.0722;
      };
      const ratio=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
      const navigation=document.querySelector(innerWidth>900?'.sidebar':'.cs-mobile-head');
      const label=navigation.querySelector(innerWidth>900?'.sb-logo':'b');
      const cover=document.querySelector('.fm-next-cover h1 .fm-next-cover-title-line');
      return {
        navigation:ratio(getComputedStyle(label).color,getComputedStyle(navigation).backgroundColor),
                cover:ratio(getComputedStyle(cover).color,getComputedStyle(document.querySelector('.fm-next-cover-slide')).backgroundColor)
      };
    });
    expect(contrast.navigation).toBeGreaterThanOrEqual(4.5);
    expect(contrast.cover).toBeGreaterThanOrEqual(4.5);
    const slides=page.locator('.track>.slide');
    await expect(slides).toHaveCount(13);
    for(let index=0;index<13;index++){
      if(viewport.width>900)await page.locator('.toc-item').nth(index).click();
      const slide=slides.nth(index);
      await expect(slide).toBeVisible();
      await expect(slide.locator('.fm-page-keywords>span')).toHaveCount(3);
      const title=slide.locator(index===0?'h1':'.fm-next-story h2');
      await expect(title).not.toHaveText('');
      const geometry=await title.evaluate(node=>{
        const box=node.getBoundingClientRect();const parent=node.closest('.slide').getBoundingClientRect();
        return {left:box.left,right:box.right,parentLeft:parent.left,parentRight:parent.right,font:parseFloat(getComputedStyle(node).fontSize)};
      });
      expect(geometry.left).toBeGreaterThanOrEqual(geometry.parentLeft);
      expect(geometry.right).toBeLessThanOrEqual(geometry.parentRight+1);
      expect(geometry.font).toBeGreaterThanOrEqual(24);
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      if(viewport.width>900){
        await expect.poll(()=>slide.evaluate(node=>node.scrollHeight-node.clientHeight)).toBeLessThanOrEqual(1);
        const bounds=await slide.evaluate(node=>{
          const content=node.querySelector('.fm-next-story,.fm-next-cover').getBoundingClientRect();
          const viewport=node.getBoundingClientRect();
          return {top:content.top-viewport.top,bottom:viewport.bottom-content.bottom};
        });
        expect(bounds.top).toBeGreaterThanOrEqual(63);
        expect(bounds.bottom).toBeGreaterThanOrEqual(63);
      }
    }
    expect(errors).toEqual([]);
    // Verify the originals load; local layout checks with placeholders are not image QA.
    for(const image of await page.locator('.fm-evidence-figure[data-evidence-scale="primary"] img').all()){
      if(viewport.width<=900)await image.scrollIntoViewIfNeeded();
      await expect.poll(()=>image.evaluate(node=>node.complete&&node.naturalWidth>0)).toBeTruthy();
      const framing=await image.evaluate(node=>({fit:getComputedStyle(node).objectFit,clip:getComputedStyle(node).clipPath}));
      expect(framing).toEqual({fit:'contain',clip:'none'});
    }
    if(viewport.width>900){
      await page.keyboard.press('ArrowLeft');
      await expect(slides.nth(11)).toHaveClass(/on/);
      await page.keyboard.press('ArrowRight');
      await expect(slides.nth(12)).toHaveClass(/on/);
    }
  });
}

test('product enlargement preserves navigation and restores keyboard focus',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});
  await page.goto('/');await page.waitForFunction(()=>document.documentElement.dataset.fmPageComposition==='true');
  for(const index of [6,8]){
    await page.locator('.toc-item').nth(index).click();
    const slide=page.locator('.slide.on');const opener=slide.locator('.fm-screen-expand');
    const source=await slide.locator('.fm-evidence-figure[data-evidence-scale="primary"] img').evaluate(node=>node.currentSrc||node.src);
    await opener.click();const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
    await expect(dialog.locator('img')).toHaveAttribute('src',source);
    await page.keyboard.press('ArrowRight');await expect(slide).toHaveAttribute('data-page-number',String(index+1));
    await dialog.getByRole('button',{name:'핵심 영역',exact:true}).click();
    await expect(dialog).toHaveClass(/is-focus/);
    await expect(dialog.getByRole('button',{name:'핵심 영역',exact:true})).toHaveAttribute('aria-pressed','true');
    await dialog.getByRole('button',{name:'전체 화면',exact:true}).click();await expect(dialog).not.toHaveClass(/is-focus/);
    await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();await expect(opener).toBeFocused();
  }
});

test('all 13 page descriptions occupy one complete line on desktop',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});await page.goto('/');
  await page.waitForFunction(()=>document.documentElement.dataset.fmPageComposition==='true');
  await page.evaluate(()=>document.fonts.ready);
  for(let index=0;index<13;index++){
    await page.locator('.toc-item').nth(index).click();
    const description=page.locator('.slide.on .fm-next-cover-lead,.slide.on .fm-next-story-lead');
    const lines=await description.evaluate(node=>{
      const range=document.createRange();range.selectNodeContents(node);
      const rects=[...range.getClientRects()];const box=node.getBoundingClientRect();
      return {count:new Set(rects.map(rect=>Math.round(rect.top))).size,complete:rects.every(rect=>rect.left>=box.left-1&&rect.right<=box.right+1)};
    });
    expect(lines.count,`page ${index+1}`).toBe(1);expect(lines.complete).toBeTruthy();
  }
});

test('section labels match the table of contents and supplemental details remain available',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});await page.goto('/');
  await page.waitForFunction(()=>document.documentElement.dataset.fmPageComposition==='true');
  const sections=await page.evaluate(()=>[...document.querySelectorAll('.toc-item')].map((toc,index)=>({title:toc.querySelector('.toc-t').textContent,kicker:document.querySelectorAll('.slide')[index].querySelector('.fm-next-cover-kicker,.fm-next-story-kicker').textContent})));
  expect(sections).toHaveLength(13);for(const section of sections)expect(section.kicker).toContain(section.title);
  await page.locator('.toc-item').nth(4).click();
  const details=page.locator('.slide.on .fm-editorial-supplement');await expect(details).toHaveAttribute('open','');
  await page.setViewportSize({width:390,height:844});await expect(details).not.toHaveAttribute('open','');
  await details.locator('summary').click();await expect(details).toHaveAttribute('open','');
  await expect(details.locator('.fm-next-story-aside')).toBeVisible();
});

test('decision evidence lets readers change real base-ranking inputs without writing product state',async({page})=>{
  await page.setViewportSize({width:1440,height:900});await page.goto('/');
  await page.waitForFunction(()=>document.documentElement.dataset.fmDecisionEvidence==='true');
  await page.locator('.toc-item').nth(5).click();
  const figure=page.locator('.slide.on .is-recommendation');
  await expect(figure).toHaveAttribute('data-interactive-ready','true');
  const storage=await page.evaluate(()=>JSON.stringify({...localStorage}));
  await expect(figure.locator('.fm-mock-match').first()).toHaveAttribute('data-match-id','suwon-ingye-2000');
  const second=figure.getByRole('button',{name:'용인 · 초중급 GK',exact:true});await second.click();
  await expect(second).toHaveAttribute('aria-pressed','true');
  await expect(figure.locator('.fm-mock-match').first()).toHaveAttribute('data-match-id','giheung-2000');
  await expect(figure.locator('.fm-mock-match').first()).toContainText('GK 1자리 남음');
  await expect(figure.locator('figcaption')).toContainText('샘플 경기');
  expect(await page.evaluate(()=>JSON.stringify({...localStorage}))).toBe(storage);
  expect(await page.locator('.slide.on').evaluate(el=>el.scrollHeight-el.clientHeight)).toBeLessThanOrEqual(1);
  await page.screenshot({path:'test-results/decision-evidence-p6-changed.png',animations:'disabled'});
});

test('recovery mock shows retained choice and locked retry before success without making a join request',async({page})=>{
  const requests=[];page.on('request',request=>{if(request.method()==='POST')requests.push(request.url());});
  await page.setViewportSize({width:1440,height:900});await page.goto('/');
  await page.waitForFunction(()=>document.documentElement.dataset.fmDecisionEvidence==='true');
  await page.locator('.toc-item').nth(9).click();
  const demo=page.locator('.slide.on .fm-recovery-demo');const retained=await demo.locator('.fm-recovery-retained').textContent();
  const retry=demo.locator('[data-recovery-action="retry"]');await retry.click();
  await expect(retry).toBeDisabled();await expect(demo).toHaveAttribute('data-recovery-state','success');
  await expect(demo.locator('.fm-recovery-message')).toContainText('MY');
  expect(await demo.locator('.fm-recovery-retained').textContent()).toBe(retained);
  await retry.click();await expect(demo).toHaveAttribute('data-recovery-state','failed');
  await demo.getByRole('button',{name:'경기 다시 선택',exact:true}).click();
  await expect(demo).toHaveAttribute('data-recovery-state','choose');expect(requests).toEqual([]);
  await page.screenshot({path:'test-results/decision-evidence-p10-alternative.png',animations:'disabled'});
});

test('representative decisions expose source evidence and a distinct next-decision close',async({page})=>{
  await page.setViewportSize({width:1440,height:900});await page.goto('/');
  await page.waitForFunction(()=>document.documentElement.dataset.fmDecisionEvidence==='true');
  for(const index of [4,5,9,10,11,12]){
    await page.locator('.toc-item').nth(index).click();const slide=page.locator('.slide.on');
    if(index!==12)await expect(slide.locator('.fm-proof-link').first()).toBeVisible();
    expect(await slide.evaluate(el=>el.scrollHeight-el.clientHeight)).toBeLessThanOrEqual(1);
    await page.screenshot({path:`test-results/decision-evidence-p${index+1}.png`,animations:'disabled'});
  }
  await expect(page.locator('.slide.on')).toContainText('다음 판단');
  await expect(page.locator('.slide.on')).not.toContainText('아직 연결하거나 검증하지 않은 범위');
});
