const CACHE = 'opu-founder-company-2';
const BUILD_ASSETS = [];
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
