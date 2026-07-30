// FleetSplit service worker — hand-written rather than a plugin, since this
// app builds via `output: "export"` (100% static, no server) and the whole
// point of a PWA layer here is just "the shell + hashed assets still work
// offline," not background sync or push. Bump CACHE_VERSION on any change to
// this file so old installs pick up the new logic instead of sticking with
// a stale cache forever.
const CACHE_VERSION = "fleetsplit-v1";
const SHELL_URLS = ["/", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(SHELL_URLS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Hashed build assets never change contents under the same URL (see
  // public/_headers) — cache-first is always correct and skips the network
  // entirely on repeat visits.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
            return response;
          }),
      ),
    );
    return;
  }

  // Everything else (the HTML shell, manifest, etc.): network-first so
  // online visitors always get the latest deploy, falling back to whatever
  // was last cached when the network is unavailable.
  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match("/"))),
  );
});
