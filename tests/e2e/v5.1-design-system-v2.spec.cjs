const {test,expect}=require('@playwright/test');

function failures(page){
  const items=[];
  page.on('pageerror',error=>items.push(`pageerror: ${error.message}`));
  page.on('console',message=>{
    if(message.type()==='error'&&!message.text().includes('Failed to load resource'))items.push(`console.error: ${message.text()}`));
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

async function setupToHome(page){
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
  await page.mouse.move(1,1);
}

async function seedProfile(page,viewport={width:1440,height:900}){
  const errs=failures(page);
  await page.setViewportSize(viewport);
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{
    localStorage.clear();
    localStorage.setItem('footmate:v4:session',JSON.stringify({route:'profile',setupComplete:true,region:'수원 · 영통',position:'MF',level:'중급',signedIn:true,joinedMatchId:null,selectedMatchId:'gwanggyo-2130',matchStage:'discover',userName:'도현'}));
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1');
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
  await expect(page.locator('[data-screen="profile"]')).toBeVisible();
  return errs;
}

async function expectNoHorizontalOverflow(page){
  const overflow=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
  expect(overflow.document).toBeLessThanOrEqual(overflow.viewport);
  expect(overflow.body).toBeLessThanOrEqual(overflow.viewport);
}

const exactScreenshot={animations:'disabled',caret:'hide',maxDiffPixels:24};

test('1440px Design System v2 keeps the mobile app shell centered and component metrics coherent',async({page})=>{
  const errs=await openCleanApp(page,{width:1440,height:900});
  await setupToHome(page);

  const geometry=await page.locator('.fm-next-app').evaluate(element=>{
    const box=element.getBoundingClientRect();
    return {left:box.left,right:innerWidth-box.right,width:box.width,borderRadius:getComputedStyle(element).borderRadius};
  });
  expect(geometry.width).toBeGreaterThanOrEqual(400);
  expect(geometry.width).toBeLessThanOrEqual(404);
  expect(Math.abs(geometry.left-geometry.right)).toBeLessThanOrEqual(1);
  expect(parseFloat(geometry.borderRadius)).toBe(30);

  const header=page.locator('[data-screen="home"] .fm-next-topbar');
  const headerHeight=await header.evaluate(element=>element.getBoundingClientRect().height);
  expect(headerHeight).toBeGreaterThanOrEqual(62);
  expect(headerHeight).toBeLessThanOrEqual(66);

  const card=page.locator('.fm-next-match-card').first();
  const cardStyle=await card.evaluate(element=>({radius:parseFloat(getComputedStyle(element).borderRadius),shadow:getComputedStyle(element).boxShadow}));
  expect(cardStyle.radius).toBeGreaterThanOrEqual(20);
  expect(cardStyle.radius).toBeLessThanOrEqual(22);
  expect(cardStyle.shadow).not.toBe('none');

  const nav=page.locator('.fm-next-nav');
  const navGeometry=await nav.evaluate(element=>{
    const box=element.getBoundingClientRect();
    const active=element.querySelector('button[aria-current="page"]')?.getBoundingClientRect();
    return {left:box.left,right:innerWidth-box.right,width:box.width,height:box.height,activeHeight:active?.height??0};
  });
  expect(Math.abs(navGeometry.left-navGeometry.right)).toBeLessThanOrEqual(1);
  expect(navGeometry.width).toBeGreaterThanOrEqual(380);
  expect(navGeometry.width).toBeLessThanOrEqual(384);
  expect(navGeometry.height).toBeLessThanOrEqual(58);
  expect(navGeometry.activeHeight).toBeGreaterThanOrEqual(44);
  await expectNoHorizontalOverflow(page);
  expect(errs).toEqual([]);
});

test('390px primary controls and navigation share one control grammar',async({page})=>{
  const errs=await openCleanApp(page,{width:390,height:844});
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await expect(page.locator('[data-screen="setup"]')).toBeVisible();

  const nextButton=page.getByRole('button',{name:'다음'});
  const metrics=await nextButton.evaluate(element=>{
    const style=getComputedStyle(element);
    const box=element.getBoundingClientRect();
    return {height:box.height,radius:parseFloat(style.borderRadius),weight:Number(style.fontWeight)};
  });
  expect(metrics.height).toBeGreaterThanOrEqual(44);
  expect(metrics.radius).toBeGreaterThanOrEqual(14);
  expect(metrics.radius).toBeLessThanOrEqual(17);
  expect(metrics.weight).toBeGreaterThanOrEqual(700);

  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
  const current=page.locator('.fm-next-nav button[aria-current="page"]');
  await expect(current).toHaveCount(1);
  const currentWeight=await current.evaluate(element=>Number(getComputedStyle(element).fontWeight));
  expect(currentWeight).toBeGreaterThanOrEqual(700);
  await expectNoHorizontalOverflow(page);
  expect(errs).toEqual([]);
});

test('1440px Profile personalization is a first-class Design System v2 surface',async({page})=>{
  const errs=await seedProfile(page);
  const panel=page.locator('.fm-personalization-panel');
  await expect(panel).toBeVisible();
  const metrics=await panel.evaluate(element=>{
    const style=getComputedStyle(element);
    return {radius:parseFloat(style.borderRadius),shadow:style.boxShadow,background:style.backgroundColor};
  });
  expect(metrics.radius).toBeGreaterThanOrEqual(20);
  expect(metrics.radius).toBeLessThanOrEqual(26);
  expect(metrics.shadow).not.toBe('none');
  await page.mouse.move(1,1);
  await expect(panel).toHaveScreenshot('design-system-v2-personalization-1440.png',exactScreenshot);
  await expectNoHorizontalOverflow(page);
  expect(errs).toEqual([]);
});

test('1440px Detail decision content uses the same surface family',async({page})=>{
  const errs=await openCleanApp(page,{width:1440,height:900});
  await setupToHome(page);
  await page.locator('.fm-next-match-card').first().click();
  await expect(page.locator('[data-screen="detail"]')).toBeVisible();
  const surface=page.locator('[data-screen="detail"]>[data-decision-section="fit"]');
  await expect(surface).toBeVisible();
  const metrics=await surface.evaluate(element=>{
    const style=getComputedStyle(element);
    return {radius:parseFloat(style.borderRadius),border:style.borderTopWidth,shadow:style.boxShadow};
  });
  expect(metrics.radius).toBeGreaterThanOrEqual(18);
  expect(metrics.radius).toBeLessThanOrEqual(22);
  expect(metrics.border).not.toBe('0px');
  await page.mouse.move(1,1);
  await expect(surface).toHaveScreenshot('design-system-v2-decision-surface-1440.png',exactScreenshot);
  await expectNoHorizontalOverflow(page);
  expect(errs).toEqual([]);
});

test('320/375/390/430 keep Design System v2 gutters and persistent navigation overflow-safe',async({page})=>{
  for(const width of [320,375,390,430]){
    await openCleanApp(page,{width,height:844});
    await setupToHome(page);
    const screen=await page.locator('[data-screen="home"]').evaluate(element=>{
      const box=element.getBoundingClientRect();
      const style=getComputedStyle(element);
      return {width:box.width,paddingLeft:parseFloat(style.paddingLeft),paddingRight:parseFloat(style.paddingRight)};
    });
    expect(screen.width).toBeLessThanOrEqual(width);
    expect(Math.abs(screen.paddingLeft-screen.paddingRight)).toBeLessThanOrEqual(1);
    const nav=await page.locator('.fm-next-nav').evaluate(element=>{
      const box=element.getBoundingClientRect();
      return {left:box.left,right:innerWidth-box.right,width:box.width};
    });
    expect(Math.abs(nav.left-nav.right)).toBeLessThanOrEqual(1);
    expect(nav.width).toBeLessThanOrEqual(width-16+1);
    await expectNoHorizontalOverflow(page);
  }
});
