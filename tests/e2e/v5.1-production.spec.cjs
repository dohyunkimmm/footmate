const {test,expect}=require('@playwright/test');
const RELEASE='5.2.0';

async function setupToHome(page){
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>localStorage.clear());
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(version=>window.__FOOTMATE_V5__?.version===version,RELEASE);
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
}

test('exact Production exposes the canonical release and connected AI boundary',async({page,request})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await expect(page.locator('meta[name="footmate-release"]')).toHaveAttribute('content',RELEASE);
  await page.waitForFunction(version=>window.__FOOTMATE_V5__?.version===version&&window.__FOOTMATE_AI__?.version===version,RELEASE);
  await expect(page.locator('#footmate-next')).toHaveAttribute('data-connected-platform-version',RELEASE);
  await expect(page.locator('#footmate-next')).toHaveAttribute('data-ai-assistant','available');
  const api=await request.get('/api/ai-match-assistant');expect(api.ok()).toBe(true);
  const health=await api.json();expect(health.version).toBe(RELEASE);expect(health.provider).toBe('vercel-ai-gateway');
});

test('exact Production verifies white-first Home Discover Detail and accessibility geometry',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await setupToHome(page);
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content','#F7F8F7');
  await expect(page.locator('#footmate-next')).not.toHaveAttribute('aria-live',/.+/);
  await expect(page.locator('#footmate-route-status')).toHaveAttribute('aria-live','polite');
  const home=page.locator('[data-screen="home"]');
  await expect(home.locator('.fm-ai-card[data-product-ai="home"]')).toBeVisible();
  let geometry=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,minButton:Math.min(...[...document.querySelectorAll('button')].filter(n=>n.getClientRects().length).map(n=>n.getBoundingClientRect().height))}));
  expect(geometry.scroll).toBeLessThanOrEqual(geometry.width);expect(geometry.minButton).toBeGreaterThanOrEqual(44);
  await page.getByRole('button',{name:'경기 찾기'}).click();
  const discover=page.locator('[data-screen="discover"]');await expect(discover.locator('.fm-ai-card[data-product-ai="discover"]')).toBeVisible();
  await discover.locator('.fm-next-match-card').first().click();
  const detail=page.locator('[data-screen="detail"]');await expect(detail).toHaveAttribute('data-product-detail','prioritized');
  await expect(detail.locator('[data-decision-section="fit"]')).toBeVisible();
  await expect(detail.locator('[data-decision-section="capacity"]')).toBeVisible();
  geometry=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));expect(geometry.scroll).toBeLessThanOrEqual(geometry.width);
});

test('exact Production aliases stay current',async({page})=>{for(const route of ['/demo','/next']){await page.goto(route,{waitUntil:'domcontentloaded'});await expect(page.locator('meta[name="footmate-release"]')).toHaveAttribute('content',RELEASE)}});
