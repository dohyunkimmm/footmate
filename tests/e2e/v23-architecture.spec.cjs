const { test, expect } = require('@playwright/test');

async function boot(page){
  const failures=[];
  page.on('pageerror',error=>failures.push(`pageerror: ${error.message}`));
  page.on('console',message=>{
    if(message.type()==='error'&&!message.text().includes('Failed to load resource')){
      failures.push(`console.error: ${message.text()}`);
    }
  });
  await page.goto('/demo',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__footmateV2===true&&!!window.FootMateV23Candidate);
  const onboarding=page.locator('#demoOnboarding');
  if(await onboarding.isVisible())await page.locator('.demo-onboarding-start').click();
  return failures;
}

function expectNoFailures(failures){
  expect(failures,failures.join('\n')).toEqual([]);
}

test('v2.3 candidate loads canonical v2 CSS and exposes architecture ownership',async({page})=>{
  const failures=await boot(page);
  const snapshot=await page.evaluate(()=>({
    candidate:window.FootMateV23Candidate,
    runtimeVersion:window.FootMateV2Runtime?.version,
    releaseArchitecture:window.FootMateV2Runtime?.releaseArchitecture,
    candidateArchitecture:window.FootMateV2Runtime?.candidateArchitecture,
    presentationArchitecture:window.FootMateV2Runtime?.scenarioStore?.presentationArchitecture,
    presenterOwnedScreens:window.FootMateV2Runtime?.scenarioStore?.presenterOwnedScreens,
    stylePaths:[...document.querySelectorAll('link[rel="stylesheet"]')].map(link=>new URL(link.href).pathname)
  }));

  expect(snapshot.runtimeVersion).toBe('2.2.0');
  expect(snapshot.releaseArchitecture).toBe('v2.2-inspector-modular-ui-runtime');
  expect(snapshot.candidateArchitecture).toBe('v2.3-compatibility-boundary-reduction');
  expect(snapshot.candidate).toMatchObject({
    version:'2.3.0',
    baseReleaseVersion:'2.2.0',
    schemaVersion:'2.1.0',
    scenarioPersistence:'v2.3-scenario-persistence-migration',
    scenarioPresentation:'v2.3-scenario-presenter',
    cssOwnership:'src/v2/styles'
  });
  expect(snapshot.presentationArchitecture).toBe('v2.3-scenario-presenter');
  expect(snapshot.presenterOwnedScreens).toEqual(['s-filter','s-results','s-reason']);
  expect(snapshot.stylePaths).toEqual(expect.arrayContaining([
    '/src/v2/styles/compatibility-patches.css',
    '/src/v2/styles/compatibility-finalize.css',
    '/src/v2/styles/product-inspector.css',
    '/src/v2/styles/experience.css',
    '/src/v2/styles/tokens.css',
    '/src/v2/styles/app.css'
  ]));
  expect(snapshot.stylePaths).not.toEqual(expect.arrayContaining([
    '/footmate-patches.css',
    '/footmate-finalize.css',
    '/footmate-product-hardening.css',
    '/footmate-experience.css'
  ]));

  expectNoFailures(failures);
});

test('v2.3 presenter owns filter state and recommendation reason rendering',async({page})=>{
  const failures=await boot(page);
  await page.evaluate(()=>window.goScreen('s-filter'));
  await page.evaluate(()=>window.FootMateV2Runtime.scenarioStore.setFilter({
    time:'morning',
    matchSkill:1.5,
    format:'7vs7'
  }));
  await page.evaluate(()=>window.FootMateV2Runtime.scenarioStore.setDistance(9));

  await expect(page.locator('#s-filter [data-time-key="morning"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#s-filter [data-skill-key="1.5"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#s-filter [data-format-key="7vs7"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#distanceRange')).toHaveAttribute('aria-valuenow','9');
  await expect(page.locator('#distanceVal')).toHaveText('9');

  await page.evaluate(()=>window.FootMateV2Runtime.scenarioStore.navigateToMatch('seongnam',false));
  await expect(page.locator('#s-reason')).toHaveClass(/active/);
  const selected=await page.evaluate(()=>window.FootMateV2Runtime.scenarioStore.getSelectedScenario());
  await expect(page.locator('#reasonMatchTitle')).toHaveText(selected.team);
  await expect(page.locator('#reasonMatchPct')).toHaveText(`왜 ${selected.pct}% 매칭인가요?`);
  await expect(page.locator('#reasonEloScore')).toHaveText(`${selected.eloScore}점`);

  expectNoFailures(failures);
});

test('v2.3 canonical scenario persistence restores when the legacy key is absent',async({page})=>{
  const failures=await boot(page);

  await page.evaluate(()=>{
    const store=window.FootMateV2Runtime.scenarioStore;
    store.setFilter({time:'evening',matchSkill:2.5,format:'7vs7'});
    store.setDistance(11);
    store.selectMatch('yongin');
  });

  await page.waitForFunction(()=>{
    const record=JSON.parse(localStorage.getItem('footmate:v2:scenario')||'null');
    return record?.state?.profile?.time==='evening'&&
      Number(record?.state?.profile?.distanceKm)===11&&
      record?.state?.selectedMatchKey==='yongin';
  });

  const record=await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:v2:scenario')));
  expect(record).toMatchObject({
    schemaVersion:'2.1.0',
    candidateVersion:'2.3.0',
    state:{
      selectedMatchKey:'yongin',
      profile:{time:'evening',matchSkill:2.5,format:'7vs7',distanceKm:11}
    }
  });

  await page.evaluate(()=>localStorage.removeItem('footmateRuntimeStateV2'));
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__footmateV2===true&&!!window.FootMateV23Candidate);

  const restored=await page.evaluate(()=>({
    state:window.FootMateV2Runtime.scenarioStore.getState(),
    bridge:window.FootMateScenarioPersistenceBridge,
    legacy:JSON.parse(localStorage.getItem('footmateRuntimeStateV2')||'null')
  }));
  expect(restored.bridge).toMatchObject({
    hydrated:true,
    guardedLegacy:false,
    architecture:'v2.3-canonical-to-legacy-hydration-bridge'
  });
  expect(restored.state).toMatchObject({
    selectedMatchKey:'yongin',
    profile:{time:'evening',matchSkill:2.5,format:'7vs7',distanceKm:11}
  });
  expect(restored.legacy).toMatchObject({
    selectedMatchKey:'yongin',
    profile:{time:'evening',matchSkill:2.5,format:'7vs7',distanceKm:11}
  });

  expectNoFailures(failures);
});
