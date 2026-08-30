const CACHE_NAME = 'zyra-admin-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/Admin.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/maskable-icon-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.png',
];

// Install: precache static app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
      .catch((err) => {
        console.warn('[SW] Precache failed:', err);
      })
  );
});

// Activate: clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch: Safe caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. NON-GET or API / Auth / Dynamic requests -> ALWAYS NetworkOnly (never cache)
  if (
    request.method !== 'GET' ||
    url.pathname.startsWith('/api') ||
    url.port === '5000' ||
    url.pathname.includes('/auth') ||
    url.pathname.includes('/users') ||
    url.pathname.includes('/orders') ||
    url.pathname.includes('/products') ||
    url.pathname.includes('/seller') ||
    url.pathname.includes('/hero') ||
    url.pathname.includes('/deals')
  ) {
    return; // default browser fetch
  }

  // 2. Navigation requests -> NetworkFirst with fallback to /index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/index.html').then((response) => {
          return response || caches.match('/');
        });
      })
    );
    return;
  }

  // 3. Static assets, fonts, stylesheets, images -> StaleWhileRevalidate / CacheFirst
  if (
    url.origin === self.location.origin ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (
              networkResponse &&
              networkResponse.status === 200 &&
              networkResponse.type === 'basic'
            ) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // If network fails and no cached response, fallback gracefully
            return cachedResponse;
          });

        return cachedResponse || fetchPromise;
      })
    );
  }
});
