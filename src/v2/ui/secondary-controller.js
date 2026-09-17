export function createSecondaryController({productStore,finalRuntime}){
  const legacy=finalRuntime.legacy||{};

  function favoriteKey(){
    try{return window.FootMateScenarioAdapter?.snapshot?.().selectedMatchKey||'suwon'}catch(e){return'suwon'}
  }

  function friendId(button){
    const card=button?.parentElement;
    const text=(card?.textContent||'').replace(/\s+/g,' ');
    if(text.includes('김민수'))return'kim-minsu';
    if(text.includes('박지현'))return'park-jihyun';
    if(text.includes('이준호'))return'lee-junho';
    return null;
  }

  function setStars(value){
    const n=Math.max(0,Math.min(5,Number(value)||0));
    legacy.setStars?.(n);
    productStore.set({evalStars:n},'eval-stars');
    return n;
  }

  function toggleFavorite(button){
    const key=favoriteKey();
    legacy.toggleFavorite?.(button);
    const on=button?.getAttribute('aria-pressed')==='true';
    productStore.update(state=>{
      state.favoriteMatchKeys=(state.favoriteMatchKeys||[]).filter(item=>item!==key);
      if(on)state.favoriteMatchKeys.push(key);
    },'favorite');
    return on;
  }

  function addFriend(button){
    const id=friendId(button);
    legacy.addFriend?.(button);
    if(id){
      productStore.update(state=>{
        if(!Array.isArray(state.friendIds))state.friendIds=[];
        if(!state.friendIds.includes(id))state.friendIds.push(id);
      },'friend');
    }
    return id;
  }

  function sendChatMsg(){
    const input=document.getElementById('chatInput');
    const text=input?.innerText.trim();
    const result=legacy.sendChatMsg?.();
    if(text){
      productStore.update(state=>{
        if(!Array.isArray(state.chatMessages))state.chatMessages=[];
        state.chatMessages.push(text);
        state.chatMessages=state.chatMessages.slice(-20);
      },'chat');
    }
    return result;
  }

  function restoreFavorite(){
    const button=document.querySelector('#s-detail .detail-fav');
    if(!button)return;
    const active=(productStore.getState().favoriteMatchKeys||[]).includes(favoriteKey());
    if((button.getAttribute('aria-pressed')==='true')!==active)legacy.toggleFavorite?.(button);
  }

  function restoreFriends(){
    const saved=new Set(productStore.getState().friendIds||[]);
    document.querySelectorAll('#s-friends button').forEach(button=>{
      const id=friendId(button);
      if(id&&saved.has(id)&&(button.textContent||'').includes('추가'))legacy.addFriend?.(button);
    });
  }

  function restoreChat(){
    const wrap=document.getElementById('chat-messages-wrap');
    if(!wrap||wrap.querySelector('[data-fm-saved-chat]'))return;
    for(const text of productStore.getState().chatMessages||[]){
      const bubble=document.createElement('div');
      bubble.dataset.fmSavedChat='true';
      bubble.className='fm-saved-chat';
      const body=document.createElement('div');
      body.className='fm-saved-chat-body';
      body.textContent=String(text);
      bubble.appendChild(body);
      wrap.appendChild(bubble);
    }
  }

  function restoreStars(){
    const value=Number(productStore.getState().evalStars)||0;
    if(value)legacy.setStars?.(value);
  }

  function bind(){
    document.querySelectorAll('#evalStars .eval-star').forEach((button,index)=>{
      button.removeAttribute('onclick');
      button.onclick=null;
      if(button.dataset.v2SecondaryBound==='true')return;
      button.dataset.v2SecondaryBound='true';
      button.addEventListener('click',()=>setStars(index+1));
    });

    const favorite=document.querySelector('#s-detail .detail-fav');
    if(favorite){
      favorite.removeAttribute('onclick');
      favorite.onclick=null;
      if(favorite.dataset.v2SecondaryBound!=='true'){
        favorite.dataset.v2SecondaryBound='true';
        favorite.addEventListener('click',()=>toggleFavorite(favorite));
      }
    }

    document.querySelectorAll('#s-friends button[onclick*="addFriend"],#s-friends button[data-v2-friend]').forEach(button=>{
      button.removeAttribute('onclick');
      button.onclick=null;
      button.dataset.v2Friend='true';
      if(button.dataset.v2SecondaryBound==='true')return;
      button.dataset.v2SecondaryBound='true';
      button.addEventListener('click',()=>addFriend(button));
    });

    const send=document.querySelector('.chat-send-button');
    if(send){
      send.removeAttribute('onclick');
      send.onclick=null;
      if(send.dataset.v2SecondaryBound!=='true'){
        send.dataset.v2SecondaryBound='true';
        send.addEventListener('click',sendChatMsg);
      }
    }

    const input=document.getElementById('chatInput');
    if(input){
      input.removeAttribute('onkeydown');
      input.onkeydown=null;
      if(input.dataset.v2SecondaryBound!=='true'){
        input.dataset.v2SecondaryBound='true';
        input.addEventListener('keydown',event=>{
          if(event.key==='Enter'&&!event.isComposing&&event.keyCode!==229){
            event.preventDefault();
            sendChatMsg();
          }
        });
      }
    }
  }

  function onScreen(screenId){
    bind();
    if(screenId==='s-detail')restoreFavorite();
    if(screenId==='s-friends')restoreFriends();
    if(screenId==='s-chat')restoreChat();
    if(screenId==='s-eval')restoreStars();
  }

  window.setStars=setStars;
  window.toggleFavorite=toggleFavorite;
  window.addFriend=addFriend;
  window.sendChatMsg=sendChatMsg;

  bind();
  return{onScreen,bind,setStars,toggleFavorite,addFriend,sendChatMsg};
}
