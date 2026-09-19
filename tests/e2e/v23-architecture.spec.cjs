const {test,expect}=require('@playwright/test');

async function boot(page){
  const failures=[];
  page.on('pageerror',error=>failures.push(`pageerror: ${error.message}`));
  page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('Failed to load resource'))failures.push(`console.error: ${message.text()}`)});
  await page.goto('/demo',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__footmateV2===true&&!!window.FootMateV28&&!!window.FootMateV27&&!!window.FootMateV26&&!!window.FootMateV25&&!!window.FootMateV24&&!!window.FootMateV23);
  return failures;
}
function expectNoFailures(failures){expect(failures,failures.join('\n')).toEqual([])}

test('v2.3 release contract remains available as a compatibility alias under v2.8',async({page})=>{
  const failures=await boot(page);
  const snapshot=await page.evaluate(()=>({runtimeVersion:window.FootMateV2Runtime?.version,releaseArchitecture:window.FootMateV2Runtime?.releaseArchitecture,v23:window.FootMateV23,v22:window.FootMateV22,releaseDataset:document.documentElement.dataset.footmateRelease}));
  expect(snapshot.runtimeVersion).toBe('2.8.0');
  expect(snapshot.releaseDataset).toBe('2.8');
  expect(snapshot.releaseArchitecture).toBe('v2.8-visual-identity');
  expect(snapshot.v23).toMatchObject({version:'2.3.0',currentReleaseVersion:'2.8.0',previousReleaseVersion:'2.2.0',schemaVersion:'2.1.0',scenarioPersistence:'v2.3-scenario-persistence-migration',scenarioPresentation:'v2.3-scenario-presenter',architecture:'v2.3-compatibility-boundary-reduction',compatibility:true});
  expect(snapshot.v22).toMatchObject({version:'2.2.0',currentReleaseVersion:'2.8.0',compatibility:true});
  expectNoFailures(failures);
});

test('v2.3 canonical scenario persistence still restores under v2.8',async({page})=>{
  const failures=await boot(page);
  await page.evaluate(()=>{
    const store=window.FootMateV2Runtime.scenarioStore;
    store.setFilter({time:'evening',matchSkill:2.5,format:'7vs7'});
    store.setDistance(11);
    store.selectMatch('yongin');
  });
  await page.waitForFunction(()=>{
    const record=JSON.parse(localStorage.getItem('footmate:v2:scenario')||'null');
    return record?.state?.profile?.time==='evening'&&Number(record?.state?.profile?.distanceKm)===11&&record?.state?.selectedMatchKey==='yongin';
  });
  const record=await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:v2:scenario')));
  expect(record).toMatchObject({schemaVersion:'2.1.0',releaseVersion:'2.3.0',state:{selectedMatchKey:'yongin'}});
  await page.evaluate(()=>localStorage.removeItem('footmateRuntimeStateV2'));
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__footmateV2===true&&!!window.FootMateV28&&!!window.FootMateV26);
  const restored=await page.evaluate(()=>({state:window.FootMateV2Runtime.scenarioStore.getState(),bridge:window.FootMateScenarioPersistenceBridge}));
  expect(restored.bridge).toMatchObject({hydrated:true,guardedLegacy:false,architecture:'v2.3-canonical-to-legacy-hydration-bridge'});
  expect(restored.state).toMatchObject({selectedMatchKey:'yongin',profile:{time:'evening',matchSkill:2.5,format:'7vs7',distanceKm:11}});
  expectNoFailures(failures);
});
