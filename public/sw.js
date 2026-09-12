const CACHE = 'opu-founder-1f7a697cd59c';
const BUILD_ASSETS = ["/_next/static/Si5R1OyEDUpMLUgCQLcmC/_buildManifest.js","/_next/static/Si5R1OyEDUpMLUgCQLcmC/_clientMiddlewareManifest.js","/_next/static/Si5R1OyEDUpMLUgCQLcmC/_ssgManifest.js","/_next/static/chunks/00z4lrslsk~mx.css","/_next/static/chunks/03~yq9q893hmn.js","/_next/static/chunks/06tvq0n1.61cc.js","/_next/static/chunks/09a~kdz.x6-.h.js","/_next/static/chunks/0fjvs1suwpu9n.css","/_next/static/chunks/0ji1766p81z6m.js","/_next/static/chunks/0jn2r15sm1x88.js","/_next/static/chunks/0m6bkp6vk9ujz.js","/_next/static/chunks/0p0h9kdlr3ee-.js","/_next/static/chunks/turbopack-0-vm.vveqt324.js","/_next/static/media/4fa387ec64143e14-s.0wkzw~je483f-.woff2","/_next/static/media/53b9e256198e5412-s.0-wfv7uh4i7h9.woff2","/_next/static/media/5ce348bf30bf5439-s.0zgw-jeven.3w.woff2","/_next/static/media/6306c77e7c8268e4-s.0rhz0arwfsn~5.woff2","/_next/static/media/7178b3e590c64307-s.0nx0ww8fni_q3.woff2","/_next/static/media/797e433ab948586e-s.p.08e28id.o-okb.woff2","/_next/static/media/7d817b4c03b0c5f1-s.0l76wvqk9d84w.woff2","/_next/static/media/8a480f0b521d4e75-s.0jzbimsg8vl84.woff2","/_next/static/media/bbc41e54d2fcbd21-s.0k4k9394f2q-k.woff2","/_next/static/media/caa3a2e1cccd8315-s.p.09~u27dqhyhd6.woff2","/_next/static/media/fef07dbb0973bf53-s.12tyk43_3sh9u.woff2"];
const CORE = ['/', '/manifest.webmanifest', '/structure-mark.png', '/icon-192.png', '/icon-512.png', '/founder-assets/ceramic-bank.png', '/founder-assets/feature-module.png'];

// A new worker waits for the current session to finish instead of mixing builds.
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll([...CORE, ...BUILD_ASSETS]);
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('opu-') && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  const navigation = request.mode === 'navigate';
  const asset = ['script', 'style', 'image', 'font'].includes(request.destination);
  if (!navigation && !asset) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // Hashed build assets stay paired with their document, including offline.
    const cached = await cache.match(request);
    if (!navigation && cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok && response.type === 'basic') {
        event.waitUntil(cache.put(request, response.clone()).catch(() => undefined));
      }
      return response;
    } catch {
      if (cached) return cached;
      if (navigation) return (await cache.match('/')) || Response.error();
      // Never serve HTML as a missing JavaScript, image, or stylesheet.
      return Response.error();
    }
  })());
});
