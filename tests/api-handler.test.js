"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const apiHandler = require("../backend/services/api-handler");
const database = require("../backend/database/connection");

class MemoryPool {
  constructor() {
    this.notes = new Map();
    this.reminders = new Map();
  }

  async query(sql, values = []) {
    const statement = sql.replace(/\s+/g, " ").trim().toUpperCase();
    const now = () => new Date().toISOString();

    if (statement === "SELECT 1") return { rows: [{ "?COLUMN?": 1 }], rowCount: 1 };

    if (statement.startsWith("SELECT ID, TEXT, REMINDER_DATE")) {
      const [first, second] = values;
      if (statement.includes("WHERE ID = $1 AND OWNER_ID = $2")) {
        const row = this.notes.get(`${second}:${first}`);
        return { rows: row ? [{ ...row }] : [], rowCount: row ? 1 : 0 };
      }
      const rows = [...this.notes.values()].filter(row => row.owner_id === first).map(row => ({ ...row }));
      return { rows, rowCount: rows.length };
    }

    if (statement.startsWith("INSERT INTO NOTES")) {
      const [id, owner_id, text, reminder_date, reminder_time, remind_before_minutes, reminder_shown_at] = values;
      const key = `${owner_id}:${id}`;
      const previous = this.notes.get(key);
      const row = {
        id, owner_id, text, reminder_date, reminder_time, remind_before_minutes,
        reminder_shown_at, created_at: previous?.created_at || now(), updated_at: now()
      };
      this.notes.set(key, row);
      return { rows: [{ ...row }], rowCount: 1 };
    }

    if (statement.startsWith("UPDATE NOTES SET")) {
      const [id, owner_id, text, reminder_date, reminder_time, remind_before_minutes, reminder_shown_at] = values;
      const key = `${owner_id}:${id}`;
      const current = this.notes.get(key);
      if (!current) return { rows: [], rowCount: 0 };
      const row = { ...current, text, reminder_date, reminder_time, remind_before_minutes, reminder_shown_at, updated_at: now() };
      this.notes.set(key, row);
      return { rows: [{ ...row }], rowCount: 1 };
    }

    if (statement.startsWith("DELETE FROM NOTES")) {
      const [id, owner_id] = values;
      const key = `${owner_id}:${id}`;
      const exists = this.notes.has(key);
      this.notes.delete(key);
      return { rows: exists ? [{ id }] : [], rowCount: exists ? 1 : 0 };
    }

    if (statement.startsWith("SELECT ID, TITLE, DESCRIPTION, REMINDER_DATE")) {
      const [first, second] = values;
      if (statement.includes("WHERE ID = $1 AND OWNER_ID = $2")) {
        const row = this.reminders.get(`${second}:${first}`);
        return { rows: row ? [{ ...row }] : [], rowCount: row ? 1 : 0 };
      }
      const rows = [...this.reminders.values()].filter(row => row.owner_id === first).map(row => ({ ...row }));
      return { rows, rowCount: rows.length };
    }

    if (statement.startsWith("INSERT INTO REMINDERS")) {
      const [id, owner_id, title, description, reminder_date, reminder_time,
        completed, remind_before_minutes, notification_enabled, reminder_shown_at] = values;
      const key = `${owner_id}:${id}`;
      const previous = this.reminders.get(key);
      const row = {
        id, owner_id, title, description, reminder_date, reminder_time, completed,
        remind_before_minutes, notification_enabled, reminder_shown_at,
        created_at: previous?.created_at || now(), updated_at: now()
      };
      this.reminders.set(key, row);
      return { rows: [{ ...row }], rowCount: 1 };
    }

    if (statement.startsWith("UPDATE REMINDERS SET COMPLETED")) {
      const [id, owner_id, completed] = values;
      const key = `${owner_id}:${id}`;
      const current = this.reminders.get(key);
      if (!current) return { rows: [], rowCount: 0 };
      const row = { ...current, completed, updated_at: now() };
      this.reminders.set(key, row);
      return { rows: [{ ...row }], rowCount: 1 };
    }

    if (statement.startsWith("UPDATE REMINDERS SET TITLE")) {
      const [id, owner_id, title, description, reminder_date, reminder_time, completed,
        remind_before_minutes, notification_enabled, reminder_shown_at] = values;
      const key = `${owner_id}:${id}`;
      const current = this.reminders.get(key);
      if (!current) return { rows: [], rowCount: 0 };
      const row = {
        ...current, title, description, reminder_date, reminder_time, completed,
        remind_before_minutes, notification_enabled, reminder_shown_at, updated_at: now()
      };
      this.reminders.set(key, row);
      return { rows: [{ ...row }], rowCount: 1 };
    }

    if (statement.startsWith("DELETE FROM REMINDERS")) {
      const [id, owner_id] = values;
      const key = `${owner_id}:${id}`;
      const exists = this.reminders.has(key);
      this.reminders.delete(key);
      return { rows: exists ? [{ id }] : [], rowCount: exists ? 1 : 0 };
    }

    throw new Error(`Test database does not recognise SQL: ${statement}`);
  }
}

function request(method, url, options = {}) {
  return {
    method,
    url,
    originalUrl: url,
    headers: {
      host: options.host || "localhost:3000",
      ...(options.origin ? { origin: options.origin } : {}),
      ...(options.cookie ? { cookie: options.cookie } : {}),
      ...(options.fetchSite ? { "sec-fetch-site": options.fetchSite } : {})
    },
    body: options.body,
    socket: {}
  };
}

async function call(method, url, options = {}) {
  const req = request(method, url, options);
  const headers = {};
  let body = "";
  const res = {
    statusCode: 200,
    setHeader(name, value) { headers[name.toLowerCase()] = value; },
    end(value = "") { body = value; }
  };
  await apiHandler(req, res);
  return { status: res.statusCode, headers, body: body ? JSON.parse(body) : null };
}

test.before(() => {
  process.env.SESSION_SECRET = "api-test-secret-which-is-long-enough-123456";
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/hewtujmer_test";
  process.env.NODE_ENV = "test";
  process.env.CAPACITOR_ORIGINS = "capacitor://localhost,https://localhost,http://localhost";
  database.setPoolForTests(new MemoryPool());
});

test("health is available and reports the database state", async () => {
  const response = await call("GET", "/api/health");
  assert.equal(response.status, 200);
  assert.equal(response.body.status, "ok");
  assert.equal(response.body.database, "connected");
  assert.ok(response.body.version);
});

test("anonymous session creation is same-origin and notes are private per owner", async () => {
  const crossSite = await call("POST", "/api/session", { origin: "https://attacker.example", host: "localhost:3000", body: {} });
  assert.equal(crossSite.status, 403);

  const first = await call("POST", "/api/session", { origin: "http://localhost:3000", body: {} });
  assert.equal(first.status, 200);
  assert.equal(first.body.status, "created");
  const firstCookie = String(first.headers["set-cookie"]).split(";")[0];
  assert.ok(firstCookie.startsWith("hew_session="));

  const noSession = await call("GET", "/api/notes");
  assert.equal(noSession.status, 401);

  const noteId = randomUUID();
  const created = await call("POST", "/api/notes", {
    cookie: firstCookie,
    body: { id: noteId, text: "Test note", date: null, time: "", remindBefore: 0 }
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.note.text, "Test note");

  const second = await call("POST", "/api/session", { origin: "http://localhost:3000", body: {} });
  const secondCookie = String(second.headers["set-cookie"]).split(";")[0];
  const privateList = await call("GET", "/api/notes", { cookie: secondCookie });
  assert.equal(privateList.status, 200);
  assert.equal(privateList.body.notes.length, 0);

  const updated = await call("PATCH", `/api/notes/${noteId}`, {
    cookie: firstCookie,
    body: { text: "Updated note" }
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.note.text, "Updated note");

  const deleted = await call("DELETE", `/api/notes/${noteId}`, { cookie: firstCookie });
  assert.equal(deleted.status, 200);
  assert.equal(deleted.body.deleted, true);
});

test("reminder CRUD, completion and notification preferences work", async () => {
  const session = await call("POST", "/api/session", { origin: "http://localhost:3000", body: {} });
  const cookie = String(session.headers["set-cookie"]).split(";")[0];
  const id = randomUUID();
  const created = await call("POST", "/api/reminders", {
    cookie,
    body: {
      id, title: "Appointment", description: "Bring papers", date: "2026-11-01", time: "13:30",
      completed: false, remindBefore: 30, notificationEnabled: true
    }
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.reminder.remindBefore, 30);
  assert.equal(created.body.reminder.notificationEnabled, true);

  const updated = await call("PATCH", `/api/reminders/${id}`, {
    cookie,
    body: { title: "Updated appointment", notificationEnabled: false, remindBefore: 15 }
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.reminder.title, "Updated appointment");
  assert.equal(updated.body.reminder.notificationEnabled, false);

  const completed = await call("POST", `/api/reminders/${id}/complete`, { cookie, body: { completed: true } });
  assert.equal(completed.status, 200);
  assert.equal(completed.body.reminder.completed, true);

  const list = await call("GET", "/api/reminders", { cookie });
  assert.equal(list.status, 200);
  assert.equal(list.body.reminders.length, 1);

  const deleted = await call("DELETE", `/api/reminders/${id}`, { cookie });
  assert.equal(deleted.status, 200);
  assert.equal(deleted.body.deleted, true);
});

test("API validates request bodies and allows configured native preflight requests", async () => {
  const session = await call("POST", "/api/session", { origin: "http://localhost:3000", body: {} });
  const cookie = String(session.headers["set-cookie"]).split(";")[0];
  const invalid = await call("POST", "/api/reminders", {
    cookie,
    body: { title: "Bad", date: "2026-02-30", time: "14:00" }
  });
  assert.equal(invalid.status, 400);

  const preflight = await call("OPTIONS", "/api/reminders", { origin: "capacitor://localhost" });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers["access-control-allow-origin"], "capacitor://localhost");
});
