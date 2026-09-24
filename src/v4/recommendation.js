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

  const IA_AI_KEY='footmate:v5.1:ai';
  const IA_SNAPSHOT_KEY='footmate:v5.2:discover-ai-snapshot';
  const IA_SCOPE_KEY='footmate:v5.2:discover-ai-scope';
  const IA_FOCUS_KEY='footmate:v5.2:focus-assistant';
  let iaHomeCard=null;
  let iaHomeObserver=null;
  let iaSearchIntent=null;
  let iaPressedExample=null;

  function iaRead(key){try{return JSON.parse(sessionStorage.getItem(key)||'null')}catch{return null}}
  function iaWrite(key,value){try{sessionStorage.setItem(key,JSON.stringify(value))}catch(_error){}}
  function iaReadAssistant(){try{return JSON.parse(localStorage.getItem(IA_AI_KEY)||'null')}catch{return null}}
  function iaSnapshot(){return iaRead(IA_SNAPSHOT_KEY)}
  function iaScopeActive(){return Boolean(iaSnapshot()?.result)&&sessionStorage.getItem(IA_SCOPE_KEY)==='1'}
  function iaSetScope(active){sessionStorage.setItem(IA_SCOPE_KEY,active?'1':'0')}
  function iaText(node,value){if(node&&node.textContent!==value)node.textContent=value}
  function iaHidden(node,value){if(node&&node.hidden!==value)node.hidden=value}
  function iaEscape(value){return String(value??'').replace(/[&<>]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[char]))}
  function iaTimeMinutes(value){const found=String(value||'').match(/^(\d{1,2}):(\d{2})$/);return found?Number(found[1])*60+Number(found[2]):null}
  function iaMatchTimeMinutes(match){const found=String(match.dateLabel||'').match(/(\d{1,2}):(\d{2})/);return found?Number(found[1])*60+Number(found[2]):null}
  function iaConditionLabels(result={}){
    const items=[];
    if(result.region)items.push(result.region);
    if(result.position)items.push(result.position);
    if(result.level)items.push(result.level);
    if(result.maxPrice!=null)items.push(`${money(result.maxPrice)} 이하`);
    if(result.maxDistanceMin!=null)items.push(`${result.maxDistanceMin}분 이내`);
    if(result.afterTime)items.push(`${result.afterTime} 이후`);
    return items.length?items:['현재 설정 유지'];
  }
  function iaMatchIds(saved,state){
    if(!saved?.result)return null;
    const result=saved.result;
    const effective=createState({...state,region:result.region||state.region,position:result.position||state.position,level:result.level||state.level});
    const threshold=iaTimeMinutes(result.afterTime);
    return rank(effective).map(item=>item.match).filter(match=>{
      if(result.region&&match.region!==result.region)return false;
      if(result.position&&Number(match.positionSlots?.[result.position]||0)<=0)return false;
      if(result.maxPrice!=null&&match.price>Number(result.maxPrice))return false;
      if(result.maxDistanceMin!=null&&match.distanceMin>Number(result.maxDistanceMin))return false;
      if(threshold!=null){const minutes=iaMatchTimeMinutes(match);if(minutes!=null&&minutes<threshold)return false;}
      return true;
    }).map(match=>match.id);
  }
  function iaSetPressed(button){
    iaPressedExample=button||null;
    iaHomeCard?.querySelectorAll('[data-ai-example]').forEach(example=>{
      const value=example===iaPressedExample?'true':'false';
      if(example.getAttribute('aria-pressed')!==value)example.setAttribute('aria-pressed',value);
    });
  }
  function iaSetLoading(card,loading){
    card?.classList.toggle('is-ia-loading',loading);
    card?.querySelectorAll('[data-ai-example]').forEach(example=>{
      const value=loading?'true':'false';
      if(example.getAttribute('aria-disabled')!==value)example.setAttribute('aria-disabled',value);
    });
  }
  function iaGoDiscover(){
    const screen=root.querySelector('[data-screen="home"]');
    if(!screen)return;
    iaSetScope(true);
    screen.querySelector('[data-action="nav-discover"]')?.click();
  }
  function iaObserveHome(card){
    if(iaHomeCard===card)return;
    iaHomeObserver?.disconnect();
    iaHomeCard=card;
    iaHomeObserver=new MutationObserver(()=>{
      const status=card.dataset.aiState;
      if(status==='loading'){iaSetLoading(card,true);return;}
      if(status!=='result')return;
      iaSetLoading(card,false);
      const saved=iaReadAssistant();
      if(saved?.result)iaWrite(IA_SNAPSHOT_KEY,saved);
      const shouldNavigate=iaSearchIntent==='example'||(iaSearchIntent==='submit'&&saved?.mode==='connected-ai');
      iaSearchIntent=null;
      iaSetPressed(null);
      if(shouldNavigate&&saved?.result)requestAnimationFrame(iaGoDiscover);
    });
    iaHomeObserver.observe(card,{attributes:true,attributeFilter:['data-ai-state']});
  }
  function iaConfigureHome(screen){
    screen.dataset.iaRole='assistant-entry';
    const greeting=screen.querySelector('.fm-next-greeting');
    iaText(greeting?.querySelector('small'),'AI MATCH ASSISTANT');
    iaText(greeting?.querySelector('h1'),'오늘, 어떤 경기에서 뛸까요?');
    const assistant=screen.querySelector('.fm-ai-card[data-product-ai="home"],.fm-ai-card[data-ai-assistant]');
    if(assistant){
      assistant.hidden=false;
      assistant.dataset.iaRole='primary-assistant';
      assistant.querySelectorAll('[data-ai-example]').forEach(example=>{
        if(example.hidden)example.hidden=false;
        example.classList.add('fm-ia-suggestion');
        if(!example.hasAttribute('aria-pressed'))example.setAttribute('aria-pressed','false');
        if(example.style.minHeight!=='44px')example.style.minHeight='44px';
      });
      const group=assistant.querySelector('.fm-ai-examples');
      if(group?.getAttribute('aria-label')!=='바로 실행할 AI 경기 검색 예시')group?.setAttribute('aria-label','바로 실행할 AI 경기 검색 예시');
      iaObserveHome(assistant);
    }
    const context=screen.querySelector('.fm-next-context-card');
    if(context){
      const generic=/FOR YOU/i.test(context.querySelector('.fm-next-context-kicker')?.textContent||'');
      iaHidden(context,generic);
      context.classList.toggle('fm-ia-selection-summary',!generic);
    }
    const sectionHead=screen.querySelector(':scope > .fm-next-section-head');
    iaText(sectionHead?.querySelector('h2'),'For You');
    iaText(sectionHead?.querySelector('p'),'내 설정을 기준으로 고른 추천 경기예요.');
    iaText(sectionHead?.querySelector('[data-action="nav-discover"]'),'경기 찾기');
    const list=screen.querySelector(':scope > .fm-next-list');
    if(list){
      list.dataset.iaRole='personalized-recommendations';
      list.querySelectorAll('.fm-next-match-card').forEach((node,index)=>iaHidden(node,index>1));
    }
    if(sessionStorage.getItem(IA_FOCUS_KEY)==='1'){
      sessionStorage.removeItem(IA_FOCUS_KEY);
      requestAnimationFrame(()=>{
        assistant?.scrollIntoView({block:'start',behavior:'smooth'});
        assistant?.querySelector('[data-ai-input]')?.focus({preventScroll:true});
      });
    }
  }
  function iaEnsureSummary(screen,saved,active){
    let summary=screen.querySelector('[data-ia-ai-summary]');
    if(!saved?.result){summary?.remove();return}
    if(!summary){
      summary=document.createElement('section');
      summary.className='fm-discovery-ai-summary';
      summary.dataset.iaAiSummary='true';
      const anchor=screen.querySelector('.fm-next-match-tags');
      if(anchor)anchor.before(summary);else screen.querySelector('.fm-next-section-head')?.insertAdjacentElement('afterend',summary);
    }
    const conditionLabels=iaConditionLabels(saved.result);
    const sig=JSON.stringify([active,saved.message,conditionLabels]);
    if(summary.dataset.iaSignature===sig)return;
    summary.dataset.iaSignature=sig;
    summary.innerHTML=`<div class="fm-discovery-ai-summary__copy"><small>${active?'AI 조회 결과':'최근 AI 조회 조건'}</small><b>${iaEscape(saved.message||'AI 경기 조회')}</b><div class="fm-discovery-ai-summary__chips">${conditionLabels.map(label=>`<span>${iaEscape(label)}</span>`).join('')}</div></div><div class="fm-discovery-ai-summary__actions"><button type="button" data-ia-action="${active?'show-all':'apply-ai'}">${active?'전체 경기 보기':'AI 결과 다시 보기'}</button><button type="button" data-ia-action="edit-ai">조건 다시 입력</button></div>`;
  }
  function iaEnsureEmpty(screen){
    let empty=screen.querySelector('[data-ia-ai-empty]');
    if(!empty){
      empty=document.createElement('div');
      empty.className='fm-ia-discovery-empty';
      empty.dataset.iaAiEmpty='true';
      empty.innerHTML='<b>AI 조건과 현재 필터를 함께 만족하는 경기가 없어요.</b><span>필터를 줄이거나 전체 경기 보기로 탐색 범위를 넓혀보세요.</span>';
      screen.querySelector('.fm-next-list')?.before(empty);
    }
    return empty;
  }
  function iaConfigureDiscover(screen){
    screen.dataset.iaRole='result-exploration';
    const assistant=screen.querySelector('.fm-ai-card[data-product-ai="discover"],.fm-ai-card[data-ai-assistant]');
    if(assistant){iaHidden(assistant,true);assistant.dataset.iaHidden='duplicate-assistant';}
    const saved=iaSnapshot();
    const active=iaScopeActive();
    iaEnsureSummary(screen,saved,active);
    const head=screen.querySelector('.fm-next-section-head');
    iaText(head?.querySelector('h1'),active&&saved?.result?'AI 조회 결과':'경기 찾기');
    iaText(head?.querySelector('p'),active&&saved?.result?'조회 결과를 필터와 정렬로 조정할 수 있어요.':'추천 기준을 유지한 채 전체 경기를 탐색할 수 있어요.');
    const ids=active?iaMatchIds(saved,readSession()):null;
    const allowedSet=ids?new Set(ids):null;
    const cards=[...screen.querySelectorAll('.fm-next-list .fm-next-match-card')];
    let visible=0;
    cards.forEach(node=>{
      const matches=!allowedSet||allowedSet.has(node.dataset.matchId);
      iaHidden(node,!matches);
      const value=matches&&allowedSet?'true':'false';
      if(node.dataset.iaAiMatch!==value)node.dataset.iaAiMatch=value;
      if(matches)visible+=1;
    });
    const empty=iaEnsureEmpty(screen);
    iaHidden(empty,!(active&&saved?.result&&visible===0));
    const list=screen.querySelector('.fm-next-list');
    iaHidden(list,Boolean(active&&saved?.result&&visible===0));
    const count=screen.querySelector('.fm-discovery-count');
    iaText(count,active&&saved?.result?`AI 결과 ${visible}개`:`${cards.length}개 경기`);
  }
  function iaEnhance(){
    const screen=root.querySelector('[data-screen]');
    if(!screen)return;
    if(screen.dataset.screen==='home')iaConfigureHome(screen);
    else if(screen.dataset.screen==='discover')iaConfigureDiscover(screen);
    else if(screen.dataset.screen==='schedule')screen.dataset.iaRole='joined-match-status';
    else if(screen.dataset.screen==='profile')screen.dataset.iaRole='account-settings';
  }

  root.addEventListener('pointerdown',event=>{
    const example=event.target.closest('[data-screen="home"] [data-ai-example]');
    if(example){iaSearchIntent='example';iaSetPressed(example);}
  },true);
  root.addEventListener('submit',event=>{
    if(event.target.closest('[data-screen="home"] [data-ai-form]')&&iaSearchIntent!=='example')iaSearchIntent='submit';
  },true);
  root.addEventListener('click',event=>{
    const action=event.target.closest('[data-ia-action]');
    if(action){
      if(action.dataset.iaAction==='show-all'){iaSetScope(false);iaEnhance();}
      else if(action.dataset.iaAction==='apply-ai'){iaSetScope(true);iaEnhance();}
      else if(action.dataset.iaAction==='edit-ai'){
        sessionStorage.setItem(IA_FOCUS_KEY,'1');
        root.querySelector('[data-screen="discover"] [data-action="nav-home"]')?.click();
      }
    }
    const reset=event.target.closest('[data-action="reset-flow"]');
    if(reset){
      sessionStorage.removeItem(IA_SNAPSHOT_KEY);
      sessionStorage.removeItem(IA_SCOPE_KEY);
      sessionStorage.removeItem(IA_FOCUS_KEY);
    }
  },true);

  let scheduled=false;
  const observer=new MutationObserver(()=>{
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;apply();iaEnhance()});
  });
  observer.observe(root,{childList:true,subtree:true});
  apply();
  iaEnhance();
  window.__FOOTMATE_REAL_APP_IA__=Object.freeze({version:'1.0.0',roles:Object.freeze({home:'assistant-entry',discover:'result-exploration',schedule:'joined-match-status',profile:'account-settings'}),get assistant(){return iaSnapshot()},get aiScope(){return iaScopeActive()}});
}
