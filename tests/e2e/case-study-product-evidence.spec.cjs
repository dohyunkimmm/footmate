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
    await expect(slide.locator('.fm-p1-persona-lenses')).toBeVisible();
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
        return {mapBottom:mapBox.bottom,stripTop:stripBox.top,stripWidth:stripBox.width,figureWidths:figures.map(box=>box.width)};
      });
      expect(geometry.stripTop-geometry.mapBottom).toBeGreaterThanOrEqual(12);
      expect(Math.abs(geometry.figureWidths[0]-geometry.figureWidths[1])).toBeLessThanOrEqual(2);
      expect(geometry.figureWidths[0]).toBeGreaterThan(300);
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
