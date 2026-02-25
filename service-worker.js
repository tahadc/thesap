const CACHE_NAME = "thesap-cache-v19";

const urlsToCache = [
  "/",
  "/index.html",
  "/logo.png",
  "/manifest.json",
  "/video.mp4"
];

// INSTALL
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// FETCH (Güvenli Network First)
self.addEventListener("fetch", event => {

  // SADECE GET isteklerini yakala
  if (event.request.method !== "GET") return;

  // SADECE aynı origin isteklerini cachele
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Sadece başarılı cevapları cachele
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });

        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// ACTIVATE
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});
