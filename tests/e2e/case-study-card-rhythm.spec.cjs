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
    await expectRowGap(page,'.fm-p1-auth-flow',expected);

    await showSection(page,10);
    await expectRowGap(page,'.fm-p0-arch-main',expected);

    await showSection(page,11);
    await expectRowGap(page,'.fm-p1-metrics',expected);
    await expect(page.locator('.slide.on .fm-p1-secondary-metrics')).toHaveCount(0);

    const overflow=await page.evaluate(()=>({
      viewport:window.innerWidth,
      document:document.documentElement.scrollWidth,
      body:document.body.scrollWidth
    }));
    expect(overflow.document).toBeLessThanOrEqual(overflow.viewport+1);
    expect(overflow.body).toBeLessThanOrEqual(overflow.viewport+1);
  });
}
