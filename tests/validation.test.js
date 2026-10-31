"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { validateNote, validateReminder, validDate, validTime } = require("../backend/services/validation");

test("validates notes and preserves optional reminder values", () => {
  const note = validateNote({ id: randomUUID(), text: "  Test note  ", date: "2026-10-31", time: "09:30", remindBefore: 15 });
  assert.equal(note.text, "Test note");
  assert.equal(note.date, "2026-10-31");
  assert.equal(note.time, "09:30");
  assert.equal(note.remindBefore, 15);
  assert.equal(validateNote({ text: "No scheduled reminder" }).date, null);
});

test("rejects invalid note dates, times and excessive text", () => {
  assert.throws(() => validDate("2026-02-30"), /not valid/i);
  assert.throws(() => validTime("25:61"), /HH:MM/);
  assert.throws(() => validateNote({ text: "A".repeat(2001) }), /2000 characters/);
  assert.throws(() => validateNote({ text: "Text", date: null, time: "09:00" }), /requires a date/);
});

test("validates reminder fields and notification settings", () => {
  const reminder = validateReminder({
    id: randomUUID(), title: "Appointment", description: "Bring documents",
    date: "2026-11-01", time: "14:15", completed: false,
    remindBefore: 30, notificationEnabled: true
  });
  assert.equal(reminder.title, "Appointment");
  assert.equal(reminder.remindBefore, 30);
  assert.equal(reminder.notificationEnabled, true);
  assert.throws(() => validateReminder({ title: "Bad", date: "2026-11-01", time: "14:15", notificationEnabled: "yes" }), /true or false/);
  assert.throws(() => validateReminder({ title: "Bad", date: "2026-11-01", time: "14:15", remindBefore: 10081 }), /between 0 and 10080/);
});

test("partial updates only validate the supplied fields", () => {
  assert.deepEqual(validateReminder({ completed: true }, true), { completed: true });
  assert.deepEqual(validateNote({ reminderShownAt: null }, true), { reminderShownAt: null });
});
