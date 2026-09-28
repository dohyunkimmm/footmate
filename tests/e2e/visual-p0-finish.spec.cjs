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

const shot={animations:'disabled',caret:'hide',fullPage:false,maxDiffPixels:0};

test('P0 Home keeps AI Assistant as the only raised focal surface',async({page})=>{
  const errs=await openCleanApp(page,{width:390,height:844});
  await setupToHome(page);
  const screen=page.locator('[data-screen="home"]');
  const state=await screen.evaluate(element=>{
    const context=element.querySelector('.fm-next-context-card');
    const contextTitle=context.querySelector('h2');
    const ai=element.querySelector('.fm-ai-card[data-product-ai="home"]');
    const firstCard=element.querySelector('.fm-next-list .fm-next-match-card:first-child');
    const firstMedia=firstCard?.querySelector('.fm-next-match-card-media');
    const firstPlace=firstCard?.querySelector('.fm-next-match-place');
    return {
      contextTitleColor:getComputedStyle(contextTitle).color,
      contextShadow:getComputedStyle(context).boxShadow,
      aiShadow:getComputedStyle(ai).boxShadow,
      firstCardShadow:getComputedStyle(firstCard).boxShadow,
      firstPlaceColor:getComputedStyle(firstPlace).color,
      firstMediaImage:getComputedStyle(firstMedia).backgroundImage
    };
  });
  expect(state.contextTitleColor).toBe('rgb(7, 61, 43)');
  expect(state.contextShadow).toBe('none');
  expect(state.aiShadow).not.toBe('none');
  expect(state.firstCardShadow).toBe('none');
  expect(state.firstPlaceColor).toBe('rgb(7, 61, 43)');
  expect(state.firstMediaImage).toContain('linear-gradient');
  expect(errs).toEqual([]);
});

test('P0 Checkout uses deep green for the execution CTA',async({page})=>{
  const errs=await openCleanApp(page,{width:390,height:844});
  await reachCheckout(page);
  const button=page.locator('[data-screen="checkout"] [data-participation-submit]');
  const style=await button.evaluate(node=>({
    background:getComputedStyle(node).backgroundColor,
    border:getComputedStyle(node).borderTopColor,
    color:getComputedStyle(node).color
  }));
  expect(style.background).toBe('rgb(7, 61, 43)');
  expect(style.border).toBe('rgb(7, 61, 43)');
  expect(style.color).toBe('rgb(255, 255, 255)');
  expect(errs).toEqual([]);
});

for(const width of [699,700]){
  test(`P0 shell stays continuous at ${width}px`,async({page})=>{
    const errs=await openCleanApp(page,{width,height:844});
    const app=page.locator('.fm-next-app:not([data-embed="true"])');
    const geometry=await app.evaluate(node=>({
      width:node.getBoundingClientRect().width,
      radius:parseFloat(getComputedStyle(node).borderRadius)||0
    }));
    expect(Math.round(geometry.width)).toBe(430);
    if(width===699)expect(geometry.radius).toBe(0);
    else expect(geometry.radius).toBeGreaterThanOrEqual(28);
    await expect(page).toHaveScreenshot(`visual-p0-shell-${width}.png`,shot);
    expect(errs).toEqual([]);
  });
}
