const {test,expect}=require('@playwright/test');
const enabled=process.env.PRODUCTION_SMOKE==='1';
const strict=['1','true','yes'].includes(String(process.env.FOOTMATE_STRICT_PRODUCTION||'').toLowerCase());
test.skip(!enabled||!strict,'v3 exact Production browser smoke runs only after an exact main deployment is verified.');

function collectFailures(page){
  const failures=[];
  const origin=new URL(process.env.BASE_URL).origin;
  page.on('pageerror',error=>failures.push(`pageerror: ${error.message}`));
  page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('Failed to load resource'))failures.push(`console.error: ${message.text()}`)});
  page.on('response',response=>{const url=new URL(response.url());if(url.origin===origin&&response.status()>=400)failures.push(`HTTP ${response.status()}: ${url.pathname}`)});
  return failures;
}

test('production serves v3.0 unified app architecture',async({page})=>{
  const failures=collectFailures(page);
  await page.setViewportSize({width:390,height:844});
  await page.goto('/demo',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__footmateV3===true&&window.FootMateV3Runtime?.version==='3.0.0'&&window.FootMateV2Runtime?.version==='2.8.0');
  const release=await page.evaluate(()=>({
    currentRelease:document.documentElement.dataset.footmateCurrentRelease,
    architecture:document.documentElement.dataset.footmateArchitecture,
    visualBaseline:document.documentElement.dataset.footmateVisualBaseline,
    v3:window.FootMateV30,
    runtime:{
      version:window.FootMateV3Runtime?.version,
      schemaVersion:window.FootMateV3Runtime?.schemaVersion,
      architecture:window.FootMateV3Runtime?.architecture,
      releaseArchitecture:window.FootMateV3Runtime?.releaseArchitecture,
      previousReleaseArchitecture:window.FootMateV3Runtime?.previousReleaseArchitecture
    },
    base:{version:window.FootMateV2Runtime?.version,releaseArchitecture:window.FootMateV2Runtime?.releaseArchitecture},
    screens:document.querySelectorAll('.screen').length
  }));
  expect(release.currentRelease).toBe('3.0');
  expect(release.architecture).toBe('unified-app');
  expect(release.visualBaseline).toBe('2.8');
  expect(release.runtime).toMatchObject({version:'3.0.0',schemaVersion:'2.1.0',architecture:'v3.0-modular-app-runtime',releaseArchitecture:'v3.0-unified-app-architecture',previousReleaseArchitecture:'v2.8-visual-identity'});
  expect(release.v3).toMatchObject({version:'3.0.0',previousReleaseVersion:'2.8.0',primaryDestinationCount:4,preservedLegacyScreens:39,stateCompatibility:'v2.1-domain-state-preserved'});
  expect(release.base).toMatchObject({version:'2.8.0',releaseArchitecture:'v2.8-visual-identity'});
  expect(release.screens).toBe(39);

  await page.evaluate(()=>window.goScreen('s-home'));
  const visual=await page.evaluate(()=>({
    release:document.documentElement.dataset.footmateRelease,
    bodyBackground:getComputedStyle(document.body).backgroundColor,
    nbarHeight:getComputedStyle(document.querySelector('#s-home .nbar')).height,
    titleSize:getComputedStyle(document.querySelector('#s-home .nbar-title')).fontSize,
    heroTitleSize:getComputedStyle(document.querySelector('#s-home .fm24-title')).fontSize,
    contextDisplay:getComputedStyle(document.querySelector('#s-home .fm30-context')).display
  }));
  expect(visual).toMatchObject({release:'2.8',bodyBackground:'rgb(8, 21, 15)',nbarHeight:'54px',titleSize:'16px',heroTitleSize:'20px',contextDisplay:'none'});

  const nav=page.locator('#fm30AppNav');
  await expect(nav).toBeVisible();
  await expect(nav.locator('[data-fm30-destination]')).toHaveCount(4);
  await nav.locator('[data-fm30-destination="recommendations"]').click();
  await expect(page.locator('#s-results')).toHaveClass(/active/);
  await expect(page.locator('#s-results')).toHaveAttribute('data-fm30-area','recommendations');
  await expect(nav.locator('[data-fm30-destination="recommendations"]')).toHaveAttribute('aria-current','page');
  expect(failures,failures.join('\n')).toEqual([]);
});

test('production v3.0 desktop keeps the left rail without stretching the v2.8 viewport',async({page})=>{
  const failures=collectFailures(page);
  await page.setViewportSize({width:1280,height:900});
  await page.goto('/demo',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__footmateV3===true&&window.FootMateV3Runtime?.version==='3.0.0');
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
  expect(failures,failures.join('\n')).toEqual([]);
});
