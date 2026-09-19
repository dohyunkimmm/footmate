const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;

async function boot(page,{width=375,height=812,mode='product'}={}){
  const failures=[];
  page.on('pageerror',error=>failures.push(`pageerror: ${error.message}`));
  page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('Failed to load resource'))failures.push(`console.error: ${message.text()}`)});
  await page.setViewportSize({width,height});
  await page.goto(`/demo${mode==='portfolio'?'?mode=portfolio':''}`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__footmateV3===true&&!!window.FootMateV30&&window.FootMateV3Runtime?.version==='3.0.0'&&window.FootMateV2Runtime?.version==='2.8.0');
  if(mode==='portfolio'){
    const intro=page.locator('#demoOnboarding');
    if(await intro.isVisible())await page.locator('.demo-onboarding-start').click();
  }
  return failures;
}
function expectNoFailures(failures){expect(failures,failures.join('\n')).toEqual([])}

test('v3.0 promotes unified app runtime without replacing the v2.8 domain runtime',async({page})=>{
  const failures=await boot(page);
  const snapshot=await page.evaluate(()=>({
    currentRelease:document.documentElement.dataset.footmateCurrentRelease,
    architecture:document.documentElement.dataset.footmateArchitecture,
    visualBaseline:document.documentElement.dataset.footmateVisualBaseline,
    v3:window.FootMateV30,
    runtime:{
      version:window.FootMateV3Runtime?.version,
      schemaVersion:window.FootMateV3Runtime?.schemaVersion,
      architecture:window.FootMateV3Runtime?.architecture,
      releaseArchitecture:window.FootMateV3Runtime?.releaseArchitecture,
      previousReleaseArchitecture:window.FootMateV3Runtime?.previousReleaseArchitecture,
      shellOwnership:window.FootMateV3Runtime?.shellOwnership,
      componentOwnership:window.FootMateV3Runtime?.componentOwnership
    },
    base:{version:window.FootMateV2Runtime?.version,schemaVersion:window.FootMateV2Runtime?.schemaVersion,releaseArchitecture:window.FootMateV2Runtime?.releaseArchitecture},
    screens:document.querySelectorAll('.screen').length
  }));
  expect(snapshot.currentRelease).toBe('3.0');
  expect(snapshot.architecture).toBe('unified-app');
  expect(snapshot.visualBaseline).toBe('2.8');
  expect(snapshot.runtime).toMatchObject({version:'3.0.0',schemaVersion:'2.1.0',architecture:'v3.0-modular-app-runtime',releaseArchitecture:'v3.0-unified-app-architecture',previousReleaseArchitecture:'v2.8-visual-identity',shellOwnership:'src/v3/styles/app-shell.css',componentOwnership:'src/v3/components'});
  expect(snapshot.v3).toMatchObject({version:'3.0.0',previousReleaseVersion:'2.8.0',schemaVersion:'2.1.0',architecture:'v3.0-unified-app-architecture',primaryDestinationCount:4,preservedLegacyScreens:39,visualBaseline:'v2.8-matchday',stateCompatibility:'v2.1-domain-state-preserved'});
  expect(snapshot.base).toMatchObject({version:'2.8.0',schemaVersion:'2.1.0',releaseArchitecture:'v2.8-visual-identity'});
  expect(snapshot.screens).toBe(39);
  expectNoFailures(failures);
});

test('v3.0 primary navigation maps the 39 compatibility routes into four destinations',async({page})=>{
  const failures=await boot(page);
  await page.evaluate(()=>window.goScreen('s-home'));
  const nav=page.locator('#fm30AppNav');
  await expect(nav).toBeVisible();
  await expect(nav.locator('[data-fm30-destination]')).toHaveCount(4);

  const cases=[
    ['recommendations','s-results','recommendations'],
    ['participation','s-pay','participation'],
    ['profile','s-profile','profile'],
    ['discover','s-home','discover']
  ];
  for(const [destination,screen,area] of cases){
    await nav.locator(`[data-fm30-destination="${destination}"]`).click();
    await expect(page.locator(`#${screen}`)).toHaveClass(/active/);
    await expect(page.locator(`#${screen}`)).toHaveAttribute('data-fm30-area',area);
    await expect(nav.locator(`[data-fm30-destination="${destination}"]`)).toHaveAttribute('aria-current','page');
  }
  const view=await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:v3:view')));
  expect(view).toMatchObject({version:'3.0.0',activeDestination:'discover'});
  expectNoFailures(failures);
});

test('v3.0 preserves the v2.8 matchday visual baseline on product screens',async({page})=>{
  const failures=await boot(page,{width:390,height:844});
  await page.evaluate(()=>window.goScreen('s-home'));
  const visual=await page.locator('#s-home .fm24-home-decision').evaluate(element=>{
    const title=element.querySelector('.fm24-title');
    const context=document.querySelector('#s-home .fm30-context');
    return{
      release:document.documentElement.dataset.footmateRelease,
      bodyBackground:getComputedStyle(document.body).backgroundColor,
      heroBackground:getComputedStyle(element).backgroundImage,
      heroTitleColor:getComputedStyle(title).color,
      heroTitleSize:getComputedStyle(title).fontSize,
      contextDisplay:context?getComputedStyle(context).display:'missing'
    };
  });
  expect(visual.release).toBe('2.8');
  expect(visual.bodyBackground).toBe('rgb(8, 21, 15)');
  expect(visual.heroBackground).toContain('linear-gradient');
  expect(visual.heroTitleColor).toBe('rgb(255, 255, 255)');
  expect(visual.heroTitleSize).toBe('20px');
  expect(visual.contextDisplay).toBe('none');
  expectNoFailures(failures);
});

test('v3.0 mobile shell is touch-safe, contained and accessible at 320px',async({page})=>{
  const failures=await boot(page,{width:320,height:740});
  await page.evaluate(()=>window.goScreen('s-home'));
  const metrics=await page.evaluate(()=>({
    bodyOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
    shellOverflow:document.querySelector('.device-shell').scrollWidth-document.querySelector('.device-shell').clientWidth,
    navHeights:[...document.querySelectorAll('#fm30AppNav [data-fm30-destination]')].map(el=>el.getBoundingClientRect().height),
    phase:document.documentElement.dataset.fm30Phase
  }));
  expect(metrics.bodyOverflow).toBeLessThanOrEqual(1);
  expect(metrics.shellOverflow).toBeLessThanOrEqual(1);
  metrics.navHeights.forEach(height=>expect(height).toBeGreaterThanOrEqual(44));
  expect(metrics.phase).toBe('app');
  const accessibility=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa']).analyze();
  const serious=accessibility.violations.filter(item=>['serious','critical'].includes(item.impact));
  expect(serious,JSON.stringify(serious,null,2)).toEqual([]);
  expectNoFailures(failures);
});

test('v3.0 desktop keeps a left rail without stretching the v2.8 product viewport',async({page})=>{
  const failures=await boot(page,{width:1280,height:900});
  await page.evaluate(()=>window.goScreen('s-results'));
  const layout=await page.evaluate(()=>{
    const shell=document.querySelector('.device-shell').getBoundingClientRect();
    const nav=document.querySelector('#fm30AppNav').getBoundingClientRect();
    const screen=document.querySelector('.device-screen').getBoundingClientRect();
    return{shellWidth:shell.width,shellHeight:shell.height,navLeft:nav.left,navWidth:nav.width,screenLeft:screen.left,screenWidth:screen.width};
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
