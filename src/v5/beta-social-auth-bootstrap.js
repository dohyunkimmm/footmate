(()=>{
  const SESSION_KEY='footmate:beta:auth:v1';
  const ERROR_KEY='footmate:beta:social-auth-error:v1';
  const params=new URLSearchParams(String(location.hash||'').replace(/^#/,''));
  if(!params.size||params.get('type')==='recovery')return;
  const error=String(params.get('error_description')||params.get('error')||'').trim();
  const accessToken=String(params.get('access_token')||'').trim();
  const refreshToken=String(params.get('refresh_token')||'').trim();
  if(error){sessionStorage.setItem(ERROR_KEY,error.slice(0,240));history.replaceState(null,'',location.pathname+location.search);return}
  if(!accessToken||!refreshToken)return;
  const expiresIn=Number(params.get('expires_in')||3600)||3600;
  localStorage.setItem(SESSION_KEY,JSON.stringify({accessToken,refreshToken,expiresAt:Math.floor(Date.now()/1000)+expiresIn}));
  sessionStorage.removeItem(ERROR_KEY);
  history.replaceState(null,'',location.pathname+location.search);
})();
