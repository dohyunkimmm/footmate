const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;

async function boot(page,width=375,height=812){
  const failures=[];
  page.on('pageerror',error=>failures.push(`pageerror: ${error.message}`));
  page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('Failed to load resource'))failures.push(`console.error: ${message.text()}`)});
  await page.setViewportSize({width,height});
  await page.goto('/demo',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__footmateV2===true&&!!window.FootMateV27&&!!window.FootMateV26);
  return failures;
}
function expectNoFailures(failures){expect(failures,failures.join('\n')).toEqual([])}

test('v2.7 exposes visual ownership while preserving the v2.6 product baseline',async({page})=>{
  const failures=await boot(page);
  const snapshot=await page.evaluate(()=>({
    runtime:window.FootMateV2Runtime?.version,
    architecture:window.FootMateV2Runtime?.releaseArchitecture,
    previous:window.FootMateV2Runtime?.previousReleaseArchitecture,
    visualOwnership:window.FootMateV2Runtime?.visualOwnership,
    release:window.FootMateV27,
    v26:window.FootMateV26,
    dataset:document.documentElement.dataset.footmateRelease,
    screens:document.querySelectorAll('.screen').length,
    styles:[...document.querySelectorAll('link[rel="stylesheet"]')].map(link=>new URL(link.href).pathname)
  }));
  expect(snapshot.runtime).toBe('2.7.0');
  expect(snapshot.architecture).toBe('v2.7-visual-experience');
  expect(snapshot.previous).toBe('v2.6-architecture-hardening');
  expect(snapshot.visualOwnership).toBe('src/v2/styles/visual-experience.css');
  expect(snapshot.dataset).toBe('2.7');
  expect(snapshot.screens).toBe(39);
  expect(snapshot.release).toMatchObject({version:'2.7.0',previousReleaseVersion:'2.6.0',schemaVersion:'2.1.0',visualOwnership:'src/v2/styles/visual-experience.css',baselineArchitecture:'v2.6-architecture-hardening',preservedScreens:39,caseStudySlides:16,architecture:'v2.7-visual-experience'});
  expect(snapshot.v26).toMatchObject({version:'2.6.0',currentReleaseVersion:'2.7.0',compatibility:true});
  expect(snapshot.styles.at(-1)).toBe('/src/v2/styles/visual-experience.css');
  expectNoFailures(failures);
});

test('v2.7 applies one visual hierarchy across the decision funnel',async({page})=>{
  const failures=await boot(page);
  const screens=['s-home','s-filter','s-results','s-detail','s-pay'];
  for(const screenId of screens){
    await page.evaluate(id=>window.goScreen(id),screenId);
    await expect(page.locator(`#${screenId}`)).toHaveClass(/active/);
  }
  await page.evaluate(()=>window.goScreen('s-results'));
  await expect(page.locator('#s-results .fm25-compare-card').first()).toBeVisible();
  const visuals=await page.evaluate(()=>{
    const panel=document.querySelector('#s-results .fm25-panel');
    const compare=document.querySelector('#s-results .fm25-compare-card');
    const action=document.querySelector('#s-results .fm25-action');
    const root=getComputedStyle(document.documentElement);
    return{
      panelRadius:parseFloat(getComputedStyle(panel).borderRadius),
      compareRadius:parseFloat(getComputedStyle(compare).borderRadius),
      actionHeight:action.getBoundingClientRect().height,
      brand:root.getPropertyValue('--fm27-brand').trim(),
      canvas:root.getPropertyValue('--fm27-canvas').trim()
    };
  });
  expect(visuals.panelRadius).toBeGreaterThanOrEqual(18);
  expect(visuals.compareRadius).toBeGreaterThanOrEqual(14);
  expect(visuals.actionHeight).toBeGreaterThanOrEqual(44);
  expect(visuals.brand).toBe('#214F9B');
  expect(visuals.canvas).toBe('#F2F5F9');
  expectNoFailures(failures);
});

test('v2.7 stays accessible and touch-safe at 320px',async({page})=>{
  const failures=await boot(page,320,740);
  for(const screenId of ['s-home','s-results','s-detail','s-pay']){
    await page.evaluate(id=>window.goScreen(id),screenId);
    const metrics=await page.locator(`#${screenId}`).evaluate(screen=>({
      overflowX:screen.scrollWidth-screen.clientWidth,
      targets:[...screen.querySelectorAll('.fm24-action,.fm25-action,.btn-primary,.btn-secondary')].filter(el=>{
        const style=getComputedStyle(el);
        const rect=el.getBoundingClientRect();
        return style.display!=='none'&&style.visibility!=='hidden'&&rect.width>0&&rect.height>0;
      }).map(el=>el.getBoundingClientRect().height)
    }));
    expect(metrics.overflowX).toBeLessThanOrEqual(1);
    metrics.targets.forEach(height=>expect(height).toBeGreaterThanOrEqual(44));
  }
  await page.evaluate(()=>window.goScreen('s-home'));
  const accessibility=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa']).analyze();
  const serious=accessibility.violations.filter(item=>['serious','critical'].includes(item.impact));
  expect(serious,JSON.stringify(serious,null,2)).toEqual([]);
  expectNoFailures(failures);
});
