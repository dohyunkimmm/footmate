const {test,expect}=require('@playwright/test');

async function boot(page,width=375,height=812){
  const failures=[];
  page.on('pageerror',error=>failures.push(`pageerror: ${error.message}`));
  page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('Failed to load resource'))failures.push(`console.error: ${message.text()}`)});
  await page.setViewportSize({width,height});
  await page.goto('/demo',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__footmateV2===true&&!!window.FootMateV25&&!!window.FootMateV24);
  return failures;
}
function expectNoFailures(failures){expect(failures,failures.join('\n')).toEqual([])}

test('v2.5 exposes decision/recovery runtime and preserves v2.4 compatibility',async({page})=>{
  const failures=await boot(page);
  const snapshot=await page.evaluate(()=>({
    version:window.FootMateV2Runtime?.version,
    architecture:window.FootMateV2Runtime?.releaseArchitecture,
    release:window.FootMateV25,
    v24:window.FootMateV24,
    dataset:document.documentElement.dataset.footmateRelease,
    screens:document.querySelectorAll('.screen').length,
    styles:[...document.querySelectorAll('link[rel="stylesheet"]')].map(link=>new URL(link.href).pathname),
    decision:window.FootMateV2Runtime?.decisionEngine?.evaluate('s-home',{record:false})
  }));
  expect(snapshot.version).toBe('2.5.0');
  expect(snapshot.architecture).toBe('v2.5-decision-recovery-experience');
  expect(snapshot.dataset).toBe('2.5');
  expect(snapshot.screens).toBe(39);
  expect(snapshot.release).toMatchObject({version:'2.5.0',previousReleaseVersion:'2.4.0',schemaVersion:'2.1.0',decisionEngine:'v2.5-decision-recovery-engine',decisionRecoveryExperience:'v2.5-decision-recovery-experience',traceReplay:true});
  expect(snapshot.v24).toMatchObject({version:'2.4.0',currentReleaseVersion:'2.5.0',compatibility:true});
  expect(snapshot.styles).toContain('/src/v2/styles/decision-recovery.css');
  expect(snapshot.decision.traceId).toMatch(/^fm25-/);
  expectNoFailures(failures);
});

test('v2.5 connects next-action, comparison, preflight and payment guard IX',async({page})=>{
  const failures=await boot(page);
  await page.evaluate(()=>window.goScreen('s-home'));
  await expect(page.locator('#s-home [data-fm25-slot="next-action"]')).toBeVisible();
  await page.locator('#s-home [data-fm25-action="results"]').click();
  await expect(page.locator('#s-results')).toHaveClass(/active/);
  await expect(page.locator('#s-results [data-fm25-slot="comparison"]')).toBeVisible();
  const cards=page.locator('#s-results .fm25-compare-card');
  expect(await cards.count()).toBeGreaterThan(0);
  expect(await cards.count()).toBeLessThanOrEqual(3);
  await cards.first().getByRole('button',{name:'이 경기 확인'}).click();
  await expect(page.locator('#s-detail')).toHaveClass(/active/);
  await expect(page.locator('#s-detail [data-fm25-slot="preflight"]')).toBeVisible();
  await expect(page.locator('#s-detail .fm25-check')).toHaveCount(5);
  await page.evaluate(()=>window.goScreen('s-pay'));
  await expect(page.locator('#s-pay [data-fm25-slot="payment-preflight"]')).toBeVisible();
  const primary=page.locator('#s-pay .btn-primary').last();
  await expect(primary).toHaveAttribute('data-fm25-guard','ready');
  await expect(primary).toBeEnabled();
  expectNoFailures(failures);
});

test('v2.5 blocks low-credit payment and offers inline recovery',async({page})=>{
  const failures=await boot(page);
  await page.evaluate(()=>{
    window.FootMateV2Runtime.productStore.set({creditBalance:3000},'e2e-low-credit');
    window.goScreen('s-pay');
  });
  await expect(page.locator('#s-pay [data-fm25-slot="payment-preflight"]')).toBeVisible();
  const primary=page.locator('#s-pay .btn-primary').last();
  await expect(primary).toHaveAttribute('data-fm25-guard','blocked');
  await expect(primary).toBeDisabled();
  await expect(page.locator('#s-pay .fm25-title')).toContainText('충전');
  const decision=await page.evaluate(()=>window.FootMateV2Runtime.decisionEngine.evaluate('s-pay',{record:false}));
  expect(decision).toMatchObject({submission:'block',primary:{id:'charge'}});
  expect(decision.shortage).toBeGreaterThan(0);
  expectNoFailures(failures);
});

test('v2.5 converts a full match into waitlist recovery instead of payment',async({page})=>{
  const failures=await boot(page);
  await page.evaluate(()=>{
    const ops=window.FootMateProductOps;
    const op=ops.operation();
    if(op.match==='open')ops.transition('match','full',{reason:'e2e'});
    window.FootMateV2Runtime.productStore.sync('e2e-full');
    window.goScreen('s-pay');
  });
  await expect(page.locator('#s-pay .fm25-title')).toContainText('마감');
  await expect(page.locator('#s-pay [data-fm25-action="join-waitlist"]')).toBeVisible();
  await page.locator('#s-pay [data-fm25-action="join-waitlist"]').click();
  await page.waitForFunction(()=>window.FootMateProductOps.operation().participation==='waitlisted');
  await expect(page.locator('#s-pay .fm25-title')).toContainText('대기 등록 상태');
  expectNoFailures(failures);
});

test('v2.5 decision surfaces remain usable at 320px',async({page})=>{
  const failures=await boot(page,320,740);
  await page.evaluate(()=>window.goScreen('s-results'));
  const metrics=await page.locator('#s-results').evaluate(screen=>({overflowX:screen.scrollWidth-screen.clientWidth,actionHeights:[...screen.querySelectorAll('.fm25-action')].map(button=>button.getBoundingClientRect().height)}));
  expect(metrics.overflowX).toBeLessThanOrEqual(1);
  expect(metrics.actionHeights.length).toBeGreaterThan(0);
  metrics.actionHeights.forEach(height=>expect(height).toBeGreaterThanOrEqual(44));
  expectNoFailures(failures);
});
