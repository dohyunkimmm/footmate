'use strict';

const fs=require('node:fs');
const path=require('node:path');

/*
 * Read-only browser audit shared by Real App typography scenarios.
 * Geometry failures are separate from editorial review suggestions.
 */
async function inspectTypography(page,selector){
  return page.evaluate(rootSelector=>{
    const root=document.querySelector(rootSelector);
    if(!root)throw new Error('Typography QA root missing: '+rootSelector);
    const issues=[],review=[],samples=[];
    const visible=node=>{
      if(!node.getClientRects().length||node.closest('[hidden],[aria-hidden="true"],.fm-next-sr-only,.sr-only'))return false;
      const s=getComputedStyle(node),r=node.getBoundingClientRect();
      return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0;
    };
    const describe=node=>{
      const classes=typeof node.className==='string'?node.className.trim().split(/\s+/).slice(0,2).join('.'):'';
      return node.tagName.toLowerCase()+(classes?'.'+classes:'');
    };
    const nodes=[...root.querySelectorAll('h1,h2,h3,p,small,label,button,li,figcaption,.fm-next-match-place,.fm-next-match-footer small,.fm-ai-kicker,.fm-ai-guardrail')];
    for(const node of [...new Set(nodes)]){
      if(!visible(node))continue;
      const style=getComputedStyle(node),bounds=node.getBoundingClientRect();
      const text=(node.innerText||node.textContent||'').trim();
      if(!text)continue;
      const fontSize=parseFloat(style.fontSize),lineHeight=parseFloat(style.lineHeight);
      const id=describe(node)+' '+text.slice(0,48);
      const rects=[];
      const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);
      let child;
      while((child=walker.nextNode())){
        if(!child.textContent.trim()||child.parentElement?.closest('.sr-only,.fm-next-sr-only,[hidden]'))continue;
        const range=document.createRange();range.selectNodeContents(child);
        for(const rect of range.getClientRects())if(rect.width>0.5&&rect.height>0.5)rects.push(rect);
      }
      const lines=new Map();
      for(const rect of rects){
        const key=Math.round(rect.top),prev=lines.get(key)||{left:rect.left,right:rect.right};
        prev.left=Math.min(prev.left,rect.left);prev.right=Math.max(prev.right,rect.right);lines.set(key,prev);
      }
      const lineWidths=[...lines.values()].map(line=>Math.round((line.right-line.left)*100)/100);
      const minimum=node.matches('.fm-next-match-place')?16:
        node.matches('.fm-next-match-footer small,.fm-ai-kicker,.fm-ai-guardrail')?12:10;
      if(!Number.isFinite(fontSize)||fontSize<minimum-0.05)issues.push(id+': font below role minimum '+minimum+'px');
      if(Number.isFinite(lineHeight)&&lineHeight<fontSize*1.15)issues.push(id+': invalid line-height');
      const clippedX=/hidden|clip/.test(style.overflowX);
      const clippedY=/hidden|clip/.test(style.overflowY);
      for(const rect of rects){
        if((clippedX&&(rect.left<bounds.left-2||rect.right>bounds.right+2))||
           (clippedY&&(rect.top<bounds.top-2||rect.bottom>bounds.bottom+2))){
          issues.push(id+': clipped text in its own element');
          break;
        }
      }
      if((node.matches('h1,h2,h3')||node.classList.contains('fm-next-match-place'))&&lineWidths.length>1){
        const longest=Math.max(...lineWidths),last=lineWidths.at(-1);
        if(last<longest*.25)review.push({id,reason:'short final line; Korean meaning-break review',lines:lineWidths.length,lineWidths});
      }
      if(style.textOverflow==='ellipsis'||parseInt(style.webkitLineClamp,10)>0)
        review.push({id,reason:'intentional truncation; confirm important information is available'});
      samples.push({id,fontSize,lineHeight:Number.isFinite(lineHeight)?lineHeight:null,fontFamily:style.fontFamily,lines:lineWidths.length,width:Math.round(bounds.width),height:Math.round(bounds.height)});
    }
    return {root:rootSelector,viewport:innerWidth,screen:root.getAttribute('data-screen'),issues:[...new Set(issues)],review,
      samples,fonts:[...document.fonts].filter(face=>face.status==='loaded').map(face=>({family:face.family,weight:face.weight})),
      documentOverflow:document.documentElement.scrollWidth>innerWidth+1};
  },selector);
}

async function fontCoverage(page){
  return page.evaluate(async()=>{
    const faces=await Promise.all([['Inter','700','FootMate'],['Noto Sans KR','400','경기 참가'],['Noto Sans KR','700','경기 참가']].map(async ([family,weight,text])=>{
      let loaded=[];try{loaded=await document.fonts.load(weight+' 16px "'+family+'"',text);}catch{}
      return {family,weight,loaded:loaded.length>0&&loaded.every(face=>face.status==='loaded')};
    }));
    return {faces,coverage:faces.every(face=>face.loaded)?'webfonts loaded':'fallback/partial webfonts (not certified)'};
  });
}

async function applyAdaptation(page,mode){
  if(mode==='normal'||mode==='fallback')return;
  if(mode==='text-200-percent'){
    await page.locator('.fm-next-app :is(h1,h2,h3,p,small,button,label,li,span,strong)').evaluateAll(nodes=>{
      const before=nodes.filter(node=>node.getClientRects().length).map(node=>{
        const s=getComputedStyle(node);
        return {node,font:parseFloat(s.fontSize),line:parseFloat(s.lineHeight),spacing:parseFloat(s.letterSpacing)};
      });
      for(const item of before){
        if(Number.isFinite(item.font))item.node.style.setProperty('font-size',(item.font*2)+'px','important');
        if(Number.isFinite(item.line))item.node.style.setProperty('line-height',(item.line*2)+'px','important');
        if(Number.isFinite(item.spacing))item.node.style.setProperty('letter-spacing',(item.spacing*2)+'px','important');
      }
    });
    return;
  }
  if(mode==='user-text-spacing'){
    await page.addStyleTag({content:'.fm-next-app :is(h1,h2,h3,p,small,button,label,li,span,strong){line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}.fm-next-app p{margin-bottom:2em!important}'});
    return;
  }
  throw new Error('Unknown typography adaptation: '+mode);
}

async function recordEvidence(page,testInfo,data,{screenshot=false}={}){
  const file=testInfo.outputPath('typography-qa.json');
  fs.mkdirSync(path.dirname(file),{recursive:true});
  fs.writeFileSync(file,JSON.stringify({schema:1,test:testInfo.title,project:testInfo.project.name,...data},null,2)+'\n');
  await testInfo.attach('typography-qa',{path:file,contentType:'application/json'});
  if(screenshot){
    const fileName='typography-'+String(data.mode||'normal')+'.png';
    await testInfo.attach('typography-screen',{body:await page.screenshot({animations:'disabled'}),contentType:'image/png',name:fileName});
  }
}

module.exports={inspectTypography,fontCoverage,applyAdaptation,recordEvidence};
