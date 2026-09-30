const {test,expect}=require('@playwright/test');

async function openCaseStudy(page,viewport){
  await page.setViewportSize(viewport);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.fmCaseStudyProductEvidence==='true');
  await page.waitForFunction(()=>document.documentElement.dataset.fmCaseStudyP1Visuals==='true');
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
}

async function showSection(page,index){
  await page.evaluate(i=>document.querySelectorAll('.toc-item')[i]?.click(),index);
  await page.waitForTimeout(120);
  await expect(page.locator('.slide.on')).toBeVisible();
}

async function noHorizontalOverflow(page){
  const overflow=await page.evaluate(()=>({
    viewport:window.innerWidth,
    document:document.documentElement.scrollWidth,
    body:document.body.scrollWidth
  }));
  expect(overflow.document).toBeLessThanOrEqual(overflow.viewport+1);
  expect(overflow.body).toBeLessThanOrEqual(overflow.viewport+1);
}

for(const [name,viewport,expectedRecoveryGap] of [
  ['desktop',{width:1440,height:900},10],
  ['mobile',{width:390,height:844},8]
]){
  test(`P8 P10 P13 balance stays aligned on ${name}`,async({page})=>{
    await openCaseStudy(page,viewport);

    // P8 · lower implementation boundary cards must share the auth-flow left/right edges.
    await showSection(page,7);
    const p8=await page.locator('.slide.on').evaluate(slide=>{
      const flow=slide.querySelector('.fm-p1-auth-flow')?.getBoundingClientRect();
      const boundary=slide.querySelector('.fm-p1-auth-boundary .fm-cs-reasons')?.getBoundingClientRect();
      const scope=slide.querySelector('.fm-p1-auth-boundary');
      const style=scope?getComputedStyle(scope):null;
      return {
        flow:flow&&{left:flow.left,right:flow.right,width:flow.width},
        boundary:boundary&&{left:boundary.left,right:boundary.right,width:boundary.width},
        paddingLeft:style&&parseFloat(style.paddingLeft),
        paddingRight:style&&parseFloat(style.paddingRight)
      };
    });
    expect(p8.flow).toBeTruthy();
    expect(p8.boundary).toBeTruthy();
    expect(Math.abs(p8.flow.left-p8.boundary.left)).toBeLessThanOrEqual(1);
    expect(Math.abs(p8.flow.right-p8.boundary.right)).toBeLessThanOrEqual(1);
    expect(p8.paddingLeft).toBe(0);
    expect(p8.paddingRight).toBe(0);
    await page.locator('.slide.on').screenshot({path:`test-results/case-study-final-balance-${name}-p8.png`});

    // P10 · recovery rows follow the shared card rhythm. Desktop removes only the redundant recap,
    // keeping the two product proofs and captions safely above persistent navigation controls.
    await showSection(page,9);
    const p10=await page.locator('.slide.on .fm-p0-recovery-map').evaluate(el=>({
      rowGap:parseFloat(getComputedStyle(el).rowGap),
      rect:el.getBoundingClientRect().toJSON()
    }));
    expect(p10.rowGap).toBe(expectedRecoveryGap);
    const decision=page.locator('.slide.on .fm-next-cs-decision');
    if(name==='desktop'){
      const geometry=await page.locator('.slide.on').evaluate(slide=>{
        const strip=slide.querySelector('.fm-evidence-recovery-strip')?.getBoundingClientRect();
        const controls=document.querySelector('.cs-controls')?.getBoundingClientRect();
        return {
          strip:strip&&{top:strip.top,bottom:strip.bottom,height:strip.height},
          controls:controls&&{top:controls.top,bottom:controls.bottom}
        };
      });
      expect(geometry.strip).toBeTruthy();
      expect(geometry.controls).toBeTruthy();
      expect(geometry.strip.bottom).toBeLessThan(geometry.controls.top-4);
      await expect(decision).toBeHidden();
    }else{
      await expect(decision).toBeVisible();
    }
    await page.locator('.slide.on').screenshot({path:`test-results/case-study-final-balance-${name}-p10.png`});

    // P13 · desktop release cards keep natural heights; the 3-row OPEN BOUNDARY card should
    // end before the two 4-row cards instead of being stretched to their height.
    await showSection(page,12);
    const p13=await page.locator('.slide.on .fm-p1-release-map').evaluate(map=>{
      const style=getComputedStyle(map);
      const cards=[...map.children].map(card=>({
        zone:card.dataset.zone,
        height:card.getBoundingClientRect().height,
        scrollHeight:card.scrollHeight
      }));
      return {alignItems:style.alignItems,cards};
    });
    expect(p13.cards).toHaveLength(3);
    if(name==='desktop'){
      expect(p13.alignItems).toBe('start');
      const real=p13.cards.find(card=>card.zone==='real-app');
      const beta=p13.cards.find(card=>card.zone==='closed-beta');
      const open=p13.cards.find(card=>card.zone==='open-boundary');
      expect(open.height).toBeLessThan(real.height-20);
      expect(open.height).toBeLessThan(beta.height-20);
      for(const card of p13.cards)expect(Math.abs(card.height-card.scrollHeight)).toBeLessThanOrEqual(3);
    }
    await page.locator('.slide.on').screenshot({path:`test-results/case-study-final-balance-${name}-p13.png`});

    await noHorizontalOverflow(page);
  });
}
