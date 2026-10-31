"use strict";

const CACHE_VERSION = "hewtujmer-app-v10";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGE_CACHE = `${CACHE_VERSION}-pages`;
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.webmanifest",
  "/icons/icon-maskable-512.png",
  "/static/app.js",
  "/static/calendar-core.js",
  "/static/calendar-events.js",
  "/static/calendar-navigation.js",
  "/static/calendar-view.js",
  "/static/data-service.js",
  "/static/storage.js",
  "/static/runtime-config.js",
  "/static/translations.js",
  "/static/update-manager.js",
  "/static/style.css",
  "/static/style-calendar.css",
  "/static/style-print.css",
  "/static/style-responsive.css",
  "/static/calendar-movements.json"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    for (const asset of CORE_ASSETS) {
      try {
        const response = await fetch(asset, { cache: "reload" });
        if (response.ok) await cache.put(asset, response);
      } catch (error) {
        // A single optional asset must not cancel the complete installation.
      }
    }
    const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of clients) client.postMessage({ type: "APP_UPDATE_INSTALLED" });
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith("hewtujmer-") && !key.startsWith(CACHE_VERSION)).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) await cache.put(request, response.clone());
    return response;
  } catch (error) {
    return (await cache.match(request)) || (await caches.match(fallbackUrl));
  }
}

async function assetFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.ok) await cache.put(request, response.clone());
    return response;
  } catch (error) {
    return Response.error();
  }
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache private notes, reminders, health checks, or session cookies.
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, "/offline.html"));
    return;
  }

  if (url.pathname === "/static/calendar-movements.json") {
    event.respondWith(networkFirst(request, "/offline.html"));
    return;
  }

  if (
    url.pathname.startsWith("/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest"
  ) {
    event.respondWith(assetFirst(request));
  }
});
