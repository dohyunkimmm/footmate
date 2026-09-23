import {footmatePlatform} from './platform/application/platform.js';

/* FootMate account experience.
   Google / Kakao use the connected Supabase OAuth entrypoint.
   The local account form remains a deterministic prototype interaction. */
(function(){
  const root=document.getElementById('footmate-next');
  if(!root)return;
  const requestedMode=new URLSearchParams(location.search).get('mode');
  const isRealMode=!['guided','evidence'].includes(requestedMode);
  const SOCIAL_AUTH_ERROR_KEY='footmate:app:social-auth-error:v1';
  const SOCIAL_AUTH_PENDING_KEY='footmate:app:social-auth-pending:v1';
  let socialAuthConfig=null;
  let socialAuthLoading=null;

  const backIcon='<svg class="fm-next-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';
  const eyeIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.8 12s3.4-5.2 9.2-5.2S21.2 12 21.2 12 17.8 17.2 12 17.2 2.8 12 2.8 12Z"/><circle cx="12" cy="12" r="2.4"/></svg>';
  const mark='<svg class="fm-next-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 15.5c3.3-5.2 10.7-5.2 14 0"/><path d="M7.5 11.1 10 7.5h4l2.5 3.6"/><path d="M9.2 16.4h5.6"/><circle cx="12" cy="12" r="9"/></svg>';
  const kakao='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 4C6.9 4 3 7.1 3 10.9c0 2.4 1.6 4.5 4 5.7l-1 3.4 3.9-2.3c.7.1 1.4.2 2.1.2 5.1 0 9-3.1 9-7S17.1 4 12 4Z"/></svg>';
  const google='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.3c1.9-1.8 2.9-4.4 2.9-7.4Z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.5c-.9.6-2.1 1-3.4 1-2.6 0-4.8-1.8-5.6-4.2H3v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 13.9A6 6 0 0 1 6.1 12c0-.7.1-1.3.3-1.9V7.5H3A10 10 0 0 0 2 12c0 1.6.4 3.1 1 4.5l3.4-2.6Z"/><path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.9 1.5l2.9-2.9A9.8 9.8 0 0 0 3 7.5l3.4 2.6C7.2 7.7 9.4 5.9 12 5.9Z"/></svg>';

  function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]||char))}
  function socialError(){try{return sessionStorage.getItem(SOCIAL_AUTH_ERROR_KEY)||''}catch{return ''}}
  function setSocialError(message){try{if(message)sessionStorage.setItem(SOCIAL_AUTH_ERROR_KEY,String(message).slice(0,240));else sessionStorage.removeItem(SOCIAL_AUTH_ERROR_KEY)}catch{}}
  function showSocialError(screen,message){
    setSocialError(message);
    let error=screen.querySelector('.fm-auth-social-error');
    if(!error){
      error=document.createElement('p');
      error.className='fm-auth-social-error';
      error.setAttribute('role','alert');
      screen.querySelector('.fm-auth-sso')?.insertAdjacentElement('afterend',error);
    }
    if(error)error.textContent=message;
  }

  async function loadSocialAuthConfig(){
    if(socialAuthConfig)return socialAuthConfig;
    if(socialAuthLoading)return socialAuthLoading;
    socialAuthLoading=(async()=>{
      const controller=new AbortController();
      const timer=setTimeout(()=>controller.abort(),5000);
      try{
        const configResponse=await fetch('/api/beta-config',{headers:{accept:'application/json'},cache:'no-store',signal:controller.signal});
        const configPayload=await configResponse.json().catch(()=>({}));
        if(!configResponse.ok||!configPayload?.connected||!configPayload.url||!configPayload.publishableKey)throw new Error('backend-unavailable');
        const origin=String(configPayload.url).replace(/\/$/,'');
        const settingsResponse=await fetch(`${origin}/auth/v1/settings`,{headers:{apikey:configPayload.publishableKey,accept:'application/json'},cache:'no-store',signal:controller.signal});
        const settings=await settingsResponse.json().catch(()=>({}));
        if(!settingsResponse.ok)throw new Error('provider-settings-unavailable');
        socialAuthConfig={url:origin,publishableKey:configPayload.publishableKey,providers:{google:Boolean(settings?.external?.google),kakao:Boolean(settings?.external?.kakao)}};
        return socialAuthConfig;
      }finally{
        clearTimeout(timer);
        socialAuthLoading=null;
      }
    })();
    return socialAuthLoading;
  }

  async function authorizeProvider(screen,provider){
    const button=screen.querySelector(`[data-social-provider="${provider}"]`);
    const buttons=[...screen.querySelectorAll('[data-social-provider]')];
    buttons.forEach(item=>{item.disabled=true;item.setAttribute('aria-busy','true')});
    setSocialError('');
    try{
      const config=await loadSocialAuthConfig();
      if(!config.providers?.[provider])throw new Error('provider-disabled');
      const interaction=footmatePlatform.repositories.interaction.read({})||{};
      footmatePlatform.repositories.interaction.write({...interaction,checkoutReturnRoute:'auth'});
      try{sessionStorage.setItem(SOCIAL_AUTH_PENDING_KEY,JSON.stringify({provider,returnRoute:'checkout',startedAt:Date.now()}))}catch{}
      const url=new URL(`${config.url}/auth/v1/authorize`);
      url.searchParams.set('provider',provider);
      url.searchParams.set('redirect_to',`${location.origin}/app?oauth=1`);
      location.assign(url.toString());
    }catch(error){
      const message=error?.message==='provider-disabled'?'현재 이 소셜 로그인 연결을 사용할 수 없습니다.':'소셜 로그인 연결 상태를 확인하지 못했습니다. 잠시 후 다시 시도해주세요.';
      showSocialError(screen,message);
      buttons.forEach(item=>{item.disabled=false;item.removeAttribute('aria-busy')});
      button?.focus();
    }
  }

  function shell(title,subtitle,body,screen,panel='login'){
    const back=panel==='login'?`data-action="auth-back" aria-label="경기 상세로 돌아가기"`:`data-auth-panel="login" aria-label="로그인 화면으로 돌아가기"`;
    screen.dataset.authPanel=panel;
    screen.innerHTML=`
      <div class="fm-auth-head">
        <button class="fm-next-icon-button" type="button" ${back}>${backIcon}</button>
      </div>
      <div class="fm-auth-card">
        <div class="fm-auth-brand"><span class="fm-next-brand-mark">${mark}</span><strong>FootMate</strong></div>
        <div class="fm-auth-title"><h1>${title}</h1><p>${subtitle}</p></div>
        ${body}
      </div>`;
  }

  function loginBody(place){
    const authError=socialError();
    return `
      <form class="fm-auth-form" data-auth-form="login">
        <label class="fm-auth-field"><span>아이디</span><input name="identifier" autocomplete="username" placeholder="아이디 또는 이메일" aria-label="아이디 또는 이메일"></label>
        <label class="fm-auth-field"><span>비밀번호</span><span class="fm-auth-password"><input name="password" type="password" autocomplete="current-password" placeholder="비밀번호" aria-label="비밀번호"><button type="button" data-auth-toggle-password aria-label="비밀번호 보기">${eyeIcon}</button></span></label>
        <div class="fm-auth-options">
          <label><input type="checkbox" name="keepSignedIn"><span>로그인 상태 유지</span></label>
          <label><input type="checkbox" name="rememberId"><span>아이디 저장</span></label>
        </div>
        <button class="fm-auth-primary" type="button" data-action="sign-in" data-provider="account">로그인</button>
      </form>
      <div class="fm-auth-links" aria-label="계정 도움말">
        <button type="button" data-auth-panel="find-id">아이디 찾기</button><i aria-hidden="true"></i>
        <button type="button" data-auth-panel="find-password">비밀번호 찾기</button><i aria-hidden="true"></i>
        <button type="button" data-auth-panel="signup">회원가입</button>
      </div>
      <div class="fm-auth-divider"><span>또는</span></div>
      <div class="fm-auth-sso" aria-label="연결된 소셜 로그인">
        <button class="fm-auth-provider fm-auth-provider--kakao" type="button" data-social-provider="kakao" aria-label="카카오로 계속하기">${kakao}</button>
        <button class="fm-auth-provider fm-auth-provider--google" type="button" data-social-provider="google" aria-label="Google로 계속하기">${google}</button>
      </div>
      ${authError?`<p class="fm-auth-social-error" role="alert">${escapeHtml(authError)}</p>`:''}
      <p class="fm-auth-context">${place} 경기 선택과 플레이 설정은 로그인 후에도 그대로 유지됩니다.</p>
      <p class="fm-auth-terms">Google·Kakao는 연결된 OAuth로 이동합니다. 로그인 또는 회원가입을 진행하면 FootMate 이용약관과 개인정보 처리방침에 동의하게 됩니다.</p>`;
  }

  function signupBody(){
    return `
      <form class="fm-auth-form fm-auth-signup" data-auth-form="signup">
        <label class="fm-auth-field"><span>아이디</span><input name="signupId" autocomplete="username" placeholder="영문, 숫자 6~12자" aria-label="회원가입 아이디"></label>
        <label class="fm-auth-field"><span>비밀번호</span><span class="fm-auth-password"><input name="signupPassword" type="password" autocomplete="new-password" placeholder="영문, 숫자, 특수문자 10~15자" aria-label="회원가입 비밀번호"><button type="button" data-auth-toggle-password aria-label="비밀번호 보기">${eyeIcon}</button></span></label>
        <label class="fm-auth-field"><span>이메일 주소</span><input name="signupEmail" type="email" autocomplete="email" placeholder="'@' 포함 이메일 주소 입력" aria-label="회원가입 이메일"></label>
        <div class="fm-auth-consent">
          <label class="fm-auth-consent-all"><input type="checkbox" data-auth-all-consent><span>모두 동의합니다.</span></label>
          <label><input type="checkbox" data-auth-required-consent><span>만 14세 이상입니다.</span></label>
          <label><input type="checkbox" data-auth-required-consent><span><b>[필수]</b> 이용약관 동의</span></label>
          <label><input type="checkbox" data-auth-required-consent><span><b>[필수]</b> 개인정보 수집 및 이용동의</span></label>
          <label><input type="checkbox"><span><em>[선택]</em> 마케팅 소식 동의</span></label>
        </div>
        <button class="fm-auth-primary" type="button" data-action="sign-in" data-provider="signup" data-auth-signup-submit disabled>가입하고 계속</button>
      </form>
      <button class="fm-auth-back-link" type="button" data-auth-panel="login">이미 계정이 있어요 · 로그인</button>`;
  }

  function helperBody(kind){
    const isId=kind==='find-id';
    return `
      <form class="fm-auth-form fm-auth-helper" data-auth-form="${kind}">
        <label class="fm-auth-field"><span>${isId?'이메일 주소':'아이디 또는 이메일'}</span><input type="${isId?'email':'text'}" autocomplete="${isId?'email':'username'}" placeholder="${isId?"'@' 포함 이메일 주소 입력":'가입한 아이디 또는 이메일'}" aria-label="${isId?'아이디 찾기 이메일':'비밀번호 찾기 계정'}"></label>
        <button class="fm-auth-primary" type="button" data-auth-panel="login">확인 후 로그인으로 돌아가기</button>
      </form>
      <button class="fm-auth-back-link" type="button" data-auth-panel="login">로그인 화면으로 돌아가기</button>`;
  }

  function renderPanel(screen,panel){
    const place=screen.dataset.matchPlace||'선택한';
    if(panel==='signup'){
      shell('회원가입','경기 참가에 필요한 계정을 간단히 만들어요.',signupBody(),screen,panel);
      return;
    }
    if(panel==='find-id'){
      shell('아이디 찾기','가입할 때 사용한 이메일 주소를 입력해주세요.',helperBody('find-id'),screen,panel);
      return;
    }
    if(panel==='find-password'){
      shell('비밀번호 찾기','가입한 아이디 또는 이메일을 입력해주세요.',helperBody('find-password'),screen,panel);
      return;
    }
    shell('로그인 후 더 많은 경기를 즐겨보세요.','참가를 확정하면 결제 단계로 바로 이어집니다.',loginBody(place),screen,'login');
  }

  function wire(screen){
    screen.addEventListener('click',event=>{
      const social=event.target.closest('[data-social-provider]');
      if(social){
        event.preventDefault();
        event.stopPropagation();
        void authorizeProvider(screen,social.dataset.socialProvider);
        return;
      }
      const panelButton=event.target.closest('[data-auth-panel]');
      if(panelButton){
        event.preventDefault();
        event.stopPropagation();
        renderPanel(screen,panelButton.dataset.authPanel);
        return;
      }
      const toggle=event.target.closest('[data-auth-toggle-password]');
      if(toggle){
        event.preventDefault();
        event.stopPropagation();
        const field=toggle.closest('.fm-auth-password')?.querySelector('input');
        if(!field)return;
        const showing=field.type==='text';
        field.type=showing?'password':'text';
        toggle.setAttribute('aria-label',showing?'비밀번호 보기':'비밀번호 숨기기');
      }
    });
    screen.addEventListener('change',event=>{
      const all=screen.querySelector('[data-auth-all-consent]');
      const required=[...screen.querySelectorAll('[data-auth-required-consent]')];
      if(event.target.matches('[data-auth-all-consent]')){
        screen.querySelectorAll('.fm-auth-consent input[type="checkbox"]').forEach(input=>{input.checked=event.target.checked});
      }
      if(all&&required.length){
        all.checked=[...screen.querySelectorAll('.fm-auth-consent input[type="checkbox"]:not([data-auth-all-consent])')].every(input=>input.checked);
        const submit=screen.querySelector('[data-auth-signup-submit]');
        if(submit)submit.disabled=!required.every(input=>input.checked);
      }
    });
    screen.addEventListener('submit',event=>{
      event.preventDefault();
      const submit=screen.querySelector('[data-action="sign-in"]');
      if(submit&&!submit.disabled)submit.click();
    });
  }

  function sanitizeRealMode(){
    if(!isRealMode)return;
    root.querySelector('.fm-next-guide')?.remove();
    root.querySelector('.fm-next-mode-pill')?.remove();
  }

  function enhanceAuth(){
    const screen=root.querySelector('[data-screen="auth"]');
    if(!screen||screen.dataset.fmAuthExperience==='4')return;
    const original=screen.querySelector('.fm-next-auth-copy p')?.textContent||'';
    const place=(original.split(' 참가를 확정하려면')[0]||'선택한').trim();
    screen.dataset.fmAuthExperience='4';
    screen.dataset.matchPlace=place;
    screen.classList.add('fm-next-auth-v3');
    renderPanel(screen,'login');
    wire(screen);
  }

  const observer=new MutationObserver(()=>{
    sanitizeRealMode();
    enhanceAuth();
  });
  observer.observe(root,{childList:true,subtree:true});
  sanitizeRealMode();
  enhanceAuth();
})();

/* FootMate interaction safeguards.
   Owns validation, previous-screen return navigation, display terminology,
   check-in continuity and deterministic team-message simulation. */
(function(){
  const root=document.getElementById('footmate-next');
  if(!root)return;
  const params=new URLSearchParams(location.search);
  const mode=['guided','evidence'].includes(params.get('mode'))?params.get('mode'):'real';
  const interactionRepository=footmatePlatform.repositories.interaction;
  const BOUNDARY_COPY='실시간 위치·지도·팀 채팅·알림 backend는 연결하지 않았습니다. 상태와 복구 흐름을 검증하는 deterministic simulation입니다.';

  function interaction(){return interactionRepository.read({})||{}}
  function updateInteraction(patch){interactionRepository.write({...interaction(),...patch})}
  function clearInteraction(){interactionRepository.clear()}
  function setText(el,value){if(el&&el.textContent!==value)el.textContent=value}
  function setHtml(el,value){if(el&&el.innerHTML!==value)el.innerHTML=value}
  function displayText(value){return String(value||'').replaceAll('초중급','초급').replaceAll('중급+','고급').replaceAll('포워드','공격수')}

  function installStyles(){
    if(document.getElementById('fm-v4-release-hardening-style'))return;
    const style=document.createElement('style');
    style.id='fm-v4-release-hardening-style';
    style.textContent=`
      .fm-auth-field input[aria-invalid="true"]{border-color:#A32727!important;box-shadow:0 0 0 1px #A32727!important}
      .fm-auth-error,.fm-auth-social-error{display:block;margin-top:8px;color:#8B1F1F;font-size:12px;line-height:1.5;font-weight:700}
      .fm-auth-social-error{text-align:center}
      .fm-auth-form-error{margin:8px 0 0;color:#8B1F1F;font-size:12px;line-height:1.45;font-weight:700}
      .fm-next-checkin-complete{display:inline-flex;align-items:center;justify-content:center;min-height:44px;border:0;border-radius:14px;padding:0 18px;background:#DCE6DF;color:#315044;font-weight:800;cursor:default}
      .fm-next-checkin-note{margin-top:8px;color:#315044;font-size:13px;font-weight:700}
      .fm-next-page[data-mode="real"] .fm-ai-card.fm-ai-card--core{margin:8px 0 28px;padding:23px;border:1px solid rgba(216,255,115,.18);background:radial-gradient(circle at 94% 0%,rgba(216,255,115,.25),transparent 28%),linear-gradient(145deg,#082a1e 0%,#0e3d2d 62%,#16573f 100%);box-shadow:0 24px 54px rgba(9,46,33,.20)}
      .fm-next-page[data-mode="real"] .fm-ai-card.fm-ai-card--core .fm-ai-kicker,.fm-next-page[data-mode="real"] .fm-ai-card.fm-ai-card--core .fm-ai-head strong{color:#fff}
      .fm-next-page[data-mode="real"] .fm-ai-card.fm-ai-card--core .fm-ai-head strong{font-size:22px;letter-spacing:-.035em}
      .fm-next-page[data-mode="real"] .fm-ai-card.fm-ai-card--core .fm-ai-head p{color:rgba(255,255,255,.72);font-size:13px}
      .fm-next-page[data-mode="real"] .fm-ai-card.fm-ai-card--core .fm-ai-label{color:rgba(255,255,255,.86)}
      .fm-next-page[data-mode="real"] .fm-ai-card.fm-ai-card--core .fm-ai-mode{background:rgba(255,255,255,.12);color:#fff}
      .fm-next-page[data-mode="real"] .fm-ai-card.fm-ai-card--core .fm-ai-examples button{background:rgba(255,255,255,.10);border-color:rgba(255,255,255,.18);color:#fff}
      .fm-next-page[data-mode="real"] .fm-ai-card.fm-ai-card--core .fm-ai-status{background:#fff;color:#20372d}
      .fm-next-page[data-mode="real"] .fm-ai-card.fm-ai-card--core .fm-ai-guardrail{border-top-color:rgba(255,255,255,.16);color:rgba(255,255,255,.66)}
      .fm-next-page[data-mode="real"] .fm-next-upcoming-actions .fm-next-button--secondary{background:rgba(255,255,255,.12)!important;border-color:rgba(255,255,255,.24)!important;color:#fff!important}
      .fm-next-page[data-mode="real"] .fm-next-upcoming-actions .fm-next-button--secondary:hover{background:rgba(255,255,255,.20)!important;border-color:rgba(255,255,255,.36)!important;color:#fff!important}
      .fm-team-message-overlay{position:fixed;inset:0;z-index:120;display:grid;place-items:center;padding:20px;background:rgba(5,20,14,.52);backdrop-filter:blur(8px)}
      .fm-team-message-dialog{width:min(100%,520px);max-height:min(720px,calc(100dvh - 40px));overflow:auto;border:1px solid rgba(20,55,40,.12);border-radius:24px;padding:20px;background:#fff;color:#132019;box-shadow:0 28px 90px rgba(5,20,14,.30)}
      .fm-team-message-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.fm-team-message-head small{display:block;margin-bottom:5px;color:#1d684a;font-size:11px;font-weight:800;letter-spacing:.08em}.fm-team-message-head h2{margin:0;font-size:22px;letter-spacing:-.035em}.fm-team-message-close{width:42px;height:42px;border-radius:13px;background:#f1f5f1;color:#132019;font-size:20px;cursor:pointer}
      .fm-team-message-list{display:grid;gap:10px;margin:18px 0}.fm-team-message{display:grid;gap:4px;padding:14px 15px;border:1px solid #e4e9e1;border-radius:16px;background:#f7f9f5;color:#132019}.fm-team-message b{font-size:13px}.fm-team-message span{font-size:12px;line-height:1.55;color:#4d5f55}
      .fm-team-message-boundary{margin:0;padding-top:14px;border-top:1px dashed #d1dad3;color:#52645b;font-size:12px;line-height:1.6}.fm-team-message-done{width:100%;min-height:48px;margin-top:16px;border-radius:14px;background:#092e21;color:#fff;font-weight:800;cursor:pointer}
      @media(max-width:430px){.fm-next-page[data-mode="real"] .fm-ai-card.fm-ai-card--core{padding:19px}.fm-team-message-overlay{padding:12px}.fm-team-message-dialog{border-radius:20px;padding:17px}}
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
    const signedIn=Boolean((footmatePlatform.session.read()||{}).signedIn);
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

  function patchTerminology(){
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      const next=displayText(node.nodeValue);
      if(next!==node.nodeValue)node.nodeValue=next;
    });
    root.querySelectorAll('input[placeholder]').forEach(input=>{
      const next=displayText(input.placeholder);
      if(next!==input.placeholder)input.placeholder=next;
    });
  }

  function patchAiProminence(){
    if(mode!=='real')return;
    const home=root.querySelector('[data-screen="home"]');
    const card=home?.querySelector('[data-ai-assistant]');
    if(!home||!card)return;
    card.classList.add('fm-ai-card--core');
    card.dataset.coreFeature='true';
    const kicker=card.querySelector('.fm-ai-kicker');
    if(kicker&&kicker.textContent!=='핵심 기능 · AI Match Assistant')kicker.textContent='핵심 기능 · AI Match Assistant';
    const greeting=home.querySelector('.fm-next-greeting');
    if(greeting&&greeting.nextElementSibling!==card)greeting.after(card);
  }

  function patchCheckin(){
    const buttons=[...root.querySelectorAll('[data-action="check-in"]')];
    if(!buttons.length)return;
    const state=interaction();
    const session=footmatePlatform.session.read()||{};
    const currentMatchId=session.joinedMatchId||session.selectedMatchId||(mode==='evidence'?'evidence-match':null);
    const checkedInMatchId=state.checkedInMatchId||session.checkedInMatchId;
    if(!checkedInMatchId||checkedInMatchId!==currentMatchId)return;
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

  function openTeamMessages(){
    root.querySelector('.fm-team-message-overlay')?.remove();
    const overlay=document.createElement('div');
    overlay.className='fm-team-message-overlay';
    overlay.dataset.teamMessages='simulation';
    overlay.innerHTML=`<section class="fm-team-message-dialog" role="dialog" aria-modal="true" aria-labelledby="fm-team-message-title"><div class="fm-team-message-head"><div><small>TEAM MESSAGE · SIMULATION</small><h2 id="fm-team-message-title">팀 메시지</h2></div><button class="fm-team-message-close" type="button" data-action="close-team-messages" aria-label="팀 메시지 닫기">×</button></div><div class="fm-team-message-list"><article class="fm-team-message"><b>운영 안내</b><span>조끼는 현장에서 제공합니다.</span></article><article class="fm-team-message"><b>체크인</b><span>경기 시작 20분 전부터 체크인할 수 있습니다.</span></article><article class="fm-team-message"><b>집결 위치</b><span>메인 출입구를 지나 3층 코트 앞에서 모여주세요.</span></article></div><p class="fm-team-message-boundary">${BOUNDARY_COPY}</p><button class="fm-team-message-done" type="button" data-action="close-team-messages">확인</button></section>`;
    root.appendChild(overlay);
    overlay.querySelector('.fm-team-message-close')?.focus();
  }

  function closeTeamMessages(){
    const overlay=root.querySelector('.fm-team-message-overlay');
    if(!overlay)return;
    overlay.remove();
    root.querySelector('[data-action="team-chat"]')?.focus();
  }

  function navigateRoute(route){
    const session=footmatePlatform.session.read()||{};
    footmatePlatform.session.write({...session,route});
    location.reload();
  }

  function apply(){
    installStyles();
    patchIdentity();
    patchTerminology();
    patchAiProminence();
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

    if(action==='reset-flow'){clearInteraction();return}

    if(action==='open-match'||action==='open-joined-match'){
      const from=root.querySelector('[data-screen]')?.dataset.screen;
      if(['home','discover','schedule'].includes(from))updateInteraction({detailReturnRoute:from});
      return;
    }

    if(action==='detail-back'){
      const route=interaction().detailReturnRoute;
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

    if(action==='join-match'){
      const session=footmatePlatform.session.read()||{};
      updateInteraction({authReturnRoute:'detail',checkoutReturnRoute:session.signedIn?'detail':'auth'});
      return;
    }

    if(action==='checkout-back'){
      event.preventDefault();
      event.stopPropagation();
      navigateRoute(interaction().checkoutReturnRoute||'detail');
      return;
    }

    if(action==='check-in'){
      event.preventDefault();
      event.stopPropagation();
      const session=footmatePlatform.session.read()||{};
      const checkedInMatchId=session.joinedMatchId||session.selectedMatchId||'evidence-match';
      updateInteraction({checkedInMatchId,checkedInAt:Date.now()});
      footmatePlatform.session.write({...session,checkedInMatchId,matchStage:'matchday'});
      window.__FOOTMATE_MATCHDAY__?.setStatus?.('checked-in',{arrival:'arrived'});
      patchCheckin();
      return;
    }

    if(action==='team-chat'){
      event.preventDefault();
      event.stopPropagation();
      openTeamMessages();
      return;
    }

    if(action==='close-team-messages'){
      event.preventDefault();
      event.stopPropagation();
      closeTeamMessages();
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
        return;
      }
      if(provider==='account'||provider==='signup')updateInteraction({checkoutReturnRoute:'auth'});
    }
  },true);

  root.addEventListener('click',event=>{
    const overlay=event.target.closest('.fm-team-message-overlay');
    if(overlay&&event.target===overlay)closeTeamMessages();
  });

  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&root.querySelector('.fm-team-message-overlay'))closeTeamMessages();
  });

  let scheduled=false;
  const observer=new MutationObserver(()=>{
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;apply()});
  });
  observer.observe(root,{childList:true,subtree:true,characterData:true});
  apply();
})();
