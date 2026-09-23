const {test,expect}=require('@playwright/test');

async function openCaseStudy(page){
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.footmateCaseStudyRelease==='5.1.1'&&document.querySelectorAll('.slide').length===16);
}

async function slideText(page,index){
  return page.locator('.slide').nth(index).innerText();
}

test('Case Study assigns one distinct responsibility to each product-story section',async({page})=>{
  await openCaseStudy(page);

  const navTitles=await page.locator('.toc-t').allTextContents();
  expect(navTitles).toEqual([
    'Overview','Problem','Persona · JTBD','Product Thesis','Core Journey','Decision 01','Decision 02','Decision 03',
    'Sign in','Join · Payment','Matchday · Return','Recovery','Domain Architecture','Provider · AI Boundary','Validation','Production Boundary'
  ]);

  const roles=await page.locator('.slide[data-v5-content-role]').evaluateAll(slides=>slides.map(slide=>slide.getAttribute('data-v5-content-role')));
  expect(roles).toEqual([
    'product-thesis','core-journey','guest-first-decision','recommendation-decision','detail-decision','auth-context',
    'participation-state','matchday-return','recovery-principle','domain-architecture','provider-ai-boundary','validation-evidence','production-boundary'
  ]);
  expect(new Set(roles).size).toBe(roles.length);

  const leads=await page.locator('.slide .fm-next-story-lead').allTextContents();
  const normalized=leads.map(text=>text.replace(/\s+/g,' ').trim());
  expect(new Set(normalized).size).toBe(normalized.length);
  for(const lead of normalized)expect(lead.length).toBeLessThanOrEqual(420);
});

test('Case Study removes repeated decisions and stale provider boundaries from later sections',async({page})=>{
  await openCaseStudy(page);

  const thesis=await slideText(page,3);
  expect(thesis).toContain('판단 기준을 한곳에');
  expect(thesis).toContain('선택 맥락을 보존');
  expect(thesis).not.toContain('추천을 먼저 보여주기');
  expect(thesis).not.toContain('점수보다 이유를 보여주기');

  const signIn=await slideText(page,8);
  expect(signIn).toContain('로그인 전의 선택을 잃지 않는 것');
  expect(signIn).toContain('/app은 mock auth · /beta는 Supabase Auth');

  const payment=await slideText(page,9);
  expect(payment).toContain('checkout → pending → success | failure | canceled');
  expect(payment).toContain('스냅샷 고정');
  expect(payment).toContain('실패 후 복구');

  const recovery=await slideText(page,11);
  expect(recovery).toContain('맥락을 보존하고 다음 행동을 여는 공통 원칙');
  expect(recovery).not.toContain('checkout → pending → success | failure | canceled');

  const architecture=await slideText(page,12);
  expect(architecture).toContain('추천·참가·경기 당일·경기 후 상태의 소유권');
  expect(architecture).toContain('Provider 연결 여부와 AI 권한은 다음 섹션');
  expect(architecture).not.toMatch(/Supabase|Resend|Web Push|Vercel AI Gateway/);

  const provider=await slideText(page,13);
  expect(provider).toContain('/app');
  expect(provider).toContain('/beta');
  expect(provider).toContain('HITL');
  expect(provider).toContain('실제 PG와 external analytics는 미연동');

  const validation=await slideText(page,14);
  expect(validation).toContain('0 px');
  expect(validation).toContain('최대 50 pixels');
  expect(validation).toContain('수동 evidence');

  const production=await slideText(page,15);
  expect(production).toContain('Production이라고 부르는 범위');
  expect(production).toContain('Out of scope');
  expect(production).toContain('실제 PG · external analytics');

  const fullText=await page.locator('.fm-cs-shell').innerText();
  expect(fullText).not.toContain('외부 AI 모델, 회원 DB, 실시간 정원, 실제 결제, 알림 backend는 연결하지 않았습니다.');
  expect(fullText).not.toContain('OAuth · 회원 DB · PG · 실시간 정원 · 알림 backend');
});
