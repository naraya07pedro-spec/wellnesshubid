const CACHE_NAME = 'wellnesshubid-v741-future-map';

/*
  V6.09 Sync Result Card Images Patch
  - Cache hanya shell inti saat install supaya first load tidak ketahan aset berat.
  - Video, audio, gambar workout, dan aset besar tetap tampil sama, tapi dicache on-demand.
  - Range request video dilewatkan langsung ke network supaya playback lebih aman di mobile.
*/
const CORE_ASSETS = [
  './',
  './index.html',
  './bodyfit.html',
  './app.html',
  './bioscan.html',
  './calculator.html',
  './result.html',
  './meal.html',
  './training-guide.html',
  './progress.html',
  './evolution.html',
  './offline.html',
  './manifest.json',
  './bodyfit-mobile-safe-v577.css',
  './analytics.js',
  './brand-effects.css',
  './brand-effects.js',
  './favicon-32.png',
  './favicon-192.png',
  './discipline-icon-192.png',
  './assets/body-scan-hero.jpg',
  './assets/bodyfit-hub-icon.png',
  './assets/result-muscle-hero-cutout.png',
  './assets/discipline-hub-icon.png',
  './assets/hub-bodyfit-reveal-icon.png',
  './assets/hub-discipline-reveal-icon.png',
  './assets/evolution/current-body.png',
  './assets/evolution/stage-0.png',
  './assets/evolution/stage-1.png',
  './assets/evolution/stage-2.png',
  './assets/evolution/stage-3.png',
  './assets/evolution/stage-4.png',
  './assets/evolution/stage-5.png',
  './assets/evolution/cutout-current-body.png',
  './assets/evolution/cutout-stage-0.png',
  './assets/evolution/cutout-stage-1.png',
  './assets/evolution/cutout-stage-2.png',
  './assets/evolution/cutout-stage-3.png',
  './assets/evolution/cutout-stage-4.png',
  './assets/evolution/cutout-stage-5.png',
  './assets/evolution_hd/avatar-slim.png',
  './assets/evolution_hd/avatar-normal.png',
  './assets/evolution_hd/avatar-berisi.png',
  './assets/evolution_hd/avatar-gendut.png',
  './assets/evolution_hd/avatar-fit.png',
  './assets/evolution_hd/avatar-athletic.png',
  './assets/meal-ui/telur-pisang.webp',
  './assets/meal-ui/nasi-ayam-tempe-sayur.webp',
  './assets/meal-ui/nasi-telur-sayur.webp',
  './assets/meal-ui/buah-roti-susu.webp',
  './assets/meal-ui/nasi_telur-wide.webp',
  './assets/meal-ui/ayam_tempe-wide.webp',
  './assets/meal-ui/oatpisang-wide.webp',
  './assets/training-focus/bulking.png',
  './assets/training-focus/fat-loss.png',
  './assets/training-focus/pemula.png',
  './assets/training-focus/mobility.png',
  './assets/training-focus/upper-body.png',
  './assets/training-focus/focus-dada-card.png',
  './assets/training-focus/focus-bicep-card.png',
  './assets/training-focus/focus-tricep-card.png',
  './assets/training-focus/focus-bahu-card.png',
  './assets/training-focus/focus-punggung-card.png',
  './assets/training-focus/focus-perut-card.png',
  './assets/training-focus/focus-core-card.png',
  './assets/training-focus/focus-kaki-card.png',
  './assets/training-focus/focus-glute-card.png',
  './assets/training-focus/focus-betis-card.png',
  './assets/progress-v710/journey-banner.png',
  './assets/future-map-vision-v741.webp',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

function sameOrigin(request){
  try { return new URL(request.url).origin === self.location.origin; }
  catch(e){ return false; }
}

function shouldRuntimeCache(request, response){
  if(!response || !response.ok || !sameOrigin(request)) return false;
  const dest = request.destination;
  const path = new URL(request.url).pathname.toLowerCase();
  return ['document','style','script','image','font','manifest'].includes(dest) || path.endsWith('.glb') || path.endsWith('.gltf');
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const requestPath = new URL(request.url).pathname.toLowerCase();

  // V7.38: exercise media must revalidate. Previous immutable same-name assets
  // could stay blurry/stale for up to one year in the browser HTTP cache.
  if (requestPath.includes('/assets/exercise-videos/')) {
    event.respondWith(fetch(request, {cache:'no-cache'}).catch(() => caches.match(request)));
    return;
  }

  // Video/audio range request jangan dimasukkan cache shell. Ini mencegah delay playback di mobile.
  if (request.headers.has('range') || request.destination === 'video' || request.destination === 'audio') {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (shouldRuntimeCache(request, response)) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy)).catch(()=>{});
        }
        return response;
      }).catch(() => {
        if (request.mode === 'navigate') return caches.match('./offline.html');
        if (request.destination === 'image') {
          return caches.match('./assets/body-scan-hero.jpg').then(fallback => fallback || Response.error());
        }
        return Response.error();
      });
    })
  );
});
