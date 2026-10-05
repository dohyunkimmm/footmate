const {test,expect}=require('@playwright/test');

async function openCaseStudy(page,viewport){
  await page.setViewportSize(viewport);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.fmPageComposition==='true');
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
  await expect(page.locator('.track>.slide')).toHaveCount(13);
  await expect(page.locator('.track>.slide[data-cs-hidden="true"]')).toHaveCount(0);
  await expect(page.locator('.fm-next-story-slide[data-evidence-upgrade]')).toHaveCount(4);
}

async function showSection(page,index){
  await page.evaluate(i=>document.querySelectorAll('.toc-item')[i]?.click(),index);
  await page.waitForTimeout(120);
  await expect(page.locator('.slide.on')).toBeVisible();
}

async function verifyEvidenceImages(page){
  const images=page.locator('.slide.on .fm-evidence-figure img');
  const count=await images.count();
  expect(count).toBeGreaterThan(0);
  for(let i=0;i<count;i+=1){
    const image=images.nth(i);
    await image.scrollIntoViewIfNeeded();
    await expect(image).toBeVisible();
    const handle=await image.elementHandle();
    await page.waitForFunction(img=>img.complete&&img.naturalWidth>0,handle);
  }
}

async function verifyNoHorizontalOverflow(page){
  const overflow=await page.evaluate(()=>({
    viewport:window.innerWidth,
    document:document.documentElement.scrollWidth,
    body:document.body.scrollWidth
  }));
  expect(overflow.document).toBeLessThanOrEqual(overflow.viewport+1);
  expect(overflow.body).toBeLessThanOrEqual(overflow.viewport+1);
}

const sections=[
  [5,'recommendation'],
  [6,'detail'],
  [8,'operations'],
  [9,'recovery']
];

for(const [name,viewport] of [
  ['desktop',{width:1440,height:900}],
  ['mobile',{width:390,height:844}]
]){
  test(`Case Study product evidence renders cleanly on ${name}`,async({page})=>{
    await openCaseStudy(page,viewport);
    for(const [index,key] of sections){
      await showSection(page,index);
      const slide=page.locator('.slide.on.fm-next-story-slide');
      await expect(slide).toHaveAttribute('data-evidence-upgrade',key);
      if(key==='recommendation'){
        const figure=slide.locator('.is-recommendation');
        await expect(figure).toHaveAttribute('data-interactive-ready','true');
        await expect(figure.locator('.fm-mock-match')).toHaveCount(2);
      }else await verifyEvidenceImages(page);
      await verifyNoHorizontalOverflow(page);
      await page.screenshot({
        path:`test-results/case-study-evidence-${key}-${viewport.width}.png`,
        fullPage:false,
        animations:'disabled'
      });
    }
  });


  test(`P2 problem hierarchy makes the core decision issue explicit on ${name}`,async({page})=>{
    await openCaseStudy(page,viewport);
    await showSection(page,1);
    const slide=page.locator('.slide.on.fm-next-story-slide');
    await expect(slide).toHaveAttribute('data-p0-visual','problem');
    await expect(slide.locator('.fm-p0-problem-sources>article')).toHaveCount(3);
    await expect(slide.locator('.fm-p0-problem-core')).toContainText('판단 근거의 부족');
    await expect(slide.locator('.fm-p0-problem-path>span')).toHaveCount(4);
    await verifyNoHorizontalOverflow(page);
  });

  test(`P8 preserved-state decision reads as a full card on ${name}`,async({page})=>{
    await openCaseStudy(page,viewport);
    await showSection(page,7);
    const slide=page.locator('.slide.on.fm-next-story-slide[data-v5-content-role="auth-participation"]');
    const summary=slide.locator('.fm-next-review-summary>div');
    await expect(summary).toHaveCount(3);
    await expect(summary.nth(0)).toContainText('진입점');
    await expect(summary.nth(0)).toContainText('참가하기 직전');
    await expect(slide.locator('.fm-next-review-summary')).not.toContainText('상태 보존');
    const preserve=slide.locator('.fm-p1-auth-preserve');
    const card=preserve.locator(':scope>span');
    await expect(card.locator('small')).toHaveText('상태 보존');
    await expect(card.locator('b')).toHaveText('선택 경기 + 로그인 후 복귀 위치');
    const geometry=await preserve.evaluate(node=>{
      const wrap=getComputedStyle(node);
      const card=node.querySelector(':scope>span');
      const cardStyle=getComputedStyle(card);
      const labelStyle=getComputedStyle(card.querySelector('small'));
      const bodyStyle=getComputedStyle(card.querySelector('b'));
      const rect=card.getBoundingClientRect();
      const wrapRect=node.getBoundingClientRect();
      return {
        marginTop:parseFloat(wrap.marginTop),
        marginBottom:parseFloat(wrap.marginBottom),
        wrapWidth:wrapRect.width,
        width:rect.width,
        leftGap:rect.left-wrapRect.left,
        rightGap:wrapRect.right-rect.right,
        paddingTop:parseFloat(cardStyle.paddingTop),
        paddingRight:parseFloat(cardStyle.paddingRight),
        paddingBottom:parseFloat(cardStyle.paddingBottom),
        paddingLeft:parseFloat(cardStyle.paddingLeft),
        radius:parseFloat(cardStyle.borderTopLeftRadius),
        labelFont:parseFloat(labelStyle.fontSize),
        bodyFont:parseFloat(bodyStyle.fontSize)
      };
    });
    expect(geometry.marginTop).toBe(14);
    expect(geometry.marginBottom).toBe(14);
    expect(geometry.paddingTop).toBe(14);
    expect(geometry.paddingBottom).toBe(14);
    expect(geometry.paddingLeft).toBe(16);
    expect(geometry.paddingRight).toBe(16);
    expect(geometry.radius).toBe(16);
    expect(geometry.labelFont).toBeGreaterThanOrEqual(10);
    expect(geometry.bodyFont).toBeGreaterThanOrEqual(13);
    const lineRhythm=await slide.evaluate(node=>{
      const box=node=> {
        const style=getComputedStyle(node);
        return {
          top:parseFloat(style.paddingTop),
          right:parseFloat(style.paddingRight),
          bottom:parseFloat(style.paddingBottom),
          left:parseFloat(style.paddingLeft)
        };
      };
      const summary=[...node.querySelectorAll('.fm-next-review-summary>div')].map(box);
      const flow=node.querySelector('.fm-p1-auth-flow');
      const screens=[...node.querySelectorAll('.fm-p1-auth-screen')].map(box);
      const boundary=node.querySelector('.fm-p1-auth-boundary .fm-cs-reasons');
      const boundaryCards=[...node.querySelectorAll('.fm-p1-auth-boundary .fm-cs-reasons>div')].map(box);
      return {
        summary,
        summaryGap:parseFloat(getComputedStyle(node.querySelector('.fm-next-review-summary')).gap),
        flowGap:parseFloat(getComputedStyle(flow).gap),
        screens,
        boundaryGap:parseFloat(getComputedStyle(boundary).gap),
        boundaryCards
      };
    });
    const summaryInset=index=>name==='desktop'?{top:0,right:12,bottom:0,left:index===0?0:12}:{top:0,right:0,bottom:0,left:0};
    expect(lineRhythm.summary).toHaveLength(3);
    lineRhythm.summary.forEach((card,index)=>expect(card).toEqual(summaryInset(index)));
    expect(lineRhythm.summaryGap).toBe(name==='desktop'?12:8);
    expect(lineRhythm.flowGap).toBe(10);
    expect(lineRhythm.screens).toHaveLength(4);
    lineRhythm.screens.forEach(card=>expect(card).toEqual({
      top:name==='desktop'?30:28,
      right:16,
      bottom:16,
      left:16
    }));
    expect(lineRhythm.boundaryGap).toBe(10);
    expect(lineRhythm.boundaryCards).toHaveLength(3);
    lineRhythm.boundaryCards.forEach(card=>expect(card).toEqual({top:14,right:16,bottom:14,left:16}));
    if(viewport.width>900){
      expect(geometry.width).toBeGreaterThanOrEqual(320);
      expect(geometry.width).toBeLessThanOrEqual(420);
      expect(geometry.width).toBeLessThan(geometry.wrapWidth*0.7);
      expect(Math.abs(geometry.leftGap-geometry.rightGap)).toBeLessThanOrEqual(1);
    }else{
      expect(Math.abs(geometry.width-geometry.wrapWidth)).toBeLessThanOrEqual(1);
    }
    await verifyNoHorizontalOverflow(page);
    await slide.screenshot({
      path:`test-results/case-study-p8-state-preserve-${viewport.width}.png`,
      animations:'disabled'
    });
  });

  test(`P12 KPI validation composition stays visually balanced on ${name}`,async({page})=>{
    await openCaseStudy(page,viewport);
    await showSection(page,11);
    const slide=page.locator('.slide.on.fm-next-story-slide');
    await expect(slide).toHaveAttribute('data-v5-content-role','validation-evidence');
    await expect(slide.locator('.fm-p1-validation-split')).toBeVisible();
    await expect(slide.locator('.fm-p1-validation-banner')).toBeVisible();
    await expect(slide.locator('.fm-p1-funnel-wrap')).toBeVisible();
    await expect(slide.locator('.fm-p1-funnel>div')).toHaveCount(3);
    await expect(slide.locator('.fm-p1-funnel-ratios .fm-p1-ratio')).toHaveCount(2);
    await expect(slide.locator('.fm-p1-secondary-metrics')).toHaveCount(0);
    await expect(slide.locator('.fm-p1-evidence-grid')).toBeVisible();
    await verifyNoHorizontalOverflow(page);

    if(viewport.width>900){
      const geometry=await slide.evaluate(node=>{
        const split=node.querySelector('.fm-p1-validation-split').getBoundingClientRect();
        const metrics=node.querySelector('.fm-p1-metrics').getBoundingClientRect();
        const evidence=node.querySelector('.fm-p1-evidence-grid').getBoundingClientRect();
        const funnel=[...node.querySelectorAll('.fm-p1-funnel>div')].map(card=>{
          const style=getComputedStyle(card);
          const rect=card.getBoundingClientRect();
          return {
            width:rect.width/(parseFloat(getComputedStyle(node.querySelector('.fm-next-story')).zoom)||1),
            top:parseFloat(style.paddingTop),
            right:parseFloat(style.paddingRight),
            bottom:parseFloat(style.paddingBottom),
            left:parseFloat(style.paddingLeft)
          };
        });
        const ratios=[...node.querySelectorAll('.fm-p1-funnel-ratios .fm-p1-ratio')].map(card=>{
          const style=getComputedStyle(card);
          return {
            top:parseFloat(style.paddingTop),
            right:parseFloat(style.paddingRight),
            bottom:parseFloat(style.paddingBottom),
            left:parseFloat(style.paddingLeft)
          };
        });
        return {split,metrics,evidence,funnel,ratios};
      });
      expect(geometry.evidence.left).toBeGreaterThan(geometry.metrics.right);
      expect(Math.abs(geometry.evidence.top-geometry.metrics.top)).toBeLessThanOrEqual(1);
      expect(geometry.funnel).toHaveLength(3);
      expect(Math.max(...geometry.funnel.map(card=>card.width))-Math.min(...geometry.funnel.map(card=>card.width))).toBeLessThanOrEqual(1);
      expect(Math.min(...geometry.funnel.map(card=>card.width))).toBeGreaterThan(110);
      expect(geometry.funnel.every(card=>card.top===18&&card.bottom===18&&card.left===14&&card.right===14)).toBeTruthy();
      expect(geometry.ratios).toHaveLength(2);
      expect(geometry.ratios.every(card=>card.top===14&&card.bottom===14&&card.left===14&&card.right===14)).toBeTruthy();
      expect(geometry.split.width).toBeGreaterThan(900);
    }

    await slide.screenshot({
      path:`test-results/case-study-p12-section-${viewport.width}.png`,
      animations:'disabled'
    });
  });

  test(`P3 Persona composition stays compact on ${name}`,async({page})=>{
    await openCaseStudy(page,viewport);
    await showSection(page,2);
    const slide=page.locator('.slide.on.fm-next-story-slide');
    const context=slide.locator('.fm-p1-persona-context');
    await expect(context).toBeVisible();
    const lenses=slide.locator('.fm-p1-persona-lenses');
    await expect(lenses).toBeVisible();
    const lensGeometry=await lenses.evaluate(node=>{
      const cards=[...node.children].map(card=>card.getBoundingClientRect());
      return {
        rowGap:parseFloat(getComputedStyle(node).rowGap),
        gaps:cards.length===3?[
          cards[1].top-cards[0].bottom,
          cards[2].top-cards[1].bottom
        ]:[]
      };
    });
    if(viewport.width<=900){
      expect(lensGeometry.rowGap).toBe(8);
      expect(lensGeometry.gaps).toHaveLength(2);
      expect(Math.abs(lensGeometry.gaps[0]-lensGeometry.gaps[1])).toBeLessThanOrEqual(0.5);
      expect(Math.abs(lensGeometry.gaps[0]-8)).toBeLessThanOrEqual(0.5);
    }
    const gap=await context.evaluate(node=>{
      const label=node.querySelector(':scope>span').getBoundingClientRect();
      const title=node.querySelector(':scope>b').getBoundingClientRect();
      return title.top-label.bottom;
    });
    expect(gap).toBeLessThanOrEqual(viewport.width>900?24:20);
    await verifyNoHorizontalOverflow(page);
    await slide.screenshot({
      path:`test-results/case-study-p3-section-${viewport.width}.png`,
      animations:'disabled'
    });
  });

  test(`P10 Recovery evidence stays readable on ${name}`,async({page})=>{
    await openCaseStudy(page,viewport);
    await showSection(page,9);
    const slide=page.locator('.slide.on.fm-next-story-slide');
    const map=slide.locator('.fm-p0-recovery-map');
    const strip=slide.locator('.fm-evidence-recovery-strip');
    const figures=strip.locator('.fm-evidence-figure');
    await expect(strip).toHaveAttribute('aria-label','제품 복구 상태 대표 화면');
    await expect(map).toContainText('참가 상태 문제');
    await expect(map).toContainText('참가 결과 확인 후 재시도 또는 경기 다시 선택');
    await expect(map).not.toContainText('결제 실패');
    await expect(figures).toHaveCount(2);
    await expect(figures.nth(0).locator('figcaption')).toContainText('탐색 결과 없음');
    await expect(figures.nth(1).locator('figcaption')).toContainText('참가 실패');
    await verifyEvidenceImages(page);
    await verifyNoHorizontalOverflow(page);

    if(viewport.width>900){
      const geometry=await slide.evaluate(node=>{
        const mapBox=node.querySelector('.fm-p0-recovery-map').getBoundingClientRect();
        const stripNode=node.querySelector('.fm-evidence-recovery-strip');
        const stripBox=stripNode.getBoundingClientRect();
        const figures=[...stripNode.querySelectorAll('.fm-evidence-figure')].map(el=>el.getBoundingClientRect());
        return {mapRight:mapBox.right,mapTop:mapBox.top,mapBottom:mapBox.bottom,stripLeft:stripBox.left,stripTop:stripBox.top,stripWidth:stripBox.width,figureWidths:figures.map(box=>box.width),scale:parseFloat(getComputedStyle(node.querySelector('.fm-next-story')).zoom)||1};
      });
      expect(geometry.stripLeft).toBeGreaterThan(geometry.mapRight);
      expect(Math.abs(geometry.stripTop-geometry.mapTop)).toBeLessThanOrEqual(1);
      expect(Math.abs(geometry.figureWidths[0]-geometry.figureWidths[1])).toBeLessThanOrEqual(2);
      expect(geometry.figureWidths[0]/geometry.scale).toBeGreaterThanOrEqual(299);
    }else{
      const geometry=await strip.evaluate(node=>{
        const stripBox=node.getBoundingClientRect();
        const widths=[...node.querySelectorAll('.fm-evidence-figure')].map(el=>el.getBoundingClientRect().width);
        return {stripWidth:stripBox.width,widths,overflow:getComputedStyle(node).overflowX};
      });
      expect(geometry.overflow).not.toBe('auto');
      geometry.widths.forEach(width=>expect(width).toBeGreaterThanOrEqual(geometry.stripWidth-2));
    }

    await slide.screenshot({
      path:`test-results/case-study-p10-section-${viewport.width}.png`,
      animations:'disabled'
    });
  });

  if(name==='desktop'){
    test('Case Study card body copy stays short and phrase-like',async({page})=>{
      await openCaseStudy(page,viewport);
      const selectors=[
        '.fm-p0-problem-core p',
        '.fm-next-cs-card p',
        '.fm-next-cs-quote dd',
        '.fm-next-cs-jtbd p',
        '.fm-next-cs-before-after p',
        '.fm-next-cs-decision dd',
        '.fm-next-cs-scope dd',
        '.fm-next-cs-sticky dd',
        '.fm-next-cs-note dd',
        '.fm-next-cs-note:not(:has(dl))',
        '.fm-next-cs-modes p',
        '.fm-next-cs-day-states p',
        '.fm-next-cs-recovery span',
        '.fm-next-cs-outcomes p',
        '.fm-p1-validation-banner p',
        '.fm-p1-evidence-grid .fm-next-cs-card p',
        '.fm-p1-release-next dd'
      ];
      const offenders=[];
      for(let index=0;index<13;index+=1){
        await showSection(page,index);
        const texts=await page.locator('.slide.on').evaluate((slide,selectors)=>{
          const seen=new Set();
          const values=[];
          selectors.forEach(selector=>{
            slide.querySelectorAll(selector).forEach(node=>{
              if(seen.has(node))return;
              seen.add(node);
              const text=(node.textContent||'').trim().replace(/\s+/g,' ');
              if(text)values.push(text);
            });
          });
          return values;
        },selectors);
        texts.filter(text=>/다\.$/.test(text)).forEach(text=>offenders.push({section:index+1,text}));
      }
      expect(offenders).toEqual([]);
    });

    test('P3 Persona stacked cards keep equal spacing at the medium breakpoint',async({page})=>{
      const mediumViewport={width:1024,height:768};
      await openCaseStudy(page,mediumViewport);
      await showSection(page,2);
      const lenses=page.locator('.slide.on .fm-p1-persona-lenses');
      const geometry=await lenses.evaluate(node=>{
        const cards=[...node.children].map(card=>card.getBoundingClientRect());
        return {
          rowGap:parseFloat(getComputedStyle(node).rowGap),
          gaps:[
            cards[1].top-cards[0].bottom,
            cards[2].top-cards[1].bottom
          ].map(gap=>gap/(parseFloat(getComputedStyle(node.closest('.fm-next-story')).zoom)||1))
        };
      });
      expect(geometry.rowGap).toBe(10);
      expect(Math.abs(geometry.gaps[0]-geometry.gaps[1])).toBeLessThanOrEqual(0.5);
      expect(Math.abs(geometry.gaps[0]-10)).toBeLessThanOrEqual(0.5);

      await page.waitForTimeout(260);
      await lenses.locator(':scope>div').nth(1).hover();
      const hoverGaps=await lenses.evaluate(node=>{
        const cards=[...node.children].map(card=>card.getBoundingClientRect());
        return [
          cards[1].top-cards[0].bottom,
          cards[2].top-cards[1].bottom
        ].map(gap=>gap/(parseFloat(getComputedStyle(node.closest('.fm-next-story')).zoom)||1));
      });
      expect(Math.abs(hoverGaps[0]-hoverGaps[1])).toBeLessThanOrEqual(0.5);
      expect(Math.abs(hoverGaps[0]-10)).toBeLessThanOrEqual(0.5);
      await verifyNoHorizontalOverflow(page);
    });
  }

  test(`all 13 Case Study sections rough visual audit on ${name}`,async({page})=>{
    test.setTimeout(90000);
    await openCaseStudy(page,viewport);
    for(let index=0;index<13;index+=1){
      await showSection(page,index);
      const slide=page.locator('.slide.on.fm-next-story-slide');
      await expect(slide).toBeVisible();
      await verifyNoHorizontalOverflow(page);
      await slide.screenshot({
        path:`test-results/case-study-full-audit/${name}-${String(index+1).padStart(2,'0')}.png`,
        animations:'disabled'
      });
    }
  });
}

test('P3 persona introduction aligns with all three desktop lens cards',async({page})=>{
  await openCaseStudy(page,{width:1440,height:1000});
  await showSection(page,2);
  const slide=page.locator('.slide.on');
  const geometry=await slide.evaluate(node=>{
    const cards=[node.querySelector('.fm-p1-persona-context'),...node.querySelectorAll('.fm-p1-persona-lenses>div')];
    return cards.map(card=>{
      const box=card.getBoundingClientRect();const style=getComputedStyle(card);
      const label=card.querySelector(':scope>span,:scope>small').getBoundingClientRect();
      const title=card.querySelector(':scope>b').getBoundingClientRect();
      return {top:box.top,bottom:box.bottom,labelTop:label.top,titleTop:title.top,padding:parseFloat(style.paddingLeft),borderTop:parseFloat(style.borderTopWidth)};
    });
  });
  expect(geometry).toHaveLength(4);
  for(const card of geometry){
    expect(Math.abs(card.top-geometry[0].top)).toBeLessThanOrEqual(1);
    expect(Math.abs(card.bottom-geometry[0].bottom)).toBeLessThanOrEqual(1);
    expect(Math.abs(card.labelTop-geometry[0].labelTop)).toBeLessThanOrEqual(1);
    expect(Math.abs(card.titleTop-geometry[0].titleTop)).toBeLessThanOrEqual(1);
    expect(card.padding).toBe(16);expect(card.borderTop).toBe(3);
  }
  expect(await slide.evaluate(node=>node.scrollHeight-node.clientHeight)).toBeLessThanOrEqual(1);
  await page.screenshot({path:'test-results/p3-persona-balanced-desktop.png',animations:'disabled'});
});
