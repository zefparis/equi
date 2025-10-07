// Service Worker for Equi Saddles PWA
const CACHE_NAME = 'equi-saddles-v8-pwa-fix';
const urlsToCache = [
  '/',
  '/catalog',
  '/gallery', 
  '/contact',
  '/manifest.webmanifest'
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching essential resources');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('[SW] Cache installation failed:', error);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Ensure the service worker takes control immediately
  self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Only handle same-origin requests and skip POST requests
  if (!event.request.url.startsWith(self.location.origin) || event.request.method !== 'GET') {
    return;
  }
  
  // Skip API requests to avoid stale data
  if (event.request.url.includes('/api/')) {
    return;
  }

  // NEVER cache POST requests - they cause errors and are not cacheable
  if (event.request.method !== 'GET') {
    // Skip non-GET requests but log Stripe 429 errors specifically
    if (event.request.url.includes('stripe.com') || event.request.url.includes('errors.stripe.com')) {
      console.log('[SW] Skipping Stripe API request (potential rate limit protection):', event.request.method, event.request.url);
    } else {
      console.log('[SW] Skipping non-GET request:', event.request.method, event.request.url);
    }
    return;
  }

  // Determine cache strategy based on request type
  const url = new URL(event.request.url);
  const isStaticAsset = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i.test(url.pathname);
  const isApiRequest = url.pathname.startsWith('/api/');

  // Skip API requests from caching
  if (isApiRequest) {
    console.log('[SW] Skipping API request:', event.request.url);
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          console.log('[SW] Serving from cache:', event.request.url);
          return response;
        }

        // Otherwise fetch from network
        return fetch(event.request).then((response) => {
          // Check if response is valid
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Only cache static assets and pages (not API responses)
          if (isStaticAsset || event.request.destination === 'document') {
            // Clone response for caching
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                console.log('[SW] Caching:', event.request.url);
                cache.put(event.request, responseToCache);
              })
              .catch((cacheError) => {
                console.warn('[SW] Failed to cache:', event.request.url, cacheError);
              });
          }

          return response;
        });
      })
      .catch((error) => {
        console.error('[SW] Fetch failed:', error);
        
        // Fallback strategies
        if (event.request.destination === 'document') {
          // Return cached homepage for navigation requests
          return caches.match('/').then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[SW] Serving cached homepage as fallback');
              return cachedResponse;
            }
            // Return a simple offline page if nothing is cached
            return new Response(`
              <!DOCTYPE html>
              <html>
                <head><title>Hors ligne - Equi Saddles</title></head>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                  <h1>Hors ligne</h1>
                  <p>Vous êtes actuellement hors ligne. Vérifiez votre connexion Internet.</p>
                  <button onclick="window.location.reload()">Réessayer</button>
                </body>
              </html>
            `, { 
              headers: { 'Content-Type': 'text/html' }
            });
          });
        }
        
        // For images, return a placeholder
        if (event.request.destination === 'image') {
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" fill="#ddd"><rect width="100%" height="100%" fill="#f5f5f5"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">Image non disponible</text></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        }
        
        // For all other requests, let them fail naturally
        throw error;
      })
  );
});