"use strict";

(function () {
  let registrationPromise = null;
  let registration = null;
  let updateRequested = false;
  let reloadScheduled = false;
  let lastCheckAt = 0;

  function showUpdateNotice() {
    const notice = document.querySelector("#app-update-toast");
    if (notice) notice.hidden = false;
  }

  function watchRegistration(current) {
    registration = current;
    if (registration.waiting && navigator.serviceWorker.controller) showUpdateNotice();

    registration.addEventListener("updatefound", () => {
      const installing = registration.installing;
      if (!installing) return;
      installing.addEventListener("statechange", () => {
        if (installing.state === "installed" && navigator.serviceWorker.controller) {
          showUpdateNotice();
        }
      });
    });
  }

  function applyUpdate() {
    if (!registration?.waiting || updateRequested) return;
    updateRequested = true;
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
  }

  async function checkForUpdate(force = false) {
    if (!registration || !navigator.onLine) return;
    const now = Date.now();
    if (!force && now - lastCheckAt < 120000) return;
    lastCheckAt = now;
    try { await registration.update(); }
    catch (error) { /* Offline or blocked update checks are safe to retry later. */ }
    if (registration.waiting && navigator.serviceWorker.controller) showUpdateNotice();
  }

  function register() {
    if (registrationPromise) return registrationPromise;
    if (!("serviceWorker" in navigator)) return Promise.resolve(null);

    registrationPromise = navigator.serviceWorker.register("/service-worker.js", { updateViaCache: "none" })
      .then(current => {
        watchRegistration(current);
        document.querySelector("#apply-app-update")?.addEventListener("click", applyUpdate);
        window.addEventListener("pageshow", () => checkForUpdate());
        window.addEventListener("online", () => checkForUpdate(true));
        document.addEventListener("visibilitychange", () => {
          if (!document.hidden) checkForUpdate();
        });
        return current;
      })
      .catch(error => {
        console.warn("Hewtûjmêr offline support could not be registered.", error.message);
        registrationPromise = null;
        return null;
      });

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!updateRequested || reloadScheduled) return;
      reloadScheduled = true;
      window.location.reload();
    });
    return registrationPromise;
  }

  window.HewtujmerUpdates = Object.freeze({ register, checkForUpdate });
})();
