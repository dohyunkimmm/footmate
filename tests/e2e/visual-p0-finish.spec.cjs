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
  await page.evaluate(()=>{localStorage.clear();sessionStorage.clear();});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1');
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
  await expect.poll(()=>page.evaluate(()=>getComputedStyle(document.querySelector('.fm-next-page')).getPropertyValue('--fm-p0-visual-finish').trim())).toBe('1');
  await page.mouse.move(1,1);
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

async function reachCheckout(page){
  await setupToHome(page);
  await page.locator('.fm-next-match-card').first().click();
  await expect(page.locator('[data-screen="detail"]')).toBeVisible();
  await page.getByRole('button',{name:'참가하기'}).click();
  await expect(page.locator('[data-screen="auth"]')).toBeVisible();
  await page.evaluate(()=>{
    const session=JSON.parse(localStorage.getItem('footmate:v4:session')||'{}');
    localStorage.setItem('footmate:v4:session',JSON.stringify({...session,signedIn:true,route:'checkout',userName:session.userName||'도현'}));
  });
  await page.goto('/app?resume=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1');
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
  await expect(page.locator('[data-screen="checkout"]')).toBeVisible();
  await page.mouse.move(1,1);
}

async function expectNoHorizontalOverflow(page){
  const overflow=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
  expect(overflow.document).toBeLessThanOrEqual(overflow.viewport);
  expect(overflow.body).toBeLessThanOrEqual(overflow.viewport);
}

const exact={animations:'disabled',caret:'hide',maxDiffPixels:0};

test('390px Home keeps AI as the only raised focal surface',async({page})=>{
  const errs=await openCleanApp(page);
  await setupToHome(page);
  const home=page.locator('[data-screen="home"]');
  const state=await home.evaluate(element=>{
    const context=element.querySelector('.fm-next-context-card');
    const ai=element.querySelector('.fm-ai-card[data-product-ai="home"]');
    const firstCard=element.querySelector('.fm-next-match-card');
    const firstMedia=firstCard?.querySelector('.fm-next-match-card-media');
    return {
      contextShadow:getComputedStyle(context).boxShadow,
      contextColor:getComputedStyle(context).color,
      aiShadow:getComputedStyle(ai).boxShadow,
      firstShadow:getComputedStyle(firstCard).boxShadow,
      firstMediaColor:getComputedStyle(firstMedia).color,
      firstMediaBackground:getComputedStyle(firstMedia).backgroundImage
    };
  });
  expect(state.contextShadow).toBe('none');
  expect(state.contextColor).toBe('rgb(16, 34, 25)');
  expect(state.aiShadow).not.toBe('none');
  expect(state.firstShadow).not.toBe('none');
  expect(state.firstMediaColor).toBe('rgb(16, 34, 25)');
  expect(state.firstMediaBackground).toContain('linear-gradient');
  const dynamicDates=home.locator('.fm-next-match-date > span:first-child');
  await expect(page).toHaveScreenshot('visual-p0-home-390.png',{...exact,mask:[dynamicDates]});
  await expectNoHorizontalOverflow(page);
  expect(errs).toEqual([]);
});

test('390px Checkout primary execution CTA uses dark green grammar',async({page})=>{
  const errs=await openCleanApp(page);
  await reachCheckout(page);
  const submit=page.locator('[data-screen="checkout"] [data-participation-submit]');
  const style=await submit.evaluate(node=>({background:getComputedStyle(node).backgroundColor,color:getComputedStyle(node).color,border:getComputedStyle(node).borderTopColor}));
  expect(style.background).toBe('rgb(7, 61, 43)');
  expect(style.color).toBe('rgb(255, 255, 255)');
  expect(style.border).toBe('rgb(7, 61, 43)');
  await expect(page).toHaveScreenshot('visual-p0-checkout-390.png',exact);
  await expectNoHorizontalOverflow(page);
  expect(errs).toEqual([]);
});

for(const width of [699,700]){
  test(`${width}px standalone shell keeps continuous 430px width`,async({page})=>{
    const errs=await openCleanApp(page,{width,height:844});
    await setupToHome(page);
    const app=page.locator('.fm-next-app:not([data-embed="true"])');
    const box=await app.boundingBox();
    expect(Math.round(box.width)).toBe(430);
    const dynamicDates=page.locator('[data-screen="home"] .fm-next-match-date > span:first-child');
    await expect(app).toHaveScreenshot(`visual-p0-shell-${width}.png`,{...exact,mask:[dynamicDates]});
    await expectNoHorizontalOverflow(page);
    expect(errs).toEqual([]);
  });
}
