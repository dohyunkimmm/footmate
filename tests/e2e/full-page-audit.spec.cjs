const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;

const VIEWPORTS=[
  {name:'320',width:320,height:740},
  {name:'375',width:375,height:812},
  {name:'390',width:390,height:844},
  {name:'430',width:430,height:932}
];

function attachFailureWatch(page){
  const failures=[];
  page.on('pageerror',error=>failures.push(`pageerror: ${error.message}`));
  page.on('console',message=>{
    if(message.type()==='error'&&!message.text().includes('Failed to load resource'))failures.push(`console.error: ${message.text()}`);
  });
  return failures;
}

async function boot(page,viewport){
  const failures=attachFailureWatch(page);
  await page.setViewportSize({width:viewport.width,height:viewport.height});
  await page.goto('/demo',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>typeof window.goScreen==='function'&&document.querySelectorAll('.screen').length===39&&window.__footmateV3===true&&window.__footmateV2===true);
  const onboarding=page.locator('#demoOnboarding');
  if(await onboarding.isVisible())await page.locator('.demo-onboarding-start').click();
  const ids=await page.locator('.screen').evaluateAll(nodes=>nodes.map(node=>node.id));
  expect(ids).toHaveLength(39);
  return{failures,ids};
}

function describeOverflow(metrics){
  const problems=[];
  if(metrics.screenOverflowX>1)problems.push(`screen overflowX=${metrics.screenOverflowX}`);
  if(metrics.contentOverflowX>1)problems.push(`content overflowX=${metrics.contentOverflowX}`);
  if(metrics.outside.length)problems.push(`outside=${metrics.outside.join(' | ')}`);
  if(metrics.journey&&metrics.journey.display!=='grid')problems.push(`journey display=${metrics.journey.display}`);
  if(metrics.journey&&metrics.journey.listStyle!=='none')problems.push(`journey list-style=${metrics.journey.listStyle}`);
  if(metrics.panelTops.some(value=>value!=='flex'))problems.push(`panel-top display=${[...new Set(metrics.panelTops)].join(',')}`);
  return problems;
}

async function collectMetrics(page,id){
  return page.locator(`#${id}`).evaluate(screen=>{
    const screenRect=screen.getBoundingClientRect();
    const content=screen.querySelector('.pcnt');
    const candidates=[...screen.querySelectorAll([
      'button','a[href]','input','select','textarea','[role="button"]','[role="tab"]',
      '.card','.profile-elo-card','.profile-menu-item','.notif-item','.checkin-member','.gameday-scenario',
      '.v2-match-card','.v2-status-card','.ticket','.postgame-scenario','[data-match-card]',
      '.fm24-panel','.fm24-journey','.fm24-journey-list','.fm25-panel','.fm25-compare-card','.fm25-check'
    ].join(','))];
    const outside=[];
    for(const node of candidates){
      const style=getComputedStyle(node);
      const rect=node.getBoundingClientRect();
      if(style.display==='none'||style.visibility==='hidden'||Number(style.opacity)===0||rect.width<1||rect.height<1)continue;
      const left=Math.max(0,screenRect.left-rect.left);
      const right=Math.max(0,rect.right-screenRect.right);
      if(left>2||right>2){
        const tag=node.tagName.toLowerCase();
        const name=node.id?`#${node.id}`:node.classList.length?`.${[...node.classList].slice(0,3).join('.')}`:tag;
        const text=(node.getAttribute('aria-label')||node.textContent||'').replace(/\s+/g,' ').trim().slice(0,42);
        outside.push(`${name}{${text}}[L${left.toFixed(1)}/R${right.toFixed(1)} W${rect.width.toFixed(1)}]`);
        if(outside.length>=12)break;
      }
    }
    const journey=screen.querySelector('.fm24-journey-list');
    const panelTops=[...screen.querySelectorAll('.fm25-panel-top')]
      .filter(node=>{const r=node.getBoundingClientRect();const s=getComputedStyle(node);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden';})
      .map(node=>getComputedStyle(node).display);
    return{
      screenOverflowX:screen.scrollWidth-screen.clientWidth,
      contentOverflowX:content?content.scrollWidth-content.clientWidth:0,
      outside,
      journey:journey?{display:getComputedStyle(journey).display,listStyle:getComputedStyle(journey).listStyleType}:null,
      panelTops
    };
  });
}

for(const viewport of VIEWPORTS){
  test(`all 39 product screens stay contained at ${viewport.name}px`,async({page},testInfo)=>{
    const{failures,ids}=await boot(page,viewport);
    const problems=[];
    for(const id of ids){
      await page.evaluate(screenId=>window.goScreen(screenId),id);
      await page.waitForFunction(screenId=>document.getElementById(screenId)?.classList.contains('active'),id);
      await page.waitForTimeout(25);
      const metrics=await collectMetrics(page,id);
      const layoutProblems=describeOverflow(metrics);
      if(layoutProblems.length)problems.push(`${id}: ${layoutProblems.join('; ')}`);
      await page.screenshot({path:testInfo.outputPath(`${viewport.name}-${id}.png`),animations:'disabled'});
    }
    failures.forEach(item=>problems.push(item));
    expect(problems,problems.join('\n')).toEqual([]);
  });
}

test('source-owned onboarding artwork survives the v2.8/v3 release layers',async({page})=>{
  const{failures}=await boot(page,{width:390,height:844});
  await page.evaluate(()=>window.goScreen('s-splash'));
  const visual=await page.locator('#s-splash').evaluate(screen=>{
    const content=screen.querySelector('.pcnt');
    const title=screen.querySelector('.splash-title');
    const subtitle=screen.querySelector('.splash-sub');
    return{
      background:getComputedStyle(content).backgroundImage,
      backgroundColor:getComputedStyle(content).backgroundColor,
      titleColor:getComputedStyle(title).color,
      subtitleColor:getComputedStyle(subtitle).color
    };
  });
  expect(visual.background).toContain('linear-gradient');
  expect(visual.background).toContain('rgb(15, 26, 58)');
  expect(visual.titleColor).toBe('rgb(255, 255, 255)');
  expect(failures,failures.join('\n')).toEqual([]);
});

test('all 39 product screens have no serious or critical axe violations at 390px',async({page})=>{
  const{failures,ids}=await boot(page,{width:390,height:844});
  const problems=[];
  for(const id of ids){
    await page.evaluate(screenId=>window.goScreen(screenId),id);
    await page.waitForFunction(screenId=>document.getElementById(screenId)?.classList.contains('active'),id);
    const result=await new AxeBuilder({page}).include(`#${id}`).withTags(['wcag2a','wcag2aa']).analyze();
    const blocking=result.violations.filter(item=>['serious','critical'].includes(item.impact));
    for(const item of blocking){
      for(const node of item.nodes){
        const target=node.target.join(' > ');
        const summary=(node.failureSummary||'').replace(/\s+/g,' ').trim();
        problems.push(`${id}: ${item.id} target=${target} ${summary}`);
      }
    }
  }
  failures.forEach(item=>problems.push(item));
  expect(problems,problems.join('\n')).toEqual([]);
});
