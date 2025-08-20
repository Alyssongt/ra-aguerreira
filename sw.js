const CACHE_NAME = "racaguerreira-cache-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./logo.png",          // verificar se é 'logo.png' ou 'LOGO AERG.png'
  "./LOGO AERG.png",     // se quiser cache das duas versões
  "./video.mp4",
  "./service-worker.js", // opcional, mas ajuda a manter o SW em cache
  "https://cdn.tailwindcss.com",
  "https://cdn.jsdelivr.net/npm/chart.js"
];


// Instalação do SW e cache dos arquivos essenciais
self.addEventListener("install", event => {
  console.log("[SW] Instalando...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); // ativa imediatamente
});

// Ativação do SW e limpeza de caches antigos
self.addEventListener("activate", event => {
  console.log("[SW] Ativado");
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (!cacheWhitelist.includes(key)) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim(); // assume controle das páginas
});

// Intercepta requisições e serve do cache se disponível
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          if (event.request.url.startsWith(self.location.origin)) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
      });
    }).catch(() => {
      // fallback caso não tenha conexão e não esteja no cache
      if (event.request.destination === "document") {
        return caches.match("./index.html");
      }
    })
  );
});
