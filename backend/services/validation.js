"use strict";

const { randomUUID } = require("node:crypto");

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function cleanText(value, label, maximum, optional = false) {
  if (value === undefined || value === null) {
    if (optional) return "";
    throw new Error(`${label} is required.`);
  }
  if (typeof value !== "string") throw new Error(`${label} must be text.`);
  const text = value.trim();
  if (!text && !optional) throw new Error(`${label} is required.`);
  if (text.length > maximum) throw new Error(`${label} must be ${maximum} characters or fewer.`);
  return text;
}

function validDate(value, optional = true) {
  if (value === undefined || value === null || value === "") {
    if (optional) return null;
    throw new Error("Date is required.");
  }
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Date must use YYYY-MM-DD format.");
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error("Date is not valid.");
  }
  return value;
}

function validTime(value, optional = true) {
  if (value === undefined || value === null || value === "") {
    if (optional) return null;
    throw new Error("Time is required.");
  }
  if (typeof value !== "string" || !/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(value)) {
    throw new Error("Time must use HH:MM format.");
  }
  return value.slice(0, 5);
}

function validMinutes(value, fallback = 0) {
  const minutes = value === undefined || value === null ? fallback : Number(value);
  if (!Number.isInteger(minutes) || minutes < 0 || minutes > 10080) {
    throw new Error("Reminder minutes must be between 0 and 10080.");
  }
  return minutes;
}

function validId(value) {
  if (value === undefined || value === null || value === "") return randomUUID();
  if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new Error("ID must be a valid UUID.");
  }
  return value;
}

function validateNote(input, partial = false) {
  if (!isObject(input)) throw new Error("A JSON object is required.");
  const note = {};

  if (!partial || Object.hasOwn(input, "text")) {
    note.text = cleanText(input.text, "Note", 2000);
  }
  if (!partial || Object.hasOwn(input, "date")) {
    note.date = validDate(input.date);
  }
  if (!partial || Object.hasOwn(input, "time")) {
    note.time = validTime(input.time);
  }
  if (!partial || Object.hasOwn(input, "remindBefore")) {
    note.remindBefore = validMinutes(input.remindBefore);
  }
  if (Object.hasOwn(input, "reminderShownAt")) {
    if (input.reminderShownAt === null || input.reminderShownAt === "") {
      note.reminderShownAt = null;
    } else {
      const date = new Date(input.reminderShownAt);
      if (Number.isNaN(date.getTime())) throw new Error("Reminder status date is invalid.");
      note.reminderShownAt = date.toISOString();
    }
  }
  if (!partial) note.id = validId(input.id);
  if (note.time && note.date === null) throw new Error("A reminder time requires a date.");
  return note;
}

function validateReminder(input, partial = false) {
  if (!isObject(input)) throw new Error("A JSON object is required.");
  const reminder = {};
  if (!partial || Object.hasOwn(input, "title")) {
    reminder.title = cleanText(input.title, "Title", 180);
  }
  if (!partial || Object.hasOwn(input, "description")) {
    reminder.description = cleanText(input.description, "Description", 2000, true);
  }
  if (!partial || Object.hasOwn(input, "date")) {
    reminder.date = validDate(input.date, false);
  }
  if (!partial || Object.hasOwn(input, "time")) {
    reminder.time = validTime(input.time, false);
  }
  if (!partial || Object.hasOwn(input, "completed")) {
    if (input.completed !== undefined && typeof input.completed !== "boolean") {
      throw new Error("Completed must be true or false.");
    }
    reminder.completed = Boolean(input.completed);
  }
  if (!partial || Object.hasOwn(input, "remindBefore")) {
    reminder.remindBefore = validMinutes(input.remindBefore);
  }
  if (!partial || Object.hasOwn(input, "notificationEnabled")) {
    if (input.notificationEnabled !== undefined && typeof input.notificationEnabled !== "boolean") {
      throw new Error("Notification setting must be true or false.");
    }
    reminder.notificationEnabled = input.notificationEnabled !== false;
  }
  if (Object.hasOwn(input, "reminderShownAt")) {
    if (input.reminderShownAt === null || input.reminderShownAt === "") {
      reminder.reminderShownAt = null;
    } else {
      const shownAt = new Date(input.reminderShownAt);
      if (Number.isNaN(shownAt.getTime())) throw new Error("Reminder status date is invalid.");
      reminder.reminderShownAt = shownAt.toISOString();
    }
  }
  if (!partial) reminder.id = validId(input.id);
  return reminder;
}

module.exports = {
  isObject,
  cleanText,
  validDate,
  validTime,
  validMinutes,
  validId,
  validateNote,
  validateReminder
};
