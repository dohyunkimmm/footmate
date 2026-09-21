const root=document.getElementById('footmate-beta');
const SESSION_KEY='footmate:beta:auth:v1';
const POSITION_LABELS={MF:'MF · 미드필더',FW:'FW · 공격수',DF:'DF · 수비수',GK:'GK · 골키퍼'};
const TABLES=['matches','match_slots','participations','beta_notifications','beta_waitlist','beta_match_feedback'];

if(root){
  let config=null;
  let profile=null;
  let matches=[];
  let participations=[];
  let waitlist=[];
  let feedback=[];
  let realtimeState='connecting';
  let socket=null;
  let heartbeat=null;
  let reconnectTimer=null;
  let renderQueued=false;
  let refreshQueued=false;
  let recommendation=null;
  let message='';
  let busy=false;

  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]||char));
  const session=()=>{try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}};
  const token=()=>String(session()?.accessToken||'');
  const headers=(auth=true)=>({apikey:config?.publishableKey||'',...(auth&&token()?{authorization:`Bearer ${token()}`}:{})});
  const jsonHeaders=()=>({...headers(true),'content-type':'application/json'});
  const formatStart=value=>new Intl.DateTimeFormat('ko-KR',{month:'short',day:'numeric',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(value));

  async function request(path,options={}){
    const response=await fetch(`${config.url}${path}`,{...options,headers:{...headers(options.auth!==false),...(options.headers||{})}});
    const body=await response.json().catch(()=>null);
    if(!response.ok)throw new Error(body?.message||body?.error_description||body?.error||`요청 실패 (${response.status})`);
    return body;
  }
  async function rpc(name,params={}){
    return request(`/rest/v1/rpc/${name}`,{method:'POST',headers:{...jsonHeaders(),prefer:'return=representation'},body:JSON.stringify(params)});
  }
  async function loadConfig(){
    if(config)return config;
    const response=await fetch('/api/beta-config',{cache:'no-store'});config=await response.json();
    if(!response.ok||!config?.connected)throw new Error('Beta backend config unavailable');
    return config;
  }
  async function loadState(){
    await loadConfig();
    const access=token();
    const matchQuery='/rest/v1/matches?select=id,title,venue_name,area_label,address,region,level,positions,starts_at,price_krw,capacity_total,joined_count,remaining_spots,format_label,surface,duration_minutes,status,cancel_cutoff_at,check_in_opens_at,match_slots(position,capacity_total,joined_count,remaining_spots)&status=in.(open,full,completed)&order=starts_at.asc&limit=80';
    const tasks=[request(matchQuery,{auth:false})];
    if(access){
      let userId='';try{userId=JSON.parse(atob(access.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')))?.sub||''}catch{}
      tasks.push(request(`/rest/v1/profiles?select=*&id=eq.${encodeURIComponent(userId)}&limit=1`).then(rows=>rows?.[0]||null));
      tasks.push(request('/rest/v1/participations?select=*&order=created_at.desc'));
      tasks.push(request('/rest/v1/beta_waitlist?select=*&order=created_at.asc'));
      tasks.push(request('/rest/v1/beta_match_feedback?select=*&order=created_at.desc'));
    }
    const values=await Promise.all(tasks);
    matches=Array.isArray(values[0])?values[0]:[];
    if(access){profile=values[1]||null;participations=values[2]||[];waitlist=values[3]||[];feedback=values[4]||[]}
    else{profile=null;participations=[];waitlist=[];feedback=[]}
    scheduleRender();
  }

  function slotRemaining(match,position){
    const row=(match.match_slots||[]).find(item=>item.position===position);return Number(row?.remaining_spots??0);
  }
  function queuedFor(matchId){return waitlist.find(item=>item.match_id===matchId&&item.status==='queued')||null}
  function participationFor(matchId){return participations.find(item=>item.match_id===matchId&&item.status==='confirmed')||null}
  function feedbackFor(matchId){return feedback.find(item=>item.match_id===matchId)||null}

  function constraintMatch(match,result){
    if(!['open','full'].includes(match.status)||new Date(match.starts_at)<=new Date())return false;
    if(result.region&&match.region!==result.region)return false;
    if(result.position&&!Array.isArray(match.positions))return false;
    if(result.position&&!match.positions.includes(result.position))return false;
    if(result.level&&match.level!==result.level)return false;
    if(result.maxPrice!=null&&Number(match.price_krw||0)>Number(result.maxPrice))return false;
    if(result.afterTime){
      const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(match.starts_at));
      if(parts<result.afterTime)return false;
    }
    return true;
  }
  function rankMatches(result){
    return matches.filter(match=>constraintMatch(match,result)).map(match=>{
      let score=0;const reasons=[];
      if(result.region&&match.region===result.region){score+=40;reasons.push('생활권 일치')}
      if(result.position){const left=slotRemaining(match,result.position);if(left>0){score+=30;reasons.push(`${result.position} ${left}자리`)}else reasons.push(`${result.position} 대기 가능`)}
      if(result.level&&match.level===result.level){score+=20;reasons.push('레벨 일치')}
      if(Number(match.price_krw||0)===0){score+=5;reasons.push('Beta 무료')}
      score+=Math.max(0,5-Math.floor((new Date(match.starts_at)-Date.now())/86400000));
      return {match,score,reasons};
    }).sort((a,b)=>b.score-a.score||new Date(a.match.starts_at)-new Date(b.match.starts_at));
  }

  async function runRecommendation(form){
    const data=new FormData(form);const query=String(data.get('query')||'').trim();if(!query)return;
    busy=true;message='';scheduleRender();
    try{
      const response=await fetch('/api/ai-match-assistant',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({message:query,preferences:{region:profile?.region||null,position:profile?.position||null,level:profile?.level||null}})});
      const payload=await response.json();if(!response.ok||!payload?.result)throw new Error('AI 조건 해석을 완료하지 못했습니다.');
      const ranked=rankMatches(payload.result);
      recommendation={query,result:payload.result,ranked,mode:payload.mode,model:payload.model};
      message=payload.result.maxDistanceMin!=null?'이동시간 데이터는 실제 Beta 경기에 아직 없어서 거리 조건은 순위에 사용하지 않았습니다.':'';
    }catch(error){message=String(error?.message||error);recommendation=null}
    finally{busy=false;scheduleRender()}
  }

  function renderRecommendation(){
    const items=recommendation?.ranked||[];
    return `<section class="fm-beta-panel fm-beta-growth-panel" data-growth="recommendation">
      <div class="fm-beta-panel-head"><div><h2>실제 경기 AI 탐색</h2><p>AI는 조건만 해석하고, 아래 순위는 Supabase의 실제 공개 경기 데이터를 기준으로 결정합니다.</p></div><span class="fm-beta-growth-chip">Live catalog</span></div>
      <form class="fm-beta-growth-search" data-growth-form="recommend"><input name="query" maxlength="240" placeholder="예: 수원 영통에서 MF 중급, 저녁 8시 이후" aria-label="실제 경기 AI 검색"><button class="fm-beta-button fm-beta-button--primary" ${busy?'disabled':''}>${busy?'해석 중':'찾기'}</button></form>
      ${message?`<div class="fm-beta-note" style="margin-top:10px">${esc(message)}</div>`:''}
      ${recommendation?`<div class="fm-beta-growth-results"><p class="fm-beta-growth-reply">${esc(recommendation.result.reply)}</p>${items.length?items.slice(0,5).map(({match,reasons},index)=>`<article class="fm-beta-growth-result"><b>${index+1}. ${esc(match.title)}</b><span>${esc(formatStart(match.starts_at))} · ${esc(match.venue_name||match.area_label||'')}</span><small>${esc(reasons.join(' · ')||'실제 경기 조건 일치')}</small></article>`).join(''):'<div class="fm-beta-empty">현재 실제 공개 경기 중 조건에 맞는 경기가 없습니다.</div>'}</div>`:''}
    </section>`;
  }

  function renderWaitlist(){
    if(!token())return '';
    const position=profile?.position||'';
    const candidates=matches.filter(match=>['open','full'].includes(match.status)&&new Date(match.starts_at)>new Date()&&position&&(match.status==='full'||Number(match.remaining_spots)<=0||slotRemaining(match,position)<=0));
    return `<section class="fm-beta-panel fm-beta-growth-panel" data-growth="waitlist"><div class="fm-beta-panel-head"><div><h3>대기 신청</h3><p>취소로 ${esc(position||'선호 포지션')} 자리가 나면 신청 순서대로 자동 참가 전환됩니다.</p></div></div>
      ${!position?'<div class="fm-beta-empty">프로필에서 선호 포지션을 설정하면 대기 가능한 경기를 확인할 수 있습니다.</div>':candidates.length?candidates.map(match=>{const queued=queuedFor(match.id);return `<div class="fm-beta-growth-row"><div><b>${esc(match.title)}</b><span>${esc(formatStart(match.starts_at))} · ${esc(POSITION_LABELS[position]||position)}</span></div><button class="fm-beta-button ${queued?'fm-beta-button--danger':''}" data-growth-action="${queued?'cancel-waitlist':'join-waitlist'}" data-match-id="${esc(match.id)}" ${busy?'disabled':''}>${queued?'대기 취소':'대기 신청'}</button></div>`}).join(''):'<div class="fm-beta-empty">현재 선호 포지션의 대기 대상 경기가 없습니다.</div>'}
    </section>`;
  }

  function renderHistory(){
    if(!token())return '';
    const attended=participations.filter(item=>item.checked_in_at).map(item=>({item,match:matches.find(match=>match.id===item.match_id)})).filter(entry=>entry.match);
    return `<section class="fm-beta-panel fm-beta-growth-panel" data-growth="history"><div class="fm-beta-panel-head"><div><h3>참석 이력 · 경기 후 피드백</h3><p>실제 체크인 기록을 기준으로 이력을 남기고, 종료된 경기에 피드백을 저장합니다.</p></div></div>
    ${attended.length?attended.map(({item,match})=>{const saved=feedbackFor(match.id);const completed=match.status==='completed';return `<div class="fm-beta-growth-history"><div><b>${esc(match.title)}</b><span>${esc(formatStart(match.starts_at))} · ${esc(item.position||'')}</span></div>${saved?`<small>난이도 ${saved.difficulty}/5 · 만족도 ${saved.satisfaction}/5 · ${saved.repeat_intent?'다시 참가 의향 있음':'다시 참가 의향 없음'}</small>`:completed?`<form data-growth-form="feedback" data-match-id="${esc(match.id)}" class="fm-beta-growth-feedback"><label>난이도<select name="difficulty">${[1,2,3,4,5].map(v=>`<option value="${v}" ${v===3?'selected':''}>${v}</option>`).join('')}</select></label><label>만족도<select name="satisfaction">${[1,2,3,4,5].map(v=>`<option value="${v}" ${v===4?'selected':''}>${v}</option>`).join('')}</select></label><label class="fm-beta-growth-check"><input type="checkbox" name="repeatIntent" checked> 다시 참가 의향</label><input name="note" maxlength="500" placeholder="선택 메모"><button class="fm-beta-button">피드백 저장</button></form>`:'<small>경기 종료 후 피드백을 남길 수 있습니다.</small>'}</div>`}).join(''):'<div class="fm-beta-empty">아직 체크인 완료된 실제 경기 이력이 없습니다.</div>'}
    </section>`;
  }

  function renderRealtime(){return `<div class="fm-beta-growth-live" data-growth="live"><span class="fm-beta-growth-dot" data-state="${realtimeState}"></span>Realtime ${realtimeState==='connected'?'연결됨':realtimeState==='error'?'재연결 중':'연결 중'}</div>`}

  function scheduleRender(){if(renderQueued)return;renderQueued=true;queueMicrotask(()=>{renderQueued=false;renderGrowth()})}
  function renderGrowth(){
    const shell=root.querySelector('.fm-beta-shell');if(!shell)return;
    let host=shell.querySelector('[data-beta-growth-host]');
    if(!host){host=document.createElement('div');host.dataset.betaGrowthHost='true';const footer=shell.querySelector('.fm-beta-footer');footer?.before(host)}
    host.innerHTML=`<div class="fm-beta-growth-grid">${renderRecommendation()}${renderWaitlist()}${renderHistory()}</div>${renderRealtime()}`;
  }

  async function waitlistAction(matchId,cancel=false){
    busy=true;scheduleRender();try{
      if(cancel)await rpc('cancel_beta_waitlist',{p_match_id:matchId});
      else{if(!profile?.position)throw new Error('선호 포지션을 먼저 설정해주세요.');await rpc('join_beta_waitlist',{p_match_id:matchId,p_position:profile.position})}
      await loadState();message=cancel?'대기 신청을 취소했습니다.':'대기 신청했습니다. 빈 자리가 생기면 자동 참가 전환됩니다.';
    }catch(error){message=String(error?.message||error)}finally{busy=false;scheduleRender()}
  }
  async function submitFeedback(form){
    const data=new FormData(form);busy=true;scheduleRender();try{
      await rpc('submit_beta_match_feedback',{p_match_id:form.dataset.matchId,p_difficulty:Number(data.get('difficulty')),p_satisfaction:Number(data.get('satisfaction')),p_repeat_intent:data.get('repeatIntent')==='on',p_note:String(data.get('note')||'')||null});
      await loadState();message='경기 후 피드백을 저장했습니다.';
    }catch(error){message=String(error?.message||error)}finally{busy=false;scheduleRender()}
  }

  function nudgeBaseRefresh(){
    if(refreshQueued)return;refreshQueued=true;setTimeout(()=>{refreshQueued=false;root.querySelector('[data-action="refresh"]')?.click();loadState().catch(()=>{})},350);
  }
  function connectRealtime(){
    if(!config||socket||document.visibilityState==='hidden')return;
    const wsUrl=config.url.replace(/^http/,'ws')+`/realtime/v1/websocket?apikey=${encodeURIComponent(config.publishableKey)}&vsn=1.0.0`;
    realtimeState='connecting';scheduleRender();
    socket=new WebSocket(wsUrl);let ref=1;
    socket.addEventListener('open',()=>{
      const changes=TABLES.map((table,index)=>({event:'*',schema:'public',table,id:index+1}));
      socket.send(JSON.stringify({topic:'realtime:footmate-beta-growth',event:'phx_join',payload:{config:{broadcast:{self:false},presence:{key:''},postgres_changes:changes},access_token:token()||config.publishableKey},ref:String(ref++)}));
      heartbeat=setInterval(()=>{if(socket?.readyState===1)socket.send(JSON.stringify({topic:'phoenix',event:'heartbeat',payload:{},ref:String(ref++)}))},25000);
    });
    socket.addEventListener('message',event=>{try{const data=JSON.parse(event.data);if(data.event==='phx_reply'&&data.payload?.status==='ok'){realtimeState='connected';scheduleRender()}if(data.event==='postgres_changes'){nudgeBaseRefresh()}}catch{}});
    socket.addEventListener('close',()=>{clearInterval(heartbeat);heartbeat=null;socket=null;realtimeState='error';scheduleRender();clearTimeout(reconnectTimer);reconnectTimer=setTimeout(connectRealtime,2500)});
    socket.addEventListener('error',()=>{realtimeState='error';scheduleRender()});
  }

  root.addEventListener('submit',event=>{
    const form=event.target.closest('[data-growth-form]');if(!form)return;event.preventDefault();
    if(form.dataset.growthForm==='recommend')runRecommendation(form);
    if(form.dataset.growthForm==='feedback')submitFeedback(form);
  });
  root.addEventListener('click',event=>{
    const target=event.target.closest('[data-growth-action]');if(!target)return;
    if(target.dataset.growthAction==='join-waitlist')waitlistAction(target.dataset.matchId,false);
    if(target.dataset.growthAction==='cancel-waitlist')waitlistAction(target.dataset.matchId,true);
  });

  const observer=new MutationObserver(()=>scheduleRender());observer.observe(root,{childList:true,subtree:true});
  window.addEventListener('storage',event=>{if(event.key===SESSION_KEY){loadState().catch(()=>{});if(socket){socket.close();socket=null}connectRealtime()}});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){loadState().catch(()=>{});connectRealtime()}});
  (async()=>{try{await loadConfig();await loadState();connectRealtime()}catch{realtimeState='error';scheduleRender()}})();
}
