const {test,expect}=require('@playwright/test');

test.skip(!process.env.PRODUCTION_SMOKE,'Production-only v5.2 beta smoke');

test('real beta readiness controls load on production',async({page})=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(`pageerror: ${error.message}`));
  page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('Failed to load resource'))errors.push(`console.error: ${message.text()}`)});
  const response=await page.goto('/beta',{waitUntil:'domcontentloaded'});
  expect(response?.status()).toBe(200);
  await expect(page.locator('#footmate-beta')).toHaveAttribute('data-beta-state','ready');
  await expect(page.getByRole('button',{name:'비밀번호 찾기'})).toBeVisible();
  await expect(page.getByRole('button',{name:'가입 인증메일 다시 보내기'})).toBeVisible();
  expect(errors).toEqual([]);
});

test('operator readiness extension preserves production auth gate',async({page})=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(`pageerror: ${error.message}`));
  page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('Failed to load resource'))errors.push(`console.error: ${message.text()}`)});
  const response=await page.goto('/beta/operator',{waitUntil:'domcontentloaded'});
  expect(response?.status()).toBe(200);
  await expect(page.locator('#footmate-beta-operator')).toHaveAttribute('data-operator-state','auth-required');
  await expect(page.getByText('먼저 Closed Beta에 로그인해주세요.')).toBeVisible();
  expect(errors).toEqual([]);
});
