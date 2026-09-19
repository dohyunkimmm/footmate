/* FootMate Next Major Candidate · real-app interaction refinements.
   Keeps external authentication simulated while presenting a production-like sign-in gate. */
(function(){
  const root=document.getElementById('footmate-next');
  if(!root)return;

  const backIcon='<svg class="fm-next-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';
  const mark='<svg class="fm-next-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 15.5c3.3-5.2 10.7-5.2 14 0"/><path d="M7.5 11.1 10 7.5h4l2.5 3.6"/><path d="M9.2 16.4h5.6"/><circle cx="12" cy="12" r="9"/></svg>';
  const kakao='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 4C6.9 4 3 7.1 3 10.9c0 2.4 1.6 4.5 4 5.7l-1 3.4 3.9-2.3c.7.1 1.4.2 2.1.2 5.1 0 9-3.1 9-7S17.1 4 12 4Z"/></svg>';
  const apple='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.8 12.7c0-2.8 2.3-4.1 2.4-4.2-1.3-2-3.4-2.2-4.1-2.2-1.7-.2-3.4 1-4.3 1-.9 0-2.3-1-3.8-.9-1.9 0-3.7 1.1-4.7 2.8-2 3.5-.5 8.7 1.4 11.5 1 1.4 2.1 2.9 3.6 2.8 1.4-.1 2-1 3.7-1s2.2 1 3.7 1c1.5 0 2.5-1.4 3.4-2.8 1.1-1.6 1.5-3.1 1.6-3.2-.1 0-2.9-1.1-2.9-4.8ZM14 4.5c.8-1 1.3-2.3 1.2-3.5-1.2.1-2.6.8-3.4 1.7-.7.8-1.4 2.2-1.2 3.4 1.3.1 2.6-.6 3.4-1.6Z"/></svg>';
  const google='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.3c1.9-1.8 2.9-4.4 2.9-7.4Z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.5c-.9.6-2.1 1-3.4 1-2.6 0-4.8-1.8-5.6-4.2H3v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 13.9A6 6 0 0 1 6.1 12c0-.7.1-1.3.3-1.9V7.5H3A10 10 0 0 0 2 12c0 1.6.4 3.1 1 4.5l3.4-2.6Z"/><path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.9 1.5l2.9-2.9A9.8 9.8 0 0 0 3 7.5l3.4 2.6C7.2 7.7 9.4 5.9 12 5.9Z"/></svg>';
  const mail='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4.5 7 7.5 6 7.5-6"/></svg>';

  function enhanceAuth(){
    const screen=root.querySelector('[data-screen="auth"]');
    if(!screen||screen.dataset.fmAuthExperience==='2')return;
    const original=screen.querySelector('.fm-next-auth-copy p')?.textContent||'';
    const place=(original.split(' 참가를 확정하려면')[0]||'선택한 경기').trim();
    screen.dataset.fmAuthExperience='2';
    screen.classList.add('fm-next-auth-v2');
    screen.innerHTML=`
      <div class="fm-next-auth-v2-head">
        <button class="fm-next-icon-button" type="button" data-action="auth-back" aria-label="경기 상세로 돌아가기">${backIcon}</button>
        <span class="fm-next-auth-v2-step">참가 전 마지막 단계</span>
      </div>
      <div class="fm-next-auth-v2-body">
        <div class="fm-next-auth-v2-brand"><span class="fm-next-brand-mark">${mark}</span><b>FootMate</b></div>
        <h1>로그인하고<br>참가를 이어가세요.</h1>
        <p class="fm-next-auth-v2-lead">${place} 경기 선택은 그대로 유지돼요. 로그인하면 바로 결제 단계로 이어집니다.</p>
        <div class="fm-next-auth-v2-continuity" aria-label="현재 참가 상태">
          <span><b>✓</b> 선택한 경기 유지</span>
          <i aria-hidden="true"></i>
          <span><b>✓</b> 설정값 유지</span>
          <i aria-hidden="true"></i>
          <span><b>→</b> 결제로 계속</span>
        </div>
      </div>
      <div class="fm-next-auth-v2-actions">
        <button class="fm-next-social fm-next-social--kakao fm-next-social--primary" type="button" data-action="sign-in" data-provider="kakao">${kakao}<span>카카오로 계속하기</span></button>
        <div class="fm-next-auth-v2-alt">
          <button class="fm-next-social fm-next-social--apple" type="button" data-action="sign-in" data-provider="apple">${apple}<span>Apple</span></button>
          <button class="fm-next-social fm-next-social--google" type="button" data-action="sign-in" data-provider="google">${google}<span>Google</span></button>
        </div>
        <button class="fm-next-auth-v2-email" type="button" data-action="sign-in" data-provider="email">${mail}<span>이메일로 계속하기</span></button>
        <p class="fm-next-auth-v2-new">처음이어도 별도 회원가입 화면 없이 로그인 후 필요한 정보만 확인해요.</p>
        <p class="fm-next-auth-terms">계속하면 FootMate <a href="#" aria-label="이용약관">이용약관</a>과 <a href="#" aria-label="개인정보 처리방침">개인정보 처리방침</a>에 동의하는 것으로 간주됩니다.</p>
      </div>`;
  }

  const observer=new MutationObserver(enhanceAuth);
  observer.observe(root,{childList:true,subtree:true});
  enhanceAuth();
})();
