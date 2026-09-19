/* FootMate Next candidate hotfix layer.
   Keeps the verified account/SSO enhancer intact and adds small state/validation fixes. */
(function(){
  const root=document.getElementById('footmate-next');
  if(!root)return;
  const params=new URLSearchParams(location.search);
  const mode=['guided','evidence'].includes(params.get('mode'))?params.get('mode'):'real';
  const SESSION_KEY='footmate:next:session';
  const HOTFIX_KEY='footmate:next:hotfix';

  function read(key){try{return JSON.parse(localStorage.getItem(key)||'{}')}catch(_error){return{}}}
  function write(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch(_error){}}
  function hotfix(){return read(HOTFIX_KEY)}
  function updateHotfix(patch){write(HOTFIX_KEY,{...hotfix(),...patch})}
  function clearHotfix(){try{localStorage.removeItem(HOTFIX_KEY)}catch(_error){}}
  function setText(el,value){if(el&&el.textContent!==value)el.textContent=value}
  function setHtml(el,value){if(el&&el.innerHTML!==value)el.innerHTML=value}

  function installStyles(){
    if(document.getElementById('fm-next-candidate-hotfix-style'))return;
    const style=document.createElement('style');
    style.id='fm-next-candidate-hotfix-style';
    style.textContent=`
      .fm-auth-field input[aria-invalid="true"]{border-color:#A32727!important;box-shadow:0 0 0 1px #A32727!important}
      .fm-auth-error{display:block;margin-top:6px;color:#8B1F1F;font-size:12px;line-height:1.45;font-weight:700}
      .fm-auth-form-error{margin:8px 0 0;color:#8B1F1F;font-size:12px;line-height:1.45;font-weight:700}
      .fm-next-checkin-complete{display:inline-flex;align-items:center;justify-content:center;min-height:44px;border:0;border-radius:14px;padding:0 18px;background:#DCE6DF;color:#315044;font-weight:800;cursor:default}
      .fm-next-checkin-note{margin-top:8px;color:#315044;font-size:13px;font-weight:700}
    `;
    document.head.appendChild(style);
  }

  function clearErrors(form){
    form?.querySelectorAll('.fm-auth-error,.fm-auth-form-error').forEach(el=>el.remove());
    form?.querySelectorAll('[aria-invalid="true"]').forEach(input=>{
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    });
  }

  function fieldError(input,message){
    if(!input)return;
    const id=`fm-auth-error-${input.name||'field'}`;
    input.setAttribute('aria-invalid','true');
    input.setAttribute('aria-describedby',id);
    const error=document.createElement('small');
    error.id=id;
    error.className='fm-auth-error';
    error.setAttribute('role','alert');
    error.textContent=message;
    (input.closest('.fm-auth-field')||input.parentElement)?.appendChild(error);
  }

  function validateLogin(screen){
    const form=screen.querySelector('[data-auth-form="login"]');
    if(!form)return true;
    clearErrors(form);
    const identifier=form.elements.identifier;
    const password=form.elements.password;
    const value=identifier?.value.trim()||'';
    let valid=true;
    if(!value){fieldError(identifier,'아이디 또는 이메일을 입력해주세요.');valid=false}
    else if(value.includes('@')&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)){fieldError(identifier,'이메일 형식을 확인해주세요.');valid=false}
    if(!password?.value){fieldError(password,'비밀번호를 입력해주세요.');valid=false}
    else if(password.value.length<8){fieldError(password,'비밀번호는 8자 이상 입력해주세요.');valid=false}
    if(!valid)form.querySelector('[aria-invalid="true"]')?.focus();
    return valid;
  }

  function validateSignup(screen){
    const form=screen.querySelector('[data-auth-form="signup"]');
    if(!form)return true;
    clearErrors(form);
    const id=form.elements.signupId;
    const password=form.elements.signupPassword;
    const email=form.elements.signupEmail;
    const required=[...form.querySelectorAll('[data-auth-required-consent]')];
    let valid=true;
    if(!/^[A-Za-z0-9]{6,12}$/.test(id?.value.trim()||'')){fieldError(id,'아이디는 영문·숫자 6~12자로 입력해주세요.');valid=false}
    const pw=password?.value||'';
    if(!(pw.length>=10&&pw.length<=15&&/[A-Za-z]/.test(pw)&&/\d/.test(pw)&&/[^A-Za-z0-9]/.test(pw))){fieldError(password,'비밀번호는 영문·숫자·특수문자를 포함한 10~15자로 입력해주세요.');valid=false}
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.value.trim()||'')){fieldError(email,'사용 가능한 이메일 주소를 입력해주세요.');valid=false}
    if(required.length&&!required.every(input=>input.checked)){
      const error=document.createElement('p');
      error.className='fm-auth-form-error';
      error.setAttribute('role','alert');
      error.textContent='필수 약관과 만 14세 이상 확인에 동의해주세요.';
      form.querySelector('.fm-auth-consent')?.appendChild(error);
      valid=false;
    }
    if(!valid)(form.querySelector('[aria-invalid="true"]')||form.querySelector('[data-auth-required-consent]:not(:checked)'))?.focus();
    return valid;
  }

  function patchIdentity(){
    if(mode!=='real')return;
    const signedIn=Boolean(read(SESSION_KEY).signedIn);
    const greeting=root.querySelector('[data-screen="home"] .fm-next-greeting');
    if(greeting){
      setText(greeting.querySelector('small'),signedIn?'다시 반가워요':'플레이 설정이 준비됐어요');
      setHtml(greeting.querySelector('h1'),signedIn?'오늘도 <span>좋은 경기 찾아볼까요?</span>':'오늘, <span>어떤 경기에서 뛸까요?</span>');
    }
    const profile=root.querySelector('[data-screen="profile"] .fm-next-profile-head');
    if(profile){
      setText(profile.querySelector('.fm-next-profile-avatar'),signedIn?'F':'?');
      setText(profile.querySelector('h2'),signedIn?'FootMate 회원':'게스트');
      setText(profile.querySelector('p'),signedIn?'계정 연결됨':'경기를 둘러보고 있어요');
    }
  }

  function patchCheckin(){
    const buttons=[...root.querySelectorAll('[data-action="check-in"]')];
    if(!buttons.length)return;
    const state=hotfix();
    if(!state.checkedInMatchId)return;
    buttons.forEach(button=>{
      const complete=document.createElement('button');
      complete.type='button';
      complete.className='fm-next-checkin-complete';
      complete.disabled=true;
      complete.setAttribute('aria-label','체크인 완료');
      complete.textContent='체크인 완료';
      button.replaceWith(complete);
    });
    const schedule=root.querySelector('[data-screen="schedule"]');
    if(schedule){
      const current=schedule.querySelector('.fm-next-status-card.is-current');
      setText(current?.querySelector('b'),'체크인 완료');
      setText(current?.querySelector('p'),'도착 확인이 완료됐어요. 경기 시작 전 준비를 확인해주세요.');
    }
    const context=root.querySelector('[data-screen="home"] .fm-next-context-card');
    if(context&&!context.querySelector('.fm-next-checkin-note')){
      const note=document.createElement('p');
      note.className='fm-next-checkin-note';
      note.setAttribute('role','status');
      note.textContent='✓ 체크인이 완료됐어요.';
      context.appendChild(note);
    }
  }

  function apply(){
    installStyles();
    patchIdentity();
    patchCheckin();
  }

  root.addEventListener('input',event=>{
    const input=event.target.closest('input[aria-invalid="true"]');
    if(!input)return;
    const id=input.getAttribute('aria-describedby');
    if(id)root.querySelector(`#${id}`)?.remove();
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
  },true);

  root.addEventListener('click',event=>{
    const target=event.target.closest('[data-action]');
    if(!target)return;
    const action=target.dataset.action;

    if(action==='reset-flow'){clearHotfix();return}

    if(action==='open-match'||action==='open-joined-match'){
      const from=root.querySelector('[data-screen]')?.dataset.screen;
      if(['home','discover','schedule'].includes(from))updateHotfix({detailReturnRoute:from});
      return;
    }

    if(action==='detail-back'){
      const route=hotfix().detailReturnRoute;
      const navAction={home:'nav-home',discover:'nav-discover',schedule:'nav-schedule'}[route];
      if(!navAction)return;
      event.preventDefault();
      event.stopPropagation();
      const relay=document.createElement('button');
      relay.hidden=true;
      relay.type='button';
      relay.dataset.action=navAction;
      root.appendChild(relay);
      relay.click();
      relay.remove();
      return;
    }

    if(action==='check-in'){
      event.preventDefault();
      event.stopPropagation();
      const session=read(SESSION_KEY);
      updateHotfix({checkedInMatchId:session.joinedMatchId||session.selectedMatchId||'evidence-match',checkedInAt:Date.now()});
      patchCheckin();
      return;
    }

    if(action==='sign-in'){
      const provider=target.dataset.provider;
      const screen=target.closest('[data-screen="auth"]');
      if(provider==='account'&&!validateLogin(screen)){
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if(provider==='signup'&&!validateSignup(screen)){
        event.preventDefault();
        event.stopPropagation();
      }
    }
  },true);

  let scheduled=false;
  const observer=new MutationObserver(()=>{
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;apply()});
  });
  observer.observe(root,{childList:true,subtree:true});
  apply();
})();
