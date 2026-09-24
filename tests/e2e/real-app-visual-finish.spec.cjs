const {test,expect}=require('@playwright/test');

function failures(page){
  const items=[];
  page.on('pageerror',error=>items.push(`pageerror: ${error.message}`));
  page.on('console',message=>{
    if(message.type()==='error'&&!message.text().includes('Failed to load resource'))items.push(`console.error: ${message.text()}`));
  });
  return items;
}

async function openCleanApp(page,viewport={width:390,height:844}){
  const errs=failures(page);
  await page.setViewportSize(viewport);
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>localStorage.clear());
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1');
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
  return errs;
}

async function setupToHome(page){
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
}

test('standalone Real App loads the visual finish layer last',async({page})=>{
  const errs=await openCleanApp(page);
  const styles=await page.locator('link[rel="stylesheet"]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('href')).filter(Boolean));
  expect(styles.at(-1)).toContain('/src/v4/real-app-visual-finish.css');
  expect(errs).toEqual([]);
});

test('decision-support text and recommendation surfaces use the finish hierarchy',async({page})=>{
  const errs=await openCleanApp(page);
  await setupToHome(page);
  const screen=page.locator('[data-screen="home"]');
  const result=await screen.evaluate(element=>{
    const card=element.querySelector('.fm-next-match-card');
    const media=element.querySelector('.fm-next-match-card-media');
    const tag=element.querySelector('.fm-next-tag');
    const footer=element.querySelector('.fm-next-match-footer b');
    const context=element.querySelector('.fm-next-context-card');
    const ai=element.querySelector('.fm-ai-card[data-product-ai="home"]');
    return {
      tagSize:parseFloat(getComputedStyle(tag).fontSize),
      footerSize:parseFloat(getComputedStyle(footer).fontSize),
      contextShadow:getComputedStyle(context).boxShadow,
      aiShadow:getComputedStyle(ai).boxShadow,
      cardShadow:getComputedStyle(card).boxShadow,
      mediaImage:getComputedStyle(media).backgroundImage
    };
  });
  expect(result.tagSize).toBeGreaterThanOrEqual(11);
  expect(result.footerSize).toBeGreaterThanOrEqual(12);
  expect(result.contextShadow).toBe('none');
  expect(result.aiShadow).toBe('none');
  expect(result.cardShadow).not.toBe('none');
  expect(result.mediaImage).toContain('linear-gradient');
  expect(result.mediaImage).not.toContain('radial-gradient');
  expect(errs).toEqual([]);
});

test('fallback recovery uses warning semantics without changing the retry contract',async({page})=>{
  await page.route('**/api/ai-match-assistant',route=>route.fulfill({status:503,contentType:'application/json',body:'{}'}));
  const errs=await openCleanApp(page);
  await setupToHome(page);
  const ai=page.locator('[data-screen="home"] .fm-ai-card');
  await ai.locator('[data-ai-input]').fill('20분 이내 중급 MF 경기');
  await ai.locator('[data-ai-submit]').click();
  await expect(ai.locator('[data-ai-mode]')).toHaveAttribute('data-mode','rules-fallback');
  await expect(ai.locator('.fm-product-ai-retry')).toBeVisible();
  const state=await ai.evaluate(element=>{
    const status=element.querySelector('.fm-ai-status');
    const copy=status?.querySelector('span');
    const retry=element.querySelector('.fm-product-ai-retry');
    return {
      statusBackground:getComputedStyle(status).backgroundColor,
      copySize:parseFloat(getComputedStyle(copy).fontSize),
      retryHeight:retry.getBoundingClientRect().height,
      retryShadow:getComputedStyle(retry).boxShadow
    };
  });
  expect(state.statusBackground).not.toBe('rgb(255, 255, 255)');
  expect(state.copySize).toBeGreaterThanOrEqual(12);
  expect(state.retryHeight).toBeGreaterThanOrEqual(44);
  expect(state.retryShadow).toBe('none');
  expect(errs).toEqual([]);
});

test('reduced motion keeps geometry and suppresses decorative motion',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  const errs=await openCleanApp(page);
  await setupToHome(page);
  const motion=await page.locator('[data-screen="home"] .fm-next-match-card').first().evaluate(node=>({
    duration:getComputedStyle(node).transitionDuration,
    width:node.getBoundingClientRect().width
  }));
  expect(parseFloat(motion.duration)).toBeLessThanOrEqual(.001);
  expect(motion.width).toBeGreaterThan(0);
  expect(errs).toEqual([]);
});
