const fs=require('fs');
const {test,expect}=require('@playwright/test');

test('Welcome restores the historical title layout without reverting application flows',()=>{
  const app=fs.readFileSync('src/app/app.js','utf8');
  const css=fs.readFileSync('src/app/personalization.css','utf8');
  const welcome=app.slice(app.indexOf('function welcomeView()'),app.indexOf('const setupSteps='));
  expect(welcome).not.toContain('translateY');
  expect(welcome).not.toContain('data-welcome-ai-copy');
  expect(css).not.toContain('.fm-next-intro-copy{transform:');
  expect(welcome).toContain('경기 먼저 둘러보기');
  expect(welcome).toContain('저장된 설정으로 바로 추천 보기');
});

for(const path of ['/app','/demo']){
  test(`Restored ${path} Welcome retains setup, browsing and detail return`,async({page})=>{
    await page.setViewportSize({width:390,height:844});
    await page.goto(path,{waitUntil:'domcontentloaded'});
    await page.evaluate(()=>localStorage.clear());
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1');
    await expect(page).toHaveURL(/\/app(?:\?|$)/);
    await page.getByRole('button',{name:'경기 먼저 둘러보기'}).click();
    await expect(page.locator('[data-screen="discover"]')).toBeVisible();
    await page.locator('[data-screen="discover"] .fm-next-match-card').first().click();
    await expect(page.locator('[data-screen="detail"]')).toBeVisible();
    await page.locator('[data-screen="detail"] [data-action="detail-back"]').click();
    await expect(page.locator('[data-screen="discover"]')).toBeVisible();
    await page.evaluate(()=>localStorage.clear());
    await page.goto('/app');
    await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
    await expect(page.locator('[data-screen="setup"]')).toBeVisible();
  });
}
