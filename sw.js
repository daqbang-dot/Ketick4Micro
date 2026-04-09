const CACHE_NAME = 'ketick-pwa-v16';

// Senarai fail asas yang wajib disimpan dalam telefon (Cache)
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './icon-001.png'
];

// FASA 1: Install & Simpan Cache
self.addEventListener('install', event => {
    console.log('[Service Worker] Sedang Memasang PWA...');
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting();
});

// FASA 2: Buang Cache Lama kalau ada Update
self.addEventListener('activate', event => {
    console.log('[Service Worker] Aktif dan Sedia!');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Service Worker] Membuang cache lama:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// FASA 3: Strategi "Network First, Fallback to Cache"
self.addEventListener('fetch', event => {
    // Abaikan request dari Extension atau Firebase
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        fetch(event.request)
        .then(networkResponse => {
            // Kalau ada internet, simpan fail terbaru dalam Cache
            return caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
            });
        })
        .catch(() => {
            // Kalau tiada internet (Offline), pakai fail dari Cache
            console.log('[Service Worker] Menggunakan mod Offline.');
            return caches.match(event.request);
        })
    );
});
