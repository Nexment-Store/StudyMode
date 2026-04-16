const CACHE_NAME = 'study-tab-v1';

const BASE_PATH = '/StudyMode/';

const PRECACHE = [
  BASE_PATH,
  BASE_PATH + 'index.html',
  BASE_PATH + 'style.css',
  BASE_PATH + 'script.js',
  BASE_PATH + 'manifest.json',

  // Images
  BASE_PATH + 'Bg1.jpg',
  BASE_PATH + 'Bg2.jpg',
  BASE_PATH + 'Bg3.jpg',
  BASE_PATH + 'Bg4.jpg',

  BASE_PATH + 'logo.png'
];

/* ── Install ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

/* ── Activate ── */
self.addEventListener('activate', event => {
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

/* ── Fetch ── */
self.addEventListener('fetch', event => {
  const request = event.request;

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request)
        .then(response => {
          if (
            request.method === 'GET' &&
            response &&
            response.status === 200 &&
            response.type !== 'opaque'
          ) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          if (request.mode === 'navigate') {
            return caches.match(BASE_PATH + 'index.html');
          }
        });
    })
  );
});