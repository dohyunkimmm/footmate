import {MATCHES,createState,joinedMatch,selectedMatch} from './data.js';
import {footmatePlatform} from './platform/application/platform.js';

const root=document.getElementById('footmate-next');
const params=new URLSearchParams(location.search);
const requestedMode=params.get('mode');
const mode=['guided','evidence'].includes(requestedMode)?requestedMode:'real';
const embed=params.get('embed')==='1';

const allowedRoutes=new Set(['welcome','setup','home','discover','detail','auth','checkout','success','schedule','profile']);

function safeLoad(){
  if(mode!=='real')return{};
  return footmatePlatform.session.read()||{};
}

let state=createState(safeLoad());
if(!allowedRoutes.has(state.route))state.route=state.setupComplete?'home':'welcome';
if(mode==='guided')state=createState();
if(mode==='evidence')state=createState({setupComplete:true,route:'home',signedIn:true});

function persist(){
  if(mode!=='real')return;
  footmatePlatform.session.write(state);
}

function setState(patch,{renderNow=true}={}){
  state={...state,...patch};
  persist();
  if(renderNow)render();
}

function money(value){return new Intl.NumberFormat('ko-KR').format(value)+'원'}

function icon(name,className='fm-next-icon'){
  const common=`class="${className}" viewBox="0 0 24 24" aria-hidden="true"`;
  const icons={
    logo:`<svg ${common}><path d="M5 15.5c3.3-5.2 10.7-5.2 14 0"/><path d="M7.5 11.1 10 7.5h4l2.5 3.6"/><path d="M9.2 16.4h5.6"/><circle cx="12" cy="12" r="9"/></svg>`,
    arrow:`<svg ${common}><path d="M5 12h14"/><path d="m14 7 5 5-5 5"/></svg>`,
    back:`<svg ${common}><path d="m15 18-6-6 6-6"/></svg>`,
    home:`<svg ${common}><path d="m4 10 8-6 8 6v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z"/></svg>`,
    search:`<svg ${common}><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>`,
    calendar:`<svg ${common}><rect x="4" y="5.5" width="16" height="14" rx="2"/><path d="M8 3.5v4M16 3.5v4M4 10h16"/></svg>`,
    user:`<svg ${common}><circle cx="12" cy="8" r="3.5"/><path d="M5.5 20c.5-4 3-6 6.5-6s6 2 6.5 6"/></svg>`,
    pin:`<svg ${common}><path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/></svg>`,
    level:`<svg ${common}><path d="M5 19v-5M12 19V9M19 19V4"/></svg>`,
    position:`<svg ${common}><circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16"/></svg>`,
    clock:`<svg ${common}><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/></svg>`,
    users:`<svg ${common}><circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.2"/><path d="M3.5 19c.4-3.3 2.5-5.2 5.5-5.2s5.1 1.9 5.5 5.2M14.5 15c2.6-.5 4.8 1 5.4 3.6"/></svg>`,
    check:`<svg ${common}><path d="m5 12.5 4.2 4L19 7"/></svg>`,
    card:`<svg ${common}><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/></svg>`,
    route:`<svg ${common}><circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h3a3 3 0 0 0 3-3V9a3 3 0 0 1 3-3h-1"/></svg>`,
    chat:`<svg ${common}><path d="M5 18.5 4 21l3.4-1.7A8.5 8.5 0 1 0 4 16"/></svg>`,
    shield:`<svg ${common}><path d="M12 3 19 6v5c0 4.5-2.7 7.5-7 10-4.3-2.5-7-5.5-7-10V6z"/><path d="m9 12 2 2 4-4"/></svg>`,
    chevron:`<svg ${common}><path d="m9 6 6 6-6 6"/></svg>`,
    reset:`<svg ${common}><path d="M5 7v5h5"/><path d="M6.3 16.5A7.5 7.5 0 1 0 5.5 8"/></svg>`,
    info:`<svg ${common}><circle cx="12" cy="12" r="9"/><path d="M12 10v6M12 7h.01"/></svg>`,
    spark:`<svg ${common}><path d="m12 3 1.3 4.2L17.5 9l-4.2 1.8L12 15l-1.3-4.2L6.5 9l4.2-1.8z"/><path d="m18 15 .7 2.3L21 18l-2.3.7L18 21l-.7-2.3L15 18l2.3-.7z"/></svg>`
  };
  return icons[name]||icons.info;
}

function brand({dark=false}={}){
  return `<div class="fm-next-brand">
    <span class="fm-next-brand-mark">${icon('logo')}</span>
    <span>FootMate<small>${dark?'Matchday Companion':'내 경기의 시작부터 끝까지'}</small></span>
  </div>`;
}

function button(label,action,variant='primary',extra=''){
  return `<button type="button" class="fm-next-button fm-next-button--${variant}" data-action="${action}" ${extra}>${label}</button>`;
}

function topbar({title='',backAction='',dark=false,actionHtml=''}){
  return `<header class="fm-next-topbar${dark?' fm-next-topbar--dark':''}">
    ${backAction?`<button class="fm-next-icon-button" type="button" data-action="${backAction}" aria-label="이전 화면">${icon('back')}</button>`:brand({dark})}
    ${title?`<strong>${title}</strong>`:''}
    ${actionHtml||'<span style="width:44px" aria-hidden="true"></span>'}
  </header>`;
}

function nav(active){
  const items=[
    ['home','홈','home','nav-home'],
    ['discover','경기 찾기','search','nav-discover'],
    ['schedule','내 경기','calendar','nav-schedule'],
    ['profile','MY','user','nav-profile']
  ];
  return `<nav class="fm-next-nav" aria-label="FootMate 주요 메뉴">
    ${items.map(([id,label,iconName,action])=>`<button type="button" data-action="${action}" ${active===id?'aria-current="page"':''}><span class="fm-next-nav-icon">${icon(iconName)}</span>${label}</button>`).join('')}
  </nav>`;
}

function guide(){
  const routeStep={welcome:0,setup:1,home:2,discover:2,detail:3,auth:4,checkout:4,success:5,schedule:5,profile:5}[state.route]??0;
  const steps=[
    ['Value first','회원가입보다 서비스 가치를 먼저 이해합니다.'],
    ['Preference before account','지역·포지션·레벨만 먼저 설정합니다.'],
    ['See the recommendation','가입 없이 추천 경기를 먼저 확인합니다.'],
    ['Decide with confidence','추천 이유·자리·가격·정책을 한 화면에서 판단합니다.'],
    ['Sign in to join','참가 의사가 생긴 시점에만 로그인을 요청합니다.'],
    ['Matchday continuity','참가 후에는 오늘의 경기와 체크인까지 이어집니다.']
  ];
  const scenario=mode==='evidence'?`<div class="fm-next-evidence-box"><small>EVIDENCE MODE</small><p>외부 인증·결제·실시간 수용량은 연결하지 않은 세션 기반 검증 상태입니다. UI의 정상·경기당일·경기후 상태를 독립적으로 확인합니다.</p></div>
    <div class="fm-next-scenarios" aria-label="검증 시나리오">
      <button data-action="scenario-discover">탐색 전</button>
      <button data-action="scenario-upcoming">참가 완료</button>
      <button data-action="scenario-matchday">경기 당일</button>
      <button data-action="scenario-postgame">경기 후</button>
    </div>`:'';
  return `<aside class="fm-next-guide" aria-label="Case Study Guide">
    <div class="fm-next-guide-brand"><span class="fm-next-brand-mark">${icon('logo')}</span>FootMate</div>
    <div class="fm-next-guide-kicker">${mode==='evidence'?'Reviewer Evidence':'Guided Case Study'}</div>
    <h1>실제 사용자 흐름을 먼저 보여줍니다.</h1>
    <p>기술 설명보다 사용자가 언제 가치를 느끼고, 왜 가입하며, 어떻게 경기 당일까지 이어지는지를 앞에 둔 v4 공식 경험입니다.</p>
    ${scenario}
    <div class="fm-next-guide-steps">
      ${steps.map((item,index)=>`<div class="fm-next-guide-step${routeStep===index?' is-current':''}"><b>${index+1}. ${item[0]}</b><span>${item[1]}</span></div>`).join('')}
    </div>
    <div class="fm-next-guide-actions">
      ${button(`${icon('reset')} 처음부터 보기`,'reset-flow','ghost')}
      ${button('Real App만 보기','open-real','lime')}
    </div>
  </aside>`;
}

function welcomeView(){
  return `<section class="fm-next-screen fm-next-screen--intro" data-screen="welcome">
    <div class="fm-next-intro">
      <div class="fm-next-topbar fm-next-topbar--dark">${brand({dark:true})}<span style="width:44px" aria-hidden="true"></span></div>
      <div class="fm-next-intro-copy">
        <div class="fm-next-eyebrow"><span class="fm-next-eyebrow-dot"></span>오늘 뛸 경기를 더 쉽게</div>
        <h1>내 수준에 맞는 경기부터,<br>경기 당일까지.</h1>
        <p class="fm-next-intro-lead">지역과 플레이 스타일만 알려주세요. FootMate가 맞는 경기를 먼저 보여주고, 참가가 필요할 때 계정을 연결합니다.</p>
      </div>
      <div class="fm-next-intro-flow" aria-label="FootMate 핵심 흐름"><b>Find</b><span aria-hidden="true">→</span><b>Decide</b><span aria-hidden="true">→</span><b>Join</b><span aria-hidden="true">→</span><b>Play</b><span aria-hidden="true">→</span><b>Return</b></div>
      <div class="fm-next-actions">
        ${button(`내 경기 찾아보기 ${icon('arrow')}`,'start-setup','lime')}
        ${state.setupComplete?button('이전 설정으로 계속하기','continue-home','text'):''}
      </div>
      <p class="fm-next-intro-note">둘러보는 데 계정이 필요하지 않아요.</p>
    </div>
  </section>`;
}

const setupSteps=[
  {
    key:'region',
    title:'주로 어디에서 뛰나요?',
    copy:'가까운 경기부터 보여드릴게요.',
    options:[['수원 · 영통','영통 · 망포 · 광교'],['수원 · 인계','인계 · 권선 · 매탄'],['용인 · 기흥','기흥 · 보정 · 죽전'],['서울 · 강남','강남 · 서초 · 송파']]
  },
  {
    key:'position',
    title:'어떤 포지션이 편한가요?',
    copy:'추천 경기의 남은 자리와 함께 볼게요.',
    options:[['MF','미드필더'],['FW','공격수'],['DF','수비'],['GK','골키퍼']]
  },
  {
    key:'level',
    title:'평소 경기 강도는 어떤가요?',
    copy:'정확한 점수보다 체감 난이도를 먼저 맞춥니다.',
    options:[['입문','천천히 배우는 중'],['초중급','기본 플레이에 익숙해요'],['중급','정기적으로 경기해요'],['중급+','빠른 템포도 괜찮아요']]
  }
];

function setupDisplayValue(key,value){
  if(key==='level')return {'초중급':'초급','중급+':'고급'}[value]||value;
  return value;
}

function setupView(){
  const step=Math.max(0,Math.min(setupSteps.length-1,state.setupStep||0));
  const data=setupSteps[step];
  const current=state[data.key];
  return `<section class="fm-next-screen fm-next-screen--plain" data-screen="setup">
    ${topbar({backAction:step===0?'back-welcome':'setup-back',title:'내 플레이 설정'})}
    <div class="fm-next-step-indicator" aria-label="설정 진행 ${step+1}/${setupSteps.length}">${setupSteps.map((_,i)=>`<span class="${i<step?'is-done':i===step?'is-active':''}"></span>`).join('')}</div>
    <h1 class="fm-next-question">${data.title}</h1>
    <p class="fm-next-question-copy">${data.copy}</p>
    <div class="fm-next-choice-grid">
      ${data.options.map(([value,desc])=>`<button type="button" class="fm-next-choice" data-action="choose-setup" data-field="${data.key}" data-value="${value}" aria-pressed="${current===value}"><b>${setupDisplayValue(data.key,value)}</b><span>${desc}</span></button>`).join('')}
    </div>
    <div class="fm-next-setup-footer">${button(step===setupSteps.length-1?`추천 경기 보기 ${icon('arrow')}`:'다음','setup-next','primary')}</div>
  </section>`;
}

function matchCard(match,index=0){
  return `<button type="button" class="fm-next-match-card" data-action="open-match" data-match-id="${match.id}" aria-label="${match.place} 상세 보기">
    <div class="fm-next-match-card-media">
      <div class="fm-next-match-date"><span>${match.dateLabel}</span>${index===0?`<span class="fm-next-fit-badge">${icon('spark')} 추천</span>`:''}</div>
      <div class="fm-next-match-place">${match.place}</div>
    </div>
    <div class="fm-next-match-body">
      <div class="fm-next-match-tags"><span class="fm-next-tag fm-next-tag--strong">${match.fit}</span><span class="fm-next-tag">${match.distance}</span><span class="fm-next-tag">${match.spot}</span></div>
      <div class="fm-next-match-footer"><div><small>${match.format} · ${match.duration}</small><b>${match.level} · ${match.surface}</b></div><div class="fm-next-price">${money(match.price)}</div></div>
    </div>
  </button>`;
}

function adaptiveContext(){
  const match=joinedMatch(state);
  if(!match){
    return `<div class="fm-next-context-card"><div class="fm-next-context-kicker">${icon('spark')} FOR YOU</div><h2>${state.region} 추천 경기</h2><p>${state.level} · ${state.position} 기준으로 가까운 경기부터 정리했습니다.</p><div class="fm-next-context-actions">${button('추천 경기 보기','nav-discover','lime')}${button('조건 바꾸기','edit-setup','secondary')}</div></div>`;
  }
  if(state.matchStage==='matchday'){
    return `<div class="fm-next-context-card"><div class="fm-next-context-kicker">${icon('clock')} TODAY · KICKOFF 20:00</div><h2>경기까지 1시간 20분</h2><p>${match.place} · 현재 도착 7/10</p><div class="fm-next-context-actions">${button('체크인하기','check-in','lime')}${button('길찾기','show-route','secondary')}</div></div>`;
  }
  if(state.matchStage==='postgame'){
    return `<div class="fm-next-context-card"><div class="fm-next-context-kicker">${icon('check')} MATCH COMPLETE</div><h2>오늘 경기, 어땠나요?</h2><p>간단한 평가가 다음 추천의 경기 강도를 더 잘 맞추는 데 사용됩니다.</p><div class="fm-next-context-actions">${button('경기 평가하기','rate-match','lime')}${button('결과 보기','nav-schedule','secondary')}</div></div>`;
  }
  return `<div class="fm-next-context-card"><div class="fm-next-context-kicker">${icon('calendar')} NEXT MATCH</div><h2>${match.shortDate}<br>${match.place}</h2><p>참가가 확정됐어요. 경기 당일 필요한 정보를 한곳에서 확인할 수 있습니다.</p><div class="fm-next-context-actions">${button('내 경기 보기','nav-schedule','lime')}${button('경기 상세','open-joined-match','secondary')}</div></div>`;
}

function homeView(){
  const returnUser=state.setupComplete;
  return `<section class="fm-next-screen" data-screen="home">
    ${topbar({actionHtml:`<button type="button" class="fm-next-icon-button" data-action="nav-profile" aria-label="내 정보">${icon('user')}</button>`})}
    <div class="fm-next-greeting"><small>${returnUser?'다시 반가워요':'설정이 완료됐어요'}</small><h1>${state.userName||'도현'}님, <span>오늘 경기 어때요?</span></h1></div>
    ${adaptiveContext()}
    <div class="fm-next-section-head"><div><h2>지금 잘 맞는 경기</h2><p>거리, 레벨, 남은 포지션을 함께 봤어요.</p></div><button class="fm-next-button fm-next-button--text" data-action="nav-discover">전체 보기</button></div>
    <div class="fm-next-list">${MATCHES.slice(0,2).map((match,index)=>matchCard(match,index)).join('')}</div>
    ${nav('home')}
  </section>`;
}

function discoverView(){
  return `<section class="fm-next-screen" data-screen="discover">
    ${topbar({title:'경기 찾기',actionHtml:`<button type="button" class="fm-next-icon-button" data-action="edit-setup" aria-label="경기 조건 수정">${icon('level')}</button>`})}
    <div class="fm-next-section">
      <div class="fm-next-section-head"><div><h1>${state.region} 추천 경기</h1><p>${state.level} · ${state.position} 기준 · 가까운 순</p></div></div>
      <div class="fm-next-match-tags" aria-label="현재 검색 조건"><span class="fm-next-tag fm-next-tag--strong">${state.region}</span><span class="fm-next-tag">${state.position}</span><span class="fm-next-tag">${state.level}</span></div>
      <div class="fm-next-list">${MATCHES.map((match,index)=>matchCard(match,index)).join('')}</div>
    </div>
    ${nav('discover')}
  </section>`;
}

function detailView(){
  const match=selectedMatch(state);
  return `<section class="fm-next-screen" data-screen="detail">
    <div class="fm-next-detail-hero">
      <button class="fm-next-icon-button" type="button" data-action="detail-back" aria-label="이전 화면">${icon('back')}</button>
      <div class="fm-next-detail-time">${match.dateLabel}</div>
      <h1>${match.place}</h1>
      <div class="fm-next-detail-address">${icon('pin')}<span>${match.address}</span></div>
      <div class="fm-next-detail-summary"><div><small>경기 레벨</small><b>${match.level}</b></div><div><small>남은 자리</small><b>${match.spot}</b></div><div><small>참가비</small><b>${money(match.price)}</b></div></div>
    </div>
    <section class="fm-next-detail-section"><div class="fm-next-section-head"><div><h2>나와 잘 맞는 이유</h2><p>결정에 필요한 이유만 먼저 보여드려요.</p></div></div><div class="fm-next-fit-list">${match.reasons.map(reason=>`<div class="fm-next-fit-row"><span class="fm-next-fit-icon">${icon(reason.icon)}</span><div><b>${reason.title}</b><span>${reason.detail}</span></div></div>`).join('')}</div></section>
    <section class="fm-next-detail-section"><h2>경기 정보</h2><div class="fm-next-fit-list"><div class="fm-next-fit-row"><span class="fm-next-fit-icon">${icon('users')}</span><div><b>${match.format} · ${match.duration}</b><span>${match.surface} · ${match.joined}/${match.capacity}명 참가 확정</span></div></div><div class="fm-next-fit-row"><span class="fm-next-fit-icon">${icon('clock')}</span><div><b>경기 20분 전부터 체크인</b><span>경기 당일 홈에서 바로 체크인할 수 있어요.</span></div></div></div></section>
    <section class="fm-next-detail-section"><h2>함께 뛰는 사람</h2><div class="fm-next-people"><div class="fm-next-avatar-stack">${match.participants.map(person=>`<span class="fm-next-avatar">${person}</span>`).join('')}</div><div class="fm-next-people-copy"><b>${match.joined}명 참가 중</b><span>최근 완료율 96%</span></div></div></section>
    <section class="fm-next-detail-section"><h2>취소·환불</h2><ul class="fm-next-policy"><li>경기 24시간 전까지 전액 환불됩니다.</li><li>경기 3시간 전까지는 참가비의 50%가 환불됩니다.</li><li>운영 취소 시 참가비는 전액 반환됩니다.</li></ul></section>
    <div class="fm-next-sticky-cta"><div class="fm-next-sticky-cta-row"><div class="fm-next-sticky-price"><small>참가비</small><b>${money(match.price)}</b></div>${button(state.joinedMatchId===match.id?'내 경기 보기':'참가하기',state.joinedMatchId===match.id?'nav-schedule':'join-match','primary')}</div></div>
  </section>`;
}

function authView(){
  const match=selectedMatch(state);
  return `<section class="fm-next-auth-wrap" data-screen="auth">
    <button class="fm-next-icon-button fm-next-auth-back" type="button" data-action="auth-back" aria-label="경기 상세로 돌아가기">${icon('back')}</button>
    <div class="fm-next-auth-copy"><span class="fm-next-brand-mark">${icon('logo')}</span><h1>참가 정보를<br>안전하게 이어갈게요.</h1><p>${match.place} 참가를 확정하려면 계정을 연결해주세요. 둘러본 조건과 선택한 경기는 그대로 유지됩니다.</p></div>
    <div class="fm-next-social-list">
      <button class="fm-next-social fm-next-social--kakao" data-action="sign-in"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 4C6.9 4 3 7.1 3 10.9c0 2.4 1.6 4.5 4 5.7l-1 3.4 3.9-2.3c.7.1 1.4.2 2.1.2 5.1 0 9-3.1 9-7S17.1 4 12 4Z"/></svg>카카오로 계속하기</button>
      <button class="fm-next-social fm-next-social--apple" data-action="sign-in"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.8 12.7c0-2.8 2.3-4.1 2.4-4.2-1.3-2-3.4-2.2-4.1-2.2-1.7-.2-3.4 1-4.3 1-.9 0-2.3-1-3.8-.9-1.9 0-3.7 1.1-4.7 2.8-2 3.5-.5 8.7 1.4 11.5 1 1.4 2.1 2.9 3.6 2.8 1.4-.1 2-1 3.7-1s2.2 1 3.7 1c1.5 0 2.5-1.4 3.4-2.8 1.1-1.6 1.5-3.1 1.6-3.2-.1 0-2.9-1.1-2.9-4.8ZM14 4.5c.8-1 1.3-2.3 1.2-3.5-1.2.1-2.6.8-3.4 1.7-.7.8-1.4 2.2-1.2 3.4 1.3.1 2.6-.6 3.4-1.6Z"/></svg>Apple로 계속하기</button>
      <button class="fm-next-social fm-next-social--google" data-action="sign-in"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.3c1.9-1.8 2.9-4.4 2.9-7.4Z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.5c-.9.6-2.1 1-3.4 1-2.6 0-4.8-1.8-5.6-4.2H3v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 13.9A6 6 0 0 1 6.1 12c0-.7.1-1.3.3-1.9V7.5H3A10 10 0 0 0 2 12c0 1.6.4 3.1 1 4.5l3.4-2.6Z"/><path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.9 1.5l2.9-2.9A9.8 9.8 0 0 0 3 7.5l3.4 2.6C7.2 7.7 9.4 5.9 12 5.9Z"/></svg>Google로 계속하기</button>
    </div>
    <p class="fm-next-auth-terms">계속하면 FootMate 이용약관과 개인정보 처리방침에 동의하는 것으로 간주됩니다.</p>
  </section>`;
}

function checkoutView(){
  const match=selectedMatch(state);
  return `<section class="fm-next-screen fm-next-screen--plain" data-screen="checkout">
    ${topbar({backAction:'checkout-back',title:'참가 확인'})}
    <div class="fm-next-checkout-summary"><small>${match.dateLabel}</small><h2>${match.place}</h2><div class="fm-next-checkout-meta"><span>${match.level}</span><span>${match.spot}</span><span>${match.duration}</span></div></div>
    <section class="fm-next-detail-section"><h2>결제 수단</h2><div class="fm-next-payment-method"><span class="fm-next-payment-method-icon">${icon('card')}</span><div><b>간편결제</b><span>결제 수단은 다음 단계에서 선택합니다.</span></div></div></section>
    <section class="fm-next-detail-section"><h2>결제 금액</h2><div class="fm-next-pay-row"><span>경기 참가비</span><b>${money(match.price)}</b></div><div class="fm-next-pay-row"><span>서비스 수수료</span><b>0원</b></div><div class="fm-next-pay-row fm-next-pay-row--total"><span>총 결제</span><b>${money(match.price)}</b></div></section>
    <div class="fm-next-inline-note">${icon('shield')}<span>경기 24시간 전까지 취소하면 전액 환불됩니다. 운영 취소 시에도 참가비가 전액 반환됩니다.</span></div>
    <div style="margin-top:24px">${button(`${money(match.price)} 결제하고 참가 확정`,'confirm-payment','primary')}</div>
  </section>`;
}

function successView(){
  const match=joinedMatch(state)||selectedMatch(state);
  return `<section class="fm-next-success" data-screen="success">
    <div class="fm-next-success-icon">${icon('check')}</div><h1>참가가 확정됐어요.</h1><p>경기 당일 필요한 정보와 체크인은 이제 ‘내 경기’에서 이어집니다.</p>
    <div class="fm-next-ticket"><div class="fm-next-ticket-time"><span>${match.dateLabel}</span><span>${match.spot.replace('1자리','참가 확정').replace('2자리','참가 확정')}</span></div><h2>${match.place}</h2><p>${match.address}<br>${match.format} · ${match.duration} · ${match.level}</p></div>
    <div class="fm-next-actions">${button('내 경기 보기','nav-schedule','primary')}${button('홈으로','nav-home','secondary')}</div>
  </section>`;
}

function scheduleView(){
  const match=joinedMatch(state);
  return `<section class="fm-next-screen" data-screen="schedule">
    ${topbar({title:'내 경기'})}
    <div class="fm-next-section">
      <div class="fm-next-section-head"><div><h1>${match?'다가오는 경기':'아직 참가한 경기가 없어요'}</h1><p>${match?'경기 전부터 결과 확인까지 한곳에서 이어집니다.':'마음에 드는 경기를 찾아 참가해보세요.'}</p></div></div>
      ${match?`<div class="fm-next-upcoming"><div class="fm-next-upcoming-top"><span>${state.matchStage==='matchday'?'TODAY':state.matchStage==='postgame'?'COMPLETED':'UPCOMING'}</span><span class="fm-next-upcoming-count">${match.dateLabel}</span></div><h2>${match.place}</h2><p>${match.address}</p><div class="fm-next-upcoming-actions">${button(state.matchStage==='matchday'?'체크인':'경기 상세',state.matchStage==='matchday'?'check-in':'open-joined-match','lime')}${button('팀 메시지','team-chat','secondary')}</div></div>
      <div class="fm-next-status-list"><div class="fm-next-status-card is-current"><span class="fm-next-status-icon">${icon(state.matchStage==='postgame'?'check':'calendar')}</span><div><b>${state.matchStage==='postgame'?'경기 완료':'참가 확정'}</b><p>${state.matchStage==='postgame'?'경기 결과와 평가가 저장됐어요.':'경기 정보 변경이 있으면 이 화면에서 바로 알려드려요.'}</p></div></div><div class="fm-next-status-card${state.matchStage==='matchday'?' is-current':''}"><span class="fm-next-status-icon">${icon('pin')}</span><div><b>경기 당일</b><p>경기 20분 전부터 체크인과 길찾기를 바로 사용할 수 있어요.</p></div></div><div class="fm-next-status-card${state.matchStage==='postgame'?' is-current':''}"><span class="fm-next-status-icon">${icon('level')}</span><div><b>경기 후</b><p>간단한 평가와 경기 레벨 변화가 다음 추천에 반영됩니다.</p></div></div></div>`:`<div class="fm-next-empty">추천 경기를 확인하고 참가하면<br>여기에서 경기 당일까지 이어서 볼 수 있어요.<div style="margin-top:16px">${button('경기 찾기','nav-discover','primary')}</div></div>`}
    </div>${nav('schedule')}
  </section>`;
}

function profileView(){
  return `<section class="fm-next-screen" data-screen="profile">
    ${topbar({title:'MY'})}
    <div class="fm-next-profile-card"><div class="fm-next-profile-head"><span class="fm-next-profile-avatar">${state.userName.slice(0,1)}</span><div><h2>${state.userName}님</h2><p>${state.signedIn?'계정 연결됨':'게스트로 둘러보는 중'}</p></div></div><div class="fm-next-profile-stats"><div><b>${state.level}</b><span>체감 레벨</span></div><div><b>${state.position}</b><span>선호 포지션</span></div><div><b>${state.joinedMatchId?'1':'0'}</b><span>참가 경기</span></div></div></div>
    <div class="fm-next-menu-list"><button class="fm-next-menu-item" data-action="edit-setup"><span>${icon('level')}경기 추천 설정</span>${icon('chevron')}</button><button class="fm-next-menu-item" data-action="show-policy"><span>${icon('shield')}취소·환불 정책</span>${icon('chevron')}</button><button class="fm-next-menu-item" data-action="reset-flow"><span>${icon('reset')}처음부터 다시 보기</span>${icon('chevron')}</button></div>
    ${nav('profile')}
  </section>`;
}

function currentView(){
  const views={welcome:welcomeView,setup:setupView,home:homeView,discover:discoverView,detail:detailView,auth:authView,checkout:checkoutView,success:successView,schedule:scheduleView,profile:profileView};
  return (views[state.route]||welcomeView)();
}

let renderedRoute=null;
function render(){
  const routeChanged=renderedRoute!==state.route;
  renderedRoute=state.route;
  root.innerHTML=`<div class="fm-next-page" data-mode="${mode}">${guide()}<div class="fm-next-stage"><div class="fm-next-app" data-embed="${embed}">${currentView()}</div></div><span class="fm-next-mode-pill">${mode==='evidence'?'Evidence mode':'Guided mode'}</span></div><div class="fm-next-toast" role="status" aria-live="polite"></div>`;
  const activeScreen=root.querySelector('[data-screen]');
  if(activeScreen){
    activeScreen.setAttribute('tabindex','-1');
    activeScreen.focus({preventScroll:true});
  }
  const routeStatus=document.getElementById('footmate-route-status');
  if(routeChanged&&routeStatus&&activeScreen){
    const heading=activeScreen.querySelector('h1,h2,[aria-current="page"]');
    routeStatus.textContent=heading?.textContent?.trim()?`화면 이동: ${heading.textContent.trim()}`:`화면 이동: ${state.route}`;
  }
  if(routeChanged){
    window.scrollTo({top:0,left:0,behavior:'instant'});
    root.querySelector('.fm-next-app')?.scrollTo({top:0,left:0,behavior:'instant'});
  }
  document.documentElement.dataset.footmateNext=mode;
}

let toastTimer;
function toast(message){
  const el=root.querySelector('.fm-next-toast');
  if(!el)return;
  el.textContent=message;
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>el.classList.remove('is-visible'),2300);
}

function resetFlow(){
  state=createState();
  if(mode==='evidence')state=createState({setupComplete:true,route:'home',signedIn:true});
  persist();
  render();
}

root.addEventListener('click',event=>{
  const target=event.target.closest('[data-action]');
  if(!target)return;
  const action=target.dataset.action;
  if(action==='start-setup'){setState({route:'setup',setupStep:0});return;}
  if(action==='continue-home'){setState({route:'home'});return;}
  if(action==='back-welcome'){setState({route:'welcome'});return;}
  if(action==='setup-back'){setState({setupStep:Math.max(0,state.setupStep-1)});return;}
  if(action==='choose-setup'){
    const field=target.dataset.field;
    if(['region','position','level'].includes(field))setState({[field]:target.dataset.value});
    return;
  }
  if(action==='setup-next'){
    if(state.setupStep<setupSteps.length-1){setState({setupStep:state.setupStep+1});}
    else setState({setupComplete:true,route:'home'});
    return;
  }
  if(action==='edit-setup'){setState({route:'setup',setupStep:0});return;}
  if(action==='open-match'){
    setState({selectedMatchId:target.dataset.matchId,route:'detail'});return;
  }
  if(action==='detail-back'){setState({route:state.setupComplete?'discover':'home'});return;}
  if(action==='join-match'){setState({route:state.signedIn?'checkout':'auth'});return;}
  if(action==='auth-back'){setState({route:'detail'});return;}
  if(action==='sign-in'){setState({signedIn:true,route:'checkout'});return;}
  if(action==='checkout-back'){setState({route:'detail'});return;}
  if(action==='confirm-payment'){
    setState({joinedMatchId:state.selectedMatchId,matchStage:'upcoming',route:'success'});return;
  }
  if(action==='nav-home'){setState({route:state.setupComplete?'home':'welcome'});return;}
  if(action==='nav-discover'){setState({route:state.setupComplete?'discover':'setup',setupStep:0});return;}
  if(action==='nav-schedule'){setState({route:'schedule'});return;}
  if(action==='nav-profile'){setState({route:'profile'});return;}
  if(action==='open-joined-match'){
    const match=joinedMatch(state);if(match)setState({selectedMatchId:match.id,route:'detail'});return;
  }
  if(action==='check-in'){setState({matchStage:'matchday'},{renderNow:false});toast('체크인 준비가 완료됐어요. 경기장 도착 후 확정할 수 있어요.');render();return;}
  if(action==='show-route'){toast('길찾기 연결은 실제 서비스 연동 단계에서 제공됩니다.');return;}
  if(action==='team-chat'){toast('팀 메시지 화면은 다음 상세 설계 범위에서 연결됩니다.');return;}
  if(action==='rate-match'){toast('경기 평가 플로우를 준비 중입니다.');return;}
  if(action==='show-policy'){toast('경기 24시간 전까지 전액 환불됩니다.');return;}
  if(action==='reset-flow'){resetFlow();return;}
  if(action==='open-real'){location.href='/app';return;}
  if(action==='scenario-discover'){
    state=createState({setupComplete:true,route:'home',signedIn:true});render();return;
  }
  if(action==='scenario-upcoming'){
    state=createState({setupComplete:true,route:'home',signedIn:true,joinedMatchId:MATCHES[0].id,selectedMatchId:MATCHES[0].id,matchStage:'upcoming'});render();return;
  }
  if(action==='scenario-matchday'){
    state=createState({setupComplete:true,route:'home',signedIn:true,joinedMatchId:MATCHES[0].id,selectedMatchId:MATCHES[0].id,matchStage:'matchday'});render();return;
  }
  if(action==='scenario-postgame'){
    state=createState({setupComplete:true,route:'home',signedIn:true,joinedMatchId:MATCHES[0].id,selectedMatchId:MATCHES[0].id,matchStage:'postgame'});render();return;
  }
});

window.addEventListener('popstate',()=>render());
render();

