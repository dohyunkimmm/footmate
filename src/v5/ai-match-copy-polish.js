const root=document.getElementById('footmate-next');
const AI_STORAGE_KEY='footmate:v5.1:ai';
let scheduled=false;

function readSavedAssistant(){
  try{return JSON.parse(localStorage.getItem(AI_STORAGE_KEY)||'null')}catch{return null}
}

function resultHeadline(result={}){
  const region=typeof result.region==='string'?result.region.trim():'';
  const level=typeof result.level==='string'?result.level.trim():'';
  const position=typeof result.position==='string'?result.position.trim():'';
  const role=[level,position].filter(Boolean).join(' ');
  if(region&&role)return `${region}에서 조건에 맞는 ${role} 경기를 찾습니다.`;
  if(region)return `${region}에서 조건에 맞는 경기를 찾습니다.`;
  if(role)return `조건에 맞는 ${role} 경기를 찾습니다.`;
  return '조건에 맞는 경기를 찾습니다.';
}

function setText(node,value){
  if(node&&node.textContent!==value)node.textContent=value;
}

function polishHomeCard(card){
  if(card.closest('[data-screen]')?.dataset.screen!=='home')return;
  const title=card.querySelector('.fm-ai-head strong');
  if(title&&title.getAttribute('aria-label')!=='원하는 경기를 말해보세요.')title.setAttribute('aria-label','원하는 경기를 말해보세요.');

  const status=card.querySelector('[data-ai-status]');
  if(!status)return;
  const headline=status.querySelector('b');
  const detail=status.querySelector('span');

  if(card.dataset.aiState==='loading'){
    setText(headline,'AI가 조건을 해석하고 있어요.');
    setText(detail,'추천 순위는 기존 엔진에서 계산합니다.');
    return;
  }
  if(card.dataset.aiState!=='result')return;

  const saved=readSavedAssistant();
  if(!saved?.result)return;
  setText(headline,resultHeadline(saved.result));
  setText(detail,saved.mode==='rules-fallback'
    ?'기본 조건 해석으로 전환했고, 추천 순위는 기존 엔진이 계산합니다.'
    :'AI가 조건을 해석하고, 추천 순위는 기존 엔진이 계산합니다.');
}

function apply(){
  scheduled=false;
  if(!root)return;
  root.querySelectorAll('[data-screen="home"] .fm-ai-card[data-ai-assistant]').forEach(polishHomeCard);
}

function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(apply);
}

if(root){
  new MutationObserver(schedule).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['data-ai-state','data-ia-role']});
  schedule();
}
