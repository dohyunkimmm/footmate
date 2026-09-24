import {connectedMatchdayPlatform} from '../application/connected-platform.js';
import {footmatePlatform} from '../../v4/platform/application/platform.js';

const root=document.getElementById('footmate-next');
const entryParams=new URLSearchParams(location.search);
const entryMode=['guided','evidence'].includes(entryParams.get('mode'))?entryParams.get('mode'):'real';
const entryEmbed=entryParams.get('embed')==='1';
const internalResume=entryParams.get('resume')==='1'||entryParams.get('oauth_return')==='1';
const isFreshEntry=entryMode==='real'&&!entryEmbed&&!internalResume;
const FLOW_REVIEW_VERSION='flow-review-v1';
const HISTORY_KEY='footmate:release-flow:history:v1';
const LAST_ROUTE_KEY='footmate:release-flow:last-route:v1';
const SUPPRESS_HISTORY_KEY='footmate:release-flow:suppress-history:v1';
const OAUTH_PENDING_KEY='footmate:app:oauth-pending:v1';
const OAUTH_ERROR_KEY='footmate:app:oauth-error:v1';
const TEAM_DIALOG_ID='fm-release-team-message';
const SIMULATION_BOUNDARY='실시간 위치·지도·팀 채팅·알림 backend는 연결하지 않았습니다. 상태와 복구 흐름을 검증하는 deterministic simulation입니다.';
const AI_FALLBACK_COPY='AI 장애나 지연 시 기존 rules-based 검색으로 자동 전환합니다.';

if(isFreshEntry){
  const current=footmatePlatform.session.read()||{};
  footmatePlatform.session.write({...current,route:'welcome',setupStep:0});
  sessionStorage.removeItem(HISTORY_KEY);
  sessionStorage.removeItem(LAST_ROUTE_KEY);
}
document.documentElement.dataset.footmateFreshEntry=isFreshEntry?'reset':'preserved';
document.documentElement.dataset.footmateV5Version=connectedMatchdayPlatform.version;
document.documentElement.dataset.footmateReleaseFlowReview=FLOW_REVIEW_VERSION;
if(root){
  root.dataset.connectedPlatformVersion=connectedMatchdayPlatform.version;
  root.dataset.connectionMode=connectedMatchdayPlatform.connectionMode;
  root.dataset.domainOwnership='separated';
  root.dataset.providerBoundary='explicit';
}

function currentJourneyCandidate(){
  const session=footmatePlatform.session.read()||{};
  const participation=footmatePlatform.repositories.participation.read({})||{};
  const matchday=footmatePlatform.repositories.matchday.read({})||{};
  const returnLoop=footmatePlatform.repositories.returnLoop.read({})||{};
  return {
    recommendation:{selectedMatchId:session.selectedMatchId||participation.matchId||null},
    participation:{status:participation.status||'idle',matchId:participation.matchId||session.joinedMatchId||null,attemptId:participation.attemptId||null},
    matchday:{status:matchday.status||matchday.stage||'idle',matchId:matchday.matchId||session.joinedMatchId||null},
    returnState:{completed:Boolean(returnLoop.completed||returnLoop.submittedAt),matchId:returnLoop.matchId||session.joinedMatchId||null,repeatIntent:returnLoop.repeatIntent}
  };
}

window.__FOOTMATE_V5__=Object.freeze({
  version:connectedMatchdayPlatform.version,
  architecture:connectedMatchdayPlatform.architecture,
  connectionMode:connectedMatchdayPlatform.connectionMode,
  connectedProviders:connectedMatchdayPlatform.connectedProviders,
  mockProviders:connectedMatchdayPlatform.mockProviders,
  externalProductionFeatures:connectedMatchdayPlatform.externalProductionFeatures,
  domains:Object.freeze(Object.keys(connectedMatchdayPlatform.domains)),
  providerCatalog:connectedMatchdayPlatform.providers.catalog,
  evaluateJourney:candidate=>connectedMatchdayPlatform.evaluateJourney(candidate),
  validateCurrentJourney:()=>connectedMatchdayPlatform.evaluateJourney(currentJourneyCandidate()),
  executeProvider:(name,method,input)=>connectedMatchdayPlatform.executeProvider(name,method,input)
});

const providerState={loading:false,loaded:false,config:null,enabled:{google:false,kakao:false}};
let enhancementScheduled=false;
function readSession(){return footmatePlatform.session.read()||{}}
function writeSession(patch={}){const next={...readSession(),...patch};footmatePlatform.session.write(next);return next}
function readStack(){try{const value=JSON.parse(sessionStorage.getItem(HISTORY_KEY)||'[]');return Array.isArray(value)?value.filter(Boolean):[]}catch{return[]}}
function writeStack(value){sessionStorage.setItem(HISTORY_KEY,JSON.stringify(value.slice(-24)))}
function displayAlias(value=''){return String(value).replace(/포워드/g,'공격수').replace(/초중급/g,'초급').replace(/중급\+/g,'고급')}
function canonicalAlias(value=''){return String(value).replace(/초급/g,'초중급').replace(/고급/g,'중급+')}
function currentRoute(){return root?.querySelector('[data-screen]')?.dataset.screen||null}
function resumeUrl(extra={}){
  const url=new URL(location.href);url.search='';url.hash='';url.searchParams.set('resume','1');
  for(const [key,value] of Object.entries(extra))if(value!==null&&value!==undefined)url.searchParams.set(key,String(value));
  return `${url.pathname}${url.search}`;
}
function navigateRoute(route,{suppressHistory=false,query={}}={}){
  if(!route)return;writeSession({route});if(suppressHistory)sessionStorage.setItem(SUPPRESS_HISTORY_KEY,'1');location.replace(resumeUrl(query));
}
function trackRoute(){
  if(entryMode!=='real')return;const route=currentRoute();if(!route)return;const last=sessionStorage.getItem(LAST_ROUTE_KEY);
  if(!last){sessionStorage.setItem(LAST_ROUTE_KEY,route);return}if(last===route)return;
  if(sessionStorage.getItem(SUPPRESS_HISTORY_KEY)==='1')sessionStorage.removeItem(SUPPRESS_HISTORY_KEY);
  else{const stack=readStack();if(stack[stack.length-1]!==last)stack.push(last);writeStack(stack)}
  sessionStorage.setItem(LAST_ROUTE_KEY,route);
}
function goBack(fallback){
  const route=currentRoute(),stack=readStack();let previous=null;
  while(stack.length&&!previous){const candidate=stack.pop();if(candidate&&candidate!==route)previous=candidate}
  writeStack(stack);navigateRoute(previous||fallback,{suppressHistory:true,query:{back:'1'}});
}
function aliasVisibleCopy(){
  if(!root)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){const parent=node.parentElement;if(!parent||['SCRIPT','STYLE','TEXTAREA'].includes(parent.tagName))return NodeFilter.FILTER_REJECT;return /포워드|초중급|중급\+/.test(node.nodeValue||'')?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});
  const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);nodes.forEach(node=>{node.nodeValue=displayAlias(node.nodeValue||'')});
  root.querySelectorAll('input[placeholder]').forEach(input=>{input.placeholder=displayAlias(input.placeholder)});
}
function decorateAi(){
  if(!root)return;
  root.querySelectorAll('[data-ai-assistant]').forEach(card=>{
    card.classList.add('fm-ai-card--core');
    if(!card.querySelector('[data-ai-core-label]'))card.insertAdjacentHTML('afterbegin','<div class="fm-ai-core-label" data-ai-core-label><span>CORE FEATURE</span><b>AI MATCHING</b></div>');
    const fallbackCopy=card.querySelector('[data-ai-status] span');
    if(fallbackCopy&&/AI 장애나 지연/.test(fallbackCopy.textContent||''))fallbackCopy.textContent=AI_FALLBACK_COPY;
  });
}
async function loadBackendConfig(){
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),5000);
  try{
    const response=await fetch('/api/beta-config',{headers:{accept:'application/json'},cache:'no-store',signal:controller.signal});
    const payload=await response.json().catch(()=>({}));
    if(!response.ok||!payload?.connected||!payload.url||!payload.publishableKey)throw new Error('beta_backend_unavailable');
    return {url:String(payload.url).replace(/\/$/,''),publishableKey:String(payload.publishableKey)};
  }finally{clearTimeout(timer)}
}
async function loadProviders(){
  if(providerState.loading||providerState.loaded)return providerState;providerState.loading=true;
  try{
    const config=await loadBackendConfig();
    const response=await fetch(`${config.url}/auth/v1/settings`,{headers:{apikey:config.publishableKey,accept:'application/json'},cache:'no-store'});
    if(!response.ok)throw new Error(`provider_settings_${response.status}`);
    const payload=await response.json().catch(()=>({}));providerState.config=config;providerState.enabled={google:Boolean(payload?.external?.google),kakao:Boolean(payload?.external?.kakao)};
  }catch(_error){providerState.config=null;providerState.enabled={google:false,kakao:false}}
  finally{providerState.loading=false;providerState.loaded=true;decorateAuth()}
  return providerState;
}
function ensureAuthStatus(auth){
  let status=auth.querySelector('[data-release-auth-status]');if(status)return status;
  status=document.createElement('p');status.className='fm-release-auth-status';status.dataset.releaseAuthStatus='';
  const anchor=auth.querySelector('.fm-auth-context,.fm-auth-terms,.fm-next-auth-terms');if(anchor)anchor.before(status);else auth.append(status);return status;
}
function authProviderButton(auth,provider){
  return auth.querySelector(`.fm-auth-provider--${provider},.fm-next-social--${provider}`);
}
function ensureProviderButton(auth,provider){
  let button=authProviderButton(auth,provider);if(button)return button;
  const list=auth.querySelector('.fm-auth-sso,.fm-next-social-list');if(!list)return null;
  button=document.createElement('button');button.type='button';
  if(list.classList.contains('fm-auth-sso')){
    button.className=`fm-auth-provider fm-auth-provider--${provider}`;
    button.setAttribute('aria-label',`${provider==='google'?'Google':'카카오'}로 계속하기`);
    button.textContent=provider==='google'?'G':'K';
  }else{
    button.className=`fm-next-social fm-next-social--${provider}`;
    button.textContent=`${provider==='google'?'Google':'카카오'}로 계속하기`;
  }
  list.append(button);return button;
}
function decorateAuth(){
  if(!root||entryMode!=='real')return;const auth=root.querySelector('[data-screen="auth"]');if(!auth)return;
  auth.querySelectorAll('.fm-next-social--apple,.fm-auth-provider--apple,.fm-auth-provider--naver,[data-provider="apple"],[data-provider="naver"]').forEach(button=>button.remove());
  ['kakao','google'].forEach(provider=>{
    const button=ensureProviderButton(auth,provider);if(!button)return;
    button.removeAttribute('data-action');button.removeAttribute('data-provider');button.dataset.oauthProvider=provider;button.type='button';
    if(!providerState.loaded){button.disabled=true;button.hidden=false;button.setAttribute('aria-busy','true')}
    else if(providerState.enabled[provider]){button.disabled=false;button.removeAttribute('aria-busy');button.hidden=false}
    else{button.disabled=true;button.removeAttribute('aria-busy');button.hidden=true}
  });
  const status=ensureAuthStatus(auth),oauthError=sessionStorage.getItem(OAUTH_ERROR_KEY)||'';
  if(oauthError){status.dataset.tone='error';status.textContent=oauthError;sessionStorage.removeItem(OAUTH_ERROR_KEY)}
  else if(!providerState.loaded){status.dataset.tone='loading';status.textContent='Google · Kakao 연결 상태를 확인하고 있습니다.'}
  else if(providerState.enabled.google||providerState.enabled.kakao){status.dataset.tone='connected';status.textContent='Google 또는 Kakao로 계속하면 해당 서비스의 로그인 화면으로 이동합니다.'}
  else{status.dataset.tone='unavailable';status.textContent='현재 활성화된 소셜 로그인 provider가 없습니다.'}
  if(!providerState.loaded&&!providerState.loading)void loadProviders();
}
async function authorize(provider){
  await loadProviders();
  if(!providerState.config||!providerState.enabled[provider]){sessionStorage.setItem(OAUTH_ERROR_KEY,`${provider==='google'?'Google':'Kakao'} 로그인이 현재 활성화되어 있지 않습니다.`);decorateAuth();return}
  sessionStorage.setItem(OAUTH_PENDING_KEY,JSON.stringify({provider,startedAt:new Date().toISOString()}));
  const url=new URL(`${providerState.config.url}/auth/v1/authorize`);url.searchParams.set('provider',provider);url.searchParams.set('redirect_to',`${location.origin}/beta`);location.assign(url.toString());
}
async function finishOAuthReturn(){
  if(entryMode!=='real'||entryParams.get('oauth_return')!=='1')return;
  const hash=new URLSearchParams(location.hash.replace(/^#/,'')),query=new URLSearchParams(location.search);
  const error=hash.get('error_description')||hash.get('error')||query.get('error_description')||query.get('error');
  if(error){writeSession({signedIn:false,route:'auth'});sessionStorage.setItem(OAUTH_ERROR_KEY,`소셜 로그인을 완료하지 못했습니다: ${error}`);sessionStorage.removeItem(OAUTH_PENDING_KEY);location.replace(resumeUrl({auth_error:'1'}));return}
  const token=hash.get('access_token');
  if(!token){writeSession({signedIn:false,route:'auth'});sessionStorage.setItem(OAUTH_ERROR_KEY,'소셜 로그인 응답을 확인하지 못했습니다. 다시 시도해주세요.');sessionStorage.removeItem(OAUTH_PENDING_KEY);location.replace(resumeUrl({auth_error:'1'}));return}
  try{
    const config=await loadBackendConfig();
    const response=await fetch(`${config.url}/auth/v1/user`,{headers:{apikey:config.publishableKey,authorization:`Bearer ${token}`,accept:'application/json'},cache:'no-store'});if(!response.ok)throw new Error(`oauth_user_${response.status}`);
    const user=await response.json();writeSession({signedIn:true,route:'checkout',userName:user?.user_metadata?.full_name||user?.user_metadata?.name||readSession().userName||'회원'});sessionStorage.removeItem(OAUTH_PENDING_KEY);sessionStorage.removeItem(OAUTH_ERROR_KEY);location.replace(resumeUrl({oauth:'success'}));
  }catch(_error){writeSession({signedIn:false,route:'auth'});sessionStorage.setItem(OAUTH_ERROR_KEY,'소셜 로그인 확인에 실패했습니다. 다시 시도해주세요.');sessionStorage.removeItem(OAUTH_PENDING_KEY);location.replace(resumeUrl({auth_error:'1'}))}
}
function closeTeamMessage(){document.getElementById(TEAM_DIALOG_ID)?.remove();document.documentElement.classList.remove('fm-release-dialog-open')}
function openTeamMessage(){
  closeTeamMessage();const dialog=document.createElement('div');dialog.id=TEAM_DIALOG_ID;dialog.className='fm-release-dialog-layer';
  dialog.innerHTML=`<section class="fm-release-team-dialog" role="dialog" aria-modal="true" aria-labelledby="fm-team-message-title"><div class="fm-release-team-head"><div><small>TEAM MESSAGE · SIMULATION</small><h2 id="fm-team-message-title">팀 메시지</h2></div><button type="button" data-release-action="close-team" aria-label="팀 메시지 닫기">×</button></div><div class="fm-release-team-list"><article><b>운영 안내</b><p>조끼는 현장에서 제공합니다. 킥오프 10분 전까지 3층 코트 앞에 모여주세요.</p><span>샘플 공지</span></article><article><b>팀 공지</b><p>도착 후 체크인을 완료하면 현재 참가 상태를 기준으로 경기 준비 화면이 이어집니다.</p><span>deterministic simulation</span></article></div><p class="fm-release-boundary">${SIMULATION_BOUNDARY}</p></section>`;
  document.body.append(dialog);document.documentElement.classList.add('fm-release-dialog-open');dialog.querySelector('[data-release-action="close-team"]')?.focus();
}
function decorateLifecycle(){
  if(!root)return;
  const session=readSession();
  const checked=root.querySelector('[data-matchday-state="checked-in"]');
  const actions=checked?.querySelector('.fm-matchday-actions');
  if(session.matchStage==='postgame'){
    if(checked){checked.hidden=true;checked.style.setProperty('display','none','important')}
  }else{
    if(checked){checked.hidden=false;checked.style.removeProperty('display')}
    if(actions&&!actions.querySelector('[data-release-action="finish-match"]'))actions.insertAdjacentHTML('afterbegin','<button class="fm-release-primary-action" type="button" data-release-action="finish-match">경기 종료 후 평가하기</button>');
  }
  const saved=root.querySelector('[data-return-state="saved"]');if(saved&&!saved.querySelector('[data-release-action="next-match"]'))saved.insertAdjacentHTML('beforeend','<button class="fm-release-primary-action fm-release-next-match" type="button" data-release-action="next-match">다음 경기 찾기</button>');
}
function finishMatch(){const current=readSession();writeSession({matchStage:'postgame',route:'schedule',checkedInMatchId:current.joinedMatchId||current.checkedInMatchId||null});location.replace(resumeUrl({flow:'postgame'}))}
function nextMatch(){navigateRoute('discover',{query:{flow:'return'}})}
function enhanceReleaseFlow(){trackRoute();aliasVisibleCopy();decorateAi();decorateAuth();decorateLifecycle();if(root)root.dataset.releaseFlowReview=FLOW_REVIEW_VERSION}
function scheduleEnhance(){if(enhancementScheduled)return;enhancementScheduled=true;requestAnimationFrame(()=>{enhancementScheduled=false;enhanceReleaseFlow()})}
if(root){const observer=new MutationObserver(scheduleEnhance);observer.observe(root,{childList:true,subtree:true,characterData:true})}

document.addEventListener('submit',event=>{
  const form=event.target.closest?.('[data-ai-form]');if(!form)return;const input=form.querySelector('[data-ai-input]');if(!input)return;const display=input.value,canonical=canonicalAlias(display);
  if(canonical!==display){input.value=canonical;queueMicrotask(()=>{input.value=displayAlias(display)})}
},true);
document.addEventListener('click',event=>{
  const target=event.target.closest?.('button,[data-action],[data-release-action]');if(!target)return;
  const declaredProvider=target.dataset.oauthProvider||target.dataset.provider;
  const provider=['google','kakao'].includes(declaredProvider)?declaredProvider:target.classList.contains('fm-next-social--google')||target.classList.contains('fm-auth-provider--google')?'google':target.classList.contains('fm-next-social--kakao')||target.classList.contains('fm-auth-provider--kakao')?'kakao':null;
  if(provider){event.preventDefault();event.stopPropagation();void authorize(provider);return}
  if(['apple','naver'].includes(declaredProvider)||target.classList.contains('fm-next-social--apple')||target.classList.contains('fm-auth-provider--apple')||target.classList.contains('fm-auth-provider--naver')){event.preventDefault();event.stopPropagation();return}
  const action=target.dataset.action;
  if(entryMode==='real'&&action==='auth-back'){event.preventDefault();event.stopPropagation();goBack('detail');return}
  if(entryMode==='real'&&action==='checkout-back'){event.preventDefault();event.stopPropagation();goBack('detail');return}
  if(entryMode==='real'&&action==='detail-back'){event.preventDefault();event.stopPropagation();goBack(readSession().setupComplete?'home':'welcome');return}
  if(action==='team-chat'){event.preventDefault();event.stopPropagation();openTeamMessage();return}
  const releaseAction=target.dataset.releaseAction;
  if(releaseAction==='close-team'){event.preventDefault();closeTeamMessage();return}
  if(releaseAction==='finish-match'){event.preventDefault();event.stopPropagation();finishMatch();return}
  if(releaseAction==='next-match'){event.preventDefault();event.stopPropagation();nextMatch();return}
  if(target.matches('[data-ai-example]')){const input=target.closest('[data-ai-assistant]')?.querySelector('[data-ai-input]');queueMicrotask(()=>{if(input)input.value=displayAlias(input.value)})}
},true);
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.getElementById(TEAM_DIALOG_ID))closeTeamMessage()});

window.__FOOTMATE_RELEASE_REVIEW__=Object.freeze({
  version:FLOW_REVIEW_VERSION,simulationBoundary:SIMULATION_BOUNDARY,aiFallbackCopy:AI_FALLBACK_COPY,readHistory:readStack,
  get providers(){return {...providerState.enabled}},get route(){return currentRoute()},openTeamMessage,finishMatch,nextMatch
});
enhanceReleaseFlow();
queueMicrotask(scheduleEnhance);
window.addEventListener('load',scheduleEnhance,{once:true});
void finishOAuthReturn();