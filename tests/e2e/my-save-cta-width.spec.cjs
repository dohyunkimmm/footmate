const {test,expect}=require('@playwright/test');

async function seedFreshMy(page,width){
  await page.setViewportSize({width,height:844});
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{
    localStorage.clear();
    localStorage.setItem('footmate:v4:session',JSON.stringify({
      route:'profile',setupComplete:true,region:'수원 · 영통',position:'MF',level:'중급',
      signedIn:true,joinedMatchId:null,selectedMatchId:'gwanggyo-2130',matchStage:'discover',userName:'테스터'
    }));
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('[data-screen="profile"]')).toBeVisible();
}

test('Real App MY current-settings save CTA keeps the approved full width',async({page})=>{
  for(const width of [390,1440]){
    await seedFreshMy(page,width);
    const panel=page.locator('.fm-personalization-panel--profile');
    const head=panel.locator('.fm-personalization-head');
    const button=panel.getByRole('button',{name:'현재 설정 저장',exact:true});
    await expect(button).toBeVisible();
    const geometry=await Promise.all([
      head.evaluate(element=>element.getBoundingClientRect().width),
      button.evaluate(element=>element.getBoundingClientRect().width)
    ]);
    expect(Math.abs(geometry[0]-geometry[1])).toBeLessThanOrEqual(1);
    expect(await button.evaluate(element=>element.style.width)).toBe('100%');
  }
});
