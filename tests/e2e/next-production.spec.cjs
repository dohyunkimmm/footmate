const {test,expect}=require('@playwright/test');

function captureFailures(page){const failures=[];page.on('pageerror',error=>failures.push(`pageerror: ${error.message}`));page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('Failed to load resource'))failures.push(`console.error: ${message.text()}`)});return failures}
function expectNoFailures(failures){expect(failures,failures.join('\n')).toEqual([])}

test('next-major exact Production guest-to-join path renders',async({page})=>{
  const failures=captureFailures(page);
  await page.setViewportSize({width:390,height:844});
  await page.goto('/next',{waitUntil:'domcontentloaded'});
  await expect(page.locator('meta[name="footmate-next-release"]')).toHaveAttribute('content','matchday-companion-candidate');
  await expect(page.getByRole('heading',{name:/내 수준에 맞는 경기부터/})).toBeVisible();
  await expect(page.getByText('둘러보는 데 계정이 필요하지 않아요.')).toBeVisible();
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
  await page.locator('.fm-next-match-card').first().click();
  await page.getByRole('button',{name:'참가하기'}).click();
  await expect(page.locator('[data-screen="auth"]')).toBeVisible();
  await expect(page.getByRole('button',{name:'카카오로 계속하기'})).toBeVisible();
  expectNoFailures(failures);
});

test('next-major exact Production case study cover embeds the new app',async({page})=>{
  const failures=captureFailures(page);
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelectorAll('.slide').length===16&&document.querySelector('.fm-next-cover'));
  await expect(page.locator('.fm-next-cover')).toContainText('내 수준에 맞는 경기부터');
  await expect(page.locator('.fm-next-cover-frame iframe')).toHaveAttribute('src','/next?embed=1');
  expectNoFailures(failures);
});
