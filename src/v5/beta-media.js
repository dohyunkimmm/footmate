import {loadBetaBackendConfig} from './infrastructure/supabase-beta.js';

const userRoot=document.getElementById('footmate-beta');
const operatorRoot=document.getElementById('footmate-beta-operator');
const SESSION_KEY='footmate:beta:auth:v1';
const MAX_BYTES=5*1024*1024;
const MIME_EXT={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};

let config=null;
const readSession=()=>{try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}};
const token=()=>String(readSession()?.accessToken||'').trim();
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]||char));
async function ensureConfig(){if(!config)config=await loadBetaBackendConfig();return config}
async function jsonResponse(response){const payload=await response.json().catch(()=>null);if(!response.ok)throw new Error(payload?.message||payload?.error_description||payload?.error||`요청 실패 (${response.status})`);return payload}
async function request(path,{method='GET',body,headers={}}={}){
  const current=await ensureConfig();const accessToken=token();if(!accessToken)throw new Error('로그인이 필요합니다.');
  return fetch(`${current.url}${path}`,{method,cache:'no-store',headers:{apikey:current.publishableKey,authorization:`Bearer ${accessToken}`,accept:'application/json',...headers},body}).then(jsonResponse);
}
function objectUrl(path){
  if(!path||!config)return '';
  const encoded=String(path).split('/').map(encodeURIComponent).join('/');
  return `${config.url}/storage/v1/object/public/beta-media/${encoded}`;
}
function validateFile(file){
  if(!file)throw new Error('이미지 파일을 선택해주세요.');
  if(!MIME_EXT[file.type])throw new Error('JPG, PNG, WebP 이미지만 업로드할 수 있습니다.');
  if(file.size>MAX_BYTES)throw new Error('이미지는 5MB 이하만 업로드할 수 있습니다.');
  return MIME_EXT[file.type];
}
async function upload(path,file){
  const current=await ensureConfig();const accessToken=token();if(!accessToken)throw new Error('로그인이 필요합니다.');
  const encoded=path.split('/').map(encodeURIComponent).join('/');
  const response=await fetch(`${current.url}/storage/v1/object/beta-media/${encoded}`,{
    method:'POST',body:file,headers:{apikey:current.publishableKey,authorization:`Bearer ${accessToken}`,'content-type':file.type,'x-upsert':'true'}
  });
  if(!response.ok){const payload=await response.json().catch(()=>null);throw new Error(payload?.message||payload?.error||`이미지 업로드 실패 (${response.status})`)}
}
async function removeObject(path){
  if(!path)return;
  const current=await ensureConfig();const accessToken=token();if(!accessToken)return;
  const encoded=path.split('/').map(encodeURIComponent).join('/');
  await fetch(`${current.url}/storage/v1/object/beta-media/${encoded}`,{method:'DELETE',headers:{apikey:current.publishableKey,authorization:`Bearer ${accessToken}`}}).catch(()=>null);
}

if(userRoot){
  let userId='';let avatarPath='';let loadedToken='';let loading=false;let busy=false;let error='';
  const panel=()=>userRoot.querySelector('[data-beta-avatar-panel]');
  async function load(){
    const accessToken=token();if(!accessToken||loading)return;
    if(loadedToken===accessToken)return;
    loading=true;error='';
    try{
      await ensureConfig();
      const userPayload=await request('/auth/v1/user');
      const user=userPayload?.user||userPayload;userId=String(user?.id||'');
      if(!userId)throw new Error('사용자 정보를 확인하지 못했습니다.');
      const query=new URLSearchParams({select:'avatar_path',id:`eq.${userId}`,limit:'1'});
      const rows=await request(`/rest/v1/profiles?${query}`);avatarPath=String(rows?.[0]?.avatar_path||'');loadedToken=accessToken;
    }catch(err){error=String(err?.message||err)}finally{loading=false;render()}
  }
  function render(){
    const form=userRoot.querySelector('form[data-form="profile"]');
    if(!form){panel()?.remove();loadedToken='';userId='';avatarPath='';return}
    const host=form.closest('.fm-beta-panel')||form.parentElement;if(!host)return;
    const preview=avatarPath?`<img class="fm-beta-media-preview fm-beta-media-preview--avatar" src="${esc(objectUrl(avatarPath))}" alt="현재 프로필 이미지">`:`<div class="fm-beta-media-placeholder">프로필 이미지 없음</div>`;
    const html=`<div class="fm-beta-enhancement fm-beta-media" data-beta-avatar-panel><div class="fm-beta-media-copy"><strong>프로필 이미지</strong><span>JPG · PNG · WebP, 최대 5MB</span>${error?`<small data-tone="error">${esc(error)}</small>`:''}</div>${preview}<input class="fm-beta-media-input" type="file" accept="image/jpeg,image/png,image/webp" aria-label="프로필 이미지 파일" data-beta-avatar-file><div class="fm-beta-actions"><button class="fm-beta-button" type="button" data-action="upload-beta-avatar" ${busy||!userId?'disabled':''}>${busy?'저장 중':'이미지 저장'}</button>${avatarPath?`<button class="fm-beta-link" type="button" data-action="remove-beta-avatar" ${busy?'disabled':''}>이미지 제거</button>`:''}</div></div>`;
    const existing=panel();if(existing){existing.outerHTML=html}else host.insertAdjacentHTML('beforeend',html);
  }
  userRoot.addEventListener('click',async event=>{
    const uploadButton=event.target.closest('[data-action="upload-beta-avatar"]');
    const removeButton=event.target.closest('[data-action="remove-beta-avatar"]');
    if(!uploadButton&&!removeButton)return;
    const selectedFile=uploadButton?panel()?.querySelector('[data-beta-avatar-file]')?.files?.[0]:null;
    busy=true;error='';render();
    try{
      if(uploadButton){
        const ext=validateFile(selectedFile);
        const path=`profiles/${userId}/avatar.${ext}`;await upload(path,selectedFile);
        const query=new URLSearchParams({id:`eq.${userId}`});
        await request(`/rest/v1/profiles?${query}`,{method:'PATCH',headers:{'content-type':'application/json',prefer:'return=minimal'},body:JSON.stringify({avatar_path:path})});
        if(avatarPath&&avatarPath!==path)await removeObject(avatarPath);avatarPath=path;
      }else{
        const old=avatarPath;const query=new URLSearchParams({id:`eq.${userId}`});
        await request(`/rest/v1/profiles?${query}`,{method:'PATCH',headers:{'content-type':'application/json',prefer:'return=minimal'},body:JSON.stringify({avatar_path:null})});
        avatarPath='';await removeObject(old);
      }
    }catch(err){error=String(err?.message||err)}finally{busy=false;render()}
  });
  const observer=new MutationObserver(()=>{
    const hasForm=Boolean(userRoot.querySelector('form[data-form="profile"]'));
    if(!hasForm){panel()?.remove();loadedToken='';return}
    if(!panel())render();
    if(token()!==loadedToken)void load();
  });
  observer.observe(userRoot,{childList:true,subtree:true});
  render();void load();
}

if(operatorRoot){
  const cache=new Map();const loading=new Set();let busy=false;let error='';
  const selectedMatchId=()=>String(operatorRoot.querySelector('[data-action="select-match"][aria-current="true"]')?.dataset?.matchId||'');
  const panel=()=>operatorRoot.querySelector('[data-beta-match-media-panel]');
  async function loadMatch(matchId){
    if(!matchId||cache.has(matchId)||loading.has(matchId)||!token())return;
    loading.add(matchId);
    try{
      await ensureConfig();const query=new URLSearchParams({select:'image_path',id:`eq.${matchId}`,limit:'1'});
      const rows=await request(`/rest/v1/matches?${query}`);cache.set(matchId,String(rows?.[0]?.image_path||''));
    }catch(err){error=String(err?.message||err)}finally{loading.delete(matchId);renderOperator()}
  }
  function renderOperator(){
    const form=operatorRoot.querySelector('form[data-form="match"]');if(!form){panel()?.remove();return}
    const matchId=selectedMatchId();const path=matchId?String(cache.get(matchId)||''):'';
    const preview=path?`<img class="fm-beta-media-preview" src="${esc(objectUrl(path))}" alt="현재 경기장 이미지">`:`<div class="fm-beta-media-placeholder">${matchId?'경기장 이미지 없음':'경기를 먼저 저장하고 선택해주세요.'}</div>`;
    const html=`<div class="fm-beta-enhancement fm-beta-media" data-beta-match-media-panel><div class="fm-beta-media-copy"><strong>경기장 이미지</strong><span>공개 경기 카드에 사용할 이미지 · JPG/PNG/WebP · 최대 5MB</span>${error?`<small data-tone="error">${esc(error)}</small>`:''}</div>${preview}<input class="fm-beta-media-input" type="file" accept="image/jpeg,image/png,image/webp" aria-label="경기장 이미지 파일" data-beta-match-file ${!matchId?'disabled':''}><div class="fm-beta-actions"><button class="fm-beta-button" type="button" data-action="upload-beta-match-image" ${busy||!matchId?'disabled':''}>${busy?'저장 중':'이미지 저장'}</button>${path?`<button class="fm-beta-link" type="button" data-action="remove-beta-match-image" ${busy?'disabled':''}>이미지 제거</button>`:''}</div></div>`;
    const existing=panel();if(existing){existing.outerHTML=html}else{
      const note=form.querySelector('.fm-beta-note');if(note)note.insertAdjacentHTML('beforebegin',html);else form.insertAdjacentHTML('beforeend',html);
    }
    if(matchId&&!cache.has(matchId))void loadMatch(matchId);
  }
  operatorRoot.addEventListener('click',async event=>{
    const uploadButton=event.target.closest('[data-action="upload-beta-match-image"]');
    const removeButton=event.target.closest('[data-action="remove-beta-match-image"]');
    if(!uploadButton&&!removeButton)return;
    const matchId=selectedMatchId();if(!matchId)return;
    const selectedFile=uploadButton?panel()?.querySelector('[data-beta-match-file]')?.files?.[0]:null;
    busy=true;error='';renderOperator();
    try{
      const old=String(cache.get(matchId)||'');
      if(uploadButton){
        const ext=validateFile(selectedFile);
        const path=`matches/${matchId}/cover.${ext}`;await upload(path,selectedFile);
        const query=new URLSearchParams({id:`eq.${matchId}`});
        await request(`/rest/v1/matches?${query}`,{method:'PATCH',headers:{'content-type':'application/json',prefer:'return=minimal'},body:JSON.stringify({image_path:path})});
        cache.set(matchId,path);if(old&&old!==path)await removeObject(old);
      }else{
        const query=new URLSearchParams({id:`eq.${matchId}`});
        await request(`/rest/v1/matches?${query}`,{method:'PATCH',headers:{'content-type':'application/json',prefer:'return=minimal'},body:JSON.stringify({image_path:null})});
        cache.set(matchId,'');await removeObject(old);
      }
    }catch(err){error=String(err?.message||err)}finally{busy=false;renderOperator()}
  });
  const observer=new MutationObserver(()=>{
    if(operatorRoot.dataset.operatorState!=='ready'){panel()?.remove();return}
    if(!panel())renderOperator();
    const matchId=selectedMatchId();if(matchId&&!cache.has(matchId))void loadMatch(matchId);
  });
  observer.observe(operatorRoot,{childList:true,subtree:true,attributes:true,attributeFilter:['aria-current','data-operator-state']});
  renderOperator();
}
