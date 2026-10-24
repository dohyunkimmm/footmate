const {test,expect}=require('@playwright/test');

async function chooseSetupDefaultIfNeeded(page){
  const setup=page.locator('[data-screen="setup"]');
  if(!await setup.isVisible().catch(()=>false))return;
  if(await setup.locator('[data-action="choose-setup"][aria-pressed="true"]').count())return;
  const field=await setup.locator('[data-action="choose-setup"]').first().getAttribute('data-field');
  const value={region:'수원 · 영통',position:'MF',level:'중급'}[field];
  if(value)await setup.locator(`[data-action="choose-setup"][data-value="${value}"]`).click();
}
const AxeBuilder=require('@axe-core/playwright').default;
test('AI entry leads compact Home and failed examples disclose the rules source',async({page},testInfo)=>{
  await page.setViewportSize({width:390,height:1000});
  await page.route('**/api/ai-match-assistant',route=>route.fulfill({status:503,contentType:'application/json',body:'{}'}));
  await setup(page);
  const home=page.locator('[data-screen="home"]');
  await expect(home.getByRole('heading',{name:'내 조건에 맞는 매칭'})).toBeVisible();
  await expect(home.locator('[data-match-assessment]')).toHaveCount(0);
  expect(await home.evaluate(n=>Boolean(n.querySelector('.fm-ai-card').compareDocumentPosition(n.querySelector('.fm-next-list'))&Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  await home.screenshot({path:testInfo.outputPath('matching-home.png'),animations:'disabled'});
  await home.locator('[data-ai-example]').first().click();
  await expect(page.locator('[data-screen="discover"]')).toBeVisible();
  await expect(page.locator('[data-ia-ai-summary]')).toContainText('기본 검색으로 해석한 조건');
  await expect(page.locator('[data-screen="discover"] [data-match-assessment]').first()).toContainText('맞는 점');
  await page.screenshot({path:testInfo.outputPath('matching-rules-fallback.png'),fullPage:true,animations:'disabled'});
});

test('zero-match recovery lets the user relax price while preserving time and position',async({page},testInfo)=>{
  await page.setViewportSize({width:390,height:1000});
  await page.route('**/api/ai-match-assistant',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({mode:'connected-ai',result:{intent:'search',region:null,position:'GK',level:'중급',maxPrice:5000,maxDistanceMin:null,afterTime:'23:59',reply:'조건 확인'}})}));
  await setup(page);
  await page.getByLabel('찾고 싶은 경기 조건').fill('23시 59분 이후 5000원 이하 GK');
  await page.getByRole('button',{name:'AI로 찾기'}).click();
  await expect(page.locator('[data-screen="discover"]')).toBeVisible();
  await expect(page.getByRole('button',{name:'가격 조건 완화'})).toBeVisible();
  await page.screenshot({path:testInfo.outputPath('matching-zero-before.png'),fullPage:true,animations:'disabled'});
  await page.getByRole('button',{name:'가격 조건 완화'}).click();
  const result=await page.evaluate(()=>window.__FOOTMATE_REAL_APP_IA__.assistant.result);
  expect(result.maxPrice).toBeNull();expect(result.afterTime).toBe('23:59');expect(result.position).toBe('GK');
  await expect(page.locator('[data-ia-ai-empty]')).toBeVisible();
  await page.screenshot({path:testInfo.outputPath('matching-zero-after.png'),fullPage:true,animations:'disabled'});
});
async function setup(page){await page.goto('/demo',{waitUntil:'domcontentloaded'});await page.evaluate(()=>{localStorage.clear();sessionStorage.clear()});await page.reload({waitUntil:'domcontentloaded'});await page.getByRole('button',{name:/내 경기 찾아보기/}).click();await chooseSetupDefaultIfNeeded(page);await page.getByRole('button',{name:'다음'}).click();await chooseSetupDefaultIfNeeded(page);await page.getByRole('button',{name:'다음'}).click();await chooseSetupDefaultIfNeeded(page);await page.getByRole('button',{name:/추천 경기 보기/}).click();await expect(page.locator('[data-screen="home"]')).toBeVisible();await expect(page.locator('[data-ai-assistant="5.1.1"]')).toBeVisible()}

test('v5.1.1 AI Match Assistant falls back to rules when local API is unavailable',async({page})=>{await setup(page);await page.getByLabel('찾고 싶은 경기 조건').fill('20분 안쪽에서 GK 자리 있는 경기');await page.getByRole('button',{name:'AI로 찾기'}).click();await expect(page.locator('[data-ai-mode]')).toHaveText('Rules fallback');await expect(page.locator('[data-screen="home"]')).toBeVisible();await expect(page.locator('[data-ai-conditions]')).toContainText('GK');await expect(page.locator('[data-ai-conditions]')).toContainText('20분 이내');await expect(page.locator('.fm-ai-result').first()).toBeHidden();await expect(page.locator('.fm-product-ai-retry')).toBeVisible();const runtime=await page.evaluate(()=>({version:window.__FOOTMATE_AI__?.version,mode:window.__FOOTMATE_AI__?.mode,rankingOwner:window.__FOOTMATE_AI__?.rankingOwner,timeout:window.__FOOTMATE_AI__?.requestTimeoutMs,hitl:window.__FOOTMATE_AI__?.hitl}));expect(runtime).toEqual({version:'5.1.1',mode:'rules-fallback',rankingOwner:'deterministic recommendation engine',timeout:7000,hitl:['join','payment']})});

test('v5.1.1 AI state hierarchy distinguishes loading and fallback without duplicating results on Home',async({page})=>{await page.route('**/api/ai-match-assistant',async route=>{await new Promise(resolve=>setTimeout(resolve,450));await route.fulfill({status:503,contentType:'application/json',body:'{}'})});await setup(page);const input=page.getByLabel('찾고 싶은 경기 조건'),button=page.getByRole('button',{name:'AI로 찾기'});await input.fill('21시 이후 11000원 이하 GK 경기');await button.click();const loading=page.locator('.fm-ai-loading');await expect(loading).toBeVisible();await expect(page.locator('[data-ai-status] b')).toHaveText('조건을 확인하고 있어요.');await expect(page.locator('[data-ai-mode]')).toHaveText('Rules fallback');await expect(page.locator('[data-screen="home"]')).toBeVisible();await expect(page.locator('.fm-ai-empty')).toBeHidden();await expect(page.locator('.fm-product-ai-retry')).toBeVisible();await expect(input).toBeEnabled();await expect(button).toBeEnabled()});

test('v5.1.1 connected AI response only supplies constraints while deterministic engine owns results',async({page},testInfo)=>{await page.setViewportSize({width:390,height:1000});await page.route('**/api/ai-match-assistant',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({version:'5.1.1',mode:'connected-ai',provider:'vercel-ai-gateway',model:'openai/gpt-5.4-mini',fallbackUsed:false,result:{intent:'search',region:'수원 · 인계',position:null,level:'초중급',maxPrice:12000,maxDistanceMin:null,afterTime:null,reply:'수원 인계의 초중급, 12,000원 이하 조건으로 정리했어요.'}})}));await setup(page);await page.getByLabel('찾고 싶은 경기 조건').fill('인계에서 초중급 12000원 이하 경기');await page.getByRole('button',{name:'AI로 찾기'}).click();await expect(page.locator('[data-screen="discover"]')).toBeVisible();await expect(page.locator('[data-ai-mode]')).toHaveText('AI connected');await expect(page.locator('[data-ia-ai-summary]')).toContainText('수원 · 인계');await expect(page.locator('[data-ia-ai-summary]')).toContainText('초급');await expect(page.locator('[data-ia-ai-summary]')).toContainText('12,000원 이하');await expect(page.locator('[data-screen="discover"] .fm-next-match-card:visible').first()).toBeVisible();expect(await page.evaluate(()=>window.__FOOTMATE_AI__.mode)).toBe('connected-ai');await page.screenshot({path:testInfo.outputPath('matching-ai-results.png'),fullPage:true,animations:'disabled'})});

test('v5.1.1 saved connected result normalizes legacy values and keeps one stable result render',async({page})=>{await page.setViewportSize({width:390,height:844});await setup(page);await page.evaluate(()=>{localStorage.setItem('footmate:v5.1:ai',JSON.stringify({version:'5.1.1',message:'수원 인계에서 초급 경기 찾아줘',mode:'connected-ai',result:{intent:'search',region:'수원 · 인계',position:null,level:'초급',maxPrice:null,maxDistanceMin:null,afterTime:null,reply:'수원 인계에서 초급 경기를 찾습니다.'},updatedAt:new Date().toISOString()}))});await page.goto('/demo?resume=1',{waitUntil:'domcontentloaded'});const home=page.locator('[data-screen="home"]'),card=home.locator('.fm-ai-card'),status=card.locator('[data-ai-status] b');await expect(home).toBeVisible();await expect(card.locator('[data-ai-mode]')).toHaveText('AI connected');await expect(status).toHaveText('수원 · 인계 조건을 반영했어요.');await page.waitForTimeout(200);await expect(status).toHaveText('수원 · 인계 조건을 반영했어요.');await expect(card.locator('[data-ai-conditions]')).not.toContainText('초급');const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:v5.1:ai')));expect(saved.result.level).toBeNull();await expect(card).toHaveScreenshot('ai-connected-stable-390.png',{animations:'disabled',caret:'hide',maxDiffPixels:0})});

test('v5.1.1 AI request timeout recovers to deterministic rules and restores controls',async({page})=>{await page.route('**/api/ai-match-assistant',async route=>{await new Promise(resolve=>setTimeout(resolve,7600));try{await route.fulfill({status:200,contentType:'application/json',body:'{}'})}catch{}});await setup(page);const input=page.getByLabel('찾고 싶은 경기 조건'),button=page.getByRole('button',{name:'AI로 찾기'});await input.fill('수원 인계에서 가까운 중급 경기');await button.click();await expect(page.locator('[data-ai-mode]')).toHaveText('Rules fallback',{timeout:10000});await expect(input).toBeEnabled();await expect(button).toBeEnabled();expect(await page.evaluate(()=>window.__FOOTMATE_AI__.mode)).toBe('rules-fallback')});

test('v5.1.1 internal resume restores saved AI mode consistently while fresh entry still resets',async({page})=>{await page.route('**/api/ai-match-assistant',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({version:'5.1.1',mode:'connected-ai',provider:'vercel-ai-gateway',model:'openai/gpt-5.4-mini',fallbackUsed:false,result:{intent:'search',region:'수원 · 인계',position:'MF',level:'중급',maxPrice:null,maxDistanceMin:20,afterTime:null,reply:'수원 인계의 가까운 중급 MF 조건으로 정리했어요.'}})}));await setup(page);await page.getByLabel('찾고 싶은 경기 조건').fill('수원 인계에서 가까운 중급 MF 경기');await page.getByRole('button',{name:'AI로 찾기'}).click();await expect(page.locator('[data-screen="discover"]')).toBeVisible();await expect(page.locator('[data-ai-mode]')).toHaveText('AI connected');await page.goto('/demo?resume=1',{waitUntil:'domcontentloaded'});await expect(page.locator('[data-ai-assistant="5.1.1"]')).toHaveCount(1);await expect(page.locator('[data-ai-mode]')).toHaveText('AI connected');expect(await page.evaluate(()=>window.__FOOTMATE_AI__.mode)).toBe('connected-ai')});

test('v5.1.1 AI assistant remains accessible and responsive',async({page})=>{for(const width of [320,375,390,430]){await page.setViewportSize({width,height:780});await setup(page);expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1);await page.evaluate(()=>{localStorage.clear();sessionStorage.clear()})}const axe=await new AxeBuilder({page}).include('[data-ai-assistant]').withTags(['wcag2a','wcag2aa']).analyze();expect(axe.violations.filter(v=>['serious','critical'].includes(v.impact))).toEqual([])});

test('fallback separates clock minutes from travel minutes and maps beginner consistently',async({page})=>{
  await page.route('**/api/ai-match-assistant',route=>route.fulfill({status:503,contentType:'application/json',body:'{}'}));
  await setup(page);
  await page.getByLabel('찾고 싶은 경기 조건').fill('오후 8시 30분 이후 15분 이내 초급 MF 경기');
  await page.getByRole('button',{name:'AI로 찾기'}).click();
  await expect(page.locator('[data-ai-mode]')).toHaveText('Rules fallback');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:v5.1:ai')));
  expect(saved.result).toMatchObject({afterTime:'20:30',maxDistanceMin:15,level:'초중급',position:'MF'});
});

test('search preferences survive detail and reload without replacing the base profile',async({page})=>{
  await page.route('**/api/ai-match-assistant',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({mode:'connected-ai',result:{intent:'search',region:'수원 · 인계',position:'GK',level:'초중급',maxPrice:null,maxDistanceMin:null,afterTime:null,reply:'인계 초급 GK'}})}));
  await setup(page);
  await page.getByLabel('찾고 싶은 경기 조건').fill('인계 초급 GK 경기');
  await page.getByRole('button',{name:'AI로 찾기'}).click();
  await expect(page.locator('[data-screen="discover"]')).toBeVisible();
  await expect(page.locator('[data-ia-ai-summary]')).toContainText('현재 적용 조건');
  await page.locator('[data-screen="discover"] .fm-next-match-card[data-match-id="maetan-2030"]').click();
  for(const reload of [false,true]){
    if(reload)await page.goto('/demo?resume=1',{waitUntil:'domcontentloaded'});
    await expect(page.locator('[data-screen="detail"]')).toBeVisible();
    await expect(page.locator('[data-join-position] button[aria-pressed="true"]')).toContainText('GK');
    await expect(page.locator('.fm-join-position-note[role="status"]')).not.toContainText('마감');
    await expect(page.locator('[data-decision-section="fit"]')).toContainText('GK 1자리 남음');
    await expect(page.locator('[data-decision-section="fit"]')).not.toContainText('MF 자리는 현재 마감');
    const session=await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:session')));
    expect(session).toMatchObject({region:'수원 · 영통',position:'MF',level:'중급',selectedJoinPosition:'GK'});
  }
});

test('320px matching heading keeps its action on one line and facts readable',async({page},testInfo)=>{
  await page.setViewportSize({width:320,height:900});
  await setup(page);
  const home=page.locator('[data-screen="home"]');
  const action=home.locator('.fm-next-section-head button').first();
  expect(await action.evaluate(el=>{const range=document.createRange();range.selectNodeContents(el);return range.getClientRects().length})).toBe(1);
  await expect(home.locator('[data-match-assessment]')).toHaveCount(0);
  await home.screenshot({path:testInfo.outputPath('matching-home-320.png'),animations:'disabled'});
});

test('1920px keeps the compact app and AI entry before its single-column matches',async({page},testInfo)=>{
  await page.setViewportSize({width:1920,height:1080});await setup(page);
  const app=page.locator('.fm-next-app');
  expect(await app.evaluate(el=>el.getBoundingClientRect().width)).toBeLessThanOrEqual(560);
  const cards=page.locator('[data-screen="home"] .fm-next-match-card');
  const boxes=await cards.evaluateAll(nodes=>nodes.slice(0,2).map(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width}}));
  expect(Math.abs(boxes[0].x-boxes[1].x)).toBeLessThan(2);expect(boxes[1].y).toBeGreaterThanOrEqual(boxes[0].y+boxes[0].height);
  await page.screenshot({path:testInfo.outputPath('pc-matching-home-1920.png'),animations:'disabled'});
  await cards.first().click();await expect(page.locator('[data-decision-section="fit"]')).toBeVisible();
  const layout=await page.locator('[data-screen="detail"]').evaluate(el=>({hero:el.querySelector('.fm-next-detail-hero').getBoundingClientRect().bottom,fit:el.querySelector('[data-decision-section="fit"]').getBoundingClientRect().top,overflow:document.documentElement.scrollWidth-innerWidth}));
  expect(layout.fit).toBeGreaterThanOrEqual(layout.hero);expect(layout.overflow).toBeLessThanOrEqual(1);
  await page.screenshot({path:testInfo.outputPath('pc-matching-detail-1920.png'),animations:'disabled'});
});
