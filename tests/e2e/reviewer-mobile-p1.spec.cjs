const {test,expect}=require('@playwright/test');

for(const width of [320,375,390,430]){
  test('guided reviewer quick access works at '+width+'px',async({page})=>{
    await page.setViewportSize({width,height:844});
    await page.goto('/prototype?mode=guided');
    const guide=page.getByRole('complementary',{name:'Case Study Guide'});
    await expect(guide).toBeVisible();
    for(const name of ['추천 바로 보기','두 경기 비교','마감 포지션','MY 미리보기']){
      await expect(guide.getByRole('button',{name})).toBeVisible();
    }

    await guide.getByRole('button',{name:'추천 바로 보기'}).click();
    await expect(page.locator('[data-screen="home"]')).toBeVisible();
    await expect(page.locator('.fm-next-stage')).toBeInViewport();

    await guide.getByRole('button',{name:'두 경기 비교'}).click();
    await expect(page.getByRole('dialog',{name:'두 경기 비교'})).toBeVisible();
    await page.getByRole('button',{name:'경기 비교 닫기'}).click();

    await guide.getByRole('button',{name:'마감 포지션'}).click();
    await expect(page.locator('[data-screen="detail"] [data-position="MF"]')).toBeDisabled();

    await guide.getByRole('button',{name:'MY 미리보기'}).click();
    await expect(page.locator('[data-screen="profile"]')).toBeVisible();
    await expect(page.locator('.fm-next-stage')).toBeInViewport();

    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}
