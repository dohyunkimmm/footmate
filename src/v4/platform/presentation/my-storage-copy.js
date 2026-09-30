const root=document.getElementById('footmate-next');
const STORAGE_COPY='저장한 추천 선호는 이 기기의 체험 환경에만 유지돼요.';

function syncStorageCopy(){
  if(!root?.querySelector('.fm-next-page[data-mode="real"]'))return;
  const profile=root.querySelector('[data-screen="profile"]');
  const boundary=profile?.querySelector('.fm-personalization-boundary');
  const head=profile?.querySelector('.fm-personalization-panel--profile .fm-personalization-head');
  const saveCta=head?.querySelector('button[data-personalization-action="save-profile"]');
  if(boundary&&boundary.textContent!==STORAGE_COPY)boundary.textContent=STORAGE_COPY;
  if(saveCta){head.style.gridTemplateColumns='minmax(0,1fr)';saveCta.style.width='100%'}
}

if(root){
  new MutationObserver(syncStorageCopy).observe(root,{childList:true,subtree:true});
  queueMicrotask(syncStorageCopy);
}
