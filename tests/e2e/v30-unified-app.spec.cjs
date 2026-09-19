const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;

async function boot(page,{width=375,height=812,mode='product'}={}){
  const failures=[];
  page.on('pageerror',error=>failures.push(`pageerror: ${error.message}`));
  page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('Failed to load resource'))failures.push(`console.error: ${message.text()}`)});
  await page.setViewportSize({width,height});
  await page.goto(`/demo${mode==='portfolio'?'?mode=portfolio':''}`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__footmateV3===true&&!!window.FootMateV30&&window.FootMateV3Runtime?.version==='3.0.0'&&window.FootMateV2Runtime?.version==='2.8.0');
  const intro=page.locator('#demoOnboarding');
  if(await intro.isVisible())await page.locator('.demo-onboarding-start').click();
  return failures;
}
function expectNoFailures(failures){expect(failures,failures.join('\n')).toEqual([])}

test('v3.0 promotes unified runtime without replacing the v2.8 domain or product visual baseline',async({page})=>{
  const failures=await boot(page);
  const snapshot=await page.evaluate(()=>({
    currentRelease:document.documentElement.dataset.footmateCurrentRelease,
    architecture:document.documentElement.dataset.footmateArchitecture,
    visualBaseline:document.documentElement.dataset.footmateVisualBaseline,
    chrome:document.documentElement.dataset.fm30Chrome,
    v3:window.FootMateV30,
    runtime:{
      version:window.FootMateV3Runtime?.version,
      schemaVersion:window.FootMateV3Runtime?.schemaVersion,
      architecture:window.FootMateV3Runtime?.architecture,
      releaseArchitecture:window.FootMateV3Runtime?.releaseArchitecture,
      previousReleaseArchitecture:window.FootMateV3Runtime?.previousReleaseArchitecture,
      visualMode:window.FootMateV3Runtime?.appShell?.visualMode
    },
    base:{version:window.FootMateV2Runtime?.version,schemaVersion:window.FootMateV2Runtime?.schemaVersion,releaseArchitecture:window.FootMateV2Runtime?.releaseArchitecture},
    screens:document.querySelectorAll('.screen').length,
    v3Nav:document.querySelectorAll('#fm30AppNav').length,
    contexts:document.querySelectorAll('.fm30-context').length
  }));
  expect(snapshot.currentRelease).toBe('3.0');
  expect(snapshot.architecture).toBe('unified-app');
  expect(snapshot.visualBaseline).toBe('2.8');
  expect(snapshot.chrome).toBe('v2.8-product-baseline');
  expect(snapshot.runtime).toMatchObject({version:'3.0.0',schemaVersion:'2.1.0',architecture:'v3.0-modular-app-runtime',releaseArchitecture:'v3.0-unified-app-architecture',previousReleaseArchitecture:'v2.8-visual-identity',visualMode:'v2.8-product-baseline'});
  expect(snapshot.v3).toMatchObject({version:'3.0.0',previousReleaseVersion:'2.8.0',schemaVersion:'2.1.0',architecture:'v3.0-unified-app-architecture',primaryDestinationCount:4,preservedLegacyScreens:39,visualBaseline:'v2.8-matchday',stateCompatibility:'v2.1-domain-state-preserved'});
  expect(snapshot.base).toMatchObject({version:'2.8.0',schemaVersion:'2.1.0',releaseArchitecture:'v2.8-visual-identity'});
  expect(snapshot.screens).toBe(39);
  expect(snapshot.v3Nav).toBe(0);
  expect(snapshot.contexts).toBe(0);
  expectNoFailures(failures);
});

test('v3.0 route state still maps compatibility screens into four destinations in product mode',async({page})=>{
  const failures=await boot(page);
  const cases=[
    ['s-home','discover'],
    ['s-filter','discover'],
    ['s-results','recommendations'],
    ['s-detail','recommendations'],
    ['s-pay','participation'],
    ['s-notifs','participation'],
    ['s-gameday','participation'],
    ['s-profile','profile']
  ];
  for(const [screen,area] of cases){
    await page.evaluate(screenId=>window.goScreen(screenId),screen);
    await expect(page.locator(`#${screen}`)).toHaveClass(/active/);
    await expect(page.locator(`#${screen}`)).toHaveAttribute('data-fm30-area',area);
    const view=await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:v3:view')));
    expect(view.activeDestination).toBe(area);
  }
  expectNoFailures(failures);
});

test('product mode restores the exact v2.8 phone frame and legacy navigation instead of injecting v3 chrome',async({page})=>{
  const failures=await boot(page,{width:390,height:844});
  await page.evaluate(()=>window.goScreen('s-home'));
  const visual=await page.evaluate(()=>{
    const shell=document.querySelector('.device-shell');
    const device=document.querySelector('.device-screen');
    const home=document.querySelector('#s-home');
    const title=home.querySelector('.fm24-title');
    const tab=home.querySelector('.tab-bar');
    const notch=document.querySelector('.device-notch');
    const sbar=home.querySelector('.sbar');
    return{
      shellWidth:getComputedStyle(shell).width,
      shellHeight:getComputedStyle(shell).height,
      shellPadding:getComputedStyle(shell).padding,
      deviceRadius:getComputedStyle(device).borderRadius,
      notchDisplay:getComputedStyle(notch).display,
      sbarDisplay:getComputedStyle(sbar).display,
      tabDisplay:getComputedStyle(tab).display,
      tabHeight:getComputedStyle(tab).height,
      heroTitleSize:getComputedStyle(title).fontSize,
      v3Nav:document.querySelectorAll('#fm30AppNav').length,
      contexts:home.querySelectorAll('.fm30-context').length
    };
  });
  expect(visual).toMatchObject({shellWidth:'375px',shellHeight:'780px',shellPadding:'14px',notchDisplay:'block',sbarDisplay:'flex',tabDisplay:'flex',heroTitleSize:'19px',v3Nav:0,contexts:0});
  expect(parseFloat(visual.deviceRadius)).toBeGreaterThan(0);
  expect(parseFloat(visual.tabHeight)).toBeGreaterThanOrEqual(72);
  expectNoFailures(failures);
});

test('product mode remains touch-safe and accessible at 320px with the baseline shell',async({page})=>{
  const failures=await boot(page,{width:320,height:740});
  await page.evaluate(()=>window.goScreen('s-home'));
  const metrics=await page.evaluate(()=>({
    bodyOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
    activeScreenOverflow:document.querySelector('.screen.active').scrollWidth-document.querySelector('.screen.active').clientWidth,
    shellCssWidth:getComputedStyle(document.querySelector('.device-shell')).width,
    legacyTargets:[...document.querySelectorAll('#s-home .tab-item')].map(el=>el.getBoundingClientRect().height),
    phase:document.documentElement.dataset.fm30Phase,
    v3Nav:document.querySelectorAll('#fm30AppNav').length
  }));
  expect(metrics.bodyOverflow).toBeLessThanOrEqual(1);
  expect(metrics.activeScreenOverflow).toBeLessThanOrEqual(1);
  expect(metrics.shellCssWidth).toBe('375px');
  metrics.legacyTargets.forEach(height=>expect(height).toBeGreaterThanOrEqual(44));
  expect(metrics.phase).toBe('app');
  expect(metrics.v3Nav).toBe(0);
  const accessibility=await new AxeBuilder({page}).include('#s-home').withTags(['wcag2a','wcag2aa']).analyze();
  const serious=accessibility.violations.filter(item=>['serious','critical'].includes(item.impact));
  expect(serious,JSON.stringify(serious,null,2)).toEqual([]);
  expectNoFailures(failures);
});

test('portfolio mode owns the four-destination app chrome without leaking it into product mode',async({page})=>{
  const failures=await boot(page,{width:390,height:844,mode:'portfolio'});
  await page.evaluate(()=>window.goScreen('s-home'));
  const nav=page.locator('#fm30AppNav');
  await expect(nav).toBeVisible();
  await expect(nav.locator('[data-fm30-destination]')).toHaveCount(4);
  for(const [destination,screen,area] of [
    ['recommendations','s-results','recommendations'],
    ['participation','s-pay','participation'],
    ['profile','s-profile','profile'],
    ['discover','s-home','discover']
  ]){
    await nav.locator(`[data-fm30-destination="${destination}"]`).click();
    await expect(page.locator(`#${screen}`)).toHaveClass(/active/);
    await expect(page.locator(`#${screen}`)).toHaveAttribute('data-fm30-area',area);
    await expect(nav.locator(`[data-fm30-destination="${destination}"]`)).toHaveAttribute('aria-current','page');
  }
  const chrome=await page.evaluate(()=>({mode:document.documentElement.dataset.fm30Mode,chrome:document.documentElement.dataset.fm30Chrome,visualMode:window.FootMateV3Runtime.appShell.visualMode}));
  expect(chrome).toEqual({mode:'portfolio',chrome:'portfolio-shell',visualMode:'portfolio-app-shell'});
  expectNoFailures(failures);
});

test('portfolio desktop keeps the v3 left rail and bounded workspace',async({page})=>{
  const failures=await boot(page,{width:1280,height:900,mode:'portfolio'});
  await page.evaluate(()=>window.goScreen('s-results'));
  const layout=await page.evaluate(()=>{
    const shell=document.querySelector('.device-shell').getBoundingClientRect();
    const nav=document.querySelector('#fm30AppNav').getBoundingClientRect();
    const screen=document.querySelector('.device-screen').getBoundingClientRect();
    return{shellWidth:shell.width,navWidth:nav.width,navLeft:nav.left,screenLeft:screen.left,screenWidth:screen.width};
  });
  expect(layout.shellWidth).toBeGreaterThanOrEqual(520);
  expect(layout.shellWidth).toBeLessThanOrEqual(580);
  expect(layout.navWidth).toBeGreaterThanOrEqual(90);
  expect(layout.screenLeft).toBeGreaterThan(layout.navLeft);
  expect(layout.screenWidth).toBeGreaterThanOrEqual(400);
  expect(layout.screenWidth).toBeLessThanOrEqual(470);
  await expect(page.locator('#s-results .fm30-context')).toBeVisible();
  expectNoFailures(failures);
});
