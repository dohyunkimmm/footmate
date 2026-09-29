const {test,expect}=require('@playwright/test');

async function openCaseStudy(page,viewport){
  await page.setViewportSize(viewport);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.fmCaseStudyProductEvidence==='true');
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
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
      await verifyEvidenceImages(page);
      await verifyNoHorizontalOverflow(page);
      await page.screenshot({
        path:`test-results/case-study-evidence-${key}-${viewport.width}.png`,
        fullPage:false,
        animations:'disabled'
      });
    }
  });
}
