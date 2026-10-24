// Archived prototype coverage; released Beta entry is covered by beta-core and production entry tests.
const {test,expect}=require('@playwright/test');

for(const width of [320,390,430,1440]){
  test(`Restored Welcome keeps the FootMate app identity and start actions usable at ${width}px`,async({page})=>{
    await page.setViewportSize({width,height:width===1440?900:844});
    await page.goto('/prototype',{waitUntil:'domcontentloaded'});
    await page.evaluate(()=>localStorage.clear());
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1');
    await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
    const screen=page.locator('[data-screen="welcome"]');
    await expect(screen.locator('.fm-app-entry-name')).toHaveText('FootMate');
    await expect(screen.locator('.fm-app-entry-name')).toHaveCSS('font-size','32px');
    await expect(screen.locator('.fm-app-entry-logo')).toHaveJSProperty('naturalWidth',120);
    await expect(screen.locator('.fm-next-intro-copy')).toHaveCSS('transform','none');
    await expect(screen.locator('[data-welcome-ai-copy]')).toHaveCount(0);
    const geometry=await screen.evaluate(node=>{
      const box=node.getBoundingClientRect();
      const brand=node.querySelector('.fm-next-brand').getBoundingClientRect();
      const title=node.querySelector('h1').getBoundingClientRect();
      const actions=node.querySelector('.fm-next-actions').getBoundingClientRect();
      return {screenTop:box.top,screenBottom:box.bottom,brandTop:brand.top,brandBottom:brand.bottom,titleTop:title.top,titleBottom:title.bottom,actionsTop:actions.top,actionsBottom:actions.bottom,overflow:document.documentElement.scrollWidth>innerWidth};
    });
    expect(geometry.brandTop).toBeGreaterThanOrEqual(geometry.screenTop+8);
    expect(geometry.brandBottom).toBeLessThan(geometry.titleTop);
    expect(geometry.titleBottom).toBeLessThanOrEqual(geometry.actionsTop);
    expect(geometry.actionsBottom).toBeLessThanOrEqual(geometry.screenBottom);
    expect(geometry.overflow).toBe(false);
    await expect(screen.getByRole('button',{name:/내 경기 찾아보기/})).toBeVisible();
    await expect(screen.getByRole('button',{name:'경기 먼저 둘러보기'})).toBeVisible();
  });
}
