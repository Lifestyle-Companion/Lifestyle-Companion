const CACHE_NAME = "healthy-eating-companion-alpha-0-6-18-v2";
const VERSION = "0.6.18";
const CORE_FILES = [
  `./index.html`,
  `./styles.css?v=${VERSION}`,
  `./config.js?v=${VERSION}`,
  `./companions.js?v=${VERSION}`,
  `./app.js?v=${VERSION}`,
  `./alpha06.js?v=${VERSION}`,
  `./alpha064.js?v=${VERSION}`,
  `./manifest.webmanifest?v=${VERSION}`,
  "./afcd-release-3.json"
];
const STATIC_FILES = [
  "./assets/companions/koko-koala.svg","./assets/companions/skip-kangaroo.svg","./assets/companions/wally-wombat.svg","./assets/companions/ernie-echidna.svg","./assets/companions/rusty-dingo.svg","./assets/companions/barnaby-bilby.svg","./assets/companions/chuckles-kookaburra.svg","./assets/companions/gary-galah.svg","./assets/companions/percy-pelican.svg","./assets/companions/clancy-cassowary.svg","./assets/companions/rowdy-ringneck.svg","./assets/companions/salty-crocodile.svg","./assets/companions/spike-thorny-devil.svg","./assets/companions/anna-goanna.svg","./assets/companions/monty-python.svg","./assets/companions/shelly-turtle.svg"
];
self.addEventListener("install",event=>{
  event.waitUntil((async()=>{const cache=await caches.open(CACHE_NAME);for(const url of [...CORE_FILES,...STATIC_FILES]){try{const response=await fetch(url,{cache:"reload"});if(response.ok)await cache.put(url,response.clone());}catch{}}})());
  self.skipWaiting();
});
self.addEventListener("activate",event=>{event.waitUntil((async()=>{for(const key of await caches.keys())if(key!==CACHE_NAME)await caches.delete(key);await self.clients.claim();})());});
async function networkFirst(request){const cache=await caches.open(CACHE_NAME);try{const response=await fetch(request,{cache:"no-store"});if(response.ok)await cache.put(request,response.clone());return response;}catch{const cached=await cache.match(request,{ignoreSearch:false})||await cache.match("./index.html");if(cached)return cached;throw new Error("Offline");}}
self.addEventListener("fetch",event=>{if(event.request.method!=="GET")return;const url=new URL(event.request.url);if(url.origin!==self.location.origin)return;const type=event.request.destination;if(event.request.mode==="navigate"||["document","script","style","manifest"].includes(type)){event.respondWith(networkFirst(event.request));return;}event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));}return response;})));});
