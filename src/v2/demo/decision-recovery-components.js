export const DECISION_RECOVERY_SCREEN_IDS=Object.freeze(['s-home','s-filter','s-results','s-reason','s-detail','s-pay','s-pay-low','s-charge','s-confirm']);

function element(tag,className,text){
  const node=document.createElement(tag);
  if(className)node.className=className;
  if(text!=null)node.textContent=text;
  return node;
}
function buttonFor(action,variant='secondary'){
  if(!action)return null;
  const button=element('button',`fm25-action fm25-action-${variant}`,action.label);
  button.type='button';
  button.dataset.fm25Action=action.id;
  if(action.matchKey)button.dataset.matchKey=action.matchKey;
  if(action.value!=null)button.dataset.value=String(action.value);
  return button;
}
function statusBadge(decision){
  const badge=element('span','fm25-status',decision.statusLabel);
  badge.dataset.state=decision.status;
  return badge;
}
function trace(decision){
  const row=element('div','fm25-trace');
  row.append(element('span','fm25-trace-label','Decision trace'),element('code','fm25-trace-id',decision.traceId));
  return row;
}
function actions(decision){
  const wrap=element('div','fm25-actions');
  const secondary=buttonFor(decision.secondary,'secondary');
  const primary=buttonFor(decision.primary,'primary');
  if(secondary)wrap.append(secondary);
  if(primary)wrap.append(primary);
  if(!wrap.children.length)return null;
  return wrap;
}
function checkItem(item){
  const li=element('li','fm25-check');
  li.dataset.state=item.state;
  const icon=element('span','fm25-check-icon',item.state==='pass'?'✓':item.state==='block'?'!':item.state==='warn'?'△':'i');
  icon.setAttribute('aria-hidden','true');
  const copy=element('span','fm25-check-copy');
  copy.append(element('strong','fm25-check-label',item.label),element('span','fm25-check-detail',item.detail));
  li.append(icon,copy);
  return li;
}
function shell(decision,slot,eyebrow){
  const card=element('section','fm25-panel');
  card.dataset.fm25Slot=slot;
  card.dataset.state=decision.status;
  const top=element('div','fm25-panel-top');
  const heading=element('div','fm25-heading');
  heading.append(element('span','fm25-eyebrow',eyebrow),element('h2','fm25-title',decision.title));
  top.append(heading,statusBadge(decision));
  card.append(top,element('p','fm25-summary',decision.summary));
  return card;
}

export function createNextActionCard(decision){
  const card=shell(decision,'next-action','NEXT ACTION');
  const meta=element('div','fm25-inline-meta');
  meta.append(element('span','',`추천 후보 ${decision.candidateCount}개`),element('span','',`현재 크레딧 ₩${decision.credit.toLocaleString()}`));
  card.append(meta);
  const actionRow=actions(decision);if(actionRow)card.append(actionRow);
  card.append(trace(decision));
  return card;
}

export function createImpactPreview(decision){
  const card=shell(decision,'impact','조건 영향 미리보기');
  const meta=element('div','fm25-impact-count');
  meta.append(element('strong','',String(decision.candidateCount)),element('span','',decision.candidateCount===1?'개 경기 후보':'개 경기 후보'));
  card.append(meta);
  const actionRow=actions(decision);if(actionRow)card.append(actionRow);
  card.append(element('p','fm25-data-note',decision.dataNote));
  return card;
}

export function createComparisonBoard(decision){
  const card=shell(decision,'comparison','추천 비교');
  const grid=element('div','fm25-compare-grid');
  decision.comparison.forEach(item=>{
    const option=element('article','fm25-compare-card');
    const head=element('div','fm25-compare-head');
    head.append(element('span','fm25-rank',`#${item.rank}`),element('strong','fm25-compare-team',item.team||item.key),element('span','fm25-score',`${item.pct}%`));
    const metrics=element('div','fm25-compare-metrics');
    [['ELO',item.eloScore],['조건',item.styleScore],['거리',item.locationScore]].forEach(([label,value])=>{
      const metric=element('span','fm25-mini-metric');metric.append(element('small','',label),element('b','',String(value??'-')));metrics.append(metric);
    });
    const select=buttonFor({id:'select-match',label:'이 경기 확인',matchKey:item.key},item.rank===1?'primary':'secondary');
    option.append(head,metrics,select);grid.append(option);
  });
  if(!decision.comparison.length)grid.append(element('p','fm25-empty','비교할 추천 후보가 없습니다.'));
  card.append(grid);
  const actionRow=actions({...decision,primary:null});if(actionRow)card.append(actionRow);
  card.append(trace(decision));
  return card;
}

export function createPreflightCard(decision,slot='preflight'){
  const card=shell(decision,slot,slot==='payment-preflight'?'결제 전 확인':'참가 전 확인');
  const list=element('ul','fm25-checks');
  decision.checks.forEach(item=>list.append(checkItem(item)));
  card.append(list);
  const actionRow=actions(decision);if(actionRow)card.append(actionRow);
  card.append(element('p','fm25-data-note',decision.dataNote),trace(decision));
  return card;
}

export function createRecoveryCard(decision,slot='recovery'){
  const card=shell(decision,slot,'RECOVERY');
  const actionRow=actions(decision);if(actionRow)card.append(actionRow);
  card.append(element('p','fm25-data-note',decision.dataNote),trace(decision));
  return card;
}

export function createConfirmationCard(decision){
  const card=shell(decision,'confirmation','STATUS');
  const actionRow=actions(decision);if(actionRow)card.append(actionRow);
  card.append(trace(decision));
  return card;
}
