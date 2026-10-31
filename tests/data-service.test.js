"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { randomUUID } = require("node:crypto");

function loadService({ legacyNotes = null } = {}) {
  const values = new Map();
  if (legacyNotes) values.set("hewtujmer-notes-v1", JSON.stringify(legacyNotes));
  const listeners = new Map();
  const window = {
    HEWTUJMER_API_BASE_URL: "",
    indexedDB: null,
    crypto: { randomUUID },
    localStorage: {
      getItem: key => values.has(key) ? values.get(key) : null,
      setItem: (key, value) => values.set(key, value),
      removeItem: key => values.delete(key)
    },
    addEventListener(name, callback) {
      if (!listeners.has(name)) listeners.set(name, []);
      listeners.get(name).push(callback);
    },
    dispatchEvent() {},
    setTimeout: () => 1,
    clearTimeout() {}
  };
  const context = {
    window,
    navigator: { onLine: false },
    document: { documentElement: { lang: "en" }, hidden: false, addEventListener() {} },
    Event,
    Date,
    Map,
    Set,
    Promise,
    Math,
    Number,
    String,
    Array,
    Object,
    console
  };
  const source = fs.readFileSync(path.join(__dirname, "../static/data-service.js"), "utf8");
  vm.runInNewContext(source, context, { filename: "data-service.js" });
  return { service: window.HewtujmerData, values };
}

test("notes and reminders remain available locally without a database or network", async () => {
  const { service } = loadService();
  await service.initialize();
  const note = await service.createNote({ text: "Offline note", date: null, time: "", remindBefore: 0 });
  assert.equal(service.getNotes()[0].text, "Offline note");
  assert.equal(service.getNotes()[0].syncStatus, "pendingCreate");

  const reminder = await service.createReminder({
    title: "Offline task", description: "Local only", date: "2020-01-01", time: "09:00",
    completed: false, remindBefore: 15, notificationEnabled: false
  });
  assert.equal(service.getReminders()[0].title, "Offline task");
  assert.equal(service.getReminders()[0].syncStatus, "pendingCreate");
  await service.completeReminder(reminder.id, true);
  assert.equal(service.getReminders()[0].completed, true);
  await service.deleteNote(note.id);
  await service.deleteReminder(reminder.id);
  assert.equal(service.getNotes().length, 0);
  assert.equal(service.getReminders().length, 0);
});

test("legacy notes are imported and retained when persistent storage is unavailable", async () => {
  const { service, values } = loadService({
    legacyNotes: [{ id: randomUUID(), text: "Legacy note", date: "2026-10-31", time: "", remindBefore: 0 }]
  });
  await service.initialize();
  assert.equal(service.getNotes()[0].text, "Legacy note");
  assert.equal(values.has("hewtujmer-notes-v1"), true);
});
