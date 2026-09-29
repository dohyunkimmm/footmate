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

  test(`P12 KPI validation composition stays visually balanced on ${name}`,async({page})=>{
    await openCaseStudy(page,viewport);
    await showSection(page,11);
    const slide=page.locator('.slide.on.fm-next-story-slide');
    await expect(slide).toHaveAttribute('data-v5-content-role','validation-evidence');
    await expect(slide.locator('.fm-p1-validation-banner')).toBeVisible();
    await expect(slide.locator('.fm-p1-funnel-wrap')).toBeVisible();
    await expect(slide.locator('.fm-p1-secondary-metrics')).toBeVisible();
    await verifyNoHorizontalOverflow(page);

    if(viewport.width>900){
      const geometry=await slide.evaluate(node=>{
        const metrics=node.querySelector('.fm-p1-metrics');
        const banner=node.querySelector('.fm-p1-validation-banner');
        const funnel=node.querySelector('.fm-p1-funnel-wrap');
        const secondary=node.querySelector('.fm-p1-secondary-metrics');
        const box=el=>el.getBoundingClientRect();
        return {metrics:box(metrics),banner:box(banner),funnel:box(funnel),secondary:box(secondary)};
      });
      expect(Math.abs(geometry.banner.height-geometry.funnel.height)).toBeLessThanOrEqual(2);
      expect(geometry.secondary.width).toBeGreaterThanOrEqual(geometry.metrics.width-2);
    }

    await page.screenshot({
      path:`test-results/case-study-p12-balance-${viewport.width}.png`,
      fullPage:false,
      animations:'disabled'
    });
  });
}
