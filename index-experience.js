(function(){
'use strict';
function enhance(){
  if(document.getElementById('fmReleaseVersionBadge'))return;
  const cover=document.querySelector('.slide[data-i="0"] .cover');
  if(cover){
    const badge=document.createElement('div');
    badge.id='fmReleaseVersionBadge';
    badge.setAttribute('aria-label','FootMate v3.0.0 Unified App Architecture');
    badge.style.cssText='display:inline-flex;align-items:center;gap:8px;margin:0 auto 14px;padding:7px 12px;border-radius:999px;border:1px solid rgba(211,243,107,.26);background:rgba(22,91,64,.18);color:#E9F9B1;font:900 9px/1.2 Inter,sans-serif;letter-spacing:.13em;';
    badge.innerHTML='<span style="width:7px;height:7px;border-radius:50%;background:#D3F36B;box-shadow:0 0 12px rgba(211,243,107,.55)"></span>V3.0 · UNIFIED APP ARCHITECTURE';
    cover.insertBefore(badge,cover.firstChild);
  }

  const validation=document.querySelector('.slide[data-i="14"] .content');
  if(validation&&!document.getElementById('fmReleaseExperienceNote')){
    const note=document.createElement('div');
    note.id='fmReleaseExperienceNote';
    note.style.cssText='margin-top:14px;padding:14px 16px;border-radius:14px;border:1px solid rgba(211,243,107,.16);background:linear-gradient(135deg,rgba(22,91,64,.18),rgba(36,88,166,.05));color:#AABDB3;font-size:11px;line-height:1.65;';
    note.innerHTML='<b style="display:block;margin-bottom:5px;color:#F2F8F4;font-size:12px">v3.0.0 Unified App Architecture</b>검증된 v2.8 Matchday Visual Identity를 회귀 기준으로 유지하면서 39개 compatibility route를 4개 primary destination(탐색·추천·참가·내 정보)으로 재구성했습니다. 데스크톱은 phone mock에서 app rail + responsive workspace로 전환하고 <code>src/v3/app-shell.js</code>, <code>src/v3/ia</code>, <code>src/v3/components</code>, <code>src/v3/state</code>로 app chrome·IA·view state ownership을 분리했습니다. Matching/ELO·Decision·Payment·Persistence semantics와 2.1.0 데이터 계약은 유지합니다.';
    validation.appendChild(note);
  }

  const demoSlide=document.querySelector('.demo-showcase-slide .showcase-copy');
  if(demoSlide&&!document.getElementById('fmReleaseDemoPill')){
    const pill=document.createElement('div');
    pill.id='fmReleaseDemoPill';
    pill.style.cssText='display:inline-flex;margin-bottom:10px;padding:6px 10px;border-radius:999px;border:1px solid rgba(211,243,107,.22);background:rgba(22,91,64,.16);color:#E4F5A5;font:900 9px/1.2 Inter,sans-serif;letter-spacing:.08em;';
    pill.textContent='V3.0 APP SHELL · 4 PRIMARY DESTINATIONS · RESPONSIVE WORKSPACE';
    demoSlide.insertBefore(pill,demoSlide.firstChild);
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance,{once:true});else enhance();
})();
