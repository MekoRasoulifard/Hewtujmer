"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "../static/calendar-core.js"), "utf8");
const sandbox = { window: {}, Date, Math, Intl, Number, String, Array, Object, RegExp };
vm.runInNewContext(source, sandbox, { filename: "calendar-core.js" });
const Core = sandbox.window.CalendarCore;

test("Gregorian date keys round-trip and reject invalid dates", () => {
  const leapDay = new Date(2024, 1, 29);
  assert.equal(Core.dateKey(leapDay), "2024-02-29");
  assert.equal(Core.dateKey(Core.dateFromKey("2024-02-29")), "2024-02-29");
  assert.equal(Core.dateFromKey("2025-02-29"), null);
  assert.equal(Core.dateFromKey("2024-13-01"), null);
  assert.equal(Core.dateFromKey("bad-date"), null);
});

test("Week starts on Monday and ISO week values remain available", () => {
  const sunday = new Date(2026, 10, 1);
  assert.equal(Core.dateKey(Core.startOfWeek(sunday)), "2026-10-26");
  assert.equal(Core.mondayIndex(sunday), 6);
  assert.equal(Core.isoWeekInfo(new Date(2026, 0, 1)).week, 1);
});

test("Kurdish year changes at March 21 and month lengths total the year", () => {
  const before = new Date(2026, 2, 20);
  const start = new Date(2026, 2, 21);
  assert.equal(Core.kurdishYearForDate(before), 2725);
  assert.equal(Core.kurdishYearForDate(start), 2726);
  const year = Core.kurdishYearForDate(start);
  const total = Array.from({ length: 12 }, (_, month) => Core.kurdishMonthLength(year, month))
    .reduce((sum, length) => sum + length, 0);
  assert.equal(total, Core.daysInKurdishYear(year));
  assert.ok([365, 366].includes(total));
});

test("Search parses valid ISO dates and ISO week references", () => {
  const parsedDate = Core.parseSearch("2026-10-31");
  assert.equal(parsedDate.type, "date");
  assert.equal(Core.dateKey(parsedDate.date), "2026-10-31");
  const parsedWeek = Core.parseSearch("week 44 2026");
  assert.equal(parsedWeek.type, "week");
  assert.equal(Core.parseSearch("week 99 2026"), null);
  assert.equal(Core.parseSearch("2026-02-30"), null);
});

test("Sorani date formatting keeps Kurdish suffixes and month names", () => {
  const date = new Date(2026, 9, 1);
  assert.equal(Core.formatGregorian(date, "ckb"), "١ی ئوکتۆبەری ٢٠٢٦ی زایینی");
  assert.match(Core.formatKurdishDate(date, "ckb"), /ی کوردی$/);
});
