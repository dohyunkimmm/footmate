import {loadBetaBackendConfig} from './infrastructure/supabase.js';

const root=document.getElementById('footmate-beta');
const ERROR_KEY='footmate:beta:social-auth-error:v1';

if(root){
  let config=null;
  let providers=null;
  let loading=false;
  const authError=sessionStorage.getItem(ERROR_KEY)||'';
  if(authError)sessionStorage.removeItem(ERROR_KEY);
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]||char));

  async function loadProviders(){
    if(loading||providers)return;
    loading=true;
    try{
      config=await loadBetaBackendConfig();
      const response=await fetch(`${config.url}/auth/v1/settings`,{headers:{apikey:config.publishableKey,accept:'application/json'},cache:'no-store'});
      const payload=await response.json().catch(()=>({}));
      providers={google:Boolean(payload?.external?.google),kakao:Boolean(payload?.external?.kakao)};
    }catch{providers={google:false,kakao:false}}
    finally{loading=false;renderSocial()}
  }

  function authorize(provider){
    if(!config||!providers?.[provider])return;
    const redirectTo=`${location.origin}/beta`;
    const url=new URL(`${config.url}/auth/v1/authorize`);
    url.searchParams.set('provider',provider);
    url.searchParams.set('redirect_to',redirectTo);
    sessionStorage.setItem('footmate:beta:view:v1','home');
    sessionStorage.removeItem('footmate:beta:demo-return:v1');
    location.assign(url.toString());
  }

  function renderSocial(){
    const panel=root.querySelector('#beta-auth-panel');if(!panel)return;
    const form=panel.querySelector('form[data-form="auth"]');if(!form)return;
    const enabled=['google','kakao'].filter(provider=>providers?.[provider]);
    const icons={google:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.06v2.59A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.41 13.92a6 6 0 0 1 0-3.84V7.49H3.06a10 10 0 0 0 0 9.02l3.35-2.59Z"/><path fill="#EA4335" d="M12 5.96c1.47 0 2.79.51 3.83 1.51l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.49l3.35 2.59A5.99 5.99 0 0 1 12 5.96Z"/></svg>',kakao:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#191919" d="M12 3C6.48 3 2 6.45 2 10.7c0 2.75 1.88 5.16 4.7 6.52L5.5 21l4.5-2.65c.65.1 1.32.15 2 .15 5.52 0 10-3.45 10-7.7S17.52 3 12 3Z"/></svg>'};
    const buttons=enabled.map(provider=>`<button class="fm-beta-button fm-beta-social-button" type="button" data-social-provider="${provider}" aria-label="${provider==='google'?'Google':'Kakao'}로 계속하기" title="${provider==='google'?'Google':'Kakao'}로 계속하기">${icons[provider]}<span class="fm-beta-social-name">${provider==='google'?'Google':'Kakao'}로 계속하기</span></button>`).join('');
    const status=enabled.length?buttons:'<small class="fm-beta-social-status">소셜 로그인을 사용할 수 없어요. 이메일로 로그인해주세요.</small>';
    const content=`<div class="fm-beta-social-divider"><span>또는</span></div>${authError?`<div class="fm-beta-note" data-tone="error">${esc(authError)}</div>`:''}${status}`;
    const renderKey=`${enabled.join(',')}|${authError}`;
    const existing=panel.querySelector('[data-beta-social-auth]');
    if(existing){
      if(existing.dataset.renderKey===renderKey)return;
      existing.dataset.renderKey=renderKey;
      existing.innerHTML=content;
      return;
    }
    const toggle=form;if(!toggle)return;
    toggle.insertAdjacentHTML('afterend',`<div class="fm-beta-social" data-beta-social-auth data-render-key="${esc(renderKey)}">${content}</div>`);
  }

  root.addEventListener('click',event=>{
    const target=event.target.closest('[data-social-provider]');if(!target)return;
    authorize(target.dataset.socialProvider);
  });
  const observer=new MutationObserver(()=>{renderSocial();if(!providers)void loadProviders()});
  observer.observe(root,{childList:true,subtree:true});
  void loadProviders();
}
