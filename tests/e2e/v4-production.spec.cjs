const {test,expect}=require('@playwright/test');

function capture(page){const errors=[];page.on('pageerror',error=>errors.push(`pageerror: ${error.message}`));page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('Failed to load resource'))errors.push(`console.error: ${message.text()}`)});return errors}

test('v4.4 exact Production app, recommendation, discovery, decision, participation and Case Study render',async({page})=>{
  const errors=capture(page);
  await page.setViewportSize({width:390,height:844});
  await page.goto('/app',{waitUntil:'domcontentloaded'});await page.evaluate(()=>localStorage.clear());await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('meta[name="footmate-release"]')).toHaveAttribute('content','4.4.0');
  await expect(page.getByRole('heading',{name:/내 수준에 맞는 경기부터/})).toBeVisible();
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await page.locator('[data-action="choose-setup"][data-field="region"][data-value="서울 · 강남"]').click();await page.getByRole('button',{name:'다음'}).click();
  await page.locator('[data-action="choose-setup"][data-field="position"][data-value="GK"]').click();await page.getByRole('button',{name:'다음'}).click();
  await page.locator('[data-action="choose-setup"][data-field="level"][data-value="입문"]').click();await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await expect(page.locator('.fm-next-match-card').first()).toHaveAttribute('data-match-id','songpa-2100');
  await page.getByRole('button',{name:'전체 보기'}).click();await expect(page.locator('[data-screen="discover"]')).toHaveAttribute('data-discovery-version','4.2.0');
  await page.getByRole('button',{name:'필터 열기'}).click();await page.getByLabel('거리').selectOption('25');await page.getByLabel('포지션').selectOption('GK');await page.getByRole('button',{name:'결과 보기'}).click();
  await expect(page.getByRole('button',{name:'필터 2개 적용됨'})).toBeVisible();
  expect(new URL(page.url()).searchParams.get('d_distance')).toBe('25');expect(new URL(page.url()).searchParams.get('d_position')).toBe('GK');
  await page.locator('.fm-next-match-card').first().click();await page.waitForSelector('[data-screen="detail"][data-decision-version="4.3.0"]');
  await expect(page.getByRole('heading',{name:'참가 결정 체크'})).toBeVisible();await expect(page.getByText('실시간 정원이 아닌 현재 샘플 경기 데이터 기준입니다.')).toBeVisible();
  await page.getByRole('button',{name:'저장'}).click();await expect(page.getByRole('button',{name:'저장됨'})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'참가하기'}).click();
  await page.getByRole('textbox',{name:'아이디 또는 이메일'}).fill('member@example.com');await page.getByLabel('비밀번호',{exact:true}).fill('password123!');await page.getByRole('button',{name:'로그인'}).click();
  await expect(page.locator('[data-screen="checkout"]')).toHaveAttribute('data-participation-version','4.4.0');
  await page.getByRole('radio',{name:/신용·체크카드/}).click();await page.getByRole('button',{name:/결제하고 참가 확정/}).click();
  await expect(page.locator('[data-screen="checkout"]')).toHaveAttribute('data-participation-status','pending');
  await expect(page.locator('[data-screen="success"]')).toBeVisible();
  const stored=await page.evaluate(()=>({payment:JSON.parse(localStorage.getItem('footmate:v4:participation')),session:JSON.parse(localStorage.getItem('footmate:v4:session'))}));
  expect(stored.payment.status).toBe('success');expect(stored.session.joinedMatchId).toBe(stored.payment.matchId);
  expect(errors).toEqual([]);

  await page.setViewportSize({width:1440,height:900});await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelectorAll('.slide').length===16&&document.documentElement.dataset.footmateCaseStudyRelease==='4.4.0');
  await expect(page.locator('.fm-next-cover-note')).toContainText('v4.4.0');await expect(page.locator('.fm-next-cover-frame iframe')).toHaveAttribute('src','/app?embed=1');
  await page.evaluate(()=>window.goTo(4));await expect(page.locator('.slide.on')).toContainText('날짜·시간·거리·가격·포지션');
  await page.evaluate(()=>window.goTo(7));await expect(page.locator('.slide.on')).toContainText('저장 · 최대 2경기 비교 · 참가하기');
  await page.evaluate(()=>window.goTo(9));await expect(page.locator('.slide.on')).toContainText('checkout → pending → success | failure | canceled');
  const stylesheetHrefs=await page.locator('link[rel="stylesheet"]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('href')));expect(stylesheetHrefs.some(href=>href&&href.includes('/src/v4/case-study-editorial.css'))).toBe(true);
  const body=(await page.locator('body').innerText()).replace(/\s+/g,' ');for(const forbidden of ['Next Major','next major candidate','v3.0 stable','기존 v3.0','v2.4~v3.0'])expect(body).not.toContain(forbidden);
  expect(errors).toEqual([]);
});

test('v4.4 exact Production Case Study stays mobile-safe across all 16 sections',async({page})=>{const errors=capture(page);await page.setViewportSize({width:390,height:844});await page.goto('/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.querySelectorAll('.slide').length===16&&document.documentElement.dataset.footmateCaseStudyRelease==='4.4.0');for(let index=0;index<16;index+=1){await page.evaluate(i=>window.goTo(i),index);await page.waitForTimeout(20);const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow,`Production Case Study horizontal overflow on slide ${index+1}`).toBeLessThanOrEqual(1)}expect(errors).toEqual([])});

test('v4.4 exact Production compatibility aliases stay on the current product',async({page})=>{for(const route of ['/demo','/next']){await page.goto(route,{waitUntil:'domcontentloaded'});await expect(page.locator('meta[name="footmate-release"]')).toHaveAttribute('content','4.4.0');await expect(page.locator('#footmate-next')).toBeVisible()}});
