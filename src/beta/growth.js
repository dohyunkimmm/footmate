import {openQuickFilterIds,restoreQuickFilters} from './filter-interaction.js';
import {emitDiscoveryMeasurement} from './measurement-events.js';
import {matchesRecommendationConditions,recommendationFingerprint,validRecommendationCache,diverseRecommendationCandidates} from './domain/recommendation-discovery.js';
import {isDemoEntry,isFutsalMatch,demoCatalog} from './demo-catalog.js';
const root=document.getElementById('footmate-beta');
const SESSION_KEY='footmate:beta:auth:v1';
const TABLES=['matches','match_slots','participations','beta_notifications','beta_waitlist','beta_match_feedback'];
const POSITIONS={MF:'MF · 미드필더',FW:'FW · 공격수',DF:'DF · 수비수',GK:'GK · 골키퍼'};

if(root){
let config=null,profile=null,matches=[],participations=[],waitlist=[],feedback=[],recommendation=null;
const PREFERENCES_KEY='footmate:beta:preferences:v1';
const DEFAULT_PREFERENCES={sport:'futsal',region:'',level:'',position:'',afterTime:'',beforeTime:'',dateWindow:''};
let preferences=null,draft=null,editing=true,wizardStep=1,aiOrder=[],initialRecommendationRequested=false,activeRecommendationController=null,recommendationRequestId=0;
try{const saved=JSON.parse(localStorage.getItem(PREFERENCES_KEY)||'null');if(saved&&['football','futsal',''].includes(saved.sport)&&['','입문','초중급','중급','중급+'].includes(saved.level)&&['','MF','FW','DF','GK'].includes(saved.position)&&['','09:00','14:00','18:00','20:00'].includes(saved.afterTime)&&typeof saved.region==='string'){preferences={...DEFAULT_PREFERENCES,...saved,sport:'futsal',dateWindow:['','today','tomorrow','weekend'].includes(saved.dateWindow)?saved.dateWindow:'',beforeTime:['','12:00','18:00','22:00'].includes(saved.beforeTime)?saved.beforeTime:''};editing=false}}catch{}
let realtimeState='connecting',socket=null,heartbeat=null,reconnectTimer=null,busy=false,message='',refreshTimer=null;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]||c));
const session=()=>{try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}};
const accessToken=()=>String(session()?.accessToken||'');
const jwtUserId=()=>{try{const part=accessToken().split('.')[1]||'';const padded=(part.replace(/-/g,'+').replace(/_/g,'/')+'==='.slice((part.length+3)%4));return JSON.parse(atob(padded))?.sub||''}catch{return''}};
const startLabel=v=>new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'short',day:'numeric',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(v));
const headers=(auth=true)=>({apikey:config?.publishableKey||'',...(auth&&accessToken()?{authorization:`Bearer ${accessToken()}`}:{})});
async function request(path,{auth=true,...options}={}){const response=await fetch(`${config.url}${path}`,{...options,headers:{...headers(auth),...(options.headers||{})}});const data=await response.json().catch(()=>null);if(!response.ok)throw new Error(data?.message||data?.error_description||data?.error||`요청 실패 (${response.status})`);return data}
const rpc=(name,params)=>request(`/rest/v1/rpc/${name}`,{method:'POST',headers:{'content-type':'application/json',prefer:'return=representation'},body:JSON.stringify(params||{})});
async function loadConfig(){if(config)return;const res=await fetch('/api/beta-config',{cache:'no-store'});config=await res.json();if(!res.ok||!config?.connected)throw new Error('Beta backend config unavailable')}
async function loadState(){
 await loadConfig();
 const q='/rest/v1/matches?select=id,title,venue_name,area_label,address,region,level,positions,starts_at,price_krw,capacity_total,joined_count,remaining_spots,format_label,surface,duration_minutes,status,cancel_cutoff_at,check_in_opens_at,match_slots(position,capacity_total,joined_count,remaining_spots)&status=in.(open,full,completed)&order=starts_at.asc&limit=80';
 const rows=isDemoEntry?demoCatalog(jwtUserId()):await request(q,{auth:false});
 matches=(Array.isArray(rows)?rows:[]).filter(isFutsalMatch);
 if(!isDemoEntry&&accessToken()&&!matches.some(m=>['open','full'].includes(m.status)&&new Date(m.starts_at)>new Date()))matches=[...matches,...demoCatalog(jwtUserId())];
 if(accessToken()&&!isDemoEntry){
  const uid=jwtUserId();
  const rows=await Promise.all([
   request(`/rest/v1/profiles?select=*&id=eq.${encodeURIComponent(uid)}&limit=1`).catch(()=>[]),
   request('/rest/v1/participations?select=*&order=created_at.desc').catch(()=>[]),
   request('/rest/v1/beta_waitlist?select=*&order=created_at.asc').catch(()=>[]),
   request('/rest/v1/beta_match_feedback?select=*&order=created_at.desc').catch(()=>[])
  ]);
  profile=rows[0]?.[0]||null;participations=rows[1]||[];waitlist=rows[2]||[];feedback=rows[3]||[];
 }else{profile=null;participations=[];waitlist=[];feedback=[]}
 if(preferences){
  const fingerprint=recommendationFingerprint(matches,preferences);
  let cached=null;try{cached=JSON.parse(localStorage.getItem('footmate:beta:ranking:v1')||'null')}catch{}
  aiOrder=validRecommendationCache(cached,fingerprint)?cached.ids:[];
  if(!busy&&!aiOrder.length)void rankWithAI();
  else{publishRecommendations();render()}
 }else render();

}
const slotLeft=(m,p)=>Number((m.match_slots||[]).find(x=>x.position===p)?.remaining_spots??0);
const queued=id=>waitlist.find(x=>x.match_id===id&&x.status==='queued');
const savedFeedback=id=>feedback.find(x=>x.match_id===id);
function matchSport(m){return isFutsalMatch(m)?'futsal':''}
function matchesConstraint(m,r){return (!r.sport||matchSport(m)===r.sport)&&matchesRecommendationConditions(m,r)}
function rank(r){return matches.filter(m=>matchesConstraint(m,r)).map(m=>{let score=0,reasons=[];if(r.region){score+=40;reasons.push('선택한 지역 일치')}if(r.position){const left=slotLeft(m,r.position);if(left>0){score+=30;reasons.push(`${r.position} ${left}자리`)}else reasons.push(`${r.position} 대기 가능`)}if(r.level){score+=20;reasons.push('선택한 실력 일치')}if(Number(m.price_krw||0)===0){score+=5;}return{m,score,reasons}}).sort((a,b)=>b.score-a.score||new Date(a.m.starts_at)-new Date(b.m.starts_at))}
function publishRecommendations(){
 const ranked=preferences?rank({...preferences,sport:'futsal'}):null;
 if(ranked&&aiOrder.length){const positions=new Map(aiOrder.map((id,i)=>[id,i]));ranked.sort((a,b)=>(positions.get(a.m.id)??999)-(positions.get(b.m.id)??999))}
 recommendation=preferences?{ranked}:null;
 window.dispatchEvent(new CustomEvent('footmate:beta:recommendations',{detail:{conditions:JSON.stringify(preferences),busy,reactions:feedback.filter(f=>f.repeat_intent===true).map(f=>{const m=matches.find(m=>m.id===f.match_id&&!m.is_demo);return m?{matchId:m.id,userId:f.user_id,kind:'interested',venue:m.venue_name,at:Date.parse(f.updated_at||f.created_at),scope:'live'}:null}).filter(Boolean),ids:ranked?.map(x=>x.m.id)??null,reasons:Object.fromEntries((ranked||[]).map(x=>[x.m.id,x.reasons]))}}));
}
async function recommend(form){
 const data=new FormData(form);
 return applyPreferences({...DEFAULT_PREFERENCES,...(draft||{}),...Object.fromEntries(data)});
}
async function applyPreferences(next){
 draft=null;initialRecommendationRequested=true;preferences={...next,sport:'futsal'};
 try{localStorage.setItem(PREFERENCES_KEY,JSON.stringify(preferences))}catch{}
 editing=false;emitDiscoveryMeasurement('filters_applied',{isDemo:matches.length>0&&matches.every(m=>m.is_demo),filterCount:Object.entries(preferences).filter(([key,value])=>key!=='sport'&&value).length});await rankWithAI();
}
async function rankWithAI(){
 if(!preferences)return;
 const requestId=++recommendationRequestId;activeRecommendationController?.abort();busy=true;message='';aiOrder=[];publishRecommendations();render();
 const controller=new AbortController();activeRecommendationController=controller;const timeout=setTimeout(()=>controller.abort(),9000);
 const fingerprint=recommendationFingerprint(matches,preferences);
 const candidates=diverseRecommendationCandidates(rank(preferences));
 const started=Date.now();emitDiscoveryMeasurement('recommendation_requested',{candidateCount:candidates.length,isDemo:candidates.length>0&&candidates.every(row=>row.m.is_demo)});
 const labels=['풋살',preferences.region,preferences.level,preferences.position,preferences.afterTime?`${preferences.afterTime} 이후`:''].filter(Boolean);
 try{
  if(!candidates.length)return;
  const res=await fetch('/api/ai-match-assistant',{method:'POST',signal:controller.signal,headers:{'content-type':'application/json'},body:JSON.stringify({task:'recommend',candidates:candidates.map(({m})=>({id:m.id,region:m.region,level:m.level,startsAt:m.starts_at,format:m.format_label,remaining:m.remaining_spots,positionSpots:preferences.position?slotLeft(m,preferences.position):m.remaining_spots,price:m.price_krw})),message:labels.join(' ')||'조건 제한 없이 경기 추천',preferences:{region:preferences.region||null,position:preferences.position||null,level:preferences.level||null}})});
  const body=await res.json();if(requestId!==recommendationRequestId)return;if(!res.ok||!Array.isArray(body?.rankedMatchIds))throw new Error('unavailable');
  if(fingerprint!==recommendationFingerprint(matches,preferences))throw new Error('catalog-changed');
  // Explicit choices remain authoritative. AI must not add or relax conditions the user did not select.
  const allowed=new Set(candidates.map(({m})=>m.id));
  aiOrder=[...new Set(body.rankedMatchIds.filter(id=>allowed.has(id)))];if(!aiOrder.length)throw new Error('invalid-ranking');
  try{localStorage.setItem('footmate:beta:ranking:v1',JSON.stringify({conditions:JSON.stringify(preferences),ids:aiOrder,fingerprint,createdAt:Date.now()}))}catch{}publishRecommendations();
 }catch{if(requestId===recommendationRequestId)message='AI 연결이 지연되어 선택한 조건으로 찾았어요.'}
 finally{clearTimeout(timeout);if(requestId===recommendationRequestId){busy=false;publishRecommendations();render();emitDiscoveryMeasurement('recommendation_completed',{resultCount:recommendation?.ranked.length||0,durationMs:Date.now()-started,isDemo:recommendation?.ranked.length>0&&recommendation.ranked.every(row=>row.m.is_demo),mode:aiOrder.length?'ai':'rules'});}}
}
async function waitlistAction(id,cancel){busy=true;render();try{if(cancel)await rpc('cancel_beta_waitlist',{p_match_id:id});else{if(!profile?.position)throw new Error('선호 포지션을 먼저 설정해주세요.');await rpc('join_beta_waitlist',{p_match_id:id,p_position:profile.position})}message=cancel?'대기 신청을 취소했습니다.':'대기 신청했습니다. 빈 자리가 생기면 자동 참가 전환됩니다.';await loadState()}catch(e){message=String(e?.message||e)}finally{busy=false;render()}}
async function submitFeedback(form){const data=new FormData(form);busy=true;render();try{await rpc('submit_beta_match_feedback',{p_match_id:form.dataset.matchId,p_difficulty:Number(data.get('difficulty')),p_satisfaction:Number(data.get('satisfaction')),p_repeat_intent:data.get('repeatIntent')==='on',p_note:String(data.get('note')||'')||null});message='경기 후 피드백을 저장했습니다.';await loadState()}catch(e){message=String(e?.message||e)}finally{busy=false;render()}}
const FILTERS={
 dateWindow:{label:'경기 날짜',short:'날짜',values:[['','날짜 전체'],['today','오늘'],['tomorrow','내일'],['weekend','다가오는 주말']]},
 beforeTime:{label:'시작 시간 상한',short:'시작 상한',values:[['','상한 없음'],['12:00','낮 12시 전 시작'],['18:00','저녁 6시 전 시작'],['22:00','밤 10시 전 시작']]},
 region:{label:'활동 지역',short:'지역',values:[['','지역 전체'],['수원 · 영통','수원 · 영통'],['수원 · 인계','수원 · 인계'],['용인 · 기흥','용인 · 기흥'],['서울 · 강남','서울 · 강남']]},
 level:{label:'실력',short:'실력',values:[['','상관없음'],...['입문','초중급','중급','중급+'].map(v=>[v,v])]},
 position:{label:'포지션',short:'포지션',values:[['','상관없음'],...Object.entries(POSITIONS)]},
 afterTime:{label:'선호 시간',short:'시간',values:[['','시간 전체'],['09:00','오전 9시 이후'],['14:00','오후 2시 이후'],['18:00','저녁 6시 이후'],['20:00','저녁 8시 이후']]}
};
function choices(name,label,values,p,prefix=''){
 return `<fieldset class="fm-beta-choice-group"><legend>${esc(prefix+label)}</legend><div>${values.map(([value,text])=>`<label><input type="radio" name="${name}" value="${esc(value)}" aria-label="${esc(text)}" ${p[name]===value?'checked':''}><span>${esc(text)}</span></label>`).join('')}</div></fieldset>`;
}
function quickFilters(p){
 const selectedCount=['region','level','position','afterTime','beforeTime','dateWindow'].filter(name=>p[name]).length;
 return `<div class="fm-beta-quick-filters" aria-label="추천 필터"><p class="fm-beta-filter-count">${selectedCount?`조건 ${selectedCount}개 선택됨`:'원하는 조건을 골라보세요'}</p>${Object.entries(FILTERS).filter(([name])=>!['dateWindow','beforeTime'].includes(name)).map(([name,filter])=>`<details data-filter-active="${Boolean(p[name]||(name==='afterTime'&&(p.dateWindow||p.beforeTime)))}"><summary id="quick-filter-${name}">${esc(filter.short)} · ${esc(filter.values.find(([value])=>value===p[name])?.[1]||'전체')}${name==='afterTime'&&p.dateWindow?' · '+esc(FILTERS.dateWindow.values.find(([value])=>value===p.dateWindow)?.[1]||''):''}${name==='afterTime'&&p.beforeTime?' · '+esc(p.beforeTime)+' 전':''}</summary><form data-growth-form="quick-filter">${choices(name,filter.label,filter.values,p,'빠른 ')}${name==='afterTime'?choices('dateWindow',FILTERS.dateWindow.label,FILTERS.dateWindow.values,p,'빠른 ')+choices('beforeTime',FILTERS.beforeTime.label,FILTERS.beforeTime.values,p,'빠른 '):''}</form></details>`).join('')}</div>`;
}
function wizardPanel(){
 const p={...DEFAULT_PREFERENCES,...(draft||{})};
 const choice=(name)=>choices(name,FILTERS[name].label,FILTERS[name].values,p);
 return `<section class="fm-beta-panel fm-beta-onboarding"><div class="fm-beta-onboarding-progress" aria-label="설정 ${wizardStep} / 2"><i class="is-active"></i><i class="${wizardStep===2?'is-active':''}"></i><span>${wizardStep} / 2</span></div><h2>${wizardStep===1?'어디서 뛸까요?':'어떻게 뛸까요?'}</h2><form data-growth-form="recommend" class="fm-beta-preference-form">${wizardStep===1?`${choice('region')}<button class="fm-beta-button fm-beta-button--primary" type="button" data-growth-action="next-setup">다음</button>`:`${choice('level')}${choice('position')}${choice('afterTime')}<button class="fm-beta-button fm-beta-button--primary" ${busy?'disabled':''}>추천 경기 보기</button><button class="fm-beta-link" type="button" data-growth-action="previous-setup" aria-label="← 이전"><span class="fm-icon" aria-hidden="true">⬅️</span> 이전</button>`}</form></section>`;
}
function moveWizard(form,step){draft={...DEFAULT_PREFERENCES,...(draft||{}),...Object.fromEntries(new FormData(form))};wizardStep=step;render()}
function recommendPanel(){
 if(!preferences)return wizardPanel();
 const p=draft||preferences||{};
 const options=(values,value,empty)=>`<option value="">${empty}</option>${values.map(([v,label])=>`<option value="${esc(v)}" ${value===v?'selected':''}>${esc(label)}</option>`).join('')}`;
 const regions=[...new Set([p.region,'수원 · 영통','수원 · 인계','용인 · 기흥','서울 · 강남',...matches.map(m=>m.region)].filter(Boolean))].sort();
 if(!editing&&preferences){const personalized=Boolean(p.region||p.level||p.position||p.afterTime||p.beforeTime||p.dateWindow);const sports='';const labels=[p.region||'지역 전체',p.level,p.position,p.afterTime?`${p.afterTime} 이후`:''].filter(Boolean);return `<section class="fm-beta-preferences-summary" aria-label="추천 조건">${sports}<div><strong>${personalized?'나에게 맞는 경기':'전체 경기 둘러보기'}</strong>${personalized&&aiOrder.length?'<span class="fm-beta-ai-label">AI 추천</span>':''}<p>${esc(labels.join(' · '))}</p></div><button class="fm-beta-link" type="button" data-growth-action="edit-preferences">조건 변경</button>${quickFilters(p)}${!busy&&recommendation?.ranked.length===0?`<div class="fm-beta-filter-recovery">${p.afterTime||p.beforeTime?'<button class="fm-beta-button" type="button" data-growth-action="relax-time">시간 조건 해제</button>':''}<button class="fm-beta-button" type="button" data-growth-action="clear-filters">전체 조건 해제</button></div>`:''}${message?`<p class="fm-beta-search-status" role="status">${esc(message)}</p>`:''}</section>`}
 return `<section class="fm-beta-panel fm-beta-preferences"><h2>어떤 경기를 즐기세요?</h2><form data-growth-form="recommend" class="fm-beta-preference-form">
 <label class="fm-beta-field"><span>활동 지역</span><select name="region" aria-label="활동 지역">${options(regions.map(v=>[v,v]),p.region,'지역 전체')}</select></label>
 <div class="fm-beta-preference-row"><label class="fm-beta-field"><span>실력</span><select name="level" aria-label="실력">${options(['입문','초중급','중급','중급+'].map(v=>[v,v]),p.level,'상관없음')}</select></label><label class="fm-beta-field"><span>포지션</span><select name="position" aria-label="포지션">${options(Object.entries(POSITIONS),p.position,'상관없음')}</select></label></div>
 <label class="fm-beta-field"><span>선호 시간</span><select name="afterTime" aria-label="선호 시간">${options([['09:00','오전 9시 이후'],['14:00','오후 2시 이후'],['18:00','저녁 6시 이후'],['20:00','저녁 8시 이후']],p.afterTime,'시간 전체')}</select></label>
 ${choices('dateWindow',FILTERS.dateWindow.label,FILTERS.dateWindow.values,p)}${choices('beforeTime',FILTERS.beforeTime.label,FILTERS.beforeTime.values,p)}
 <button class="fm-beta-button fm-beta-button--primary" ${busy?'disabled':''}>추천 경기 보기</button><button class="fm-beta-link" type="button" data-growth-action="close-preferences">닫기</button></form></section>`;
}
function waitlistPanel(){if(isDemoEntry||!accessToken())return'';const p=profile?.position||'';const list=matches.filter(m=>!m.is_demo&&p&&['open','full'].includes(m.status)&&new Date(m.starts_at)>new Date()&&(m.status==='full'||Number(m.remaining_spots)<=0||slotLeft(m,p)<=0));if(!p||!list.length)return '';return `<section class="fm-beta-panel fm-beta-growth-panel"><div class="fm-beta-panel-head"><div><h3>대기 신청</h3><p>취소로 ${esc(p||'선호 포지션')} 자리가 나면 신청 순서대로 자동 참가 전환됩니다.</p></div></div>${!p?'<div class="fm-beta-empty">프로필에서 선호 포지션을 설정해주세요.</div>':list.length?list.map(m=>{const q=queued(m.id);return `<div class="fm-beta-growth-row"><div><b>${esc(m.title)}</b><span>${esc(startLabel(m.starts_at))} · ${esc(POSITIONS[p]||p)}</span></div><button class="fm-beta-button ${q?'fm-beta-button--danger':''}" data-growth-action="${q?'cancel-waitlist':'join-waitlist'}" data-match-id="${esc(m.id)}" ${busy?'disabled':''}>${q?'대기 취소':'대기 신청'}</button></div>`}).join(''):'<div class="fm-beta-empty">현재 대기 대상 경기가 없습니다.</div>'}</section>`}
function historyPanel(){if(isDemoEntry||!accessToken())return'';const attended=participations.filter(p=>p.checked_in_at).map(p=>({p,m:matches.find(m=>m.id===p.match_id)})).filter(x=>x.m);if(!attended.length)return '';return `<section class="fm-beta-panel fm-beta-growth-panel"><div class="fm-beta-panel-head"><div><h3>참석 이력 · 경기 후 피드백</h3><p>실제 체크인 기준 참석 이력과 완료 경기 피드백입니다.</p></div></div>${attended.length?attended.map(({p,m})=>{const f=savedFeedback(m.id);return `<div class="fm-beta-growth-history"><div><b>${esc(m.title)}</b><span>${esc(startLabel(m.starts_at))} · ${esc(p.position||'')}</span></div>${f?`<small>난이도 ${f.difficulty}/5 · 만족도 ${f.satisfaction}/5 · ${f.repeat_intent?'재참가 의향 있음':'재참가 의향 없음'}</small>`:m.status==='completed'?`<form class="fm-beta-growth-feedback" data-growth-form="feedback" data-match-id="${esc(m.id)}"><label>난이도<select name="difficulty">${[1,2,3,4,5].map(v=>`<option value="${v}" ${v===3?'selected':''}>${v}</option>`).join('')}</select></label><label>만족도<select name="satisfaction">${[1,2,3,4,5].map(v=>`<option value="${v}" ${v===4?'selected':''}>${v}</option>`).join('')}</select></label><label class="fm-beta-growth-check"><input type="checkbox" name="repeatIntent" checked> 다시 참가 의향</label><input name="note" maxlength="500" placeholder="선택 메모"><button class="fm-beta-button">피드백 저장</button></form>`:'<small>경기 종료 후 피드백을 남길 수 있습니다.</small>'}</div>`}).join(''):'<div class="fm-beta-empty">아직 체크인 완료된 실제 경기 이력이 없습니다.</div>'}</section>`}
function render(){const focusedId=document.activeElement?.id;root.dataset.betaOnboarding=String(!preferences);const shell=root.querySelector('.fm-beta-shell');if(!shell)return;let host=shell.querySelector('[data-beta-growth-host]');if(!host){host=document.createElement('div');host.dataset.betaGrowthHost='true';shell.querySelector('.fm-beta-footer')?.before(host)}host.dataset.realtimeState=realtimeState;host.innerHTML=`<div class="fm-beta-growth-grid">${waitlistPanel()}${historyPanel()}</div>`;host.dataset.realtimeState=realtimeState;const main=shell.querySelector('[data-beta-main]');if(main){let search=main.querySelector('[data-beta-ai-entry]');if(!search){search=document.createElement('div');search.dataset.betaAiEntry='true';main.prepend(search)}const signature=JSON.stringify(preferences);const openFilters=search.dataset.conditions===signature?openQuickFilterIds(search):[];search.innerHTML=recommendPanel();search.dataset.conditions=signature;restoreQuickFilters(search,openFilters);if(focusedId?.startsWith('quick-filter-'))document.getElementById(focusedId)?.focus()}}
function baseRefresh(){clearTimeout(refreshTimer);refreshTimer=setTimeout(()=>{root.querySelector('[data-action="refresh"]')?.click();loadState().catch(()=>{})},300)}
function connectRealtime(){if(isDemoEntry)return;if(!config||socket||document.visibilityState==='hidden')return;const url=config.url.replace(/^http/,'ws')+`/realtime/v1/websocket?apikey=${encodeURIComponent(config.publishableKey)}&vsn=1.0.0`;let ref=1;realtimeState='connecting';render();socket=new WebSocket(url);socket.onopen=()=>{socket.send(JSON.stringify({topic:'realtime:footmate-beta-growth',event:'phx_join',payload:{config:{broadcast:{self:false},presence:{key:''},postgres_changes:TABLES.map((table,i)=>({event:'*',schema:'public',table,id:i+1}))},access_token:accessToken()||config.publishableKey},ref:String(ref++)}));heartbeat=setInterval(()=>socket?.readyState===1&&socket.send(JSON.stringify({topic:'phoenix',event:'heartbeat',payload:{},ref:String(ref++)})),25000)};socket.onmessage=e=>{try{const d=JSON.parse(e.data);if(d.event==='phx_reply'&&d.payload?.status==='ok'){realtimeState='connected';render()}if(d.event==='postgres_changes')baseRefresh()}catch{}};socket.onclose=()=>{clearInterval(heartbeat);heartbeat=null;socket=null;realtimeState='error';render();clearTimeout(reconnectTimer);reconnectTimer=setTimeout(connectRealtime,2500)};socket.onerror=()=>{realtimeState='error';render()}}
root.addEventListener('change',e=>{if(e.target.closest('[data-growth-form="quick-filter"]')){const input=e.target;document.getElementById('quick-filter-'+input.name)?.focus();void applyPreferences({...preferences,[input.name]:input.value});return;}const form=e.target.closest('[data-growth-form="recommend"]');if(form)draft={...DEFAULT_PREFERENCES,...(draft||{}),...Object.fromEntries(new FormData(form))}});
root.addEventListener('submit',e=>{const f=e.target.closest('[data-growth-form]');if(!f)return;e.preventDefault();if(f.dataset.growthForm==='quick-filter')return;if(f.dataset.growthForm==='recommend'){if(!preferences&&wizardStep===1)moveWizard(f,2);else recommend(f)}else submitFeedback(f)});
root.addEventListener('click',e=>{const t=e.target.closest('[data-growth-action]');if(!t)return;if(t.dataset.growthAction==='relax-time'){void applyPreferences({...preferences,afterTime:'',beforeTime:''});return}if(t.dataset.growthAction==='clear-filters'){void applyPreferences({...DEFAULT_PREFERENCES});return}if(t.dataset.growthAction==='next-setup'){moveWizard(t.closest('form'),2);return}if(t.dataset.growthAction==='previous-setup'){moveWizard(t.closest('form'),1);return}if(t.dataset.growthAction==='set-sport'){void applyPreferences({...preferences,sport:t.dataset.sport||''});return}if(t.dataset.growthAction==='close-preferences'){editing=false;draft=null;render();return}if(t.dataset.growthAction==='edit-preferences'){editing=true;draft=null;root.dataset.betaRecommendationsReady='false';render();root.querySelector('[data-beta-ai-entry] h2')?.scrollIntoView({block:'start',behavior:'smooth'});return}waitlistAction(t.dataset.matchId,t.dataset.growthAction==='cancel-waitlist')});
const observer=new MutationObserver(()=>{if(root.querySelector('.fm-beta-shell')&&!root.querySelector('[data-beta-growth-host]'))render()});observer.observe(root,{childList:true,subtree:true});
window.addEventListener('footmate:beta:catalog-refreshed',()=>{loadState().catch(()=>{})});
window.addEventListener('footmate:beta:demo-changed',()=>{loadState().catch(()=>{})});
window.addEventListener('footmate:beta:session-changed',()=>{initialRecommendationRequested=false;loadState().catch(()=>{})});
window.addEventListener('storage',e=>{if(e.key===SESSION_KEY){loadState().catch(()=>{});socket?.close()}});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){loadState().catch(()=>{});connectRealtime()}});
(async()=>{try{await loadConfig();await loadState();connectRealtime()}catch{realtimeState='error';render()}})();
}

