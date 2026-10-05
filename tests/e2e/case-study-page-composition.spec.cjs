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
  await expect(figure.locator('.fm-mock-context small')).toContainText('비교 B');
  await expect(figure.locator('.fm-mock-footer')).toContainText('기흥');
  await expect(figure.locator('figcaption')).toContainText('샘플 경기');
  expect(await page.evaluate(()=>JSON.stringify({...localStorage}))).toBe(storage);
  expect(await page.locator('.slide.on').evaluate(el=>el.scrollHeight-el.clientHeight)).toBeLessThanOrEqual(1);
  await page.screenshot({path:'test-results/decision-evidence-p6-changed.png',animations:'disabled'});
});

test('implementation improvement records expose both evidence chains and restore reader focus',async({page})=>{
  await page.setViewportSize({width:1440,height:900});await page.goto('/');
  await page.waitForFunction(()=>document.documentElement.dataset.fmDecisionEvidence==='true');
  await page.locator('.toc-item').nth(11).click();
  const opener=page.getByRole('button',{name:'개선 사례 2건 보기',exact:true});await opener.click();
  const dialog=page.getByRole('dialog',{name:'실제 수정과 검증을 연결했습니다.'});
  await expect(dialog).toBeVisible();await expect(dialog.locator('ol>li')).toHaveCount(4);
  await expect(dialog).toContainText('경기 정보가 없으면 참가 처리 중단');
  await expect(dialog).toContainText('정보 유실 → 오류 → 정보 복원 → 참가 성공');
  await expect(dialog.getByRole('link',{name:'실제 수정 기록 ↗'})).toHaveAttribute('href','https://github.com/dohyunkimmm/footmate/pull/442');
  await page.keyboard.press('ArrowRight');await expect(page.locator('.slide.on')).toHaveAttribute('data-page-number','12');
  await page.screenshot({path:'test-results/improvement-join-dialog.png',animations:'disabled'});
  await dialog.getByRole('button',{name:'평가 후 다음 탐색',exact:true}).click();
  await expect(dialog).toContainText('평가 저장 후에도 피드백 안내 유지');
  await expect(dialog).toContainText('평가 저장 → Home 완료 → Discover 진입');
  await expect(dialog).toContainText('사용자 관찰 결과와 이용 성과는 별도 검증');
  await page.screenshot({path:'test-results/improvement-return-dialog.png',animations:'disabled'});
  await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();await expect(opener).toBeFocused();
  await page.locator('.toc-item').nth(8).click();await page.getByRole('button',{name:'평가 후 탐색 개선 보기',exact:true}).click();
  await expect(dialog).toHaveAttribute('data-improvement-case','1');
  await dialog.getByRole('button',{name:'개선 기록 닫기'}).click();
  await page.locator('.toc-item').nth(9).click();await page.getByRole('button',{name:'수정 전후 · 재검증 보기',exact:true}).click();
  await expect(dialog).toHaveAttribute('data-improvement-case','0');await page.keyboard.press('Escape');
  expect(await page.locator('.slide.on').evaluate(el=>el.scrollHeight-el.clientHeight)).toBeLessThanOrEqual(1);
  await page.locator('.toc-item').nth(12).click();
  await expect(page.locator('.slide.on')).toContainText('개인 고도화');
  await expect(page.locator('.slide.on')).not.toContainText('이용 기준값 확보 후');
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
  await expect(page.locator('.slide.on')).toContainText('보완 조건');
  await expect(page.locator('.slide.on')).not.toContainText('아직 연결하거나 검증하지 않은 범위');
});

test('editorial composition enlarges dense-page reading text while retaining fixed slides',async({page})=>{
  await page.setViewportSize({width:1440,height:900});await page.goto('/');
  await page.waitForFunction(()=>document.documentElement.dataset.fmEditorialFinish==='true');
  await page.evaluate(()=>document.fonts.ready);
  for(const index of [1,2,4,5,8,9,10,11,12]){
    await page.locator('.toc-item').nth(index).click();const slide=page.locator('.slide.on');
    expect(await slide.evaluate(node=>node.scrollHeight-node.clientHeight)).toBeLessThanOrEqual(1);
    const title=await slide.locator('h2').evaluate(node=>({weight:getComputedStyle(node).fontWeight,size:parseFloat(getComputedStyle(node).fontSize)}));
    expect(title.size).toBe(32);expect(title.weight).toBe('760');
    await page.screenshot({path:`test-results/editorial-finish-p${index+1}.png`,animations:'disabled'});
  }
  await page.locator('.toc-item').nth(9).click();
  const recovery=await page.locator('.slide.on').evaluate(node=>{
    const map=node.querySelector('.fm-p0-recovery-map').getBoundingClientRect();const proof=node.querySelector('.fm-evidence-recovery-strip').getBoundingClientRect();
    const text=node.querySelector('.fm-p0-recovery-row b');const size=parseFloat(getComputedStyle(text).fontSize);const scale=parseFloat(getComputedStyle(node.querySelector('.fm-next-story')).zoom)||1;
    return {mapRight:map.right,proofLeft:proof.left,textSize:size,renderedSize:size*scale};
  });
  expect(recovery.proofLeft).toBeGreaterThan(recovery.mapRight);expect(recovery.textSize).toBe(14);expect(recovery.renderedSize).toBeGreaterThanOrEqual(13);
  await expect(page.locator('.slide.on')).toContainText('핵심 결정 03');
  await page.locator('.toc-item').nth(11).click();
  const validation=await page.locator('.slide.on').evaluate(node=>{
    const metrics=node.querySelector('.fm-p1-metrics').getBoundingClientRect();const evidence=node.querySelector('.fm-p1-evidence-grid').getBoundingClientRect();
    const body=node.querySelector('.fm-page-card-description');const size=parseFloat(getComputedStyle(body).fontSize);const scale=parseFloat(getComputedStyle(node.querySelector('.fm-next-story')).zoom)||1;
    return {metricsRight:metrics.right,evidenceLeft:evidence.left,textSize:size,renderedSize:size*scale};
  });
  expect(validation.evidenceLeft).toBeGreaterThan(validation.metricsRight);expect(validation.textSize).toBe(13);expect(validation.renderedSize).toBeGreaterThanOrEqual(12);
  await page.locator('.toc-item').nth(5).click();await expect(page.locator('.slide.on .fm-editorial-decision')).toContainText('핵심 결정 02');
  const inset=await page.locator('.slide.on .fm-editorial-decision').evaluate(node=>parseFloat(getComputedStyle(node).paddingLeft));expect(inset).toBe(0);
});

test('desktop stories limit title movement while keeping content above the controls',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});await page.goto('/');
  await page.waitForFunction(()=>document.documentElement.dataset.fmEvidenceDetails==='true');
  await page.evaluate(()=>document.fonts.ready);
  const positions=[];
  for(let index=1;index<13;index++){
    await page.locator('.toc-item').nth(index).click();
    const slide=page.locator('.slide.on');
    await slide.evaluate(async node=>{await Promise.all(node.getAnimations({subtree:true}).filter(a=>a.effect?.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})));});
    await expect.poll(()=>slide.evaluate(node=>{
      const story=node.querySelector('.fm-next-story');const content=story.getBoundingClientRect();
      const box=node.getBoundingClientRect();const style=getComputedStyle(node);
      const paddingTop=parseFloat(style.paddingTop),paddingBottom=parseFloat(style.paddingBottom);
      const available=node.clientHeight-paddingTop-paddingBottom;
      const expected=Math.min(72,Math.max(0,(available-content.height)/2));
      return Math.abs(content.top-box.top-paddingTop-expected);
    }),{message:`page ${index+1} follows the bounded title rhythm`}).toBeLessThanOrEqual(3);
    const bounds=await slide.evaluate(node=>{
      const content=node.querySelector('.fm-next-story').getBoundingClientRect();const box=node.getBoundingClientRect();
      return {top:content.top-box.top,bottom:box.bottom-content.bottom};
    });
    positions.push(bounds.top);
    expect(bounds.top).toBeGreaterThanOrEqual(63);expect(bounds.bottom).toBeGreaterThanOrEqual(63);
    expect(await slide.evaluate(node=>node.scrollHeight-node.clientHeight)).toBeLessThanOrEqual(1);
    await page.screenshot({path:`test-results/vertical-balance-p${index+1}.png`,animations:'disabled'});
  }
  expect(Math.max(...positions)-Math.min(...positions)).toBeLessThanOrEqual(75);
});

test('final rendered copy keeps descriptions distinct and removes duplicate detail rationale',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});await page.goto('/');
  await page.waitForFunction(()=>document.documentElement.dataset.fmEditorialFinish==='true');
  await page.evaluate(()=>document.fonts.ready);
  for(let index=0;index<13;index++){
    await page.locator('.toc-item').nth(index).click();
    const slide=page.locator('.slide.on');
    const copy=await slide.evaluate(node=>{
      const title=node.querySelector('.fm-next-story h2,.fm-next-cover h1').innerText.trim();
      const description=node.querySelector('.fm-next-story-lead,.fm-next-cover-lead').innerText.trim();
      // innerText excludes collapsed supplements and hidden labels; inspect the published text.
      return {title,description,text:node.innerText};
    });
    expect(copy.title).not.toBe(copy.description);
    expect(copy.description).toMatch(/습니다\.$/);
    console.log('COPY_QA '+JSON.stringify({page:index+1,...copy}));
  }
  await page.locator('.toc-item').nth(6).click();
  const comparison=await page.locator('.slide.on').textContent();
  expect(comparison.split('최대 2경기의 거리·레벨·포지션 자리·참가비 비교').length-1).toBe(1);
  await page.locator('.toc-item').nth(12).click();
  const labels=await page.locator('.slide.on .fm-p1-release-map li>span').allTextContents();
  expect(new Set(labels).size).toBe(labels.length);
});


test('desktop composition audit captures every section after entry motion settles',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});await page.goto('/');
  await page.waitForFunction(()=>document.documentElement.dataset.fmPageComposition==='true');
  await page.evaluate(()=>document.fonts.ready);
  for(let index=1;index<13;index++){
    await page.locator('.toc-item').nth(index).click();
    const slide=page.locator('.slide.on');
    await slide.evaluate(async node=>{await Promise.all(node.getAnimations({subtree:true}).filter(a=>a.effect?.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})));});
    await expect.poll(()=>slide.evaluate(n=>n.scrollHeight-n.clientHeight)).toBeLessThanOrEqual(1);
    if([9,11,12].includes(index)){
      const selectors=index===9?['.fm-p0-recovery-map','.fm-evidence-recovery-strip']:index===11?['.fm-p1-metrics','.fm-p1-evidence-grid']:['.fm-p1-release-map>article'];
      const bounds=await slide.evaluate((node,selectors)=>selectors.flatMap(selector=>[...document.querySelector('.slide.on').querySelectorAll(selector)].map(n=>{const b=n.getBoundingClientRect();return {top:b.top,bottom:b.bottom};})),selectors);
      console.log('BALANCED_EDGES_'+(index+1)+' '+JSON.stringify(bounds));
      expect.soft(Math.max(...bounds.map(b=>b.top))-Math.min(...bounds.map(b=>b.top))).toBeLessThanOrEqual(1);
      expect.soft(Math.max(...bounds.map(b=>b.bottom))-Math.min(...bounds.map(b=>b.bottom))).toBeLessThanOrEqual(1);
    }
    if([2,3,7,10].includes(index)){
      const details=await slide.evaluate((node,index)=>{
        const box=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width};};
        const main=box(node.querySelector('.fm-next-review-summary'));
        const elements=index===2?[node.querySelector('.fm-p1-jtbd-journey>ol')]:index===3?[...node.querySelectorAll('.fm-next-story-aside .fm-next-cs-card')]:index===7?[node.querySelector('.fm-p1-auth-preserve>span')]:[node.querySelector('.fm-owner-grid')];
        return {main,boxes:elements.map(box)};
      },index);
      console.log('EDITORIAL_EDGES_'+(index+1)+' '+JSON.stringify(details));
      if(index===3){expect.soft(details.boxes).toHaveLength(3);expect.soft(Math.max(...details.boxes.map(b=>b.width))-Math.min(...details.boxes.map(b=>b.width))).toBeLessThanOrEqual(1);}
      else {expect.soft(Math.abs(details.boxes[0].left-details.main.left)).toBeLessThanOrEqual(1);expect.soft(Math.abs(details.boxes[0].right-details.main.right)).toBeLessThanOrEqual(1);}
    }
    const screenshot=await page.screenshot({type:'jpeg',quality:65,animations:'disabled'});
    console.log('SECTION_VISUAL_'+(index+1)+' '+screenshot.toString('base64'));
    console.log('SECTION_GEOMETRY_'+(index+1)+' '+JSON.stringify(await slide.evaluate(n=>[...n.querySelectorAll('.fm-next-story,.fm-next-story-scene,.fm-next-story-context,.fm-next-story-lenses,.fm-next-story-aside,.fm-evidence-figure')].map(e=>{const b=e.getBoundingClientRect();return {class:e.className,x:b.x,y:b.y,w:b.width,h:b.height};}))));
  }
});

test('inline evidence shows actual changes, readable source details and the execution sequence',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});await page.goto('/');
  await page.waitForFunction(()=>document.documentElement.dataset.fmEvidenceDetails==='true');
  await page.evaluate(()=>document.fonts.ready);
  for(const index of [6,8]){
    await page.locator('.toc-item').nth(index).click();const slide=page.locator('.slide.on');
    const crop=slide.locator('.fm-focus-detail');await expect(crop).toBeVisible();
    const source=slide.locator('.fm-evidence-figure[data-evidence-scale="primary"] img');
    await expect.poll(()=>crop.locator('img').evaluate(n=>n.complete&&n.naturalWidth>0)).toBeTruthy();
    expect(await crop.locator('img').getAttribute('src')).toBe(await source.getAttribute('src'));
    const widths=await slide.evaluate(node=>({
      detail:node.querySelector('.fm-focus-crop>img').getBoundingClientRect().width,
      full:node.querySelector('.fm-evidence-figure[data-evidence-scale="primary"] img').getBoundingClientRect().width
    }));
    expect(widths.detail).toBeGreaterThan(widths.full*1.5);
    await expect(crop).toContainText('기존 제품 화면');
  }
  await page.locator('.toc-item').nth(9).click();
  await expect(page.locator('.slide.on .fm-inline-change')).toBeVisible();
  await expect(page.locator('.slide.on .fm-inline-change')).toContainText('수정 전');
  await expect(page.locator('.slide.on .fm-inline-change')).toContainText('버튼 복원');
  await page.locator('.toc-item').nth(10).click();
  expect(await page.locator('.slide.on .fm-processing-path>li>b').allTextContents()).toEqual(['입력','해석','추천','확인']);
  await expect(page.locator('.slide.on .fm-owner-column')).toHaveCount(3);
  await page.locator('.toc-item').nth(12).click();
  await expect(page.locator('.slide.on .fm-change-before')).toContainText('수정 전');
  await expect(page.locator('.slide.on .fm-change-after')).toContainText('다음 경기 찾기');
  await expect(page.locator('.slide.on .fm-learning-proof')).toHaveAttribute('href','https://github.com/dohyunkimmm/footmate/pull/442');
});
