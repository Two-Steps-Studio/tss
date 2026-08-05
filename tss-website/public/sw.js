const CACHE_NAME = 'tss-pwa-cache-v2';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// Strategie cache dla różnych typów treści
const STRATEGIES = {
  STALE_WHILE_REVALIDATE: {
    cache: 'tswr-cache',
    options: {
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },
  CACHE_FIRST: {
    cache: 'cachefirst-cache',
    options: {},
  },
};

// Instalacja - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Installing cache:', CACHE_NAME);
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      console.log('[SW] Skipping waiting to activate immediately');
      return self.skipWaiting();
    })
  );
});

// Aktywacja - oczyszcz stare cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      ).then(() => self.clients.claim());
    })
  );
});

// Fetch - strategie dla różnych typów
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // AJAX requests - stale while revalidate
  if (request.headers.get('Sec-Fetch-Destination') === 'document') {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          console.log('[SW] Serving from cache:', request.url);
          return cached;
        }
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              console.log('[SW] Caching response:', request.url);
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
  }

  // API requests - network first (never cache API responses)
  else if (url.pathname.includes('/api/') || request.headers.get('Accept')?.includes('application/json')) {
    event.respondWith(
      fetch(request).catch(() => {
        // Fallback to cache only if network fails
        return caches.match(request);
      })
    );
  }

  // Resource requests - network first with fallback
  else {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request);
      })
    );
  }
});

// Update - notification o uaktualnieniu SW
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
