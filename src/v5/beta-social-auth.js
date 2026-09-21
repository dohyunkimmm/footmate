import {loadBetaBackendConfig} from './infrastructure/supabase-beta.js';

const root=document.getElementById('footmate-beta');
const ERROR_KEY='footmate:beta:social-auth-error:v1';

if(root){
  let config=null;
  let providers=null;
  let loading=false;
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
    location.assign(url.toString());
  }

  function renderSocial(){
    const panel=root.querySelector('#beta-auth-panel');
    if(!panel||panel.querySelector('[data-beta-social-auth]'))return;
    const form=panel.querySelector('form[data-form="auth"]');if(!form)return;
    const enabled=['google','kakao'].filter(provider=>providers?.[provider]);
    const error=sessionStorage.getItem(ERROR_KEY);if(error)sessionStorage.removeItem(ERROR_KEY);
    const buttons=enabled.map(provider=>`<button class="fm-beta-button fm-beta-social-button" type="button" data-social-provider="${provider}">${provider==='google'?'Google':'Kakao'}로 계속하기</button>`).join('');
    const status=enabled.length?buttons:'<small class="fm-beta-social-status">Google · Kakao 로그인은 provider 설정이 완료되면 자동으로 활성화됩니다.</small>';
    const html=`<div class="fm-beta-social" data-beta-social-auth><div class="fm-beta-social-divider"><span>또는</span></div>${error?`<div class="fm-beta-note" data-tone="error">${esc(error)}</div>`:''}${status}</div>`;
    form.querySelector('[data-action="toggle-auth"]')?.insertAdjacentHTML('beforebegin',html);
  }

  root.addEventListener('click',event=>{
    const target=event.target.closest('[data-social-provider]');if(!target)return;
    authorize(target.dataset.socialProvider);
  });
  const observer=new MutationObserver(()=>{renderSocial();if(!providers)void loadProviders()});
  observer.observe(root,{childList:true,subtree:true});
  void loadProviders();
}
