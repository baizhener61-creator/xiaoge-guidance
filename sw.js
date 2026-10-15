const CACHE='xiaoge-guide-v4-moonlight';
const cards=[...Array.from({length:22},(_,i)=>`major-${i}`),...['wands','cups','swords','pentacles'].flatMap(s=>Array.from({length:14},(_,i)=>`${s}-${i+1}`))];
const ASSETS=['./','./index.html','./styles.css','./src/app.js','./src/oracle.mjs','./src/scenarios.mjs','./src/quick-start.mjs','./src/content/tarot.mjs','./src/content/hexagram-notes.mjs','./src/content/iching.json','./manifest.webmanifest','./assets/icon.svg','./assets/icon-192.png','./assets/icon-512.png','./assets/apple-touch-icon.png',...cards.map(id=>`./assets/tarot/${id}.jpg`)];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('xiaoge-guide-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
 event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}return response;}).catch(()=>event.request.mode==='navigate'?caches.match('./index.html'):Response.error())));
});
