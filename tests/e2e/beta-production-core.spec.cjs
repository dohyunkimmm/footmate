const {test,expect}=require('@playwright/test');

test.skip(!process.env.PRODUCTION_SMOKE,'Production-only beta smoke');

test('closed beta production connects to Supabase without browser errors',async({page})=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(`pageerror: ${error.message}`));
  page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('Failed to load resource'))errors.push(`console.error: ${message.text()}`)});
  const response=await page.goto('/beta',{waitUntil:'domcontentloaded'});
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('FOOTMATE | Demo');
  await expect(page.locator('#footmate-beta')).toHaveAttribute('data-beta-state','ready');
  await expect(page.locator('[data-beta-backend]')).toHaveAttribute('data-beta-backend','connected');
  await expect(page.getByRole('heading',{name:'어디서 뛸까요?',exact:true})).toBeVisible();
  expect(errors).toEqual([]);
});

test('closed beta operator production route is connected but gated without a session',async({page})=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(`pageerror: ${error.message}`));
  page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('Failed to load resource'))errors.push(`console.error: ${message.text()}`)});
  const response=await page.goto('/beta/operator',{waitUntil:'domcontentloaded'});
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('FootMate | Closed Beta Operator');
  await expect(page.locator('#footmate-beta-operator')).toHaveAttribute('data-operator-state','auth-required');
  await expect(page.getByText('먼저 Closed Beta에 로그인해주세요.')).toBeVisible();
  expect(errors).toEqual([]);
});

test('public demo uses the existing Beta OAuth providers',async({page,request})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/demo',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#footmate-beta')).toHaveAttribute('data-beta-state','ready');
  await expect(page.locator('#footmate-next')).toHaveCount(0);
  const configResponse=await request.get('/api/beta-config');expect(configResponse.ok()).toBe(true);
  const config=await configResponse.json();
  const settingsResponse=await request.get(config.url+'/auth/v1/settings',{headers:{apikey:config.publishableKey}});
  expect(settingsResponse.ok()).toBe(true);
  const settings=await settingsResponse.json();
  expect(settings.external.google).toBe(true);expect(settings.external.kakao).toBe(true);
  await expect(page.getByRole('button',{name:'Google로 계속하기'})).toBeHidden();
  await expect(page.getByRole('region',{name:'추천 예시',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'다음',exact:true}).click();
  await page.getByRole('button',{name:'추천 경기 보기',exact:true}).click();
  await expect(page.locator('.fm-beta-preview-note')).toBeVisible();
  await expect(page.getByRole('button',{name:'상세 보기',exact:true})).toBeVisible();
  await page.screenshot({path:'test-results/production-design/production-design-home-390.png',fullPage:true});
  await page.getByRole('button',{name:'상세 보기',exact:true}).click();
  await expect(page.locator('.fm-beta-detail-body')).toBeVisible();
  const action=await page.getByRole('button',{name:'참가하기',exact:true}).boundingBox();
  expect(action.y+action.height).toBeLessThanOrEqual(844);
  expect(await page.evaluate(()=>document.documentElement.scrollHeight>innerHeight||document.documentElement.scrollWidth>innerWidth)).toBe(false);
  await page.screenshot({path:'test-results/production-design/production-design-detail-390.png',fullPage:true});
  await page.getByRole('button',{name:'참가하기',exact:true}).click();
  await expect(page.getByRole('button',{name:'Google로 계속하기'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Kakao로 계속하기'})).toBeVisible();
  await page.screenshot({path:'test-results/production-design/production-design-login-390.png',fullPage:true});
});


test('production demo keeps exact level and region from onboarding through quick filters',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  const response=await page.goto('/demo',{waitUntil:'domcontentloaded'});
  expect(response?.status()).toBe(200);
  await expect(page.locator('#footmate-beta')).toHaveAttribute('data-beta-state','ready');
  await page.getByRole('radio',{name:'서울 · 강남',exact:true}).check();
  await page.getByRole('button',{name:'다음',exact:true}).click();
  const level=page.getByRole('group',{name:'실력',exact:true}).getByRole('radio',{name:'중급',exact:true});
  await level.check();
  await expect(level).toBeChecked();
  await page.getByRole('button',{name:'추천 경기 보기',exact:true}).click();
  await expect(page.locator('#quick-filter-level')).toContainText('중급');
  await expect(page.locator('.fm-beta-match h3')).toHaveText('강남 중급 저녁 풋살');
  const stored=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:beta:preferences:v1')));
  await expect.poll(async()=> (await stored())?.level).toBe('중급');
  expect((await stored()).region).toBe('서울 · 강남');

  await page.locator('#quick-filter-level').click();
  await page.getByRole('group',{name:'빠른 실력',exact:true}).getByRole('radio',{name:'고급',exact:true}).click();
  await expect(page.locator('#quick-filter-level')).toContainText('고급');
  await expect(page.locator('.fm-beta-match h3')).toHaveText('강남 고급 저녁 풋살');
  await expect.poll(async()=> (await stored())?.level).toBe('중급+');
  expect((await stored()).region).toBe('서울 · 강남');
});

 
// Exhaust every public demo region and level, not just the happy-path pair.
// Separate browser pages prevent preferences from one choice masking another.
const demoRegionMatrix=[
  ['수원 · 영통','영통'],
  ['수원 · 인계','인계'],
  ['용인 · 기흥','기흥'],
  ['서울 · 강남','강남']
];
const demoLevelMatrix=[
  ['입문','입문'],
  ['초중급','초중급'],
  ['중급','중급'],
  ['중급+','고급']
];
for(const [region,area] of demoRegionMatrix){
 for(const [level,label] of demoLevelMatrix){
  test(`production demo preserves ${region} / ${label} through reload`,async({page})=>{
   await page.setViewportSize({width:390,height:844});
   await page.goto('/demo',{waitUntil:'domcontentloaded'});
   await expect(page.locator('#footmate-beta')).toHaveAttribute('data-beta-state','ready');
    await page.getByRole('group',{name:'활동 지역',exact:true}).getByRole('radio',{name:region,exact:true}).check();
   await page.getByRole('button',{name:'다음',exact:true}).click();
   const selected=page.getByRole('group',{name:'실력',exact:true}).getByRole('radio',{name:label,exact:true});
   await selected.check();
   await expect(selected).toBeChecked();
   await page.getByRole('button',{name:'추천 경기 보기',exact:true}).click();
   const verify=async()=>{
    await expect(page.locator('#quick-filter-region')).toHaveAttribute('title',region);
    await expect(page.locator('#quick-filter-level')).toHaveAttribute('title',label);
    await expect(page.locator('.fm-beta-match h3')).toBeVisible();
    await expect(page.locator('.fm-beta-card-venue .fm-beta-match-place')).toContainText(area+' 데모 풋살장');
    await expect(page.locator('.fm-beta-card-venue > span')).toHaveText(label);
    await expect.poll(()=>page.evaluate(()=>{
     const p=JSON.parse(localStorage.getItem('footmate:beta:preferences:v1')||'null');
     return p&&{region:p.region,level:p.level};
    })).toEqual({region,level});
   };
   await verify();
   await page.reload({waitUntil:'domcontentloaded'});
   await expect(page.locator('#footmate-beta')).toHaveAttribute('data-beta-state','ready');
   await verify();
  });
 }
}
