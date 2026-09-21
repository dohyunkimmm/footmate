const {test,expect}=require('@playwright/test');

async function openCaseStudy(page,width=1440,height=900){
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

test('all 16 Case Study sections pass full structured layout audit',async({page})=>{
  const widths=[1440,1180,900,430,390,375,320];
  for(const width of widths){
    await openCaseStudy(page,width,width<=430?844:900);
    for(let index=0;index<16;index+=1){
      await goToSlide(page,index);
      const audit=await page.locator('.slide.on').evaluate(slide=>{
        const visible=el=>{
          const style=getComputedStyle(el);
          const rect=el.getBoundingClientRect();
          return style.display!=='none'&&style.visibility!=='hidden'&&rect.width>0&&rect.height>0;
        };
        const textOf=el=>(el.textContent||'').trim().replace(/\s+/g,' ').slice(0,100);
        const hasDirectText=el=>[...el.childNodes].some(node=>node.nodeType===Node.TEXT_NODE&&/[0-9A-Za-z가-힣]/.test(node.nodeValue||''));
        const scope=[slide.querySelector('.fm-next-cover-copy'),slide.querySelector('.fm-next-story')].filter(Boolean);
        const allElements=[];
        for(const root of scope){
          if(visible(root))allElements.push(root);
          for(const el of root.querySelectorAll('*'))if(visible(el))allElements.push(el);
        }
        const structuralRoots=allElements.filter(el=>el.matches('.fm-next-cover-proof,[class*="fm-next-cs-"]'));
        const surfaceCells=allElements.filter(el=>{
          if(['A','BUTTON','I','IFRAME'].includes(el.tagName))return false;
          const text=textOf(el);
          if(!/[0-9A-Za-z가-힣]/.test(text))return false;
          const style=getComputedStyle(el);
          const rect=el.getBoundingClientRect();
          const border=Math.max(parseFloat(style.borderTopWidth)||0,parseFloat(style.borderRightWidth)||0,parseFloat(style.borderBottomWidth)||0,parseFloat(style.borderLeftWidth)||0);
          const radius=parseFloat(style.borderRadius)||0;
          const background=style.backgroundColor;
          const hasSurface=border>0||radius>=8||(background&&background!=='rgba(0, 0, 0, 0)'&&background!=='transparent');
          return hasSurface&&rect.width>=90;
        });

        const textElements=new Set();
        for(const root of structuralRoots){
          if(root.matches('p,small,span,b,strong,h3,a')||hasDirectText(root))textElements.add(root);
          for(const el of root.querySelectorAll('p,small,span,b,strong,h3,a'))if(visible(el))textElements.add(el);
        }
        const smallText=[];
        for(const el of textElements){
          const text=textOf(el);
          if(!/[0-9A-Za-z가-힣]/.test(text))continue;
          const style=getComputedStyle(el);
          const size=parseFloat(style.fontSize);
          const rect=el.getBoundingClientRect();
          const radius=parseFloat(style.borderRadius)||0;
          const isPill=radius>=999||(rect.height<=34&&['B','SPAN'].includes(el.tagName));
          let min=11;
          if(el.tagName==='P'||(hasDirectText(el)&&el.tagName==='DIV'))min=13;
          else if(el.tagName==='H3')min=14;
          else if(['B','STRONG'].includes(el.tagName)&&!isPill)min=12;
          if(Number.isFinite(size)&&size+0.01<min)smallText.push({tag:el.tagName,className:el.className||'',text,size,min});
        }

        const wordSplits=[];
        const walker=document.createTreeWalker(slide,NodeFilter.SHOW_TEXT);
        while(walker.nextNode()){
          const node=walker.currentNode;
          const parent=node.parentElement;
          if(!parent||!visible(parent))continue;
          const value=node.nodeValue||'';
          for(const match of value.matchAll(/[가-힣]{2,}/g)){
            const start=match.index||0;
            const word=match[0];
            let previousTop=null;
            for(let offset=0;offset<word.length;offset+=1){
              const range=document.createRange();
              range.setStart(node,start+offset);
              range.setEnd(node,start+offset+1);
              const rect=range.getBoundingClientRect();
              if(rect.width<=0||rect.height<=0)continue;
              if(previousTop!==null&&Math.abs(rect.top-previousTop)>2){
                wordSplits.push({word,parent:parent.className||parent.tagName});
                break;
              }
              previousTop=rect.top;
            }
          }
        }

        const tightPadding=[];
        for(const el of surfaceCells){
          const style=getComputedStyle(el);
          const rect=el.getBoundingClientRect();
          const radius=parseFloat(style.borderRadius)||0;
          const isPill=radius>=999||rect.height<=40;
          if(isPill)continue;
          const vertical=Math.min(parseFloat(style.paddingTop)||0,parseFloat(style.paddingBottom)||0);
          const horizontal=Math.min(parseFloat(style.paddingLeft)||0,parseFloat(style.paddingRight)||0);
          const roomy=rect.height>=58;
          const minVertical=roomy?14:11;
          const minHorizontal=roomy?14:12;
          if(vertical+0.01<minVertical||horizontal+0.01<minHorizontal){
            tightPadding.push({className:el.className||el.tagName,text:textOf(el),vertical,horizontal,min:`${minVertical}px vertical / ${minHorizontal}px horizontal`});
          }
        }

        const tightGaps=[];
        for(const el of structuralRoots){
          const style=getComputedStyle(el);
          if(!['grid','flex','inline-flex'].includes(style.display))continue;
          const children=[...el.children].filter(child=>visible(child));
          if(children.length<2)continue;
          const rowGap=parseFloat(style.rowGap)||0;
          const columnGap=parseFloat(style.columnGap)||0;
          const usedGap=Math.min(rowGap,columnGap);
          const min=style.display==='grid'?10:8;
          if(usedGap+0.01<min)tightGaps.push({className:el.className||el.tagName,gap:usedGap,min});
        }

        const overflow=[];
        const clipping=[];
        const layoutCandidates=[...new Set([...structuralRoots,...surfaceCells])];
        for(const el of layoutCandidates){
          const style=getComputedStyle(el);
          const xOverflow=el.scrollWidth-el.clientWidth;
          if(xOverflow>1)overflow.push({className:el.className||el.tagName,text:textOf(el),xOverflow});
          const yOverflow=el.scrollHeight-el.clientHeight;
          if(yOverflow>1&&['hidden','clip'].includes(style.overflowY))clipping.push({className:el.className||el.tagName,text:textOf(el),yOverflow});
        }

        return {
          structuralRootCount:structuralRoots.length,
          surfaceCellCount:surfaceCells.length,
          auditedTextCount:textElements.size,
          documentOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
          smallText,
          wordSplits,
          tightPadding,
          tightGaps,
          overflow,
          clipping
        };
      });

      expect(audit.structuralRootCount,`structured coverage at ${width}px P${index+1}`).toBeGreaterThan(0);
      expect(audit.surfaceCellCount,`cell coverage at ${width}px P${index+1}`).toBeGreaterThan(0);
      expect(audit.auditedTextCount,`text coverage at ${width}px P${index+1}`).toBeGreaterThan(0);
      expect(audit.documentOverflow,`document overflow at ${width}px P${index+1}`).toBeLessThanOrEqual(1);
      expect(audit.smallText,`small structured text at ${width}px P${index+1}`).toEqual([]);
      expect(audit.wordSplits,`Korean word split at ${width}px P${index+1}`).toEqual([]);
      expect(audit.tightPadding,`tight structured padding at ${width}px P${index+1}`).toEqual([]);
      expect(audit.tightGaps,`tight structured gap at ${width}px P${index+1}`).toEqual([]);
      expect(audit.overflow,`structured horizontal overflow at ${width}px P${index+1}`).toEqual([]);
      expect(audit.clipping,`structured vertical clipping at ${width}px P${index+1}`).toEqual([]);
    }
  }

  await openCaseStudy(page,1440,900);
  await goToSlide(page,0);
  await expect(page.locator('.fm-next-cover-proof>div')).toHaveCount(3);

  await goToSlide(page,2);
  const risk=page.locator('.fm-next-cs-persona b').filter({hasText:'경기 당일 변수'});
  await expect(risk).toHaveCount(1);
  await expect(risk).toHaveCSS('word-break','keep-all');
});
