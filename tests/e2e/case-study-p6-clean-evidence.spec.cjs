const {test,expect}=require('@playwright/test');

async function openP6(page,viewport={width:1440,height:900}){
  await page.setViewportSize(viewport);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.fmCaseStudyProductEvidence==='true');
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
  await page.evaluate(()=>document.querySelectorAll('.toc-item')[5]?.click());
  await page.waitForTimeout(120);
  await expect(page.locator('.slide.on')).toBeVisible();
}

test('P6 recommendation evidence uses the mask-free fixed-time Home capture',async({page})=>{
  await openP6(page);
  const image=page.locator('.slide.on [data-v5-content-role="recommendation-decision"] .fm-evidence-figure.is-recommendation img');
  await expect(image).toBeVisible();
  await page.waitForFunction(img=>img.complete&&img.naturalWidth>0,await image.elementHandle());
  const evidence=await image.evaluate(node=>({
    naturalWidth:node.naturalWidth,
    naturalHeight:node.naturalHeight,
    width:node.getBoundingClientRect().width,
    height:node.getBoundingClientRect().height,
    fit:getComputedStyle(node).objectFit,
    position:getComputedStyle(node).objectPosition,
    documentWidth:document.documentElement.scrollWidth,
    viewport:innerWidth
  }));
  expect(evidence.naturalWidth).toBe(1440);
  expect(evidence.naturalHeight).toBe(900);
  expect(evidence.width).toBeGreaterThanOrEqual(180);
  expect(evidence.width).toBeLessThanOrEqual(184);
  expect(evidence.height).toBeGreaterThanOrEqual(378);
  expect(evidence.height).toBeLessThanOrEqual(382);
  expect(evidence.fit).toBe('cover');
  expect(evidence.position).toContain('50%');
  expect(evidence.documentWidth).toBeLessThanOrEqual(evidence.viewport+1);
});

test('P6 clean evidence crop stays contained on mobile',async({page})=>{
  await openP6(page,{width:390,height:844});
  const image=page.locator('.slide.on [data-v5-content-role="recommendation-decision"] .fm-evidence-figure.is-recommendation img');
  const box=await image.evaluate(node=>({
    width:node.getBoundingClientRect().width,
    height:node.getBoundingClientRect().height,
    documentWidth:document.documentElement.scrollWidth,
    viewport:innerWidth
  }));
  expect(box.width).toBeLessThanOrEqual(220);
  expect(box.height).toBeLessThanOrEqual(460);
  expect(box.documentWidth).toBeLessThanOrEqual(box.viewport+1);
});
