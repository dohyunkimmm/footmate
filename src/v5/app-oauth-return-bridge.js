(()=>{
  const PENDING_KEY='footmate:app:oauth-pending:v1';
  if(!sessionStorage.getItem(PENDING_KEY))return;
  const query=new URLSearchParams(location.search);
  const hash=new URLSearchParams(location.hash.replace(/^#/,''));
  const hasCallback=Boolean(hash.get('access_token')||hash.get('error')||hash.get('error_description')||query.get('code')||query.get('error')||query.get('error_description'));
  if(!hasCallback)return;
  const target=new URL('/app',location.origin);
  target.searchParams.set('oauth_return','1');
  target.searchParams.set('resume','1');
  for(const key of ['code','error','error_description']){
    const value=query.get(key);
    if(value)target.searchParams.set(key,value);
  }
  target.hash=location.hash;
  location.replace(`${target.pathname}${target.search}${target.hash}`);
})();
