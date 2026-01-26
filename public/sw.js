// Service Worker for PWA
// Service Worker for Xyon3D PWA
const CACHE_NAME = 'xyon3d-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/index.css',
    '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting();
});

// Fetch event - Network First for HTML/API, Cache First for assets
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // ONLY cache GET requests. POST/PUT/DELETE are unsupported by Cache API.
    if (event.request.method !== 'GET') {
        return;
    }

    // Network First for HTML, JSON (API), and root
    if (event.request.mode === 'navigate' ||
        event.request.headers.get('accept').includes('text/html') ||
        event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Update cache for GET requests
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request);
                })
        );
    } else {
        // Cache First for others (scripts, images, css)
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    return response || fetch(event.request).then((networkResponse) => {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                        return networkResponse;
                    });
                })
        );
    }
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});
