const CACHE_VERSION = 'echoverse-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const OFFLINE_URL = '/offline.html';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/echo.html',
  '/style.css',
  '/manifest.json',
  '/assets/sample.svg',
  OFFLINE_URL
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first for navigations (HTML), fallback to offline
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Ignore non-GET
  if (req.method !== 'GET') return;

  // Handle navigation requests
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then((c) => c || caches.match(OFFLINE_URL)))
    );
    return;
  }

  // Cache-first for static assets
  if (STATIC_ASSETS.some((path) => url.pathname === path)) {
    event.respondWith(caches.match(req).then((c) => c || fetch(req)));
    return;
  }

  // Runtime caching for other GET requests
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req).then((networkRes) => {
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, networkRes.clone()));
        return networkRes;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});