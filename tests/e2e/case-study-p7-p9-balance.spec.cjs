const {test,expect}=require('@playwright/test');

async function openCaseStudy(page,viewport={width:1440,height:900}){
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

async function expectProductFirstGeometry(page,role,layoutSelector,supportSelector){
  const slide=page.locator(`.slide.on.fm-next-story-slide[data-v5-content-role="${role}"]`);
  const geometry=await slide.evaluate((node,{layoutSelector,supportSelector})=>{
    const box=el=>el.getBoundingClientRect();
    const copy=node.querySelector('.fm-next-story-copy');
    const layout=node.querySelector(layoutSelector);
    const figure=layout.querySelector(':scope > .fm-evidence-figure');
    const support=layout.querySelector(`:scope > ${supportSelector}`);
    return {
      copy:box(copy),layout:box(layout),figure:box(figure),support:box(support),
      documentWidth:document.documentElement.scrollWidth,viewport:window.innerWidth
    };
  },{layoutSelector,supportSelector});

  expect(Math.abs(geometry.layout.left-geometry.copy.left)).toBeLessThanOrEqual(2);
  expect(geometry.figure.left).toBeLessThan(geometry.support.left);
  expect(geometry.figure.width).toBeGreaterThanOrEqual(260);
  expect(geometry.support.width).toBeGreaterThan(geometry.figure.width);
  expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewport+1);
}

test('P7 Decision Detail uses P6-like product-first desktop balance',async({page})=>{
  await openCaseStudy(page);
  await showSection(page,6);
  await expectProductFirstGeometry(page,'detail-decision','.fm-evidence-detail-layout','.fm-next-cs-detail-order');
});

test('P9 Operations uses P6-like product-first desktop balance',async({page})=>{
  await openCaseStudy(page);
  await showSection(page,8);
  await expectProductFirstGeometry(page,'matchday-return','.fm-evidence-operations-layout','.fm-next-cs-day-states');
});

test('P7 and P9 keep mobile product evidence stacked without overflow',async({page})=>{
  await openCaseStudy(page,{width:390,height:844});
  for(const [index,role,layoutSelector] of [
    [6,'detail-decision','.fm-evidence-detail-layout'],
    [8,'matchday-return','.fm-evidence-operations-layout']
  ]){
    await showSection(page,index);
    const slide=page.locator(`.slide.on.fm-next-story-slide[data-v5-content-role="${role}"]`);
    const geometry=await slide.evaluate((node,layoutSelector)=>{
      const layout=node.querySelector(layoutSelector);
      const figure=layout.querySelector(':scope > .fm-evidence-figure').getBoundingClientRect();
      const layoutBox=layout.getBoundingClientRect();
      return {
        columns:getComputedStyle(layout).gridTemplateColumns,
        figureTop:figure.top,layoutTop:layoutBox.top,
        documentWidth:document.documentElement.scrollWidth,viewport:window.innerWidth
      };
    },layoutSelector);
    expect(geometry.columns.trim().split(/\s+/)).toHaveLength(1);
    expect(Math.abs(geometry.figureTop-geometry.layoutTop)).toBeLessThanOrEqual(2);
    expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewport+1);
  }
});
