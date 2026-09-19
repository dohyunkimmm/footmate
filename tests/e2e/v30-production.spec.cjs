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

async function dismissIntro(page){
  const intro=page.locator('#demoOnboarding');
  if(await intro.isVisible())await page.locator('.demo-onboarding-start').click();
}

test('production serves v3.0 runtime while product mode preserves the v2.8 visual shell',async({page})=>{
  const failures=collectFailures(page);
  await page.setViewportSize({width:390,height:844});
  await page.goto('/demo',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__footmateV3===true&&window.FootMateV3Runtime?.version==='3.0.0'&&window.FootMateV2Runtime?.version==='2.8.0');
  await dismissIntro(page);
  const release=await page.evaluate(()=>({
    currentRelease:document.documentElement.dataset.footmateCurrentRelease,
    architecture:document.documentElement.dataset.footmateArchitecture,
    visualBaseline:document.documentElement.dataset.footmateVisualBaseline,
    chrome:document.documentElement.dataset.fm30Chrome,
    v3:window.FootMateV30,
    runtime:{version:window.FootMateV3Runtime?.version,schemaVersion:window.FootMateV3Runtime?.schemaVersion,architecture:window.FootMateV3Runtime?.architecture,releaseArchitecture:window.FootMateV3Runtime?.releaseArchitecture,previousReleaseArchitecture:window.FootMateV3Runtime?.previousReleaseArchitecture,visualMode:window.FootMateV3Runtime?.appShell?.visualMode},
    base:{version:window.FootMateV2Runtime?.version,releaseArchitecture:window.FootMateV2Runtime?.releaseArchitecture},
    screens:document.querySelectorAll('.screen').length
  }));
  expect(release.currentRelease).toBe('3.0');
  expect(release.architecture).toBe('unified-app');
  expect(release.visualBaseline).toBe('2.8');
  expect(release.chrome).toBe('v2.8-product-baseline');
  expect(release.runtime).toMatchObject({version:'3.0.0',schemaVersion:'2.1.0',architecture:'v3.0-modular-app-runtime',releaseArchitecture:'v3.0-unified-app-architecture',previousReleaseArchitecture:'v2.8-visual-identity',visualMode:'v2.8-product-baseline'});
  expect(release.v3).toMatchObject({version:'3.0.0',previousReleaseVersion:'2.8.0',primaryDestinationCount:4,preservedLegacyScreens:39,stateCompatibility:'v2.1-domain-state-preserved'});
  expect(release.base).toMatchObject({version:'2.8.0',releaseArchitecture:'v2.8-visual-identity'});
  expect(release.screens).toBe(39);

  await page.evaluate(()=>window.goScreen('s-home'));
  const visual=await page.evaluate(()=>{
    const shell=document.querySelector('.device-shell');
    const device=document.querySelector('.device-screen');
    const home=document.querySelector('#s-home');
    const title=home.querySelector('.fm24-title');
    return{
      shellWidth:getComputedStyle(shell).width,
      shellHeight:getComputedStyle(shell).height,
      shellPadding:getComputedStyle(shell).padding,
      deviceRadius:getComputedStyle(device).borderRadius,
      notchDisplay:getComputedStyle(document.querySelector('.device-notch')).display,
      sbarDisplay:getComputedStyle(home.querySelector('.sbar')).display,
      tabDisplay:getComputedStyle(home.querySelector('.tab-bar')).display,
      heroTitleColor:getComputedStyle(title).color,
      heroTitleSize:getComputedStyle(title).fontSize,
      v3Nav:document.querySelectorAll('#fm30AppNav').length,
      contexts:home.querySelectorAll('.fm30-context').length
    };
  });
  expect(visual).toMatchObject({shellWidth:'375px',shellHeight:'780px',shellPadding:'14px',notchDisplay:'block',sbarDisplay:'flex',tabDisplay:'flex',heroTitleColor:'rgb(255, 255, 255)',heroTitleSize:'19px',v3Nav:0,contexts:0});
  expect(parseFloat(visual.deviceRadius)).toBeGreaterThan(0);
  expect(failures,failures.join('\n')).toEqual([]);
});

test('production product mode keeps the baseline phone geometry on desktop',async({page})=>{
  const failures=collectFailures(page);
  await page.setViewportSize({width:1280,height:900});
  await page.goto('/demo',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__footmateV3===true&&window.FootMateV3Runtime?.version==='3.0.0');
  await dismissIntro(page);
  await page.evaluate(()=>window.goScreen('s-home'));
  const layout=await page.evaluate(()=>({
    shellCssWidth:getComputedStyle(document.querySelector('.device-shell')).width,
    shellCssHeight:getComputedStyle(document.querySelector('.device-shell')).height,
    layoutTransform:getComputedStyle(document.querySelector('.prototype-layout')).transform,
    notchDisplay:getComputedStyle(document.querySelector('.device-notch')).display,
    v3Nav:document.querySelectorAll('#fm30AppNav').length,
    legacyTabDisplay:getComputedStyle(document.querySelector('#s-home .tab-bar')).display
  }));
  expect(layout.shellCssWidth).toBe('375px');
  expect(layout.shellCssHeight).toBe('780px');
  expect(layout.layoutTransform).not.toBe('none');
  expect(layout.notchDisplay).toBe('block');
  expect(layout.v3Nav).toBe(0);
  expect(layout.legacyTabDisplay).toBe('flex');
  expect(failures,failures.join('\n')).toEqual([]);
});

test('production portfolio mode exposes the v3 four-destination chrome separately',async({page})=>{
  const failures=collectFailures(page);
  await page.setViewportSize({width:1280,height:900});
  await page.goto('/demo?mode=portfolio',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__footmateV3===true&&window.FootMateV3Runtime?.version==='3.0.0');
  await dismissIntro(page);
  await page.evaluate(()=>window.goScreen('s-home'));
  const nav=page.locator('#fm30AppNav');
  await expect(nav).toBeVisible();
  await expect(nav.locator('[data-fm30-destination]')).toHaveCount(4);
  await nav.locator('[data-fm30-destination="recommendations"]').click();
  await expect(page.locator('#s-results')).toHaveClass(/active/);
  await expect(page.locator('#s-results')).toHaveAttribute('data-fm30-area','recommendations');
  await expect(page.locator('#s-results .fm30-context')).toBeVisible();
  expect(failures,failures.join('\n')).toEqual([]);
});
