const root=document.getElementById('footmate-next');
const FIRST_HOME_GREETING_VERSION='1.0.0';
let scheduled=false;

function ensureStyles(){
  if(document.getElementById('fm-first-home-greeting'))return;
  const style=document.createElement('style');
  style.id='fm-first-home-greeting';
  style.textContent=`
.fm-next-page[data-mode="real"] .fm-flow-first-home-kicker{display:block;margin-bottom:5px;color:var(--fm-muted);font-size:13px}
.fm-next-page[data-mode="real"] .fm-flow-first-home-title{margin:0;font-size:29px;line-height:1.25;letter-spacing:-.055em;font-weight:800}
.fm-next-page[data-mode="real"] .fm-flow-first-home-title span{color:var(--fm-pitch-3)}
`;
  document.head.append(style);
}

function normalizeFirstHomeGreeting(){
  scheduled=false;
  const copy=root?.querySelector('[data-flow-first-home-copy]');
  if(!copy||copy.dataset.firstHomeGreetingVersion===FIRST_HOME_GREETING_VERSION)return;
  ensureStyles();
  copy.dataset.firstHomeGreetingVersion=FIRST_HOME_GREETING_VERSION;
  copy.innerHTML='<span class="fm-flow-first-home-kicker">설정이 완료됐어요</span><div class="fm-flow-first-home-title">조건에 맞는 경기를 <span>찾았어요.</span></div>';
}

function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(normalizeFirstHomeGreeting);
}

if(root){
  new MutationObserver(schedule).observe(root,{childList:true,subtree:true,characterData:true});
  queueMicrotask(normalizeFirstHomeGreeting);
}

window.__FOOTMATE_FIRST_HOME_GREETING__=Object.freeze({version:FIRST_HOME_GREETING_VERSION});
