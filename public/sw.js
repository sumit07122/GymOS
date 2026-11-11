// ==============================================================================
// FIXIA GymOS — Progressive Web App Service Worker (v2.0)
// ==============================================================================
// Hardened against cross-tenant cache leaks on shared reception kiosks.
// 1. NEVER caches non-GET requests, API routes, sessions, or RSC payloads.
// 2. Cache-first ONLY for immutable static bundles (/icons/*, /_next/static/*).
// 3. Network-first with offline fallback for navigation requests.
// ==============================================================================

const CACHE_NAME = "gymos-v2.0";
const PRECACHE_URLS = ["/offline", "/manifest.json", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // NEVER cache non-GET requests, API routes, NextAuth sessions, or RSC payloads
  if (
    request.method !== "GET" ||
    url.pathname.startsWith("/api/") ||
    request.headers.get("RSC") === "1" ||
    request.headers.get("Next-Router-State-Tree")
  ) {
    return;
  }

  // Cache-first ONLY for immutable static assets (/icons/*, /_next/static/*)
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
    return;
  }

  // Network-first with offline fallback for navigation requests
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/offline"))
    );
  }
});
