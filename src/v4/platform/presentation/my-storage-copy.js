const root=document.getElementById('footmate-next');
const STORAGE_COPY='저장한 설정은 이 브라우저에만 저장되며 다른 기기와 동기화되지 않습니다.';

function syncStorageCopy(){
  if(!root?.querySelector('.fm-next-page[data-mode="real"]'))return;
  const profile=root.querySelector('[data-screen="profile"]');
  const boundary=profile?.querySelector('.fm-personalization-boundary');
  const saveCta=profile?.querySelector('button[data-personalization-action="save-profile"]');
  if(boundary&&boundary.textContent!==STORAGE_COPY)boundary.textContent=STORAGE_COPY;
  if(saveCta&&saveCta.style.width!=='100%')saveCta.style.width='100%';
}

if(root){
  new MutationObserver(syncStorageCopy).observe(root,{childList:true,subtree:true});
  queueMicrotask(syncStorageCopy);
}
