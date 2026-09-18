const {test,expect}=require('@playwright/test');

async function boot(page,width=375,height=812){
  const failures=[];
  page.on('pageerror',error=>failures.push(`pageerror: ${error.message}`));
  page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('Failed to load resource'))failures.push(`console.error: ${message.text()}`)});
  await page.setViewportSize({width,height});
  await page.goto('/demo',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__footmateV2===true&&!!window.FootMateV26&&!!window.FootMateV25&&!!window.FootMateV24);
  return failures;
}
function expectNoFailures(failures){expect(failures,failures.join('\n')).toEqual([])}

test('v2.4 core funnel architecture remains available under v2.6',async({page})=>{
  const failures=await boot(page);
  const snapshot=await page.evaluate(()=>({
    release:window.FootMateV24,
    v23:window.FootMateV23,
    version:window.FootMateV2Runtime?.version,
    architecture:window.FootMateV2Runtime?.releaseArchitecture,
    presenter:window.FootMateV2Runtime?.scenarioPresenter?.architecture,
    presenterScreens:window.FootMateV2Runtime?.scenarioStore?.presenterOwnedScreens,
    releaseDataset:document.documentElement.dataset.footmateRelease,
    stylePaths:[...document.querySelectorAll('link[rel="stylesheet"]')].map(link=>new URL(link.href).pathname)
  }));
  expect(snapshot.version).toBe('2.6.0');
  expect(snapshot.releaseDataset).toBe('2.6');
  expect(snapshot.architecture).toBe('v2.6-architecture-hardening');
  expect(snapshot.presenter).toBe('v2.4-core-funnel-presenter');
  expect(snapshot.presenterScreens).toEqual(['s-filter','s-results','s-reason','s-detail']);
  expect(snapshot.release).toMatchObject({version:'2.4.0',currentReleaseVersion:'2.6.0',previousReleaseVersion:'2.3.0',schemaVersion:'2.1.0',coreFunnelExperience:'v2.4-core-funnel-experience',componentSource:'src/v2/demo/core-funnel-components.js',cssOwnership:'src/v2/styles/core-funnel.css',compatibility:true});
  expect(snapshot.v23).toMatchObject({version:'2.3.0',currentReleaseVersion:'2.6.0',compatibility:true});
  expect(snapshot.stylePaths).toContain('/src/v2/styles/core-funnel.css');
  expectNoFailures(failures);
});

test('v2.4 home → filter → results → detail → payment funnel remains usable under v2.6',async({page})=>{
  const failures=await boot(page);
  await page.evaluate(()=>window.goScreen('s-home'));
  await expect(page.locator('#s-home .fm24-home-decision')).toBeVisible();
  await page.locator('#s-home [data-fm24-action="filter"]').click();
  await expect(page.locator('#s-filter')).toHaveClass(/active/);
  await expect(page.locator('#s-filter .fm24-filter-summary')).toBeVisible();
  await page.evaluate(()=>{const store=window.FootMateV2Runtime.scenarioStore;store.setFilter({time:'evening',matchSkill:1.5,format:'5vs5'});store.setDistance(8)});
  await expect(page.locator('#s-filter .fm24-filter-line')).toContainText('저녁');
  await page.locator('#s-filter [data-fm24-action="results"]').click();
  await expect(page.locator('#s-results .fm24-results-toolbar')).toBeVisible();
  await page.evaluate(()=>window.FootMateV2Runtime.scenarioStore.navigateToMatch('seongnam',true));
  await expect(page.locator('#s-detail .fm24-detail-decision')).toBeVisible();
  await page.evaluate(()=>window.goScreen('s-pay'));
  await expect(page.locator('#s-pay .fm24-checkout')).toBeVisible();
  expectNoFailures(failures);
});

test('v2.4 core funnel remains usable at 320px under v2.6',async({page})=>{
  const failures=await boot(page,320,740);
  await page.evaluate(()=>window.goScreen('s-home'));
  const metrics=await page.locator('#s-home').evaluate(screen=>({overflowX:screen.scrollWidth-screen.clientWidth,actionHeights:[...screen.querySelectorAll('.fm24-action')].map(button=>button.getBoundingClientRect().height),labels:[...screen.querySelectorAll('.fm24-journey-label')].map(label=>getComputedStyle(label).display)}));
  expect(metrics.overflowX).toBeLessThanOrEqual(1);
  metrics.actionHeights.forEach(height=>expect(height).toBeGreaterThanOrEqual(44));
  expect(metrics.labels.every(display=>display==='none')).toBe(true);
  expectNoFailures(failures);
});
