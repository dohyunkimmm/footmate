const {test,expect}=require('@playwright/test');

async function setupToHome(page){
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
}

test('Mobile Safari/WebKit keeps the Real App flow geometry, focus and fixed navigation stable',async({page})=>{
  for(const width of [320,375,390,430]){
    await page.setViewportSize({width,height:844});
    await page.goto('/app',{waitUntil:'domcontentloaded'});
    await page.evaluate(()=>localStorage.clear());
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1');
    expect(await page.evaluate(()=>performance.now())).toBeLessThanOrEqual(4000);
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content','#f7f8f7');
    await expect(page.locator('#footmate-next')).not.toHaveAttribute('aria-live',/.+/);
    await setupToHome(page);
    const geometry=await page.evaluate(()=>({
      viewport:innerWidth,
      documentWidth:document.documentElement.scrollWidth,
      shell:document.querySelector('.fm-next-app')?.getBoundingClientRect().width||0,
      nav:document.querySelector('.fm-next-nav')?.getBoundingClientRect().toJSON()||null
    }));
    expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewport+1);
    expect(geometry.shell).toBeLessThanOrEqual(560);
    expect(geometry.nav.width).toBeLessThanOrEqual(width);
    await page.locator('.fm-next-match-card').first().click();
    await expect(page.locator('[data-screen="detail"]')).toBeVisible();
    await expect(page.locator('[data-decision-section]')).toHaveCount(4);
    expect(await page.evaluate(()=>document.activeElement?.dataset?.screen)).toBe('detail');
  }
});

const {aiFilters,profileSettings}=require('./helpers/priority-ux.cjs');
test('high priority AI and filter behavior',async({page})=>{await aiFilters(page);});
test('high priority MY settings and navigation',async({page})=>{await profileSettings(page,async(name,element)=>element.screenshot({path:test.info().outputPath(name+'.png'),animations:'disabled'}));});

const checkin=require('./helpers/checkin.cjs');
test('Mobile Safari/WebKit shared check-in completion',async({page})=>checkin.persistence(page));
test('Mobile Safari/WebKit check-in eligibility and migration',async({page})=>checkin.gates(page));
test('Mobile Safari/WebKit check-in storage recovery',async({page})=>checkin.recovery(page));
