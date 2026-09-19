const CACHE = 'opu-founder-df3e6ca0c9a8';
const CORE = ["/","/_next/static/AFmogaCtE05ZTq3DeuzN1/_buildManifest.js","/_next/static/AFmogaCtE05ZTq3DeuzN1/_clientMiddlewareManifest.js","/_next/static/AFmogaCtE05ZTq3DeuzN1/_ssgManifest.js","/_next/static/chunks/03cnjj9mnzy_p.js","/_next/static/chunks/03~yq9q893hmn.js","/_next/static/chunks/07lhk_q6pmm3r.js","/_next/static/chunks/0anwxxj_60gzd.css","/_next/static/chunks/0dbhjjzl8qfwv.js","/_next/static/chunks/0fjvs1suwpu9n.css","/_next/static/chunks/0fpq8qcrlys-5.js","/_next/static/chunks/0ht900cau6_ur.js","/_next/static/chunks/0sw7.pcdyi7_6.js","/_next/static/chunks/turbopack-0bxcrz71-nfi1.js","/_next/static/media/4fa387ec64143e14-s.0wkzw~je483f-.woff2","/_next/static/media/53b9e256198e5412-s.0-wfv7uh4i7h9.woff2","/_next/static/media/5ce348bf30bf5439-s.0zgw-jeven.3w.woff2","/_next/static/media/6306c77e7c8268e4-s.0rhz0arwfsn~5.woff2","/_next/static/media/7178b3e590c64307-s.0nx0ww8fni_q3.woff2","/_next/static/media/797e433ab948586e-s.p.08e28id.o-okb.woff2","/_next/static/media/7d817b4c03b0c5f1-s.0l76wvqk9d84w.woff2","/_next/static/media/8a480f0b521d4e75-s.0jzbimsg8vl84.woff2","/_next/static/media/bbc41e54d2fcbd21-s.0k4k9394f2q-k.woff2","/_next/static/media/caa3a2e1cccd8315-s.p.09~u27dqhyhd6.woff2","/_next/static/media/fef07dbb0973bf53-s.12tyk43_3sh9u.woff2","/founder-assets/ceramic-bank.png","/founder-assets/environments.png","/founder-assets/feature-module.png","/founder-assets/manifest.json","/founder-world.png","/icon-192.png","/icon-512.png","/manifest.webmanifest","/og.png","/structure-mark.png"];
// Installation is atomic: a missing file rejects the whole candidate cache.
// Never skipWaiting. Existing tabs keep their document, rules and asset version.
self.addEventListener('install', event => {
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  try{await cache.addAll(CORE);}catch(error){await caches.delete(CACHE);throw error;}
 })());
});
self.addEventListener('activate', event => {
 event.waitUntil((async()=>{
  for(const key of await caches.keys())if(key.startsWith('opu-')&&key!==CACHE)await caches.delete(key);
  await self.clients.claim();
 })());
});
self.addEventListener('fetch', event => {
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 const navigation=request.mode==='navigate';
 if(!navigation&&!CORE.includes(url.pathname))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  // HTML is paired with this worker's hashed assets, even while online.
  const cached=await cache.match(navigation?'/':url.pathname);
  if(cached)return cached;
  try{return await fetch(request);}catch{return Response.error();}
 })());
});
