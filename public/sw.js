// ==============================================================================
// FIXIA GymOS — Progressive Web App Service Worker (M20)
// ==============================================================================
// Invariants:
// 1. Safe Caching Strategy: Strictly cache static assets and application shell.
// 2. Security First: NEVER cache sensitive member records, financial invoices,
//    or attendance tokens. All /api/ and financial routes are NETWORK-ONLY.
// 3. Offline Resilience: Serves a branded offline shell when network is unavailable.
// ==============================================================================

const CACHE_NAME = "fixia-gymos-v1.0.0";
const OFFLINE_URL = "/offline";

const PRECACHE_ASSETS = [
  OFFLINE_URL,
  "/favicon.ico",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// 1. Install Event: Pre-cache offline application shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("[PWA SW] Pre-cache warning:", err);
      });
    })
  );
  self.skipWaiting();
});

// 2. Activate Event: Clean up stale caches from previous versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event: Controlled caching with strict security boundaries
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // A. Non-GET requests (mutations, server actions) -> Network Only
  if (request.method !== "GET") {
    return;
  }

  // B. Sensitive API and Financial Routes -> Network Only (Zero Cache)
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.includes("/payments") ||
    url.pathname.includes("/invoices") ||
    url.pathname.includes("/expenses") ||
    url.pathname.includes("/qr-")
  ) {
    event.respondWith(fetch(request));
    return;
  }

  // C. Static Next.js Bundles and Assets -> Cache-First / Stale-While-Revalidate
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico")
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // D. Page Navigation Requests -> Network-First with Offline Fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(OFFLINE_URL).then((offlineResponse) => {
          return (
            offlineResponse ||
            new Response(
              `<!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="utf-8" />
                <title>FIXIA GymOS — Offline</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <style>
                  body { font-family: system-ui, sans-serif; background: #0f172a; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
                  .card { max-width: 400px; padding: 2rem; background: #1e293b; border-radius: 1rem; border: 1px solid #334155; }
                  h1 { color: #6366f1; margin-bottom: 0.5rem; }
                  p { color: #94a3b8; line-height: 1.5; }
                  button { background: #4f46e5; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; margin-top: 1rem; }
                </style>
              </head>
              <body>
                <div class="card">
                  <h1>You're Offline</h1>
                  <p>FIXIA GymOS requires an active internet connection to securely process member check-ins and financial data.</p>
                  <button onclick="window.location.reload()">Retry Connection</button>
                </div>
              </body>
              </html>`,
              { headers: { "Content-Type": "text/html" } }
            )
          );
        });
      })
    );
    return;
  }
});
