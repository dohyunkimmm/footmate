(function(){
'use strict';
try{
  const state=JSON.parse(localStorage.getItem('footmateFinalStateV3')||'{}')||{};
  const wrap=document.getElementById('chat-messages-wrap');
  if(wrap&&Array.isArray(state.chatMessages)&&!wrap.querySelector('[data-fm-saved-chat]')){
    state.chatMessages.slice(-20).forEach(text=>{
      const bubble=document.createElement('div');
      bubble.dataset.fmSavedChat='true';
      bubble.style.cssText='display:flex;justify-content:flex-end;';
      const body=document.createElement('div');
      body.style.cssText='max-width:78%;background:var(--blue);color:#fff;border-radius:14px 14px 4px 14px;padding:9px 11px;font-size:12px;line-height:1.45;';
      body.textContent=String(text);
      bubble.appendChild(body);
      wrap.appendChild(bubble);
    });
  }
}catch(e){}
})();
