import {MATCHES,createState} from './data.js';
import {footmatePlatform} from './platform/application/platform.js';

const root=document.getElementById('footmate-next');
const DISCOVERY_VERSION='4.2.0';
const DISCOVERY_STORAGE_KEY=footmatePlatform.storageKeys.discovery;
const discoveryRepository=footmatePlatform.repositories.discovery;
const params=new URLSearchParams(location.search);
const requestedMode=params.get('mode');
const mode=['guided','evidence'].includes(requestedMode)?requestedMode:'real';

const defaults=Object.freeze({date:'all',time:'all',distance:'all',price:'all',position:'all',sort:'fit'});
const allowed=Object.freeze({
  date:new Set(['all','tomorrow','2days','4days']),
  time:new Set(['all','19','20','21plus']),
  distance:new Set(['all','15','20','25']),
  price:new Set(['all','11000','12000','13000']),
  position:new Set(['all','MF','FW','DF','GK']),
  sort:new Set(['fit','distance','closing'])
});
const queryKeys=Object.freeze({date:'d_date',time:'d_time',distance:'d_distance',price:'d_price',position:'d_position',sort:'d_sort'});
const labels=Object.freeze({
  date:{tomorrow:'내일', '2days':'2일 이내','4days':'4일 이내'},
  time:{'19':'19시대','20':'20시대','21plus':'21시 이후'},
  distance:{'15':'15분 이내','20':'20분 이내','25':'25분 이내'},
  price:{'11000':'11,000원 이하','12000':'12,000원 이하','13000':'13,000원 이하'},
  position:{MF:'MF 자리',FW:'FW 자리',DF:'DF 자리',GK:'GK 자리'}
});

let filters=readInitialFilters();
let lastFilterTrigger=null;
let applying=false;

function readSession(){
  if(mode!=='real')return createState(mode==='evidence'?{setupComplete:true,route:'home',signedIn:true}:{});
  return createState(footmatePlatform.session.read()||{});
}

function normalize(candidate={}){
  const next={...defaults};
  for(const key of Object.keys(defaults)){
    const value=String(candidate[key]??defaults[key]);
    if(allowed[key].has(value))next[key]=value;
  }
  return next;
}

function readInitialFilters(){
  if(mode!=='real')return {...defaults};
  const url=new URL(location.href);
  const fromUrl={};
  let hasUrlState=false;
  for(const [key,param] of Object.entries(queryKeys)){
    if(url.searchParams.has(param)){
      fromUrl[key]=url.searchParams.get(param);
      hasUrlState=true;
    }
  }
  if(hasUrlState)return normalize(fromUrl);
  return normalize(discoveryRepository.read({})||{});
}

function persist(){
  if(mode!=='real')return;
  discoveryRepository.write(filters);
  const url=new URL(location.href);
  for(const [key,param] of Object.entries(queryKeys)){
    if(filters[key]===defaults[key])url.searchParams.delete(param);
    else url.searchParams.set(param,filters[key]);
  }
  history.replaceState(history.state,'',url);
}

function clearPersistedDiscovery(){
  filters={...defaults};
  if(mode!=='real')return;
  discoveryRepository.clear();
  const url=new URL(location.href);
  Object.values(queryKeys).forEach(key=>url.searchParams.delete(key));
  history.replaceState(history.state,'',url);
}

function recommendationRows(state){
  const api=window.__FOOTMATE_RECOMMENDATION__;
  const ranked=api?.rank?.(state)||[];
  if(ranked.length){
    return ranked.map(row=>({
      ...row,
      match:MATCHES.find(match=>match.id===row.id)
    })).filter(row=>row.match);
  }
  return MATCHES.map((match,index)=>({id:match.id,score:100-index,fit:match.fit,reasons:[],match}));
}

function scheduleMeta(match){
  const timeMatch=match.dateLabel.match(/(\d{1,2}):(\d{2})\s*$/);
  const hour=timeMatch?Number(timeMatch[1]):0;
  const minute=timeMatch?Number(timeMatch[2]):0;
  const timeMinutes=hour*60+minute;
  let offset=99;
  for(let days=1;days<=7;days+=1){
    const date=new Date();
    date.setHours(12,0,0,0);
    date.setDate(date.getDate()+days);
    const day=new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric'}).format(date);
    if(match.dateLabel.includes(day)){offset=days;break;}
  }
  return {offset,timeMinutes};
}

function matchesFilters(match){
  const schedule=scheduleMeta(match);
  if(filters.date==='tomorrow'&&schedule.offset!==1)return false;
  if(filters.date==='2days'&&schedule.offset>2)return false;
  if(filters.date==='4days'&&schedule.offset>4)return false;
  if(filters.time==='19'&&(schedule.timeMinutes<19*60||schedule.timeMinutes>=20*60))return false;
  if(filters.time==='20'&&(schedule.timeMinutes<20*60||schedule.timeMinutes>=21*60))return false;
  if(filters.time==='21plus'&&schedule.timeMinutes<21*60)return false;
  if(filters.distance!=='all'&&Number(match.distanceMin||99)>Number(filters.distance))return false;
  if(filters.price!=='all'&&Number(match.price||0)>Number(filters.price))return false;
  if(filters.position!=='all'&&Number(match.positionSlots?.[filters.position]||0)<=0)return false;
  return true;
}

function sortedRows(state){
  const rows=recommendationRows(state).filter(row=>matchesFilters(row.match));
  if(filters.sort==='distance'){
    rows.sort((a,b)=>(a.match.distanceMin||99)-(b.match.distanceMin||99)||b.score-a.score||a.id.localeCompare(b.id));
  }else if(filters.sort==='closing'){
    rows.sort((a,b)=>((a.match.capacity||0)-(a.match.joined||0))-((b.match.capacity||0)-(b.match.joined||0))||b.score-a.score||a.id.localeCompare(b.id));
  }else{
    rows.sort((a,b)=>b.score-a.score||(a.match.distanceMin||99)-(b.match.distanceMin||99)||a.id.localeCompare(b.id));
  }
  return rows;
}

function money(value){return new Intl.NumberFormat('ko-KR').format(value)+'원'}
function iconSpark(){return '<svg class="fm-next-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 1.3 4.2L17.5 9l-4.2 1.8L12 15l-1.3-4.2L6.5 9l4.2-1.8z"/></svg>'}

function spotLabel(match,state){
  const position=filters.position!=='all'?filters.position:state.position;
  const count=Number(match.positionSlots?.[position]||0);
  return count>0?`${position} ${count}자리`:match.spot;
}

function card(row,index,state){
  const match=row.match;
  return `<button type="button" class="fm-next-match-card" data-action="open-match" data-match-id="${match.id}" data-recommendation-score="${row.score}" data-discovery-order="${index+1}" aria-label="${match.place} 상세 보기">
    <div class="fm-next-match-card-media">
      <div class="fm-next-match-date"><span>${match.dateLabel}</span>${index===0?`<span class="fm-next-fit-badge">${iconSpark()} ${filters.sort==='fit'?'추천 1순위':'정렬 1순위'}</span>`:''}</div>
      <div class="fm-next-match-place">${match.place}</div>
    </div>
    <div class="fm-next-match-body">
      <div class="fm-next-match-tags"><span class="fm-next-tag fm-next-tag--strong">${row.fit||match.fit}</span><span class="fm-next-tag">${match.distance}</span><span class="fm-next-tag">${spotLabel(match,state)}</span></div>
      <div class="fm-next-match-footer"><div><small>${match.region} · ${match.format} · ${match.duration}</small><b>${match.level} · ${match.surface}</b></div><div class="fm-next-price">${money(match.price)}</div></div>
    </div>
  </button>`;
}

function activeFilters(){
  return ['date','time','distance','price','position'].filter(key=>filters[key]!==defaults[key]);
}

function activeLabel(key){return labels[key]?.[filters[key]]||filters[key]}

function ensureChrome(screen){
  let chrome=screen.querySelector('.fm-discovery-chrome');
  if(chrome)return chrome;
  const list=screen.querySelector('.fm-next-list');
  if(!list)return null;
  chrome=document.createElement('div');
  chrome.className='fm-discovery-chrome';
  chrome.innerHTML=`<div class="fm-discovery-toolbar">
    <button type="button" class="fm-discovery-filter-button" data-discovery-action="open-filters" aria-haspopup="dialog">필터</button>
    <label class="fm-discovery-sort"><span>정렬</span><select data-discovery-sort aria-label="경기 정렬"><option value="fit">적합도 높은 순</option><option value="distance">거리 가까운 순</option><option value="closing">마감 임박 순</option></select></label>
  </div>
  <div class="fm-discovery-summary"><div class="fm-discovery-active" aria-label="적용된 필터"></div><span class="fm-discovery-count" role="status" aria-live="polite"></span></div>`;
  list.before(chrome);
  return chrome;
}

function updateChrome(screen,total){
  const chrome=ensureChrome(screen);
  if(!chrome)return;
  const active=activeFilters();
  const button=chrome.querySelector('[data-discovery-action="open-filters"]');
  if(button){
    button.textContent=active.length?`필터 ${active.length}`:'필터';
    button.setAttribute('aria-label',active.length?`필터 ${active.length}개 적용됨`:'필터 열기');
  }
  const sort=chrome.querySelector('[data-discovery-sort]');
  if(sort)sort.value=filters.sort;
  const summary=chrome.querySelector('.fm-discovery-active');
  if(summary){
    summary.innerHTML=active.length?active.map(key=>`<button type="button" class="fm-discovery-chip" data-discovery-action="remove-filter" data-filter-key="${key}" aria-label="${activeLabel(key)} 필터 해제">${activeLabel(key)} <span aria-hidden="true">×</span></button>`).join(''):'<span class="fm-discovery-default-copy">추가 필터 없음</span>';
    if(active.length)summary.insertAdjacentHTML('beforeend','<button type="button" class="fm-discovery-clear" data-discovery-action="clear-filters">전체 해제</button>');
  }
  const count=chrome.querySelector('.fm-discovery-count');
  if(count)count.textContent=`${total}개 경기`;
}

function renderResults(screen,state){
  const list=screen.querySelector('.fm-next-list');
  if(!list)return;
  const rows=sortedRows(state);
  updateChrome(screen,rows.length);
  if(rows.length){
    list.innerHTML=rows.map((row,index)=>card(row,index,state)).join('');
  }else{
    list.innerHTML=`<div class="fm-discovery-empty" role="status"><span class="fm-discovery-empty-icon" aria-hidden="true">↗</span><h2>조건에 맞는 경기가 없어요.</h2><p>날짜·시간·거리·가격 범위를 넓히면 다시 비교할 수 있어요.</p><div class="fm-discovery-empty-actions"><button type="button" data-discovery-action="relax-filters">조건 넓히기</button><button type="button" data-discovery-action="clear-filters">전체 조건 해제</button></div></div>`;
  }
  const heading=screen.querySelector('.fm-next-section-head h1');
  const copy=screen.querySelector('.fm-next-section-head p');
  if(heading)heading.textContent='경기 찾기';
  if(copy)copy.textContent=`${state.region} · ${state.level} · ${state.position} 추천을 기준으로 직접 탐색할 수 있어요.`;
  screen.dataset.discoveryVersion=DISCOVERY_VERSION;
  screen.dataset.discoveryResultCount=String(rows.length);
}

function option(value,label,current){return `<option value="${value}"${current===value?' selected':''}>${label}</option>`}
function selectField(key,title,items){return `<label class="fm-discovery-field"><span>${title}</span><select data-discovery-field="${key}">${items.map(([value,label])=>option(value,label,filters[key])).join('')}</select></label>`}

function openFilters(screen,trigger){
  closeFilters(false);
  lastFilterTrigger=trigger||screen.querySelector('[data-discovery-action="open-filters"]');
  const backdrop=document.createElement('div');
  backdrop.className='fm-discovery-sheet-backdrop';
  backdrop.dataset.discoverySheet='true';
  backdrop.innerHTML=`<section class="fm-discovery-sheet" role="dialog" aria-modal="true" aria-labelledby="fm-discovery-title">
    <div class="fm-discovery-sheet-head"><div><small>DISCOVERY FILTERS</small><h2 id="fm-discovery-title">경기 조건 좁히기</h2></div><button type="button" class="fm-discovery-close" data-discovery-action="close-filters" aria-label="필터 닫기">×</button></div>
    <p class="fm-discovery-sheet-copy">추천 기준은 유지하고, 지금 가능한 경기만 빠르게 좁혀보세요.</p>
    <div class="fm-discovery-fields">
      ${selectField('date','날짜',[['all','전체'],['tomorrow','내일'],['2days','2일 이내'],['4days','4일 이내']])}
      ${selectField('time','시간',[['all','전체'],['19','19시대'],['20','20시대'],['21plus','21시 이후']])}
      ${selectField('distance','거리',[['all','전체'],['15','15분 이내'],['20','20분 이내'],['25','25분 이내']])}
      ${selectField('price','가격',[['all','전체'],['11000','11,000원 이하'],['12000','12,000원 이하'],['13000','13,000원 이하']])}
      ${selectField('position','포지션',[['all','전체'],['MF','MF 자리 있음'],['FW','FW 자리 있음'],['DF','DF 자리 있음'],['GK','GK 자리 있음']])}
    </div>
    <div class="fm-discovery-sheet-actions"><button type="button" class="fm-discovery-reset" data-discovery-action="clear-filters">전체 해제</button><button type="button" class="fm-discovery-done" data-discovery-action="close-filters">결과 보기</button></div>
  </section>`;
  screen.append(backdrop);
  document.body.classList.add('fm-discovery-dialog-open');
  requestAnimationFrame(()=>backdrop.querySelector('.fm-discovery-close')?.focus());
}

function closeFilters(restore=true){
  const sheet=root.querySelector('[data-discovery-sheet="true"]');
  if(sheet)sheet.remove();
  document.body.classList.remove('fm-discovery-dialog-open');
  if(restore&&lastFilterTrigger?.isConnected)lastFilterTrigger.focus();
}

function updateFilters(patch){
  filters=normalize({...filters,...patch});
  persist();
  const screen=root.querySelector('[data-screen="discover"]');
  if(screen){
    screen.dataset.fmDiscoverySignature='';
    apply();
  }
}

function apply(){
  if(applying)return;
  const screen=root.querySelector('[data-screen="discover"]');
  if(!screen)return;
  const state=readSession();
  const signature=[state.region,state.position,state.level,...Object.values(filters)].join('|');
  if(screen.dataset.fmDiscoverySignature===signature)return;
  applying=true;
  screen.dataset.fmDiscoverySignature=signature;
  ensureChrome(screen);
  renderResults(screen,state);
  applying=false;
}

root?.addEventListener('click',event=>{
  const discoveryTarget=event.target.closest('[data-discovery-action]');
  if(discoveryTarget){
    const action=discoveryTarget.dataset.discoveryAction;
    if(action==='open-filters'){
      const screen=root.querySelector('[data-screen="discover"]');
      if(screen)openFilters(screen,discoveryTarget);
      return;
    }
    if(action==='close-filters'){closeFilters();return;}
    if(action==='clear-filters'){updateFilters({date:'all',time:'all',distance:'all',price:'all',position:'all'});return;}
    if(action==='relax-filters'){updateFilters({date:'all',time:'all',distance:'all',price:'all'});return;}
    if(action==='remove-filter'){
      const key=discoveryTarget.dataset.filterKey;
      if(key&&key in defaults)updateFilters({[key]:defaults[key]});
      return;
    }
  }
  const appTarget=event.target.closest('[data-action]');
  if(appTarget?.dataset.action==='reset-flow')clearPersistedDiscovery();
},true);

root?.addEventListener('change',event=>{
  const sort=event.target.closest('[data-discovery-sort]');
  if(sort){updateFilters({sort:sort.value});return;}
  const field=event.target.closest('[data-discovery-field]');
  if(field){updateFilters({[field.dataset.discoveryField]:field.value});}
});

root?.addEventListener('keydown',event=>{
  const dialog=root.querySelector('.fm-discovery-sheet[role="dialog"]');
  if(!dialog)return;
  if(event.key==='Escape'){
    event.preventDefault();
    closeFilters();
    return;
  }
  if(event.key!=='Tab')return;
  const focusable=[...dialog.querySelectorAll('button:not([disabled]),select:not([disabled]),[href],input:not([disabled])')].filter(node=>node.offsetParent!==null);
  if(!focusable.length)return;
  const first=focusable[0];
  const last=focusable[focusable.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
});

window.addEventListener('popstate',()=>{
  filters=readInitialFilters();
  requestAnimationFrame(()=>{const screen=root?.querySelector('[data-screen="discover"]');if(screen)screen.dataset.fmDiscoverySignature='';apply();});
});

if(root){
  let queued=false;
  const observer=new MutationObserver(()=>{
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;apply()});
  });
  observer.observe(root,{childList:true,subtree:true});
  window.__FOOTMATE_DISCOVERY__={version:DISCOVERY_VERSION,storageKey:DISCOVERY_STORAGE_KEY,getState:()=>({...filters}),reset:()=>updateFilters({...defaults})};
  apply();
}
