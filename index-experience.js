(function(){
'use strict';
function enhance(){
  if(document.getElementById('fmReleaseVersionBadge'))return;
  const cover=document.querySelector('.slide[data-i="0"] .cover');
  if(cover){
    const badge=document.createElement('div');
    badge.id='fmReleaseVersionBadge';
    badge.setAttribute('aria-label','FootMate v2.5.0 Decision & Recovery Experience');
    badge.style.cssText='display:inline-flex;align-items:center;gap:8px;margin:0 auto 14px;padding:7px 12px;border-radius:999px;border:1px solid rgba(110,167,255,.25);background:rgba(110,167,255,.08);color:#B7D3FF;font:900 9px/1.2 Inter,sans-serif;letter-spacing:.13em;';
    badge.innerHTML='<span style="width:7px;height:7px;border-radius:50%;background:#63E8D5;box-shadow:0 0 12px rgba(99,232,213,.6)"></span>V2.5 · DECISION & RECOVERY EXPERIENCE';
    cover.insertBefore(badge,cover.firstChild);
  }

  const validation=document.querySelector('.slide[data-i="14"] .content');
  if(validation&&!document.getElementById('fmReleaseExperienceNote')){
    const note=document.createElement('div');
    note.id='fmReleaseExperienceNote';
    note.style.cssText='margin-top:14px;padding:14px 16px;border-radius:14px;border:1px solid rgba(110,167,255,.18);background:linear-gradient(135deg,rgba(110,167,255,.08),rgba(124,108,242,.05));color:#9FB3CC;font-size:11px;line-height:1.65;';
    note.innerHTML='<b style="display:block;margin-bottom:5px;color:#EAF3FF;font-size:12px">v2.5.0 Decision & Recovery Experience</b>v2.4 core funnel 위에 deterministic decision/guardrail layer를 추가해 추천 비교, 참가 전 preflight, 결제 차단, 대기·충전·재시도 복구와 decision trace를 하나의 IX로 연결했습니다. Decision ownership은 <code>src/v2/domain/decision-engine.js</code>, UI/IX ownership은 <code>src/v2/ui/decision-recovery-experience.js</code>와 <code>src/v2/demo/decision-recovery-components.js</code>가 담당하며, 기존 39개 화면·Matching/ELO·2.1 storage/event contract를 회귀 기준으로 유지합니다.';
    validation.appendChild(note);
  }

  const demoSlide=document.querySelector('.demo-showcase-slide .showcase-copy');
  if(demoSlide&&!document.getElementById('fmReleaseDemoPill')){
    const pill=document.createElement('div');
    pill.id='fmReleaseDemoPill';
    pill.style.cssText='display:inline-flex;margin-bottom:10px;padding:6px 10px;border-radius:999px;border:1px solid rgba(99,232,213,.2);background:rgba(99,232,213,.07);color:#A9F4E8;font:900 9px/1.2 Inter,sans-serif;letter-spacing:.08em;';
    pill.textContent='DECISION GUARDRAIL · INLINE RECOVERY · TRACEABLE IX';
    demoSlide.insertBefore(pill,demoSlide.firstChild);
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance,{once:true});else enhance();
})();
