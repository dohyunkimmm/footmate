const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;

function failures(page){
  const items=[];
  page.on('pageerror',error=>items.push(`pageerror: ${error.message}`));
  page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('Failed to load resource'))items.push(`console.error: ${message.text()}`)});
  return items;
}

async function checkout(page,viewport={width:390,height:844}){
  const errs=failures(page);
  await page.setViewportSize(viewport);
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>localStorage.clear());
  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await page.locator('.fm-next-match-card').first().click();
  await page.getByRole('button',{name:'참가하기'}).click();
  await page.getByRole('textbox',{name:'아이디'}).fill('member01');
  await page.getByLabel('비밀번호',{exact:true}).fill('password123!');
  await page.getByRole('button',{name:'로그인'}).click();
  await expect(page.locator('[data-screen="checkout"]')).toBeVisible();
  await expect(page.locator('[data-screen="checkout"]')).toHaveAttribute('data-participation-version','4.4.0');
  await expect(page.locator('[data-screen="checkout"]')).toHaveAttribute('data-participation-status','checkout');
  return errs;
}

async function participation(page){return page.evaluate(()=>window.__FOOTMATE_PARTICIPATION__.read())}

test.beforeEach(async({page})=>{await page.goto('/app',{waitUntil:'domcontentloaded'});await page.evaluate(()=>localStorage.clear())});

test('v4.4 payment method selection and successful participation are explicit',async({page})=>{
  const errs=await checkout(page);
  await expect(page.getByRole('radio',{name:/간편결제/})).toHaveAttribute('aria-checked','true');
  await page.getByRole('radio',{name:/신용·체크카드/}).click();
  await expect(page.getByRole('radio',{name:/신용·체크카드/})).toHaveAttribute('aria-checked','true');
  await page.getByRole('button',{name:/결제하고 참가 확정/}).click();
  await expect(page.locator('[data-screen="checkout"]')).toHaveAttribute('data-participation-status','pending');
  await expect(page.getByRole('button',{name:'결제 확인 중…'})).toBeDisabled();
  await expect(page.locator('[data-screen="success"]')).toBeVisible();
  const stored=await page.evaluate(()=>({payment:JSON.parse(localStorage.getItem('footmate:v4:participation')),session:JSON.parse(localStorage.getItem('footmate:v4:session'))}));
  expect(stored.payment.status).toBe('success');
  expect(stored.payment.paymentMethod).toBe('card');
  expect(stored.session.joinedMatchId).toBe(stored.payment.matchId);
  expect(errs).toEqual([]);
});

test('v4.4 pending state blocks duplicate submit and survives reload',async({page})=>{
  const errs=await checkout(page);
  await page.evaluate(()=>window.__FOOTMATE_PARTICIPATION__.setAutoComplete(false));
  await page.getByRole('button',{name:/결제하고 참가 확정/}).click();
  const first=await participation(page);
  expect(first.status).toBe('pending');
  expect(first.attemptNumber).toBe(1);
  await page.evaluate(()=>document.querySelector('[data-participation-submit]')?.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true})));
  const duplicate=await participation(page);
  expect(duplicate.attemptId).toBe(first.attemptId);
  expect(duplicate.attemptNumber).toBe(1);
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('[data-screen="checkout"]')).toHaveAttribute('data-participation-status','pending');
  await expect(page.getByText('결제 확인 중',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'결제 상태 다시 확인'}).click();
  await expect(page.locator('[data-screen="success"]')).toBeVisible();
  expect(errs).toEqual([]);
});

test('v4.4 failure can retry without creating a joined match',async({page})=>{
  const errs=await checkout(page);
  await page.evaluate(()=>window.__FOOTMATE_PARTICIPATION__.setNextOutcome('failure'));
  await page.getByRole('button',{name:/결제하고 참가 확정/}).click();
  await expect(page.locator('[data-participation-panel="failure"]')).toBeVisible();
  let stored=await page.evaluate(()=>({payment:JSON.parse(localStorage.getItem('footmate:v4:participation')),session:JSON.parse(localStorage.getItem('footmate:v4:session'))}));
  expect(stored.payment.status).toBe('failure');
  expect(stored.session.joinedMatchId).toBeNull();
  await page.getByRole('button',{name:'다시 결제하기'}).click();
  await expect(page.locator('[data-screen="success"]')).toBeVisible();
  stored=await page.evaluate(()=>({payment:JSON.parse(localStorage.getItem('footmate:v4:participation')),session:JSON.parse(localStorage.getItem('footmate:v4:session'))}));
  expect(stored.payment.status).toBe('success');
  expect(stored.payment.attemptNumber).toBe(2);
  expect(stored.session.joinedMatchId).toBe(stored.payment.matchId);
  expect(errs).toEqual([]);
});

test('v4.4 cancel leaves participation unjoined and returns to decision detail',async({page})=>{
  const errs=await checkout(page);
  await page.evaluate(()=>window.__FOOTMATE_PARTICIPATION__.setAutoComplete(false));
  await page.getByRole('button',{name:/결제하고 참가 확정/}).click();
  await page.getByRole('button',{name:'결제 취소'}).click();
  await expect(page.locator('[data-screen="detail"]')).toBeVisible();
  const stored=await page.evaluate(()=>({payment:JSON.parse(localStorage.getItem('footmate:v4:participation')),session:JSON.parse(localStorage.getItem('footmate:v4:session'))}));
  expect(stored.payment.status).toBe('canceled');
  expect(stored.session.joinedMatchId).toBeNull();
  expect(errs).toEqual([]);
});

test('v4.4 pending snapshot stays authoritative when selectedMatchId changes',async({page})=>{
  const errs=await checkout(page);
  await page.evaluate(()=>window.__FOOTMATE_PARTICIPATION__.setAutoComplete(false));
  const original=await participation(page);
  await page.getByRole('button',{name:/결제하고 참가 확정/}).click();
  const pending=await participation(page);
  const alternative=await page.evaluate(matchId=>{
    const session=JSON.parse(localStorage.getItem('footmate:v4:session'));
    const id=matchId==='suwon-ingye-2000'?'gwanggyo-2130':'suwon-ingye-2000';
    localStorage.setItem('footmate:v4:session',JSON.stringify({...session,selectedMatchId:id,route:'checkout'}));
    return id;
  },pending.matchId);
  expect(alternative).not.toBe(pending.matchId);
  await page.reload({waitUntil:'domcontentloaded'});
  const restored=await participation(page);
  expect(restored.matchId).toBe(pending.matchId);
  expect(restored.amount).toBe(pending.amount);
  await page.getByRole('button',{name:'결제 상태 다시 확인'}).click();
  await expect(page.locator('[data-screen="success"]')).toBeVisible();
  const session=await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:v4:session')));
  expect(session.joinedMatchId).toBe(pending.matchId);
  expect(original.policySnapshot.refund24h).toContain('전액 환불');
  expect(errs).toEqual([]);
});

test('v4.4 checkout remains mobile-safe and accessible',async({page})=>{
  for(const width of [320,375,390,430]){
    const errs=await checkout(page,{width,height:844});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    const heights=await page.locator('.fm-participation-methods button').evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().height));
    heights.forEach(height=>expect(height).toBeGreaterThanOrEqual(44));
    expect(errs).toEqual([]);
  }
  const result=await new AxeBuilder({page}).include('[data-screen="checkout"]').withTags(['wcag2a','wcag2aa']).analyze();
  expect(result.violations.filter(item=>['serious','critical'].includes(item.impact))).toEqual([]);
});
