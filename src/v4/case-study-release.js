/* FootMate v4.0 Case Study public-release overlay. */
(function(){
  function apply(){
    document.documentElement.dataset.fmNextCaseStudy='true';
    const root=document;
    root.querySelectorAll('a[href^="/next"]').forEach(a=>{a.href=a.getAttribute('href').replace(/^\/next/,'/app')});
    root.querySelectorAll('iframe[src^="/next"]').forEach(frame=>{frame.src=frame.getAttribute('src').replace(/^\/next/,'/app')});
    const note=root.querySelector('.fm-next-cover-note');
    if(note)note.innerHTML='v4.0.0 · Official Major Release<br>Matchday Companion';
    const sub=root.querySelector('.sb-sub');
    if(sub)sub.textContent='v4.0 · 16 sections';
    const top=root.querySelector('.topbar-title');
    if(top)top.textContent='FootMate v4.0 · Matchday Companion Case Study';
    root.querySelectorAll('.fm-next-cs-note').forEach(el=>{
      if(el.textContent.includes('기존 v3.0 /demo'))el.textContent='Pre-v4 구현은 공개 제품 경로에서 제거하고 회귀 참고 이력으로만 유지합니다. 현재 사용자·리뷰어 동선은 v4.0을 기준으로 합니다.';
      if(el.textContent.includes('v2.4~v3.0'))el.textContent='v4.0 새 스펙의 사용자 흐름·상태·접근성·반응형·Production 검증을 릴리스 게이트로 사용합니다.';
    });
    root.querySelectorAll('.fm-next-story-kicker,.fm-next-cover-kicker,.fm-next-final,.fm-next-cs-final').forEach(el=>{
      if(el.innerHTML.includes('Next Major'))el.innerHTML=el.innerHTML.replaceAll('Next Major','v4.0');
    });
    root.querySelectorAll('a').forEach(a=>{
      if(a.textContent.includes('FootMate Next'))a.textContent=a.textContent.replace('FootMate Next','FootMate v4.0');
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{apply();setTimeout(apply,80)},{once:true});
  else{apply();setTimeout(apply,80)}
})();
