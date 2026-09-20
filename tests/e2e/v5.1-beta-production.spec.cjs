const {test,expect}=require('@playwright/test');

test.skip(!process.env.PRODUCTION_SMOKE,'Production-only beta smoke');

test('closed beta production connects to Supabase without browser errors',async({page})=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(`pageerror: ${error.message}`));
  page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('Failed to load resource'))errors.push(`console.error: ${message.text()}`)});
  const response=await page.goto('/beta',{waitUntil:'domcontentloaded'});
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('FootMate | Closed Beta');
  await expect(page.locator('#footmate-beta')).toHaveAttribute('data-beta-state','ready');
  await expect(page.getByText('Supabase Connected')).toBeVisible();
  await expect(page.getByText(/실제 경기/)).toBeVisible();
  expect(errors).toEqual([]);
});
