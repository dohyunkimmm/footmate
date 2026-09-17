(function(){
'use strict';
if(window.__footmateFinalize)return;
window.__footmateFinalize=true;

const STORE='footmateFinalStateV3';
const COST=17000;
const defaults={
  creditBalance:20000,
  paidMatchKeys:[],
  homeDayIndex:1,
  homeFilterMode:'all',
  favoriteMatchKeys:[],
  friendIds:[],
  evalStars:0,
  chatMessages:[],
  selectedChargeAmount:20000,
  selectedPaymentMethod:'kakao'
};
const state=Object.assign({},defaults);

try{Object.assign(state,JSON.parse(localStorage.getItem(STORE)||'{}')||{})}catch(e){}

for(const key of ['paidMatchKeys','favoriteMatchKeys','friendIds','chatMessages']){
  if(!Array.isArray(state[key]))state[key]=[];
}

const legacyFavorite=state.favorite===true;
const legacyFriend=state.friendAdded===true;
try{
  const key=window.selectedMatchKey||(typeof selectedMatchKey!=='undefined'?selectedMatchKey:null)||'suwon';
  if(legacyFavorite&&!state.favoriteMatchKeys.includes(key))state.favoriteMatchKeys.push(key);
}catch(e){}
if(legacyFriend){
  for(const id of ['kim-minsu','park-jihyun']){
    if(!state.friendIds.includes(id))state.friendIds.push(id);
  }
}
delete state.favorite;
delete state.friendAdded;

function persist(){
  try{localStorage.setItem(STORE,JSON.stringify(state))}catch(e){}
}

function won(value){
  return '₩'+Math.max(0,Number(value)||0).toLocaleString();
}

function rowValue(root,label){
  if(!root)return null;
  for(const row of root.querySelectorAll('.pay-row,.profile-menu-item')){
    const key=row.querySelector('.pay-key,.pmi-txt');
    if(key&&key.textContent.trim()===label)return row.querySelector('.pay-val,.pmi-val');
  }
  return null;
}

function setText(id,text){
  const el=document.getElementById(id);
  if(el)el.textContent=text;
  return el;
}

function renderCredit(){
  const pay=document.getElementById('s-pay');
  const low=document.getElementById('s-pay-low');
  const charge=document.getElementById('s-charge');
  const profile=document.getElementById('s-profile');
  const balance=Number(state.creditBalance)||0;
  const chargeAmount=Number(state.selectedChargeAmount)||20000;

  const payBalance=rowValue(pay,'현재 크레딧 잔액');
  if(payBalance)payBalance.textContent=won(balance);

  const primary=pay?.querySelector('.btn-primary');
  if(primary){
    primary.textContent=balance>=COST
      ? `크레딧 ${won(COST)}으로 참가 확정하기`
      : `크레딧 부족 · ${won(COST-balance)} 충전 필요`;
  }

  const lowBalance=rowValue(low,'현재 크레딧');
  if(lowBalance)lowBalance.textContent=won(balance);
  const shortage=rowValue(low,'부족한 금액');
  if(shortage)shortage.textContent=won(Math.max(0,COST-balance));

  if(charge){
    const current=[...charge.querySelectorAll('div')]
      .find(el=>el.textContent.trim()==='현재 크레딧 잔액')
      ?.parentElement?.querySelector('div:nth-child(2)');
    if(current)current.textContent=won(balance);
    setText('afterBalance',won(balance+chargeAmount));
    const chargeButton=charge.querySelector('.btn-primary');
    if(chargeButton)chargeButton.textContent=won(chargeAmount)+' 충전하기';
  }

  const profileBalance=rowValue(profile,'크레딧 잔액');
  if(profileBalance)profileBalance.textContent=won(balance);
  setText('chargeDoneRemaining',won(balance));
}

const legacy={
  switchDay:typeof window.switchDay==='function'?window.switchDay:null,
  filterTab:typeof window.filterTab==='function'?window.filterTab:null,
  selectCharge:typeof window.selectCharge==='function'?window.selectCharge:null,
  selectMethod:typeof window.selectMethod==='function'?window.selectMethod:null,
  setStars:typeof window.setStars==='function'?window.setStars:null,
  toggleFavorite:typeof window.toggleFavorite==='function'?window.toggleFavorite:null,
  addFriend:typeof window.addFriend==='function'?window.addFriend:null,
  sendChatMsg:typeof window.sendChatMsg==='function'?window.sendChatMsg:null,
  replayFootMateDemo:typeof window.replayFootMateDemo==='function'?window.replayFootMateDemo:null
};

window.FootMateFinalRuntime={
  state,
  persist,
  renderCredit,
  cost:COST,
  storeKey:STORE,
  legacy,
  architecture:'compatibility-state-bridge'
};

renderCredit();
persist();
})();