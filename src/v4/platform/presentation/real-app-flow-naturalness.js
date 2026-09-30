import {MATCHES} from '../../data.js';
import {footmatePlatform} from '../application/platform.js';

const root=document.getElementById('footmate-next');
const FLOW_VERSION='1.0.0';
let scheduled=false;
let authBusy=false;
let nextAuthOutcome='success';

const readSession=()=>footmatePlatform.session.read()||{};
const patchSession=patch=>footmatePlatform.session.patch(patch);
const isRealApp=()=>document.documentElement.dataset.footmateSurface==='real';
const cleanDate=value=>String(value||'').replace(/^샘플 일정\s*·\s*/,'');
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

function ensureStyles(){
  if(document.getElementById('fm-real-app-flow-naturalness'))return;
  const style=document.createElement('style');
  style.id='fm-real-app-flow-naturalness';
  style.textContent=`
.fm-next-page[data-mode="real"] .fm-flow-auth-status{margin:10px 2px 0;color:#53675e;font-size:12px;font-weight:700;line-height:1.5;text-align:center}
.fm-next-page[data-mode="real"] .fm-flow-auth-status[data-tone="error"]{color:#9b3f32}
.fm-next-page[data-mode="real"] .fm-flow-success-next{display:grid;gap:10px;margin:18px 0;padding:16px;border:1px solid rgba(20,55,40,.10);border-radius:18px;background:#f7faf7}
.fm-next-page[data-mode="real"] .fm-flow-success-next>small{color:#617168;font-size:11px;font-weight:800;letter-spacing:.04em}
.fm-next-page[data-mode="real"] .fm-flow-success-next>div{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.fm-next-page[data-mode="real"] .fm-flow-success-next span{display:grid;gap:4px;min-width:0;padding:10px;border-radius:13px;background:#fff;color:#617168;font-size:10px;line-height:1.35}
.fm-next-page[data-mode="real"] .fm-flow-success-next b{color:#1f4031;font-size:12px;line-height:1.35}
.fm-next-page[data-mode="real"] .fm-flow-saved{margin:16px 0;padding:18px;border:1px solid rgba(20,55,40,.09);border-radius:20px;background:#fff}
.fm-next-page[data-mode="real"] .fm-flow-saved-head{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:12px}
.fm-next-page[data-mode="real"] .fm-flow-saved-head h2{margin:0;font-size:17px}.fm-next-page[data-mode="real"] .fm-flow-saved-head span{color:#607168;font-size:11px}
.fm-next-page[data-mode="real"] .fm-flow-saved-list{display:grid;gap:8px}
.fm-next-page[data-mode="real"] .fm-flow-saved-card{display:grid;width:100%;gap:5px;padding:13px 14px;border:1px solid rgba(20,55,40,.09);border-radius:15px;background:#f7f9f6;text-align:left;color:#173c2c}
.fm-next-page[data-mode="real"] .fm-flow-saved-card small{color:#66776e;font-size:10px}.fm-next-page[data-mode="real"] .fm-flow-saved-card b{font-size:14px}.fm-next-page[data-mode="real"] .fm-flow-saved-card span{color:#52665b;font-size:11px}
.fm-next-page[data-mode="real"] .fm-flow-experience{margin:16px 0 4px;padding:0 18px 18px}
.fm-next-page[data-mode="real"] .fm-flow-experience details{border-top:1px solid rgba(20,55,40,.09);padding-top:16px;color:#596b62;font-size:11px;line-height:1.6}
.fm-next-page[data-mode="real"] .fm-flow-experience summary{cursor:pointer;color:#294c3b;font-size:12px;font-weight:800;list-style-position:inside}
.fm-next-page[data-mode="real"] .fm-flow-experience p{margin:10px 0 0}.fm-next-page[data-mode="real"] .fm-flow-experience button{margin-top:12px;min-height:44px;padding:0 14px;border:1px solid rgba(20,55,40,.12);border-radius:12px;background:#fff;color:#365648;font-weight:700}
.fm-next-page[data-mode="real"] [data-flow-hidden="true"]{display:none!important}
@media(max-width:360px){.fm-next-page[data-mode="real"] .fm-flow-success-next>div{grid-template-columns:1fr}}
`;
  document.head.append(style);
}

function stripSampleScheduleLabels(scope=root){
  if(!scope)return;
  const walker=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT);
  const nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  for(const node of nodes){
    if(node.nodeValue?.includes('샘플 일정 ·'))node.nodeValue=node.nodeValue.replace(/샘플 일정\s*·\s*/g,'');
  }
}

function patchHome(screen){
  const session=readSession();
  const greeting=screen.querySelector('.fm-next-greeting');
  const small=greeting?.querySelector('small');
  const title=greeting?.querySelector('h1');
  const first=Boolean(session.firstHomePending);
  if(first){
    if(small)small.textContent='설정이 완료됐어요';
    if(title)title.innerHTML='조건에 맞는 경기를 <span>찾았어요.</span>';
    patchSession({firstHomePending:false,hasVisitedHome:true});
  }else if(session.signedIn){
    if(small)small.textContent='다시 반가워요';
    const name=session.userName&&session.userName!=='게스트'?`${escapeHtml(session.userName)}님, `:'';
    if(title)title.innerHTML=`${name}<span>오늘 경기 어때요?</span>`;
    if(!session.hasVisitedHome)patchSession({hasVisitedHome:true});
  }else{
    if(small)small.textContent=session.hasVisitedHome?'내 추천 조건으로':'설정한 조건을 기준으로';
    if(title)title.innerHTML='오늘 어떤 경기를 <span>찾으세요?</span>';
    if(!session.hasVisitedHome)patchSession({hasVisitedHome:true});
  }
  const context=screen.querySelector('.fm-next-context-card');
  if(context){
    const kicker=context.querySelector('.fm-next-context-kicker');
    if(kicker&&/FOR YOU/i.test(kicker.textContent))kicker.lastChild.nodeValue=' 추천 기준';
    const more=context.querySelector('[data-action="nav-discover"]');
    if(more&&more.textContent.includes('추천 경기 보기'))more.textContent='추천 더 보기';
  }
  const head=[...screen.querySelectorAll('.fm-next-section-head')].find(node=>node.querySelector('h2')?.textContent?.includes('지금 잘 맞는 경기'));
  if(head){
    const h2=head.querySelector('h2');const p=head.querySelector('p');const action=head.querySelector('[data-action="nav-discover"]');
    if(h2)h2.textContent='내 조건에 맞는 경기';
    if(p)p.textContent='지역, 경기 강도, 남은 포지션을 함께 봤어요.';
    if(action)action.textContent='경기 전체 보기';
  }
  const ops=screen.querySelector('[data-matchday-home] small');
  if(ops)ops.textContent='오늘 경기 안내';
}

function patchDiscover(screen){
  const heading=screen.querySelector('[data-discovery-heading]');
  if(heading){
    heading.hidden=false;
    heading.style.display='';
    const h1=heading.querySelector('h1');const p=heading.querySelector('p');
    if(h1)h1.textContent='경기 찾기';
    if(p)p.textContent='날짜, 시간, 거리, 가격으로 직접 좁혀보세요.';
  }
  const empty=screen.querySelector('.fm-discovery-empty');
  if(empty){
    const h2=empty.querySelector('h2');const p=empty.querySelector('p');
    if(h2)h2.textContent='지금 조건에는 맞는 경기가 없어요.';
    if(p)p.textContent='조건을 조금 넓히면 가까운 후보부터 다시 보여드릴게요.';
    const relax=empty.querySelector('[data-discovery-action="relax-filters"]');
    if(relax)relax.textContent='가까운 조건으로 다시 보기';
  }
  const sheet=root.querySelector('[data-discovery-sheet="true"]');
  if(sheet){
    const kicker=sheet.querySelector('.fm-discovery-sheet-head small');
    if(kicker)kicker.textContent='필터';
  }
}

function patchDetail(screen){
  const capacity=screen.querySelector('[data-decision-section="capacity"]');
  if(capacity){
    const p=capacity.querySelector('.fm-next-section-head p');if(p)p.textContent='현재 경기의 남은 자리와 포지션을 확인하세요.';
    const small=capacity.querySelector('.fm-decision-capacity small');if(small)small.textContent='남은 자리';
    const meter=capacity.querySelector('.fm-decision-meter');if(meter)meter.setAttribute('aria-label','현재 참가 인원');
    const grid=capacity.querySelector('.fm-decision-position-grid');if(grid)grid.setAttribute('aria-label','참가자 포지션 구성');
    const disclosure=capacity.querySelector('.fm-decision-disclosure');if(disclosure)disclosure.textContent='잔여 인원과 포지션은 현재 표시된 경기 정보 기준이에요.';
  }
  const venue=screen.querySelector('[data-decision-section="venue"] .fm-decision-disclosure');
  if(venue)venue.textContent='시설과 준비물은 참가 전에 운영 안내와 함께 확인해주세요.';
  const refundSection=screen.querySelector('[data-decision-section="refund"]');
  if(refundSection){
    const p=refundSection.querySelector('.fm-next-section-head p');if(p)p.textContent='취소 시점별 환불 기준을 확인하세요.';
    const disclosure=refundSection.querySelector('.fm-decision-disclosure');if(disclosure)disclosure.textContent='경기 시작이 가까워질수록 환불 금액이 달라질 수 있어요.';
  }
  const fit=screen.querySelector('[data-decision-section="fit"] .fm-next-section-head p');
  if(fit)fit.textContent='내 조건과 맞는 이유를 참가 전에 한 번 더 확인하세요.';
}

function authProviderLabel(button){
  const text=button.textContent||'';
  if(text.includes('카카오'))return '카카오';
  if(text.includes('Apple'))return 'Apple';
  if(text.includes('Google'))return 'Google';
  return '계정';
}

function ensureAuthStatus(screen){
  let status=screen.querySelector('[data-flow-auth-status]');
  if(status)return status;
  status=document.createElement('p');
  status.className='fm-flow-auth-status';
  status.dataset.flowAuthStatus='true';
  status.textContent='체험 로그인에서는 실제 계정 정보가 전송되지 않아요.';
  screen.querySelector('.fm-next-social-list')?.after(status);
  return status;
}

function patchAuth(screen){
  const copy=screen.querySelector('.fm-next-auth-copy p');
  if(copy){
    const place=copy.textContent.split(' 참가를')[0]?.trim();
    copy.textContent=`${place||'선택한 경기'} 참가를 이어가려면 로그인해주세요. 지금까지 고른 조건과 경기는 그대로 유지됩니다.`;
  }
  ensureAuthStatus(screen);
}

function beginAuth(button){
  const screen=button.closest('[data-screen="auth"]');
  if(!screen||authBusy)return;
  authBusy=true;
  const provider=authProviderLabel(button);
  const status=ensureAuthStatus(screen);
  status.dataset.tone='loading';
  status.textContent=`${provider} 로그인을 확인하고 있어요…`;
  const buttons=[...screen.querySelectorAll('[data-action="sign-in"]')];
  buttons.forEach(node=>{node.disabled=true;node.setAttribute('aria-disabled','true');});
  button.setAttribute('aria-busy','true');
  setTimeout(()=>{
    if(nextAuthOutcome==='failure'){
      nextAuthOutcome='success';
      authBusy=false;
      status.dataset.tone='error';
      status.textContent='로그인을 완료하지 못했어요. 다시 시도해주세요.';
      buttons.forEach(node=>{node.disabled=false;node.removeAttribute('aria-disabled');node.removeAttribute('aria-busy');});
      return;
    }
    patchSession({authProvider:provider,authExperience:'simulated'});
    const bypass=document.createElement('button');
    bypass.type='button';
    bypass.hidden=true;
    bypass.dataset.action='sign-in';
    bypass.dataset.flowAuthBypass='true';
    root.append(bypass);
    bypass.click();
    bypass.remove();
    authBusy=false;
  },420);
}

function patchCheckout(screen){
  const methods=[...screen.querySelectorAll('[data-participation-action="select-method"]')];
  for(const method of methods){
    const small=method.querySelector('small');
    if(!small)continue;
    small.textContent=method.dataset.method==='card'?'카드 결제 방식으로 참가를 진행해요.':'간편하게 참가를 진행해요.';
  }
  const disclosure=screen.querySelector('.fm-participation-disclosure');
  if(disclosure)disclosure.textContent='체험 결제에서는 실제 금액이 청구되지 않아요.';
  const boundary=screen.querySelector('[data-p1-checkout-boundary]');
  if(boundary)boundary.textContent='체험 결제 · 실제 청구 없음';
  const pending=screen.querySelector('[data-participation-panel="pending"]');
  if(pending){const small=pending.querySelector('small');if(small)small.textContent='결제 확인';}
  const failure=screen.querySelector('[data-participation-panel="failure"]');
  if(failure){
    const small=failure.querySelector('small');if(small)small.textContent='다시 시도할 수 있어요';
    const p=failure.querySelector('p');if(p)p.textContent='참가는 아직 확정되지 않았어요. 같은 경기 정보로 다시 시도할 수 있어요.';
  }
}

function patchSuccess(screen){
  if(screen.querySelector('[data-flow-success-next]'))return;
  const actions=screen.querySelector('.fm-next-actions');
  if(!actions)return;
  const panel=document.createElement('div');
  panel.className='fm-flow-success-next';
  panel.dataset.flowSuccessNext='true';
  panel.innerHTML='<small>경기 전 확인</small><div><span><b>체크인</b>경기 시작 20분 전부터</span><span><b>준비물</b>풋살화 권장</span><span><b>운영 공지</b>MY에서 확인</span></div>';
  actions.before(panel);
  const primary=actions.querySelector('[data-action="nav-profile"]');
  if(primary)primary.textContent='내 경기 확인하기';
}

function patchMatchday(scope){
  scope.querySelectorAll('.fm-matchday-kicker').forEach(node=>{node.textContent='오늘 경기';});
  scope.querySelectorAll('.fm-matchday-boundary').forEach(node=>{node.textContent='체험 중인 체크인 상태는 이 브라우저에만 저장돼요.';});
  scope.querySelectorAll('.fm-matchday-grid article').forEach((article,index)=>{
    const span=article.querySelector('span');if(!span)return;
    if(index%3===0&&!/도착/.test(span.textContent))span.textContent='체크인 가능 시간이 되면 버튼이 활성화돼요.';
    if(index%3===1)span.textContent='경기장 입장 동선은 경기 공지를 확인해주세요.';
    if(index%3===2)span.textContent='중요한 변경 사항은 MY에서 바로 확인할 수 있어요.';
  });
}

function patchReturn(scope){
  scope.querySelectorAll('.fm-return-kicker').forEach(node=>{node.textContent='경기 후 피드백';});
  scope.querySelectorAll('.fm-return-boundary').forEach(node=>{node.textContent='남긴 평가는 내 다음 경기 추천을 조정하는 데만 사용돼요.';});
  scope.querySelectorAll('.fm-return-history small').forEach(node=>{node.textContent='경기 기록';});
  scope.querySelectorAll('.fm-return-history span').forEach(node=>{node.textContent='완료한 경기와 내 피드백을 모아볼 수 있어요.';});
}

function patchPersonalization(scope){
  scope.querySelectorAll('.fm-personalization-boundary').forEach(node=>{node.textContent='저장한 추천 선호는 이 기기의 체험 환경에만 유지돼요.';});
  scope.querySelectorAll('[data-personalization-explanation] small').forEach(node=>{node.textContent='이 경기를 추천한 이유';});
}

function savedMatchesMarkup(ids){
  const matches=ids.map(id=>MATCHES.find(match=>match.id===id)).filter(Boolean);
  if(!matches.length)return '';
  return `<section class="fm-flow-saved" data-flow-saved><div class="fm-flow-saved-head"><h2>저장한 경기</h2><span>${matches.length}개</span></div><div class="fm-flow-saved-list">${matches.map(match=>`<button type="button" class="fm-flow-saved-card" data-flow-action="open-saved-match" data-match-id="${escapeHtml(match.id)}"><small>${escapeHtml(cleanDate(match.dateLabel))}</small><b>${escapeHtml(match.place)}</b><span>${escapeHtml(match.level)} · ${escapeHtml(match.distance)} · ${escapeHtml(match.spot)}</span></button>`).join('')}</div></section>`;
}

function ensureExperienceInfo(screen){
  let experience=screen.querySelector('[data-flow-experience]');
  if(experience)return;
  experience=document.createElement('section');
  experience.className='fm-flow-experience';
  experience.dataset.flowExperience='true';
  experience.innerHTML='<details><summary>체험 버전 안내</summary><p>경기, 잔여 자리, 시설 정보는 체험용 데이터예요. 로그인·결제·체크인 등 외부 서비스는 실제 계정이나 금액과 연결되지 않습니다.</p><p>선택한 조건과 진행 상태는 이 브라우저에만 저장돼요.</p><button type="button" data-action="reset-flow">체험 데이터 초기화</button></details>';
  screen.append(experience);
}

function patchProfile(screen){
  const session=readSession();
  const head=screen.querySelector('.fm-next-profile-head');
  if(head&&session.userName==='게스트'){
    const title=head.querySelector('h2');
    if(title)title.textContent=session.signedIn?'FootMate 플레이어':'게스트';
    const status=head.querySelector('p');
    if(status)status.textContent=session.signedIn?'체험 로그인 상태':'로그인 없이 둘러보는 중';
    const avatar=head.querySelector('.fm-next-profile-avatar');if(avatar)avatar.textContent=session.signedIn?'F':'G';
  }
  const menu=screen.querySelector('.fm-next-menu-list');
  if(menu){
    const setup=menu.querySelector('[data-action="edit-setup"] span');if(setup)setup.lastChild.nodeValue='내 추천 설정';
    const reset=menu.querySelector('[data-action="reset-flow"]');if(reset)reset.dataset.flowHidden='true';
  }
  screen.querySelector('[data-flow-saved]')?.remove();
  const ids=window.__FOOTMATE_DECISION__?.read?.().savedMatchIds||[];
  const html=savedMatchesMarkup(ids);
  if(html){
    const profileCard=screen.querySelector('.fm-next-profile-card');
    if(profileCard)profileCard.insertAdjacentHTML('beforebegin',html);
  }
  ensureExperienceInfo(screen);
}

function patchCompareDialog(scope){
  const dialog=scope.querySelector('[data-decision-dialog="compare"]');
  if(!dialog)return;
  const kicker=dialog.querySelector('.fm-decision-dialog-head small');if(kicker)kicker.textContent='경기 비교';
  dialog.querySelectorAll('dt').forEach(node=>{if(node.textContent.trim()==='샘플 잔여')node.textContent='남은 자리';});
  const disclosure=dialog.querySelector('.fm-decision-disclosure');if(disclosure)disclosure.textContent='두 경기의 현재 표시 정보를 같은 기준으로 비교했어요.';
}

function apply(){
  scheduled=false;
  if(!root||!isRealApp())return;
  ensureStyles();
  stripSampleScheduleLabels(root);
  const screen=root.querySelector('[data-screen]');
  if(!screen)return;
  if(screen.dataset.screen==='home')patchHome(screen);
  if(screen.dataset.screen==='discover')patchDiscover(screen);
  if(screen.dataset.screen==='detail')patchDetail(screen);
  if(screen.dataset.screen==='auth')patchAuth(screen);
  if(screen.dataset.screen==='checkout')patchCheckout(screen);
  if(screen.dataset.screen==='success')patchSuccess(screen);
  if(screen.dataset.screen==='profile')patchProfile(screen);
  patchMatchday(screen);
  patchReturn(screen);
  patchPersonalization(screen);
  patchCompareDialog(root);
  root.dataset.flowNaturalnessVersion=FLOW_VERSION;
}

function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(apply);
}

function rememberDetailOrigin(action){
  const session=readSession();
  const route=session.route;
  if(action==='open-match'&&['home','discover'].includes(route))patchSession({detailReturnRoute:route});
  if(action==='open-joined-match'&&['home','profile','schedule'].includes(route))patchSession({detailReturnRoute:route==='schedule'?'profile':route});
}

function navigateDetailBack(event,target){
  const route=readSession().detailReturnRoute;
  if(!['home','discover','profile'].includes(route))return false;
  event.preventDefault();
  event.stopImmediatePropagation();
  const action={home:'nav-home',discover:'nav-discover',profile:'nav-profile'}[route];
  const proxy=document.createElement('button');
  proxy.type='button';proxy.hidden=true;proxy.dataset.action=action;root.append(proxy);proxy.click();proxy.remove();
  return true;
}

document.addEventListener('click',event=>{
  if(!isRealApp())return;
  const actionTarget=event.target.closest('[data-action]');
  if(actionTarget){
    const action=actionTarget.dataset.action;
    if(action==='open-match'||action==='open-joined-match')rememberDetailOrigin(action);
    if(action==='detail-back'&&navigateDetailBack(event,actionTarget))return;
    if(action==='setup-next'){
      const session=readSession();
      if(Number(session.setupStep)===2&&!session.setupOrigin&&!session.setupComplete)patchSession({firstHomePending:true});
    }
    if(action==='sign-in'&&actionTarget.dataset.flowAuthBypass!=='true'){
      event.preventDefault();event.stopImmediatePropagation();beginAuth(actionTarget);return;
    }
  }
  const saved=event.target.closest('[data-flow-action="open-saved-match"]');
  if(saved){
    event.preventDefault();event.stopImmediatePropagation();
    const proxy=document.createElement('button');
    proxy.type='button';proxy.hidden=true;proxy.dataset.action='open-match';proxy.dataset.matchId=saved.dataset.matchId;root.append(proxy);proxy.click();proxy.remove();
  }
},true);

if(root){
  const observer=new MutationObserver(schedule);
  observer.observe(root,{childList:true,subtree:true});
  schedule();
  queueMicrotask(schedule);
}

window.__FOOTMATE_REAL_APP_FLOW__=Object.freeze({
  version:FLOW_VERSION,
  setNextAuthOutcome:value=>{nextAuthOutcome=value==='failure'?'failure':'success';return nextAuthOutcome;},
  read:()=>({authBusy,detailReturnRoute:readSession().detailReturnRoute||null,hasVisitedHome:Boolean(readSession().hasVisitedHome)})
});
