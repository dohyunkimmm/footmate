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
  await page.evaluate(()=>localStorage.clear());
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1');
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
  return errs;
}

async function openPersonalizedWelcome(page,viewport){
  const errs=failures(page);
  await page.setViewportSize(viewport);
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{
    localStorage.clear();
    localStorage.setItem('footmate:v4:session',JSON.stringify({route:'welcome',setupComplete:true,region:'서울 · 강남',position:'GK',level:'입문',signedIn:false,userName:'게스트'}));
    localStorage.setItem('footmate:v4:personalization',JSON.stringify({version:'4.7.0',profile:{region:'수원 · 영통',position:'MF',level:'중급',savedAt:'2026-09-25T00:00:00.000Z'},recentMatchIds:[],favorites:{areas:[],timeWindows:[],formats:[]}}));
  });
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
  await page.mouse.move(1,1);
}

async function expectNoHorizontalOverflow(page){
  const overflow=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
  expect(overflow.document).toBeLessThanOrEqual(overflow.viewport);
  expect(overflow.body).toBeLessThanOrEqual(overflow.viewport);
}

const exact={animations:'disabled',caret:'hide',maxDiffPixels:0};

test('390px Welcome is white-first with readable ink and green accent CTA',async({page})=>{
  const errs=await openCleanApp(page,{width:390,height:844});
  const intro=page.locator('.fm-next-intro');
  const headline=page.locator('.fm-next-intro h1');
  const cta=page.getByRole('button',{name:/내 경기 찾아보기/});
  await expect(intro).toBeVisible();
  await expect(headline).toHaveCSS('color','rgb(19, 32, 25)');
  await expect(page.locator('.fm-next-intro-lead')).toHaveCount(0);
  await expect(page.locator('[data-screen="welcome"] .fm-next-topbar--dark')).toHaveCSS('transform','matrix(1, 0, 0, 1, 0, -12)');
  const ctaStyle=await cta.evaluate(node=>({background:getComputedStyle(node).backgroundColor,height:node.getBoundingClientRect().height}));
  expect(ctaStyle.background).not.toBe('rgb(255, 255, 255)');
  expect(ctaStyle.height).toBeGreaterThanOrEqual(44);
  await expectNoHorizontalOverflow(page);
  await page.mouse.move(1,1);
  await expect(page).toHaveScreenshot('real-app-white-welcome-390.png',{...exact,maxDiffPixels:2});
  expect(errs).toEqual([]);
});

test('390px personalized Welcome keeps one primary CTA and one returning-user shortcut',async({page})=>{
  const errs=await openPersonalizedWelcome(page,{width:390,height:844});
  await expect(page.getByRole('button',{name:/내 경기 찾아보기/})).toBeVisible();
  await expect(page.getByRole('button',{name:/저장된 설정으로 바로 추천 보기/})).toBeVisible();
  await expect(page.getByRole('button',{name:'이전 설정으로 계속하기'})).toHaveCount(0);
  const buttons=page.locator('[data-screen="welcome"] .fm-next-actions button');
  await expect(buttons).toHaveCount(2);
  const geometry=async locator=>locator.evaluate(node=>{const style=getComputedStyle(node);const box=node.getBoundingClientRect();return {height:box.height,paddingTop:style.paddingTop,paddingBottom:style.paddingBottom,borderRadius:style.borderRadius}});
  const firstGeometry=await geometry(buttons.nth(0));
  const secondGeometry=await geometry(buttons.nth(1));
  expect(firstGeometry).toEqual(secondGeometry);
  expect(firstGeometry.height).toBe(54);
  await expectNoHorizontalOverflow(page);
  await page.mouse.move(1,1);
  await expect(page).toHaveScreenshot('real-app-white-personalized-welcome-390.png',exact);
  await buttons.nth(0).click();
  const setupNext=page.getByRole('button',{name:'다음'});
  await expect(setupNext).toBeVisible();
  expect(await geometry(setupNext)).toEqual(firstGeometry);
  expect(errs).toEqual([]);
});

test('390px Home uses neutral match media while raising the core AI surface',async({page})=>{
  const errs=await openCleanApp(page,{width:390,height:844});
  await setupToHome(page);
  const screen=page.locator('[data-screen="home"]');
  const card=screen.locator('.fm-next-match-card').first();
  const media=card.locator('.fm-next-match-card-media');
  const badge=card.locator('.fm-next-fit-badge').first();
  const styles=await Promise.all([
    card.evaluate(node=>({background:getComputedStyle(node).backgroundColor,border:getComputedStyle(node).borderTopColor})),
    media.evaluate(node=>({color:getComputedStyle(node).color,image:getComputedStyle(node).backgroundImage})),
    badge.evaluate(node=>getComputedStyle(node).backgroundColor),
    screen.locator('.fm-ai-card--core').evaluate(node=>({background:getComputedStyle(node).backgroundColor,image:getComputedStyle(node).backgroundImage,shadow:getComputedStyle(node).boxShadow,border:getComputedStyle(node).borderTopColor}))
  ]);
  expect(styles[0].background).toBe('rgb(255, 255, 255)');
  expect(styles[1].color).toBe('rgb(19, 32, 25)');
  expect(styles[1].image).toContain('linear-gradient');
  expect(styles[2]).not.toBe('rgb(255, 255, 255)');
  expect(styles[3].image).toContain('linear-gradient');
  expect(styles[3].shadow).not.toBe('none');
  const nav=screen.locator('.fm-next-nav');
  await expect(nav).toHaveCSS('position','absolute');
  await expectNoHorizontalOverflow(page);
  const dynamicDates=screen.locator('.fm-next-match-date > span:first-child');
  await page.mouse.move(1,1);
  await expect(page).toHaveScreenshot('real-app-white-home-390.png',{...exact,mask:[dynamicDates]});
  expect(errs).toEqual([]);
});

test('390px Discover uses the same neutral match surface system',async({page})=>{
  const errs=await openCleanApp(page,{width:390,height:844});
  await setupToHome(page);
  await page.getByRole('button',{name:'전체 보기'}).click();
  const screen=page.locator('[data-screen="discover"]');
  await expect(screen).toBeVisible();
  const media=screen.locator('.fm-next-match-card-media').first();
  await expect(media).toHaveCSS('color','rgb(19, 32, 25)');
  await expect(screen.locator('.fm-next-nav')).toHaveCSS('position','absolute');
  await expectNoHorizontalOverflow(page);
  const dynamicDates=screen.locator('.fm-next-match-date > span:first-child');
  await page.mouse.move(1,1);
  await expect(page).toHaveScreenshot('real-app-white-discover-390.png',{...exact,mask:[dynamicDates]});
  expect(errs).toEqual([]);
});

for(const width of [320,375,390,430]){
  test(`${width}px keeps Welcome/Home/Discover readable and clear of shell navigation`,async({page})=>{
    const errs=await openCleanApp(page,{width,height:844});
    const welcomeMetrics=await page.locator('.fm-next-intro').evaluate(element=>{
      const headline=element.querySelector('h1').getBoundingClientRect();
      const button=element.querySelector('button').getBoundingClientRect();
      return {headlineWidth:headline.width,buttonHeight:button.height};
    });
    expect(welcomeMetrics.headlineWidth).toBeLessThanOrEqual(width-28);
    expect(welcomeMetrics.buttonHeight).toBeGreaterThanOrEqual(44);
    await expectNoHorizontalOverflow(page);
    await setupToHome(page);
    for(const route of ['home','discover']){
      if(route==='discover')await page.getByRole('button',{name:'전체 보기'}).click();
      const screen=page.locator(`[data-screen="${route}"]`);
      const nav=screen.locator('.fm-next-nav');
      await expect(nav).toHaveCSS('position','absolute');
      const metrics=await screen.evaluate(element=>{
        const nav=element.querySelector('.fm-next-nav').getBoundingClientRect();
        const firstButton=[...element.querySelectorAll('button')].find(node=>node.getClientRects().length);
        const buttonBox=firstButton?.getBoundingClientRect();
        const paddingBottom=parseFloat(getComputedStyle(element).paddingBottom)||0;
        return {navHeight:nav.height,paddingBottom,buttonHeight:buttonBox?.height??44};
      });
      expect(metrics.paddingBottom).toBeGreaterThanOrEqual(metrics.navHeight);
      expect(metrics.buttonHeight).toBeGreaterThanOrEqual(44);
      await expectNoHorizontalOverflow(page);
      if(route==='discover')await page.getByRole('button',{name:'홈'}).click();
    }
    expect(errs).toEqual([]);
  });
}
