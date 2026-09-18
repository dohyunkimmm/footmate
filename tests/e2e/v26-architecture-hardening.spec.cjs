const {test,expect}=require('@playwright/test');

async function boot(page,width=375,height=812){
  const failures=[];
  page.on('pageerror',error=>failures.push(`pageerror: ${error.message}`));
  page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('Failed to load resource'))failures.push(`console.error: ${message.text()}`)});
  await page.setViewportSize({width,height});
  await page.goto('/demo',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__footmateV2===true&&!!window.FootMateV26&&!!window.FootMateV25);
  return failures;
}
function expectNoFailures(failures){expect(failures,failures.join('\n')).toEqual([])}

test('v2.6 exposes architecture boundaries while preserving v2.5 compatibility',async({page})=>{
  const failures=await boot(page);
  const snapshot=await page.evaluate(()=>({
    version:window.FootMateV2Runtime?.version,
    architecture:window.FootMateV2Runtime?.releaseArchitecture,
    release:window.FootMateV26,
    v25:window.FootMateV25,
    dataset:document.documentElement.dataset.footmateRelease,
    screens:document.querySelectorAll('.screen').length,
    availability:window.FootMateV2Runtime?.availabilityGateway?.read()
  }));
  expect(snapshot.version).toBe('2.6.0');
  expect(snapshot.architecture).toBe('v2.6-architecture-hardening');
  expect(snapshot.dataset).toBe('2.6');
  expect(snapshot.screens).toBe(39);
  expect(snapshot.release).toMatchObject({
    version:'2.6.0',
    previousReleaseVersion:'2.5.0',
    schemaVersion:'2.1.0',
    runtimeBoundary:'v2.6-build-source-component-boundary',
    availabilityGateway:'v2.6-availability-verification-boundary',
    decisionTracePersistence:'v2.6-decision-trace-persistence',
    persistentDecisionReplay:true,
    architecture:'v2.6-architecture-hardening'
  });
  expect(snapshot.v25).toMatchObject({version:'2.5.0',currentReleaseVersion:'2.6.0',compatibility:true});
  expect(snapshot.availability).toMatchObject({
    architecture:'v2.6-availability-verification-boundary',
    freshness:{source:'prototype-session',realtime:false,serverVerified:false}
  });
  expectNoFailures(failures);
});

test('v2.6 persists decision trace history across reload',async({page})=>{
  const failures=await boot(page);
  const trace=await page.evaluate(()=>{
    window.FootMateV2Runtime.productStore.set({creditBalance:3000},'e2e-v26-trace');
    const decision=window.FootMateV2Runtime.decisionEngine.evaluate('s-pay');
    return{traceId:decision.traceId,key:window.FootMateV2Runtime.decisionTracePersistence.key};
  });
  await page.waitForFunction(traceId=>window.FootMateV2Runtime.decisionTracePersistence.replay(traceId)?.traceId===traceId,trace.traceId);
  const stored=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'null'),trace.key);
  expect(stored).toMatchObject({schemaVersion:'2.1.0',releaseVersion:'2.6.0',architecture:'v2.6-decision-trace-persistence'});
  expect(stored.traces.some(item=>item.traceId===trace.traceId)).toBe(true);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__footmateV2===true&&!!window.FootMateV26);
  const replay=await page.evaluate(traceId=>window.FootMateV2Runtime.decisionTracePersistence.replay(traceId),trace.traceId);
  expect(replay?.traceId).toBe(trace.traceId);
  expectNoFailures(failures);
});
