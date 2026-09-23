const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;

function failures(page){
  const items=[];
  page.on('pageerror',error=>items.push(`pageerror: ${error.message}`));
  page.on('console',message=>{
    if(message.type()==='error'&&!message.text().includes('Failed to load resource'))items.push(`console.error: ${message.text()}`);
  });
  return items;
}

async function serious(page,selector='.fm-next-app'){
  const result=await new AxeBuilder({page}).include(selector).withTags(['wcag2a','wcag2aa']).analyze();
  return result.violations.filter(item=>['serious','critical'].includes(item.impact));
}

async function boot(page,viewport={width:390,height:844}){
  const errs=failures(page);
  await page.setViewportSize(viewport);
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__FOOTMATE_V5__?.version==='5.1.1'&&document.querySelector('#footmate-next')?.dataset.coreFlowQa==='1');
  return errs;
}

async function seedSession(page,patch={}){
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await page.evaluate(patch=>{
    localStorage.clear();
    localStorage.setItem('footmate:v4:session',JSON.stringify({
      route:'home',setupStep:0,setupComplete:true,region:'수원 · 영통',position:'FW',level:'초중급',signedIn:true,
      joinedMatchId:null,selectedMatchId:'suwon-ingye-2000',matchStage:'discover',userName:'테스터',...patch
    }));
  },patch);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#footmate-next')?.dataset.coreFlowQa==='1');
}

async function toAuth(page){
  await seedSession(page,{route:'home',signedIn:false});
  await page.locator('.fm-next-match-card').first().click();
  await page.getByRole('button',{name:'참가하기'}).click();
  await expect(page.locator('[data-screen="auth"]')).toBeVisible();
}

test('fresh navigation starts from welcome while reload keeps recovery state and durable preferences',async({page})=>{
  const errs=await boot(page);
  await page.evaluate(()=>{
    localStorage.setItem('footmate:v4:session',JSON.stringify({route:'profile',setupStep:2,setupComplete:true,region:'서울 · 강남',position:'FW',level:'중급+',signedIn:true,joinedMatchId:null,selectedMatchId:'suwon-ingye-2000',matchStage:'discover',userName:'테스터'}));
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('[data-screen="profile"]')).toBeVisible();
  await page.goto('/app?fresh-entry=1',{waitUntil:'domcontentloaded'});
  await expect(page.locator('[data-screen="welcome"]')).toBeVisible();
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:v4:session')||'{}'));
  expect(stored.region).toBe('서울 · 강남');
  expect(stored.position).toBe('FW');
  expect(stored.level).toBe('중급+');
  expect(stored.route).toBe('welcome');
  expect(errs).toEqual([]);
});

test('user-facing vocabulary uses 공격수, 초급, 고급 without changing internal compatibility values',async({page})=>{
  const errs=await boot(page);
  await page.evaluate(()=>localStorage.clear());
  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await expect(page.getByRole('button',{name:/공격수/})).toBeVisible();
  await expect(page.getByText('포워드',{exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:'다음'}).click();
  await expect(page.getByRole('button',{name:/초급/})).toBeVisible();
  await expect(page.getByRole('button',{name:/고급/})).toBeVisible();
  const internal=await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:v4:session')||'{}'));
  expect(['MF','FW','DF','GK']).toContain(internal.position);
  expect(['입문','초중급','중급','중급+']).toContain(internal.level);
  expect(errs).toEqual([]);
});

test('AI Match Assistant is primary on Home and accepts the new visible vocabulary',async({page})=>{
  await page.route('**/api/ai-match-assistant',route=>route.fulfill({status:503,contentType:'application/json',body:'{}'}));
  const errs=await boot(page,{width:1440,height:900});
  await seedSession(page,{route:'home',signedIn:true,position:'FW',level:'초중급'});
  const card=page.locator('[data-ai-assistant="5.1.1"]');
  await expect(card).toBeVisible();
  await expect(card.getByText('핵심 경기 탐색')).toBeVisible();
  await expect(card.getByText('AI 장애나 지연 시 기존 rules-based 검색으로 자동 전환합니다.')).toBeVisible();
  const order=await page.evaluate(()=>{
    const greeting=document.querySelector('.fm-next-greeting');
    const ai=document.querySelector('[data-ai-assistant]');
    const context=document.querySelector('.fm-next-context-card');
    return {afterGreeting:greeting?.nextElementSibling===ai,beforeContext:ai&&context?Boolean(ai.compareDocumentPosition(context)&Node.DOCUMENT_POSITION_FOLLOWING):false};
  });
  expect(order.afterGreeting).toBe(true);
  expect(order.beforeContext).toBe(true);
  await page.getByLabel('찾고 싶은 경기 조건').fill('수원 영통에서 초급 공격수 경기 찾아줘');
  await page.getByRole('button',{name:'AI로 찾기'}).click();
  await expect(page.locator('[data-ai-mode]')).toHaveText('Rules fallback');
  await expect(page.locator('[data-ai-conditions]')).toContainText('공격수');
  await expect(page.locator('[data-ai-conditions]')).toContainText('초급');
  expect(await serious(page,'[data-ai-assistant]')).toEqual([]);
  expect(errs).toEqual([]);
});

test('Kakao and Google open signup UX, Naver and Apple are absent, and auth back returns to detail',async({page})=>{
  const errs=failures(page);
  await toAuth(page);
  await expect(page.locator('.fm-auth-provider--kakao')).toBeVisible();
  await expect(page.locator('.fm-auth-provider--google')).toBeVisible();
  await expect(page.locator('.fm-auth-provider--naver,.fm-auth-provider--apple')).toHaveCount(0);
  await page.locator('.fm-auth-provider--kakao').click();
  await expect(page.getByRole('heading',{name:'카카오로 가입하기'})).toBeVisible();
  const consent=page.locator('[data-core-auth-consent]');
  const confirm=page.locator('[data-core-auth-confirm]');
  await expect(confirm).toBeDisabled();
  await consent.check();
  await expect(confirm).toBeEnabled();
  await page.getByRole('button',{name:'다른 로그인 방법'}).click();
  await expect(page.locator('.fm-auth-provider--google')).toBeVisible();
  await page.locator('.fm-auth-provider--google').click();
  await expect(page.getByRole('heading',{name:'Google로 가입하기'})).toBeVisible();
  await page.getByRole('button',{name:'다른 로그인 방법'}).click();
  await page.getByRole('button',{name:'경기 상세로 돌아가기'}).click();
  await expect(page.locator('[data-screen="detail"]')).toBeVisible();
  expect(await serious(page)).toEqual([]);
  expect(errs).toEqual([]);
});

test('team message is visible without hover and states the deterministic backend boundary',async({page})=>{
  const errs=failures(page);
  await seedSession(page,{route:'schedule',joinedMatchId:'suwon-ingye-2000',selectedMatchId:'suwon-ingye-2000',matchStage:'upcoming'});
  await page.getByRole('button',{name:'팀 메시지'}).click();
  const panel=page.getByRole('region',{name:'팀 메시지'});
  await expect(panel).toBeVisible();
  await expect(panel.getByText('실시간 위치·지도·팀 채팅·알림 backend는 연결하지 않았습니다. 상태와 복구 흐름을 검증하는 deterministic simulation입니다.')).toBeVisible();
  const style=await panel.locator('.fm-team-message').first().evaluate(element=>{const s=getComputedStyle(element);return {color:s.color,background:s.backgroundColor,opacity:s.opacity,visibility:s.visibility}});
  expect(style.color).not.toBe(style.background);
  expect(style.opacity).toBe('1');
  expect(style.visibility).toBe('visible');
  expect(await serious(page,'[data-core-team-message]')).toEqual([]);
  expect(errs).toEqual([]);
});

test('check-in continues through match completion, postgame feedback and next-match discovery',async({page})=>{
  const errs=failures(page);
  await seedSession(page,{route:'schedule',joinedMatchId:'suwon-ingye-2000',selectedMatchId:'suwon-ingye-2000',matchStage:'upcoming'});
  const ops=page.getByRole('region',{name:'경기 당일 운영'});
  await page.getByRole('button',{name:'도착 상태 알리기'}).click();
  await expect(ops).toHaveAttribute('data-matchday-state','matchday');
  await ops.getByRole('button',{name:'체크인 완료'}).click();
  await expect(ops).toHaveAttribute('data-matchday-state','checked-in');
  await expect(ops.getByRole('button',{name:'경기 완료 · 다음으로'})).toBeVisible();
  await ops.getByRole('button',{name:'경기 완료 · 다음으로'}).click();
  await expect(page.locator('[data-screen="schedule"]')).toBeVisible();
  const returnPanel=page.locator('[data-return-state="draft"]');
  await expect(returnPanel).toBeVisible();
  await expect(page.locator('[data-matchday-version]')).toBeHidden();
  await returnPanel.getByRole('button',{name:'적당했어요'}).click();
  await returnPanel.getByRole('button',{name:'네, 비슷한 경기'}).click();
  await returnPanel.getByRole('button',{name:'평가 저장'}).click();
  const saved=page.locator('[data-return-state="saved"]');
  await expect(saved).toBeVisible();
  await expect(saved.getByRole('button',{name:'새 경기 찾기'})).toBeVisible();
  await saved.getByRole('button',{name:'새 경기 찾기'}).click();
  await expect(page.locator('[data-screen="discover"]')).toBeVisible();
  expect(await serious(page)).toEqual([]);
  expect(errs).toEqual([]);
});

test('changed core flow surfaces stay overflow-safe at 320/375/390/430',async({page})=>{
  for(const width of [320,375,390,430]){
    await page.setViewportSize({width,height:844});
    await toAuth(page);
    await page.locator('.fm-auth-provider--kakao').click();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth),`provider signup overflow at ${width}`).toBeLessThanOrEqual(1);
    await seedSession(page,{route:'schedule',joinedMatchId:'suwon-ingye-2000',selectedMatchId:'suwon-ingye-2000',matchStage:'upcoming'});
    await page.getByRole('button',{name:'팀 메시지'}).click();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth),`team message overflow at ${width}`).toBeLessThanOrEqual(1);
  }
});
