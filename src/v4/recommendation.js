import {MATCHES,NEXT_STORAGE_KEY,createState} from './data.js';
import {rankRecommendations} from './platform/domain/recommendation.js';

const root=document.getElementById('footmate-next');
if(root){
  const params=new URLSearchParams(location.search);
  const mode=['guided','evidence'].includes(params.get('mode'))?params.get('mode'):'real';
  const LEVELS=['입문','초중급','중급','중급+'];
  let shadowState=createState(mode==='evidence'?{setupComplete:true,route:'home',signedIn:true}:{});

  function readSession(){
    if(mode!=='real')return shadowState;
    try{
      const raw=localStorage.getItem(NEXT_STORAGE_KEY);
      return createState(raw?JSON.parse(raw):{});
    }catch(_error){
      return createState();
    }
  }

  function rank(state){return rankRecommendations(MATCHES,state);}

  function exportRecommendations(){
    window.__FOOTMATE_RECOMMENDATION__={
      version:'4.1.0',
      rank:(preferences={})=>rank(createState(preferences)).map(item=>({id:item.match.id,score:item.score,fit:item.fit,reasons:item.reasons.map(reason=>reason.title)}))
    };
  }

  exportRecommendations();

  function money(value){return new Intl.NumberFormat('ko-KR').format(value)+'원'}

  function tinyIcon(name){
    const body={
      pin:'<path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/>',
      level:'<path d="M5 19v-5M12 19V9M19 19V4"/>',
      position:'<circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16"/>',
      clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>',
      spark:'<path d="m12 3 1.3 4.2L17.5 9l-4.2 1.8L12 15l-1.3-4.2L6.5 9l4.2-1.8z"/>'
    }[name]||'<circle cx="12" cy="12" r="8"/>';
    return `<svg class="fm-next-icon" viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;
  }

  function card(item,index){
    const match=item.match;
    return `<button type="button" class="fm-next-match-card" data-action="open-match" data-match-id="${match.id}" data-recommendation-score="${item.score}" data-recommendation-region="${match.region}" aria-label="${match.place} 상세 보기">
      <div class="fm-next-match-card-media">
        <div class="fm-next-match-date"><span>${match.dateLabel}</span>${index===0?`<span class="fm-next-fit-badge">${tinyIcon('spark')} 추천 1순위</span>`:''}</div>
        <div class="fm-next-match-place">${match.place}</div>
      </div>
      <div class="fm-next-match-body">
        <div class="fm-next-match-tags"><span class="fm-next-tag fm-next-tag--strong">${item.fit}</span><span class="fm-next-tag">${match.distance}</span><span class="fm-next-tag">${item.spotLabel}</span></div>
        <div class="fm-next-match-footer"><div><small>${match.format} · ${match.duration}</small><b>${match.level} · ${match.surface}</b></div><div class="fm-next-price">${money(match.price)}</div></div>
      </div>
    </button>`;
  }

  function signature(state,scope){
    return `4.1|${scope}|${state.region}|${state.position}|${state.level}|${state.selectedMatchId||''}`;
  }

  function patchHome(state,ranked){
    const screen=root.querySelector('[data-screen="home"]');
    if(!screen)return;
    const list=screen.querySelector('.fm-next-list');
    if(!list)return;
    const sig=signature(state,'home');
    if(list.dataset.fmRecommendationSignature===sig)return;
    list.dataset.fmRecommendationSignature=sig;
    list.innerHTML=ranked.slice(0,2).map(card).join('');
    const sectionCopy=screen.querySelector('.fm-next-section-head p');
    if(sectionCopy)sectionCopy.textContent='지역, 레벨, 선호 포지션을 함께 비교해 적합도 높은 순으로 정리했어요.';
    if(!state.joinedMatchId){
      const context=screen.querySelector('.fm-next-context-card');
      const heading=context?.querySelector('h2');
      const copy=context?.querySelector('p');
      if(heading)heading.textContent=`${state.region} 추천 경기`;
      if(copy)copy.textContent=`${state.level} · ${state.position} 기준으로 지역·포지션·레벨 적합도를 실제 추천 순위에 반영했습니다.`;
    }
  }

  function discoverSet(ranked,state){
    const regional=ranked.filter(item=>item.match.region===state.region);
    const expanded=ranked.filter(item=>item.match.region!==state.region).slice(0,2);
    return [...regional,...expanded];
  }

  function patchDiscover(state,ranked){
    const screen=root.querySelector('[data-screen="discover"]');
    if(!screen)return;
    const list=screen.querySelector('.fm-next-list');
    if(!list)return;
    const sig=signature(state,'discover');
    if(list.dataset.fmRecommendationSignature===sig)return;
    list.dataset.fmRecommendationSignature=sig;
    list.innerHTML=discoverSet(ranked,state).map(card).join('');
    const heading=screen.querySelector('.fm-next-section-head h1');
    const copy=screen.querySelector('.fm-next-section-head p');
    if(heading)heading.textContent=`${state.region} 추천 경기`;
    if(copy)copy.textContent=`${state.level} · ${state.position} 기준 · 적합도 높은 순`;
  }

  function patchDetail(state,ranked){
    const screen=root.querySelector('[data-screen="detail"]');
    if(!screen)return;
    const item=ranked.find(entry=>entry.match.id===state.selectedMatchId);
    if(!item)return;
    const sig=signature(state,`detail:${item.match.id}`);
    if(screen.dataset.fmRecommendationSignature===sig)return;
    screen.dataset.fmRecommendationSignature=sig;
    screen.dataset.recommendationScore=String(item.score);
    const summary=screen.querySelectorAll('.fm-next-detail-summary > div');
    const spot=summary[1]?.querySelector('b');
    if(spot)spot.textContent=item.spotLabel;
  }

  function apply(){
    const state=readSession();
    if(mode!=='real')shadowState={...shadowState,...state};
    const ranked=rank(state);
    patchHome(state,ranked);
    patchDiscover(state,ranked);
    patchDetail(state,ranked);
    root.dataset.recommendationVersion='4.1.0';
  }

  root.addEventListener('click',event=>{
    const target=event.target.closest('[data-action]');
    if(!target)return;
    const action=target.dataset.action;
    if(action==='choose-setup'){
      const field=target.dataset.field;
      if(['region','position','level'].includes(field))shadowState={...shadowState,[field]:target.dataset.value};
    }
    if(action==='open-match')shadowState={...shadowState,selectedMatchId:target.dataset.matchId};
    if(action==='open-joined-match'){
      const session=readSession();
      if(session.joinedMatchId)shadowState={...shadowState,selectedMatchId:session.joinedMatchId};
    }
    if(action==='reset-flow')shadowState=createState();
  },true);

  let scheduled=false;
  const observer=new MutationObserver(()=>{
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;apply()});
  });
  observer.observe(root,{childList:true,subtree:true});
  apply();
}

