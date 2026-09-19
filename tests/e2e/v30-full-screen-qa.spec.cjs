const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
const fs=require('node:fs');
const path=require('node:path');
const pixelmatch=require('pixelmatch');
const {PNG}=require('pngjs');

const BASELINE_URL=process.env.FOOTMATE_V28_BASELINE_URL||'http://127.0.0.1:4180';
const VIEWPORTS=[
  {name:'320',width:320,height:740},
  {name:'375',width:375,height:812},
  {name:'390',width:390,height:844},
  {name:'430',width:430,height:900},
  {name:'desktop',width:1280,height:900}
];
const INTENTIONAL_VISUAL_FIXES=new Set(['s-splash','s-sso']);
const INTENTIONAL_STRUCTURAL_FIXES=Object.freeze({
  's-splash':new Set(['pcntStyle']),
  's-sso':new Set(['pcntStyle']),
  's-eloUpdate':new Set(['pcntOverflowX'])
});

function attachFailureWatch(page){
  const failures=[];
  page.on('pageerror',error=>failures.push(`pageerror: ${error.message}`));
  page.on('console',message=>{
    if(message.type()==='error'&&!message.text().includes('Failed to load resource'))failures.push(`console.error: ${message.text()}`);
  });
  return failures;
}

async function settle(page){
  await page.evaluate(async()=>{
    if(document.fonts?.ready)await document.fonts.ready;
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  });
}

async function boot(page,{baseURL,mode='product',candidate=false,viewport}){
  const failures=attachFailureWatch(page);
  await page.setViewportSize({width:viewport.width,height:viewport.height});
  await page.emulateMedia({reducedMotion:'reduce'});
  const suffix=mode==='portfolio'?'/demo?mode=portfolio':'/demo';
  await page.goto(new URL(suffix,baseURL).href,{waitUntil:'domcontentloaded'});
  if(candidate){
    await page.waitForFunction(()=>window.__footmateV3===true&&window.FootMateV3Runtime?.version==='3.0.0'&&window.FootMateV2Runtime?.version==='2.8.0');
  }else{
    await page.waitForFunction(()=>window.__footmateV2===true&&window.FootMateV2Runtime?.version==='2.8.0'&&document.querySelectorAll('.screen').length===39);
  }
  const onboarding=page.locator('#demoOnboarding');
  if(await onboarding.isVisible())await page.locator('.demo-onboarding-start').click();
  await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}'});
  await settle(page);
  return failures;
}

async function showScreen(page,id){
  await page.evaluate(screenId=>window.goScreen(screenId),id);
  await expect(page.locator(`#${id}`)).toHaveClass(/active/);
  await settle(page);
}

async function screenIds(page){
  return page.evaluate(()=>[...document.querySelectorAll('.screen')].map(node=>node.id));
}

async function metrics(page,id){
  return page.evaluate(screenId=>{
    const screen=document.getElementById(screenId);
    const shell=document.querySelector('.device-shell');
    const device=document.querySelector('.device-screen');
    const layout=document.querySelector('.prototype-layout');
    const pcnt=screen?.querySelector('.pcnt');
    const nbar=screen?.querySelector('.nbar');
    const title=screen?.querySelector('.nbar-title');
    const tab=screen?.querySelector('.tab-bar');
    const sbar=screen?.querySelector('.sbar');
    const notch=document.querySelector('.device-notch');
    const round=v=>Math.round(v*100)/100;
    const box=el=>{if(!el)return null;const r=el.getBoundingClientRect();return{x:round(r.x),y:round(r.y),width:round(r.width),height:round(r.height)}};
    const style=el=>el?getComputedStyle(el):null;
    const shellStyle=style(shell),screenStyle=style(screen),pcntStyle=style(pcnt),nbarStyle=style(nbar),titleStyle=style(title),tabStyle=style(tab),sbarStyle=style(sbar),notchStyle=style(notch),layoutStyle=style(layout);
    return{
      shellStyle:shellStyle?{width:shellStyle.width,height:shellStyle.height,padding:shellStyle.padding,borderRadius:shellStyle.borderRadius,display:shellStyle.display,backgroundColor:shellStyle.backgroundColor}:null,
      shellRect:box(shell),
      deviceRect:box(device),
      layoutTransform:layoutStyle?.transform||'',
      screenRect:box(screen),
      screenStyle:screenStyle?{display:screenStyle.display,backgroundColor:screenStyle.backgroundColor,backgroundImage:screenStyle.backgroundImage,fontFamily:screenStyle.fontFamily}:null,
      screenOverflowX:screen?screen.scrollWidth-screen.clientWidth:null,
      pcntOverflowX:pcnt?pcnt.scrollWidth-pcnt.clientWidth:null,
      pcntStyle:pcntStyle?{backgroundColor:pcntStyle.backgroundColor,backgroundImage:pcntStyle.backgroundImage}:null,
      nbar:nbarStyle?{display:nbarStyle.display,height:nbarStyle.height,backgroundColor:nbarStyle.backgroundColor}:null,
      title:titleStyle?{fontSize:titleStyle.fontSize,fontWeight:titleStyle.fontWeight,color:titleStyle.color}:null,
      tab:tabStyle?{display:tabStyle.display,height:tabStyle.height,backgroundColor:tabStyle.backgroundColor}:null,
      sbar:sbarStyle?{display:sbarStyle.display,height:sbarStyle.height,backgroundColor:sbarStyle.backgroundColor}:null,
      notch:notchStyle?{display:notchStyle.display,width:notchStyle.width,height:notchStyle.height}:null,
      fm30NavCount:document.querySelectorAll('#fm30AppNav').length,
      fm30ContextCount:screen?.querySelectorAll('.fm30-context').length||0,
      activeCount:document.querySelectorAll('.screen.active').length
    };
  },id);
}

function writeOutput(testInfo,name,data){
  const file=testInfo.outputPath(name);
  fs.mkdirSync(path.dirname(file),{recursive:true});
  fs.writeFileSync(file,typeof data==='string'||Buffer.isBuffer(data)?data:JSON.stringify(data,null,2));
  return file;
}

function mismatchSummary(candidate,baseline,ignored=new Set()){
  const fields=[];
  for(const key of Object.keys(baseline)){
    if(ignored.has(key))continue;
    if(JSON.stringify(candidate[key])!==JSON.stringify(baseline[key]))fields.push({key,candidate:candidate[key],baseline:baseline[key]});
  }
  return fields;
}

async function intentionalVisualContract(page,id){
  return page.evaluate(screenId=>{
    const screen=document.getElementById(screenId);
    const pcnt=screen?.querySelector('.pcnt');
    const css=pcnt?getComputedStyle(pcnt):null;
    if(screenId==='s-splash'){
      const kakao=screen.querySelector('.btn-kakao');
      const title=screen.querySelector('.splash-title');
      return{
        backgroundImage:css?.backgroundImage||'',
        titleColor:title?getComputedStyle(title).color:null,
        kakaoBackground:kakao?getComputedStyle(kakao).backgroundColor:null,
        kakaoColor:kakao?getComputedStyle(kakao).color:null
      };
    }
    if(screenId==='s-sso'){
      const title=screen.querySelector('#sso-step2>div:nth-child(2)');
      return{
        backgroundColor:css?.backgroundColor||'',
        titleColor:title?getComputedStyle(title).color:null
      };
    }
    return{};
  },id);
}

test('v3.0 product mode matches the v2.8 structure on all 39 screens while applying explicit QA corrections',async({browser},testInfo)=>{
  test.setTimeout(300_000);
  const issues=[];
  const evidence=[];

  for(const viewport of VIEWPORTS){
    const candidateContext=await browser.newContext({viewport});
    const baselineContext=await browser.newContext({viewport});
    const candidatePage=await candidateContext.newPage();
    const baselinePage=await baselineContext.newPage();
    const candidateFailures=await boot(candidatePage,{baseURL:'http://127.0.0.1:4173',candidate:true,viewport});
    const baselineFailures=await boot(baselinePage,{baseURL:BASELINE_URL,candidate:false,viewport});
    const candidateIds=await screenIds(candidatePage);
    const baselineIds=await screenIds(baselinePage);

    if(candidateIds.length!==39||JSON.stringify(candidateIds)!==JSON.stringify(baselineIds)){
      issues.push({viewport:viewport.name,type:'screen-registry',candidateIds,baselineIds});
    }

    for(const id of baselineIds){
      await showScreen(candidatePage,id);
      await showScreen(baselinePage,id);
      const candidate=await metrics(candidatePage,id);
      const baseline=await metrics(baselinePage,id);
      const ignored=INTENTIONAL_STRUCTURAL_FIXES[id]||new Set();
      const differences=mismatchSummary(candidate,baseline,ignored);
      evidence.push({viewport:viewport.name,id,candidate,baseline,ignored:[...ignored],differences});
      if(differences.length)issues.push({viewport:viewport.name,id,type:'structural-parity',differences});
      if((candidate.screenOverflowX??0)>1||(candidate.pcntOverflowX??0)>1){
        issues.push({viewport:viewport.name,id,type:'horizontal-overflow',screenOverflowX:candidate.screenOverflowX,pcntOverflowX:candidate.pcntOverflowX});
      }
      if(viewport.name==='390'){
        const screenshot=await candidatePage.locator('.device-shell').screenshot({animations:'disabled'});
        writeOutput(testInfo,`screens-390/${id}.png`,screenshot);
      }
    }

    if(candidateFailures.length)issues.push({viewport:viewport.name,type:'candidate-runtime',failures:candidateFailures});
    if(baselineFailures.length)issues.push({viewport:viewport.name,type:'baseline-runtime',failures:baselineFailures});
    await candidateContext.close();
    await baselineContext.close();
  }

  writeOutput(testInfo,'full-screen-structure.json',{issues,evidence});
  expect(issues.slice(0,40),JSON.stringify(issues.slice(0,40),null,2)).toEqual([]);
});

test('v3.0 product mode has no serious or critical axe violations on all 39 screens',async({page},testInfo)=>{
  test.setTimeout(240_000);
  const failures=await boot(page,{baseURL:'http://127.0.0.1:4173',candidate:true,viewport:{width:390,height:844}});
  const ids=await screenIds(page);
  const violations=[];

  for(const id of ids){
    await showScreen(page,id);
    const results=await new AxeBuilder({page}).include(`#${id}`).withTags(['wcag2a','wcag2aa']).analyze();
    for(const violation of results.violations.filter(item=>['serious','critical'].includes(item.impact))){
      violations.push({screen:id,id:violation.id,impact:violation.impact,nodes:violation.nodes.map(node=>({target:node.target,summary:node.failureSummary}))});
    }
  }

  writeOutput(testInfo,'full-screen-axe.json',{screens:ids.length,violations,runtimeFailures:failures});
  expect(ids).toHaveLength(39);
  expect(violations,JSON.stringify(violations,null,2)).toEqual([]);
  expect(failures,failures.join('\n')).toEqual([]);
});

test('authentication screens restore their intended dark readable surfaces and provider identity',async({page})=>{
  const failures=await boot(page,{baseURL:'http://127.0.0.1:4173',candidate:true,viewport:{width:390,height:844}});
  await showScreen(page,'s-splash');
  const splash=await intentionalVisualContract(page,'s-splash');
  expect(splash.backgroundImage).toContain('linear-gradient');
  expect(splash.backgroundImage).toContain('rgb(15, 26, 58)');
  expect(splash.titleColor).toBe('rgb(255, 255, 255)');
  expect(splash.kakaoBackground).toBe('rgb(254, 229, 0)');
  expect(splash.kakaoColor).toBe('rgb(57, 27, 27)');

  await showScreen(page,'s-sso');
  const sso=await intentionalVisualContract(page,'s-sso');
  expect(sso.backgroundColor).toBe('rgb(26, 26, 46)');
  expect(sso.titleColor).toBe('rgb(255, 255, 255)');
  expect(failures,failures.join('\n')).toEqual([]);
});

test('v3.0 product mode remains within one percent of exact v2.8 except documented baseline corrections',async({browser},testInfo)=>{
  test.setTimeout(300_000);
  const viewport={width:390,height:844};
  const candidateContext=await browser.newContext({viewport});
  const baselineContext=await browser.newContext({viewport});
  const candidatePage=await candidateContext.newPage();
  const baselinePage=await baselineContext.newPage();
  const candidateFailures=await boot(candidatePage,{baseURL:'http://127.0.0.1:4173',candidate:true,viewport});
  const baselineFailures=await boot(baselinePage,{baseURL:BASELINE_URL,candidate:false,viewport});
  const ids=await screenIds(baselinePage);
  const results=[];
  const issues=[];

  for(const id of ids){
    await showScreen(candidatePage,id);
    await showScreen(baselinePage,id);
    const candidateBuffer=await candidatePage.locator('.device-shell').screenshot({animations:'disabled'});
    const baselineBuffer=await baselinePage.locator('.device-shell').screenshot({animations:'disabled'});
    const candidate=PNG.sync.read(candidateBuffer);
    const baseline=PNG.sync.read(baselineBuffer);
    let ratio=1;
    let diffBuffer=null;

    if(candidate.width===baseline.width&&candidate.height===baseline.height){
      const diff=new PNG({width:candidate.width,height:candidate.height});
      const pixels=pixelmatch(baseline.data,candidate.data,diff.data,candidate.width,candidate.height,{threshold:.1,includeAA:false});
      ratio=pixels/(candidate.width*candidate.height);
      diffBuffer=PNG.sync.write(diff);
    }

    const intentional=INTENTIONAL_VISUAL_FIXES.has(id);
    results.push({id,ratio,intentional,candidateSize:[candidate.width,candidate.height],baselineSize:[baseline.width,baseline.height]});
    if(!intentional&&ratio>.01){
      issues.push({id,ratio,candidateSize:[candidate.width,candidate.height],baselineSize:[baseline.width,baseline.height]});
      writeOutput(testInfo,`visual-diff/${id}-candidate.png`,candidateBuffer);
      writeOutput(testInfo,`visual-diff/${id}-baseline.png`,baselineBuffer);
      if(diffBuffer)writeOutput(testInfo,`visual-diff/${id}-diff.png`,diffBuffer);
    }
    if(intentional){
      writeOutput(testInfo,`visual-corrections/${id}-candidate.png`,candidateBuffer);
      writeOutput(testInfo,`visual-corrections/${id}-baseline.png`,baselineBuffer);
      if(diffBuffer)writeOutput(testInfo,`visual-corrections/${id}-diff.png`,diffBuffer);
    }
  }

  writeOutput(testInfo,'full-screen-visual-parity.json',{threshold:.01,intentionalVisualFixes:[...INTENTIONAL_VISUAL_FIXES],results,issues,candidateFailures,baselineFailures});
  expect(issues,JSON.stringify(issues,null,2)).toEqual([]);
  expect(candidateFailures,candidateFailures.join('\n')).toEqual([]);
  expect(baselineFailures,baselineFailures.join('\n')).toEqual([]);
  await candidateContext.close();
  await baselineContext.close();
});

test('portfolio mode keeps v3 chrome isolated while all 39 routes remain contained and accessible',async({browser},testInfo)=>{
  test.setTimeout(300_000);
  const issues=[];
  const onboardingIds=new Set(['s-splash','s-sso','s-quiz','s-location','s-manual-location','s-elo']);
  for(const viewport of [{name:'mobile',width:390,height:844},{name:'desktop',width:1280,height:900}]){
    const context=await browser.newContext({viewport});
    const page=await context.newPage();
    const failures=await boot(page,{baseURL:'http://127.0.0.1:4173',candidate:true,mode:'portfolio',viewport});
    const ids=await screenIds(page);
    expect(ids).toHaveLength(39);
    for(const id of ids){
      await showScreen(page,id);
      const state=await page.evaluate(screenId=>{
        const screen=document.getElementById(screenId);
        const pcnt=screen?.querySelector('.pcnt');
        return{
          screenOverflowX:screen?screen.scrollWidth-screen.clientWidth:0,
          pcntOverflowX:pcnt?pcnt.scrollWidth-pcnt.clientWidth:0,
          navVisible:!!document.querySelector('#fm30AppNav')&&getComputedStyle(document.querySelector('#fm30AppNav')).display!=='none'
        };
      },id);
      const onboarding=onboardingIds.has(id);
      if(state.screenOverflowX>1||state.pcntOverflowX>1)issues.push({viewport:viewport.name,id,type:'overflow',state});
      if(state.navVisible===onboarding)issues.push({viewport:viewport.name,id,type:'nav-phase',state,onboarding});
      const axe=await new AxeBuilder({page}).include(`#${id}`).withTags(['wcag2a','wcag2aa']).analyze();
      const blocking=axe.violations.filter(item=>['serious','critical'].includes(item.impact));
      if(blocking.length)issues.push({viewport:viewport.name,id,type:'axe',blocking:blocking.map(item=>({id:item.id,impact:item.impact,nodes:item.nodes.map(node=>node.target)}))});
    }
    await showScreen(page,'s-home');
    await expect(page.locator('#fm30AppNav [data-fm30-destination]')).toHaveCount(4);
    if(failures.length)issues.push({viewport:viewport.name,type:'runtime',failures});
    await context.close();
  }
  writeOutput(testInfo,'portfolio-full-screen-qa.json',{issues});
  expect(issues.slice(0,40),JSON.stringify(issues.slice(0,40),null,2)).toEqual([]);
});
