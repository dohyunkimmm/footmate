import {MATCHES,NEXT_STORAGE_KEY,createState} from '../v4/data.js';

const root=document.getElementById('footmate-next');
const AI_STORAGE_KEY='footmate:v5.1:ai';
const AI_SCOPE_KEY='footmate:v5.2:discover-ai-scope';
const FOCUS_ASSISTANT_KEY='footmate:v5.2:focus-assistant';
let scheduled=false;
let homeCard=null;
let homeCardObserver=null;
let homeSearchInFlight=false;
let lastPressedExample=null;

function readJson(storage,key,fallback=null){
  try{return JSON.parse(storage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}
}
function readAssistant(){return readJson(localStorage,AI_STORAGE_KEY,null)}
function readState(){return createState(readJson(localStorage,NEXT_STORAGE_KEY,{}))}
function aiScopeActive(){
  const saved=readAssistant();
  if(!saved?.result)return false;
  return sessionStorage.getItem(AI_SCOPE_KEY)!=='0';
}
function setAiScope(active){sessionStorage.setItem(AI_SCOPE_KEY,active?'1':'0')}
function money(value){return new Intl.NumberFormat('ko-KR').format(value)+'원'}
function timeMinutes(value){const found=String(value||'').match(/^(\d{1,2}):(\d{2})$/);return found?Number(found[1])*60+Number(found[2]):null}
function matchTimeMinutes(match){const found=String(match.dateLabel||'').match(/(\d{1,2}):(\d{2})/);return found?Number(found[1])*60+Number(found[2]):null}

function conditionLabels(result={}){
  const labels=[];
  if(result.region)labels.push(result.region);
  if(result.position)labels.push(result.position);
  if(result.level)labels.push(result.level);
  if(result.maxPrice!=null)labels.push(`${money(result.maxPrice)} 이하`);
  if(result.maxDistanceMin!=null)labels.push(`${result.maxDistanceMin}분 이내`);
  if(result.afterTime)labels.push(`${result.afterTime} 이후`);
  return labels.length?labels:['현재 설정 유지'];
}

function assistantMatchIds(saved,state){
  if(!saved?.result)return null;
  const result=saved.result;
  const ranked=typeof window.__FOOTMATE_RECOMMENDATION__?.rank==='function'
    ? window.__FOOTMATE_RECOMMENDATION__.rank({...state,region:result.region||state.region,position:result.position||state.position,level:result.level})
    : MATCHES.map((match,index)=>({id:match.id,score:100-index}));
  const byId=new Map(MATCHES.map(match=>[match.id,match]));
  const threshold=timeMinutes(result.afterTime);
  return ranked.map(item=>item.id).filter(id=>{
    const match=byId.get(id);
    if(!match)return false;
    if(result.region&&match.region!==result.region)return false;
    if(result.position&&Number(match.positionSlots?.[result.position]||0)<=0)return false;
    if(result.maxPrice!=null&&match.price>Number(result.maxPrice))return false;
    if(result.maxDistanceMin!=null&&match.distanceMin>Number(result.maxDistanceMin))return false;
    if(threshold!=null){
      const minutes=matchTimeMinutes(match);
      if(minutes!=null&&minutes<threshold)return false;
    }
    return true;
  });
}

function setPressedExample(button){
  lastPressedExample=button||null;
  homeCard?.querySelectorAll('[data-ai-example]').forEach(example=>{
    const pressed=example===lastPressedExample;
    example.setAttribute('aria-pressed',pressed?'true':'false');
    example.dataset.iaPressed=pressed?'true':'false';
  });
}
function setAssistantLoading(card,loading){
  card?.classList.toggle('is-ia-loading',loading);
  card?.querySelectorAll('[data-ai-example]').forEach(example=>example.setAttribute('aria-disabled',loading?'true':'false'));
}

function goToDiscoverFromHome(){
  const screen=root?.querySelector('[data-screen="home"]');
  if(!screen)return;
  const trigger=screen.querySelector('[data-action="nav-discover"]');
  if(trigger){
    setAiScope(true);
    trigger.click();
  }
}

function observeHomeAssistant(card){
  if(homeCard===card)return;
  homeCardObserver?.disconnect();
  homeCard=card;
  homeSearchInFlight=false;
  homeCardObserver=new MutationObserver(()=>{
    const status=card.dataset.aiState;
    if(status==='loading'){
      homeSearchInFlight=true;
      setAssistantLoading(card,true);
      return;
    }
    if(status==='result'){
      setAssistantLoading(card,false);
      if(homeSearchInFlight){
        homeSearchInFlight=false;
        setPressedExample(null);
        requestAnimationFrame(()=>goToDiscoverFromHome());
      }
    }
  });
  homeCardObserver.observe(card,{attributes:true,attributeFilter:['data-ai-state']});
}

function configureHome(screen){
  screen.dataset.iaRole='assistant-entry';
  const greeting=screen.querySelector('.fm-next-greeting');
  if(greeting){
    const eyebrow=greeting.querySelector('small');
    const title=greeting.querySelector('h1');
    if(eyebrow)eyebrow.textContent='AI MATCH ASSISTANT';
    if(title)title.textContent='오늘, 어떤 경기에서 뛸까요?';
  }

  const card=screen.querySelector('.fm-ai-card[data-product-ai="home"],.fm-ai-card[data-ai-assistant]');
  if(card){
    card.hidden=false;
    card.dataset.iaRole='primary-assistant';
    const examples=[...card.querySelectorAll('[data-ai-example]')];
    examples.forEach(example=>{
      example.hidden=false;
      example.classList.add('fm-ia-suggestion');
      if(!example.hasAttribute('aria-pressed'))example.setAttribute('aria-pressed','false');
      example.style.minHeight='44px';
    });
    const group=card.querySelector('.fm-ai-examples');
    if(group)group.setAttribute('aria-label','바로 실행할 AI 경기 검색 예시');
    observeHomeAssistant(card);
  }

  const context=screen.querySelector('.fm-next-context-card');
  if(context){
    const kicker=context.querySelector('.fm-next-context-kicker')?.textContent?.trim()||'';
    const genericForYou=/FOR YOU/i.test(kicker);
    context.hidden=genericForYou;
    context.classList.toggle('fm-ia-selection-summary',!genericForYou);
  }

  const sectionHead=screen.querySelector(':scope > .fm-next-section-head');
  if(sectionHead){
    const title=sectionHead.querySelector('h2');
    const copy=sectionHead.querySelector('p');
    const action=sectionHead.querySelector('[data-action="nav-discover"]');
    if(title)title.textContent='For You';
    if(copy)copy.textContent='내 설정을 기준으로 고른 추천 경기예요.';
    if(action)action.textContent='경기 찾기';
  }

  const list=screen.querySelector(':scope > .fm-next-list');
  if(list){
    list.dataset.iaRole='personalized-recommendations';
    [...list.querySelectorAll('.fm-next-match-card')].forEach((card,index)=>card.hidden=index>1);
  }

  if(sessionStorage.getItem(FOCUS_ASSISTANT_KEY)==='1'){
    sessionStorage.removeItem(FOCUS_ASSISTANT_KEY);
    requestAnimationFrame(()=>{
      card?.scrollIntoView({block:'start',behavior:'smooth'});
      card?.querySelector('[data-ai-input]')?.focus({preventScroll:true});
    });
  }
}

function ensureDiscoverSummary(screen,saved,active){
  let summary=screen.querySelector('[data-ia-ai-summary]');
  if(!saved?.result){
    summary?.remove();
    return null;
  }
  if(!summary){
    summary=document.createElement('section');
    summary.className='fm-discovery-ai-summary';
    summary.dataset.iaAiSummary='true';
    const anchor=screen.querySelector('.fm-next-match-tags');
    if(anchor)anchor.before(summary);
    else screen.querySelector('.fm-next-section-head')?.insertAdjacentElement('afterend',summary);
  }
  const labels=conditionLabels(saved.result);
  summary.innerHTML=`<div class="fm-discovery-ai-summary__copy"><small>${active?'AI 조회 결과':'최근 AI 조회 조건'}</small><b>${saved.message||'AI 경기 조회'}</b><div class="fm-discovery-ai-summary__chips">${labels.map(label=>`<span>${label}</span>`).join('')}</div></div><div class="fm-discovery-ai-summary__actions"><button type="button" data-ia-action="${active?'show-all':'apply-ai'}">${active?'전체 경기 보기':'AI 결과 다시 보기'}</button><button type="button" data-ia-action="edit-ai">조건 다시 입력</button></div>`;
  return summary;
}

function ensureAiEmpty(screen){
  let empty=screen.querySelector('[data-ia-ai-empty]');
  if(!empty){
    empty=document.createElement('div');
    empty.className='fm-ia-discovery-empty';
    empty.dataset.iaAiEmpty='true';
    empty.innerHTML='<b>AI 조건과 현재 필터를 함께 만족하는 경기가 없어요.</b><span>필터를 줄이거나 전체 경기 보기로 탐색 범위를 넓혀보세요.</span>';
    screen.querySelector('.fm-next-list')?.before(empty);
  }
  return empty;
}

function configureDiscover(screen){
  screen.dataset.iaRole='result-exploration';
  const assistant=screen.querySelector('.fm-ai-card[data-product-ai="discover"],.fm-ai-card[data-ai-assistant]');
  if(assistant){
    assistant.hidden=true;
    assistant.dataset.iaHidden='duplicate-assistant';
  }

  const saved=readAssistant();
  const active=aiScopeActive();
  ensureDiscoverSummary(screen,saved,active);

  const sectionHead=screen.querySelector('.fm-next-section-head');
  if(sectionHead){
    const title=sectionHead.querySelector('h1');
    const copy=sectionHead.querySelector('p');
    if(title)title.textContent=active&&saved?.result?'AI 조회 결과':'경기 찾기';
    if(copy)copy.textContent=active&&saved?.result?'조회 결과를 필터와 정렬로 조정할 수 있어요.':'추천 기준을 유지한 채 전체 경기를 탐색할 수 있어요.';
  }

  const ids=active?assistantMatchIds(saved,readState()):null;
  const allowed=ids?new Set(ids):null;
  const cards=[...screen.querySelectorAll('.fm-next-list .fm-next-match-card')];
  let visible=0;
  cards.forEach(card=>{
    const matches=!allowed||allowed.has(card.dataset.matchId);
    card.hidden=!matches;
    card.dataset.iaAiMatch=matches&&allowed?'true':'false';
    if(matches)visible+=1;
  });

  const empty=ensureAiEmpty(screen);
  if(empty)empty.hidden=!(active&&saved?.result&&visible===0);
  const list=screen.querySelector('.fm-next-list');
  if(list)list.hidden=Boolean(active&&saved?.result&&visible===0);
  const count=screen.querySelector('.fm-discovery-count');
  if(count&&active&&saved?.result)count.textContent=`AI 결과 ${visible}개`;
}

function configureSchedule(screen){
  screen.dataset.iaRole='joined-match-status';
}
function configureProfile(screen){
  screen.dataset.iaRole='account-settings';
}

function enhance(){
  const screen=root?.querySelector('[data-screen]');
  if(!screen)return;
  if(screen.dataset.screen==='home')configureHome(screen);
  else if(screen.dataset.screen==='discover')configureDiscover(screen);
  else if(screen.dataset.screen==='schedule')configureSchedule(screen);
  else if(screen.dataset.screen==='profile')configureProfile(screen);
}
function scheduleEnhance(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;enhance()});
}

root?.addEventListener('pointerdown',event=>{
  const example=event.target.closest('[data-screen="home"] [data-ai-example]');
  if(example)setPressedExample(example);
},true);

root?.addEventListener('click',event=>{
  const action=event.target.closest('[data-ia-action]');
  if(!action)return;
  const name=action.dataset.iaAction;
  if(name==='show-all'){
    setAiScope(false);
    scheduleEnhance();
  }else if(name==='apply-ai'){
    setAiScope(true);
    scheduleEnhance();
  }else if(name==='edit-ai'){
    sessionStorage.setItem(FOCUS_ASSISTANT_KEY,'1');
    root.querySelector('[data-screen="discover"] [data-action="nav-home"]')?.click();
  }
},true);

if(root){
  new MutationObserver(scheduleEnhance).observe(root,{childList:true,subtree:true});
  window.__FOOTMATE_REAL_APP_IA__=Object.freeze({
    version:'1.0.0',
    roles:Object.freeze({home:'assistant-entry',discover:'result-exploration',schedule:'joined-match-status',profile:'account-settings'}),
    get assistant(){return readAssistant()},
    get aiScope(){return aiScopeActive()}
  });
  scheduleEnhance();
}
