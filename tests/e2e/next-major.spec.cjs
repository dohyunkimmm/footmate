const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;

function captureFailures(page){
  const failures=[];
  page.on('pageerror',error=>failures.push(`pageerror: ${error.message}`));
  page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('Failed to load resource'))failures.push(`console.error: ${message.text()}`)});
  return failures;
}
async function boot(page,path='/next',viewport={width:390,height:844}){
  const failures=captureFailures(page);
  await page.setViewportSize(viewport);
  await page.goto(path,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#footmate-next [data-screen]');
  return failures;
}
function expectNoFailures(failures){expect(failures,failures.join('\n')).toEqual([])}

async function finishPreferences(page){
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await expect(page.locator('[data-screen="setup"]')).toBeVisible();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
}

async function openAuth(page){
  await finishPreferences(page);
  await page.locator('.fm-next-match-card').first().click();
  await expect(page.locator('[data-screen="detail"]')).toBeVisible();
  const title=await page.locator('[data-screen="detail"] h1').innerText();
  await page.getByRole('button',{name:'참가하기'}).click();
  await expect(page.locator('[data-screen="auth"]')).toBeVisible();
  await expect(page.getByRole('heading',{name:/로그인 후 더 많은 경기를/})).toBeVisible();
  return title;
}

test('next-major reveals value and recommendations before asking for an account',async({page})=>{
  const failures=await boot(page);
  await expect(page.getByRole('heading',{name:/내 수준에 맞는 경기부터/})).toBeVisible();
  await expect(page.getByText('둘러보는 데 계정이 필요하지 않아요.')).toBeVisible();
  await finishPreferences(page);
  await expect(page.getByText('지금 잘 맞는 경기')).toBeVisible();
  await expect(page.getByRole('button',{name:'카카오로 계속하기'})).toHaveCount(0);
  await expect(page.locator('.fm-next-match-card')).toHaveCount(2);
  expectNoFailures(failures);
});

test('join intent opens account login plus SSO and continues through checkout without losing the chosen match',async({page})=>{
  const failures=await boot(page);
  const title=await openAuth(page);
  await expect(page.getByRole('textbox',{name:'아이디 또는 이메일'})).toBeVisible();
  await expect(page.getByLabel('비밀번호',{exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'로그인'})).toBeVisible();
  await expect(page.getByRole('button',{name:'카카오로 계속하기'})).toBeVisible();
  await expect(page.getByRole('button',{name:'네이버로 계속하기'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Apple로 계속하기'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Google로 계속하기'})).toBeVisible();
  await page.getByRole('button',{name:'카카오로 계속하기'}).click();
  await expect(page.locator('[data-screen="checkout"]')).toBeVisible();
  await expect(page.locator('.fm-next-checkout-summary')).toContainText(title);
  await page.getByRole('button',{name:/결제하고 참가 확정/}).click();
  await expect(page.locator('[data-screen="success"]')).toBeVisible();
  await expect(page.locator('.fm-next-ticket')).toContainText(title);
  await page.getByRole('button',{name:'내 경기 보기'}).click();
  await expect(page.locator('[data-screen="schedule"]')).toBeVisible();
  await expect(page.locator('.fm-next-upcoming')).toContainText(title);
  expectNoFailures(failures);
});

test('sign-up panel mirrors the account form pattern and requires core consent',async({page})=>{
  const failures=await boot(page);
  await openAuth(page);
  await page.getByRole('button',{name:'회원가입'}).click();
  await expect(page.getByRole('heading',{name:'회원가입'})).toBeVisible();
  await expect(page.getByRole('textbox',{name:'회원가입 아이디'})).toBeVisible();
  await expect(page.getByLabel('회원가입 비밀번호')).toBeVisible();
  await expect(page.getByRole('textbox',{name:'회원가입 이메일'})).toBeVisible();
  const submit=page.getByRole('button',{name:'가입하고 계속'});
  await expect(submit).toBeDisabled();
  await page.getByText('모두 동의합니다.').click();
  await expect(submit).toBeEnabled();
  await page.getByRole('button',{name:/이미 계정이 있어요/}).click();
  await expect(page.getByRole('button',{name:'로그인'})).toBeVisible();
  expectNoFailures(failures);
});

test('real app mode hides reviewer language and keeps four user destinations',async({page})=>{
  const failures=await boot(page);
  await finishPreferences(page);
  await expect(page.locator('.fm-next-nav button')).toHaveCount(4);
  await expect(page.getByText('Guided Case Study')).toHaveCount(0);
  await expect(page.getByText('EVIDENCE MODE',{exact:true})).toHaveCount(0);
  const text=await page.locator('#footmate-next').innerText();
  expect(text).not.toContain('AI Agent Workflow');
  expect(text).not.toContain('프로토타입');
  expect(text).not.toContain('시뮬레이션');
  expectNoFailures(failures);
});

test('guided and evidence modes keep reviewer context outside the real app surface',async({page})=>{
  const failures=await boot(page,'/next?mode=guided',{width:1280,height:900});
  await expect(page.getByText('Guided Case Study')).toBeVisible();
  await expect(page.locator('.fm-next-guide')).toBeVisible();
  await expect(page.locator('.fm-next-app')).toBeVisible();
  await page.goto('/next?mode=evidence',{waitUntil:'domcontentloaded'});
  await page.waitForSelector('[data-screen="home"]');
  await expect(page.getByText('EVIDENCE MODE',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'경기 당일'}).click();
  await expect(page.getByText('경기까지 1시간 20분')).toBeVisible();
  await page.getByRole('button',{name:'경기 후'}).click();
  await expect(page.getByText('오늘 경기, 어땠나요?')).toBeVisible();
  expectNoFailures(failures);
});

test('next-major stays horizontally safe at the supported mobile widths',async({page})=>{
  for(const width of [320,375,390,430]){
    const failures=await boot(page,'/next',{width,height:780});
    const introOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(introOverflow).toBeLessThanOrEqual(1);
    await finishPreferences(page);
    const metrics=await page.evaluate(()=>({
      doc:document.documentElement.scrollWidth-document.documentElement.clientWidth,
      app:document.querySelector('.fm-next-app').scrollWidth-document.querySelector('.fm-next-app').clientWidth,
      targets:[...document.querySelectorAll('.fm-next-nav button')].map(el=>el.getBoundingClientRect().height)
    }));
    expect(metrics.doc).toBeLessThanOrEqual(1);
    expect(metrics.app).toBeLessThanOrEqual(1);
    metrics.targets.forEach(height=>expect(height).toBeGreaterThanOrEqual(44));
    expectNoFailures(failures);
    await page.evaluate(()=>localStorage.clear());
  }
});

test('next-major auth and recommendation surfaces have no serious or critical axe findings',async({page})=>{
  const failures=await boot(page);
  await finishPreferences(page);
  let accessibility=await new AxeBuilder({page}).include('.fm-next-app').withTags(['wcag2a','wcag2aa']).analyze();
  let serious=accessibility.violations.filter(item=>['serious','critical'].includes(item.impact));
  expect(serious,JSON.stringify(serious,null,2)).toEqual([]);
  await page.locator('.fm-next-match-card').first().click();
  await page.getByRole('button',{name:'참가하기'}).click();
  await expect(page.locator('[data-screen="auth"]')).toBeVisible();
  accessibility=await new AxeBuilder({page}).include('.fm-next-app').withTags(['wcag2a','wcag2aa']).analyze();
  serious=accessibility.violations.filter(item=>['serious','critical'].includes(item.impact));
  expect(serious,JSON.stringify(serious,null,2)).toEqual([]);
  expectNoFailures(failures);
});

test('case study cover leads with the user value and embeds the next app without changing the 16-section baseline',async({page})=>{
  const failures=captureFailures(page);
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelectorAll('.slide').length===16&&document.querySelector('.fm-next-cover'));
  await expect(page.locator('.slide')).toHaveCount(16);
  await expect(page.locator('.fm-next-cover')).toContainText('내 수준에 맞는 경기부터');
  await expect(page.locator('.fm-next-cover')).toContainText('Find');
  await expect(page.locator('.fm-next-cover')).toContainText('Matchday continuity');
  await expect(page.locator('.fm-next-cover-frame iframe')).toHaveAttribute('src','/next?embed=1');
  expectNoFailures(failures);
});
