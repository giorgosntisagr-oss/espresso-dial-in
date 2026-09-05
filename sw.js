const CACHE = "espresso-dial-in-v5";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./665D55B8-C1A2-45C8-AD36-18C9E9E2C281.PNG"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {

    event.respondWith(
      fetch(event.request)
        .then(response => {

          const copy = response.clone();

          caches.open(CACHE)
            .then(cache =>
              cache.put("./index.html", copy)
            );

          return response;

        })
        .catch(() =>
          caches.match("./index.html")
        )
    );

    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cached => {

        if (cached) return cached;

        return fetch(event.request)
          .then(response => {

            const copy = response.clone();

            caches.open(CACHE)
              .then(cache =>
                cache.put(event.request, copy)
              );

            return response;

          });

      })
  );

});
