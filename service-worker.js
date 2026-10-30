"use strict";

const CACHE_NAME = "hewtujmer-static-v4";
const APP_SHELL = [
  "/", "/index.html", "/manifest.webmanifest", "/offline.html",
  "/icons/icon.svg", "/icons/icon-180.png", "/icons/icon-192.png",
  "/icons/icon-512.png", "/icons/icon-maskable-512.png",
  "/static/style.css", "/static/style-calendar.css", "/static/style-responsive.css",
  "/static/style-print.css", "/static/translations.js", "/static/calendar-core.js",
  "/static/calendar-view.js", "/static/calendar-navigation.js",
  "/static/calendar-events.js", "/static/calendar-movements.json", "/static/app.js"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
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
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    for (const name of names) {
      if (name.startsWith("hewtujmer-") && name !== CACHE_NAME) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});

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
});
