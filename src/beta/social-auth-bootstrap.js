(()=>{
  const SESSION_KEY='footmate:beta:auth:v1';
  const ERROR_KEY='footmate:beta:social-auth-error:v1';
  const params=new URLSearchParams(String(location.hash||'').replace(/^#/,''));
  if(!params.size||params.get('type')==='recovery')return;
  const decode=value=>{try{return decodeURIComponent(String(value||'').replace(/\+/g,' '))}catch{return String(value||'')}};
  const friendlyAuthError=value=>{
    const raw=decode(value).trim();
    if(/unable to exchange external code|invalid_client|client secret is invalid/i.test(raw))return '소셜 로그인 연결을 완료하지 못했습니다. 잠시 후 다시 시도해주세요.';
    if(/access_denied|user denied|cancel/i.test(raw))return '소셜 로그인이 취소되었습니다.';
    return raw||'소셜 로그인을 완료하지 못했습니다. 다시 시도해주세요.';
  };
  const error=String(params.get('error_description')||params.get('error')||'').trim();
  const accessToken=String(params.get('access_token')||'').trim();
  const refreshToken=String(params.get('refresh_token')||'').trim();
  if(error){sessionStorage.setItem(ERROR_KEY,friendlyAuthError(error).slice(0,240));history.replaceState(null,'',location.pathname+location.search);return}
  if(!accessToken||!refreshToken)return;
  const expiresIn=Number(params.get('expires_in')||3600)||3600;
  localStorage.setItem(SESSION_KEY,JSON.stringify({accessToken,refreshToken,expiresAt:Math.floor(Date.now()/1000)+expiresIn}));
  sessionStorage.removeItem(ERROR_KEY);
  history.replaceState(null,'',location.pathname+location.search);
})();
