function textValue(value){
  return '₩'+Math.max(0,Number(value)||0).toLocaleString();
}

export function createPaymentController({productStore,scenarioStore,finalRuntime}){
  const legacy=finalRuntime.legacy||{};
  const COST=productStore.cost;
  const hardenedRecord=typeof window.recordParticipation==='function'?window.recordParticipation.bind(window):null;

  function selectedKey(){
    return scenarioStore.getState().selectedMatchKey||'suwon';
  }

  function render(){
    productStore.renderCredit();
  }

  function selectCharge(button,amount){
    const value=Math.max(0,Number(amount)||20000);
    legacy.selectCharge?.(button,value);
    productStore.set({selectedChargeAmount:value},'charge-amount');
    render();
    return value;
  }

  function selectMethod(method){
    legacy.selectMethod?.(method);
    productStore.set({selectedPaymentMethod:method},'payment-method');
    return method;
  }

  function simulateLowCredit(){
    productStore.set({creditBalance:3000},'low-credit');
    render();
    window.goScreen?.('s-pay-low');
    return true;
  }

  function recordParticipation(){
    const key=selectedKey();
    let result=true;
    productStore.update(state=>{
      if(!Array.isArray(state.paidMatchKeys))state.paidMatchKeys=[];
      if(state.paidMatchKeys.includes(key))return;
      if(Number(state.creditBalance)<COST){
        state.creditBalance=Math.min(Number(state.creditBalance)||0,3000);
        result=false;
        return;
      }
      state.creditBalance=window.FootMateCore.applyCredit(state.creditBalance,-COST);
      state.paidMatchKeys.push(key);
    },result?'participation-charge':'participation-insufficient');

    render();
    if(result===false)return false;

    const legacyResult=hardenedRecord?.();
    render();
    productStore.persist('participation-recorded');
    return legacyResult===false?false:true;
  }

  function confirmParticipation(){
    if(recordParticipation()===false){
      window.goScreen?.('s-pay-low');
      return false;
    }
    window.goScreen?.('s-confirm');
    return true;
  }

  function completeCharge(){
    const state=productStore.getState();
    const amount=Number(state.selectedChargeAmount)||20000;
    const method=state.selectedPaymentMethod||'kakao';
    const labels={kakao:'카카오페이',naver:'네이버페이',card:'신용 · 체크카드'};

    productStore.update(current=>{
      current.creditBalance=window.FootMateCore.applyCredit(current.creditBalance,amount);
    },'charge-complete');

    const after=productStore.getState().creditBalance;
    const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value};
    set('chargeDoneAmount',textValue(amount)+' 충전 완료');
    set('chargeDoneBalance',(labels[method]||'선택 결제수단')+' · 충전 후 잔액 '+textValue(after));
    render();

    if(recordParticipation()===false){
      window.goScreen?.('s-pay-low');
      return false;
    }

    set('chargeDoneRemaining',textValue(productStore.getState().creditBalance));
    window.goScreen?.('s-charge-done');
    return true;
  }

  function bind(){
    document.querySelectorAll('#s-charge .charge-btn').forEach(button=>{
      const source=button.getAttribute('onclick')||'';
      const amount=Number(source.match(/selectCharge\(this,\s*(\d+)/)?.[1]||button.textContent.replace(/\D/g,''));
      button.removeAttribute('onclick');
      button.onclick=null;
      if(button.dataset.v2PaymentBound==='true')return;
      button.dataset.v2PaymentBound='true';
      button.addEventListener('click',()=>selectCharge(button,amount));
    });

    document.querySelectorAll('#s-charge .pay-method-btn').forEach(button=>{
      const method=button.id.replace('method-','');
      button.removeAttribute('onclick');
      button.onclick=null;
      if(button.dataset.v2PaymentBound==='true')return;
      button.dataset.v2PaymentBound='true';
      button.addEventListener('click',()=>selectMethod(method));
    });

    const payPrimary=document.querySelector('#s-pay .btn-primary');
    if(payPrimary){
      payPrimary.removeAttribute('onclick');
      payPrimary.onclick=null;
      if(payPrimary.dataset.v2PaymentBound!=='true'){
        payPrimary.dataset.v2PaymentBound='true';
        payPrimary.addEventListener('click',confirmParticipation);
      }
    }

    const low=[...document.querySelectorAll('#s-pay .btn-secondary')]
      .find(button=>(button.textContent||'').includes('크레딧 부족 시뮬레이션'));
    if(low){
      low.removeAttribute('onclick');
      low.onclick=null;
      if(low.dataset.v2PaymentBound!=='true'){
        low.dataset.v2PaymentBound='true';
        low.addEventListener('click',simulateLowCredit);
      }
    }

    const chargePrimary=document.querySelector('#s-charge .btn-primary');
    if(chargePrimary){
      chargePrimary.removeAttribute('onclick');
      chargePrimary.onclick=null;
      if(chargePrimary.dataset.v2PaymentBound!=='true'){
        chargePrimary.dataset.v2PaymentBound='true';
        chargePrimary.addEventListener('click',completeCharge);
      }
    }
  }

  function onScreen(screenId){
    if(['s-pay','s-pay-low','s-charge','s-charge-done','s-profile'].includes(screenId)){
      bind();
      render();
    }
  }

  // Thin compatibility bridge for legacy simulation actions and ProductOps.
  window.selectCharge=selectCharge;
  window.selectMethod=selectMethod;
  window.simulateLowCredit=simulateLowCredit;
  window.recordParticipation=recordParticipation;
  window.confirmParticipation=confirmParticipation;
  window.completeCharge=completeCharge;

  bind();
  render();

  return{onScreen,bind,render,recordParticipation,confirmParticipation,completeCharge,simulateLowCredit};
}
