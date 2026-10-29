self.addEventListener('install',()=>self.skipWaiting())
self.addEventListener('activate',e=>e.waitUntil(clients.claim()))
self.addEventListener('fetch',()=>{}) // makes the app installable
// Receives pushes while the app is closed and shows a persistent "ring" notification.
self.addEventListener('push',e=>{
  const p=e.data?e.data.json():{},d=p.data||p
  e.waitUntil((async()=>{
    const open=await clients.matchAll({type:'window',includeUncontrolled:true})
    if(open.some(c=>c.visibilityState==='visible'))return // app is on screen: in-app ring handles it
    await self.registration.showNotification(d.title||'Ring ring! 💕',{
      body:d.body||'Your person is calling you',icon:'/icon-192.png',badge:'/icon-192.png',
      tag:'ring',renotify:true,requireInteraction:true,
      vibrate:[400,200,400,200,400,200,800],data:{url:'/?corner=1'}})
  })())
})
self.addEventListener('notificationclick',e=>{
  e.notification.close()
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{
    const c=l.find(x=>'focus' in x);return c?c.focus():clients.openWindow('/?corner=1')}))
})
