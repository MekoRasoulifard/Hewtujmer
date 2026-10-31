"use strict";

<<<<<<< HEAD
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
=======
const CACHE_NAME = "hewtujmer-static-v5";
const APP_SHELL = [
  "/", "/index.html", "/manifest.webmanifest", "/offline.html",
  "/icons/icon.svg", "/icons/icon-180.png", "/icons/icon-192.png",
  "/icons/icon-512.png", "/icons/icon-maskable-512.png",
  "/static/style.css", "/static/style-calendar.css", "/static/style-responsive.css",
  "/static/style-print.css", "/static/translations.js", "/static/calendar-core.js",
  "/static/calendar-view.js", "/static/calendar-navigation.js",
  "/static/calendar-events.js", "/static/calendar-movements.json", "/static/app.js"
>>>>>>> 26494999ea39bc70bfc6b80d481768d8b1e343eb
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
<<<<<<< HEAD
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
=======
    const cache = await caches.open(CACHE_NAME);
    for (const path of APP_SHELL) {
      try {
        const response = await fetch(path, { cache: "reload" });
        if (response.ok) await cache.put(path, response);
      } catch (error) {
        // A single missing optional asset must not prevent offline support.
        console.warn("Hewtûjmêr could not cache:", path, error);
      }
    }
    await self.skipWaiting();
>>>>>>> 26494999ea39bc70bfc6b80d481768d8b1e343eb
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
<<<<<<< HEAD
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith("hewtujmer-") && !key.startsWith(CACHE_VERSION)).map(key => caches.delete(key)));
=======
    const names = await caches.keys();
    for (const name of names) {
      if (name.startsWith("hewtujmer-") && name !== CACHE_NAME) await caches.delete(name);
    }
>>>>>>> 26494999ea39bc70bfc6b80d481768d8b1e343eb
    await self.clients.claim();
  })());
});

<<<<<<< HEAD
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
=======
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok && url.origin === self.location.origin) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      if (request.mode === "navigate") return await caches.match("/offline.html") || await caches.match("/index.html");
      throw error;
    }
  })());
>>>>>>> 26494999ea39bc70bfc6b80d481768d8b1e343eb
});
