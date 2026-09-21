(()=>{
  const SESSION_KEY='footmate:beta:auth:v1';
  const RECOVERY_KEY='footmate:beta:recovery:v1';
  const params=new URLSearchParams(String(location.hash||'').replace(/^#/,''));
  if(params.get('type')!=='recovery')return;
  const accessToken=String(params.get('access_token')||'').trim();
  const refreshToken=String(params.get('refresh_token')||'').trim();
  if(!accessToken||!refreshToken)return;
  const expiresIn=Number(params.get('expires_in')||3600)||3600;
  localStorage.setItem(SESSION_KEY,JSON.stringify({accessToken,refreshToken,expiresAt:Math.floor(Date.now()/1000)+expiresIn}));
  sessionStorage.setItem(RECOVERY_KEY,'1');
})();
