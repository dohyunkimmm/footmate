const {test,expect}=require('@playwright/test');

const STORAGE_COPY='저장한 설정은 이 브라우저에만 저장되며 다른 기기와 동기화되지 않습니다.';

test('Real App MY shows simplified local storage notice',async({page})=>{
  await page.goto('/demo?resume=1');
  await page.evaluate(()=>localStorage.setItem('footmate:v4:session',JSON.stringify({route:'profile',setupComplete:true,userName:'도현',region:'성수',position:'FW',level:'중급'})));
  await page.reload();
  const boundary=page.locator('[data-screen="profile"] .fm-personalization-boundary');
  await expect(boundary).toHaveText(STORAGE_COPY);
});
