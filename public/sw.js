// 8 Ball Pool Progressive Web App - Service Worker
const CACHE_NAME = '8ballpool-shell-v1';
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/js/db.js',
  '/js/pwa.js',
  '/js/game.js',
  '/js/admin.js',
  '/js/app.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_ASSETS).catch((err) => {
        console.warn('PWA Precache warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // NEVER cache non-GET requests or sensitive endpoints
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // App shell caching strategy: Stale-While-Revalidate for local origin shell assets
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        }).catch(() => {
          // If offline and request is HTML navigation, fallback to cached index.html
          if (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html') || caches.match('/');
          }
        });

        return cachedResponse || fetchPromise;
      })
    );
  }
});
