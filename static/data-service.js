"use strict";

(function () {
  const DATABASE_NAME = "hewtu-jmer-private-data";
  const DATABASE_VERSION = 1;
  const API_ROOT = String(window.HEWTUJMER_API_BASE_URL || "").replace(/\/$/, "");
  const memory = { notes: [], reminders: [], meta: {} };
  const timers = new Map();
  let databasePromise = null;
  let notesCache = [];
  let remindersCache = [];
  let refreshPromise = null;
  let sessionReady = false;

  function createId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    const bytes = new Uint8Array(16);
    if (window.crypto?.getRandomValues) window.crypto.getRandomValues(bytes);
    else for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, value => value.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  function openDatabase() {
    if (databasePromise) return databasePromise;
    if (!window.indexedDB) return Promise.resolve(null);

    databasePromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains("notes")) {
          database.createObjectStore("notes", { keyPath: "id" });
        }
        if (!database.objectStoreNames.contains("reminders")) {
          database.createObjectStore("reminders", { keyPath: "id" });
        }
        if (!database.objectStoreNames.contains("meta")) {
          database.createObjectStore("meta", { keyPath: "key" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Private browser storage could not be opened."));
      request.onblocked = () => reject(new Error("Private browser storage is blocked by another tab."));
    }).catch(error => {
      console.warn("Hewtûjmêr will use temporary memory storage:", error.message);
      databasePromise = Promise.resolve(null);
      return null;
    });
    return databasePromise;
  }

  async function storeGetAll(storeName) {
    const database = await openDatabase();
    if (!database) return memory[storeName].slice();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, "readonly");
      const request = transaction.objectStore(storeName).getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async function storePut(storeName, record) {
    const database = await openDatabase();
    if (!database) {
      const records = memory[storeName];
      const index = records.findIndex(item => item.id === record.id);
      if (index < 0) records.push(record);
      else records[index] = record;
      return record;
    }
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, "readwrite");
      transaction.objectStore(storeName).put(record);
      transaction.oncomplete = () => resolve(record);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error("Storage update was cancelled."));
    });
  }

  async function storeDelete(storeName, id) {
    const database = await openDatabase();
    if (!database) {
      memory[storeName] = memory[storeName].filter(item => item.id !== id);
      return;
    }
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, "readwrite");
      transaction.objectStore(storeName).delete(id);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async function storeReplace(storeName, records) {
    const database = await openDatabase();
    if (!database) {
      memory[storeName] = records.slice();
      return;
    }
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      store.clear();
      for (const record of records) store.put(record);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error("Storage update was cancelled."));
    });
  }

  async function getMeta(key) {
    const database = await openDatabase();
    if (!database) return memory.meta[key] || null;
    return new Promise((resolve, reject) => {
      const transaction = database.transaction("meta", "readonly");
      const request = transaction.objectStore("meta").get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async function setMeta(key, value) {
    const database = await openDatabase();
    if (!database) {
      memory.meta[key] = { key, value };
      return;
    }
    return new Promise((resolve, reject) => {
      const transaction = database.transaction("meta", "readwrite");
      transaction.objectStore("meta").put({ key, value });
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
  }

  function importLegacyNotes() {
    try {
      const legacy = window.localStorage.getItem("hewtujmer-notes-v1");
      if (!legacy) return [];
      const parsed = JSON.parse(legacy);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(item => item && typeof item.text === "string").map(item => ({
        id: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item.id || "") ? item.id : createId(),
        text: item.text.slice(0, 2000),
        date: /^\d{4}-\d{2}-\d{2}$/.test(item.date || "") ? item.date : null,
        time: /^([01]\d|2[0-3]):[0-5]\d$/.test(item.time || "") ? item.time : "",
        remindBefore: Math.max(0, Math.min(10080, Number(item.remindBefore) || 0)),
        reminderShownAt: item.reminderShownAt || null,
        syncStatus: "pendingCreate"
      }));
    } catch (error) {
      return [];
    }
  }

  async function migrateLegacyNotes() {
    const done = await getMeta("legacyNotesImported");
    if (done?.value) return;
    const legacyNotes = importLegacyNotes();
    for (const note of legacyNotes) await storePut("notes", note);
    await setMeta("legacyNotesImported", true);

    // Keep the old copy when IndexedDB is unavailable. In-memory migration
    // cannot survive a page reload, so removing the source would lose notes.
    if (!await openDatabase()) return;
    try { window.localStorage.removeItem("hewtujmer-notes-v1"); }
    catch (error) { /* A failed cleanup does not affect the migrated notes. */ }
  }

  async function apiRequest(path, options = {}) {
    const headers = { Accept: "application/json", ...(options.headers || {}) };
    if (options.body !== undefined) headers["Content-Type"] = "application/json";
    const response = await fetch(`${API_ROOT}/api${path}`, {
      method: options.method || "GET",
      credentials: API_ROOT ? "include" : "same-origin",
      cache: "no-store",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body)
    });
    let data = {};
    try { data = await response.json(); }
    catch (error) { /* A server error can have an empty response body. */ }
    if (!response.ok) {
      const failure = new Error(data.error || `Request failed (${response.status}).`);
      failure.status = response.status;
      throw failure;
    }
    return data;
  }

  async function ensureSession() {
    if (sessionReady) return true;
    const session = await apiRequest("/session", { method: "POST", body: {} });
    const previousOwner = await getMeta("sessionOwnerId");
    if (previousOwner?.value && previousOwner.value !== session.ownerId) {
      // A cleared or replaced cookie creates a new anonymous owner. Keep local
      // records and re-create them in that new private space instead of losing them.
      for (const storeName of ["notes", "reminders"]) {
        const records = await storeGetAll(storeName);
        for (const record of records) {
          if (record.syncStatus === "synced" || record.syncStatus === "pendingUpdate") {
            await storePut(storeName, { ...record, syncStatus: "pendingCreate" });
          }
        }
      }
    }
    await setMeta("sessionOwnerId", session.ownerId);
    sessionReady = true;
    return true;
  }

  function normalizeNote(note) {
    return {
      id: note.id,
      text: note.text,
      date: note.date || null,
      time: note.time || "",
      remindBefore: Number(note.remindBefore) || 0,
      reminderShownAt: note.reminderShownAt || null,
      createdAt: note.createdAt || null,
      updatedAt: note.updatedAt || null,
      syncStatus: note.syncStatus || "synced"
    };
  }

  function normalizeReminder(reminder) {
    return {
      id: reminder.id,
      title: reminder.title,
      description: reminder.description || "",
      date: reminder.date,
      time: reminder.time,
      completed: Boolean(reminder.completed),
      remindBefore: Number(reminder.remindBefore) || 0,
      notificationEnabled: reminder.notificationEnabled !== false,
      reminderShownAt: reminder.reminderShownAt || null,
      createdAt: reminder.createdAt || null,
      updatedAt: reminder.updatedAt || null,
      syncStatus: reminder.syncStatus || "synced"
    };
  }

  async function syncStore(storeName, endpoint, payloadName, normalize) {
    if (!navigator.onLine) return false;
    await ensureSession();

    const localRecords = await storeGetAll(storeName);
    for (const record of localRecords) {
      if (record.syncStatus === "pendingDelete") {
        try {
          await apiRequest(`${endpoint}/${encodeURIComponent(record.id)}`, { method: "DELETE" });
        } catch (error) {
          if (error.status !== 404) throw error;
        }
        await storeDelete(storeName, record.id);
      } else if (record.syncStatus === "pendingCreate") {
        const response = await apiRequest(endpoint, {
          method: "POST",
          body: normalize(record)
        });
        await storePut(storeName, { ...normalize(response[payloadName]), syncStatus: "synced" });
      } else if (record.syncStatus === "pendingUpdate") {
        const response = await apiRequest(`${endpoint}/${encodeURIComponent(record.id)}`, {
          method: "PATCH",
          body: normalize(record)
        });
        await storePut(storeName, { ...normalize(response[payloadName]), syncStatus: "synced" });
      }
    }

    const response = await apiRequest(endpoint);
    const remoteRecords = response[payloadName].map(record => ({ ...normalize(record), syncStatus: "synced" }));
    const remainingLocal = (await storeGetAll(storeName)).filter(record =>
      record.syncStatus && record.syncStatus !== "synced"
    );
    const remoteIds = new Set(remoteRecords.map(record => record.id));
    const merged = remoteRecords.concat(remainingLocal.filter(record => !remoteIds.has(record.id)));
    await storeReplace(storeName, merged);
    return true;
  }

  function publishNotes() {
    notesCache = memory.notes.slice();
    window.dispatchEvent(new Event("calendar-notes-updated"));
    scheduleNoteReminders();
  }

  function publishReminders() {
    remindersCache = memory.reminders.slice();
    window.dispatchEvent(new Event("calendar-reminders-updated"));
    scheduleReminderNotifications();
  }

  async function loadLocalData() {
    await migrateLegacyNotes();
    memory.notes = (await storeGetAll("notes")).map(normalizeNote);
    memory.reminders = (await storeGetAll("reminders")).map(normalizeReminder);
    notesCache = memory.notes.slice();
    remindersCache = memory.reminders.slice();
  }

  async function refresh() {
    if (refreshPromise) return refreshPromise;
    refreshPromise = (async () => {
      try {
        await loadLocalData();
        let notesSynced = false;
        let remindersSynced = false;
        if (navigator.onLine) {
          try { notesSynced = await syncStore("notes", "/notes", "notes", normalizeNote); }
          catch (error) { sessionReady = false; }
          try { remindersSynced = await syncStore("reminders", "/reminders", "reminders", normalizeReminder); }
          catch (error) { sessionReady = false; }
        }
        memory.notes = (await storeGetAll("notes")).map(normalizeNote);
        memory.reminders = (await storeGetAll("reminders")).map(normalizeReminder);
        publishNotes();
        publishReminders();
        return { notesSynced, remindersSynced, offline: !navigator.onLine };
      } catch (error) {
        console.warn("Hewtûjmêr could not refresh private data:", error.message);
        return { notesSynced: false, remindersSynced: false, offline: !navigator.onLine };
      } finally {
        refreshPromise = null;
      }
    })();
    return refreshPromise;
  }

  async function createNote(input) {
    await loadLocalData();
    const note = normalizeNote({
      ...input,
      id: input.id || createId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: "pendingCreate"
    });
    await storePut("notes", note);
    memory.notes = await storeGetAll("notes");
    publishNotes();
    await trySyncNotes();
    return note;
  }

  async function updateNote(id, changes) {
    const existing = (await storeGetAll("notes")).find(note => note.id === id);
    if (!existing) throw new Error("Note was not found.");
    const syncStatus = existing.syncStatus === "pendingCreate" ? "pendingCreate" : "pendingUpdate";
    const note = normalizeNote({ ...existing, ...changes, id, updatedAt: new Date().toISOString(), syncStatus });
    await storePut("notes", note);
    memory.notes = await storeGetAll("notes");
    publishNotes();
    await trySyncNotes();
    return note;
  }

  async function deleteNote(id) {
    const existing = (await storeGetAll("notes")).find(note => note.id === id);
    if (!existing) return;
    if (existing.syncStatus === "pendingCreate") {
      await storeDelete("notes", id);
    } else {
      await storePut("notes", { ...existing, syncStatus: "pendingDelete" });
      await trySyncNotes();
    }
    memory.notes = (await storeGetAll("notes")).filter(note => note.syncStatus !== "pendingDelete");
    publishNotes();
  }

  async function markReminderShown(id) {
    const existing = (await storeGetAll("notes")).find(note => note.id === id);
    if (!existing) return;
    await storePut("notes", {
      ...existing,
      reminderShownAt: new Date().toISOString(),
      syncStatus: existing.syncStatus === "pendingCreate" ? "pendingCreate" : "pendingUpdate"
    });
    memory.notes = await storeGetAll("notes");
    publishNotes();
    await trySyncNotes();
  }

  async function markCalendarReminderShown(id) {
    const existing = (await storeGetAll("reminders")).find(item => item.id === id);
    if (!existing) return;
    await updateReminder(id, { reminderShownAt: new Date().toISOString() });
  }

  async function trySyncNotes() {
    if (!navigator.onLine) return false;
    try {
      await syncStore("notes", "/notes", "notes", normalizeNote);
      memory.notes = await storeGetAll("notes");
      notesCache = memory.notes.slice();
      return true;
    } catch (error) {
      sessionReady = false;
      return false;
    }
  }

  async function createReminder(input) {
    const reminder = normalizeReminder({ ...input, id: input.id || createId(), syncStatus: "pendingCreate" });
    await storePut("reminders", reminder);
    memory.reminders = await storeGetAll("reminders");
    publishReminders();
    await trySyncReminders();
    return reminder;
  }

  async function updateReminder(id, changes) {
    const existing = (await storeGetAll("reminders")).find(item => item.id === id);
    if (!existing) throw new Error("Reminder was not found.");
    const syncStatus = existing.syncStatus === "pendingCreate" ? "pendingCreate" : "pendingUpdate";
    const reminder = normalizeReminder({ ...existing, ...changes, id, syncStatus });
    await storePut("reminders", reminder);
    memory.reminders = await storeGetAll("reminders");
    publishReminders();
    await trySyncReminders();
    return reminder;
  }

  async function completeReminder(id, completed = true) {
    return updateReminder(id, { completed: Boolean(completed) });
  }

  async function deleteReminder(id) {
    const existing = (await storeGetAll("reminders")).find(item => item.id === id);
    if (!existing) return;
    if (existing.syncStatus === "pendingCreate") {
      await storeDelete("reminders", id);
    } else {
      await storePut("reminders", { ...existing, syncStatus: "pendingDelete" });
      await trySyncReminders();
    }
    memory.reminders = (await storeGetAll("reminders")).filter(item => item.syncStatus !== "pendingDelete");
    publishReminders();
  }

  async function trySyncReminders() {
    if (!navigator.onLine) return false;
    try {
      await syncStore("reminders", "/reminders", "reminders", normalizeReminder);
      memory.reminders = await storeGetAll("reminders");
      remindersCache = memory.reminders.slice();
      return true;
    } catch (error) {
      sessionReady = false;
      return false;
    }
  }

  function getNotes() {
    return notesCache.filter(note => note.syncStatus !== "pendingDelete").slice();
  }

  function getNotesForDate(date) {
    const key = window.CalendarCore.dateKey(date);
    return getNotes().filter(note => note.date === key);
  }

  function getReminders() {
    return remindersCache.filter(reminder => reminder.syncStatus !== "pendingDelete").slice();
  }

  function scheduleNoteReminders() {
    const notes = getNotes();
    const activeKeys = new Set(notes.map(note => `note:${note.id}`));
    for (const [key, timer] of timers) {
      if (key.startsWith("note:") && !activeKeys.has(key)) {
        window.clearTimeout(timer);
        timers.delete(key);
      }
    }

    for (const note of notes) {
      if (!note.date || !note.time || note.reminderShownAt) continue;
      const timerKey = `note:${note.id}`;
      if (timers.has(timerKey)) continue;
      const eventTime = new Date(`${note.date}T${note.time}:00`).getTime();
      if (!Number.isFinite(eventTime) || eventTime < Date.now()) continue;
      const reminderTime = eventTime - (Number(note.remindBefore || 0) * 60000);
      const delay = Math.max(0, reminderTime - Date.now());
      const timer = window.setTimeout(async () => {
        timers.delete(timerKey);
        if (Date.now() < reminderTime) {
          scheduleNoteReminders();
          return;
        }
        await markReminderShown(note.id);
        const language = document.documentElement.lang || "en";
        window.CalendarNavigation.showReminderToast(note, language);
        if (window.Notification?.permission === "granted") {
          try {
            const translations = window.HewtujmerTranslations[language] || window.HewtujmerTranslations.en;
            const notification = new window.Notification(translations.reminderNotificationTitle, { body: note.text });
            window.setTimeout(() => notification.close(), 10000);
          } catch (error) {
            console.warn("The browser could not show a reminder notification.", error);
          }
        }
      }, Math.min(delay, 2147480000));
      timers.set(timerKey, timer);
    }
  }

  function scheduleReminderNotifications() {
    const reminders = getReminders();
    const activeKeys = new Set(reminders.map(reminder => `reminder:${reminder.id}`));
    for (const [key, timer] of timers) {
      if (key.startsWith("reminder:") && !activeKeys.has(key)) {
        window.clearTimeout(timer);
        timers.delete(key);
      }
    }

    for (const reminder of reminders) {
      if (reminder.completed || !reminder.notificationEnabled || reminder.reminderShownAt) continue;
      const timerKey = `reminder:${reminder.id}`;
      if (timers.has(timerKey)) continue;
      const eventTime = new Date(`${reminder.date}T${reminder.time}:00`).getTime();
      if (!Number.isFinite(eventTime) || eventTime < Date.now()) continue;
      const reminderTime = eventTime - (Number(reminder.remindBefore || 0) * 60000);
      const delay = Math.max(0, reminderTime - Date.now());
      const timer = window.setTimeout(async () => {
        timers.delete(timerKey);
        if (Date.now() < reminderTime) {
          scheduleReminderNotifications();
          return;
        }
        await markCalendarReminderShown(reminder.id);
        const language = document.documentElement.lang || "en";
        const message = reminder.description
          ? `${reminder.title}: ${reminder.description}`
          : reminder.title;
        window.CalendarNavigation.showReminderToast({ text: message }, language);
        if (window.Notification?.permission === "granted") {
          try {
            const translations = window.HewtujmerTranslations[language] || window.HewtujmerTranslations.en;
            const notification = new window.Notification(reminder.title, { body: reminder.description || translations.reminderNotificationTitle });
            window.setTimeout(() => notification.close(), 10000);
          } catch (error) {
            console.warn("The browser could not show a reminder notification.", error);
          }
        }
      }, Math.min(delay, 2147480000));
      timers.set(timerKey, timer);
    }
  }

  function requestNotificationPermission() {
    if (!window.Notification) return Promise.resolve("unsupported");
    return window.Notification.requestPermission();
  }

  function refreshCalendarContent() {
    if (window.CalendarMovements?.refresh) window.CalendarMovements.refresh();
    refresh();
  }

  function bindLifecycleRefresh() {
    let lastRefresh = 0;
    const requestRefresh = () => {
      if (!navigator.onLine) return;
      const now = Date.now();
      if (now - lastRefresh < 30000) return;
      lastRefresh = now;
      refreshCalendarContent();
      window.dispatchEvent(new Event("hewtujmer-content-refresh"));
    };
    window.addEventListener("pageshow", requestRefresh);
    window.addEventListener("online", requestRefresh);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) requestRefresh();
    });
  }

  window.HewtujmerData = Object.freeze({
    initialize: refresh,
    refresh,
    refreshCalendarContent,
    getNotes,
    getNotesForDate,
    createNote,
    updateNote,
    deleteNote,
    markReminderShown,
    getReminders,
    createReminder,
    updateReminder,
    completeReminder,
    deleteReminder,
    requestNotificationPermission,
    bindLifecycleRefresh
  });
})();
