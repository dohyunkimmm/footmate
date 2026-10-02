import {loadBetaBackendConfig} from './infrastructure/supabase-beta.js';
import {createBetaReadinessClient} from './infrastructure/supabase-beta-readiness.js';

const root=document.getElementById('footmate-beta-operator');
const SESSION_KEY='footmate:beta:auth:v1';
const POSITIONS=['MF','FW','DF','GK'];

if(root){
  let client=null;
  let selectedId=null;
  let match=null;
  let participants=[];
  let emailHealth=[];
  let funnelMetrics=null;
  let loading=false;
  let healthLoading=false;
  let localNotice=null;
  let suppressMutations=false;

  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
  const readSession=()=>{try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}};

  function localDateTime(value){
    if(!value)return '';
    const date=new Date(value);if(Number.isNaN(date.getTime()))return '';
    return new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,16);
  }
  function displayDateTime(value){
    if(!value)return '—';const date=new Date(value);if(Number.isNaN(date.getTime()))return '—';
    return new Intl.DateTimeFormat('ko-KR',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(date);
  }
  function emailState(item){
    const value=String(item?.email_delivery_status||item?.email_status||'pending');
    return ({pending:'대기',processing:'처리 중',sent:'발송 접수',failed:'실패',skipped:'제외',accepted:'발송 접수',delivery_delayed:'전달 지연',delivered:'전달 완료',bounced:'반송',complained:'스팸 신고',suppressed:'발송 억제'})[value]||value;
  }

  function notice(message,tone='info'){localNotice=message?{message,tone}:null;enhance()}
  function injectNotice(){
    const existing=root.querySelector('[data-readiness-operator-notice]');
    if(!localNotice){existing?.remove();return}
    const signature=`${localNotice.tone}|${localNotice.message}`;
    if(existing?.dataset.readinessSignature===signature)return;
    if(existing){existing.dataset.readinessSignature=signature;existing.dataset.tone=localNotice.tone;existing.textContent=localNotice.message;return}
    const hero=root.querySelector('.fm-beta-hero');if(!hero)return;
    hero.insertAdjacentHTML('afterend',`<div class="fm-beta-note" data-readiness-operator-notice data-tone="${esc(localNotice.tone)}" style="margin-bottom:18px">${esc(localNotice.message)}</div>`);
    const node=root.querySelector('[data-readiness-operator-notice]');if(node)node.dataset.readinessSignature=signature;
  }

  function selectedMatchId(){return root.querySelector('.fm-operator-item[aria-current="true"]')?.dataset.matchId||null}

  async function refreshSelected({force=false}={}){
    if(!client||loading)return;
    const session=readSession(),nextId=selectedMatchId();
    if(!session?.accessToken)return;
    if(!force&&nextId===selectedId&&match)return;
    selectedId=nextId;match=null;participants=[];
    if(!selectedId){enhance();return}
    loading=true;
    try{
      [match,participants]=await Promise.all([
        client.matches.get({matchId:selectedId,accessToken:session.accessToken}),
        client.operator.listParticipants({accessToken:session.accessToken,matchId:selectedId})
      ]);
      if(!Array.isArray(participants))participants=[];
    }catch(error){notice(String(error?.message||'운영 상태를 불러오지 못했습니다.'),'error')}
    finally{loading=false;enhance()}
  }

  async function refreshEmailHealth({force=false}={}){
    if(!client||healthLoading)return;
    const session=readSession();if(!session?.accessToken)return;
    if(!force&&emailHealth.length)return;
    healthLoading=true;enhance();
    try{
      const [health,metrics]=await Promise.all([
        client.operator.emailHealth({accessToken:session.accessToken,limit:30}),
        client.operator.metrics({accessToken:session.accessToken})
      ]);
      emailHealth=Array.isArray(health)?health:[];
      funnelMetrics=metrics||null;
    }catch(error){notice(String(error?.message||'Transactional email 운영 상태를 불러오지 못했습니다.'),'error')}
    finally{healthLoading=false;enhance()}
  }

  function injectPolicyFields(){
    const form=root.querySelector('form[data-form="match"]');
    if(!form||form.querySelector('[data-readiness-policy-fields]'))return;
    const row=form.querySelector('input[name="startsAt"]')?.closest('.fm-operator-row');if(!row)return;
    row.insertAdjacentHTML('afterend',`<div class="fm-operator-row" data-readiness-policy-fields><label class="fm-beta-field"><span>사용자 취소 마감</span><input name="cancelCutoffAt" type="datetime-local" value="${esc(localDateTime(match?.cancel_cutoff_at))}"><small>공개 경기에서는 필수이며 시작 시간보다 앞서야 합니다.</small></label><label class="fm-beta-field"><span>체크인 오픈</span><input name="checkInOpensAt" type="datetime-local" value="${esc(localDateTime(match?.check_in_opens_at))}"><small>공개 경기에서는 필수이며 시작 시간 이후로 설정할 수 없습니다.</small></label></div>`);
    const note=form.querySelector('.fm-beta-note');
    if(note&&!form.querySelector('[data-readiness-policy-note]'))note.insertAdjacentHTML('afterend','<div class="fm-beta-note" data-readiness-policy-note>실제 Beta 공개 전 취소 마감과 체크인 오픈 시간을 운영자가 명시해야 합니다. 사용자는 취소 마감 이후 직접 취소할 수 없습니다.</div>');
  }

  function injectMatchdayControls(){
    const form=root.querySelector('form[data-form="match"]'),actions=form?.querySelector('.fm-beta-actions');
    if(!actions||actions.querySelector('[data-readiness-action="complete-match"]')||!match)return;
    if(['open','full'].includes(match.status)&&Date.now()>=new Date(match.starts_at).getTime())actions.insertAdjacentHTML('beforeend',`<button class="fm-beta-button" type="button" data-readiness-action="complete-match" data-match-id="${esc(match.id)}">경기 종료 처리</button>`);
  }

  function injectParticipantControls(){
    root.querySelectorAll('.fm-operator-participant').forEach(container=>{
      const cancel=container.querySelector('[data-action="cancel-participant"][data-user-id]'),userId=cancel?.dataset.userId;
      if(!userId)return;
      const participation=participants.find(item=>item.user_id===userId&&item.status==='confirmed');if(!participation)return;
      const signature=String(participation.checked_in_at||'pending');
      if(container.dataset.readinessParticipantSignature===signature)return;
      container.dataset.readinessParticipantSignature=signature;
      container.querySelector('[data-readiness-participant-control]')?.remove();
      const markup=participation.checked_in_at?'<span class="fm-beta-badge" data-readiness-participant-control>체크인 완료</span>':`<button class="fm-beta-button" type="button" data-readiness-action="check-in-participant" data-readiness-participant-control data-user-id="${esc(userId)}">현장 체크인</button>`;
      cancel.insertAdjacentHTML('beforebegin',markup);
    });
  }

  function injectEmailHealth(){
    const grid=root.querySelector('.fm-operator-grid');if(!grid)return;
    const metrics=funnelMetrics||{};
    const signature=JSON.stringify({loading:healthLoading,health:emailHealth,metrics});
    let panel=root.querySelector('[data-email-health]');
    if(panel?.dataset.signature===signature)return;
    const items=emailHealth.slice(0,8).map(item=>{
      const retry=item.email_status==='failed'&&Number(item.email_attempts||0)<5
        ?`<button class="fm-beta-button fm-beta-button--ghost" type="button" data-readiness-action="retry-email" data-notification-id="${esc(item.notification_id)}">재시도 예약</button>`:'';
      return `<li class="fm-operator-email-item"><div><strong>${esc(item.title||item.event_type||'운영 알림')}</strong><span>${esc(item.event_type||'')} · ${esc(displayDateTime(item.created_at))} · 시도 ${esc(item.email_attempts||0)}회</span></div><div class="fm-operator-email-state"><span class="fm-beta-badge">${esc(emailState(item))}</span>${retry}</div></li>`;
    }).join('');
    const html=`<section class="fm-beta-panel fm-operator-email-health" data-email-health aria-labelledby="fm-email-health-title"><div class="fm-operator-email-head"><div><span class="fm-beta-eyebrow">EMAIL HEALTH · 7 DAYS</span><h2 id="fm-email-health-title">Transactional email 운영 상태</h2><p>서버 outbox와 Resend 최종 전달 상태를 PII 없이 확인합니다.</p></div><button class="fm-beta-button fm-beta-button--ghost" type="button" data-readiness-action="refresh-email-health" ${healthLoading?'disabled':''}>${healthLoading?'확인 중…':'새로고침'}</button></div><div class="fm-operator-summary fm-operator-summary--email"><div><b>${esc(metrics.participation_joined||0)}</b><span>참가 확정</span></div><div><b>${esc(metrics.participation_checked_in||0)}</b><span>체크인</span></div><div><b>${esc(metrics.email_delivered||0)}</b><span>메일 전달 완료</span></div><div><b>${esc(Number(metrics.email_failed||0)+Number(metrics.email_bounced||0))}</b><span>발송/전달 이슈</span></div></div>${items?`<ul class="fm-operator-email-list">${items}</ul>`:'<p class="fm-beta-empty">최근 transactional email 기록이 없습니다.</p>'}</section>`;
    if(!panel){grid.insertAdjacentHTML('beforebegin',html);panel=root.querySelector('[data-email-health]')}else panel.outerHTML=html;
    panel=root.querySelector('[data-email-health]');if(panel)panel.dataset.signature=signature;
  }

  function enhance(){
    suppressMutations=true;
    injectNotice();injectEmailHealth();injectPolicyFields();injectMatchdayControls();injectParticipantControls();
    const nextId=selectedMatchId();if(nextId!==selectedId)void refreshSelected({force:true});
    queueMicrotask(()=>{suppressMutations=false});
  }

  function scheduleMatchEmailDispatch(matchId){
    const session=readSession();
    if(!client||!session?.accessToken||!matchId)return;
    for(const delay of [1200,4000])setTimeout(()=>void client.notifications.dispatchEmail({accessToken:session.accessToken,matchId}),delay);
    setTimeout(()=>void refreshEmailHealth({force:true}),5200);
  }

  root.addEventListener('submit',async event=>{
    const form=event.target.closest('form[data-form="match"]');
    if(!form||!form.querySelector('[data-readiness-policy-fields]'))return;
    event.preventDefault();event.stopImmediatePropagation();
    if(!client){notice('운영 backend 연결을 확인 중입니다. 잠시 후 다시 시도해주세요.','error');return}
    const session=readSession();if(!session?.accessToken){notice('운영자 세션이 만료됐습니다. 다시 로그인해주세요.','error');return}
    const data=new FormData(form);
    const slots=POSITIONS.map(position=>({position,capacityTotal:Number(data.get(`slot-${position}`)||0)}));
    const capacityTotal=slots.reduce((sum,item)=>sum+Math.max(0,item.capacityTotal),0);
    const startsAt=new Date(String(data.get('startsAt')||''));
    const cancelRaw=String(data.get('cancelCutoffAt')||''),checkRaw=String(data.get('checkInOpensAt')||'');
    const cancelCutoffAt=cancelRaw?new Date(cancelRaw):null,checkInOpensAt=checkRaw?new Date(checkRaw):null,status=String(data.get('status')||'draft');
    if(capacityTotal<=0){notice('포지션 정원을 1명 이상 설정해주세요.','error');return}
    if(Number.isNaN(startsAt.getTime())){notice('시작 시간을 확인해주세요.','error');return}
    if(status==='open'&&(!cancelCutoffAt||!checkInOpensAt)){notice('공개 경기에는 취소 마감과 체크인 오픈 시간이 필요합니다.','error');return}
    if(cancelCutoffAt&&cancelCutoffAt.getTime()>=startsAt.getTime()){notice('취소 마감은 경기 시작보다 앞서야 합니다.','error');return}
    if(checkInOpensAt&&checkInOpensAt.getTime()>startsAt.getTime()){notice('체크인 오픈은 경기 시작보다 늦을 수 없습니다.','error');return}
    const submit=form.querySelector('button[type="submit"]');if(submit)submit.disabled=true;
    try{
      const result=await client.operator.saveMatch({accessToken:session.accessToken,match:{id:selectedMatchId(),title:data.get('title'),venueName:data.get('venueName'),areaLabel:data.get('areaLabel'),address:data.get('address'),region:data.get('region'),level:data.get('level'),startsAt:startsAt.toISOString(),cancelCutoffAt:cancelCutoffAt?.toISOString()||null,checkInOpensAt:checkInOpensAt?.toISOString()||null,capacityTotal,formatLabel:data.get('formatLabel'),surface:data.get('surface'),durationMinutes:Number(data.get('durationMinutes')||80),status,slots}});
      if(result?.match_id)sessionStorage.setItem('footmate:beta:operator:selected:v1',String(result.match_id));
      location.reload();
    }catch(error){notice(String(error?.message||'경기 운영 설정을 저장하지 못했습니다.'),'error');if(submit)submit.disabled=false}
  },true);

  root.addEventListener('click',async event=>{
    const target=event.target.closest('[data-readiness-action]');if(!target||!client)return;
    const session=readSession();if(!session?.accessToken)return;
    if(target.dataset.readinessAction==='refresh-email-health'){
      target.disabled=true;await refreshEmailHealth({force:true});return;
    }
    if(target.dataset.readinessAction==='retry-email'){
      target.disabled=true;
      try{
        const result=await client.operator.retryEmail({accessToken:session.accessToken,notificationId:target.dataset.notificationId});
        if(!result?.notification_id)throw new Error('재시도 가능한 실패 건이 아닙니다.');
        notice('Transactional email 재시도를 예약했습니다. 서버 worker가 자동으로 처리합니다.','success');
        await refreshEmailHealth({force:true});
      }catch(error){notice(String(error?.message||'메일 재시도를 예약하지 못했습니다.'),'error');target.disabled=false}
      return;
    }
    if(target.dataset.readinessAction==='check-in-participant'){
      target.disabled=true;
      try{await client.operator.checkInParticipant({accessToken:session.accessToken,matchId:selectedId,userId:target.dataset.userId});notice('참가자의 현장 체크인을 기록했습니다.','success');await Promise.all([refreshSelected({force:true}),refreshEmailHealth({force:true})])}
      catch(error){notice(String(error?.message||'체크인을 기록하지 못했습니다.'),'error');target.disabled=false}
      return;
    }
    if(target.dataset.readinessAction==='complete-match'){
      if(!confirm('이 경기를 종료 처리할까요? 종료 후에는 운영자 편집이 제한됩니다.'))return;
      target.disabled=true;
      try{await client.operator.completeMatch({accessToken:session.accessToken,matchId:target.dataset.matchId});location.reload()}
      catch(error){notice(String(error?.message||'경기를 종료 처리하지 못했습니다.'),'error');target.disabled=false}
    }
  },true);

  root.addEventListener('click',event=>{
    const baseAction=event.target.closest('[data-action]')?.dataset.action;
    if(baseAction==='cancel-participant'||baseAction==='cancel-match')scheduleMatchEmailDispatch(selectedMatchId());
  },true);

  const observer=new MutationObserver(()=>{if(!suppressMutations)enhance()});
  observer.observe(root,{childList:true,subtree:true});

  void (async()=>{
    try{
      const config=await loadBetaBackendConfig();client=createBetaReadinessClient(config);enhance();
      await Promise.all([refreshSelected({force:true}),refreshEmailHealth({force:true})]);
    }catch(error){notice(String(error?.message||'운영 readiness backend에 연결하지 못했습니다.'),'error')}
  })();
}
