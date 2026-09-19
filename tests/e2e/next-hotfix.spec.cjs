const {test,expect}=require('@playwright/test');

function captureFailures(page){
  const failures=[];
  page.on('pageerror',error=>failures.push(`pageerror: ${error.message}`));
  page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('Failed to load resource'))failures.push(`console.error: ${message.text()}`)});
  return failures;
}

async function boot(page,path='/next'){
  const failures=captureFailures(page);
  await page.goto(path,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#footmate-next [data-screen]');
  return failures;
}

async function finishPreferences(page){
  await page.getByRole('button',{name:/내 경기 찾아보기/}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:/추천 경기 보기/}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
}

async function openAuth(page){
  await finishPreferences(page);
  await page.locator('.fm-next-match-card').first().click();
  await page.getByRole('button',{name:'참가하기'}).click();
  await expect(page.locator('[data-screen="auth"]')).toBeVisible();
}

test.beforeEach(async({page})=>{
  await page.goto('/next',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>localStorage.clear());
});

test('guest identity does not expose the portfolio author name before sign in',async({page})=>{
  const failures=await boot(page);
  await finishPreferences(page);
  await expect(page.locator('[data-screen="home"] .fm-next-greeting')).not.toContainText('도현');
  await page.getByRole('button',{name:'내 정보'}).click();
  await expect(page.locator('[data-screen="profile"] .fm-next-profile-head')).toContainText('게스트');
  await expect(page.locator('[data-screen="profile"] .fm-next-profile-head')).not.toContainText('도현');
  expect(failures).toEqual([]);
});

test('account sign in blocks empty and malformed credentials before checkout',async({page})=>{
  const failures=await boot(page);
  await openAuth(page);
  await page.getByRole('button',{name:'로그인'}).click();
  await expect(page.locator('[data-screen="auth"]')).toBeVisible();
  await expect(page.locator('.fm-auth-error')).toHaveCount(2);
  await page.getByRole('textbox',{name:'아이디 또는 이메일'}).fill('wrong@email');
  await page.getByLabel('비밀번호',{exact:true}).fill('123');
  await page.getByRole('button',{name:'로그인'}).click();
  await expect(page.locator('[data-screen="auth"]')).toBeVisible();
  await expect(page.getByText('이메일 형식을 확인해주세요.')).toBeVisible();
  await expect(page.getByText('비밀번호는 8자 이상 입력해주세요.')).toBeVisible();
  await page.getByRole('textbox',{name:'아이디 또는 이메일'}).fill('member@example.com');
  await page.getByLabel('비밀번호',{exact:true}).fill('password123!');
  await page.getByRole('button',{name:'로그인'}).click();
  await expect(page.locator('[data-screen="checkout"]')).toBeVisible();
  expect(failures).toEqual([]);
});

test('sign up validates account fields as well as required consent',async({page})=>{
  const failures=await boot(page);
  await openAuth(page);
  await page.getByRole('button',{name:'회원가입'}).click();
  await page.getByText('모두 동의합니다.').click();
  const submit=page.getByRole('button',{name:'가입하고 계속'});
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page.locator('[data-screen="auth"]')).toBeVisible();
  await expect(page.locator('.fm-auth-error')).toHaveCount(3);
  await page.getByRole('textbox',{name:'회원가입 아이디'}).fill('player01');
  await page.getByLabel('회원가입 비밀번호').fill('Footmate1!');
  await page.getByRole('textbox',{name:'회원가입 이메일'}).fill('player@example.com');
  await submit.click();
  await expect(page.locator('[data-screen="checkout"]')).toBeVisible();
  expect(failures).toEqual([]);
});

test('detail back returns to the surface the match was opened from',async({page})=>{
  const failures=await boot(page);
  await finishPreferences(page);
  await page.locator('.fm-next-match-card').first().click();
  await expect(page.locator('[data-screen="detail"]')).toBeVisible();
  await page.getByRole('button',{name:'이전 화면'}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
  await page.getByRole('button',{name:'전체 보기'}).click();
  await page.locator('.fm-next-match-card').first().click();
  await page.getByRole('button',{name:'이전 화면'}).click();
  await expect(page.locator('[data-screen="discover"]')).toBeVisible();
  expect(failures).toEqual([]);
});

test('matchday check in becomes a persistent completed state',async({page})=>{
  const failures=await boot(page,'/next?mode=evidence');
  await page.getByRole('button',{name:'경기 당일'}).click();
  await expect(page.getByRole('button',{name:'체크인하기'})).toBeVisible();
  await page.getByRole('button',{name:'체크인하기'}).click();
  await expect(page.getByRole('button',{name:'체크인 완료'})).toBeDisabled();
  await expect(page.getByText('체크인이 완료됐어요.')).toBeVisible();
  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'경기 당일'}).click();
  await expect(page.getByRole('button',{name:'체크인 완료'})).toBeDisabled();
  expect(failures).toEqual([]);
});
