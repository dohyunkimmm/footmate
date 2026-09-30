const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;

function failures(page){
  const items=[];
  page.on('pageerror',error=>items.push(`pageerror: ${error.message}`));
  page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('Failed to load resource'))items.push(`console.error: ${message.text()}`)});
  return items;
}

async function clean(page){
  const errs=failures(page);
  await page.setViewportSize({width:390,height:844});
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{localStorage.clear();sessionStorage.clear()});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_REAL_APP_FLOW__?.version==='1.0.0');
  return errs;
}

async function chooseSetup(page){
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await page.locator('[data-action="choose-setup"][data-value="수원 · 영통"]').click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.locator('[data-action="choose-setup"][data-value="MF"]').click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.locator('[data-action="choose-setup"][data-value="중급"]').click();
  await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
}

async function openDirect(page,route,extra={}){
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await page.evaluate(({route,extra})=>{
    localStorage.clear();
    localStorage.setItem('footmate:v4:session',JSON.stringify({
      route,setupComplete:true,setupStep:0,region:'수원 · 영통',position:'MF',level:'중급',signedIn:false,
      joinedMatchId:null,selectedMatchId:'suwon-ingye-2000',matchStage:'discover',userName:'게스트',...extra
    }));
  },{route,extra});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_REAL_APP_FLOW__?.version==='1.0.0');
  await expect(page.locator(`[data-screen="${route}"]`)).toBeVisible();
}

test('fresh setup lands in a first-use Home and detail back respects Home and Discover origins',async({page})=>{
  const errs=await clean(page);
  await chooseSetup(page);
  const home=page.locator('[data-screen="home"]');
  await expect(home.locator('.fm-next-greeting small')).toHaveText('설정이 완료됐어요');
  await expect(home.locator('.fm-next-greeting h1')).toContainText('조건에 맞는 경기를 찾았어요.');
  await expect(home).not.toContainText('샘플 일정');
  await home.locator('.fm-next-match-card').first().click();
  await expect(page.locator('[data-screen="detail"]')).toBeVisible();
  await page.getByRole('button',{name:'이전 화면'}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
  await page.getByRole('button',{name:'경기 찾기',exact:true}).click();
  const discover=page.locator('[data-screen="discover"]');
  await expect(discover.getByRole('heading',{name:'경기 찾기'})).toBeVisible();
  await discover.locator('.fm-next-match-card').first().click();
  await expect(page.locator('[data-screen="detail"]')).toBeVisible();
  await page.getByRole('button',{name:'이전 화면'}).click();
  await expect(page.locator('[data-screen="discover"]')).toBeVisible();
  expect(errs).toEqual([]);
});

test('auth keeps validation ownership and adds loading failure retry before checkout',async({page})=>{
  const errs=failures(page);
  await openDirect(page,'detail');
  await page.getByRole('button',{name:'참가하기'}).click();
  await expect(page.locator('[data-screen="auth"]')).toBeVisible();
  await page.waitForFunction(()=>document.querySelector('[data-screen="auth"]')?.dataset.fmAuthExperience==='3');
  await page.evaluate(()=>window.__FOOTMATE_REAL_APP_FLOW__.setNextAuthOutcome('failure'));
  const kakao=page.getByRole('button',{name:'카카오로 계속하기'});
  await expect(kakao).toHaveAttribute('data-flow-auth-wired','true');
  await kakao.click();
  await expect(page.locator('[data-flow-auth-status]')).toContainText('확인하고 있어요');
  await expect(page.locator('[data-flow-auth-status]')).toContainText('다시 시도해주세요');
  await expect(page.locator('[data-screen="auth"]')).toBeVisible();
  await kakao.click();
  await expect(page.locator('[data-screen="checkout"]')).toBeVisible();
  await expect(page.locator('[data-p1-checkout-boundary]')).toHaveText('체험 결제 · 실제 청구 없음');
  expect(errs).toEqual([]);
});

test('saved matches have a MY destination and return from saved detail to MY',async({page})=>{
  const errs=failures(page);
  await openDirect(page,'detail');
  await page.getByRole('button',{name:'저장',exact:true}).click();
  await page.evaluate(()=>{
    const session=JSON.parse(localStorage.getItem('footmate:v4:session')||'{}');
    localStorage.setItem('footmate:v4:session',JSON.stringify({...session,route:'profile'}));
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('[data-screen="profile"]')).toBeVisible();
  const saved=page.locator('[data-flow-saved]');
  await expect(saved.getByRole('heading',{name:'저장한 경기'})).toBeVisible();
  await expect(saved).toContainText('수원 인계 풋살파크');
  await saved.getByRole('button',{name:/수원 인계 풋살파크/}).click();
  await expect(page.locator('[data-screen="detail"]')).toBeVisible();
  await page.getByRole('button',{name:'이전 화면'}).click();
  await expect(page.locator('[data-screen="profile"]')).toBeVisible();
  await page.getByText('체험 버전 안내').click();
  await expect(page.getByRole('button',{name:'체험 데이터 초기화'})).toBeVisible();
  const result=await new AxeBuilder({page}).include('[data-screen="profile"]').withTags(['wcag2a','wcag2aa']).analyze();
  expect(result.violations.filter(item=>['serious','critical'].includes(item.impact))).toEqual([]);
  expect(errs).toEqual([]);
});

test('success and matchday surfaces use user-facing continuity copy',async({page})=>{
  const errs=failures(page);
  await openDirect(page,'success',{signedIn:true,joinedMatchId:'suwon-ingye-2000',selectedMatchId:'suwon-ingye-2000',matchStage:'upcoming'});
  const success=page.locator('[data-screen="success"]');
  await expect(success.locator('[data-flow-success-next]')).toContainText('경기 시작 20분 전부터');
  await expect(success.getByRole('button',{name:'내 경기 확인하기'})).toBeVisible();
  await expect(success).not.toContainText('샘플 일정');
  await page.evaluate(()=>{
    const session=JSON.parse(localStorage.getItem('footmate:v4:session')||'{}');
    localStorage.setItem('footmate:v4:session',JSON.stringify({...session,route:'profile'}));
    localStorage.setItem('footmate:v4:matchday',JSON.stringify({matchId:'suwon-ingye-2000',status:'upcoming',startsAt:new Date(Date.now()+10*60000).toISOString()}));
  });
  await page.reload({waitUntil:'domcontentloaded'});
  const profile=page.locator('[data-screen="profile"]');
  await expect(profile.locator('.fm-matchday-kicker')).toHaveText('오늘 경기');
  await expect(profile.locator('.fm-matchday-boundary')).toContainText('이 브라우저에만 저장');
  await expect(profile).not.toContainText('MATCHDAY ·');
  await expect(profile).not.toContainText('backend');
  expect(errs).toEqual([]);
});
