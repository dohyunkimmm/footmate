const {test,expect}=require('@playwright/test');

function failures(page){
  const items=[];
  page.on('pageerror',error=>items.push(`pageerror: ${error.message}`));
  page.on('console',message=>{
    if(message.type()==='error'&&!message.text().includes('Failed to load resource'))items.push(`console.error: ${message.text()}`);
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

test('standalone Real App keeps visual finish ownership in Design System v2 without an extra stylesheet request',async({page})=>{
  const errs=await openCleanApp(page);
  const state=await page.evaluate(()=>({
    styles:[...document.querySelectorAll('link[rel="stylesheet"]')].map(node=>node.getAttribute('href')).filter(Boolean),
    support:getComputedStyle(document.querySelector('.fm-next-app')).getPropertyValue('--fm-finish-type-support').trim()
  }));
  expect(state.styles.at(-1)).toContain('/src/v4/design-system-v2.css');
  expect(state.styles.some(href=>href.includes('real-app-visual-finish.css'))).toBe(false);
  expect(state.support).toBe('12px');
  expect(errs).toEqual([]);
});

test('decision-support surfaces keep the core AI feature visually raised',async({page})=>{
  const errs=await openCleanApp(page);
  await setupToHome(page);
  const screen=page.locator('[data-screen="home"]');
  const card=screen.locator('.fm-next-match-card').first();
  const levelTag=card.locator('.fm-next-match-body > .fm-next-match-tags > .fm-next-tag').filter({hasText:/^고급$/});
  await expect(levelTag).toBeVisible();
  const levelTagSize=await levelTag.evaluate(node=>parseFloat(getComputedStyle(node).fontSize));
  const result=await screen.evaluate(element=>{
    const card=element.querySelector('.fm-next-match-card');
    const media=element.querySelector('.fm-next-match-card-media');
    const tag=element.querySelector('.fm-next-tag');
    const context=element.querySelector('.fm-next-context-card');
    const ai=element.querySelector('.fm-ai-card[data-product-ai="home"]');
    return {
      tagSize:parseFloat(getComputedStyle(tag).fontSize),
      contextShadow:getComputedStyle(context).boxShadow,
      aiShadow:getComputedStyle(ai).boxShadow,
      cardShadow:getComputedStyle(card).boxShadow,
      mediaImage:getComputedStyle(media).backgroundImage
    };
  });
  expect(result.tagSize).toBeGreaterThanOrEqual(11);
  expect(levelTagSize).toBeGreaterThanOrEqual(11);
  expect(result.contextShadow).not.toBe('none');
  expect(result.aiShadow).not.toBe('none');
  expect(result.cardShadow).not.toBe('none');
  expect(result.mediaImage).toContain('linear-gradient');
  expect(result.mediaImage).toContain('radial-gradient');
  expect(errs).toEqual([]);
});

test('Home and Discover expose the same match-card metadata and right-aligned level chips',async({page})=>{
  const errs=await openCleanApp(page);
  await setupToHome(page);
  const expected=[
    {tags:['조건과 잘 맞아요','22분','MF 2자리','고급'],price:'13,000원'},
    {tags:['함께 비교해볼 만해요','12분','FW 1자리','중급'],price:'11,000원'}
  ];
  for(const name of ['home','discover']){
    if(name==='discover')await page.locator('[data-screen="home"] [data-action="nav-discover"]').first().click();
    const screen=page.locator('[data-screen="'+name+'"]');
    await expect(screen).toBeVisible();
    for(const [index,item] of expected.entries()){
      const card=screen.locator('.fm-next-match-card').nth(index);
      const tags=card.locator('.fm-next-match-body > .fm-next-match-tags > .fm-next-tag');
      await expect(tags).toHaveText(item.tags);
      for(const tag of await tags.all())await expect(tag).toBeVisible();
      const level=tags.filter({hasText:new RegExp('^'+item.tags[3]+'$')});
      await expect(level).toBeVisible();
      const geometry=await level.evaluate(node=>({
        right:node.getBoundingClientRect().right,
        rowRight:node.parentElement.getBoundingClientRect().right,
        size:parseFloat(getComputedStyle(node).fontSize)
      }));
      expect(Math.abs(geometry.rowRight-geometry.right)).toBeLessThanOrEqual(1);
      expect(geometry.size).toBeGreaterThanOrEqual(11);
      await expect(card.locator('.fm-next-match-footer b')).toHaveCount(0);
      await expect(card.locator('.fm-next-price')).toHaveText(item.price);
    }
  }
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
