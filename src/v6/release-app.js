import {MATCHES,createState} from '../v4/data.js';
import {footmatePlatform} from '../v4/platform/application/platform.js';

const root=document.getElementById('footmate-next');
const RELEASE_APP_VERSION='6.0.0';
const isReal=()=>document.documentElement.dataset.footmateSurface==='real';
const session=()=>createState(footmatePlatform.session.read()||{});
const patchSession=patch=>footmatePlatform.session.patch(patch);
const matchById=id=>MATCHES.find(match=>match.id===id)||null;
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
let scheduled=false;
let patching=false;

function installStyles(){
  if(document.querySelector('link[data-footmate-v6-release]'))return;
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href='/src/v6/release-app.css?v=1';
  link.dataset.footmateV6Release='true';
  document.head.append(link);
}

function migrateLegacyRoute(){
  if(!isReal())return;
  const current=session();
  if(current.route!=='schedule')return;
  patchSession({route:'profile'});
}

function lifecycleState(){
  const current=session();
  const match=matchById(current.joinedMatchId);
  if(!match)return {kind:'discover',match:null};
  if(current.matchStage==='postgame')return {kind:'return',match};
  const checkin=footmatePlatform.repositories.matchday.read({})||{};
  if(['available','processing','failed','completed','matchday','checked-in','late','updated'].includes(String(checkin.status||''))||current.matchStage==='matchday')return {kind:'matchday',match};
  return {kind:'upcoming',match};
}

function lifecycleMarkup(value){
  if(value.kind==='discover')return '';
  const match=value.match;
  const copy=value.kind==='return'
    ?['경기 기록을 마무리할 시간이에요.','체감 난이도를 남기면 다음 추천을 더 잘 맞출 수 있어요.','경기 피드백 남기기']
    :value.kind==='matchday'
      ?['오늘 경기 준비','체크인과 경기장 안내를 MY에서 한 번에 확인하세요.','오늘 경기 보기']
      :['다음 경기가 준비돼 있어요.','참가 정보와 경기 전 안내를 MY에서 이어서 확인하세요.','내 경기 보기'];
  return `<section class="fm-v6-lifecycle" data-v6-lifecycle="${value.kind}" aria-label="현재 할 일">
    <small>${value.kind==='return'?'AFTER MATCH':value.kind==='matchday'?'MATCHDAY':'UP NEXT'}</small>
    <h2>${copy[0]}</h2><p>${copy[1]}</p>
    <div class="fm-v6-lifecycle-match"><b>${esc(match.place)}</b><span>${esc(match.dateLabel)}</span></div>
    <button type="button" class="fm-next-button fm-next-button--primary" data-v6-action="open-my">${copy[2]}</button>
  </section>`;
}

function patchHome(screen){
  screen.dataset.v6Home='true';
  screen.querySelectorAll('[data-v6-lifecycle]').forEach(node=>node.remove());
  const value=lifecycleState();
  if(value.kind!=='discover'){
    const greeting=screen.querySelector('.fm-next-greeting');
    if(greeting)greeting.insertAdjacentHTML('afterend',lifecycleMarkup(value));
  }
  screen.querySelectorAll('[data-matchday-home],[data-product-checkin]').forEach(node=>node.dataset.v6Secondary='true');
}

function patchDetail(screen){
  screen.dataset.v6Detail='true';
  const hero=screen.querySelector('.fm-next-detail-hero');
  if(hero&&!hero.querySelector('[data-v6-detail-kicker]')){
    const kicker=document.createElement('div');
    kicker.dataset.v6DetailKicker='true';
    kicker.className='fm-v6-detail-kicker';
    kicker.textContent='MATCH DECISION';
    hero.prepend(kicker);
  }
  screen.querySelectorAll('[data-product-checkin]').forEach(node=>node.dataset.v6Secondary='true');
}

function commitFreeJoin(match){
  if(!match)return;
  const now=Date.now();
  const confirmationId=`FM-${now.toString(36).toUpperCase()}`;
  footmatePlatform.events.record('join.started',{matchId:match.id,paymentMethod:'none',attemptNumber:1,release:RELEASE_APP_VERSION});
  footmatePlatform.repositories.participation.write({
    schemaVersion:2,
    version:RELEASE_APP_VERSION,
    status:'success',
    matchId:match.id,
    amount:0,
    paymentMethod:'none',
    policySnapshot:{refund24h:'무료 참가',operatorCancel:'운영 취소 시 별도 결제 환불 없음'},
    attemptId:`join-${now}`,
    attemptNumber:1,
    confirmationId,
    failureCode:null,
    createdAt:now,
    updatedAt:now
  });
  footmatePlatform.repositories.matchday.write({matchId:match.id,status:'upcoming',checkinSchema:1,startsAt:match.startsAt,checkinComplete:false,checkedInAt:null});
  patchSession({selectedMatchId:match.id,joinedMatchId:match.id,checkedInMatchId:null,checkedInAt:null,matchStage:'upcoming',route:'success'});
  footmatePlatform.events.record('join.completed',{matchId:match.id,confirmationId,paymentMethod:'none',release:RELEASE_APP_VERSION},{dedupeKey:`join.completed:${confirmationId}`});
  location.reload();
}

function patchCheckout(screen){
  screen.dataset.v6Join='free';
  const title=screen.querySelector('.fm-next-topbar>strong');
  if(title)title.textContent='참가 확인';
  const summary=screen.querySelector('.fm-next-checkout-summary');
  if(summary){
    const small=summary.querySelector('small');
    if(small&&!summary.querySelector('[data-v6-join-badge]'))small.insertAdjacentHTML('beforebegin','<span data-v6-join-badge class="fm-v6-join-badge">FREE JOIN</span>');
  }
  [...screen.querySelectorAll('.fm-next-detail-section')].forEach(section=>{
    const heading=section.querySelector('h2')?.textContent?.trim();
    if(heading==='결제 수단')section.dataset.v6HiddenPayment='true';
    if(heading==='결제 금액'){
      section.dataset.v6JoinSummary='true';
      const h2=section.querySelector('h2');if(h2)h2.textContent='참가 정보';
      section.querySelectorAll('.fm-next-pay-row').forEach(row=>row.remove());
      if(!section.querySelector('[data-v6-free-copy]'))section.insertAdjacentHTML('beforeend','<div data-v6-free-copy class="fm-v6-free-copy"><b>무료 참가</b><span>이번 Release에서는 결제 정보 없이 참가를 확정합니다.</span></div>');
    }
  });
  const note=screen.querySelector('.fm-next-inline-note span');
  if(note)note.textContent='경기 24시간 전까지 자유롭게 참가를 취소할 수 있어요. 운영 취소 시 별도 결제 환불 절차는 없습니다.';
  const confirm=screen.querySelector('[data-action="confirm-payment"],[data-participation-submit]');
  if(confirm){
    confirm.disabled=false;
    confirm.removeAttribute('aria-busy');
    confirm.dataset.v6FreeJoin='true';
    confirm.textContent='무료로 참가 확정';
  }
  screen.querySelectorAll('[data-participation-panel]').forEach(node=>node.dataset.v6LegacyPayment='true');
}

function patchSuccess(screen){
  screen.dataset.v6Success='true';
  const title=screen.querySelector('h1');if(title)title.textContent='참가가 확정됐어요.';
  const copy=screen.querySelector(':scope>p');if(copy)copy.textContent='이제 필요한 경기 정보와 체크인은 MY에서 이어집니다.';
  const actions=screen.querySelector('.fm-next-actions');
  if(actions){
    const primary=actions.querySelector('[data-action="nav-profile"]');if(primary)primary.textContent='내 경기 보기';
    const home=actions.querySelector('[data-action="nav-home"]');if(home)home.textContent='홈으로';
  }
}

function returnPanel(match){
  const store=footmatePlatform.repositories.returnLoop.read({})||{};
  const history=Array.isArray(store.history)?store.history:[];
  const saved=history.find(item=>item.matchId===match.id);
  if(saved)return `<section class="fm-v6-return" data-v6-return="saved"><small>AFTER MATCH</small><h2>경기 기록을 저장했어요.</h2><p>${esc(match.place)}에서 느낀 난이도와 반복 의도를 다음 추천에 반영합니다.</p><div class="fm-v6-return-saved"><b>${saved.difficulty==='easy'?'쉬웠어요':saved.difficulty==='hard'?'어려웠어요':'적당했어요'}</b><span>${saved.repeatIntent?'비슷한 경기 다시 추천':'다른 조건도 탐색'}</span></div></section>`;
  const draft=store.draft?.matchId===match.id?store.draft:{matchId:match.id,difficulty:null,repeatIntent:null};
  const pressed=(key,value)=>String(draft[key])===String(value)?' aria-pressed="true"':' aria-pressed="false"';
  return `<section class="fm-v6-return" data-v6-return="draft"><small>AFTER MATCH</small><h2>오늘 경기, 어땠나요?</h2><p>두 가지만 남기면 다음 경기 추천에 반영할게요.</p>
    <fieldset><legend>체감 난이도</legend><div class="fm-v6-choice-row"><button data-v6-action="difficulty" data-value="easy"${pressed('difficulty','easy')}>쉬웠어요</button><button data-v6-action="difficulty" data-value="expected"${pressed('difficulty','expected')}>적당했어요</button><button data-v6-action="difficulty" data-value="hard"${pressed('difficulty','hard')}>어려웠어요</button></div></fieldset>
    <fieldset><legend>비슷한 경기 다시 추천</legend><div class="fm-v6-choice-row fm-v6-choice-row--two"><button data-v6-action="repeat" data-value="true"${pressed('repeatIntent',true)}>네, 비슷하게</button><button data-v6-action="repeat" data-value="false"${pressed('repeatIntent',false)}>다른 조건 탐색</button></div></fieldset>
    <button class="fm-next-button fm-next-button--primary" data-v6-action="save-return" ${!draft.difficulty||draft.repeatIntent===null?'disabled':''}>평가 저장</button>
  </section>`;
}

function patchProfile(screen){
  screen.dataset.v6My='true';
  const top=screen.querySelector('.fm-next-topbar>strong');if(top)top.textContent='MY';
  const my=screen.querySelector('[data-my-matches]');
  if(my){const head=my.querySelector('.fm-next-section-head h2');if(head)head.textContent='내 경기';}
  screen.querySelectorAll('[data-v6-return]').forEach(node=>node.remove());
  const current=session();
  const match=matchById(current.joinedMatchId);
  if(match&&current.matchStage==='postgame'&&my)my.insertAdjacentHTML('afterbegin',returnPanel(match));
  const profile=screen.querySelector('.fm-next-profile-card');
  if(profile&&!profile.querySelector('[data-v6-profile-label]'))profile.insertAdjacentHTML('afterbegin','<small class="fm-v6-section-label" data-v6-profile-label>내 정보</small>');
  const menu=screen.querySelector('.fm-next-menu-list');
  if(menu&&!menu.previousElementSibling?.matches?.('[data-v6-settings-label]'))menu.insertAdjacentHTML('beforebegin','<small class="fm-v6-section-label" data-v6-settings-label>설정</small>');
}

function writeReturnDraft(matchId,patch){
  const state=footmatePlatform.repositories.returnLoop.read({})||{};
  const history=Array.isArray(state.history)?state.history:[];
  const current=state.draft?.matchId===matchId?state.draft:{matchId,difficulty:null,repeatIntent:null};
  footmatePlatform.repositories.returnLoop.write({version:RELEASE_APP_VERSION,history,draft:{...current,...patch}});
}

function saveReturn(matchId){
  const state=footmatePlatform.repositories.returnLoop.read({})||{};
  const history=Array.isArray(state.history)?state.history:[];
  const draft=state.draft?.matchId===matchId?state.draft:null;
  if(!draft?.difficulty||draft.repeatIntent===null)return;
  const entry={matchId,completed:true,difficulty:draft.difficulty,repeatIntent:Boolean(draft.repeatIntent),submittedAt:new Date().toISOString()};
  footmatePlatform.repositories.returnLoop.write({version:RELEASE_APP_VERSION,history:[...history.filter(item=>item.matchId!==matchId),entry],draft:null});
  footmatePlatform.events.record('postgame.submitted',{matchId,difficulty:entry.difficulty,repeatIntent:entry.repeatIntent},{dedupeKey:`postgame.submitted:${matchId}`});
}

function apply(){
  scheduled=false;
  if(!root||!isReal()||patching)return;
  patching=true;
  try{
    root.dataset.releaseAppVersion=RELEASE_APP_VERSION;
    const screen=root.querySelector('[data-screen]');
    if(!screen)return;
    if(screen.dataset.screen==='home')patchHome(screen);
    if(screen.dataset.screen==='detail')patchDetail(screen);
    if(screen.dataset.screen==='checkout')patchCheckout(screen);
    if(screen.dataset.screen==='success')patchSuccess(screen);
    if(screen.dataset.screen==='profile')patchProfile(screen);
    if(screen.dataset.screen==='schedule'){
      patchSession({route:'profile'});
      location.reload();
    }
  }finally{patching=false;}
}

function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(apply);
}

if(isReal()){
  installStyles();
  migrateLegacyRoute();
  document.addEventListener('click',event=>{
    const joinButton=event.target.closest?.('[data-v6-free-join],[data-screen="checkout"] [data-action="confirm-payment"]');
    if(joinButton){
      event.preventDefault();event.stopImmediatePropagation();
      const match=matchById(session().selectedMatchId);
      joinButton.disabled=true;joinButton.textContent='참가 확정 중…';
      commitFreeJoin(match);
      return;
    }
    const action=event.target.closest?.('[data-v6-action]');
    if(!action)return;
    const name=action.dataset.v6Action;
    if(name==='open-my'){
      event.preventDefault();event.stopImmediatePropagation();patchSession({route:'profile'});location.reload();return;
    }
    const current=session();const match=matchById(current.joinedMatchId);if(!match)return;
    if(name==='difficulty'){event.preventDefault();event.stopImmediatePropagation();writeReturnDraft(match.id,{difficulty:action.dataset.value});schedule();return;}
    if(name==='repeat'){event.preventDefault();event.stopImmediatePropagation();writeReturnDraft(match.id,{repeatIntent:action.dataset.value==='true'});schedule();return;}
    if(name==='save-return'){event.preventDefault();event.stopImmediatePropagation();saveReturn(match.id);schedule();return;}
  },true);
  if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true,characterData:true});
  schedule();
}

window.__FOOTMATE_RELEASE_APP__=Object.freeze({version:RELEASE_APP_VERSION,readLifecycle:lifecycleState,migrateLegacyRoute});