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

async function setup(page){
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
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
  await page.getByRole('button',{name:'참가하기'}).click();
  await page.getByRole('textbox',{name:'아이디 또는 이메일'}).fill('member@example.com');
  await page.getByLabel('비밀번호',{exact:true}).fill('password123!');
  await page.getByRole('button',{name:'로그인'}).click();
  await expect(page.locator('[data-screen="checkout"]')).toBeVisible();
  await expect(page.locator('[data-participation-submit]')).toBeVisible();
  await page.mouse.move(1,1);
}

const exactScreenshot={animations:'disabled',caret:'hide',maxDiffPixels:0};

test('320px context actions match the approved responsive visual baseline',async({page})=>{
  const errs=await openCleanApp(page,{width:320,height:844});
  await setup(page);
  const actions=page.locator('.fm-next-context-actions');
  await expect(actions).toBeVisible();
  await expect(actions).toHaveScreenshot('real-app-context-actions-320.png',exactScreenshot);
  expect(errs).toEqual([]);
});

test('390px AI card matches the approved visual baseline',async({page})=>{
  const errs=await openCleanApp(page,{width:390,height:844});
  await setup(page);
  const aiCard=page.locator('.fm-ai-card');
  await expect(aiCard).toBeVisible();
  await expect(aiCard).toHaveScreenshot('real-app-ai-card-390.png',exactScreenshot);
  expect(errs).toEqual([]);
});

test('1440px Home and Discover use intentional two-column card density',async({page})=>{
  const errs=await openCleanApp(page,{width:1440,height:900});
  await setup(page);

  const homeCards=await page.locator('[data-screen="home"]>.fm-next-list .fm-next-match-card').evaluateAll(nodes=>nodes.map(node=>{
    const box=node.getBoundingClientRect();
    return {x:box.x,y:box.y,width:box.width};
  }));
  expect(homeCards).toHaveLength(2);
  expect(Math.abs(homeCards[0].y-homeCards[1].y)).toBeLessThanOrEqual(2);
  expect(homeCards[1].x).toBeGreaterThan(homeCards[0].x);
  expect(homeCards[0].width).toBeGreaterThanOrEqual(420);
  expect(homeCards[1].width).toBeGreaterThanOrEqual(420);

  await page.getByRole('button',{name:'전체 보기'}).click();
  await expect(page.locator('[data-screen="discover"]')).toBeVisible();
  await page.waitForFunction(()=>{
    const cards=[...document.querySelectorAll('[data-screen="discover"] .fm-next-list .fm-next-match-card')].slice(0,2);
    if(cards.length<2)return false;
    const first=cards[0].getBoundingClientRect();
    const second=cards[1].getBoundingClientRect();
    return Math.abs(first.y-second.y)<=2&&second.x>first.x;
  });
  const discoverCards=await page.locator('[data-screen="discover"] .fm-next-list .fm-next-match-card').evaluateAll(nodes=>nodes.slice(0,2).map(node=>{
    const box=node.getBoundingClientRect();
    return {x:box.x,y:box.y,width:box.width};
  }));
  expect(discoverCards).toHaveLength(2);
  expect(Math.abs(discoverCards[0].y-discoverCards[1].y)).toBeLessThanOrEqual(2);
  expect(discoverCards[1].x).toBeGreaterThan(discoverCards[0].x);
  expect(discoverCards[0].width).toBeGreaterThanOrEqual(420);
  expect(discoverCards[1].width).toBeGreaterThanOrEqual(420);

  const overflow=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
  expect(overflow.document).toBeLessThanOrEqual(overflow.viewport);
  expect(overflow.body).toBeLessThanOrEqual(overflow.viewport);
  expect(errs).toEqual([]);
});

test('390px decision micro labels keep the 11px readability baseline',async({page})=>{
  const errs=await openCleanApp(page,{width:390,height:844});
  await setup(page);
  await openFirstDetail(page);
  const policyLabel=page.locator('.fm-decision-policy-grid small').first();
  await expect(policyLabel).toBeVisible();
  const policySize=parseFloat(await policyLabel.evaluate(node=>getComputedStyle(node).fontSize));
  expect(policySize).toBeGreaterThanOrEqual(11);
  expect(errs).toEqual([]);
});

test('1440px Detail matches the approved desktop visual baseline',async({page})=>{
  const errs=await openCleanApp(page,{width:1440,height:900});
  await setup(page);
  await openFirstDetail(page);
  await expect(page).toHaveScreenshot('real-app-detail-1440.png',exactScreenshot);
  expect(errs).toEqual([]);
});

test('1440px Checkout matches the approved desktop visual baseline',async({page})=>{
  const errs=await openCleanApp(page,{width:1440,height:900});
  await setup(page);
  await openFirstDetail(page);
  await reachCheckout(page);
  await expect(page).toHaveScreenshot('real-app-checkout-1440.png',exactScreenshot);
  expect(errs).toEqual([]);
});

test('1440px Success matches the approved desktop visual baseline',async({page})=>{
  const errs=await openCleanApp(page,{width:1440,height:900});
  await setup(page);
  await openFirstDetail(page);
  await reachCheckout(page);
  await page.locator('[data-participation-submit]').click();
  await expect(page.locator('[data-screen="success"]')).toBeVisible({timeout:5000});
  await page.mouse.move(1,1);
  await expect(page).toHaveScreenshot('real-app-success-1440.png',exactScreenshot);
  expect(errs).toEqual([]);
});
