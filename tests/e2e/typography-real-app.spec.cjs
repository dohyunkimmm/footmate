'use strict';

const {test,expect}=require('@playwright/test');
const {inspectTypography,fontCoverage,applyAdaptation,captureTypographyScreen,recordEvidence}=require('./helpers/typography-audit.cjs');

async function openCleanApp(page,width){
  await require('./sample-date-fixture.cjs')(page);
  await page.setViewportSize({width,height:900});
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>localStorage.clear());
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1');
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
}
async function chooseDefault(page){
  const setup=page.locator('[data-screen="setup"]');
  if(await setup.locator('[data-action="choose-setup"][aria-pressed="true"]').count())return;
  const field=await setup.locator('[data-action="choose-setup"]').first().getAttribute('data-field');
  const value={region:'수원 · 영통',position:'MF',level:'중급'}[field];
  if(!value)throw new Error('Unknown profile setup field: '+field);
  await setup.locator('[data-action="choose-setup"][data-value="'+value+'"]').click();
}
async function toHome(page){
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await chooseDefault(page);await page.getByRole('button',{name:'다음'}).click();
  await chooseDefault(page);await page.getByRole('button',{name:'다음'}).click();
  await chooseDefault(page);await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
}
async function toDetail(page){
  await page.locator('[data-screen="home"] .fm-next-match-card').first().click();
  await expect(page.locator('[data-screen="detail"]')).toBeVisible();
}
async function toJoin(page){
  await page.getByRole('button',{name:'참가하기'}).click();
  await page.getByRole('textbox',{name:'아이디'}).fill('member01');
  await page.getByLabel('비밀번호',{exact:true}).fill('password123!');
  await page.getByRole('button',{name:'로그인'}).click();
  await expect(page.locator('[data-screen="checkout"]')).toBeVisible();
}

async function auditRoute(page,selector){
  await expect(page.locator(selector)).toBeVisible();
  return inspectTypography(page,selector);
}
async function auditAndCapture(page,testInfo,selector,mode,width,screenshots){
  const result=await auditRoute(page,selector);
  screenshots.push(await captureTypographyScreen(page,testInfo,{mode,width,screen:result.screen}));
  return result;
}

for(const width of [320,375,390,430,560,699,700,960,1366,1440,1920]){
  test('Real App typography baseline '+width+'px',async({page},testInfo)=>{
    await openCleanApp(page,width);
    const fonts=await fontCoverage(page);
    const screenshots=[];
    const welcome=await auditAndCapture(page,testInfo,'[data-screen="welcome"]','normal',width,screenshots);
    await toHome(page);
    const home=await auditAndCapture(page,testInfo,'[data-screen="home"]','normal',width,screenshots);
    await page.getByRole('button',{name:'전체 보기'}).click();
    const discover=await auditAndCapture(page,testInfo,'[data-screen="discover"]','normal',width,screenshots);
    const audits=[welcome,home,discover];
    await recordEvidence(page,testInfo,{surface:'Real App',width,mode:'normal',fonts,audits,screenshots});
    for(const item of audits){
      expect(item.samples.length,item.screen+' visible typography').toBeGreaterThan(0);
      expect(item.issues,item.screen+' text clipping/minimum type').toEqual([]);
      expect(item.documentOverflow,item.screen+' document horizontal overflow').toBe(false);
    }
  });
}

for(const width of [390,1440]){
  test('Real App forced fallback font '+width+'px',async({page},testInfo)=>{
    await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//,route=>route.abort());
    await openCleanApp(page,width);
    const fonts=await fontCoverage(page);
    await toHome(page);
    const screenshots=[];
    const home=await auditAndCapture(page,testInfo,'[data-screen="home"]','fallback',width,screenshots);
    await page.getByRole('button',{name:'전체 보기'}).click();
    const discover=await auditAndCapture(page,testInfo,'[data-screen="discover"]','fallback',width,screenshots);
    await recordEvidence(page,testInfo,{surface:'Real App',width,mode:'fallback',fonts,audits:[home,discover],screenshots});
    expect(fonts.faces.every(face=>!face.loaded),'fallback may not be misreported as loaded fonts').toBe(true);
    for(const item of [home,discover]){
      expect(item.issues,item.screen+' fallback text geometry').toEqual([]);
      expect(item.documentOverflow).toBe(false);
    }
  });
}

for(const mode of ['text-200-percent','user-text-spacing']){
  for(const width of [390,1440]){
    test('Real App diagnostic '+mode+' '+width+'px',async({page},testInfo)=>{
      await openCleanApp(page,width);
      const fonts=await fontCoverage(page);
      await toHome(page);
      await applyAdaptation(page,mode);
      const screenshots=[];
      const home=await auditAndCapture(page,testInfo,'[data-screen="home"]',mode,width,screenshots);
      await recordEvidence(page,testInfo,{
        surface:'Real App',width,mode,fonts,audits:[home],screenshots,
        // Stress simulations are evidence-producing until any discovered
        // defects are fixed and reviewed; do not mislabel them WCAG certification.
        status:'diagnostic; issues require manual triage before promoting to release gate'
      });
      expect(home.samples.length).toBeGreaterThan(0);
      await expect(page.locator('[data-screen="home"]')).toBeVisible();
    });
  }
}

for(const width of [390,1440]){
  test('Real App Detail / Join / MY text roles '+width+'px',async({page},testInfo)=>{
    await openCleanApp(page,width);
    const fonts=await fontCoverage(page);
    const screenshots=[];
    await toHome(page);await toDetail(page);
    const detail=await auditAndCapture(page,testInfo,'[data-screen="detail"]','journey',width,screenshots);
    await toJoin(page);
    const join=await auditAndCapture(page,testInfo,'[data-screen="checkout"]','journey',width,screenshots);
    await page.getByRole('button',{name:'무료로 참가 확정'}).click();
    await expect(page.locator('[data-screen="success"]')).toBeVisible();
    await page.getByRole('button',{name:'내 경기 보기'}).click();
    const my=await auditAndCapture(page,testInfo,'[data-screen="profile"]','journey',width,screenshots);
    await recordEvidence(page,testInfo,{surface:'Real App',width,mode:'journey',fonts,audits:[detail,join,my],screenshots});
    for(const item of [detail,join,my]){
      expect(item.samples.length,item.screen+' typography').toBeGreaterThan(0);
      expect(item.issues,item.screen+' text clipping/minimum type').toEqual([]);
      expect(item.documentOverflow).toBe(false);
    }
  });
}

for(const width of [320,375,390]){
  test('Real App Korean and mixed-script long card copy wraps safely at '+width+'px',async({page},testInfo)=>{
    await openCleanApp(page,width);
    await toHome(page);
    const name=page.locator('[data-screen="home"] .fm-next-match-place').first();
    await expect(name).toBeVisible();
    await expect(name).toHaveCSS('word-break','keep-all');
    await expect(name).toHaveCSS('overflow-wrap','break-word');
    await expect(name).toHaveCSS('white-space','normal');
    const samples=[
      ['home','수원 영통 풋살 전용구장 토요일 저녁 초보자 환영 친선 경기'],
      ['home-long-token','광교호수공원국민체육센터실내풋살전용구장초급자친선경기접수처'],
      ['home-mixed','Suwon FC WEEKEND 8v8 경기 · Beginner Friendly 초보 환영 Friendly Match']
    ];
    const audits=[],screenshots=[];
    for(const [screen,copy] of samples){
      await name.evaluate((node,text)=>{node.textContent=text;},copy);
      await expect(name).toContainText(copy);
      const audit=await auditRoute(page,'[data-screen="home"]');
      audits.push(audit);
      screenshots.push(await captureTypographyScreen(page,testInfo,{mode:'korean-line-break',width,screen}));
      expect(audit.issues,screen+' typography should remain unclipped').toEqual([]);
      expect(audit.documentOverflow,screen+' horizontal scroll').toBe(false);
    }
    await recordEvidence(page,testInfo,{surface:'Real App',width,mode:'korean-line-break',audits,screenshots,
      status:'injected copy is test-only; editorial flags still require human review'});
  });
}

test('Real App typography negative control identifies clipped Korean card text',async({page},testInfo)=>{
  await openCleanApp(page,390);
  await toHome(page);
  const target=page.locator('[data-screen="home"] .fm-next-match-place').first();
  await expect(target).toBeVisible();
  const before=await auditRoute(page,'[data-screen="home"]');
  await target.evaluate(node=>{
    node.style.setProperty('width','12px','important');
    node.style.setProperty('height','8px','important');
    node.style.setProperty('overflow','hidden','important');
    node.style.setProperty('white-space','nowrap','important');
    node.style.setProperty('line-height','8px','important');
  });
  const after=await auditRoute(page,'[data-screen="home"]');
  expect(after.issues.some(issue=>/clipped text|invalid line-height/.test(issue))).toBe(true);
  await target.evaluate(node=>{
    node.style.removeProperty('width');
    node.style.removeProperty('height');
    node.style.removeProperty('overflow');
    node.style.removeProperty('white-space');
    node.style.removeProperty('line-height');
    const wrapper=document.createElement('span');
    wrapper.style.cssText='display:block;overflow:hidden;height:8px';
    node.parentElement.insertBefore(wrapper,node);
    wrapper.appendChild(node);
  });
  const parentClipped=await auditRoute(page,'[data-screen="home"]');
  expect(parentClipped.issues.some(issue=>/clipped by ancestor/.test(issue))).toBe(true);
  await recordEvidence(page,testInfo,{surface:'Real App',width:390,mode:'negative-control',
    status:'expected artificial own-element and parent clipping detected',
    beforeIssues:before.issues,detectedIssues:[...after.issues,...parentClipped.issues]});
});
