const fs=require('fs');
const {test,expect}=require('@playwright/test');

test('Demo entry uses the original ball and app identity before starting the journey',()=>{
  const app=fs.readFileSync('src/app/app.js','utf8');
  const welcome=app.slice(app.indexOf('function welcomeView()'),app.indexOf('const setupSteps='));
  expect(welcome).toContain('footmate-original.png');
  expect(welcome).toContain('fm-app-entry-name');
  expect(welcome).toContain('로그인하고 시작하기');
  expect(welcome).toContain('경기 먼저 둘러보기');
  expect(welcome).not.toContain('data-welcome-ai-copy');
});

for(const path of ['/demo','/app']){
  test(`${path} ends at demo with app identity and preserves browsing/detail return`,async({page})=>{
    await page.setViewportSize({width:390,height:844});
    await page.goto(path,{waitUntil:'domcontentloaded'});
    await page.evaluate(()=>localStorage.clear());
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1');
    await expect(page).toHaveURL(/\/demo(?:\?|$)/);
    await expect(page.locator('.fm-app-entry-name')).toHaveText('FootMate');
    await page.getByRole('button',{name:'경기 먼저 둘러보기'}).click();
    await expect(page.locator('[data-screen="discover"]')).toBeVisible();
    await page.locator('[data-screen="discover"] .fm-next-match-card').first().click();
    await page.getByRole('button',{name:'이전 화면',exact:true}).click();
    await expect(page.locator('[data-screen="discover"]')).toBeVisible();
  });
}

test('Welcome login returns to the app start and then leads to setup, never checkout',async({page})=>{
  await page.goto('/demo');
  await page.evaluate(()=>localStorage.clear());
  await page.reload();
  await page.getByRole('button',{name:'로그인하고 시작하기'}).click();
  await expect(page.locator('[data-screen="auth"]')).toBeVisible();
  await expect(page.locator('.fm-auth-title')).toContainText('로그인 후 플레이 설정과 경기 추천을 시작해요');
  await page.getByRole('button',{name:'앱 시작 화면으로 돌아가기',exact:true}).click();
  await expect(page.locator('.fm-app-entry-name')).toBeVisible();
  await page.getByRole('button',{name:'로그인하고 시작하기'}).click();
  await page.getByRole('button',{name:'체험 로그인으로 계속',exact:true}).click();
  await expect(page.locator('[data-screen="setup"]')).toBeVisible();
  await expect(page.locator('[data-screen="checkout"]')).toHaveCount(0);
});
