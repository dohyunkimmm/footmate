export const CORE_FUNNEL_STEPS=Object.freeze([
  {screenId:'s-home',label:'경기 찾기',shortLabel:'홈'},
  {screenId:'s-filter',label:'조건 설정',shortLabel:'조건'},
  {screenId:'s-results',label:'추천 비교',shortLabel:'추천'},
  {screenId:'s-detail',label:'경기 확인',shortLabel:'상세'},
  {screenId:'s-pay',label:'참가 확정',shortLabel:'참가'}
]);

export const CORE_FUNNEL_SCREEN_IDS=Object.freeze(CORE_FUNNEL_STEPS.map(step=>step.screenId));

function element(tag,className,text){
  const node=document.createElement(tag);
  if(className)node.className=className;
  if(text!=null)node.textContent=text;
  return node;
}

function action(label,actionName,variant='secondary'){
  const button=element('button',`fm24-action fm24-action-${variant}`,label);
  button.type='button';
  button.dataset.fm24Action=actionName;
  return button;
}

function metric(label,value){
  const item=element('div','fm24-metric');
  item.append(element('span','fm24-metric-label',label),element('strong','fm24-metric-value',value));
  return item;
}

function timeLabel(value){
  return({morning:'오전',day:'낮',evening:'저녁',night:'야간'})[value]||'시간 미정';
}

function eligibleMatches(state){
  return(Array.isArray(state?.rankedMatches)?state.rankedMatches:[]).filter(match=>match?.eligible);
}

export function createJourney(screenId){
  const current=Math.max(0,CORE_FUNNEL_STEPS.findIndex(step=>step.screenId===screenId));
  const nav=element('nav','fm24-journey');
  nav.dataset.fm24Slot='journey';
  nav.setAttribute('aria-label','경기 참가 진행 단계');
  const list=element('ol','fm24-journey-list');
  CORE_FUNNEL_STEPS.forEach((step,index)=>{
    const item=element('li','fm24-journey-step');
    item.dataset.state=index<current?'done':index===current?'current':'next';
    if(index===current)item.setAttribute('aria-current','step');
    const number=element('span','fm24-journey-number',String(index+1));
    number.setAttribute('aria-hidden','true');
    item.append(number,element('span','fm24-journey-label',step.shortLabel));
    list.append(item);
  });
  nav.append(list);
  return nav;
}

export function createHomeDecisionCard(state){
  const elo=Number(state?.elo);
  const eligible=eligibleMatches(state);
  const card=element('section','fm24-panel fm24-home-decision');
  card.dataset.fm24Slot='home-decision';
  card.setAttribute('aria-labelledby','fm24-home-title');
  const eyebrow=element('span','fm24-eyebrow','오늘의 매칭');
  const title=element('h2','fm24-title','조건을 확인하고 바로 경기 후보를 비교해요');
  title.id='fm24-home-title';
  const copy=element('p','fm24-copy','핵심 조건과 추천 근거를 한 흐름에서 확인할 수 있도록 경기 탐색 단계를 단순화했습니다.');
  const metrics=element('div','fm24-metrics');
  metrics.append(
    metric('현재 ELO',Number.isFinite(elo)?elo.toLocaleString():'-'),
    metric('추천 후보',`${eligible.length}개`)
  );
  const actions=element('div','fm24-actions');
  actions.append(action('조건 조정','filter'),action('추천 경기 보기','results','primary'));
  card.append(eyebrow,title,copy,metrics,actions);
  return card;
}

export function createFilterSummary(state){
  const profile=state?.profile||{};
  const eligible=eligibleMatches(state);
  const card=element('section','fm24-panel fm24-filter-summary');
  card.dataset.fm24Slot='filter-summary';
  const header=element('div','fm24-panel-head');
  header.append(element('div','fm24-eyebrow','핵심 조건'),element('strong','fm24-inline-count',`${eligible.length}개 후보`));
  const summary=element('p','fm24-filter-line',`${timeLabel(profile.time)} · ${profile.format||'경기 방식'} · ${Number(profile.distanceKm)||15}km 이내`);
  const hint=element('p','fm24-copy','조건을 바꾸면 추천 후보 수와 순위가 즉시 다시 계산됩니다.');
  const actions=element('div','fm24-actions');
  actions.append(action('추천 결과 보기','results','primary'));
  card.append(header,summary,hint,actions);
  return card;
}

export function createResultsToolbar(state){
  const eligible=eligibleMatches(state);
  const toolbar=element('section','fm24-panel fm24-results-toolbar');
  toolbar.dataset.fm24Slot='results-toolbar';
  const title=element('div','fm24-results-heading');
  title.append(element('span','fm24-eyebrow','추천 비교'),element('strong','fm24-title-sm',`${eligible.length}개의 경기 후보`));
  const copy=element('p','fm24-copy',eligible.length?'점수만 보지 말고 실력·시간·거리 적합도를 함께 비교해 보세요.':'조건을 조금 완화하면 다시 추천을 받을 수 있습니다.');
  const actions=element('div','fm24-actions fm24-actions-compact');
  actions.append(action('조건 수정','filter'));
  toolbar.append(title,copy,actions);
  return toolbar;
}

export function createDetailDecisionCard(state){
  const match=state?.selectedScenario;
  const card=element('section','fm24-panel fm24-detail-decision');
  card.dataset.fm24Slot='detail-decision';
  if(!match){
    card.append(element('strong','fm24-title-sm','선택한 경기 정보를 확인해 주세요.'));
    return card;
  }
  const title=element('div','fm24-detail-heading');
  title.append(element('span','fm24-eyebrow','선택한 경기'),element('strong','fm24-title-sm',`${match.team||'경기'} · ${match.pct||0}% 매칭`));
  const factors=element('div','fm24-factor-grid');
  factors.append(
    metric('ELO 적합',`${match.eloScore||0}점`),
    metric('플레이 조건',`${match.styleScore||0}점`),
    metric('거리',`${match.locationScore||0}점`)
  );
  const actions=element('div','fm24-actions');
  actions.append(action('다른 경기 보기','results'),action('추천 근거 보기','reason','primary'));
  card.append(title,factors,actions);
  return card;
}

export function createCheckoutSteps(){
  const card=element('section','fm24-panel fm24-checkout');
  card.dataset.fm24Slot='checkout';
  card.setAttribute('aria-label','참가 확정 단계');
  const title=element('div','fm24-panel-head');
  title.append(element('span','fm24-eyebrow','참가 확정'),element('strong','fm24-inline-count','2 / 3'));
  const list=element('ol','fm24-checkout-steps');
  ['경기 확인','결제 확인','참가 완료'].forEach((label,index)=>{
    const item=element('li','fm24-checkout-step',label);
    item.dataset.state=index===0?'done':index===1?'current':'next';
    if(index===1)item.setAttribute('aria-current','step');
    list.append(item);
  });
  const note=element('p','fm24-copy','프로토타입 결제 화면이며 실제 결제는 발생하지 않습니다.');
  card.append(title,list,note);
  return card;
}
