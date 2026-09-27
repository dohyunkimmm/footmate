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
  await page.evaluate(()=>{localStorage.clear();sessionStorage.clear();});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1');
  await page.waitForFunction(()=>window.__FOOTMATE_REAL_APP_IA__?.version==='1.0.0');
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
  return errs;
}

async function setupToHome(page){
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
  await expect(page.locator('[data-screen="home"] .fm-ai-card[data-product-ai="home"]')).toBeVisible();
}

async function expectNoOverflow(page){
  const result=await page.evaluate(()=>({viewport:innerWidth,doc:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
  expect(result.doc).toBeLessThanOrEqual(result.viewport);
  expect(result.body).toBeLessThanOrEqual(result.viewport);
}

const exact={animations:'disabled',caret:'hide',maxDiffPixels:0};

test('Home is the AI Match Assistant entry with one compact For You list',async({page})=>{
  const errs=await openCleanApp(page);
  await setupToHome(page);
  const screen=page.locator('[data-screen="home"]');
  const ai=screen.locator('.fm-ai-card[data-product-ai="home"]');
  await expect(screen).toHaveAttribute('data-ia-role','assistant-entry');
  await expect(screen.locator('.fm-next-greeting')).toBeHidden();
  await expect(screen.locator('.fm-next-topbar [data-action="nav-profile"]')).toHaveCount(0);
  await expect(ai.locator('.fm-ai-head strong')).toHaveText('AI에게 원하는 경기를 검색해보세요.');
  await expect(ai.locator('[data-ai-example]:visible')).toHaveCount(3);
  await expect(ai.locator('[data-ai-submit]')).toHaveText('AI로 찾기');
  await expect(ai.locator('.fm-ai-results')).toBeHidden();
  await expect(screen.locator('.fm-next-context-card')).toHaveClass(/fm-ia-action-strip/);
  await expect(screen.locator('.fm-next-context-actions')).toBeVisible();
  await expect(screen.locator('.fm-next-context-actions [data-action="nav-discover"]')).toBeVisible();
  await expect(screen.locator(':scope > .fm-next-section-head h2')).toHaveText('For You');
  await expect(screen.locator(':scope > .fm-next-list')).toHaveCount(1);
  await expect(screen.locator(':scope > .fm-next-list .fm-next-match-card:visible')).toHaveCount(2);
  const metrics=await screen.evaluate(element=>{
    const card=element.querySelector('.fm-next-match-card');
    const media=card.querySelector('.fm-next-match-card-media');
    const tags=[...card.querySelectorAll('.fm-next-tag')].filter(node=>getComputedStyle(node).display!=='none');
    return {cardHeight:card.getBoundingClientRect().height,mediaHeight:media.getBoundingClientRect().height,visibleTags:tags.length,paddingLeft:parseFloat(getComputedStyle(element).paddingLeft),firstCardTop:card.getBoundingClientRect().top,navTop:element.querySelector('.fm-next-nav').getBoundingClientRect().top};
  });
  expect(metrics.cardHeight).toBeLessThanOrEqual(180);
  expect(metrics.mediaHeight).toBeLessThanOrEqual(90);
  expect(metrics.visibleTags).toBeLessThanOrEqual(2);
  expect(metrics.paddingLeft).toBe(16);
  expect(metrics.firstCardTop).toBeLessThanOrEqual(610);
  expect(metrics.navTop-metrics.firstCardTop).toBeGreaterThanOrEqual(110);
  await expectNoOverflow(page);
  const dates=screen.locator('.fm-next-match-date > span:first-child');
  await page.mouse.move(1,1);
  await expect(page).toHaveScreenshot('product-completion-home-ia-390.png',{...exact,maxDiffPixels:24,mask:[dates]});
  expect(errs).toEqual([]);
});

test('Home AI example executes search and hands result state to Discover',async({page})=>{
  await page.route('**/api/ai-match-assistant',async route=>{await new Promise(resolve=>setTimeout(resolve,300));await route.fulfill({status:503,contentType:'application/json',body:'{}'});});
  const errs=await openCleanApp(page);
  await setupToHome(page);
  const home=page.locator('[data-screen="home"]');
  const example=home.locator('[data-ai-example]').first();
  await example.dispatchEvent('pointerdown');
  await expect(example).toHaveAttribute('aria-pressed','true');
  await example.click();
  await expect(home.locator('.fm-ai-card')).toHaveAttribute('data-ai-state','loading');
  await expect(page.locator('[data-screen="discover"]')).toBeVisible();
  const discover=page.locator('[data-screen="discover"]');
  await expect(discover).toHaveAttribute('data-ia-role','result-exploration');
  await expect(discover.locator('.fm-ai-card')).toBeHidden();
  await expect(discover.locator('[data-ia-ai-summary]')).toBeVisible();
  await expect(discover.locator('[data-ia-ai-summary]')).toContainText('8시 이후 · 2만원 이하');
  await expect(discover.locator('.fm-next-section-head h1')).toHaveText('AI 조회 결과');
  await expect(discover.locator('.fm-discovery-count')).toContainText('AI 결과');
  await expect(discover.getByRole('button',{name:/필터/})).toBeVisible();
  await expect(discover.locator('.fm-discovery-sort')).toBeVisible();
  await expectNoOverflow(page);
  const summaryMessage='8시 이후 · 2만원 이하';
  await discover.locator('[data-action="nav-home"]').click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
  await page.locator('[data-screen="home"] [data-action="nav-discover"]').first().click();
  await expect(page.locator('[data-screen="discover"] [data-ia-ai-summary]')).toContainText(summaryMessage);
  expect(errs).toEqual([]);
});

test('601px viewport keeps the mobile-width Home shell compact instead of re-expanding desktop spacing',async({page})=>{
  const errs=await openCleanApp(page,{width:601,height:984});
  await setupToHome(page);
  const density=await page.locator('[data-screen="home"]').evaluate(element=>{
    const app=element.closest('.fm-next-app');
    const sectionCopy=element.querySelector(':scope > .fm-next-section-head p');
    const first=element.querySelector('.fm-next-match-card').getBoundingClientRect();
    const nav=element.querySelector('.fm-next-nav').getBoundingClientRect();
    return {appWidth:app.getBoundingClientRect().width,contextCompact:element.querySelector('.fm-next-context-card').classList.contains('fm-ia-action-strip'),sectionCopyDisplay:getComputedStyle(sectionCopy).display,firstCardTop:first.top,navTop:nav.top};
  });
  expect(density.appWidth).toBeLessThanOrEqual(430);
  expect(density.contextCompact).toBe(true);
  expect(density.sectionCopyDisplay).toBe('none');
  expect(density.firstCardTop).toBeLessThanOrEqual(640);
  expect(density.navTop-density.firstCardTop).toBeGreaterThanOrEqual(170);
  await expectNoOverflow(page);
  expect(errs).toEqual([]);
});

test('Discover owns filters, sorting and whole-match exploration without a duplicate Assistant card',async({page})=>{
  const errs=await openCleanApp(page);
  await setupToHome(page);
  await page.locator('[data-screen="home"] [data-action="nav-discover"]').first().click();
  const screen=page.locator('[data-screen="discover"]');
  await expect(screen).toHaveAttribute('data-ia-role','result-exploration');
  await expect(screen.locator('.fm-ai-card')).toBeHidden();
  await expect(screen.locator('[data-ia-ai-summary]')).toHaveCount(0);
  await expect(screen.locator('.fm-next-topbar > strong')).toHaveCount(0);
  await expect(screen.locator('[data-discovery-heading]')).toBeHidden();
  await expect(screen.getByRole('button',{name:/필터/})).toBeVisible();
  await expect(screen.locator('.fm-discovery-sort')).toBeVisible();
  const expectedMatches=await page.evaluate(()=>window.__FOOTMATE_RECOMMENDATION__.rank().length);
  await expect(screen.locator('.fm-next-list .fm-next-match-card:visible')).toHaveCount(expectedMatches);
  await expectNoOverflow(page);
  const dates=screen.locator('.fm-next-match-date > span:first-child');
  await page.mouse.move(1,1);
  await expect(page).toHaveScreenshot('product-completion-discover-ia-390.png',{...exact,maxDiffPixels:24,mask:[dates]});
  expect(errs).toEqual([]);
});

test('AI fallback exposes an explicit retry action on Home without duplicating results there',async({page})=>{
  await page.route('**/api/ai-match-assistant',route=>route.fulfill({status:503,contentType:'application/json',body:'{}'}));
  const errs=await openCleanApp(page);
  await setupToHome(page);
  const ai=page.locator('[data-screen="home"] .fm-ai-card');
  await ai.locator('[data-ai-input]').fill('20분 이내 중급 MF 경기');
  await ai.locator('[data-ai-submit]').click();
  await expect(ai.locator('[data-ai-mode]')).toHaveAttribute('data-mode','rules-fallback');
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
  await expect(ai.locator('.fm-product-ai-retry')).toBeVisible();
  await expect(ai.locator('.fm-ai-results')).toBeHidden();
  const retry=await ai.locator('.fm-product-ai-retry').evaluate(node=>({height:node.getBoundingClientRect().height,background:getComputedStyle(node).backgroundColor}));
  expect(retry.height).toBeGreaterThanOrEqual(44);
  expect(retry.background).toBe('rgb(255, 255, 255)');
  await expect(ai).toHaveScreenshot('product-completion-ai-fallback-ia-390.png',exact);
  expect(errs).toEqual([]);
});

test('Detail keeps one dark focal hero and removes duplicated legacy information',async({page})=>{
  await page.clock.setFixedTime(new Date('2026-09-24T12:00:00Z'));
  const errs=await openCleanApp(page);
  await setupToHome(page);
  await page.locator('[data-screen="home"] .fm-next-match-card').first().click();
  const detail=page.locator('[data-screen="detail"]');
  await expect(detail).toHaveAttribute('data-product-detail','prioritized');
  await expect(detail.locator('[data-decision-section="fit"]')).toBeVisible();
  await expect(detail.locator('[data-decision-section="capacity"]')).toBeVisible();
  const duplicateVisible=await detail.locator('.fm-next-detail-section:not([data-decision-section])').evaluateAll(nodes=>nodes.filter(node=>{const title=node.querySelector('h2')?.textContent?.trim();return ['나와 잘 맞는 이유','경기 정보','함께 뛰는 사람','취소·환불'].includes(title)&&!node.hidden;}).length);
  expect(duplicateVisible).toBe(0);
  const visual=await detail.evaluate(element=>{const hero=element.querySelector('.fm-next-detail-hero');const toolbarButton=element.querySelector('[data-decision-toolbar] button');const primary=element.querySelector('.fm-next-sticky-cta .fm-next-button--primary');return {heroImage:getComputedStyle(hero).backgroundImage,toolbarBackground:getComputedStyle(toolbarButton).backgroundColor,primaryBackground:getComputedStyle(primary).backgroundColor};});
  expect(visual.heroImage).toContain('linear-gradient');
  expect(visual.toolbarBackground).toBe('rgb(255, 255, 255)');
  expect(visual.primaryBackground).not.toBe('rgb(255, 255, 255)');
  await page.mouse.move(1,1);
  await expect(page).toHaveScreenshot('product-completion-detail-390.png',{...exact,maxDiffPixels:200});
  expect(errs).toEqual([]);
});

for(const width of [320,375,390,430]){
  test(`${width}px keeps density, shell navigation, long names and route reset safe`,async({page})=>{
    const errs=await openCleanApp(page,{width,height:844});
    await setupToHome(page);
    for(const route of ['home','discover']){
      if(route==='discover'){
        await page.locator('[data-screen="home"] [data-action="nav-discover"]').first().click();
        await expect(page.locator('[data-screen="discover"]')).toBeVisible();
      }
      const screen=page.locator(`[data-screen="${route}"]`);
      const nav=screen.locator('.fm-next-nav');
      await expect(nav).toHaveCSS('position','absolute');
      const current=nav.locator('[aria-current="page"]');
      await expect(current).toHaveCount(1);
      const navState=await current.evaluate(node=>({weight:getComputedStyle(node).fontWeight,iconBg:getComputedStyle(node.querySelector('.fm-next-nav-icon')).backgroundColor}));
      expect(Number(navState.weight)).toBeGreaterThanOrEqual(700);
      expect(navState.iconBg).not.toBe('rgba(0, 0, 0, 0)');
      const first=screen.locator('.fm-next-match-card').first();
      await first.locator('.fm-next-match-place').evaluate(node=>{node.textContent='수원 아주대학교 스포츠센터 프리미엄 야간 풋살 경기';});
      const geometry=await first.evaluate(card=>{const title=card.querySelector('.fm-next-match-place').getBoundingClientRect();const box=card.getBoundingClientRect();const buttonHeights=[...document.querySelectorAll('button')].filter(node=>node.getClientRects().length).map(node=>node.getBoundingClientRect().height);return {titleLeft:title.left,titleRight:title.right,boxLeft:box.left,boxRight:box.right,minButton:Math.min(...buttonHeights)};});
      expect(geometry.titleLeft).toBeGreaterThanOrEqual(geometry.boxLeft);
      expect(geometry.titleRight).toBeLessThanOrEqual(geometry.boxRight+1);
      expect(geometry.minButton).toBeGreaterThanOrEqual(44);
      await expectNoOverflow(page);
      await screen.evaluate(node=>node.scrollTo({top:node.scrollHeight,behavior:'instant'}));
      if(route==='home'){
        await page.locator('[data-screen="home"] [data-action="nav-discover"]').first().click();
        await expect(page.locator('[data-screen="discover"]')).toBeVisible();
        await expect.poll(()=>page.locator('[data-screen="discover"]').evaluate(node=>node.scrollTop)).toBe(0);
        await page.getByRole('button',{name:'홈'}).click();
        await expect(page.locator('[data-screen="home"]')).toBeVisible();
      }else{
        await page.getByRole('button',{name:'홈'}).click();
        await expect(page.locator('[data-screen="home"]')).toBeVisible();
        await expect.poll(()=>page.locator('[data-screen="home"]').evaluate(node=>node.scrollTop)).toBe(0);
      }
    }
    expect(errs).toEqual([]);
  });
}
