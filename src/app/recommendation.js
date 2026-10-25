import {MATCHES,NEXT_STORAGE_KEY,createState} from './data.js';
import {rankRecommendations} from '../platform/domain/recommendation.js';
import {matchingAssessment} from '../platform/domain/recommendation.js';

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
      rank:(preferences={})=>rank(createState(preferences)).map(item=>({id:item.match.id,score:item.score,fit:item.fit,fitTier:item.fitTier,exactRegion:item.exactRegion,slotCount:item.slotCount,reasons:item.reasons.map(reason=>reason.title)}))
    };
  }

  exportRecommendations();

  function money(value){return new Intl.NumberFormat('ko-KR').format(value)+'원'}

  function tinyIcon(name){
    const glyphs={pin:'📍',level:'📊',position:'⚽',clock:'🕒',spark:'✨'};
    return `<i class="fm-next-icon fm-icon" aria-hidden="true" data-icon="${glyphs[name]||'ℹ'}"></i>`;
  }

  function card(item,index,scope='home'){
    const match=item.match;
    const assessment=matchingAssessment(match,readSession());
    // Home and Discover intentionally share one visible match-card metadata hierarchy.
    const homeMeta=scope==='home';
    return `<button type="button" class="fm-next-match-card" data-action="open-match" data-match-id="${match.id}" data-recommendation-score="${item.score}" data-recommendation-region="${match.region}" aria-label="${match.place} 상세 보기">
      <div class="fm-next-match-card-media">
        <div class="fm-next-match-date"><span>${match.dateLabel}</span>${index===0?`<span class="fm-next-fit-badge${(item.fit.includes('차이')||!item.exactRegion||item.slotCount<=0)?' fm-next-fit-badge--caution':''}">${tinyIcon('spark')} ${item.slotCount<=0?'포지션 마감':(item.fit.includes('차이')||!item.exactRegion)?'조건 확장':'추천 1순위'}</span>`:''}</div>
        <div class="fm-next-match-place">${match.place}</div>
      </div>
      <div class="fm-next-match-body">
        ${homeMeta?'':`<div class="fm-match-assessment" data-match-assessment>${assessment.strengths.length?`<span><b>맞는 점</b> ${assessment.strengths.join(' · ')}</span>`:''}${assessment.cautions.length?`<span class="fm-match-caution"><b>확인할 점</b> ${assessment.cautions.join(' · ')}</span>`:''}</div>`}
        <div class="fm-next-match-tags"><span class="fm-next-tag fm-next-tag--strong">${item.fit}</span><span class="fm-next-tag">예시 ${match.distance}</span><span class="fm-next-tag"${homeMeta?' style="display:inline-flex"':''}>${item.spotLabel}</span><span class="fm-next-tag" style="${homeMeta?'display:inline-flex;':''}margin-left:auto;white-space:nowrap">${match.level}</span></div>
        <div class="fm-next-match-footer"><div><small>${match.format} · ${match.duration}</small></div><div class="fm-next-price"><span class="fm-next-price-sample">샘플</span> ${money(match.price)}</div></div>
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
    list.innerHTML=ranked.slice(0,2).map((item,index)=>card(item,index,'home')).join('');
    const sectionCopy=screen.querySelector('.fm-next-section-head p');
    if(sectionCopy)sectionCopy.textContent=ranked[0]?.fit?.includes('차이')?'경기 강도가 다른 후보는 조건 확장으로 표시해요.':!ranked[0]?.exactRegion?'선호 포지션·레벨에 맞는 후보를 우선하고 생활권을 넓혔어요.':'지역·포지션·레벨이 맞는 참가 가능 경기를 먼저 정리했어요.';
    if(!state.joinedMatchId){
      const context=screen.querySelector('.fm-next-context-card');
      const heading=context?.querySelector('h2');
      const copy=context?.querySelector('p');
      if(heading)heading.textContent=`${state.region} 추천 경기`;
      if(copy)copy.textContent=`${state.level} · ${state.position} 기준으로 지역·포지션·레벨 적합도를 실제 추천 순위에 반영했습니다.`;
    }
  }

  function patchDiscover(state,ranked){
    const screen=root.querySelector('[data-screen="discover"]');
    if(!screen)return;
    const list=screen.querySelector('.fm-next-list');
    if(!list)return;
    const sig=signature(state,'discover');
    if(list.dataset.fmRecommendationSignature===sig)return;
    list.dataset.fmRecommendationSignature=sig;
    list.innerHTML=ranked.map((item,index)=>card(item,index,'discover')).join('');
    const heading=screen.querySelector('.fm-next-section-head h1');
    const copy=screen.querySelector('.fm-next-section-head p');
    if(heading)heading.textContent=`${state.region} 추천 경기`;
    if(copy)copy.textContent=`${state.level} · ${state.position} 기준 · 적합도 높은 순`;
  }

  function patchDetail(state,ranked){
    state=window.__FOOTMATE_DECISION__?.preferencesFor?.(state)||state;
    ranked=rank(state);
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
