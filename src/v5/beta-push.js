import {loadBetaBackendConfig} from './infrastructure/supabase-beta.js';

const root=document.getElementById('footmate-beta');
const SESSION_KEY='footmate:beta:auth:v1';

if(root){
  let config=null;
  let publicKey='';
  let registration=null;
  let subscription=null;
  let busy=false;
  let error='';
  let refreshing=false;
  let loadedToken='';

  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]||char));
  const readSession=()=>{try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}};
  const supported=()=>Boolean('serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window);
  const token=()=>String(readSession()?.accessToken||'').trim();
  const headers=(extra={})=>({apikey:config.publishableKey,accept:'application/json',authorization:`Bearer ${token()}`,...extra});
  const parse=async response=>{const payload=await response.json().catch(()=>null);if(!response.ok)throw new Error(payload?.message||payload?.error_description||payload?.error||`요청 실패 (${response.status})`);return payload};
  const request=(path,options={})=>fetch(`${config.url}${path}`,{cache:'no-store',...options,headers:{...headers(),...(options.headers||{})}}).then(parse);
  const publicUrlKey=value=>{
    const padding='='.repeat((4-value.length%4)%4);
    const base64=(value+padding).replace(/-/g,'+').replace(/_/g,'/');
    const raw=atob(base64);const output=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)output[i]=raw.charCodeAt(i);return output;
  };

  async function ensureConfig(){
    if(!config)config=await loadBetaBackendConfig();
    if(!publicKey&&token()){
      const response=await fetch(`${config.url}/rest/v1/rpc/get_beta_push_public_key`,{method:'POST',headers:headers({'content-type':'application/json'}),body:'{}',cache:'no-store'});
      const payload=await parse(response);publicKey=String(payload||'').trim();
    }
  }

  async function ensureRegistration(){
    if(!registration)registration=await navigator.serviceWorker.register('/beta-sw.js',{scope:'/beta'});
    return registration;
  }

  async function currentUser(){
    const payload=await request('/auth/v1/user');
    return payload?.user||payload;
  }

  async function storeSubscription(value){
    const user=await currentUser();
    const json=value.toJSON();
    const body={
      user_id:user.id,
      endpoint:json.endpoint,
      p256dh:json.keys?.p256dh,
      auth:json.keys?.auth,
      user_agent:String(navigator.userAgent||'').slice(0,300),
      updated_at:new Date().toISOString(),
      last_error:null
    };
    const query=new URLSearchParams({on_conflict:'endpoint'});
    await request(`/rest/v1/beta_push_subscriptions?${query}`,{
      method:'POST',headers:{'content-type':'application/json',prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(body)
    });
  }

  async function removeStoredSubscription(endpoint){
    const query=new URLSearchParams({endpoint:`eq.${endpoint}`});
    await request(`/rest/v1/beta_push_subscriptions?${query}`,{method:'DELETE',headers:{prefer:'return=minimal'}});
  }

  function panel(){return root.querySelector('[data-beta-push-panel]')}
  function render(){
    const profileForm=root.querySelector('form[data-form="profile"]');
    if(!profileForm){panel()?.remove();return}
    const host=profileForm.closest('.fm-beta-panel')||profileForm.parentElement;if(!host)return;
    const permission=supported()?Notification.permission:'unsupported';
    const active=Boolean(subscription);
    const title=active?'브라우저 알림 켜짐':'브라우저 알림';
    const description=!supported()
      ?'이 브라우저는 Web Push를 지원하지 않습니다.'
      :!publicKey
        ?'Web Push 서버 설정을 확인하고 있습니다.'
        :active
          ?'경기 상태와 운영 알림을 이 기기에서도 받을 수 있습니다.'
          :permission==='denied'
            ?'브라우저 설정에서 알림 권한을 다시 허용해야 합니다.'
            :'원할 때만 권한을 요청하며, 언제든 이 기기 알림을 끌 수 있습니다.';
    const action=active
      ?`<button class="fm-beta-button" type="button" data-action="disable-beta-push" ${busy?'disabled':''}>이 기기 알림 끄기</button>`
      :`<button class="fm-beta-button" type="button" data-action="enable-beta-push" ${busy||!supported()||!publicKey||permission==='denied'?'disabled':''}>${busy?'처리 중':'브라우저 알림 켜기'}</button>`;
    const html=`<div class="fm-beta-enhancement" data-beta-push-panel><div><strong>${esc(title)}</strong><span>${esc(description)}</span>${error?`<small data-tone="error">${esc(error)}</small>`:''}</div>${action}</div>`;
    const existing=panel();if(existing){existing.outerHTML=html;return}
    host.insertAdjacentHTML('beforeend',html);
  }

  async function refresh(){
    const accessToken=token();
    if(refreshing||!accessToken||loadedToken===accessToken)return;
    refreshing=true;error='';
    try{
      if(!supported()){render();return}
      await ensureConfig();
      const reg=await ensureRegistration();
      subscription=await reg.pushManager.getSubscription();
      if(subscription)await storeSubscription(subscription);
    }catch(err){error=String(err?.message||err)}
    finally{loadedToken=accessToken;refreshing=false;render()}
  }

  root.addEventListener('click',async event=>{
    const enable=event.target.closest('[data-action="enable-beta-push"]');
    const disable=event.target.closest('[data-action="disable-beta-push"]');
    if(!enable&&!disable)return;
    busy=true;error='';render();
    try{
      await ensureConfig();const reg=await ensureRegistration();
      if(enable){
        const permission=await Notification.requestPermission();
        if(permission!=='granted')throw new Error('알림 권한이 허용되지 않았습니다.');
        subscription=await reg.pushManager.getSubscription()||await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:publicUrlKey(publicKey)});
        await storeSubscription(subscription);
      }else if(disable){
        subscription=await reg.pushManager.getSubscription();
        if(subscription){await removeStoredSubscription(subscription.endpoint);await subscription.unsubscribe()}
        subscription=null;
      }
    }catch(err){error=String(err?.message||err)}
    finally{busy=false;render()}
  });

  const observer=new MutationObserver(()=>{
    const hasProfile=Boolean(root.querySelector('form[data-form="profile"]'));
    if(!hasProfile){panel()?.remove();loadedToken='';subscription=null;return}
    if(!panel())render();
    if(token()&&token()!==loadedToken)void refresh();
  });
  observer.observe(root,{childList:true,subtree:true});
  render();void refresh();
}
