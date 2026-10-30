import {loadBetaBackendConfig} from './infrastructure/supabase.js';

const root=document.getElementById('footmate-beta-operator');
const labels={entry_viewed:'첫 화면',recommendation_requested:'추천 요청',recommendation_completed:'추천 완료',recommendation_viewed:'추천 노출',recommendation_redrawn:'다시 추천',match_detail_opened:'상세 열기',filters_applied:'필터 적용',reaction_submitted:'추천 반응',join_attempt:'참가 시도',join_succeeded:'참가 완료',join_failed:'참가 실패'};
function mount(){
 if(root?.dataset.operatorState!=='ready'||root.querySelector('[data-discovery-metrics]'))return;
 const panel=document.createElement('details');panel.className='fm-beta-panel';panel.dataset.discoveryMetrics='';
 panel.innerHTML='<summary>추천 탐색 지표 · 실제 이용자</summary><p>최근 7일 · 통계 참여에 동의하고 실제 이용자로 분류된 계정만 포함합니다. 데모·테스트·운영자는 제외합니다. 세션·사용자 수는 이벤트별 고유 수이며 전환율이나 인과 효과를 의미하지 않습니다.</p><button type="button" class="fm-beta-button" data-load-discovery>집계 불러오기</button><div data-discovery-result role="status">미조회 · 표본 확인 전 N/A</div>';
 root.querySelector('.fm-beta-footer')?.before(panel);
 panel.querySelector('button').addEventListener('click',async event=>{
  const button=event.currentTarget,output=panel.querySelector('[data-discovery-result]');button.disabled=true;output.textContent='집계 중…';
  try{
   const config=await loadBetaBackendConfig();const session=JSON.parse(localStorage.getItem('footmate:beta:auth:v1')||'null');
   if(!session?.accessToken)throw new Error();
   const response=await fetch(config.url+'/rest/v1/rpc/operator_discovery_metrics',{method:'POST',headers:{apikey:config.publishableKey,authorization:'Bearer '+session.accessToken,'content-type':'application/json'},body:'{}',cache:'no-store'});
   if(!response.ok)throw new Error();const rows=await response.json();
   if(!Array.isArray(rows))throw new Error('Invalid metric response');
   const table=document.createElement('table');table.style.cssText='width:100%;font-size:13px;text-align:left';
   const head=table.createTHead().insertRow();for(const label of ['이벤트','첫 화면','세션','이용자','건수']){const th=document.createElement('th');th.textContent=label;head.append(th)}
   const body=table.createTBody();for(const row of rows){const tr=body.insertRow();for(const value of [labels[row.event_name]||'기타',row.variant==='quick'?'바로 선택':'기본',...['sessions','users','events'].map(k=>Number(row[k])||0)])tr.insertCell().textContent=String(value)}
   output.replaceChildren(table);
   // Rates are available only for consented pilot cohorts with at least five eligible
   // users and five denominator observations. A suppressed rate is not zero.
   const baselineResponse=await fetch(config.url+'/rest/v1/rpc/operator_discovery_kpi_baseline',{
    method:'POST',headers:{apikey:config.publishableKey,authorization:'Bearer '+session.accessToken,'content-type':'application/json'},
    body:JSON.stringify({p_since:new Date(Date.now()-21*24*60*60*1000).toISOString()}),cache:'no-store'
   });
   if(!baselineResponse.ok){const hint=document.createElement('p');hint.textContent='전환 기준선은 아직 사용할 수 없습니다. 데이터베이스 배포 상태를 확인해주세요.';output.append(hint);return}
   const baselines=await baselineResponse.json();
   const heading=document.createElement('h3');heading.textContent='실제 이용자 기준선 · 최근 21일';output.append(heading);
   const note=document.createElement('p');note.textContent='동의한 pilot 계정만 포함합니다. 지표별 고유 이용자 또는 분모가 5 미만이면 N/A로 숨깁니다. 최초 측정은 개선률이 아닙니다.';output.append(note);
   const baselineTable=document.createElement('table');baselineTable.style.cssText='width:100%;font-size:13px;text-align:left';
   const header=baselineTable.createTHead().insertRow();for(const title of ['지표','분자','분모','비율']){const th=document.createElement('th');th.textContent=title;header.append(th)}
   const labelByName={search_to_detail:'추천 노출 → 상세 진입',zero_result:'추천 결과 0건 비율',detail_to_join:'경기 상세 → 참가 완료',repeat_search_7d:'참석 후 7일 내 재탐색'};
   for(const item of Array.isArray(baselines)?baselines:[]){
    const tr=baselineTable.createTBody().insertRow();
    const rate=item.rate_percent===null||item.rate_percent===undefined?'N/A':Number(item.rate_percent).toFixed(2)+'%';
    for(const value of [labelByName[item.metric_name]||item.metric_name,item.numerator??'N/A',item.denominator??'N/A',rate])tr.insertCell().textContent=String(value);
   }
   output.append(baselineTable);
  }catch{output.textContent='운영자 권한·2단계 인증 또는 연결 상태를 확인하고 다시 시도해주세요.'}
  finally{button.disabled=false}
 });
}
if(root){new MutationObserver(mount).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['data-operator-state']});mount()}
