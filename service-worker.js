const CACHE_NAME = "healthy-eating-companion-alpha-0-6-32-v1";
const VERSION = "0.6.32";
const CORE_FILES = [
  `./index.html`,
  `./styles.css?v=${VERSION}`,
  `./config.js?v=${VERSION}`,
  `./companions.js?v=${VERSION}`,
  `./app.js?v=${VERSION}`,
  `./entity-registry.js?v=${VERSION}`,
  `./search-foundation.js?v=${VERSION}`,
  `./guided-branching.js?v=${VERSION}`,
  `./serving-foundation.js?v=${VERSION}`,
  `./alpha06.js?v=${VERSION}`,
  `./alpha064.js?v=${VERSION}`,
  `./manifest.webmanifest?v=${VERSION}`,
  "./afcd-release-3.json"
];
const STATIC_FILES = [
  "./assets/companions/koko-koala.svg","./assets/companions/skip-kangaroo.svg","./assets/companions/wally-wombat.svg","./assets/companions/ernie-echidna.svg","./assets/companions/rusty-dingo.svg","./assets/companions/barnaby-bilby.svg","./assets/companions/chuckles-kookaburra.svg","./assets/companions/gary-galah.svg","./assets/companions/percy-pelican.svg","./assets/companions/clancy-cassowary.svg","./assets/companions/rowdy-ringneck.svg","./assets/companions/salty-crocodile.svg","./assets/companions/spike-thorny-devil.svg","./assets/companions/anna-goanna.svg","./assets/companions/monty-python.svg","./assets/companions/shelly-turtle.svg"
];
const CORE_PATHS = new Set(CORE_FILES.map(x=>new URL(x,self.location.href).pathname));
const timeout = ms => new Promise((_,reject)=>setTimeout(()=>reject(new Error("network timeout")),ms));

self.addEventListener("install",event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_NAME);
    await Promise.allSettled([...CORE_FILES,...STATIC_FILES].map(async url=>{
      try{const response=await Promise.race([fetch(url,{cache:"reload"}),timeout(4500)]);if(response.ok)await cache.put(url,response.clone());}catch{}
    }));
  })());
  self.skipWaiting();
});
self.addEventListener("activate",event=>{event.waitUntil((async()=>{for(const key of await caches.keys())if(key!==CACHE_NAME)await caches.delete(key);await self.clients.claim();})());});

async function cachedShell(request){
  const cache=await caches.open(CACHE_NAME);
  const hit=await cache.match(request,{ignoreSearch:true});
  return hit||await cache.match("./index.html",{ignoreSearch:true});
}
async function navigationResponse(request){
  const cache=await caches.open(CACHE_NAME);
  const cached=await cache.match("./index.html",{ignoreSearch:true});
  try{
    const response=await Promise.race([fetch(request,{cache:"no-store"}),timeout(2200)]);
    if(response.ok){cache.put("./index.html",response.clone()).catch(()=>{});return response;}
  }catch{}
  if(cached)return cached;
  return fetch(request);
}
async function staleWhileRevalidate(request){
  const cache=await caches.open(CACHE_NAME);
  const cached=await cache.match(request,{ignoreSearch:true});
  const network=fetch(request,{cache:"no-store"}).then(response=>{if(response.ok)cache.put(request,response.clone()).catch(()=>{});return response;}).catch(()=>null);
  if(cached){network.catch(()=>{});return cached;}
  return (await network)||cachedShell(request);
}
async function cacheFirst(request){
  const cache=await caches.open(CACHE_NAME);
  const cached=await cache.match(request,{ignoreSearch:true});if(cached)return cached;
  const response=await fetch(request);if(response.ok)cache.put(request,response.clone()).catch(()=>{});return response;
}
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  const url=new URL(event.request.url);if(url.origin!==self.location.origin)return;
  if(event.request.mode==="navigate"||event.request.destination==="document"){event.respondWith(navigationResponse(event.request));return;}
  if(CORE_PATHS.has(url.pathname)||["script","style","manifest"].includes(event.request.destination)){event.respondWith(staleWhileRevalidate(event.request));return;}
  event.respondWith(cacheFirst(event.request));
});
