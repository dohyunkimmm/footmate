const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;

function captureFailures(page){
  const failures=[];
  page.on('pageerror',error=>failures.push(`pageerror: ${error.message}`));
  page.on('console',message=>{
    if(message.type()==='error'&&!message.text().includes('Failed to load resource')){
      failures.push(`console.error: ${message.text()}`);
    }
  });
  return failures;
}

async function openCaseStudy(page,width,height=900){
  const failures=captureFailures(page);
  await page.setViewportSize({width,height});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelectorAll('.slide').length===16&&document.querySelector('.fm-next-cover'));
  return failures;
}

async function goToSlide(page,index){
  await page.evaluate(i=>window.goTo(i),index);
  await page.waitForTimeout(25);
  await expect(page.locator('.slide.on')).toHaveCount(1);
}

async function activeSlideMetrics(page){
  return page.locator('.slide.on').evaluate(slide=>{
    const viewportWidth=document.documentElement.clientWidth;
    const docOverflow=document.documentElement.scrollWidth-viewportWidth;
    const slideOverflow=slide.scrollWidth-slide.clientWidth;
    const selectors=[
      '.fm-next-cover h1',
      '.fm-next-cover-title-line',
      '.fm-next-cover-lead',
      '.fm-next-story h2',
      '.fm-next-story-lead',
      '.fm-next-cs-card h3',
      '.fm-next-cs-card p',
      '.fm-next-cs-note',
      '.fm-next-cs-scope',
      '.fm-next-cs-decision',
      '.fm-next-cs-before-after b',
      '.fm-next-cs-auth-flow b',
      '.fm-next-cs-modes h3'
    ];
    const textOverflow=[];
    slide.querySelectorAll(selectors.join(',')).forEach(el=>{
      const rect=el.getBoundingClientRect();
      if(el.scrollWidth-el.clientWidth>1||rect.right>viewportWidth+1||rect.left<-1){
        textOverflow.push(el.textContent.trim().replace(/\s+/g,' ').slice(0,100));
      }
    });

    function lineWidths(el){
      const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
      const lines=new Map();
      while(walker.nextNode()){
        const node=walker.currentNode;
        for(let i=0;i<node.data.length;i+=1){
          if(/\s/.test(node.data[i]))continue;
          const range=document.createRange();
          range.setStart(node,i);
          range.setEnd(node,i+1);
          const rect=range.getBoundingClientRect();
          if(!rect.width||!rect.height)continue;
          const key=Math.round(rect.top*2)/2;
          const current=lines.get(key)||{left:rect.left,right:rect.right};
          current.left=Math.min(current.left,rect.left);
          current.right=Math.max(current.right,rect.right);
          lines.set(key,current);
        }
      }
      return [...lines.values()].map(line=>line.right-line.left);
    }

    const orphanHeadings=[];
    slide.querySelectorAll('.fm-next-story h2,.fm-next-cover-title-line').forEach(el=>{
      const widths=lineWidths(el);
      if(widths.length<2)return;
      const max=Math.max(...widths);
      const last=widths[widths.length-1];
      if(max>0&&last/max<0.22){
        orphanHeadings.push({text:el.textContent.trim(),widths});
      }
    });

    return {docOverflow,slideOverflow,textOverflow,orphanHeadings};
  });
}

test('Case Study editorial source renders as official v4 copy',async({page})=>{
  const failures=await openCaseStudy(page,1440,900);
  const body=(await page.locator('body').innerText()).replace(/\s+/g,' ');
  for(const forbidden of ['Next Major','next major candidate','v3.0 stable','기존 v3.0','v2.4~v3.0','stable required check key','legacy screen visual parity']){
    expect(body).not.toContain(forbidden);
  }
  await expect(page.locator('.fm-next-cover-frame iframe')).toHaveAttribute('src','/app?embed=1');
  await expect(page.locator('.fm-next-cover-note')).toContainText('v4.0.0');
  await expect(page.getByText('실제 OAuth, 회원 DB, 서버 인증 세션은 연결하지 않은 UX 시뮬레이션입니다.')).toHaveCount(1);
  expect(failures).toEqual([]);
});

test('all 16 Case Study sections stay readable at supported mobile widths',async({page})=>{
  for(const width of [320,375,390,430]){
    const failures=await openCaseStudy(page,width,844);
    for(let index=0;index<16;index+=1){
      await goToSlide(page,index);
      const metrics=await activeSlideMetrics(page);
      expect(metrics.docOverflow,`document overflow at ${width}px slide ${index+1}`).toBeLessThanOrEqual(1);
      expect(metrics.slideOverflow,`slide overflow at ${width}px slide ${index+1}`).toBeLessThanOrEqual(1);
      expect(metrics.textOverflow,`text overflow at ${width}px slide ${index+1}`).toEqual([]);
      expect(metrics.orphanHeadings,`short dangling heading line at ${width}px slide ${index+1}`).toEqual([]);
      if(width===390){
        await page.screenshot({path:`test-results/editorial/case-study-390-${String(index+1).padStart(2,'0')}.png`,fullPage:true});
      }
    }
    expect(failures).toEqual([]);
  }
});

test('Case Study desktop sections have no overflow and produce review screenshots',async({page})=>{
  const failures=await openCaseStudy(page,1440,900);
  for(let index=0;index<16;index+=1){
    await goToSlide(page,index);
    const metrics=await activeSlideMetrics(page);
    expect(metrics.docOverflow,`desktop document overflow slide ${index+1}`).toBeLessThanOrEqual(1);
    expect(metrics.textOverflow,`desktop text overflow slide ${index+1}`).toEqual([]);
    await page.screenshot({path:`test-results/editorial/case-study-desktop-${String(index+1).padStart(2,'0')}.png`,fullPage:true});
  }
  expect(failures).toEqual([]);
});

test('Case Study has no serious or critical axe violations',async({page})=>{
  const failures=await openCaseStudy(page,390,844);
  await goToSlide(page,0);
  const mobile=await new AxeBuilder({page}).include('body').withTags(['wcag2a','wcag2aa']).analyze();
  expect(mobile.violations.filter(v=>['serious','critical'].includes(v.impact))).toEqual([]);
  await page.setViewportSize({width:1440,height:900});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelectorAll('.slide').length===16&&document.querySelector('.fm-next-cover'));
  const desktop=await new AxeBuilder({page}).include('body').withTags(['wcag2a','wcag2aa']).analyze();
  expect(desktop.violations.filter(v=>['serious','critical'].includes(v.impact))).toEqual([]);
  expect(failures).toEqual([]);
});
