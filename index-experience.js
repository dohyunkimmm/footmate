(function(){
'use strict';
function enhance(){
  if(document.getElementById('fmReleaseVersionBadge'))return;
  const cover=document.querySelector('.slide[data-i="0"] .cover');
  if(cover){
    const badge=document.createElement('div');
    badge.id='fmReleaseVersionBadge';
    badge.setAttribute('aria-label','FootMate v2.1.0 Domain Engine');
    badge.style.cssText='display:inline-flex;align-items:center;gap:8px;margin:0 auto 14px;padding:7px 12px;border-radius:999px;border:1px solid rgba(110,167,255,.25);background:rgba(110,167,255,.08);color:#B7D3FF;font:900 9px/1.2 Inter,sans-serif;letter-spacing:.13em;';
    badge.innerHTML='<span style="width:7px;height:7px;border-radius:50%;background:#63E8D5;box-shadow:0 0 12px rgba(99,232,213,.6)"></span>V2.1 · DOMAIN ENGINE';
    cover.insertBefore(badge,cover.firstChild);
  }

  const validation=document.querySelector('.slide[data-i="18"] .content');
  if(validation&&!document.getElementById('fmReleaseExperienceNote')){
    const note=document.createElement('div');
    note.id='fmReleaseExperienceNote';
    note.style.cssText='margin-top:14px;padding:14px 16px;border-radius:14px;border:1px solid rgba(110,167,255,.18);background:linear-gradient(135deg,rgba(110,167,255,.08),rgba(124,108,242,.05));color:#9FB3CC;font-size:11px;line-height:1.65;';
    note.innerHTML='<b style="display:block;margin-bottom:5px;color:#EAF3FF;font-size:12px">v2.1.0 Domain Engine</b>매칭 점수·랭킹·ELO 계산을 v2 domain engine으로 분리하고 scenario store와 Product Validation이 동일 도메인 상태를 사용하도록 정리했습니다. 39개 화면과 기존 정책·가중치는 그대로 유지합니다.';
    validation.appendChild(note);
  }

  const demoSlide=document.querySelector('.demo-showcase-slide .showcase-copy');
  if(demoSlide&&!document.getElementById('fmReleaseDemoPill')){
    const pill=document.createElement('div');
    pill.id='fmReleaseDemoPill';
    pill.style.cssText='display:inline-flex;margin-bottom:10px;padding:6px 10px;border-radius:999px;border:1px solid rgba(99,232,213,.2);background:rgba(99,232,213,.07);color:#A9F4E8;font:900 9px/1.2 Inter,sans-serif;letter-spacing:.08em;';
    pill.textContent='DOMAIN ENGINE · STATE PARITY · UX';
    demoSlide.insertBefore(pill,demoSlide.firstChild);
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance,{once:true});else enhance();
})();
