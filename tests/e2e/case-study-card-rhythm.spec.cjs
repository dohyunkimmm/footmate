const {test,expect}=require('@playwright/test');

async function openCaseStudy(page,viewport){
  await page.setViewportSize(viewport);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.fmCaseStudyProductEvidence==='true');
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
}

async function showSection(page,index){
  await page.evaluate(i=>document.querySelectorAll('.toc-item')[i]?.click(),index);
  await page.waitForTimeout(120);
  await expect(page.locator('.slide.on')).toBeVisible();
}

async function expectRowGap(page,selector,expected){
  const node=page.locator(`.slide.on ${selector}`);
  await expect(node).toBeVisible();
  const rowGap=await node.evaluate(el=>parseFloat(getComputedStyle(el).rowGap));
  expect(rowGap).toBe(expected);
}

for(const [name,viewport,expected] of [
  ['desktop',{width:1024,height:900},10],
  ['mobile',{width:390,height:844},8]
]){
  test(`multi-row card spacing stays balanced on ${name}`,async({page})=>{
    await openCaseStudy(page,viewport);

    await showSection(page,2);
    await expectRowGap(page,'.fm-p1-persona-lenses',expected);
    await expectRowGap(page,'.fm-p1-jtbd-journey>ol',expected);

    await showSection(page,7);
    await expectRowGap(page,'.fm-p1-auth-flow',10);

    await showSection(page,10);
    await expectRowGap(page,'.fm-p0-arch-main',expected);

    await showSection(page,11);
    await expectRowGap(page,'.fm-p1-metrics',name==='desktop'?16:14);
    await expect(page.locator('.slide.on .fm-p1-secondary-metrics')).toHaveCount(0);

    for(let index=1;index<=10;index+=1){
      if(index===9)continue; // P10 recovery keeps its viewport-tuned geometry.
      await showSection(page,index);
      const shared=await page.locator('.slide.on').evaluate(slide=>{
        const selector=[
          '.fm-next-cs-card',
          '.fm-next-cs-quote',
          '.fm-next-cs-jtbd',
          '.fm-next-cs-decision',
          '.fm-next-cs-scope:not(.fm-p1-auth-boundary)',
          '.fm-next-cs-sticky',
          '.fm-next-cs-note'
        ].join(',');
        return [...slide.querySelectorAll(selector)]
          .filter(node=>{
            if(node.closest('[data-v5-content-role="validation-evidence"],[data-v5-content-role="production-boundary"]'))return false;
            const style=getComputedStyle(node);
            return style.display!=='none'&&node.getBoundingClientRect().width>0&&node.getBoundingClientRect().height>0;
          })
          .map(node=>{
            const style=getComputedStyle(node);
            return {
              top:parseFloat(style.paddingTop),
              right:parseFloat(style.paddingRight),
              bottom:parseFloat(style.paddingBottom),
              left:parseFloat(style.paddingLeft)
            };
          });
      });
      const expectedInset=name==='desktop'?{top:16,right:18,bottom:16,left:18}:{top:14,right:16,bottom:14,left:16};
      shared.forEach(card=>expect(card).toEqual(expectedInset));
    }

    const overflow=await page.evaluate(()=>({
      viewport:window.innerWidth,
      document:document.documentElement.scrollWidth,
      body:document.body.scrollWidth
    }));
    expect(overflow.document).toBeLessThanOrEqual(overflow.viewport+1);
    expect(overflow.body).toBeLessThanOrEqual(overflow.viewport+1);
  });
}
