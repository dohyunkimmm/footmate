const {test,expect}=require('@playwright/test');

async function chooseSetupDefaultIfNeeded(page){
  const setup=page.locator('[data-screen="setup"]');
  if(!await setup.isVisible().catch(()=>false))return;
  if(await setup.locator('[data-action="choose-setup"][aria-pressed="true"]').count())return;
  const field=await setup.locator('[data-action="choose-setup"]').first().getAttribute('data-field');
  const value={region:'수원 · 영통',position:'MF',level:'중급'}[field];
  if(value)await setup.locator(`[data-action="choose-setup"][data-value="${value}"]`).click();
}

async function setupToHome(page){
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await chooseSetupDefaultIfNeeded(page);
  await page.getByRole('button',{name:'다음'}).click();
  await chooseSetupDefaultIfNeeded(page);
  await page.getByRole('button',{name:'다음'}).click();
  await chooseSetupDefaultIfNeeded(page);
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
  await page.goto('/demo',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>localStorage.clear());
  await page.reload({waitUntil:'domcontentloaded'});
  await setupToHome(page);
  await expect(page.locator('[data-screen="home"] .fm-next-match-card')).toHaveCount(2);
  await verifyMatchCards(page,'home');
  const shell=await page.locator('.fm-next-app').evaluate(element=>element.getBoundingClientRect().width);
  expect(shell).toBeLessThanOrEqual(560);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  await page.getByRole('button',{name:'전체 보기'}).click();
  await expect(page.locator('[data-screen="discover"]')).toBeVisible();
  await verifyMatchCards(page,'discover');
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

async function verifyMatchCards(page,name){
  const screen=page.locator('[data-screen="'+name+'"]');
  const expected=[
    {tags:['조건과 잘 맞아요','22분','MF 2자리','고급'],price:'13,000원'},
    {tags:['함께 비교해볼 만해요','12분','FW 1자리','중급'],price:'11,000원'}
  ];
  for(const [index,item] of expected.entries()){
    const card=screen.locator('.fm-next-match-card').nth(index);
    const tags=card.locator('.fm-next-match-body > .fm-next-match-tags > .fm-next-tag');
    await expect(tags).toHaveText(item.tags);
    for(const tag of await tags.all())await expect(tag).toBeVisible();
    await expect(card.locator('.fm-next-price')).toHaveText(item.price);
    await expect(card.locator('.fm-next-match-footer b')).toHaveCount(0);
    const level=tags.filter({hasText:new RegExp('^'+item.tags[3]+'$')});
    const gap=await level.evaluate(node=>node.parentElement.getBoundingClientRect().right-node.getBoundingClientRect().right);
    expect(Math.abs(gap)).toBeLessThanOrEqual(1);
  }
  await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:test.info().outputPath('production-'+name+'-390.png'),fullPage:true,animations:'disabled'});
}

const {aiFilters,profileSettings,mediumPriorityUX}=require('./helpers/priority-ux.cjs');
test('high priority AI and filter behavior',async({page})=>{await aiFilters(page,async(name,element)=>element.screenshot({path:test.info().outputPath(name+'.png'),animations:'disabled'}));});
test('high priority MY settings and navigation',async({page})=>{await profileSettings(page,async(name,element)=>element.screenshot({path:test.info().outputPath(name+'.png'),animations:'disabled'}));});
test('medium priority Home Discover and MY ownership',async({page})=>{await mediumPriorityUX(page);});

const checkin=require('./helpers/checkin.cjs');
test('Production shared check-in completion',async({page})=>checkin.persistence(page,async(name,element)=>element.screenshot({path:test.info().outputPath(name+'.png'),animations:'disabled'})));
test('Production check-in eligibility and migration',async({page})=>checkin.gates(page,async(name,element)=>element.screenshot({path:test.info().outputPath(name+'.png'),animations:'disabled'})));
test('Production check-in storage recovery',async({page})=>checkin.recovery(page,async(name,element)=>element.screenshot({path:test.info().outputPath(name+'.png'),animations:'disabled'})));
