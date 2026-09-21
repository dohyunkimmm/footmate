const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;

function captureFailures(page){
  const failures=[];
  page.on('pageerror',error=>failures.push(`pageerror: ${error.message}`));
  page.on('console',message=>{
    if(message.type()==='error'&&!message.text().includes('Failed to load resource'))failures.push(`console.error: ${message.text()}`);
  });
  return failures;
}

async function openCaseStudy(page,width,height){
  await page.setViewportSize({width,height});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.footmateCaseStudyRelease==='5.1.1'&&document.querySelectorAll('.slide').length===16);
}

async function goToSlide(page,index){
  await page.evaluate(i=>{
    if(typeof window.goTo==='function')window.goTo(i);
    else document.querySelectorAll('.toc-item')[i]?.click();
  },index);
  await expect(page.locator('.slide.on')).toHaveCount(1);
}

async function seriousOrCritical(page){
  const result=await new AxeBuilder({page}).include('body').withTags(['wcag2a','wcag2aa']).analyze();
  return result.violations.filter(item=>['serious','critical'].includes(item.impact));
}

test('all 16 Case Study sections have no serious or critical axe violations at mobile and desktop',async({page})=>{
  const failures=captureFailures(page);
  for(const viewport of [{width:390,height:844},{width:1440,height:900}]){
    await openCaseStudy(page,viewport.width,viewport.height);
    for(let index=0;index<16;index+=1){
      await goToSlide(page,index);
      expect(await seriousOrCritical(page),`${viewport.width}px P${index+1} axe violations`).toEqual([]);
    }
  }
  expect(failures).toEqual([]);
});
