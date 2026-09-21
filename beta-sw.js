self.addEventListener('push',event=>{
  let payload={};
  try{payload=event.data?.json?.()||{}}catch{payload={body:event.data?.text?.()||''}}
  const title=String(payload.title||'FootMate');
  const options={
    body:String(payload.body||''),
    icon:'/favicon.svg',
    badge:'/favicon.svg',
    tag:String(payload.tag||'footmate-beta'),
    data:{url:String(payload.url||'/beta')}
  };
  event.waitUntil(self.registration.showNotification(title,options));
});

self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const target=new URL(String(event.notification?.data?.url||'/beta'),self.location.origin).href;
  event.waitUntil((async()=>{
    const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of windows){
      if(client.url.startsWith(self.location.origin)&&'focus' in client){
        if('navigate' in client&&client.url!==target)await client.navigate(target);
        return client.focus();
      }
    }
    return self.clients.openWindow?self.clients.openWindow(target):null;
  })());
});
