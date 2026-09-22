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

async function setup(page){
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
  await page.mouse.move(1,1);
}

test('320px context actions match the approved responsive visual baseline',async({page})=>{
  const errs=await openCleanApp(page,{width:320,height:844});
  await setup(page);
  const actions=page.locator('.fm-next-context-actions');
  await expect(actions).toBeVisible();
  await expect(actions).toHaveScreenshot('real-app-context-actions-320.png',{
    animations:'disabled',
    caret:'hide',
    maxDiffPixels:0
  });
  expect(errs).toEqual([]);
});

test('390px AI card matches the approved visual baseline',async({page})=>{
  const errs=await openCleanApp(page,{width:390,height:844});
  await setup(page);
  const aiCard=page.locator('.fm-ai-card');
  await expect(aiCard).toBeVisible();
  await expect(aiCard).toHaveScreenshot('real-app-ai-card-390.png',{
    animations:'disabled',
    caret:'hide',
    maxDiffPixels:0
  });
  expect(errs).toEqual([]);
});
