const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
const FRESH_PROFILE_COPY='현재 지역·포지션·레벨을 다음 방문의 시작점으로 저장할 수 있어요.';
const BROWSER_ONLY_COPY='저장 프로필·최근 확인 경기·선호 지역/시간/포맷은 이 브라우저에만 남습니다. 회원 DB, 서버 메모리, 기기 간 동기화는 연결하지 않았습니다.';
async function seed(page,route='profile'){await page.goto('/app',{waitUntil:'domcontentloaded'});await page.evaluate((route)=>{localStorage.clear();localStorage.setItem('footmate:v4:session',JSON.stringify({route,setupComplete:true,region:'수원 · 영통',position:'MF',level:'중급',signedIn:true,joinedMatchId:null,selectedMatchId:'gwanggyo-2130',matchStage:'discover',userName:'테스터'}))},route);await page.reload({waitUntil:'domcontentloaded'})}
test('saved preference profile lets a returning user skip setup without duplicate welcome actions',async({page})=>{await seed(page,'profile');const panel=page.locator('.fm-personalization-panel[data-personalization-version="4.7.0"]');await expect(panel).toBeVisible();await panel.getByRole('button',{name:'현재 설정 저장'}).click();const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:v4:personalization')||'{}'));expect(stored.profile).toMatchObject({region:'수원 · 영통',position:'MF',level:'중급'});await page.evaluate(()=>localStorage.setItem('footmate:v4:session',JSON.stringify({route:'welcome',setupComplete:true,region:'서울 · 강남',position:'GK',level:'입문',signedIn:false,userName:'게스트'})));await page.reload({waitUntil:'domcontentloaded'});const quick=page.getByRole('button',{name:/저장된 설정으로 바로 추천 보기/});await expect(quick).toBeVisible();await expect(page.getByRole('button',{name:'이전 설정으로 계속하기'})).toHaveCount(0);await expect(page.locator('[data-screen="welcome"] .fm-next-actions button')).toHaveCount(2);await quick.click();await expect(page.locator('[data-screen="home"]')).toBeVisible();expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:v4:session')||'{}'))).toMatchObject({setupComplete:true,region:'수원 · 영통',position:'MF',level:'중급'})});
test('favorite and recent signals add explainable recommendation adjustments',async({page})=>{await seed(page,'home');await page.evaluate(()=>{window.__FOOTMATE_PERSONALIZATION__.saveProfile();window.__FOOTMATE_PERSONALIZATION__.setFavorites({areas:['수원 · 영통'],timeWindows:['21+'],formats:['6 vs 6']});window.__FOOTMATE_PERSONALIZATION__.rememberMatch('gwanggyo-2130')});await page.reload({waitUntil:'domcontentloaded'});const ranked=await page.evaluate(()=>window.__FOOTMATE_PERSONALIZATION__.rank());expect(ranked[0].personalizationAdjustment).toBeGreaterThan(0);expect(ranked[0].memoryReasons.length).toBeGreaterThan(0);await expect(page.locator('.fm-personalization-reason').first()).toBeVisible();await page.getByRole('button',{name:'왜 추천됐나요?'}).click();await expect(page.locator('.fm-personalization-explanation li').first()).toBeVisible()});
test('personalization reset is isolated from participation and Return state',async({page})=>{await seed(page,'profile');await page.evaluate(()=>{localStorage.setItem('footmate:v4:participation',JSON.stringify({state:'success'}));localStorage.setItem('footmate:v4:return',JSON.stringify({history:[{matchId:'gwanggyo-2130'}]}));window.__FOOTMATE_PERSONALIZATION__.saveProfile()});await page.reload({waitUntil:'domcontentloaded'});const panel=page.locator('.fm-personalization-panel');const boundary=panel.locator('.fm-personalization-boundary');await expect(boundary).toHaveText(BROWSER_ONLY_COPY);await panel.getByRole('button',{name:'개인화 기록 초기화'}).click();expect(await page.evaluate(()=>localStorage.getItem('footmate:v4:personalization'))).toBeNull();expect(await page.evaluate(()=>localStorage.getItem('footmate:v4:participation'))).not.toBeNull();expect(await page.evaluate(()=>localStorage.getItem('footmate:v4:return'))).not.toBeNull()});
test('personalization controls remain mobile-safe and axe-clean',async({page})=>{for(const width of [320,375,390,430]){await page.setViewportSize({width,height:800});await seed(page,'profile');await expect(page.locator('.fm-personalization-panel')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1);const heights=await page.locator('.fm-personalization-panel button').evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().height));heights.forEach(height=>expect(height).toBeGreaterThanOrEqual(44))}const result=await new AxeBuilder({page}).include('.fm-personalization-panel').withTags(['wcag2a','wcag2aa']).analyze();expect(result.violations.filter(item=>['serious','critical'].includes(item.impact))).toEqual([])});

test('fresh Real App MY keeps requested guidance on one line without restoring the top title',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await seed(page,'profile');
  const screen=page.locator('[data-screen="profile"]');
  const panel=screen.locator('.fm-personalization-panel--profile');
  const summary=panel.locator('.fm-personalization-head span').first();
  const boundary=panel.locator('.fm-personalization-boundary');
  await expect(panel).toBeVisible();
  await expect(screen.locator('.fm-next-topbar > strong')).toHaveCount(0);
  await expect(summary).toHaveText(FRESH_PROFILE_COPY);
  await expect(summary).toHaveCSS('white-space','nowrap');
  await expect(boundary).toHaveText(BROWSER_ONLY_COPY);
  await expect(boundary).toHaveCSS('white-space','nowrap');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  await expect(panel).toHaveScreenshot('real-app-my-fresh-profile-390.png',{animations:'disabled',caret:'hide',maxDiffPixels:0});
});

// Contract: Real App MY keeps saved preferences compact until the user enters edit mode.
test('Real App MY aligns the saved profile card and stages preference edits before saving',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await seed(page,'profile');
  await page.evaluate(()=>{
    window.__FOOTMATE_PERSONALIZATION__.saveProfile();
    window.__FOOTMATE_PERSONALIZATION__.setFavorites({
      areas:['수원 · 영통','수원 · 인계','용인 · 기흥','서울 · 강남'],
      timeWindows:['19','20'],
      formats:['6 vs 6','5 vs 5']
    });
  });
  await page.reload({waitUntil:'domcontentloaded'});
  const screen=page.locator('[data-screen="profile"]');
  const panel=screen.locator('.fm-personalization-panel--profile');
  await expect(panel).toBeVisible();
  await expect(screen.locator('.fm-next-topbar > strong')).toHaveCount(0);
  await expect(panel.locator('.fm-personalization-kicker')).toHaveCount(0);
  await expect(panel).not.toContainText('4.7.0');
  await expect(panel.getByRole('button',{name:'수정',exact:true})).toBeVisible();
  await expect(panel.getByRole('button',{name:'현재 설정 저장'})).toHaveCount(0);
  await expect(panel.locator('.fm-personalization-boundary')).toHaveText(BROWSER_ONLY_COPY);
  await expect(panel.locator('.fm-personalization-boundary')).toHaveCSS('white-space','nowrap');
  const widths=await screen.evaluate(element=>({
    profile:element.querySelector('.fm-next-profile-card').getBoundingClientRect().width,
    personalization:element.querySelector('.fm-personalization-panel--profile').getBoundingClientRect().width
  }));
  expect(Math.abs(widths.profile-widths.personalization)).toBeLessThanOrEqual(1);
  const areaRects=await panel.locator('fieldset').first().locator('.fm-personalization-options .fm-next-tag').evaluateAll(nodes=>nodes.map(node=>{const rect=node.getBoundingClientRect();return {left:rect.left,top:rect.top,width:rect.width}}));
  expect(areaRects).toHaveLength(4);
  expect(Math.abs(areaRects[0].top-areaRects[1].top)).toBeLessThanOrEqual(1);
  expect(Math.abs(areaRects[2].top-areaRects[3].top)).toBeLessThanOrEqual(1);
  expect(areaRects[2].top).toBeGreaterThan(areaRects[0].top);
  await panel.getByRole('button',{name:'수정',exact:true}).click();
  await expect(panel).toHaveAttribute('data-editing','true');
  await panel.getByRole('button',{name:'21시 이후'}).click();
  await expect(panel.getByRole('button',{name:'변경사항 저장'})).toBeVisible();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:v4:personalization')).favorites.timeWindows)).toEqual(['19','20']);
  await panel.getByRole('button',{name:'변경사항 저장'}).click();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('footmate:v4:personalization')).favorites.timeWindows)).toEqual(['19','20','21+']);
  await expect(panel.getByRole('button',{name:'수정',exact:true})).toBeVisible();
  await expect(screen).toHaveScreenshot('real-app-my-personalization-390.png',{animations:'disabled',caret:'hide'});
});

test('fresh recommendation surfaces do not claim personalization before memory exists',async({page})=>{await seed(page,'home');await expect(page.locator('[data-personalization-explanation]')).toHaveCount(0);const ranked=await page.evaluate(()=>window.__FOOTMATE_PERSONALIZATION__.rank());expect(ranked[0].personalizationAdjustment).toBe(0);await page.getByRole('button',{name:'전체 보기'}).click();await expect(page.locator('[data-screen="discover"]')).toBeVisible();await expect(page.locator('[data-personalization-explanation]')).toHaveCount(0)});
