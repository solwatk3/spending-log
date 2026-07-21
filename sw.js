// =====================================================
// Spending Log - sw.js (Service Worker)
// Caches all app files so the app works without internet.
// Also enables "Add to Home Screen" on Android.
// =====================================================

const CACHE_NAME = 'spending-log-v1';

// List of files to cache on first install
// These are the only files the app needs to run
const FILES_TO_CACHE = [
  '/spending-log/',
  '/spending-log/index.html',
  '/spending-log/style.css',
  '/spending-log/app.js',
  '/spending-log/manifest.json',
  '/spending-log/icon.svg'
];

// INSTALL - runs once when the service worker is first registered
// Pre-caches all the app files so they're available offline immediately
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  // Skip waiting so the new service worker activates right away
  self.skipWaiting();
});

// ACTIVATE - runs when this service worker takes over
// Deletes any old caches from previous versions of the app
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function(name) { return name !== CACHE_NAME; })
          .map(function(name) { return caches.delete(name); })
      );
    })
  );
  // Take control of all open tabs immediately
  self.clients.claim();
});

// FETCH - intercepts every network request the app makes
// Serves from cache first; falls back to network if not cached
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(cachedResponse) {
      // Return the cached file if we have it
      if (cachedResponse) return cachedResponse;
      // Otherwise fetch from the network
      return fetch(event.request);
    })
  );
});
