"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const coreSource = fs.readFileSync(path.join(__dirname, "../static/calendar-core.js"), "utf8");
const eventsSource = fs.readFileSync(path.join(__dirname, "../static/calendar-events.js"), "utf8");
const movementData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../static/calendar-movements.json"), "utf8")
);

const sandbox = {
  window: {
    dispatchEvent() {}
  },
  console,
  Date,
  Math,
  Intl,
  Number,
  String,
  Array,
  Object,
  RegExp,
  Promise,
  fetch: () => Promise.resolve({
    ok: true,
    json: () => Promise.resolve(movementData)
  }),
  Event: function Event(type) {
    this.type = type;
  }
};

vm.runInNewContext(coreSource, sandbox, { filename: "calendar-core.js" });
vm.runInNewContext(eventsSource, sandbox, { filename: "calendar-events.js" });

const Core = sandbox.window.CalendarCore;
const Movements = sandbox.window.CalendarMovements;

async function getEvents(date, language) {
  await Movements.load();
  return Movements.getForDate(date, language);
}

test("Peshmerga Day is on 26 Sarmawez and is localized", async () => {
  const date = new Date(2026, 11, 17);
  const parts = Core.kurdishDateParts(date);
  assert.equal(parts.month, 8);
  assert.equal(parts.day, 26);

  const sorani = await getEvents(date, "ckb");
  const kurmanji = await getEvents(date, "kmr");
  const english = await getEvents(date, "en");

  assert.ok(sorani.some(item => item.title === "ڕۆژی پێشمەرگەی کوردستان"));
  assert.ok(kurmanji.some(item => item.title === "Roja Pêşmergey Kurdistanê"));
  assert.ok(english.some(item => item.title === "Kurdistan Peshmerga Day"));
});

test("Kurdistan Republic anniversary remains on 2 Rêbendan", async () => {
  const date = new Date(2026, 0, 22);
  const parts = Core.kurdishDateParts(date);
  assert.equal(parts.month, 10);
  assert.equal(parts.day, 2);

  const english = await getEvents(date, "en");
  assert.ok(english.some(item => item.title.includes("Republic of Kurdistan")));
});
