'use strict';

const {test,expect}=require('@playwright/test');
const {inspectTypography,fontCoverage,applyAdaptation,recordEvidence}=require('./helpers/typography-audit.cjs');

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

for(const width of [320,390,960,1440]){
  test('Real App typography baseline '+width+'px',async({page},testInfo)=>{
    await openCleanApp(page,width);
    const fonts=await fontCoverage(page);
    const welcome=await auditRoute(page,'[data-screen="welcome"]');
    await toHome(page);
    const home=await auditRoute(page,'[data-screen="home"]');
    await page.getByRole('button',{name:'전체 보기'}).click();
    const discover=await auditRoute(page,'[data-screen="discover"]');
    const audits=[welcome,home,discover];
    await recordEvidence(page,testInfo,{surface:'Real App',width,mode:'normal',fonts,audits},{screenshot:width===390||width===1440});
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
    const home=await auditRoute(page,'[data-screen="home"]');
    await page.getByRole('button',{name:'전체 보기'}).click();
    const discover=await auditRoute(page,'[data-screen="discover"]');
    await recordEvidence(page,testInfo,{surface:'Real App',width,mode:'fallback',fonts,audits:[home,discover]},{screenshot:true});
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
      const home=await auditRoute(page,'[data-screen="home"]');
      await recordEvidence(page,testInfo,{
        surface:'Real App',width,mode,fonts,audits:[home],
        // Stress simulations are evidence-producing until any discovered
        // defects are fixed and reviewed; do not mislabel them WCAG certification.
        status:'diagnostic; issues require manual triage before promoting to release gate'
      },{screenshot:true});
      expect(home.samples.length).toBeGreaterThan(0);
      await expect(page.locator('[data-screen="home"]')).toBeVisible();
    });
  }
}

for(const width of [390,1440]){
  test('Real App Detail / Join / MY text roles '+width+'px',async({page},testInfo)=>{
    await openCleanApp(page,width);
    const fonts=await fontCoverage(page);
    await toHome(page);await toDetail(page);
    const detail=await auditRoute(page,'[data-screen="detail"]');
    await toJoin(page);
    const join=await auditRoute(page,'[data-screen="checkout"]');
    await page.getByRole('button',{name:'무료로 참가 확정'}).click();
    await expect(page.locator('[data-screen="success"]')).toBeVisible();
    await page.getByRole('button',{name:'내 경기 보기'}).click();
    const my=await auditRoute(page,'[data-screen="profile"]');
    await recordEvidence(page,testInfo,{surface:'Real App',width,mode:'journey',fonts,audits:[detail,join,my]},{screenshot:true});
    for(const item of [detail,join,my]){
      expect(item.samples.length,item.screen+' typography').toBeGreaterThan(0);
      expect(item.issues,item.screen+' text clipping/minimum type').toEqual([]);
      expect(item.documentOverflow).toBe(false);
    }
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
  await recordEvidence(page,testInfo,{surface:'Real App',width:390,mode:'negative-control',
    status:'expected artificial defect detected',beforeIssues:before.issues,detectedIssues:after.issues});
});
