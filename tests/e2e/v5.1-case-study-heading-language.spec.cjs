const {test,expect}=require('@playwright/test');

const headings=[
  'Choosing one match still takes too many separate checks.',
  'After work, choose a nearby match without overthinking it.',
  'Build one continuous decision flow instead of adding more features.',
  'Show recommendation value before asking for an account.',
  'Remember useful preferences without replacing explainable ranking.',
  'Design match detail around the participation decision.',
  'Preserve the chosen match through authentication and participation.',
  'Let the current match state reshape the home priority.',
  'Preserve context first, then offer the next action.',
  'Separate state ownership, provider boundaries, and AI authority.',
  'Keep automated QA, human verification, and AI-assisted review separate.',
  'Only describe capabilities that are actually connected and verified.'
];

test('story headings are English while reader-facing body copy stays Korean-first',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>
    document.documentElement.dataset.footmateCaseStudyRelease==='5.1.1'&&
    document.documentElement.dataset.footmateCaseStudySections==='13'&&
    document.documentElement.dataset.footmateCaseStudyHeadingLanguage==='en'
  );

  const titles=await page.locator('.slide:not([hidden]) .fm-next-story h2').allTextContents();
  expect(titles).toEqual(headings);

  const leads=await page.locator('.slide:not([hidden]) .fm-next-story-lead').allTextContents();
  expect(leads).toHaveLength(12);
  expect(leads.every(text=>/[가-힣]/.test(text))).toBe(true);

  const cover=await page.locator('.slide:not([hidden])').first().innerText();
  expect(cover).toMatch(/[가-힣]/);
  await expect(page.locator('html')).toHaveAttribute('lang','ko');
});
