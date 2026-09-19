const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;

async function boot(page,width=375,height=812){
  const failures=[];
  page.on('pageerror',error=>failures.push(`pageerror: ${error.message}`));
  page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('Failed to load resource'))failures.push(`console.error: ${message.text()}`)});
  await page.setViewportSize({width,height});
  await page.goto('/demo',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__footmateV2===true&&!!window.FootMateV28&&window.FootMateV2Runtime?.version==='2.8.0');
  return failures;
}
function expectNoFailures(failures){expect(failures,failures.join('\n')).toEqual([])}

test('v2.8 promotes matchday visual ownership on top of v2.7',async({page})=>{
  const failures=await boot(page);
  const snapshot=await page.evaluate(()=>({
    runtime:window.FootMateV2Runtime?.version,
    architecture:window.FootMateV2Runtime?.releaseArchitecture,
    previous:window.FootMateV2Runtime?.previousReleaseArchitecture,
    visualOwnership:window.FootMateV2Runtime?.visualOwnership,
    tokenOwnership:window.FootMateV2Runtime?.visualTokenOwnership,
    release:window.FootMateV28,
    v27:window.FootMateV27,
    dataset:document.documentElement.dataset.footmateRelease,
    identity:document.documentElement.dataset.footmateVisualIdentity,
    screens:document.querySelectorAll('.screen').length,
    styles:[...document.querySelectorAll('link[rel="stylesheet"]')].map(link=>new URL(link.href).pathname)
  }));
  expect(snapshot.runtime).toBe('2.8.0');
  expect(snapshot.architecture).toBe('v2.8-visual-identity');
  expect(snapshot.previous).toBe('v2.7-visual-experience');
  expect(snapshot.visualOwnership).toBe('src/v2/styles/visual-identity.css');
  expect(snapshot.tokenOwnership).toBe('src/v2/styles/visual-tokens.css');
  expect(snapshot.dataset).toBe('2.8');
  expect(snapshot.identity).toBe('matchday');
  expect(snapshot.screens).toBe(39);
  expect(snapshot.release).toMatchObject({version:'2.8.0',previousReleaseVersion:'2.7.0',schemaVersion:'2.1.0',identity:'matchday',preservedScreens:39,caseStudySlides:16,architecture:'v2.8-visual-identity'});
  expect(snapshot.v27).toMatchObject({version:'2.7.0',currentReleaseVersion:'2.8.0',compatibility:true});
  expect(snapshot.styles.slice(-2)).toEqual(['/src/v2/styles/visual-tokens.css','/src/v2/styles/visual-identity.css']);
  expectNoFailures(failures);
});

test('v2.8 applies sports identity to the decision funnel',async({page})=>{
  const failures=await boot(page);
  for(const id of ['s-home','s-filter','s-results','s-detail','s-pay']){
    await page.evaluate(screenId=>window.goScreen(screenId),id);
    await expect(page.locator(`#${id}`)).toHaveAttribute('data-fm28-identity','true');
  }
  await page.evaluate(()=>window.goScreen('s-home'));
  const home=await page.locator('#s-home .fm24-home-decision').evaluate(element=>{
    const style=getComputedStyle(element);
    const root=getComputedStyle(document.documentElement);
    return{background:style.backgroundImage,color:getComputedStyle(element.querySelector('.fm24-title')).color,pitch:root.getPropertyValue('--fm28-pitch').trim(),accent:root.getPropertyValue('--fm28-accent').trim()};
  });
  expect(home.background).toContain('linear-gradient');
  expect(home.color).toBe('rgb(255, 255, 255)');
  expect(home.pitch).toBe('#165B40');
  expect(home.accent).toBe('#D3F36B');
  await page.evaluate(()=>window.goScreen('s-results'));
  const cards=page.locator('#s-results [data-fm28-card="match"]');
  expect(await cards.count()).toBeGreaterThan(0);
  await expect(cards.first()).toHaveAttribute('data-fm28-featured','true');
  expectNoFailures(failures);
});

test('v2.8 remains touch-safe and accessible at 320px',async({page})=>{
  const failures=await boot(page,320,740);
  for(const id of ['s-home','s-results','s-detail','s-pay']){
    await page.evaluate(screenId=>window.goScreen(screenId),id);
    const metrics=await page.locator(`#${id}`).evaluate(screen=>({
      overflowX:screen.scrollWidth-screen.clientWidth,
      targets:[...screen.querySelectorAll('[data-fm28-action="true"]')].filter(el=>{const r=el.getBoundingClientRect();const s=getComputedStyle(el);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'}).map(el=>el.getBoundingClientRect().height)
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
