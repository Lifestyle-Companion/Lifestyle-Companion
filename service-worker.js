const CACHE_NAME = "healthy-eating-companion-alpha-0-6-10-v1";
const APP_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./config.js",
  "./companions.js",
  "./app.js",
  "./alpha06.js",
  "./alpha064.js",
  "./manifest.webmanifest",
  "./afcd-release-3.json",
  "./assets/companions/koko-koala.svg",
  "./assets/companions/skip-kangaroo.svg",
  "./assets/companions/wally-wombat.svg",
  "./assets/companions/ernie-echidna.svg",
  "./assets/companions/rusty-dingo.svg",
  "./assets/companions/barnaby-bilby.svg",
  "./assets/companions/chuckles-kookaburra.svg",
  "./assets/companions/gary-galah.svg",
  "./assets/companions/percy-pelican.svg",
  "./assets/companions/clancy-cassowary.svg",
  "./assets/companions/rowdy-ringneck.svg",
  "./assets/companions/salty-crocodile.svg",
  "./assets/companions/spike-thorny-devil.svg",
  "./assets/companions/anna-goanna.svg",
  "./assets/companions/monty-python.svg",
  "./assets/companions/shelly-turtle.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if(event.request.method !== "GET") return;
  if(new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match("./index.html")))
  );
});
