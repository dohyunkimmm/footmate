const fs=require('fs');
const {test,expect}=require('@playwright/test');

async function openCleanWelcome(page,{personalized=false,path='/demo'}={}){
  await page.setViewportSize({width:390,height:844});
  await page.goto(path,{waitUntil:'domcontentloaded'});
  await page.evaluate(({personalized})=>{
    localStorage.clear();
    if(personalized){
      localStorage.setItem('footmate:v4:session',JSON.stringify({route:'welcome',setupComplete:true,region:'서울 · 강남',position:'GK',level:'입문',signedIn:false,userName:'게스트'}));
      localStorage.setItem('footmate:v4:personalization',JSON.stringify({version:'4.7.0',profile:{region:'수원 · 영통',position:'MF',level:'중급',savedAt:'2026-09-25T00:00:00.000Z'},recentMatchIds:[],favorites:{areas:[],timeWindows:[],formats:[]}}));
    }
  },{personalized});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1');
  await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
}

async function welcomeGeometry(page){
  return page.locator('[data-screen="welcome"] .fm-next-intro').evaluate(intro=>{
    const copy=intro.querySelector('.fm-next-intro-copy');
    const headline=copy.querySelector('h1');
    const support=copy.querySelector('[data-welcome-ai-copy]');
    const actions=intro.querySelector('.fm-next-actions');
    const introBox=intro.getBoundingClientRect();
    const copyBox=copy.getBoundingClientRect();
    const headlineBox=headline.getBoundingClientRect();
    const supportBox=support.getBoundingClientRect();
    const actionsBox=actions.getBoundingClientRect();
    const buttonHeights=[...actions.querySelectorAll('button')].map(button=>button.getBoundingClientRect().height);
    return {
      copyVisualShift:copyBox.top-(introBox.top+copy.offsetTop),
      actionsVisualShift:actionsBox.top-(introBox.top+actions.offsetTop),
      headlineTop:headlineBox.top,
      supportTop:supportBox.top,
      supportBottom:supportBox.bottom,
      actionsTop:actionsBox.top,
      buttonHeights,
      supportText:support.textContent
    };
  });
}

test('Welcome source owns AI support copy and visible render shift stays current-production plus 44px',()=>{
  const app=fs.readFileSync('src/v4/app.js','utf8');
  const personalization=fs.readFileSync('src/v4/personalization.js','utf8');
  const css=fs.readFileSync('src/v4/personalization.css','utf8');
  const html=fs.readFileSync('app.html','utf8');
  expect(app).toContain('class="fm-next-intro-copy" style="transform:translateY(-44px)"');
  expect(app).toContain('data-welcome-ai-copy');
  expect(app).toContain('AI가 최고의 경기를 골라준다');
  expect(css).toContain('.fm-next-intro-copy{transform:translateY(-88px)!important}');
  expect(personalization).not.toContain("copy.style.transform='translateY(-44px)'");
  expect(personalization).not.toContain("support.textContent='AI가 최고의 경기를 골라준다'");
  expect(html).toContain('/src/v4/app.js?v=493');
  expect(html).toContain('/src/v4/personalization.js?v=493');
});

for(const path of ['/demo','/app']){
  test(`390px ${path} Welcome moves headline/support 44px above previous production while CTA stays fixed`,async({page})=>{
    await openCleanWelcome(page,{path});
    const copy=page.locator('[data-screen="welcome"] .fm-next-intro-copy');
    const support=page.locator('[data-screen="welcome"] [data-welcome-ai-copy]');
    await expect(copy).toHaveCSS('transform','matrix(1, 0, 0, 1, 0, -88)');
    await expect(support).toBeVisible();
    await expect(support).toHaveText('AI가 최고의 경기를 골라준다');
    const metrics=await welcomeGeometry(page);
    expect(Math.round(metrics.copyVisualShift)).toBe(-88);
    expect(metrics.copyVisualShift).toBeGreaterThanOrEqual(-92);
    expect(metrics.copyVisualShift).toBeLessThanOrEqual(-84);
    expect(Math.round(metrics.actionsVisualShift)).toBe(0);
    expect(Math.round(metrics.actionsTop)).toBe(756);
    expect(metrics.supportTop).toBeGreaterThan(metrics.headlineTop);
    expect(metrics.supportBottom).toBeLessThan(metrics.actionsTop);
    expect(metrics.buttonHeights).toEqual([54]);
  });
}

test('390px returning-user /demo Welcome keeps both 54px CTA positions unchanged',async({page})=>{
  await openCleanWelcome(page,{personalized:true,path:'/demo'});
  await expect(page.getByRole('button',{name:/내 경기 찾아보기/})).toBeVisible();
  await expect(page.getByRole('button',{name:/저장된 설정으로 바로 추천 보기/})).toBeVisible();
  const metrics=await welcomeGeometry(page);
  expect(Math.round(metrics.copyVisualShift)).toBe(-88);
  expect(Math.round(metrics.actionsVisualShift)).toBe(0);
  expect(Math.round(metrics.actionsTop)).toBe(692);
  expect(metrics.supportBottom).toBeLessThan(metrics.actionsTop);
  expect(metrics.buttonHeights).toEqual([54,54]);
});
