const {test,expect}=require('@playwright/test');
const {aiFilters,profileSettings}=require('./helpers/priority-ux.cjs');
test('AI and manual filters retain all eligible candidates and independent reset scopes',async({page})=>{
  await aiFilters(page,async(name,element)=>expect(element).toHaveScreenshot('priority-'+name+'-390.png',{animations:'disabled',mask:[element.locator('.fm-next-match-date > span:first-child')]}));
});
test('MY distinguishes saved and current settings and returns to the editing origin',async({page})=>{
  await profileSettings(page,async(name,element)=>expect(element).toHaveScreenshot('priority-'+name+'-390.png',{animations:'disabled'}));
});
