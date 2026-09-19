const {test,expect}=require('@playwright/test');

function capture(page){
  const errors=[];
  page.on('pageerror',error=>errors.push(`pageerror: ${error.message}`));
  page.on('console',message=>{
    if(message.type()==='error'&&!message.text().includes('Failed to load resource')){
      errors.push(`console.error: ${message.text()}`);
    }
  });
  return errors;
}

test('v4 exact Production app and Case Study render',async({page})=>{
  const errors=capture(page);
  await page.setViewportSize({width:390,height:844});
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await expect(page.locator('meta[name="footmate-release"]')).toHaveAttribute('content','4.0.0');
  await expect(page.getByRole('heading',{name:/내 수준에 맞는 경기부터/})).toBeVisible();
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
  expect(errors).toEqual([]);

  await page.setViewportSize({width:1440,height:900});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelectorAll('.slide').length===16&&document.querySelector('.fm-next-cover'));
  await expect(page.locator('.fm-next-cover-note')).toContainText('v4.0.0');
  await expect(page.locator('.fm-next-cover-frame iframe')).toHaveAttribute('src','/app?embed=1');
  const stylesheetHrefs=await page.locator('link[rel="stylesheet"]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('href')));
  expect(stylesheetHrefs.some(href=>href&&href.includes('/src/v4/case-study-editorial.css'))).toBe(true);
  const body=(await page.locator('body').innerText()).replace(/\s+/g,' ');
  for(const forbidden of ['Next Major','next major candidate','v3.0 stable','기존 v3.0','v2.4~v3.0']){
    expect(body).not.toContain(forbidden);
  }
  expect(errors).toEqual([]);
});

test('v4 exact Production Case Study stays mobile-safe across all 16 sections',async({page})=>{
  const errors=capture(page);
  await page.setViewportSize({width:390,height:844});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelectorAll('.slide').length===16&&document.querySelector('.fm-next-cover'));
  for(let index=0;index<16;index+=1){
    await page.evaluate(i=>window.goTo(i),index);
    await page.waitForTimeout(20);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow,`Production Case Study horizontal overflow on slide ${index+1}`).toBeLessThanOrEqual(1);
  }
  expect(errors).toEqual([]);
});

test('v4 exact Production compatibility aliases no longer expose pre-v4 product',async({page})=>{
  for(const route of ['/demo','/next']){
    await page.goto(route,{waitUntil:'domcontentloaded'});
    await expect(page.locator('meta[name="footmate-release"]')).toHaveAttribute('content','4.0.0');
    await expect(page.locator('#footmate-next')).toBeVisible();
  }
});
