const {test,expect}=require('@playwright/test');

async function openClean(page){
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>localStorage.clear());
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.2.0');
}

async function setupToHome(page){
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
}

test('mobile WebKit keeps white-first shell, focus, fixed nav and route reset safe',async({page})=>{
  await openClean(page);
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content','#F7F8F7');
  await expect(page.locator('#footmate-next')).not.toHaveAttribute('aria-live',/.+/);
  await expect(page.locator('#footmate-route-status')).toHaveAttribute('aria-live','polite');
  await setupToHome(page);

  const home=page.locator('[data-screen="home"]');
  await expect(home).toBeFocused();
  const metrics=await home.evaluate(node=>{
    const nav=node.querySelector('.fm-next-nav');
    const buttons=[...node.querySelectorAll('button')].filter(item=>item.getClientRects().length);
    return {
      viewport:innerWidth,
      doc:document.documentElement.scrollWidth,
      navPosition:getComputedStyle(nav).position,
      navBottom:getComputedStyle(nav).bottom,
      minButton:Math.min(...buttons.map(button=>button.getBoundingClientRect().height)),
      background:getComputedStyle(node).backgroundColor
    };
  });
  expect(metrics.doc).toBeLessThanOrEqual(metrics.viewport);
  expect(metrics.navPosition).toBe('fixed');
  expect(metrics.minButton).toBeGreaterThanOrEqual(44);
  expect(metrics.background).toBe('rgb(255, 255, 255)');

  await page.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
  await page.getByRole('button',{name:'경기 찾기'}).click();
  await expect(page.locator('[data-screen="discover"]')).toBeVisible();
  await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBe(0);
  await expect(page.locator('[data-screen="discover"]')).toBeFocused();
});

test('mobile WebKit keeps long match names and Detail decision surface inside viewport',async({page})=>{
  await openClean(page);
  await setupToHome(page);
  const card=page.locator('[data-screen="home"] .fm-next-match-card').first();
  await card.locator('.fm-next-match-place').evaluate(node=>{node.textContent='수원 아주대학교 스포츠센터 프리미엄 야간 풋살 경기';});
  const bounds=await card.evaluate(node=>({viewport:innerWidth,left:node.getBoundingClientRect().left,right:node.getBoundingClientRect().right,doc:document.documentElement.scrollWidth}));
  expect(bounds.left).toBeGreaterThanOrEqual(0);
  expect(bounds.right).toBeLessThanOrEqual(bounds.viewport+1);
  expect(bounds.doc).toBeLessThanOrEqual(bounds.viewport);
  await card.click();
  const detail=page.locator('[data-screen="detail"]');
  await expect(detail).toHaveAttribute('data-product-detail','prioritized');
  await expect(detail.locator('[data-decision-section="fit"]')).toBeVisible();
  await expect(detail.locator('[data-decision-section="capacity"]')).toBeVisible();
  const detailOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  expect(detailOverflow).toBeLessThanOrEqual(0);
});
