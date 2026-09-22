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

async function openDiscover(page,width=390){
  const errs=failures(page);
  await page.setViewportSize({width,height:844});
  await page.goto('/app',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{localStorage.clear();history.replaceState({},'',location.pathname)});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await page.getByRole('button',{name:'전체 보기'}).click();
  await expect(page.locator('[data-screen="discover"]')).toHaveAttribute('data-discovery-version','4.2.0');
  await expect(page.getByRole('button',{name:'필터 열기'})).toBeVisible();
  return errs;
}

test('v4.2 filters narrow real match results and persist through URL and reload',async({page})=>{
  const errs=await openDiscover(page);
  await expect(page.locator('.fm-next-match-card')).toHaveCount(8);
  await page.getByRole('button',{name:'필터 열기'}).click();
  await page.getByLabel('시간').selectOption('19');
  await page.getByLabel('거리').selectOption('15');
  await page.getByLabel('가격').selectOption('12000');
  await page.getByLabel('포지션').selectOption('DF');
  await page.getByRole('button',{name:'결과 보기'}).click();
  await expect(page.locator('.fm-next-match-card')).toHaveCount(1);
  await expect(page.locator('.fm-next-match-card').first()).toHaveAttribute('data-match-id','yeongtong-1900');
  await expect(page.getByRole('button',{name:'필터 4개 적용됨'})).toBeVisible();
  expect(new URL(page.url()).searchParams.get('d_time')).toBe('19');
  expect(new URL(page.url()).searchParams.get('d_distance')).toBe('15');
  expect(new URL(page.url()).searchParams.get('d_price')).toBe('12000');
  expect(new URL(page.url()).searchParams.get('d_position')).toBe('DF');
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('[data-screen="discover"]')).toBeVisible();
  await expect(page.locator('.fm-next-match-card')).toHaveCount(1);
  await expect(page.locator('.fm-next-match-card').first()).toHaveAttribute('data-match-id','yeongtong-1900');
  expect(errs).toEqual([]);
});

test('v4.2 supports fit distance and closing-soon sorting',async({page})=>{
  const errs=await openDiscover(page);
  const sort=page.getByLabel('경기 정렬');
  await sort.selectOption('distance');
  await expect(page.locator('.fm-next-match-card').first()).toHaveAttribute('data-match-id','yeongtong-1900');
  await expect(page.locator('.fm-next-match-card').first()).toContainText('12분');
  expect(new URL(page.url()).searchParams.get('d_sort')).toBe('distance');
  await sort.selectOption('closing');
  await expect(page.locator('.fm-next-match-card').first()).toHaveAttribute('data-match-id','yeongtong-1900');
  expect(new URL(page.url()).searchParams.get('d_sort')).toBe('closing');
  await sort.selectOption('fit');
  expect(new URL(page.url()).searchParams.has('d_sort')).toBe(false);
  expect(errs).toEqual([]);
});

test('v4.2 zero-result recovery widens restrictive conditions without losing position intent',async({page})=>{
  const errs=await openDiscover(page);
  await page.getByRole('button',{name:'필터 열기'}).click();
  await page.getByLabel('날짜').selectOption('tomorrow');
  await page.getByLabel('시간').selectOption('19');
  await page.getByLabel('거리').selectOption('15');
  await page.getByLabel('가격').selectOption('11000');
  await page.getByLabel('포지션').selectOption('GK');
  await page.getByRole('button',{name:'결과 보기'}).click();
  await expect(page.getByRole('heading',{name:'조건에 맞는 경기가 없어요.'})).toBeVisible();
  const emptyHierarchy=await page.locator('.fm-discovery-empty').evaluate(element=>{const style=getComputedStyle(element),rect=element.getBoundingClientRect(),actions=element.querySelector('.fm-discovery-empty-actions'),primary=actions.querySelector('button:first-child'),secondary=actions.querySelector('button:last-child'),primaryStyle=getComputedStyle(primary),secondaryStyle=getComputedStyle(secondary);return {height:rect.height,borderStyle:style.borderTopStyle,background:style.backgroundImage,actionsWidth:actions.getBoundingClientRect().width,primaryBackground:primaryStyle.backgroundColor,secondaryBackground:secondaryStyle.backgroundColor}});
  expect(emptyHierarchy.height).toBeGreaterThanOrEqual(280);
  expect(emptyHierarchy.borderStyle).toBe('solid');
  expect(emptyHierarchy.background).not.toBe('none');
  expect(emptyHierarchy.actionsWidth).toBeLessThanOrEqual(321);
  expect(emptyHierarchy.primaryBackground).not.toBe(emptyHierarchy.secondaryBackground);
  await page.getByRole('button',{name:'조건 넓히기'}).click();
  await expect(page.getByRole('heading',{name:'조건에 맞는 경기가 없어요.'})).toHaveCount(0);
  await expect(page.locator('.fm-next-match-card')).toHaveCount(5);
  await expect(page.getByRole('button',{name:'GK 자리 필터 해제'})).toBeVisible();
  expect(new URL(page.url()).searchParams.get('d_position')).toBe('GK');
  expect(new URL(page.url()).searchParams.has('d_distance')).toBe(false);
  expect(errs).toEqual([]);
});

test('v4.2 mobile filter sheet is keyboard accessible and has no serious axe issues',async({page})=>{
  const errs=await openDiscover(page,320);
  await page.getByRole('button',{name:'필터 열기'}).click();
  const dialog=page.getByRole('dialog',{name:'경기 조건 좁히기'});
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('button',{name:'필터 닫기'})).toBeFocused();
  const targetHeights=await dialog.locator('button,select').evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().height));
  targetHeights.forEach(height=>expect(height).toBeGreaterThanOrEqual(44));
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  const axe=await new AxeBuilder({page}).include('.fm-discovery-sheet').withTags(['wcag2a','wcag2aa']).analyze();
  expect(axe.violations.filter(v=>['serious','critical'].includes(v.impact))).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('button',{name:'필터 열기'})).toBeFocused();
  expect(errs).toEqual([]);
});
