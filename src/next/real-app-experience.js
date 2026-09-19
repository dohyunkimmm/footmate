/* FootMate Next Major Candidate · real-app interaction refinements.
   External authentication remains simulated; the UI models a production sign-in / sign-up experience. */
(function(){
  const root=document.getElementById('footmate-next');
  if(!root)return;
  const requestedMode=new URLSearchParams(location.search).get('mode');
  const isRealMode=!['guided','evidence'].includes(requestedMode);

  const backIcon='<svg class="fm-next-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';
  const eyeIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.8 12s3.4-5.2 9.2-5.2S21.2 12 21.2 12 17.8 17.2 12 17.2 2.8 12 2.8 12Z"/><circle cx="12" cy="12" r="2.4"/></svg>';
  const mark='<svg class="fm-next-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 15.5c3.3-5.2 10.7-5.2 14 0"/><path d="M7.5 11.1 10 7.5h4l2.5 3.6"/><path d="M9.2 16.4h5.6"/><circle cx="12" cy="12" r="9"/></svg>';
  const kakao='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 4C6.9 4 3 7.1 3 10.9c0 2.4 1.6 4.5 4 5.7l-1 3.4 3.9-2.3c.7.1 1.4.2 2.1.2 5.1 0 9-3.1 9-7S17.1 4 12 4Z"/></svg>';
  const apple='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.8 12.7c0-2.8 2.3-4.1 2.4-4.2-1.3-2-3.4-2.2-4.1-2.2-1.7-.2-3.4 1-4.3 1-.9 0-2.3-1-3.8-.9-1.9 0-3.7 1.1-4.7 2.8-2 3.5-.5 8.7 1.4 11.5 1 1.4 2.1 2.9 3.6 2.8 1.4-.1 2-1 3.7-1s2.2 1 3.7 1c1.5 0 2.5-1.4 3.4-2.8 1.1-1.6 1.5-3.1 1.6-3.2-.1 0-2.9-1.1-2.9-4.8ZM14 4.5c.8-1 1.3-2.3 1.2-3.5-1.2.1-2.6.8-3.4 1.7-.7.8-1.4 2.2-1.2 3.4 1.3.1 2.6-.6 3.4-1.6Z"/></svg>';
  const google='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.3c1.9-1.8 2.9-4.4 2.9-7.4Z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.5c-.9.6-2.1 1-3.4 1-2.6 0-4.8-1.8-5.6-4.2H3v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 13.9A6 6 0 0 1 6.1 12c0-.7.1-1.3.3-1.9V7.5H3A10 10 0 0 0 2 12c0 1.6.4 3.1 1 4.5l3.4-2.6Z"/><path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.9 1.5l2.9-2.9A9.8 9.8 0 0 0 3 7.5l3.4 2.6C7.2 7.7 9.4 5.9 12 5.9Z"/></svg>';

  function shell(title,subtitle,body,screen){
    screen.innerHTML=`
      <div class="fm-auth-head">
        <button class="fm-next-icon-button" type="button" data-action="auth-back" aria-label="경기 상세로 돌아가기">${backIcon}</button>
      </div>
      <div class="fm-auth-card">
        <div class="fm-auth-brand"><span class="fm-next-brand-mark">${mark}</span><strong>FootMate</strong></div>
        <div class="fm-auth-title"><h1>${title}</h1><p>${subtitle}</p></div>
        ${body}
      </div>`;
  }

  function loginBody(place){
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
      <div class="fm-auth-sso" aria-label="소셜 로그인">
        <button class="fm-auth-provider fm-auth-provider--kakao" type="button" data-action="sign-in" data-provider="kakao" aria-label="카카오로 계속하기">${kakao}</button>
        <button class="fm-auth-provider fm-auth-provider--naver" type="button" data-action="sign-in" data-provider="naver" aria-label="네이버로 계속하기"><span>N</span></button>
        <button class="fm-auth-provider fm-auth-provider--apple" type="button" data-action="sign-in" data-provider="apple" aria-label="Apple로 계속하기">${apple}</button>
        <button class="fm-auth-provider fm-auth-provider--google" type="button" data-action="sign-in" data-provider="google" aria-label="Google로 계속하기">${google}</button>
      </div>
      <p class="fm-auth-context">${place} 경기 선택과 플레이 설정은 로그인 후에도 그대로 유지됩니다.</p>
      <p class="fm-auth-terms">로그인 또는 회원가입을 진행하면 FootMate 이용약관과 개인정보 처리방침에 동의하게 됩니다.</p>`;
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
      shell('회원가입','경기 참가에 필요한 계정을 간단히 만들어요.',signupBody(),screen);
      return;
    }
    if(panel==='find-id'){
      shell('아이디 찾기','가입할 때 사용한 이메일 주소를 입력해주세요.',helperBody('find-id'),screen);
      return;
    }
    if(panel==='find-password'){
      shell('비밀번호 찾기','가입한 아이디 또는 이메일을 입력해주세요.',helperBody('find-password'),screen);
      return;
    }
    shell('로그인 후 더 많은 경기를 즐겨보세요.','참가를 확정하면 결제 단계로 바로 이어집니다.',loginBody(place),screen);
  }

  function wire(screen){
    screen.addEventListener('click',event=>{
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
    if(!screen||screen.dataset.fmAuthExperience==='3')return;
    const original=screen.querySelector('.fm-next-auth-copy p')?.textContent||'';
    const place=(original.split(' 참가를 확정하려면')[0]||'선택한').trim();
    screen.dataset.fmAuthExperience='3';
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
