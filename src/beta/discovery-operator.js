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
   if(!Array.isArray(rows)||!rows.length){output.textContent='표본 없음 · 기준선 N/A';return}
   const table=document.createElement('table');table.style.cssText='width:100%;font-size:13px;text-align:left';
   const head=table.createTHead().insertRow();for(const label of ['이벤트','첫 화면','세션','이용자','건수']){const th=document.createElement('th');th.textContent=label;head.append(th)}
   const body=table.createTBody();for(const row of rows){const tr=body.insertRow();for(const value of [labels[row.event_name]||'기타',row.variant==='quick'?'바로 선택':'기본',...['sessions','users','events'].map(k=>Number(row[k])||0)])tr.insertCell().textContent=String(value)}
   output.replaceChildren(table);
  }catch{output.textContent='운영자 권한·2단계 인증 또는 연결 상태를 확인하고 다시 시도해주세요.'}
  finally{button.disabled=false}
 });
}
if(root){new MutationObserver(mount).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['data-operator-state']});mount()}
