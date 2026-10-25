const {test,expect}=require('@playwright/test');

test.skip(!process.env.PRODUCTION_SMOKE,'Production-only beta smoke');

test('closed beta production connects to Supabase without browser errors',async({page})=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(`pageerror: ${error.message}`));
  page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('Failed to load resource'))errors.push(`console.error: ${message.text()}`)});
  const response=await page.goto('/beta',{waitUntil:'domcontentloaded'});
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('FootMate | Demo');
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
  await expect(page.locator('[data-screen="welcome"] .fm-app-entry-name')).toHaveText('FootMate');
  await page.getByRole('button',{name:'내 조건으로 추천받기',exact:true}).click();
  await page.getByRole('button',{name:'다음',exact:true}).click();
  await page.getByRole('button',{name:'추천 경기 보기',exact:true}).click();
  await expect(page.locator('.fm-beta-preview-note')).toBeVisible();
  await page.getByRole('button',{name:'가입하고 계속하기',exact:true}).click();
  await expect(page.getByRole('button',{name:'Google로 계속하기'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Kakao로 계속하기'})).toBeVisible();
});
