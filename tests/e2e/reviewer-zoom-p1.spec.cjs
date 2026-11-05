const {test,expect}=require('@playwright/test');

// An effective 720-CSS-pixel layout is the reflow equivalent of
// a 1440-physical-pixel desktop browser at 200% zoom.
// This checks responsive reflow; it is not native browser zoom or a physical device test.
async function expectNoPageOverflow(page){
  const widths=await page.evaluate(()=>({
    viewport:document.documentElement.clientWidth,
    document:document.documentElement.scrollWidth,
    body:document.body.scrollWidth
  }));
  expect(widths.document).toBeLessThanOrEqual(widths.viewport+1);
  expect(widths.body).toBeLessThanOrEqual(widths.viewport+1);
}

test('P1 200%-effective desktop zoom retains all four guided reviewer actions',async({page})=>{
  await page.setViewportSize({width:720,height:800});
  await page.goto('/prototype?mode=guided');
  const guide=page.getByRole('complementary',{name:'Case Study Guide'});
  await expect(guide).toBeVisible();
  for(const name of ['추천 바로 보기','두 경기 비교','마감 포지션','MY 미리보기']){
    await expect(guide.getByRole('button',{name})).toBeVisible();
  }
  await expectNoPageOverflow(page);
  await guide.getByRole('button',{name:'추천 바로 보기'}).click();
  await expect(page.locator('[data-screen="home"]')).toBeVisible();
  await guide.getByRole('button',{name:'두 경기 비교'}).click();
  await expect(page.getByRole('dialog',{name:'두 경기 비교'})).toBeVisible();
  await page.getByRole('button',{name:'경기 비교 닫기'}).click();
  await guide.getByRole('button',{name:'마감 포지션'}).click();
  await expect(page.locator('[data-screen="detail"] [data-position="MF"]')).toBeDisabled();
  await guide.getByRole('button',{name:'MY 미리보기'}).click();
  await expect(page.locator('[data-screen="profile"]')).toBeVisible();
  await expectNoPageOverflow(page);
});

test('P1 mobile-device emulation retains guided compare and MY navigation',async({page})=>{
  await page.goto('/prototype?mode=guided');
  const guide=page.getByRole('complementary',{name:'Case Study Guide'});
  await expect(guide).toBeVisible();
  await expect(guide.getByRole('button',{name:'추천 바로 보기'})).toBeVisible();
  await expect(guide.getByRole('button',{name:'두 경기 비교'})).toBeVisible();
  await expect(guide.getByRole('button',{name:'마감 포지션'})).toBeVisible();
  await expect(guide.getByRole('button',{name:'MY 미리보기'})).toBeVisible();
  await guide.getByRole('button',{name:'두 경기 비교'}).click();
  const comparison=page.getByRole('dialog',{name:'두 경기 비교'});
  await expect(comparison).toBeVisible();
  await page.getByRole('button',{name:'경기 비교 닫기'}).click();
  await expect(comparison).toBeHidden();
  await guide.getByRole('button',{name:'MY 미리보기'}).click();
  await expect(page.locator('[data-screen="profile"]')).toBeVisible();
  await expectNoPageOverflow(page);
});
