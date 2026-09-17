(function(){
'use strict';
function enhance(){
  if(document.getElementById('fmV11VersionBadge'))return;
  const cover=document.querySelector('.slide[data-i="0"] .cover');
  if(cover){
    const badge=document.createElement('div');
    badge.id='fmV11VersionBadge';
    badge.setAttribute('aria-label','FootMate v1.1 Experience Polish');
    badge.style.cssText='display:inline-flex;align-items:center;gap:8px;margin:0 auto 14px;padding:7px 12px;border-radius:999px;border:1px solid rgba(110,167,255,.25);background:rgba(110,167,255,.08);color:#B7D3FF;font:900 9px/1.2 Inter,sans-serif;letter-spacing:.13em;';
    badge.innerHTML='<span style="width:7px;height:7px;border-radius:50%;background:#63E8D5;box-shadow:0 0 12px rgba(99,232,213,.6)"></span>V1.1 · EXPERIENCE POLISH';
    cover.insertBefore(badge,cover.firstChild);
  }

  const validation=document.querySelector('.slide[data-i="18"] .content');
  if(validation&&!document.getElementById('fmV11ExperienceNote')){
    const note=document.createElement('div');
    note.id='fmV11ExperienceNote';
    note.style.cssText='margin-top:14px;padding:14px 16px;border-radius:14px;border:1px solid rgba(110,167,255,.18);background:linear-gradient(135deg,rgba(110,167,255,.08),rgba(124,108,242,.05));color:#9FB3CC;font-size:11px;line-height:1.65;';
    note.innerHTML='<b style="display:block;margin-bottom:5px;color:#EAF3FF;font-size:12px">v1.1 Experience Polish</b>기능 범위를 늘리기보다 Design System, 정보 위계, touch target, 상태 피드백, 반응형 검증을 정리해 기존 39개 화면의 제품 경험을 고도화합니다. 이전 Portfolio Freeze는 2026-09-12 검증 snapshot으로 보존하고, 현재 버전은 별도 검증 기준으로 관리합니다.';
    validation.appendChild(note);
  }

  const demoSlide=document.querySelector('.demo-showcase-slide .showcase-copy');
  if(demoSlide&&!document.getElementById('fmV11DemoPill')){
    const pill=document.createElement('div');
    pill.id='fmV11DemoPill';
    pill.style.cssText='display:inline-flex;margin-bottom:10px;padding:6px 10px;border-radius:999px;border:1px solid rgba(99,232,213,.2);background:rgba(99,232,213,.07);color:#A9F4E8;font:900 9px/1.2 Inter,sans-serif;letter-spacing:.08em;';
    pill.textContent='DESIGN SYSTEM · CORE UX · RESPONSIVE';
    demoSlide.insertBefore(pill,demoSlide.firstChild);
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance,{once:true});else enhance();
})();
