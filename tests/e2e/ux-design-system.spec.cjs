const {test,expect}=require('@playwright/test');

function failures(page){
  const items=[];
  page.on('pageerror',error=>items.push(`pageerror: ${error.message}`));
  page.on('console',message=>{
    if(message.type()==='error'&&!message.text().includes('Failed to load resource'))items.push(`console.error: ${message.text()}`);
  });
  return items;
}

async function openCleanApp(page,viewport){
  await page.setViewportSize(viewport);
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>localStorage.clear());
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1');
}

async function finishSetup(page){
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
  await expect(page.locator('.fm-ai-card')).toBeVisible();
}

async function expectNoHorizontalOverflow(page,label){
  const metrics=await page.evaluate(()=>({
    viewport:window.innerWidth,
    documentWidth:document.documentElement.scrollWidth,
    bodyWidth:document.body.scrollWidth
  }));
  expect(metrics.documentWidth,`${label}: document overflow`).toBeLessThanOrEqual(metrics.viewport);
  expect(metrics.bodyWidth,`${label}: body overflow`).toBeLessThanOrEqual(metrics.viewport);
}

test('Real App responsive design baseline stays overflow-free across target widths',async({page})=>{
  const errs=failures(page);
  const viewports=[
    {width:320,height:844},
    {width:375,height:844},
    {width:390,height:844},
    {width:430,height:900},
    {width:1440,height:900}
  ];

  for(const viewport of viewports){
    await openCleanApp(page,viewport);
    await finishSetup(page);
    await expectNoHorizontalOverflow(page,`${viewport.width}px home`);

    await page.getByRole('button',{name:'전체 보기'}).click();
    await expect(page.locator('[data-screen="discover"]')).toBeVisible();
    await expectNoHorizontalOverflow(page,`${viewport.width}px discover`);

    await page.locator('.fm-next-match-card').first().click();
    await expect(page.locator('[data-screen="detail"]')).toBeVisible();
    await expectNoHorizontalOverflow(page,`${viewport.width}px detail`);
  }

  expect(errs).toEqual([]);
});

test('320px context actions and AI micro UI keep readable, non-cramped sizing',async({page})=>{
  const errs=failures(page);
  await openCleanApp(page,{width:320,height:844});
  await finishSetup(page);

  const contextActions=await page.locator('.fm-next-context-actions .fm-next-button').evaluateAll(buttons=>buttons.map(button=>{
    const rect=button.getBoundingClientRect();
    return {top:rect.top,bottom:rect.bottom,width:rect.width};
  }));
  expect(contextActions).toHaveLength(2);
  expect(contextActions[1].top).toBeGreaterThanOrEqual(contextActions[0].bottom);
  expect(contextActions[0].width).toBeGreaterThanOrEqual(230);
  expect(contextActions[1].width).toBeGreaterThanOrEqual(230);

  const aiMetrics=await page.locator('.fm-ai-card').evaluate(card=>{
    const fontSize=selector=>parseFloat(getComputedStyle(card.querySelector(selector)).fontSize);
    const height=selector=>card.querySelector(selector).getBoundingClientRect().height;
    return {
      mode:fontSize('.fm-ai-mode'),
      example:fontSize('.fm-ai-examples button'),
      status:fontSize('.fm-ai-status span'),
      resultMeta:fontSize('.fm-ai-result-copy small'),
      guardrail:fontSize('.fm-ai-guardrail'),
      exampleHeight:height('.fm-ai-examples button'),
      inputHeight:height('.fm-ai-input-row input'),
      submitHeight:height('.fm-ai-input-row button')
    };
  });

  expect(aiMetrics.mode).toBeGreaterThanOrEqual(11);
  expect(aiMetrics.example).toBeGreaterThanOrEqual(11);
  expect(aiMetrics.status).toBeGreaterThanOrEqual(11);
  expect(aiMetrics.resultMeta).toBeGreaterThanOrEqual(11);
  expect(aiMetrics.guardrail).toBeGreaterThanOrEqual(11);
  expect(aiMetrics.exampleHeight).toBeGreaterThanOrEqual(36);
  expect(aiMetrics.inputHeight).toBeGreaterThanOrEqual(50);
  expect(aiMetrics.submitHeight).toBeGreaterThanOrEqual(50);
  expect(errs).toEqual([]);
});
