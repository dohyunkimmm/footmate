const root=document.getElementById('footmate-next');
const MEDIUM_UX_VERSION='1.0.0';
const LOW_UX_VERSION='1.0.0';
const PERSONALIZATION_KEY='footmate:v4:personalization';
let committingFilterDraft=false;

function isRealApp(){
  return document.documentElement.dataset.footmateSurface==='real';
}

function removeDuplicateAiCoreLabel(card){
  const label=card.querySelector('[data-ai-core-label]');
  if(!label||label.hidden)return;
  label.textContent='';
  label.hidden=true;
  label.setAttribute('aria-hidden','true');
}

function visuallyHiddenDescription(screen,id,text){
  let node=screen.querySelector(`#${id}`);
  if(node)return node;
  node=document.createElement('span');
  node.id=id;
  node.textContent=text;
  node.style.position='absolute';
  node.style.width='1px';
  node.style.height='1px';
  node.style.padding='0';
  node.style.margin='-1px';
  node.style.overflow='hidden';
  node.style.clip='rect(0 0 0 0)';
  node.style.whiteSpace='nowrap';
  node.style.border='0';
  screen.append(node);
  return node;
}

function markHomeDiscoverShortcut(){
  const screen=root?.querySelector('[data-screen="home"]');
  if(!screen)return;
  const shortcut=[...screen.querySelectorAll('.fm-next-context-card [data-action="nav-discover"]')].find(node=>/추천 경기 보기/.test(node.textContent||''));
  if(!shortcut)return;
  const desc=visuallyHiddenDescription(screen,'fm-medium-home-discover-help','현재 추천의 전체 후보를 경기 찾기 화면에서 이어서 탐색합니다.');
  shortcut.dataset.discoveryShortcut='true';
  shortcut.setAttribute('aria-describedby',desc.id);
}

function markDiscoveryScopes(){
  const screen=root?.querySelector('[data-screen="discover"]');
  if(!screen)return;
  const base=screen.querySelector('.fm-next-topbar [data-action="edit-setup"]');
  const filter=screen.querySelector('[data-discovery-action="open-filters"]');
  if(base){
    const desc=visuallyHiddenDescription(screen,'fm-medium-base-condition-help','지역·포지션·레벨처럼 추천 순위의 기준이 되는 기본 추천 조건입니다.');
    base.dataset.conditionScope='base';
    base.setAttribute('aria-describedby',desc.id);
  }
  if(filter){
    const desc=visuallyHiddenDescription(screen,'fm-medium-temporary-filter-help','기본 추천 조건은 유지하고 현재 경기 목록에만 추가로 적용하는 임시 필터입니다.');
    filter.dataset.filterScope='temporary';
    filter.setAttribute('aria-describedby',desc.id);
  }
}

function markCanonicalSettingsOwner(){
  const screen=root?.querySelector('[data-screen="profile"]');
  if(!screen)return;
  const panel=screen.querySelector('.fm-personalization-panel--profile');
  const canonical=panel?.querySelector('[data-action="edit-setup"]');
  const menu=[...screen.querySelectorAll('.fm-next-menu-item[data-action="edit-setup"]')].find(node=>/경기 추천 설정/.test(node.textContent||''));
  if(canonical)canonical.dataset.settingsOwner='canonical';
  if(menu&&canonical)menu.dataset.settingsJump='canonical';
}

function compactEmptySavedPreferences(){
  const panel=root?.querySelector('[data-screen="profile"] .fm-personalization-panel--profile');
  if(!panel)return;
  const fieldsets=[...panel.querySelectorAll(':scope > fieldset')];
  const existing=panel.querySelector('[data-low-empty-preferences]');
  const saved=panel.querySelector('.fm-personalization-head b')?.textContent?.trim()==='저장한 추천 프로필';
  const editing=panel.dataset.editing==='true';
  const emptyCopy='아직 선택한 항목이 없어요.';
  const allEmpty=fieldsets.length===3&&fieldsets.every(fieldset=>fieldset.querySelector('.fm-personalization-options')?.textContent?.trim()===emptyCopy);
  if(!saved||editing||!allEmpty){
    existing?.remove();
    fieldsets.forEach(fieldset=>{
      if(fieldset.dataset.lowEmptyPreference==='true'){
        fieldset.hidden=false;
        delete fieldset.dataset.lowEmptyPreference;
      }
    });
    return;
  }
  fieldsets.forEach(fieldset=>{
    fieldset.hidden=true;
    fieldset.dataset.lowEmptyPreference='true';
  });
  if(existing)return;
  const summary=document.createElement('p');
  summary.dataset.lowEmptyPreferences='';
  summary.textContent='선호 지역·시간대·경기 포맷을 아직 저장하지 않았어요.';
  summary.style.cssText='margin:18px 0 0;padding:18px 0 0;border-top:1px solid rgba(20,55,40,.08);color:#607168;font-size:12px;line-height:1.55';
  const actions=panel.querySelector('.fm-personalization-actions');
  if(actions)panel.insertBefore(summary,actions);
}

function removeCompletedCheckinControl(){
  root?.querySelectorAll('[data-product-checkin][data-checkin-state="completed"] [data-matchday-action="checkin"][disabled]').forEach(button=>button.remove());
}

function polishRealApp(){
  if(!root||!isRealApp())return;
  root.dataset.mediumUxVersion=MEDIUM_UX_VERSION;
  root.dataset.lowUxVersion=LOW_UX_VERSION;
  root.querySelectorAll('[data-screen="home"] [data-ai-assistant]').forEach(removeDuplicateAiCoreLabel);
  markHomeDiscoverShortcut();
  markDiscoveryScopes();
  markCanonicalSettingsOwner();
  compactEmptySavedPreferences();
  removeCompletedCheckinControl();
}

function personalizationHasData(){
  try{
    const memory=JSON.parse(localStorage.getItem(PERSONALIZATION_KEY)||'{}');
    return Boolean(memory?.profile||memory?.recentMatchIds?.length||memory?.favorites?.areas?.length||memory?.favorites?.timeWindows?.length||memory?.favorites?.formats?.length);
  }catch{
    return false;
  }
}

function announceReset(button,message){
  const panel=button.closest('.fm-personalization-panel--profile');
  if(!panel)return;
  let status=panel.querySelector('[data-medium-reset-status]');
  if(!status){
    status=document.createElement('span');
    status.dataset.mediumResetStatus='';
    status.setAttribute('role','status');
    status.setAttribute('aria-live','polite');
    status.style.position='absolute';
    status.style.width='1px';
    status.style.height='1px';
    status.style.padding='0';
    status.style.margin='-1px';
    status.style.overflow='hidden';
    status.style.clip='rect(0 0 0 0)';
    status.style.whiteSpace='nowrap';
    status.style.border='0';
    panel.append(status);
  }
  status.textContent=message;
}

function commitFilterDraft(sheet){
  committingFilterDraft=true;
  try{
    sheet.querySelectorAll('[data-discovery-field]').forEach(field=>field.dispatchEvent(new Event('change',{bubbles:true})));
  }finally{
    committingFilterDraft=false;
  }
}

function clearFilterDraft(sheet){
  sheet.querySelectorAll('[data-discovery-field]').forEach(field=>{field.value='all';field.dataset.mediumDraft='true'});
}

function focusCanonicalSettings(menu){
  const screen=menu.closest('[data-screen="profile"]');
  const canonical=screen?.querySelector('.fm-personalization-panel--profile [data-action="edit-setup"]');
  if(!canonical)return false;
  canonical.scrollIntoView({block:'center',behavior:'smooth'});
  canonical.focus({preventScroll:true});
  screen.dataset.mediumSettingsFocus='canonical';
  return true;
}

if(root&&isRealApp()){
  document.addEventListener('change',event=>{
    const field=event.target.closest?.('.fm-discovery-sheet [data-discovery-field]');
    if(!field||committingFilterDraft)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    field.dataset.mediumDraft='true';
  },true);

  document.addEventListener('click',event=>{
    const target=event.target.closest?.('button');
    if(!target)return;

    const sheet=target.closest('.fm-discovery-sheet');
    if(sheet&&target.dataset.discoveryAction==='clear-filters'){
      event.preventDefault();
      event.stopImmediatePropagation();
      clearFilterDraft(sheet);
      return;
    }
    if(sheet&&target.classList.contains('fm-discovery-done'))commitFilterDraft(sheet);

    if(target.dataset.settingsJump==='canonical'&&focusCanonicalSettings(target)){
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    if(target.matches('.fm-personalization-panel--profile [data-personalization-action="reset"]')){
      if(!personalizationHasData()){
        event.preventDefault();
        event.stopImmediatePropagation();
        target.dataset.mediumResetState='empty';
        target.setAttribute('aria-label','초기화할 개인화 기록이 없습니다');
        announceReset(target,'초기화할 개인화 기록이 없습니다.');
        return;
      }
      if(target.dataset.mediumResetState!=='confirm'){
        event.preventDefault();
        event.stopImmediatePropagation();
        target.dataset.mediumResetState='confirm';
        target.setAttribute('aria-pressed','true');
        target.setAttribute('aria-label','개인화 기록 초기화 확인');
        announceReset(target,'한 번 더 누르면 개인화 기록이 초기화됩니다.');
        return;
      }
      target.removeAttribute('aria-pressed');
      target.removeAttribute('aria-label');
      target.dataset.mediumResetState='';
    }
  },true);

  const observer=new MutationObserver(polishRealApp);
  observer.observe(root,{childList:true,subtree:true});
  polishRealApp();
  queueMicrotask(polishRealApp);
}