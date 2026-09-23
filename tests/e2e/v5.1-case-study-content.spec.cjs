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
    '개요','문제','Persona · JTBD','제품 원칙','핵심 여정','설계 결정 01','설계 결정 02','설계 결정 03',
    '로그인','참가 · 결제','경기 당일 · 재탐색','복구','도메인 구조','외부 연동 · AI 경계','검증','Production 범위'
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
  for(const lead of normalized)expect(lead.length).toBeLessThanOrEqual(520);
});

test('Case Study removes repeated decisions and gives each later section one clear job',async({page})=>{
  await openCaseStudy(page);

  const thesis=await slideText(page,3);
  expect(thesis).toContain('판단 기준을 한곳에');
  expect(thesis).toContain('선택 맥락을 보존');
  expect(thesis).not.toContain('추천을 먼저 보여주기');
  expect(thesis).not.toContain('점수보다 이유를 보여주기');

  const personalization=await slideText(page,6);
  expect(personalization).toContain('같은 조건을 다시 설정하지 않고');
  expect(personalization).toContain('추천 엔진');
  expect(personalization).toContain('근거 없는 AI 점수로 대체하지 않습니다');

  const signIn=await slideText(page,8);
  expect(signIn).toContain('로그인 전의 선택을 잃지 않는 것');
  expect(signIn).toContain('/app: 시뮬레이션 인증 · /beta: Supabase Auth');

  const payment=await slideText(page,9);
  expect(payment).toContain('checkout → pending → success | failure | canceled');
  expect(payment).toContain('스냅샷 고정');
  expect(payment).toContain('실패 후 복구');

  const recovery=await slideText(page,11);
  expect(recovery).toContain('맥락을 보존하고 다음 행동을 여는 공통 원칙');
  expect(recovery).not.toContain('checkout → pending → success | failure | canceled');

  const architecture=await slideText(page,12);
  expect(architecture).toContain('추천·참가·경기 당일·경기 후 상태의 소유권');
  expect(architecture).toContain('외부 연동 여부와 AI 권한은 다음 섹션');
  expect(architecture).not.toMatch(/Supabase|Resend|Web Push|Vercel AI Gateway/);

  const provider=await slideText(page,13);
  expect(provider).toContain('/app');
  expect(provider).toContain('/beta');
  expect(provider).toContain('HITL · 사람 확인');
  expect(provider).toContain('실제 PG와 외부 분석 도구(analytics)는 미연동');

  const validation=await slideText(page,14);
  expect(validation).toContain('0 px');
  expect(validation).toContain('최대 50 pixels');
  expect(validation).toContain('사람 검수 (Human QA)');
  expect(validation).toContain('AI 보조 검수 (AI-assisted QA)');
  expect(validation).toContain('PASS 판정을 대신하지 않습니다');

  const production=await slideText(page,15);
  expect(production).toContain('Production 범위');
  expect(production).toContain('미연동 범위');
  expect(production).toContain('실제 PG · 외부 분석 도구');

  const fullText=await page.locator('.fm-cs-shell').innerText();
  expect(fullText).not.toContain('외부 AI 모델, 회원 DB, 실시간 정원, 실제 결제, 알림 backend는 연결하지 않았습니다.');
  expect(fullText).not.toContain('OAuth · 회원 DB · PG · 실시간 정원 · 알림 backend');
});

test('reader-facing copy is Korean-first while preserving necessary technical terms',async({page})=>{
  await openCaseStudy(page);

  const navigation=await page.locator('.toc').innerText();
  for(const unnecessary of ['Overview','Problem','Product Thesis','Core Journey','Decision 01','Sign in','Join · Payment','Recovery','Validation','Production Boundary','Domain Architecture','Provider · AI 경계']){
    expect(navigation).not.toContain(unnecessary);
  }

  const cover=await slideText(page,0);
  expect(cover).not.toContain('deterministic ranking');
  expect(cover).toContain('추천 순위 계산');

  const thesis=await slideText(page,3);
  expect(thesis).not.toContain('Thesis는');
  expect(thesis).not.toContain('reload');
  expect(thesis).toContain('탐색(Find)');

  const signIn=await slideText(page,8);
  expect(signIn).not.toContain('deterministic mock');
  expect(signIn).not.toContain('/app: mock 인증');
  expect(signIn).not.toContain('provider 연결 경로');

  const provider=await slideText(page,13);
  expect(provider).not.toContain('sample records');
  expect(provider).not.toContain('connected data path');
  expect(provider).not.toContain('external analytics');
  expect(provider).not.toContain('mock 인증');
  expect(provider).toContain('결정론적 추천 엔진(deterministic recommendation engine)');

  const validation=await slideText(page,14);
  expect(validation).not.toContain('responsive widths');
  expect(validation).not.toContain('Case Study sections');
  expect(validation).not.toContain('수동 evidence');
  expect(validation).not.toContain('changed-surface');
  expect(validation).not.toContain('runner raster');
  expect(validation).toContain('사람 검수');
  expect(validation).toContain('AI 보조 검수');

  const production=await slideText(page,15);
  expect(production).not.toContain('Out of scope');
  expect(production).not.toContain('sample catalog');
  expect(production).not.toContain('mock transactional providers');
  expect(production).not.toContain('외부 analytics');
  expect(production).toContain('결정론적 런타임 로직');
});
