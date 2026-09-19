(function(){
'use strict';
function enhance(){
  if(document.getElementById('fmReleaseVersionBadge'))return;
  const cover=document.querySelector('.slide[data-i="0"] .cover');
  if(cover){
    const badge=document.createElement('div');
    badge.id='fmReleaseVersionBadge';
    badge.setAttribute('aria-label','FootMate v2.8.0 Visual Identity');
    badge.style.cssText='display:inline-flex;align-items:center;gap:8px;margin:0 auto 14px;padding:7px 12px;border-radius:999px;border:1px solid rgba(211,243,107,.26);background:rgba(22,91,64,.18);color:#E9F9B1;font:900 9px/1.2 Inter,sans-serif;letter-spacing:.13em;';
    badge.innerHTML='<span style="width:7px;height:7px;border-radius:50%;background:#D3F36B;box-shadow:0 0 12px rgba(211,243,107,.55)"></span>V2.8 · VISUAL IDENTITY';
    cover.insertBefore(badge,cover.firstChild);
  }

  const validation=document.querySelector('.slide[data-i="14"] .content');
  if(validation&&!document.getElementById('fmReleaseExperienceNote')){
    const note=document.createElement('div');
    note.id='fmReleaseExperienceNote';
    note.style.cssText='margin-top:14px;padding:14px 16px;border-radius:14px;border:1px solid rgba(211,243,107,.16);background:linear-gradient(135deg,rgba(22,91,64,.18),rgba(36,88,166,.05));color:#AABDB3;font-size:11px;line-height:1.65;';
    note.innerHTML='<b style="display:block;margin-bottom:5px;color:#F2F8F4;font-size:12px">v2.8.0 Visual Identity</b>v2.7 Visual Experience를 회귀 기준으로 유지하면서 FootMate만의 matchday visual identity를 추가했습니다. Home hero, Filter setup, Results recommendation ticket, Detail match preview, Payment guard를 pitch green·lime accent·matchday motion 체계로 연결하고 <code>visual-tokens.css</code>, <code>visual-identity.css</code>, <code>visual-identity-experience.js</code>로 ownership을 분리했습니다. Matching/ELO·Decision·Payment semantics와 39-screen Product·16-slide Case Study 구조는 그대로 유지합니다.';
    validation.appendChild(note);
  }

  const demoSlide=document.querySelector('.demo-showcase-slide .showcase-copy');
  if(demoSlide&&!document.getElementById('fmReleaseDemoPill')){
    const pill=document.createElement('div');
    pill.id='fmReleaseDemoPill';
    pill.style.cssText='display:inline-flex;margin-bottom:10px;padding:6px 10px;border-radius:999px;border:1px solid rgba(211,243,107,.22);background:rgba(22,91,64,.16);color:#E4F5A5;font:900 9px/1.2 Inter,sans-serif;letter-spacing:.08em;';
    pill.textContent='V2.8 MATCHDAY IDENTITY · RECOMMENDATION TICKETS · MOTION SYSTEM';
    demoSlide.insertBefore(pill,demoSlide.firstChild);
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance,{once:true});else enhance();
})();
