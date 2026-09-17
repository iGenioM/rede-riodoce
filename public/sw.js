// CEASA Digital — Service Worker (offline-first, cache-first para assets, network-first para navegação)
const VERSION = "ceasa-digital-v3";
const APP_SHELL = ["/home", "/manifest.json", "/icons/icon-192.png", "/icons/icon-512.png"];

// Host das fotos profissionais (produtos e pessoas) geradas via IA. Fazemos
// cache-first pra esse host também, assim as fotos continuam aparecendo
// offline depois do primeiro carregamento — mesmo hospedadas fora do app.
const IMAGE_HOSTS = ["d8j0ntlcm91z4.cloudfront.net"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(APP_SHELL).catch(() => {}))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isCachedImageHost = IMAGE_HOSTS.includes(url.hostname);
  if (!isSameOrigin && !isCachedImageHost) return;
  // Chunks do Next/Turbopack nunca entram no cache do SW — senão o app
  // fica preso em JS antigo e o HMR/atualizações não aparecem.
  if (url.pathname.startsWith("/_next/")) return;

  // Fotos externas (CloudFront): cache-first puro, sem tentar revalidar —
  // se já baixou uma vez, funciona offline; erro de rede nunca quebra a UI
  // porque o componente ProductImage/Avatar cai pro placeholder de qualquer forma.
  if (isCachedImageHost) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request)
            .then((res) => {
              const clone = res.clone();
              caches.open(VERSION).then((cache) => cache.put(request, clone));
              return res;
            })
            .catch(() => cached)
      )
    );
    return;
  }

  // Navegação: network-first com fallback pro cache (funciona offline após 1ª visita)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(VERSION).then((cache) => cache.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match("/home")))
    );
    return;
  }

  // Assets estáticos: cache-first
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request)
          .then((res) => {
            const clone = res.clone();
            caches.open(VERSION).then((cache) => cache.put(request, clone));
            return res;
          })
          .catch(() => cached)
    )
  );
});
