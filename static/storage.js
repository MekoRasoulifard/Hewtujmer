"use strict";

(function () {
  const LEGACY_PREFIX = "hewtujmer-";
  const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

  function readCookie(name) {
    const prefix = `${name}=`;
    for (const entry of document.cookie.split(";")) {
      const value = entry.trim();
      if (value.startsWith(prefix)) {
        try { return decodeURIComponent(value.slice(prefix.length)); }
        catch (error) { return null; }
      }
    }
    return null;
  }

  function writeCookie(name, value) {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
  }

  function removeLegacy(key) {
    try { window.localStorage.removeItem(LEGACY_PREFIX + key); }
    catch (error) { /* localStorage is optional and used only for migration. */ }
  }

  function get(key, fallback = null) {
    const cookieName = `ht_${key}`;
    const cookieValue = readCookie(cookieName);
    if (cookieValue !== null) return cookieValue;

    try {
      const legacyValue = window.localStorage.getItem(LEGACY_PREFIX + key);
      if (legacyValue !== null) {
        writeCookie(cookieName, legacyValue);
        removeLegacy(key);
        return legacyValue;
      }
    } catch (error) {
      // The preference falls back to the in-memory default.
    }
    return fallback;
  }

  function set(key, value) {
    writeCookie(`ht_${key}`, String(value));
    removeLegacy(key);
  }

  function remove(key) {
    document.cookie = `ht_${key}=; Path=/; Max-Age=0; SameSite=Lax`;
    removeLegacy(key);
  }

  window.HewtujmerStorage = Object.freeze({ get, set, remove });
})();
