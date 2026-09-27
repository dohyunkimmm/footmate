const {expect}=require('@playwright/test');

async function start(page){
  await page.setViewportSize({width:390,height:844});
  await page.goto('/demo',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{localStorage.clear();sessionStorage.clear();});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await page.getByRole('button',{name:'다음',exact:true}).click();
  await page.getByRole('button',{name:'다음',exact:true}).click();
  await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
}

async function aiFilters(page,capture=async()=>{}){
  // Only provider interpretation is controlled; ranking, filters and rendering are real.
  await page.route('**/api/ai-match-assistant',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({mode:'connected-ai',result:{intent:'search',position:route.request().postDataJSON().message.includes('GK')?'GK':null,reply:'조건을 확인했어요.'}})}));
  await start(page);
  const search=async message=>{
    await page.locator('[data-screen="home"] [data-ai-input]').fill(message);
    await page.locator('[data-screen="home"] [data-ai-submit]').click();
    await expect(page.locator('[data-screen="discover"]')).toBeVisible();
  };
  const cards=page.locator('[data-screen="discover"] .fm-next-match-card:visible');
  await search('모든 경기');
  await expect(cards).toHaveCount(8);
  await page.locator('[data-discovery-action="open-filters"]').click();
  await page.getByLabel('가격').selectOption('11000');
  await page.getByLabel('포지션').selectOption('GK');
  await page.getByRole('button',{name:'결과 보기',exact:true}).click();
  await expect(cards).toHaveCount(2);
  expect((await cards.evaluateAll(nodes=>nodes.map(n=>n.dataset.matchId))).sort()).toEqual(['giheung-2000','maetan-2030']);
  for(const card of await cards.all())await expect(card.locator('.fm-next-match-tags > .fm-next-tag').nth(2)).toHaveText('GK 1자리');
  await capture('ai-filter',page.locator('[data-screen="discover"]'));
  await page.locator('[data-discovery-action="open-filters"]').click();
  await page.getByRole('dialog',{name:'경기 조건 좁히기'}).getByRole('button',{name:'필터 전체 해제',exact:true}).click();
  await page.getByRole('button',{name:'결과 보기',exact:true}).click();
  await expect(cards).toHaveCount(8);
  expect(await page.evaluate(()=>window.__FOOTMATE_REAL_APP_IA__.aiScope)).toBe(true);
  await page.locator('[data-screen="discover"] [data-action="nav-home"]').click();
  await search('GK 자리 경기');
  await expect(cards).toHaveCount(5);
  for(const card of await cards.all())await expect(card.locator('.fm-next-match-tags > .fm-next-tag').nth(2)).toHaveText('GK 1자리');
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:v4:session')).position)).toBe('MF');
  await page.locator('[data-discovery-action="open-filters"]').click();
  await page.getByLabel('가격').selectOption('11000');
  await page.getByRole('button',{name:'결과 보기',exact:true}).click();
  await expect(cards).toHaveCount(2);
  await page.getByRole('button',{name:'AI 조건 해제',exact:true}).click();
  await expect(cards).toHaveCount(3);
  expect(new URL(page.url()).searchParams.get('d_price')).toBe('11000');
  await page.getByRole('button',{name:'AI 조건 다시 적용',exact:true}).click();
  await expect(cards).toHaveCount(2);
  await page.locator('[data-discovery-action="open-filters"]').click();
  await page.getByLabel('포지션').selectOption('MF');
  await page.getByRole('button',{name:'결과 보기',exact:true}).click();
  await expect(cards).toHaveCount(1);
  await expect(cards.first().locator('.fm-next-match-tags > .fm-next-tag').nth(2)).toHaveText('MF 1자리 · GK 1자리');
  await page.locator('[data-discovery-action="open-filters"]').click();
  await page.getByLabel('거리').selectOption('15');
  await page.getByRole('button',{name:'결과 보기',exact:true}).click();
  await expect(cards).toHaveCount(0);
  await expect(page.locator('[data-ia-ai-empty]')).toBeVisible();
  await page.locator('[data-discovery-action="open-filters"]').click();
  await page.getByRole('dialog',{name:'경기 조건 좁히기'}).getByRole('button',{name:'필터 전체 해제',exact:true}).click();
  await page.getByRole('button',{name:'결과 보기',exact:true}).click();
  await expect(cards).toHaveCount(5);
  expect(await page.evaluate(()=>window.__FOOTMATE_REAL_APP_IA__.aiScope)).toBe(true);
}

async function profileSettings(page,capture=async()=>{}){
  await start(page);
  await page.locator('[data-screen="home"] [data-action="nav-profile"]').click();
  const panel=page.locator('.fm-personalization-panel--profile');
  await panel.getByRole('button',{name:'현재 설정 저장',exact:true}).click();
  await panel.getByRole('button',{name:'기본 설정 수정',exact:true}).click();
  await page.locator('[data-field="region"][data-value="서울 · 강남"]').click();
  await page.getByRole('button',{name:'다음',exact:true}).click();
  await page.locator('[data-field="position"][data-value="GK"]').click();
  await page.getByRole('button',{name:'다음',exact:true}).click();
  await page.getByRole('button',{name:'설정 적용',exact:true}).click();
  await expect(page.locator('[data-screen="profile"]')).toBeVisible();
  await expect(panel.locator('.fm-personalization-head span')).toHaveText('수원 · 영통 · MF · 중급');
  await expect(panel.locator('[data-profile-current]')).toContainText('서울 · 강남 · GK · 중급');
  await capture('profile-current',panel);
  const memory=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:v4:personalization')));
  await panel.getByRole('button',{name:'선호 조건 수정',exact:true}).click();
  await panel.getByRole('button',{name:'21시 이후',exact:true}).click();
  await panel.getByRole('button',{name:'취소',exact:true}).click();
  expect((await memory()).favorites.timeWindows).not.toContain('21+');
  await panel.getByRole('button',{name:'선호 조건 수정',exact:true}).click();
  await panel.getByRole('button',{name:'21시 이후',exact:true}).click();
  await panel.getByRole('button',{name:'선호 조건 저장',exact:true}).click();
  expect((await memory()).profile.position).toBe('MF');
  await panel.getByRole('button',{name:'현재 설정으로 저장값 갱신',exact:true}).click();
  expect((await memory()).profile).toMatchObject({region:'서울 · 강남',position:'GK'});
  expect((await memory()).favorites.timeWindows).toContain('21+');
  await expect(panel.locator('[data-profile-current]')).toHaveCount(0);
  for(const width of [320,390]){
    await page.setViewportSize({width,height:844});
    const boundary=panel.locator('.fm-personalization-boundary');
    await expect(boundary).toHaveCSS('white-space','normal');
    expect(await boundary.evaluate(n=>parseFloat(getComputedStyle(n).fontSize))).toBeGreaterThanOrEqual(12);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  }
  await panel.getByRole('button',{name:'기본 설정 수정',exact:true}).click();
  await page.locator('[data-field="region"][data-value="수원 · 영통"]').click();
  await page.locator('[data-action="back-welcome"]').click();
  await expect(page.locator('[data-screen="profile"]')).toBeVisible();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:v4:session')).region)).toBe('서울 · 강남');
  await page.locator('[data-screen="profile"] .fm-next-nav [data-action="nav-discover"]').click();
  await page.getByRole('button',{name:'기본 추천 조건 수정',exact:true}).click();
  await page.locator('[data-action="back-welcome"]').click();
  await expect(page.locator('[data-screen="discover"]')).toBeVisible();
  await expect(page.getByRole('button',{name:'필터 열기',exact:true})).toBeVisible();
}
module.exports={aiFilters,profileSettings};
