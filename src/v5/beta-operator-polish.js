const root=document.getElementById('footmate-beta-operator');

if(root){
  const toLocalValue=value=>{
    const date=new Date(value);if(Number.isNaN(date.getTime()))return '';
    return new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,16);
  };
  const offsetValue=(value,offsetMs)=>{
    const date=new Date(value);if(Number.isNaN(date.getTime()))return '';
    return toLocalValue(date.getTime()+offsetMs);
  };

  function polishMatchForm(){
    const form=root.querySelector('form[data-form="match"]');
    if(!form)return;
    const starts=form.querySelector('input[name="startsAt"]');
    const cancel=form.querySelector('input[name="cancelCutoffAt"]');
    const checkIn=form.querySelector('input[name="checkInOpensAt"]');
    if(!starts||!cancel||!checkIn)return;

    const selected=Boolean(root.querySelector('.fm-operator-item[aria-current="true"]'));
    const syncBounds=()=>{
      const max=String(starts.value||'');
      if(max){cancel.max=offsetValue(max,-60*1000);checkIn.max=max}else{cancel.removeAttribute('max');checkIn.removeAttribute('max')}
    };
    const setAutoDefaults=()=>{
      if(selected||!starts.value)return;
      if(!cancel.value){cancel.value=offsetValue(starts.value,-2*60*60*1000);cancel.dataset.autoPolicy='true'}
      if(!checkIn.value){checkIn.value=offsetValue(starts.value,-60*60*1000);checkIn.dataset.autoPolicy='true'}
    };

    syncBounds();setAutoDefaults();
    if(form.dataset.operatorPolishBound==='true')return;
    form.dataset.operatorPolishBound='true';
    starts.addEventListener('input',()=>{
      syncBounds();
      if(selected)return;
      if(cancel.dataset.autoPolicy==='true')cancel.value=offsetValue(starts.value,-2*60*60*1000);
      if(checkIn.dataset.autoPolicy==='true')checkIn.value=offsetValue(starts.value,-60*60*1000);
    });
    cancel.addEventListener('input',()=>{delete cancel.dataset.autoPolicy});
    checkIn.addEventListener('input',()=>{delete checkIn.dataset.autoPolicy});
  }

  const observer=new MutationObserver(()=>polishMatchForm());
  observer.observe(root,{childList:true,subtree:true});
  polishMatchForm();
}
