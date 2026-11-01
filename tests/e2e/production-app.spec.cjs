// Archived prototype coverage; released Beta entry is covered by beta-core and production entry tests.
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
  await chooseSetupDefaultIfNeeded(page);await page.getByRole('button',{name:'다음'}).click();
  await chooseSetupDefaultIfNeeded(page);await page.getByRole('button',{name:'다음'}).click();
  await chooseSetupDefaultIfNeeded(page);await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
}

test('v5.1.1 components render inside the v6.0.0 exact Production release boundary',async({page,request})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/prototype',{waitUntil:'domcontentloaded'});
  await expect(page.locator('meta[name="footmate-release"]')).toHaveAttribute('content','6.0.0');
  await expect(page.locator('meta[name="footmate-release-name"]')).toHaveAttribute('content','unified-release-app');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content','#f7f8f7');
  await page.waitForFunction(()=>window.__FOOTMATE_RELEASE_APP__?.version==='6.0.0'&&window.__FOOTMATE_V5__?.version==='5.1.1'&&window.__FOOTMATE_AI__?.version==='5.1.1');
  await expect(page.locator('#footmate-next')).toHaveAttribute('data-release-app-version','6.0.0');
  await expect(page.locator('#footmate-next')).toHaveAttribute('data-connected-platform-version','5.1.1');
  await expect(page.locator('#footmate-next')).toHaveAttribute('data-ai-assistant','available');
  await expect(page.locator('#footmate-next')).not.toHaveAttribute('aria-live',/.+/);
  const api=await request.get('/api/ai-match-assistant');
  expect(api.ok()).toBe(true);
  const health=await api.json();
  expect(health.version).toBe('5.1.1');
  expect(health.provider).toBe('vercel-ai-gateway');
  expect(health.model).toBe('openai/gpt-5.4-nano');
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('meta[name="footmate-case-study-release"]')).toHaveAttribute('content','5.5.0');
  await expect(page.locator('.toc-item')).toHaveCount(9);
  await page.locator('.toc-item').nth(2).click();
  await page.locator('#section-03 > details summary').first().click();
  await expect(page.locator('#section-03')).toContainText('참가·결제는 이용자 직접 승인.');
  await page.locator('.toc-item').nth(6).click();
  await expect(page.locator('#section-07')).toContainText('선택 조건 검증 → 실제 경기 후보 → AI 추천 순서');
});

test('retired app URLs open the released connected Beta',async({page})=>{
  for(const route of ['/demo','/app','/app.html','/demo.html','/next','/next.html']){
    await page.goto(route,{waitUntil:'domcontentloaded'});
    await expect(page.locator('#footmate-beta')).toBeVisible();
    await expect(page.locator('#footmate-next')).toHaveCount(0);
    await expect(page.locator('meta[name="footmate-release-name"]')).toHaveAttribute('content','connected-beta');
  }
});

test('v6.0.0 exact Production verifies Home, Discover and prioritized Detail UI contracts',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/prototype',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>localStorage.clear());
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_RELEASE_APP__?.version==='6.0.0');
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
  await expect(detail).toHaveAttribute('data-v6-detail','true');
  await expect(detail.locator('[data-decision-section]')).toHaveCount(4);
  for(const heading of ['나와 잘 맞는 이유','경기 정보','함께 뛰는 사람','취소·환불']){
    await expect(detail.getByRole('heading',{name:heading,exact:true})).toHaveCount(0);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
});

test('v6.0.0 exact Production verifies free Join to Success to MY handoff',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/prototype',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>localStorage.clear());
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_RELEASE_APP__?.version==='6.0.0');
  await setupToHome(page);
  await page.locator('[data-screen="home"] .fm-next-match-card').first().click();
  await page.getByRole('button',{name:'참가하기'}).click();
  await page.getByRole('button',{name:'체험 로그인으로 계속'}).click();
  const join=page.locator('[data-screen="checkout"]');
  await expect(join).toBeVisible();
  await expect(join).toHaveAttribute('data-v6-join','free');
  await expect(join.locator('[data-v6-hidden-payment="true"]')).toBeHidden();
  await page.getByRole('button',{name:'무료로 참가 확정'}).click();
  await expect(page.locator('[data-screen="success"]')).toBeVisible();
  const participation=await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:participation')||'{}'));
  expect(participation.amount).toBe(0);
  expect(participation.paymentMethod).toBe('none');
  await page.getByRole('button',{name:'내 경기 보기'}).click();
  await expect(page.locator('[data-screen="profile"]')).toBeVisible();
  await expect(page.locator('[data-screen="profile"]')).toHaveAttribute('data-v6-my','true');
});

test('v6.0.0 exact Production migrates legacy Schedule ownership into MY',async({page})=>{
  await page.goto('/prototype',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{
    localStorage.clear();
    localStorage.setItem('footmate:session',JSON.stringify({schemaVersion:2,route:'schedule',setupComplete:true,region:'수원 · 영통',position:'MF',level:'중급',signedIn:true,matchStage:'discover'}));
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_RELEASE_APP__?.version==='6.0.0');
  await expect(page.locator('[data-screen="profile"]')).toBeVisible();
  const route=await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:session')||'{}').route);
  expect(route).toBe('profile');
});

async function verifyMatchCards(page,name){
  const screen=page.locator('[data-screen="'+name+'"]');
  const context=await page.evaluate(async()=>({
    catalog:(await import('/src/app/data.js')).MATCHES,
    session:JSON.parse(localStorage.getItem('footmate:v4:session')||'{}'),
    recommendations:window.__FOOTMATE_RECOMMENDATION__.rank(JSON.parse(localStorage.getItem('footmate:v4:session')||'{}'))
  }));
  const cards=screen.locator('.fm-next-match-card');
  expect(await cards.count()).toBeGreaterThanOrEqual(2);
  for(let index=0;index<2;index++){
    const card=cards.nth(index);
    const id=await card.getAttribute('data-match-id');
    const match=context.catalog.find(item=>item.id===id);
    const recommendation=context.recommendations.find(item=>item.id===id);
    expect(match,'rendered card belongs to the sample catalog').toBeDefined();
    expect(recommendation,'rendered card has a recommendation reason').toBeDefined();
    const level={'초중급':'초급','중급+':'고급'}[match.level]||match.level;
    const tags=card.locator('.fm-next-match-body > .fm-next-match-tags > .fm-next-tag');
    await expect(tags).toHaveCount(4);
    await expect(tags.nth(0)).toHaveText(recommendation.fit);
    await expect(tags.nth(1)).toHaveText((name==='home'?'예시 ':'')+match.distance);
    const position=context.session.position||'MF';
    const available=match.positionSlots[position]||0;
    if(available>0)await expect(tags.nth(2)).toHaveText(position+' '+available+'자리');
    else if(name==='discover')await expect(tags.nth(2)).toHaveText(match.spot);
    else await expect(tags.nth(2)).toHaveText(new RegExp(position+'.*(0자리|마감)'));
    await expect(tags.nth(3)).toHaveText(level);
    for(const tag of await tags.all())await expect(tag).toBeVisible();
    await expect(card).toHaveAttribute('aria-label',match.place+' 상세 보기');
    await expect(card.locator('.fm-next-price')).toHaveText('샘플 '+new Intl.NumberFormat('ko-KR').format(match.price)+'원');
    await expect(card.locator('.fm-next-match-footer b')).toHaveCount(0);
    const gap=await tags.nth(3).evaluate(node=>node.parentElement.getBoundingClientRect().right-node.getBoundingClientRect().right);
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

