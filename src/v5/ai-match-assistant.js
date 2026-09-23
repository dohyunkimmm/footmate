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
const positionLabel=value=>value==='FW'?'공격수':value;
const levelLabel=value=>value==='초중급'?'초급':value==='중급+'?'고급':value;
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
  if(/고급|중급\+|중급 이상|빠른 템포/.test(text))level='중급+';else if(/초급|초중급/.test(text))level='초중급';else if(/입문|초보/.test(text))level='입문';else if(/중급/.test(text))level='중급';
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
function conditionLabels(result){const labels=[];if(result.region)labels.push(result.region);if(result.position)labels.push(positionLabel(result.position));if(result.level)labels.push(levelLabel(result.level));if(result.maxPrice!=null)labels.push(`${money(result.maxPrice)} 이하`);if(result.maxDistanceMin!=null)labels.push(`${result.maxDistanceMin}분 이내`);if(result.afterTime)labels.push(`${result.afterTime} 이후`);return labels.length?labels:['현재 설정 유지']}
function resultMarkup(entries){if(!entries.length)return '<div class="fm-ai-empty"><b>조건에 맞는 샘플 경기가 없어요.</b><span>거리·가격·시간 조건을 조금 넓혀 다시 요청해보세요.</span></div>';return entries.map(({item,match},index)=>`<button type="button" class="fm-ai-result" data-action="open-match" data-match-id="${escapeHtml(match.id)}"><span class="fm-ai-result-rank">${index+1}</span><span class="fm-ai-result-copy"><b>${escapeHtml(match.place)}</b><small>${escapeHtml(match.dateLabel)} · ${escapeHtml(levelLabel(match.level))} · ${escapeHtml(match.distance)} · ${money(match.price)}</small><em>${escapeHtml((item.reasons||[]).slice(0,2).join(' · ')||item.fit||match.fit)}</em></span><span aria-hidden="true">→</span></button>`).join('')}
function renderSaved(card,saved){
  if(!saved||!saved.result)return;
  if(['connected-ai','rules-fallback'].includes(saved.mode))lastMode=saved.mode;
  const state=readState(),result=normalizeResult(saved.result),entries=deterministicResults(result,state),status=card.querySelector('[data-ai-status]'),conditions=card.querySelector('[data-ai-conditions]'),results=card.querySelector('[data-ai-results]'),mode=card.querySelector('[data-ai-mode]');
  if(status)status.innerHTML=`<b>${escapeHtml(result.reply)}</b><span>${saved.mode==='connected-ai'?'AI가 자연어를 조건으로 해석했고, 순위는 기존 추천 엔진이 계산했습니다.':'AI 연결 실패 후 rules-based fallback으로 같은 추천 엔진을 사용했습니다.'}</span>`;
  if(conditions)conditions.innerHTML=conditionLabels(result).map(label=>`<span>${escapeHtml(label)}</span>`).join('');if(results)results.innerHTML=resultMarkup(entries);if(mode){mode.textContent=saved.mode==='connected-ai'?'AI connected':'Rules fallback';mode.dataset.mode=saved.mode}
}
async function run(card,message){
  const input=card.querySelector('[data-ai-input]'),submit=card.querySelector('[data-ai-submit]'),status=card.querySelector('[data-ai-status]'),results=card.querySelector('[data-ai-results]'),conditions=card.querySelector('[data-ai-conditions]'),mode=card.querySelector('[data-ai-mode]');
  if(!message.trim())return;submit.disabled=true;input.disabled=true;if(status)status.innerHTML='<b>AI가 요청을 해석하고 있어요.</b><span>경기 후보와 순위는 기존 추천 엔진에서 확인합니다.</span>';if(results)results.innerHTML='<div class="fm-ai-loading" aria-hidden="true"><span></span><span></span><span></span></div>';if(conditions)conditions.innerHTML='';
  const state=readState();let result,runMode='connected-ai';
  try{result=await requestAi(message,{region:state.region,position:state.position,level:state.level});lastMode='connected-ai'}catch{result=fallbackParse(message);runMode='rules-fallback';lastMode='rules-fallback'}
  try{const saved={version:VERSION,message:message.slice(0,240),mode:runMode,result,updatedAt:new Date().toISOString()};saveAssistant(saved);renderSaved(card,saved);if(mode)mode.dataset.mode=runMode}finally{submit.disabled=false;input.disabled=false;input.focus()}
}
function shell(){
  const card=document.createElement('section');card.className='fm-ai-card';card.dataset.aiAssistant=VERSION;card.setAttribute('aria-labelledby','fm-ai-title');
  card.innerHTML=`<div class="fm-ai-head"><div><span class="fm-ai-kicker">AI Match Assistant</span><span class="fm-ai-mode" data-ai-mode data-mode="idle">AI ready</span></div><strong id="fm-ai-title">말로 경기 조건을 알려주세요.</strong><p>AI는 요청을 검색 조건으로 바꾸고, 실제 경기 순위는 FootMate의 deterministic recommendation이 결정합니다.</p></div><form class="fm-ai-form" data-ai-form><label class="fm-ai-label" for="fm-ai-query">찾고 싶은 경기 조건</label><div class="fm-ai-input-row"><input id="fm-ai-query" data-ai-input type="text" maxlength="240" autocomplete="off" placeholder="예: 8시 이후, 2만원 이하, 가까운 고급 공격수 경기"><button type="submit" data-ai-submit>AI로 찾기</button></div></form><div class="fm-ai-examples" aria-label="AI 검색 예시"><button type="button" data-ai-example="8시 이후, 2만원 이하, 가까운 고급 공격수 경기">8시 이후 · 2만원 이하</button><button type="button" data-ai-example="수원 인계에서 초급 경기 찾아줘">인계 · 초급</button><button type="button" data-ai-example="20분 안쪽에서 GK 자리 있는 경기">20분 이내 · GK</button></div><div class="fm-ai-status" data-ai-status aria-live="polite"><b>자연어로 조건을 입력해보세요.</b><span>AI 장애나 지연 시 기존 rules-based 검색으로 자동 전환합니다.</span></div><div class="fm-ai-conditions" data-ai-conditions></div><div class="fm-ai-results" data-ai-results></div><div class="fm-ai-guardrail">참가·결제는 AI가 자동 실행하지 않습니다. 실제 경기·가격·자리 데이터는 현재 샘플 레코드와 추천 엔진만 사용합니다.</div>`;
  const form=card.querySelector('[data-ai-form]'),input=card.querySelector('[data-ai-input]');form.addEventListener('submit',event=>{event.preventDefault();run(card,input.value)});card.querySelectorAll('[data-ai-example]').forEach(button=>button.addEventListener('click',()=>{input.value=button.dataset.aiExample||'';run(card,input.value)}));renderSaved(card,readAssistant());return card;
}
function applyPresentationLabels(){
  if(!root)return;
  const fw=root.querySelector('.fm-next-choice[data-value="FW"]');
  if(fw){const title=fw.querySelector('b'),copy=fw.querySelector('span');if(title)title.textContent='공격수';if(copy)copy.textContent='전방에서 공격을 전개해요';}
  const beginner=root.querySelector('.fm-next-choice[data-value="초중급"] b');if(beginner)beginner.textContent='초급';
  const advanced=root.querySelector('.fm-next-choice[data-value="중급+"] b');if(advanced)advanced.textContent='고급';
}
function mount(){if(!root)return;const screen=root.querySelector('[data-screen="home"],[data-screen="discover"]');if(!screen||screen.querySelector('[data-ai-assistant]'))return;const card=shell();if(screen.dataset.screen==='home'){const greeting=screen.querySelector('.fm-next-greeting');if(greeting)greeting.after(card);else screen.prepend(card)}else{const anchor=screen.querySelector('.fm-next-match-tags');if(anchor)anchor.before(card);else screen.querySelector('.fm-next-section')?.append(card)}}
window.__FOOTMATE_AI__=Object.freeze({version:VERSION,workflow:'Context → Plan → Tools → Guardrail → Observe',role:'natural-language constraint interpretation',rankingOwner:'deterministic recommendation engine',requestTimeoutMs:AI_REQUEST_TIMEOUT_MS,storageKey:AI_STORAGE_KEY,hitl:Object.freeze(['join','payment']),get mode(){return lastMode},query:async message=>{const state=readState();try{const result=await requestAi(message,{region:state.region,position:state.position,level:state.level});lastMode='connected-ai';return Object.freeze({mode:lastMode,result,results:deterministicResults(result,state).map(entry=>entry.match.id)})}catch{const result=fallbackParse(message);lastMode='rules-fallback';return Object.freeze({mode:lastMode,result,results:deterministicResults(result,state).map(entry=>entry.match.id)})}}});
document.documentElement.dataset.footmateAiVersion=VERSION;if(root)root.dataset.aiAssistant='available';const observer=root?new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;applyPresentationLabels();mount()})}):null;if(observer)observer.observe(root,{childList:true,subtree:true});applyPresentationLabels();mount();