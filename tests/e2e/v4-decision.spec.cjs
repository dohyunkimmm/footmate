const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;

function failures(page){const items=[];page.on('pageerror',e=>items.push(`pageerror: ${e.message}`));page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('Failed to load resource'))items.push(`console.error: ${m.text()}`)});return items}
async function detail(page,id='suwon-ingye-2000',viewport={width:390,height:844}){
  const errs=failures(page);await page.setViewportSize(viewport);await page.goto('/app',{waitUntil:'domcontentloaded'});await page.evaluate(({id})=>{localStorage.clear();localStorage.setItem('footmate:v4:session',JSON.stringify({setupComplete:true,route:'detail',selectedMatchId:id,region:'수원 · 영통',position:'MF',level:'중급'}));location.reload()},{id});await page.waitForSelector('[data-screen="detail"][data-decision-version="4.3.0"]');return errs;
}
async function switchMatch(page,id){await page.evaluate(id=>{const session=JSON.parse(localStorage.getItem('footmate:v4:session'));localStorage.setItem('footmate:v4:session',JSON.stringify({...session,route:'detail',selectedMatchId:id}));location.reload()},id);await page.waitForSelector('[data-screen="detail"][data-decision-version="4.3.0"]')}

test('v4.3 detail exposes decision evidence without pretending sample data is live',async({page})=>{
  const errs=await detail(page);
  await expect(page.getByRole('heading',{name:'참가 결정 체크'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'자리와 포지션'})).toBeVisible();
  await expect(page.getByText('실시간 정원이 아닌 현재 샘플 경기 데이터 기준입니다.')).toBeVisible();
  await expect(page.getByText('시설·운영 정보는 서비스 기획 검증용 샘플 데이터입니다.')).toBeVisible();
  await expect(page.getByRole('heading',{name:'취소 · 환불 기준'})).toBeVisible();
  await expect(page.getByText('경기 24시간 전까지')).toBeVisible();
  await expect(page.getByText('경기 3시간 이내의 상세 취소 기준은 실제 운영 정책 연동 단계에서 확정합니다.')).toBeVisible();
  await expect(page.locator('[data-decision-section="fit"] [data-decision-score]')).toHaveAttribute('data-decision-score',/\d+/);
  expect(errs).toEqual([]);
});

test('v4.3 save intent persists for the selected match',async({page})=>{
  const errs=await detail(page);
  const save=page.getByRole('button',{name:'저장'});
  await save.click();
  await expect(page.getByRole('button',{name:'저장됨'})).toHaveAttribute('aria-pressed','true');
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:v4:decision')).savedMatchIds)).toEqual(['suwon-ingye-2000']);
  await page.reload({waitUntil:'domcontentloaded'});await page.waitForSelector('[data-screen="detail"][data-decision-version="4.3.0"]');
  await expect(page.getByRole('button',{name:'저장됨'})).toHaveAttribute('aria-pressed','true');
  expect(errs).toEqual([]);
});

test('v4.3 compares exactly two matches and lets the user choose one',async({page})=>{
  const errs=await detail(page);
  await page.getByRole('button',{name:'비교'}).click();
  await switchMatch(page,'gwanggyo-2130');
  await page.getByRole('button',{name:'비교'}).click();
  const bar=page.locator('[data-decision-compare-bar]');
  await expect(bar).toContainText('수원 인계 풋살파크');
  await expect(bar).toContainText('광교 웨스트파크');
  const trigger=page.getByRole('button',{name:'비교하기'});await trigger.click();
  const dialog=page.getByRole('dialog',{name:'두 경기 비교'});await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-compare-match-id]')).toHaveCount(2);
  await expect(dialog).toContainText('샘플 잔여');
  await expect(dialog).toContainText('참가비');
  await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(errs).toEqual([]);
});

test('v4.3 compare intent caps at two matches',async({page})=>{
  const errs=await detail(page);
  await page.getByRole('button',{name:'비교'}).click();
  await switchMatch(page,'gwanggyo-2130');await page.getByRole('button',{name:'비교'}).click();
  await switchMatch(page,'yeongtong-1900');await page.getByRole('button',{name:'비교'}).click();
  const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:v4:decision')));
  expect(state.compareMatchIds).toEqual(['suwon-ingye-2000','gwanggyo-2130']);
  await expect(page.locator('[data-decision-status]')).toContainText('최대 두 경기');
  expect(errs).toEqual([]);
});

test('v4.3 decision detail stays mobile-safe and accessible',async({page})=>{
  for(const width of [320,375,390,430]){
    const errs=await detail(page,'suwon-ingye-2000',{width,height:844});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    const targets=await page.locator('.fm-decision-toolbar button').evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().height));
    targets.forEach(height=>expect(height).toBeGreaterThanOrEqual(44));expect(errs).toEqual([]);
  }
  const errs=await detail(page);
  let result=await new AxeBuilder({page}).include('[data-screen="detail"]').withTags(['wcag2a','wcag2aa']).analyze();
  expect(result.violations.filter(v=>['serious','critical'].includes(v.impact))).toEqual([]);
  await page.getByRole('button',{name:'비교'}).click();await switchMatch(page,'gwanggyo-2130');await page.getByRole('button',{name:'비교'}).click();await page.getByRole('button',{name:'비교하기'}).click();
  result=await new AxeBuilder({page}).include('[data-decision-dialog="compare"]').withTags(['wcag2a','wcag2aa']).analyze();
  expect(result.violations.filter(v=>['serious','critical'].includes(v.impact))).toEqual([]);expect(errs).toEqual([]);
});
