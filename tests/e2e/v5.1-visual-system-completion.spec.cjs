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
  const errs=failures(page);
  await page.setViewportSize(viewport);
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{localStorage.clear();sessionStorage.clear();});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1');
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
  return errs;
}

async function startSetup(page){
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await expect(page.locator('[data-screen="setup"]')).toBeVisible();
  await page.mouse.move(1,1);
}

async function setupToHome(page){
  await startSetup(page);
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
  await page.mouse.move(1,1);
}

async function openFirstDetail(page){
  await page.locator('.fm-next-match-card').first().click();
  await expect(page.locator('[data-screen="detail"]')).toBeVisible();
  await page.mouse.move(1,1);
}

async function reachCheckout(page){
  await openFirstDetail(page);
  await page.getByRole('button',{name:'참가하기'}).click();
  await page.getByRole('textbox',{name:'아이디'}).fill('member01');
  await page.getByLabel('비밀번호',{exact:true}).fill('password123!');
  await page.getByRole('button',{name:'로그인'}).click();
  await expect(page.locator('[data-screen="checkout"]')).toBeVisible();
}

async function seedJoinedSchedule(page,viewport={width:1440,height:900}){
  const errs=failures(page);
  await page.setViewportSize(viewport);
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{localStorage.clear();sessionStorage.clear();localStorage.setItem('footmate:v4:session',JSON.stringify({route:'schedule',setupComplete:true,region:'수원 · 영통',position:'MF',level:'중급',signedIn:true,joinedMatchId:'suwon-ingye-2000',selectedMatchId:'suwon-ingye-2000',matchStage:'upcoming',userName:'도현'}))});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1');
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
  await expect(page.locator('[data-screen="schedule"]')).toBeVisible();
  return errs;
}

const exactScreenshot={animations:'disabled',caret:'hide',fullPage:false,maxDiffPixels:24};

async function expectNoHorizontalOverflow(page){
  const overflow=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
  expect(overflow.document).toBeLessThanOrEqual(overflow.viewport);
  expect(overflow.body).toBeLessThanOrEqual(overflow.viewport);
}

async function expectDocumentLocked(page){
  const metrics=await page.evaluate(()=>({
    viewport:innerHeight,
    windowScroll:scrollY,
    docHeight:document.documentElement.scrollHeight,
    bodyHeight:document.body.scrollHeight
  }));
  expect(metrics.windowScroll).toBe(0);
  expect(metrics.docHeight).toBeLessThanOrEqual(metrics.viewport);
  expect(metrics.bodyHeight).toBeLessThanOrEqual(metrics.viewport);
}

test('390px Setup matches the completed mobile design system',async({page})=>{
  const errs=await openCleanApp(page,{width:390,height:844});
  await startSetup(page);
  const columns=await page.locator('.fm-next-choice-grid').evaluate(element=>getComputedStyle(element).gridTemplateColumns.split(' ').filter(Boolean).length);
  expect(columns).toBe(1);
  await expectNoHorizontalOverflow(page);
  await expectDocumentLocked(page);
  await expect(page).toHaveScreenshot('visual-system-setup-390.png',exactScreenshot);
  expect(errs).toEqual([]);
});

test('1440px Home and Discover match the completed visual hierarchy',async({page})=>{
  await page.clock.setFixedTime(new Date('2026-09-24T12:00:00Z'));
  const errs=await openCleanApp(page,{width:1440,height:900});
  await setupToHome(page);
  const homeGeometry=await page.locator('[data-screen="home"]').evaluate(element=>{
    const app=element.closest('.fm-next-app').getBoundingClientRect();
    const header=element.querySelector('.fm-next-topbar').getBoundingClientRect();
    const nav=element.querySelector('.fm-next-nav').getBoundingClientRect();
    const navButton=element.querySelector('.fm-next-nav button').getBoundingClientRect();
    return {appWidth:app.width,headerHeight:header.height,navHeight:nav.height,navButtonHeight:navButton.height};
  });
  expect(homeGeometry.appWidth).toBe(402);
  expect(homeGeometry.headerHeight).toBeLessThanOrEqual(64);
  expect(homeGeometry.navHeight).toBeLessThanOrEqual(64);
  expect(homeGeometry.navButtonHeight).toBeLessThanOrEqual(50);
  await expect(page).toHaveScreenshot('visual-system-home-1440.png',exactScreenshot);
  await page.getByRole('button',{name:'전체 보기'}).click();
  await expect(page.locator('[data-screen="discover"]')).toBeVisible();
  const discoverTopGap=await page.locator('[data-screen="discover"]').evaluate(element=>{
    const header=element.querySelector('.fm-next-topbar').getBoundingClientRect();
    const conditions=element.querySelector('.fm-next-section > .fm-next-match-tags').getBoundingClientRect();
    const heading=element.querySelector('[data-discovery-heading]');
    return {gap:conditions.top-header.bottom,titleCount:element.querySelectorAll('.fm-next-topbar>strong').length,headingHidden:Boolean(heading?.hidden),headingDisplay:heading?getComputedStyle(heading).display:null};
  });
  expect(discoverTopGap.gap).toBeGreaterThanOrEqual(18);
  expect(discoverTopGap.titleCount).toBe(0);
  expect(discoverTopGap.headingHidden).toBe(true);
  expect(discoverTopGap.headingDisplay).toBe('none');
  await page.mouse.move(1,1);
  await expect(page).toHaveScreenshot('visual-system-discover-1440.png',exactScreenshot);
  await expectNoHorizontalOverflow(page);
  await expectDocumentLocked(page);
  expect(errs).toEqual([]);
});

test('1440px Auth matches the decision-to-join hierarchy',async({page})=>{
  const errs=await openCleanApp(page,{width:1440,height:900});
  await setupToHome(page);
  await openFirstDetail(page);
  await page.getByRole('button',{name:'참가하기'}).click();
  await expect(page.locator('[data-screen="auth"]')).toBeVisible();
  const authCard=page.locator('.fm-auth-card');
  const authDisplay=await authCard.evaluate(element=>getComputedStyle(element).display);
  expect(authDisplay).not.toBe('grid');
  await page.mouse.move(1,1);
  await expect(page).toHaveScreenshot('visual-system-auth-1440.png',exactScreenshot);
  await expectNoHorizontalOverflow(page);
  await expectDocumentLocked(page);
  expect(errs).toEqual([]);
});

test('1440px Schedule empty and Profile match the completed product surfaces',async({page})=>{
  const errs=await openCleanApp(page,{width:1440,height:900});
  await setupToHome(page);
  await page.getByRole('button',{name:'내 경기'}).click();
  await expect(page.locator('[data-screen="schedule"]')).toBeVisible();
  await page.mouse.move(1,1);
  await expect(page).toHaveScreenshot('visual-system-schedule-empty-1440.png',exactScreenshot);
  await page.getByRole('button',{name:'MY'}).click();
  await expect(page.locator('[data-screen="profile"]')).toBeVisible();
  await page.mouse.move(1,1);
  await expect(page).toHaveScreenshot('visual-system-profile-1440.png',exactScreenshot);
  await expectNoHorizontalOverflow(page);
  await expectDocumentLocked(page);
  expect(errs).toEqual([]);
});

test('390px AI fallback matches the completed state hierarchy',async({page})=>{
  await page.route('**/api/ai-match-assistant',route=>route.fulfill({status:503,contentType:'application/json',body:'{}'}));
  const errs=await openCleanApp(page,{width:390,height:844});
  await setupToHome(page);
  await page.getByLabel('찾고 싶은 경기 조건').fill('20분 안쪽에서 GK 자리 있는 경기');
  await page.getByRole('button',{name:'AI로 찾기'}).click();
  await expect(page.locator('[data-ai-mode]')).toHaveText('Rules fallback');
  await expect(page.locator('[data-screen="home"] .fm-ai-result').first()).toBeHidden();
  await expect(page.locator('[data-screen="home"] .fm-product-ai-retry')).toBeVisible();
  await page.mouse.move(1,1);
  await expect(page.locator('[data-screen="home"] .fm-ai-card')).toHaveScreenshot('visual-system-ai-fallback-390.png',exactScreenshot);
  await expectNoHorizontalOverflow(page);
  expect(errs).toEqual([]);
});

test('390px AI loading and Discovery empty states match the completed state system',async({page})=>{
  await page.route('**/api/ai-match-assistant',async route=>{await new Promise(resolve=>setTimeout(resolve,5000));try{await route.fulfill({status:503,contentType:'application/json',body:'{}'})}catch{}});
  const errs=await openCleanApp(page,{width:390,height:844});
  await setupToHome(page);
  await page.getByLabel('찾고 싶은 경기 조건').fill('21시 이후 11000원 이하 GK 경기');
  await page.getByRole('button',{name:'AI로 찾기'}).click();
  await expect(page.locator('.fm-ai-loading')).toBeVisible();
  await expect(page.locator('.fm-ai-card')).toHaveScreenshot('visual-system-ai-loading-390.png',{animations:'disabled',caret:'hide',maxDiffPixels:24});

  await page.unroute('**/api/ai-match-assistant');
  await page.getByRole('button',{name:'전체 보기'}).click();
  await page.getByRole('button',{name:'필터 열기'}).click();
  await page.getByLabel('날짜').selectOption('tomorrow');
  await page.getByLabel('시간').selectOption('19');
  await page.getByLabel('거리').selectOption('15');
  await page.getByLabel('가격').selectOption('11000');
  await page.getByLabel('포지션').selectOption('GK');
  await page.getByRole('button',{name:'결과 보기'}).click();
  await expect(page.locator('.fm-discovery-empty')).toBeVisible();
  await expect(page.locator('.fm-discovery-empty')).toHaveScreenshot('visual-system-discovery-empty-390.png',{animations:'disabled',caret:'hide',maxDiffPixels:24});
  await expectNoHorizontalOverflow(page);
  expect(errs).toEqual([]);
});

test('390px participation failure matches the recovery hierarchy',async({page})=>{
  const errs=await openCleanApp(page,{width:390,height:844});
  await setupToHome(page);
  await reachCheckout(page);
  await page.evaluate(()=>window.__FOOTMATE_PARTICIPATION__.setNextOutcome('failure'));
  await page.getByRole('button',{name:/결제하고 참가 확정/}).click();
  const failure=page.locator('[data-participation-panel="failure"]');
  await expect(failure).toBeVisible();
  await page.mouse.move(1,1);
  await expect(failure).toHaveScreenshot('visual-system-participation-failure-390.png',{animations:'disabled',caret:'hide',maxDiffPixels:0});
  await expectNoHorizontalOverflow(page);
  expect(errs).toEqual([]);
});

test('1440px Matchday panel matches the completed operational surface',async({page})=>{
  const errs=await seedJoinedSchedule(page);
  const panel=page.getByRole('region',{name:'경기 당일 운영'});
  await expect(panel).toBeVisible();
  await page.mouse.move(1,1);
  await expect(panel).toHaveScreenshot('visual-system-matchday-1440.png',{animations:'disabled',caret:'hide',maxDiffPixels:24});
  await expectNoHorizontalOverflow(page);
  expect(errs).toEqual([]);
});

test('1440px joined Schedule stays inside the app shell and scrolls under persistent navigation',async({page})=>{
  const errs=await seedJoinedSchedule(page);
  const screen=page.locator('[data-screen="schedule"]');
  const geometry=await screen.evaluate(element=>{
    const panel=element.querySelector('.fm-matchday-panel');
    const upcoming=element.querySelector('.fm-next-upcoming');
    const statuses=element.querySelector('.fm-next-status-list');
    const nav=element.querySelector('.fm-next-nav');
    const columns=statuses?getComputedStyle(statuses).gridTemplateColumns.split(' ').filter(Boolean).length:0;
    return {
      panelHeight:panel?.getBoundingClientRect().height??9999,
      upcomingHeight:upcoming?.getBoundingClientRect().height??9999,
      navTop:nav?.getBoundingClientRect().top??0,
      navPosition:getComputedStyle(nav).position,
      scrollHeight:element.scrollHeight,
      clientHeight:element.clientHeight,
      columns
    };
  });
  expect(geometry.columns).toBe(3);
  expect(geometry.panelHeight).toBeLessThanOrEqual(290);
  expect(geometry.upcomingHeight).toBeLessThanOrEqual(180);
  expect(geometry.navPosition).toBe('absolute');
  expect(geometry.scrollHeight).toBeGreaterThan(geometry.clientHeight);
  await expectDocumentLocked(page);
  await screen.evaluate(element=>element.scrollTo({top:element.scrollHeight,behavior:'instant'}));
  await expect.poll(()=>screen.evaluate(element=>element.scrollTop)).toBeGreaterThan(0);
  const end=await screen.evaluate(element=>({
    statusBottom:element.querySelector('.fm-next-status-list')?.getBoundingClientRect().bottom??9999,
    navTop:element.querySelector('.fm-next-nav')?.getBoundingClientRect().top??0
  }));
  expect(end.statusBottom).toBeLessThanOrEqual(end.navTop-8);
  await expectNoHorizontalOverflow(page);
  expect(errs).toEqual([]);
});

test('320/375/390/430 keep Setup and Auth single-column and overflow-safe',async({page})=>{
  for(const width of [320,375,390,430]){
    await openCleanApp(page,{width,height:844});
    await startSetup(page);
    const setupColumns=await page.locator('.fm-next-choice-grid').evaluate(element=>getComputedStyle(element).gridTemplateColumns.split(' ').filter(Boolean).length);
    expect(setupColumns,`setup columns at ${width}px`).toBe(1);
    await expectNoHorizontalOverflow(page);
    await page.getByRole('button',{name:'다음'}).click();
    await page.getByRole('button',{name:'다음'}).click();
    await page.getByRole('button',{name:/추천 경기 보기/}).click();
    await openFirstDetail(page);
    await page.getByRole('button',{name:'참가하기'}).click();
    await expect(page.locator('[data-screen="auth"]')).toBeVisible();
    const authCard=page.locator('.fm-auth-card');
    const authDisplay=await authCard.evaluate(element=>getComputedStyle(element).display);
    expect(authDisplay,`auth card display at ${width}px`).not.toBe('grid');
    await expectNoHorizontalOverflow(page);
  }
});

test('390px Home keeps the decision flow compact before the match list',async({page})=>{
  const errs=await openCleanApp(page,{width:390,height:844});
  await setupToHome(page);
  await expect(page.locator('.fm-ai-card--core')).toBeVisible();
  await expect(page.locator('[data-personalization-explanation]')).toHaveCount(0);
  const metrics=await page.locator('[data-screen="home"]').evaluate(element=>{
    const first=element.querySelector('.fm-next-match-card');
    const ai=element.querySelector('.fm-ai-card--core');
    return {
      scrollHeight:element.scrollHeight,
      clientHeight:element.clientHeight,
      firstMatchTop:first?.getBoundingClientRect().top??9999,
      aiHeight:ai?.getBoundingClientRect().height??9999
    };
  });
  console.log('HOME_DENSITY_METRICS',JSON.stringify(metrics));
  expect(metrics.firstMatchTop).toBeLessThanOrEqual(760);
  expect(metrics.aiHeight).toBeLessThanOrEqual(300);
  expect(metrics.scrollHeight).toBeGreaterThanOrEqual(metrics.clientHeight);
  await expectNoHorizontalOverflow(page);
  await expectDocumentLocked(page);
  await page.mouse.move(1,1);
  const dynamicDates=page.locator('[data-screen="home"] .fm-next-match-date > span:first-child');
  await expect(page).toHaveScreenshot('visual-system-home-390-full.png',{animations:'disabled',caret:'hide',fullPage:false,maxDiffPixels:24,mask:[dynamicDates]});
  expect(errs).toEqual([]);
});

test('390px Discover does not claim personalization before memory exists',async({page})=>{
  const errs=await openCleanApp(page,{width:390,height:844});
  await setupToHome(page);
  await page.getByRole('button',{name:'전체 보기'}).click();
  await expect(page.locator('[data-screen="discover"]')).toBeVisible();
  await expect(page.locator('[data-screen="discover"] .fm-ai-card')).toBeHidden();
  await expect(page.locator('[data-personalization-explanation]')).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
  await expectDocumentLocked(page);
  await page.mouse.move(1,1);
  const dynamicDates=page.locator('[data-screen="discover"] .fm-next-match-date > span:first-child');
  await expect(page).toHaveScreenshot('visual-system-discover-390.png',{animations:'disabled',caret:'hide',fullPage:false,maxDiffPixels:24,mask:[dynamicDates]});
  expect(errs).toEqual([]);
});

for(const width of [320,375,390,430])for(const route of ['home','discover']){
  test(`${width}px ${route} keeps matches scrollable above shell navigation and retains readable controls`,async({page})=>{
    const errs=await openCleanApp(page,{width,height:844});
    await setupToHome(page);
    if(route==='discover')await page.getByRole('button',{name:'전체 보기'}).click();
    const screen=page.locator(`[data-screen="${route}"]`);
    if(route==='home')await expect(screen.locator('.fm-ai-card[data-ai-state="idle"]')).toBeVisible();
    else await expect(screen.locator('.fm-ai-card')).toBeHidden();
    await expect(screen.locator('[data-personalization-explanation]')).toHaveCount(0);
    await expectDocumentLocked(page);
    const metrics=await screen.evaluate(element=>{
      const card=element.querySelector('.fm-next-match-card');
      const first=card.getBoundingClientRect();
      const title=card.querySelector('.fm-next-match-place').getBoundingClientRect();
      const nav=element.querySelector('.fm-next-nav').getBoundingClientRect();
      const smallText=[...element.querySelectorAll('.fm-ai-card *')].filter(node=>node.getClientRects().length&&[...node.childNodes].some(child=>child.nodeType===3&&child.textContent.trim())).map(node=>parseFloat(getComputedStyle(node).fontSize));
      return {firstTop:first.top,titleBottom:title.bottom,navTop:nav.top,minText:smallText.length?Math.min(...smallText):12,scrollHeight:element.scrollHeight,clientHeight:element.clientHeight};
    });
    console.log('DENSITY',JSON.stringify({width,route,...metrics}));
    expect(metrics.firstTop).toBeLessThanOrEqual(metrics.navTop-80);
    expect(metrics.titleBottom).toBeLessThanOrEqual(metrics.navTop-8);
    expect(metrics.minText).toBeGreaterThanOrEqual(11);
    expect(metrics.scrollHeight).toBeGreaterThanOrEqual(metrics.clientHeight);
    await expectNoHorizontalOverflow(page);
    await screen.evaluate(element=>element.scrollTo({top:element.scrollHeight,behavior:'instant'}));
    if(metrics.scrollHeight>metrics.clientHeight)await expect.poll(()=>screen.evaluate(element=>element.scrollTop)).toBeGreaterThan(0);
    else expect(await screen.evaluate(element=>element.scrollTop)).toBe(0);
    const last=screen.locator('.fm-next-match-card').last();
    const end=await last.evaluate(element=>({bottom:element.getBoundingClientRect().bottom,navTop:document.querySelector('.fm-next-nav').getBoundingClientRect().top}));
    expect(end.bottom).toBeLessThanOrEqual(end.navTop);
    await screen.evaluate(element=>element.scrollTo({top:0,behavior:'instant'}));
    await page.mouse.move(1,1);
    await expect(page).toHaveScreenshot(`product-density-${route}-${width}.png`,{animations:'disabled',caret:'hide',maxDiffPixels:0,mask:[screen.locator('.fm-next-match-date > span:first-child')]});
    expect(errs).toEqual([]);
  });
}

test('opening Detail after scrolling a match list starts the new content scroller at the top',async({page})=>{
  await openCleanApp(page,{width:390,height:620});
  await setupToHome(page);
  await page.getByRole('button',{name:'전체 보기'}).click();
  const discover=page.locator('[data-screen="discover"]');
  await expect(discover).toBeVisible();
  const last=discover.locator('.fm-next-match-card').last();
  await discover.evaluate(element=>element.scrollTo({top:element.scrollHeight,behavior:'instant'}));
  await expect.poll(()=>discover.evaluate(element=>element.scrollTop)).toBeGreaterThan(0);
  await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBe(0);
  await last.click();
  const detail=page.locator('[data-screen="detail"]');
  await expect(detail).toBeVisible();
  await expect.poll(()=>detail.evaluate(element=>element.scrollTop)).toBe(0);
  await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBe(0);
  const title=detail.locator('h1');
  expect((await title.boundingBox()).y).toBeLessThan(300);
});
