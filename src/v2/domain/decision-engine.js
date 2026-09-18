export const DECISION_ENGINE_VERSION='2.5.0';

const TERMINAL_PARTICIPATION=new Set(['confirmed','checked_in','completed','no_show']);
const BLOCKED_MATCH_STATES=new Set(['cancelled','completed']);

function clamp(value,min,max){return Math.max(min,Math.min(max,Number(value)||0))}
function action(id,label,meta={}){return{id,label,...meta}}
function check(id,label,state,detail){return{id,label,state,detail}}
function clone(value){return JSON.parse(JSON.stringify(value))}
function checksum(value){
  let hash=2166136261;
  for(let i=0;i<value.length;i++){
    hash^=value.charCodeAt(i);
    hash=Math.imul(hash,16777619);
  }
  return(hash>>>0).toString(36);
}
function statusLabel(status){
  return({ready:'진행 가능',attention:'확인 필요',blocked:'진행 차단',recovery:'복구 가능',success:'완료'})[status]||'확인 필요';
}

export function createDecisionEngine({scenarioStore,productStore,productOps}={}){
  if(!scenarioStore?.getState)throw new Error('FootMate scenario store is required');
  if(!productStore?.getState)throw new Error('FootMate product store is required');
  const traces=[];
  let lastSignature='';

  function operationFor(key){
    try{
      const value=productOps?.operation?.(key);
      if(value)return value;
    }catch(error){}
    const state=productStore.getState();
    return state.operationByMatch?.[key]||{match:'open',payment:'idle',participation:'available',history:[]};
  }

  function baseSnapshot(){
    const scenario=scenarioStore.getState();
    const product=productStore.getState();
    const ranked=Array.isArray(scenario.rankedMatches)?scenario.rankedMatches:[];
    const eligible=ranked.filter(item=>item?.eligible);
    const key=scenario.selectedMatchKey||productOps?.currentMatchKey?.()||eligible[0]?.key||'suwon';
    const selected=scenario.selectedScenario||scenario.matches?.[key]||eligible[0]||null;
    const operation=operationFor(key);
    const cost=Number(productStore.cost)||17000;
    const credit=Math.max(0,Number(product.creditBalance)||0);
    return{scenario,product,ranked,eligible,key,selected,operation,cost,credit,shortage:Math.max(0,cost-credit)};
  }

  function commonChecks(base){
    const{selected,operation,cost,credit}=base;
    const matchState=operation.match||'open';
    const participation=operation.participation||'available';
    return[
      check('availability','경기 상태',matchState==='open'?'pass':matchState==='full'?'warn':'block',matchState==='open'?'모집 중':matchState==='full'?'현재 정원 마감':matchState==='cancelled'?'경기 취소됨':'경기 종료됨'),
      check('fit','추천 적합',selected?.eligible===false?'block':'pass',selected?.eligible===false?'현재 필터 조건과 불일치':`${selected?.pct??'-'}% 매칭 · 조건 검토 완료`),
      check('credit','크레딧',credit>=cost?'pass':'warn',credit>=cost?`결제 가능 · ₩${credit.toLocaleString()}`:`₩${Math.max(0,cost-credit).toLocaleString()} 부족`),
      check('duplicate','참가 상태',TERMINAL_PARTICIPATION.has(participation)?'info':participation==='available'||participation==='offered'?'pass':'warn',productOps?.statusLabel?.('participation',participation)||participation),
      check('freshness','데이터 기준','info','현재 프로토타입 세션 상태 · 실시간 서버 재조회 미연동')
    ];
  }

  function flowDecision(screenId,base){
    const{eligible,selected,key,operation,credit,cost,shortage,scenario}=base;
    const candidateCount=eligible.length;
    const distance=clamp(scenario.profile?.distanceKm||15,1,30);
    const top=eligible[0]||null;
    const participation=operation.participation||'available';
    const payment=operation.payment||'idle';
    const matchState=operation.match||'open';

    if(screenId==='s-home'){
      return candidateCount?{
        status:'ready',title:`추천 후보 ${candidateCount}개를 비교할 수 있어요`,summary:'점수뿐 아니라 실력·시간·거리 적합도와 참가 가능 상태를 함께 확인합니다.',primary:action('results','추천 경기 비교'),secondary:action('filter','조건 조정'),submission:'allow'
      }:{
        status:'recovery',title:'현재 조건에서는 추천 후보가 없어요',summary:'조건을 조금 완화하면 다시 후보를 탐색할 수 있습니다.',primary:action('filter','조건 다시 설정'),submission:'block'
      };
    }

    if(screenId==='s-filter'){
      return candidateCount?{
        status:'ready',title:`이 조건으로 ${candidateCount}개 경기를 찾았어요`,summary:'조건 변경 즉시 후보 수와 추천 순위가 다시 계산됩니다.',primary:action('results','추천 결과 보기'),secondary:action('home','홈으로'),submission:'allow'
      }:{
        status:'recovery',title:'조건을 조금 넓히면 후보를 찾을 수 있어요',summary:`현재 거리 ${distance}km 기준입니다. 거리 범위를 5km 넓혀 다시 탐색해 보세요.`,primary:action('relax-distance','거리 +5km로 다시 찾기',{value:Math.min(30,distance+5)}),secondary:action('home','홈으로'),submission:'block'
      };
    }

    if(screenId==='s-results'){
      return candidateCount?{
        status:'ready',title:`${candidateCount}개 후보를 한 번에 비교해요`,summary:'상위 후보의 매칭률과 ELO·플레이 조건·거리 점수를 같은 기준으로 비교합니다.',primary:top?action('select-match','1순위 경기 확인',{matchKey:top.key}):null,secondary:action('filter','조건 수정'),submission:'allow'
      }:{
        status:'recovery',title:'추천 결과가 비어 있어요',summary:'조건을 완화하거나 다른 시간대·거리를 선택하면 다시 추천할 수 있습니다.',primary:action('filter','조건 수정'),submission:'block'
      };
    }

    if(screenId==='s-confirm'){
      return{status:'success',title:'참가가 확정됐어요',summary:'경기 전 체크인과 장소 정보를 확인하고 다음 단계로 이동할 수 있습니다.',primary:action('gameday','경기 당일 흐름 보기'),secondary:action('home','홈으로'),submission:'idempotent'};
    }

    if(screenId==='s-pay-low'){
      return{status:'recovery',title:`크레딧 ₩${shortage.toLocaleString()}이 더 필요해요`,summary:'충전 후 같은 경기의 참가 가능 상태를 다시 검증한 뒤 결제를 이어갑니다.',primary:action('charge','크레딧 충전'),secondary:action('results','다른 경기 보기'),submission:'block'};
    }

    if(screenId==='s-charge'){
      return{status:'attention',title:'충전 후 참가 조건을 다시 확인해요',summary:'충전만으로 참가가 확정되지는 않습니다. 정원·경기 상태·중복 참가를 다시 확인합니다.',secondary:action('results','경기 다시 비교'),submission:'block'};
    }

    if(TERMINAL_PARTICIPATION.has(participation)){
      const next=participation==='completed'?action('postgame','경기 결과 보기'):participation==='checked_in'?action('gameday','경기 진행 보기'):action('confirm','참가 확정 확인');
      return{status:'success',title:'이미 참가 상태가 반영돼 있어요',summary:`현재 상태: ${productOps?.statusLabel?.('participation',participation)||participation}`,primary:next,secondary:action('results','다른 경기 보기'),submission:'idempotent'};
    }

    if(BLOCKED_MATCH_STATES.has(matchState)){
      return{status:'blocked',title:matchState==='cancelled'?'취소된 경기라 참가할 수 없어요':'종료된 경기라 참가할 수 없어요',summary:'결제를 진행하지 않고 다른 추천 후보로 복구합니다.',primary:action('results','다른 경기 찾기'),submission:'block'};
    }

    if(selected?.eligible===false){
      return{status:'blocked',title:'현재 조건과 맞지 않는 경기예요',summary:'필터 조건과 추천 적합도를 다시 확인한 뒤 다른 후보를 선택하세요.',primary:action('results','다른 후보 보기'),secondary:action('filter','조건 수정'),submission:'block'};
    }

    if(participation==='waitlisted'){
      return{status:'attention',title:'대기 등록 상태예요',summary:'빈자리가 생기면 제안 상태로 바뀌며, 그때 참가 조건을 다시 확인합니다.',primary:action('results','대기 중 다른 경기 보기'),submission:'block'};
    }

    if(matchState==='full'&&participation!=='offered'){
      return{status:'recovery',title:'정원이 마감됐어요',summary:'결제 대신 대기 등록으로 복구하거나 다른 경기 후보를 선택할 수 있습니다.',primary:action('join-waitlist','대기 등록'),secondary:action('results','다른 경기 보기'),submission:'block'};
    }

    if(payment==='refunded'||participation==='cancelled'||participation==='expired'){
      return{status:'recovery',title:'이전 참가 흐름이 종료됐어요',summary:'같은 참가 건을 다시 결제하지 않고 새로운 추천 후보에서 시작합니다.',primary:action('results','새 경기 찾기'),submission:'block'};
    }

    if(payment==='failed'&&credit<cost){
      return{status:'recovery',title:'결제를 다시 시도하려면 충전이 필요해요',summary:`현재 크레딧이 ₩${shortage.toLocaleString()} 부족합니다.`,primary:action('charge','크레딧 충전'),secondary:action('results','다른 경기 보기'),submission:'block'};
    }

    if(credit<cost){
      return{status:'attention',title:'참가 전 크레딧을 충전해 주세요',summary:`결제 금액 ₩${cost.toLocaleString()} · 현재 ₩${credit.toLocaleString()}`,primary:action('charge','크레딧 충전'),secondary:action('results','다른 경기 보기'),submission:'block'};
    }

    if(payment==='failed'){
      return{status:'recovery',title:'결제 실패 상태를 복구할 수 있어요',summary:'크레딧과 경기 상태가 정상입니다. 재시도 시 상태를 pending으로 되돌린 뒤 참가를 확정합니다.',primary:action('retry-payment','결제 다시 시도'),secondary:action('results','다른 경기 보기'),submission:'allow'};
    }

    if(participation==='offered'){
      return{status:'ready',title:'빈자리 제안을 수락할 수 있어요',summary:'정원과 크레딧 조건을 다시 확인했습니다. 수락 시 참가 확정 흐름으로 이어집니다.',primary:action('accept-offer','제안 수락·결제'),secondary:action('results','다른 경기 보기'),submission:'allow'};
    }

    if(screenId==='s-pay'){
      return{status:'ready',title:'결제 전 확인이 완료됐어요',summary:'정원·추천 적합·크레딧·중복 참가 조건을 확인했습니다. 아래 기존 결제 CTA로 최종 확정하세요.',secondary:action('detail','경기 상세 다시 보기',{matchKey:key}),submission:'allow'};
    }

    return{status:'ready',title:`${selected?.team||'선택한 경기'}에 참가할 수 있어요`,summary:'참가 전 핵심 조건을 확인하고 결제 단계로 이동하세요.',primary:action('payment','참가·결제 확인'),secondary:action('results','다른 경기 비교'),submission:'allow'};
  }

  function evaluate(screenId='s-home',{record=true}={}){
    const base=baseSnapshot();
    const checks=commonChecks(base);
    const flow=flowDecision(screenId,base);
    const comparison=base.eligible.slice(0,3).map((match,index)=>({
      rank:index+1,key:match.key,team:match.team,pct:match.pct,eloScore:match.eloScore,styleScore:match.styleScore,locationScore:match.locationScore,distanceKm:match.distanceKm
    }));
    const signature=JSON.stringify({screenId,key:base.key,operation:{match:base.operation.match,payment:base.operation.payment,participation:base.operation.participation},credit:base.credit,candidates:comparison.map(item=>[item.key,item.pct]),distance:base.scenario.profile?.distanceKm,flow:flow.status});
    const traceId='fm25-'+checksum(signature);
    const decision={
      version:DECISION_ENGINE_VERSION,
      architecture:'v2.5-decision-recovery-engine',
      screenId,
      traceId,
      generatedAt:new Date().toISOString(),
      status:flow.status,
      statusLabel:statusLabel(flow.status),
      title:flow.title,
      summary:flow.summary,
      primary:flow.primary||null,
      secondary:flow.secondary||null,
      submission:flow.submission||'block',
      matchKey:base.key,
      candidateCount:base.eligible.length,
      credit:base.credit,
      cost:base.cost,
      shortage:base.shortage,
      operation:{match:base.operation.match,payment:base.operation.payment,participation:base.operation.participation},
      checks,
      comparison,
      realtime:false,
      dataNote:'프로토타입 세션 상태 기준 · 실제 서버/결제/정원 API 미연동'
    };
    if(record&&signature!==lastSignature){
      lastSignature=signature;
      traces.push(clone(decision));
      if(traces.length>24)traces.shift();
      window.dispatchEvent?.(new CustomEvent('footmate:v2.5:decision',{detail:clone(decision)}));
    }
    return clone(decision);
  }

  return{
    version:DECISION_ENGINE_VERSION,
    architecture:'v2.5-decision-recovery-engine',
    evaluate,
    latest:()=>traces.length?clone(traces.at(-1)):evaluate('s-home'),
    history:()=>clone(traces),
    replay(traceId){const item=traces.find(trace=>trace.traceId===traceId);return item?clone(item):null}
  };
}
