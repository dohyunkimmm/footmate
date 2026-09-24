const {test,expect}=require('@playwright/test');

async function setupToHome(page){
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
}

test('v5.1.1 components render inside the v5.2.0 exact Production release boundary',async({page,request})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await expect(page.locator('meta[name="footmate-release"]')).toHaveAttribute('content','5.2.0');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content','#f7f8f7');
  await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1'&&window.__FOOTMATE_AI__?.version==='5.1.1');
  await expect(page.locator('#footmate-next')).toHaveAttribute('data-connected-platform-version','5.1.1');
  await expect(page.locator('#footmate-next')).toHaveAttribute('data-ai-assistant','available');
  await expect(page.locator('#footmate-next')).not.toHaveAttribute('aria-live',/.+/);
  const api=await request.get('/api/ai-match-assistant');
  expect(api.ok()).toBe(true);
  const health=await api.json();
  expect(health.version).toBe('5.1.1');
  expect(health.provider).toBe('vercel-ai-gateway');
  expect(health.model).toBe('openai/gpt-5.4-mini');
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('meta[name="footmate-case-study-release"]')).toHaveAttribute('content','5.1.1');
  await page.waitForFunction(()=>document.documentElement.dataset.footmateCaseStudyRelease==='5.1.1');
  await expect(page.locator('[data-v5-ai-evidence="guardrailed"]')).toHaveCount(1);
});

test('v5.2.0 exact Production aliases stay current',async({page})=>{
  for(const route of ['/demo','/next']){
    await page.goto(route,{waitUntil:'domcontentloaded'});
    await expect(page.locator('meta[name="footmate-release"]')).toHaveAttribute('content','5.2.0');
  }
});

test('v5.2.0 exact Production verifies Home, Discover and prioritized Detail UI contracts',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>localStorage.clear());
  await page.reload({waitUntil:'domcontentloaded'});
  await setupToHome(page);
  await expect(page.locator('[data-screen="home"] .fm-next-match-card')).toHaveCount(2);
  const shell=await page.locator('.fm-next-app').evaluate(element=>element.getBoundingClientRect().width);
  expect(shell).toBeLessThanOrEqual(560);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  await page.getByRole('button',{name:'전체 보기'}).click();
  await expect(page.locator('[data-screen="discover"]')).toBeVisible();
  await page.locator('.fm-next-match-card').first().click();
  const detail=page.locator('[data-screen="detail"]');
  await expect(detail).toBeVisible();
  await expect(detail).toHaveAttribute('data-product-detail','prioritized');
  await expect(detail.locator('[data-decision-section]')).toHaveCount(4);
  for(const heading of ['나와 잘 맞는 이유','경기 정보','함께 뛰는 사람','취소·환불']){
    await expect(detail.getByRole('heading',{name:heading,exact:true})).toHaveCount(0);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
});
