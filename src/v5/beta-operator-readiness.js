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
  let loading=false;
  let localNotice=null;
  let suppressMutations=false;

  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
  const readSession=()=>{try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}};

  function localDateTime(value){
    if(!value)return '';
    const date=new Date(value);if(Number.isNaN(date.getTime()))return '';
    return new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,16);
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

  function enhance(){
    suppressMutations=true;
    injectNotice();injectPolicyFields();injectMatchdayControls();injectParticipantControls();
    const nextId=selectedMatchId();if(nextId!==selectedId)void refreshSelected({force:true});
    queueMicrotask(()=>{suppressMutations=false});
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
    if(target.dataset.readinessAction==='check-in-participant'){
      target.disabled=true;
      try{await client.operator.checkInParticipant({accessToken:session.accessToken,matchId:selectedId,userId:target.dataset.userId});notice('참가자의 현장 체크인을 기록했습니다.','success');await refreshSelected({force:true})}
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

  const observer=new MutationObserver(()=>{if(!suppressMutations)enhance()});
  observer.observe(root,{childList:true,subtree:true});

  void (async()=>{
    try{const config=await loadBetaBackendConfig();client=createBetaReadinessClient(config);enhance();await refreshSelected({force:true})}
    catch(error){notice(String(error?.message||'운영 readiness backend에 연결하지 못했습니다.'),'error')}
  })();
}
