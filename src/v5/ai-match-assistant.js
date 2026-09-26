import {MATCHES,NEXT_STORAGE_KEY,createState} from '../v4/data.js';

const VERSION='5.1.1';
const AI_STORAGE_KEY='footmate:v5.1:ai';
const AI_REQUEST_TIMEOUT_MS=7000;
const REGIONS=['수원 · 영통','수원 · 인계','용인 · 기흥','서울 · 강남'];
const POSITIONS=['MF','FW','DF','GK'];
const LEVELS=['입문','초중급','중급','중급+'];
const root=document.getElementById('footmate-next');
let lastMode='idle';
let scheduled=false;

const escapeHtml=value=>String(value??'').replace(/[&<>\"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[char]));
const money=value=>new Intl.NumberFormat('ko-KR').format(value)+'원';
function readJson(key,fallback={}){try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}}
function readState(){return createState(readJson(NEXT_STORAGE_KEY,{}))}
function saveAssistant(value){try{localStorage.setItem(AI_STORAGE_KEY,JSON.stringify(value))}catch{}}
function readAssistant(){return readJson(AI_STORAGE_KEY,null)}
function matchTimeMinutes(match){const found=String(match.dateLabel||'').match(/(\d{1,2}):(\d{2})/);return found?Number(found[1])*60+Number(found[2]):null}
function timeMinutes(value){const found=String(value||'').match(/^(\d{1,2}):(\d{2})$/);return found?Number(found[1])*60+Number(found[2]):null}
function clampNumber(value,min,max){const number=Number(value);return Number.isFinite(number)?Math.min(max,Math.max(min,Math.round(number))):null}

function normalizeResult(candidate={}){
  return {intent:['search','refine','explain','compare'].includes(candidate.intent)?candidate.intent:'search',region:REGIONS.includes(candidate.region)?candidate.region:null,position:POSITIONS.includes(candidate.position)?candidate.position:null,level:LEVELS.includes(candidate.level)?candidate.level:null,maxPrice:candidate.maxPrice==null?null:clampNumber(candidate.maxPrice,5000,50000),maxDistanceMin:candidate.maxDistanceMin==null?null:clampNumber(candidate.maxDistanceMin,5,60),afterTime:typeof candidate.afterTime==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(candidate.afterTime)?candidate.afterTime:null,reply:typeof candidate.reply==='string'&&candidate.reply.trim()?candidate.reply.trim().slice(0,180):'요청을 경기 검색 조건으로 정리했어요.'};
}
function fallbackParse(message){
  const text=String(message||'').trim();
  let region=null,position=null,level=null,maxPrice=null,maxDistanceMin=null,afterTime=null;
  if(/인계|권선|매탄/.test(text))region='수원 · 인계';else if(/영통|망포|광교/.test(text))region='수원 · 영통';else if(/기흥|보정|죽전/.test(text))region='용인 · 기흥';else if(/강남|서초|송파|잠실/.test(text))region='서울 · 강남';
  if(/미드필더|\bMF\b/i.test(text))position='MF';else if(/포워드|공격수|\bFW\b/i.test(text))position='FW';else if(/수비|디펜더|\bDF\b/i.test(text))position='DF';else if(/골키퍼|키퍼|\bGK\b/i.test(text))position='GK';
  if(/중급\+|중급 이상|빠른 템포/.test(text))level='중급+';else if(/초중급/.test(text))level='초중급';else if(/입문|초보/.test(text))level='입문';else if(/중급/.test(text))level='중급';
  const manwon=text.match(/(\d+(?:\.\d+)?)\s*만\s*원?/),won=text.match(/(\d{4,5})\s*원/);if(manwon)maxPrice=Math.round(Number(manwon[1])*10000);else if(won)maxPrice=Number(won[1]);
  const distance=text.match(/(\d{1,2})\s*분\s*(?:이내|안|거리)?/);if(distance&&/(가까|거리|이동|분 이내|분 안)/.test(text))maxDistanceMin=Number(distance[1]);else if(/가까운|가까이|멀지/.test(text))maxDistanceMin=20;
  const time=text.match(/(\d{1,2})\s*시(?:\s*(\d{1,2})\s*분)?\s*(?:이후|후|넘어서|넘어)/);if(time){const hour=Math.min(23,Number(time[1])),minute=Math.min(59,Number(time[2]||0));afterTime=`${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`}
  return normalizeResult({intent:'search',region,position,level,maxPrice,maxDistanceMin,afterTime,reply:'AI 연결을 사용할 수 없어 기본 조건 해석으로 전환했어요.'});
}
async function requestAi(message,preferences){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),AI_REQUEST_TIMEOUT_MS);
  try{
    const response=await fetch('/api/ai-match-assistant',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({message,preferences}),signal:controller.signal});
    const payload=await response.json().catch(()=>({}));
    if(!response.ok||payload.mode!=='connected-ai'||!payload.result)throw new Error(payload.error||`AI ${response.status}`);
    return normalizeResult(payload.result);
  }catch(error){if(error?.name==='AbortError')throw new Error('ai_timeout');throw error}
  finally{clearTimeout(timer)}
}
function deterministicResults(result,state){
  const effective={...state,region:result.region||state.region,position:result.position||state.position,level:result.level||state.level};
  const ranked=typeof window.__FOOTMATE_RECOMMENDATION__?.rank==='function'?window.__FOOTMATE_RECOMMENDATION__.rank(effective):MATCHES.map((match,index)=>({id:match.id,score:100-index,fit:match.fit,reasons:match.reasons.map(reason=>reason.title)}));
  const byId=new Map(MATCHES.map(match=>[match.id,match]));const threshold=timeMinutes(result.afterTime);
  return ranked.map(item=>({item,match:byId.get(item.id)})).filter(({match})=>{if(!match)return false;if(result.region&&match.region!==result.region)return false;if(result.position&&Number(match.positionSlots?.[result.position]||0)<=0)return false;if(result.maxPrice!=null&&match.price>result.maxPrice)return false;if(result.maxDistanceMin!=null&&match.distanceMin>result.maxDistanceMin)return false;if(threshold!=null){const minutes=matchTimeMinutes(match);if(minutes!=null&&minutes<threshold)return false}return true}).slice(0,3);
}
function conditionLabels(result){const labels=[];if(result.region)labels.push(result.region);if(result.position)labels.push(result.position);if(result.level)labels.push(result.level);if(result.maxPrice!=null)labels.push(`${money(result.maxPrice)} 이하`);if(result.maxDistanceMin!=null)labels.push(`${result.maxDistanceMin}분 이내`);if(result.afterTime)labels.push(`${result.afterTime} 이후`);return labels.length?labels:['현재 설정 유지']}
function homeStatusSummary(result){const region=String(result?.region||'').trim(),role=[result?.level,result?.position].filter(Boolean).join(' ');if(region&&role)return `${region}에서 조건에 맞는 ${role} 경기를 찾습니다.`;if(region)return `${region}에서 조건에 맞는 경기를 찾습니다.`;if(role)return `조건에 맞는 ${role} 경기를 찾습니다.`;return '조건에 맞는 경기를 찾습니다.'}
function resultMarkup(entries){if(!entries.length)return '<div class="fm-ai-empty"><b>조건에 맞는 샘플 경기가 없어요.</b><span>거리·가격·시간 조건을 조금 넓혀 다시 요청해보세요.</span></div>';return entries.map(({item,match},index)=>`<button type="button" class="fm-ai-result" data-action="open-match" data-match-id="${escapeHtml(match.id)}"><span class="fm-ai-result-rank">${index+1}</span><span class="fm-ai-result-copy"><b>${escapeHtml(match.place)}</b><small>${escapeHtml(match.dateLabel)} · ${escapeHtml(match.level)} · ${escapeHtml(match.distance)} · ${money(match.price)}</small><em>${escapeHtml((item.reasons||[]).slice(0,2).join(' · ')||item.fit||match.fit)}</em></span><span aria-hidden="true">→</span></button>`).join('')}
function renderSaved(card,saved){
  if(!saved||!saved.result)return;
  card.dataset.aiState='result';
  if(['connected-ai','rules-fallback'].includes(saved.mode))lastMode=saved.mode;
  const state=readState(),result=normalizeResult(saved.result),entries=deterministicResults(result,state),status=card.querySelector('[data-ai-status]'),conditions=card.querySelector('[data-ai-conditions]'),results=card.querySelector('[data-ai-results]'),mode=card.querySelector('[data-ai-mode]');
  const statusCopy=card.closest('[data-screen="home"]')&&saved.mode==='connected-ai'?homeStatusSummary(result):result.reply;
  if(status)status.innerHTML=`<b>${escapeHtml(statusCopy)}</b><span>${saved.mode==='connected-ai'?'AI가 자연어를 조건으로 해석했고, 순위는 기존 추천 엔진이 계산했습니다.':'AI 연결 실패 후 rules-based fallback으로 같은 추천 엔진을 사용했습니다.'}</span>`;
  if(conditions)conditions.innerHTML=conditionLabels(result).map(label=>`<span>${escapeHtml(label)}</span>`).join('');if(results)results.innerHTML=resultMarkup(entries);if(mode){mode.textContent=saved.mode==='connected-ai'?'AI connected':'Rules fallback';mode.dataset.mode=saved.mode}
}
async function run(card,message){
  const input=card.querySelector('[data-ai-input]'),submit=card.querySelector('[data-ai-submit]'),status=card.querySelector('[data-ai-status]'),results=card.querySelector('[data-ai-results]'),conditions=card.querySelector('[data-ai-conditions]'),mode=card.querySelector('[data-ai-mode]');
  if(!message.trim())return;card.dataset.aiState='loading';submit.disabled=true;input.disabled=true;if(status)status.innerHTML='<b>AI가 요청을 해석하고 있어요.</b><span>경기 후보와 순위는 기존 추천 엔진에서 확인합니다.</span>';if(results)results.innerHTML='<div class="fm-ai-loading" aria-hidden="true"><span></span><span></span><span></span></div>';if(conditions)conditions.innerHTML='';
  const state=readState();let result,runMode='connected-ai';
  try{result=await requestAi(message,{region:state.region,position:state.position,level:state.level});lastMode='connected-ai'}catch{result=fallbackParse(message);runMode='rules-fallback';lastMode='rules-fallback'}
  try{const saved={version:VERSION,message:message.slice(0,240),mode:runMode,result,updatedAt:new Date().toISOString()};saveAssistant(saved);renderSaved(card,saved);if(mode)mode.dataset.mode=runMode}finally{submit.disabled=false;input.disabled=false;input.focus()}
}
function shell(){
  const card=document.createElement('section');card.className='fm-ai-card';card.dataset.aiState='idle';card.dataset.aiAssistant=VERSION;card.setAttribute('aria-labelledby','fm-ai-title');
  card.innerHTML=`<div class="fm-ai-head"><div><span class="fm-ai-kicker">AI Match Assistant</span><span class="fm-ai-mode" data-ai-mode data-mode="idle">AI ready</span></div><strong id="fm-ai-title">말로 경기 조건을 알려주세요.</strong><p>AI는 요청을 검색 조건으로 바꾸고, 실제 경기 순위는 FootMate의 deterministic recommendation이 결정합니다.</p></div><form class="fm-ai-form" data-ai-form><label class="fm-ai-label" for="fm-ai-query">찾고 싶은 경기 조건</label><div class="fm-ai-input-row"><input id="fm-ai-query" data-ai-input type="text" maxlength="240" autocomplete="off" placeholder="예: 8시 이후, 2만원 이하, 가까운 중급 MF 경기"><button type="submit" data-ai-submit>AI로 찾기</button></div></form><div class="fm-ai-examples" aria-label="AI 검색 예시"><button type="button" data-ai-example="8시 이후, 2만원 이하, 가까운 중급 MF 경기">8시 이후 · 2만원 이하</button><button type="button" data-ai-example="수원 인계에서 초중급 경기 찾아줘">인계 · 초중급</button><button type="button" data-ai-example="20분 안쪽에서 GK 자리 있는 경기">20분 이내 · GK</button></div><div class="fm-ai-status" data-ai-status aria-live="polite"><b>자연어로 조건을 입력해보세요.</b><span>AI 장애나 지연 시 기존 rules-based 검색으로 자동 전환합니다.</span></div><div class="fm-ai-conditions" data-ai-conditions></div><div class="fm-ai-results" data-ai-results></div><div class="fm-ai-guardrail">AI는 참가·결제를 실행하지 않습니다. 경기·가격·자리는 샘플 데이터입니다.</div>`;
  const form=card.querySelector('[data-ai-form]'),input=card.querySelector('[data-ai-input]');form.addEventListener('submit',event=>{event.preventDefault();run(card,input.value)});card.querySelectorAll('[data-ai-example]').forEach(button=>button.addEventListener('click',()=>{input.value=button.dataset.aiExample||'';run(card,input.value)}));renderSaved(card,readAssistant());return card;
}
function mount(){if(!root)return;const screen=root.querySelector('[data-screen="home"],[data-screen="discover"]');if(!screen||screen.querySelector('[data-ai-assistant]'))return;const card=shell();if(screen.dataset.screen==='home'){const anchor=screen.querySelector('.fm-next-section-head');if(anchor)anchor.before(card);else screen.append(card)}else{const anchor=screen.querySelector('.fm-next-match-tags');if(anchor)anchor.before(card);else screen.querySelector('.fm-next-section')?.append(card)}}
window.__FOOTMATE_AI__=Object.freeze({version:VERSION,workflow:'Context → Plan → Tools → Guardrail → Observe',role:'natural-language constraint interpretation',rankingOwner:'deterministic recommendation engine',requestTimeoutMs:AI_REQUEST_TIMEOUT_MS,storageKey:AI_STORAGE_KEY,hitl:Object.freeze(['join','payment']),get mode(){return lastMode},query:async message=>{const state=readState();try{const result=await requestAi(message,{region:state.region,position:state.position,level:state.level});lastMode='connected-ai';return Object.freeze({mode:lastMode,result,results:deterministicResults(result,state).map(entry=>entry.match.id)})}catch{const result=fallbackParse(message);lastMode='rules-fallback';return Object.freeze({mode:lastMode,result,results:deterministicResults(result,state).map(entry=>entry.match.id)})}}});
document.documentElement.dataset.footmateAiVersion=VERSION;if(root)root.dataset.aiAssistant='available';const observer=root?new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;mount()})}):null;if(observer)observer.observe(root,{childList:true,subtree:true});mount();

/* Product completion orchestration */
(()=>{
const root=document.getElementById('footmate-next');
if(root){
  let scheduled=false;
  const setText=(node,value)=>{if(node&&node.textContent!==value)node.textContent=value};

  function configureAssistant(screen){
    const card=screen.querySelector('.fm-ai-card');
    if(!card)return;
    const isHome=screen.dataset.screen==='home';
    const variant=isHome?'home':'discover';
    if(card.dataset.productAi!==variant)card.dataset.productAi=variant;

    const title=card.querySelector('.fm-ai-head strong');
    const copy=card.querySelector('.fm-ai-head p');
    const input=card.querySelector('[data-ai-input]');
    const submit=card.querySelector('[data-ai-submit]');
    const examples=[...card.querySelectorAll('[data-ai-example]')];

    /* Keep the existing accessible identity/label contracts intact:
       AI Match Assistant · 찾고 싶은 경기 조건 · AI로 찾기. */
    if(submit)submit.setAttribute('aria-label','AI로 찾기');

    if(isHome){
      setText(title,'AI에게 원하는 경기를 검색해보세요.');
      setText(copy,'AI가 자연어 조건을 해석하고 기존 추천 엔진이 맞는 경기 순위를 계산합니다.');
      if(input&&input.placeholder!=='예: 8시 이후, 가까운 중급 MF')input.placeholder='예: 8시 이후, 가까운 중급 MF';
      setText(submit,'AI로 찾기');
      examples.forEach(button=>{button.hidden=false;button.style.minHeight='44px'});
    }else{
      setText(title,'원하는 경기를 문장으로 검색하세요.');
      setText(copy,'필터와 함께 사용해 시간·거리·가격·포지션 조건을 빠르게 좁힐 수 있어요.');
      if(input&&input.placeholder!=='예: 8시 이후, 2만원 이하, 가까운 중급 MF 경기')input.placeholder='예: 8시 이후, 2만원 이하, 가까운 중급 MF 경기';
      setText(submit,'AI 검색');
      examples.forEach(button=>{button.hidden=false;button.style.minHeight=''});
    }

    const mode=card.querySelector('[data-ai-mode]');
    const retry=card.querySelector('.fm-product-ai-retry');
    if(mode?.dataset.mode==='rules-fallback'){
      if(!retry){
        const button=document.createElement('button');
        button.type='button';
        button.className='fm-product-ai-retry';
        button.textContent='AI 다시 시도';
        button.addEventListener('click',()=>{
          const field=card.querySelector('[data-ai-input]');
          if(field&&!field.value.trim())field.value=isHome?'가까운 중급 경기':'20분 이내 경기';
          card.querySelector('[data-ai-form]')?.requestSubmit();
        });
        card.querySelector('[data-ai-status]')?.insertAdjacentElement('afterend',button);
      }
    }else if(retry){
      retry.remove();
    }
  }

  function compactMatchCards(screen){
    const role=screen.dataset.screen;
    screen.querySelectorAll('.fm-next-match-card').forEach(card=>{
      if(card.dataset.productDensity!==role)card.dataset.productDensity=role;
    });
  }

  function prioritizeDetail(screen){
    if(screen.dataset.productDetail!=='prioritized')screen.dataset.productDetail='prioritized';
    const redundant=new Set(['나와 잘 맞는 이유','경기 정보','함께 뛰는 사람','취소·환불']);
    [...screen.querySelectorAll('.fm-next-detail-section')].forEach(section=>{
      if(section.dataset.decisionSection)return;
      const heading=section.querySelector('h2')?.textContent?.trim();
      if(heading&&redundant.has(heading)&&!section.hidden)section.hidden=true;
    });
  }

  function enhance(){
    const screen=root.querySelector('[data-screen]');
    if(!screen)return;
    if(screen.dataset.screen==='home'||screen.dataset.screen==='discover'){
      configureAssistant(screen);
      compactMatchCards(screen);
    }
    if(screen.dataset.screen==='detail')prioritizeDetail(screen);
  }

  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;enhance()});
  }

  new MutationObserver(schedule).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['data-mode','data-ai-state']});
  schedule();
}

})();

/* Real App IA: Home owns AI entry; Discover owns result exploration. */
(()=>{
const root=document.getElementById('footmate-next');
if(!root)return;
const SNAPSHOT_KEY='footmate:v5.2:discover-ai-snapshot';
const SCOPE_KEY='footmate:v5.2:discover-ai-scope';
const FOCUS_KEY='footmate:v5.2:focus-assistant';
let homeCard=null,homeObserver=null,searchIntent=null,pressedExample=null,scheduled=false;
const readSessionJson=key=>{try{return JSON.parse(sessionStorage.getItem(key)||'null')}catch{return null}};
const writeSessionJson=(key,value)=>{try{sessionStorage.setItem(key,JSON.stringify(value))}catch{}};
const snapshot=()=>readSessionJson(SNAPSHOT_KEY);
const scopeActive=()=>Boolean(snapshot()?.result)&&sessionStorage.getItem(SCOPE_KEY)==='1';
const setScope=active=>sessionStorage.setItem(SCOPE_KEY,active?'1':'0');
const text=(node,value)=>{if(node&&node.textContent!==value)node.textContent=value};
const hidden=(node,value)=>{if(node&&node.hidden!==value)node.hidden=value};
const displayMessage=value=>String(value||'AI 경기 조회').replace(/,\s*/g,' · ');

function setPressed(button){
  pressedExample=button||null;
  homeCard?.querySelectorAll('[data-ai-example]').forEach(example=>example.setAttribute('aria-pressed',example===pressedExample?'true':'false'));
}
function setLoading(card,loading){
  card?.classList.toggle('is-ia-loading',loading);
  card?.querySelectorAll('[data-ai-example]').forEach(example=>example.setAttribute('aria-disabled',loading?'true':'false'));
}
function goDiscover(){
  const screen=root.querySelector('[data-screen="home"]');
  if(!screen)return;
  setScope(true);
  const action=[...screen.querySelectorAll('[data-action="nav-discover"]')].find(node=>!node.hidden&&node.getClientRects().length)||screen.querySelector('[data-action="nav-discover"]');
  action?.click();
}
function observeHome(card){
  if(homeCard===card)return;
  homeObserver?.disconnect();
  homeCard=card;
  homeObserver=new MutationObserver(()=>{
    const state=card.dataset.aiState;
    if(state==='loading'){setLoading(card,true);return;}
    if(state!=='result')return;
    setLoading(card,false);
    const saved=readAssistant();
    if(saved?.result)writeSessionJson(SNAPSHOT_KEY,saved);
    const shouldNavigate=searchIntent==='example'||(searchIntent==='submit'&&saved?.mode==='connected-ai');
    searchIntent=null;setPressed(null);
    if(shouldNavigate&&saved?.result)requestAnimationFrame(goDiscover);
  });
  homeObserver.observe(card,{attributes:true,attributeFilter:['data-ai-state']});
}
function configureHome(screen){
  screen.dataset.iaRole='assistant-entry';
  const assistant=screen.querySelector('.fm-ai-card[data-product-ai="home"],.fm-ai-card[data-ai-assistant]');
  if(assistant){
    assistant.hidden=false;assistant.dataset.iaRole='primary-assistant';
    assistant.querySelectorAll('[data-ai-example]').forEach(example=>{example.hidden=false;example.classList.add('fm-ia-suggestion');if(!example.hasAttribute('aria-pressed'))example.setAttribute('aria-pressed','false');example.style.minHeight='44px'});
    assistant.querySelector('.fm-ai-examples')?.setAttribute('aria-label','바로 실행할 AI 경기 검색 예시');
    const saved=readAssistant();if(saved?.mode==='connected-ai'&&saved.result)setText(assistant.querySelector('[data-ai-status] b'),homeStatusSummary(normalizeResult(saved.result)));
    observeHome(assistant);
  }
  const context=screen.querySelector('.fm-next-context-card');
  if(context){
    const generic=/FOR YOU/i.test(context.querySelector('.fm-next-context-kicker')?.textContent||'');
    hidden(context,false);
    context.classList.toggle('fm-ia-action-strip',generic);
    context.classList.toggle('fm-ia-selection-summary',!generic);
  }
  const head=screen.querySelector(':scope > .fm-next-section-head');
  text(head?.querySelector('h2'),'For You');
  text(head?.querySelector('p'),'내 설정을 기준으로 고른 추천 경기예요.');
  const headAction=head?.querySelector('[data-action="nav-discover"]');
  if(headAction)headAction.hidden=true;
  const list=screen.querySelector(':scope > .fm-next-list');
  if(list){list.dataset.iaRole='personalized-recommendations';list.querySelectorAll('.fm-next-match-card').forEach((node,index)=>hidden(node,index>1))}
  if(sessionStorage.getItem(FOCUS_KEY)==='1'){
    sessionStorage.removeItem(FOCUS_KEY);
    requestAnimationFrame(()=>{assistant?.scrollIntoView({block:'start',behavior:'smooth'});assistant?.querySelector('[data-ai-input]')?.focus({preventScroll:true})});
  }
}
function ensureSummary(screen,saved,active){
  let summary=screen.querySelector('[data-ia-ai-summary]');
  if(!saved?.result){summary?.remove();return}
  const anchor=screen.querySelector('.fm-discovery-chrome')||screen.querySelector('.fm-next-list');
  if(!summary){
    summary=document.createElement('section');summary.className='fm-discovery-ai-summary';summary.dataset.iaAiSummary='true';
  }
  if(anchor&&summary.nextElementSibling!==anchor)anchor.before(summary);else if(!anchor&&!summary.isConnected)screen.querySelector('.fm-next-section-head')?.insertAdjacentElement('afterend',summary);
  const labels=conditionLabels(saved.result),message=displayMessage(saved.message);
  const sig=JSON.stringify([active,message,labels]);
  const markup=`<div class="fm-discovery-ai-summary__copy"><small>${active?'AI 조회 결과':'최근 AI 조회 조건'}</small><b>${escapeHtml(message)}</b><div class="fm-discovery-ai-summary__chips">${labels.map(label=>`<span>${escapeHtml(label)}</span>`).join('')}</div></div><div class="fm-discovery-ai-summary__actions"><button type="button" data-ia-action="${active?'show-all':'apply-ai'}">${active?'전체 경기 보기':'AI 결과 다시 보기'}</button><button type="button" data-ia-action="edit-ai">조건 다시 입력</button></div>`;
  if(summary.dataset.iaSignature===sig&&summary.innerHTML===markup)return;
  summary.dataset.iaSignature=sig;summary.innerHTML=markup;
}
function ensureEmpty(screen){
  let empty=screen.querySelector('[data-ia-ai-empty]');
  if(!empty){empty=document.createElement('div');empty.className='fm-ia-discovery-empty';empty.dataset.iaAiEmpty='true';empty.innerHTML='<b>AI 조건과 현재 필터를 함께 만족하는 경기가 없어요.</b><span>필터를 줄이거나 전체 경기 보기로 탐색 범위를 넓혀보세요.</span>';screen.querySelector('.fm-next-list')?.before(empty)}
  return empty;
}
function configureDiscover(screen){
  screen.dataset.iaRole='result-exploration';
  const assistant=screen.querySelector('.fm-ai-card[data-product-ai="discover"],.fm-ai-card[data-ai-assistant]');
  if(assistant){hidden(assistant,true);assistant.dataset.iaHidden='duplicate-assistant'}
  const saved=snapshot(),active=scopeActive();ensureSummary(screen,saved,active);
  const head=screen.querySelector('.fm-next-section-head');const showingAiResult=Boolean(active&&saved?.result);if(head){hidden(head,!showingAiResult);head.style.display=showingAiResult?'flex':'none'}text(head?.querySelector('h1'),showingAiResult?'AI 조회 결과':'');text(head?.querySelector('p'),showingAiResult?'조회 결과를 필터와 정렬로 조정할 수 있어요.':'');
  const allowed=active&&saved?.result?new Set(deterministicResults(normalizeResult(saved.result),readState()).map(entry=>entry.match.id)):null;
  const cards=[...screen.querySelectorAll('.fm-next-list .fm-next-match-card')];let visible=0;
  cards.forEach(node=>{const matches=!allowed||allowed.has(node.dataset.matchId);hidden(node,!matches);node.dataset.iaAiMatch=matches&&allowed?'true':'false';if(matches)visible++});
  const empty=ensureEmpty(screen);hidden(empty,!(active&&saved?.result&&visible===0));hidden(screen.querySelector('.fm-next-list'),Boolean(active&&saved?.result&&visible===0));
  text(screen.querySelector('.fm-discovery-count'),active&&saved?.result?`AI 결과 ${visible}개`:`${cards.length}개 경기`);
}
function enhance(){
  const screen=root.querySelector('[data-screen]');if(!screen)return;
  if(screen.dataset.screen==='home')configureHome(screen);else if(screen.dataset.screen==='discover')configureDiscover(screen);else if(screen.dataset.screen==='schedule')screen.dataset.iaRole='joined-match-status';else if(screen.dataset.screen==='profile')screen.dataset.iaRole='account-settings';
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;enhance()})}
root.addEventListener('pointerdown',event=>{const example=event.target.closest('[data-screen="home"] [data-ai-example]');if(example){searchIntent='example';setPressed(example)}},true);
root.addEventListener('submit',event=>{if(event.target.closest('[data-screen="home"] [data-ai-form]')&&searchIntent!=='example')searchIntent='submit'},true);
root.addEventListener('click',event=>{
  const action=event.target.closest('[data-ia-action]');
  if(action){if(action.dataset.iaAction==='show-all'){setScope(false);enhance()}else if(action.dataset.iaAction==='apply-ai'){setScope(true);enhance()}else if(action.dataset.iaAction==='edit-ai'){sessionStorage.setItem(FOCUS_KEY,'1');root.querySelector('[data-screen="discover"] [data-action="nav-home"]')?.click()}}
  if(event.target.closest('[data-action="reset-flow"]')){sessionStorage.removeItem(SNAPSHOT_KEY);sessionStorage.removeItem(SCOPE_KEY);sessionStorage.removeItem(FOCUS_KEY)}
},true);
new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
enhance();
window.__FOOTMATE_REAL_APP_IA__=Object.freeze({version:'1.0.0',roles:Object.freeze({home:'assistant-entry',discover:'result-exploration',schedule:'joined-match-status',profile:'account-settings'}),get assistant(){return snapshot()},get aiScope(){return scopeActive()}});
})();
