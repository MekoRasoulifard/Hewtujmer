"use strict";

const db = require("../database/connection");
const session = require("./session");
const { validateNote, validateReminder } = require("./validation");

const APP_VERSION = require("../../package.json").version;
const MAX_BODY_BYTES = 32 * 1024;

function corsHeaders(req) {
  const origin = req.headers?.origin;
  if (!origin || !session.isAllowedNativeOrigin(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    Vary: "Origin"
  };
}

function send(res, statusCode, data, headers = {}, req = null) {
  const request = req || (headers && typeof headers.method === "string" ? headers : null);
  const responseHeaders = request === headers ? {} : headers;
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (request) {
    for (const [name, value] of Object.entries(corsHeaders(request))) res.setHeader(name, value);
  }
  for (const [name, value] of Object.entries(responseHeaders)) res.setHeader(name, value);
  if (statusCode === 204) {
    res.end();
    return;
  }
  res.end(JSON.stringify(data));
}

async function readBody(req) {
  if (req.body !== undefined) {
    if (typeof req.body === "string") {
      try { return JSON.parse(req.body); }
      catch (error) { throw Object.assign(new Error("Request body must contain valid JSON."), { statusCode: 400 }); }
    }
    return req.body;
  }

  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      throw Object.assign(new Error("Request body is too large."), { statusCode: 413 });
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch (error) { throw Object.assign(new Error("Request body must contain valid JSON."), { statusCode: 400 }); }
}

function getPath(req) {
  const raw = req.originalUrl || req.url || "/api/health";
  const pathname = new URL(raw, "http://localhost").pathname;
  const apiIndex = pathname.indexOf("/api/");
  return apiIndex >= 0 ? pathname.slice(apiIndex + 5).split("/").filter(Boolean) : [];
}

function dateValue(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function mapNote(row) {
  return {
    id: row.id,
    text: row.text,
    date: dateValue(row.reminder_date),
    time: row.reminder_time ? String(row.reminder_time).slice(0, 5) : "",
    remindBefore: row.remind_before_minutes,
    reminderShownAt: row.reminder_shown_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapReminder(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    date: dateValue(row.reminder_date),
    time: String(row.reminder_time).slice(0, 5),
    completed: row.completed,
    remindBefore: row.remind_before_minutes,
    notificationEnabled: row.notification_enabled,
    reminderShownAt: row.reminder_shown_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function isDevelopment() {
  return process.env.NODE_ENV !== "production" && !process.env.VERCEL;
}

function sendSessionConfigurationError(res, error, req) {
  const response = {
    error: "The private session service is not configured.",
    code: "SESSION_CONFIGURATION_REQUIRED"
  };
  if (isDevelopment()) {
    response.details = error.code === "SESSION_SECRET_TOO_SHORT"
      ? "SESSION_SECRET must contain at least 32 characters. Generate a new random value and restart the server."
      : "SESSION_SECRET is missing. Add it to the project .env file and restart the server.";
  }
  send(res, 503, response, req);
}

function sendDatabaseError(res, error, req) {
  const code = error.code || "";
  const response = {
    error: "The notes and reminders database is not ready.",
    code: "DATABASE_UNAVAILABLE"
  };

  if (code === "SESSION_SECRET_MISSING" || code === "SESSION_SECRET_TOO_SHORT") {
    sendSessionConfigurationError(res, error, req);
    return;
  }

  if (code === "DATABASE_SCHEMA_MISMATCH") {
    response.code = "DATABASE_SCHEMA_MISMATCH";
    response.error = "PostgreSQL is reachable, but the notes/reminders tables do not match the required schema.";
    if (isDevelopment()) response.missing = error.missing || [];
    console.error("Hewtûjmêr database schema check failed:", (error.missing || []).join(", "));
    send(res, 503, response, req);
    return;
  }

  const configurationCodes = ["DATABASE_URL_MISSING", "DATABASE_URL_INVALID", "PG_DRIVER_MISSING"];
  if (configurationCodes.includes(code)) {
    response.code = code;
    if (isDevelopment()) response.details = error.message;
  } else if (isDevelopment()) {
    const diagnostics = {
      ECONNREFUSED: "PostgreSQL refused the connection. Confirm that the local PostgreSQL service is running and DATABASE_URL uses the correct host and port.",
      ENOTFOUND: "The database host could not be found. Check the host in DATABASE_URL.",
      ETIMEDOUT: "The database connection timed out. Check network access and the database host.",
      CERT_HAS_EXPIRED: "The database TLS certificate has expired. Check the provider certificate and connection settings.",
      "28P01": "PostgreSQL rejected the supplied credentials. Check the username and password in the private .env file.",
      "3D000": "The database name in DATABASE_URL does not exist.",
      "42P01": "A required database table does not exist. Check the notes/reminders migration."
    };
    response.details = diagnostics[code] || "Check the local server log for the database error. Credentials are not included in this response.";
  }

  console.error("Hewtûjmêr database request failed:", code || "UNKNOWN_DATABASE_ERROR");
  send(res, 503, response, req);
}

async function handleHealth(req, res) {
  try {
    const databaseStatus = await db.checkDatabase();
    send(res, 200, {
      status: "ok",
      application: "ready",
      version: APP_VERSION,
      ...databaseStatus,
      timestamp: new Date().toISOString()
    }, req);
  } catch (error) {
    const response = {
      status: "degraded",
      application: "calendar-available",
      database: "unavailable",
      version: APP_VERSION,
      code: error.code || "DATABASE_UNAVAILABLE",
      timestamp: new Date().toISOString()
    };
    if (isDevelopment()) {
      response.details = error.message;
      if (error.missing) response.missing = error.missing;
    }
    send(res, 503, response, req);
  }
}

async function handleSession(req, res) {
  if (req.method !== "POST") {
    send(res, 405, { error: "Method not allowed." }, { Allow: "POST" }, req);
    return;
  }
  if (!session.assertSameOrigin(req)) {
    send(res, 403, { error: "Cross-site session requests are not allowed." }, req);
    return;
  }
  try {
    const existingOwner = session.getOwnerId(req);
    if (existingOwner) {
      send(res, 200, { status: "ready", ownerId: existingOwner }, req);
      return;
    }
    const created = session.createSession();
    send(res, 200, { status: "created", ownerId: created.ownerId }, { "Set-Cookie": session.sessionCookie(created.token, req) }, req);
  } catch (error) {
    sendSessionConfigurationError(res, error, req);
  }
}

async function requireOwner(req, res) {
  const ownerId = session.getOwnerId(req);
  if (!ownerId) {
    send(res, 401, { error: "A private browser session is required.", code: "SESSION_REQUIRED" }, req);
    return null;
  }
  return ownerId;
}

async function handleNotes(req, res, ownerId, id) {
  const method = req.method;
  if (!id && method === "GET") {
    const result = await db.query(
      `SELECT id, text, reminder_date, reminder_time, remind_before_minutes,
              reminder_shown_at, created_at, updated_at
         FROM notes WHERE owner_id = $1
         ORDER BY reminder_date NULLS LAST, reminder_time NULLS LAST, created_at DESC`,
      [ownerId]
    );
    send(res, 200, { notes: result.rows.map(mapNote) }, req);
    return;
  }

  if (!id && method === "POST") {
    const input = validateNote(await readBody(req));
    const result = await db.query(
      `INSERT INTO notes (id, owner_id, text, reminder_date, reminder_time,
                          remind_before_minutes, reminder_shown_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id, owner_id) DO UPDATE SET
         text = EXCLUDED.text,
         reminder_date = EXCLUDED.reminder_date,
         reminder_time = EXCLUDED.reminder_time,
         remind_before_minutes = EXCLUDED.remind_before_minutes,
         reminder_shown_at = EXCLUDED.reminder_shown_at,
         updated_at = CURRENT_TIMESTAMP
       RETURNING id, text, reminder_date, reminder_time, remind_before_minutes,
                 reminder_shown_at, created_at, updated_at`,
      [input.id, ownerId, input.text, input.date, input.time, input.remindBefore, input.reminderShownAt || null]
    );
    send(res, 201, { note: mapNote(result.rows[0]) }, req);
    return;
  }

  if (id && ["PATCH", "PUT"].includes(method)) {
    const currentResult = await db.query(
      `SELECT id, text, reminder_date, reminder_time, remind_before_minutes,
              reminder_shown_at, created_at, updated_at
         FROM notes WHERE id = $1 AND owner_id = $2`,
      [id, ownerId]
    );
    if (!currentResult.rows.length) {
      send(res, 404, { error: "Note was not found." }, req);
      return;
    }
    const current = mapNote(currentResult.rows[0]);
    const patch = validateNote(await readBody(req), true);
    const merged = validateNote({ ...current, ...patch, id });
    const result = await db.query(
      `UPDATE notes SET text = $3, reminder_date = $4, reminder_time = $5,
                         remind_before_minutes = $6, reminder_shown_at = $7,
                         updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND owner_id = $2
       RETURNING id, text, reminder_date, reminder_time, remind_before_minutes,
                 reminder_shown_at, created_at, updated_at`,
      [id, ownerId, merged.text, merged.date, merged.time, merged.remindBefore, merged.reminderShownAt || null]
    );
    send(res, 200, { note: mapNote(result.rows[0]) }, req);
    return;
  }

  if (id && method === "DELETE") {
    const result = await db.query("DELETE FROM notes WHERE id = $1 AND owner_id = $2 RETURNING id", [id, ownerId]);
    if (!result.rowCount) {
      send(res, 404, { error: "Note was not found." }, req);
      return;
    }
    send(res, 200, { deleted: true, id }, req);
    return;
  }

  send(res, 405, { error: "Method not allowed." }, { Allow: id ? "PATCH, PUT, DELETE" : "GET, POST" }, req);
}

async function handleReminders(req, res, ownerId, id, action) {
  if (action === "complete" && id && req.method === "POST") {
    const body = await readBody(req);
    const completed = body.completed === undefined ? true : body.completed;
    if (typeof completed !== "boolean") {
      send(res, 400, { error: "Completed must be true or false." }, req);
      return;
    }
    const result = await db.query(
      `UPDATE reminders SET completed = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND owner_id = $2
       RETURNING id, title, description, reminder_date, reminder_time, completed,
                 remind_before_minutes, notification_enabled, reminder_shown_at, created_at, updated_at`,
      [id, ownerId, completed]
    );
    if (!result.rows.length) {
      send(res, 404, { error: "Reminder was not found." }, req);
      return;
    }
    send(res, 200, { reminder: mapReminder(result.rows[0]) }, req);
    return;
  }

  if (!id && req.method === "GET") {
    const result = await db.query(
      `SELECT id, title, description, reminder_date, reminder_time, completed,
              remind_before_minutes, notification_enabled, reminder_shown_at, created_at, updated_at
         FROM reminders WHERE owner_id = $1
         ORDER BY reminder_date, reminder_time, created_at DESC`,
      [ownerId]
    );
    send(res, 200, { reminders: result.rows.map(mapReminder) }, req);
    return;
  }

  if (!id && req.method === "POST") {
    const input = validateReminder(await readBody(req));
    const result = await db.query(
      `INSERT INTO reminders (id, owner_id, title, description, reminder_date, reminder_time,
                             completed, remind_before_minutes, notification_enabled, reminder_shown_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id, owner_id) DO UPDATE SET
         title = EXCLUDED.title, description = EXCLUDED.description,
         reminder_date = EXCLUDED.reminder_date, reminder_time = EXCLUDED.reminder_time,
         completed = EXCLUDED.completed, remind_before_minutes = EXCLUDED.remind_before_minutes,
         notification_enabled = EXCLUDED.notification_enabled,
         reminder_shown_at = EXCLUDED.reminder_shown_at, updated_at = CURRENT_TIMESTAMP
       RETURNING id, title, description, reminder_date, reminder_time, completed,
                 remind_before_minutes, notification_enabled, reminder_shown_at, created_at, updated_at`,
      [input.id, ownerId, input.title, input.description, input.date, input.time,
        input.completed, input.remindBefore, input.notificationEnabled, input.reminderShownAt || null]
    );
    send(res, 201, { reminder: mapReminder(result.rows[0]) }, req);
    return;
  }

  if (id && ["PATCH", "PUT"].includes(req.method)) {
    const existing = await db.query(
      `SELECT id, title, description, reminder_date, reminder_time, completed,
              remind_before_minutes, notification_enabled, reminder_shown_at
         FROM reminders WHERE id = $1 AND owner_id = $2`, [id, ownerId]
    );
    if (!existing.rows.length) {
      send(res, 404, { error: "Reminder was not found." }, req);
      return;
    }
    const row = existing.rows[0];
    const current = {
      id,
      title: row.title,
      description: row.description,
      date: dateValue(row.reminder_date),
      time: String(row.reminder_time).slice(0, 5),
      completed: row.completed,
      remindBefore: row.remind_before_minutes,
      notificationEnabled: row.notification_enabled,
      reminderShownAt: row.reminder_shown_at
    };
    const patch = validateReminder(await readBody(req), true);
    const merged = validateReminder({ ...current, ...patch, id });
    const result = await db.query(
      `UPDATE reminders SET title = $3, description = $4, reminder_date = $5,
                            reminder_time = $6, completed = $7, remind_before_minutes = $8,
                            notification_enabled = $9, reminder_shown_at = $10,
                            updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND owner_id = $2
       RETURNING id, title, description, reminder_date, reminder_time, completed,
                 remind_before_minutes, notification_enabled, reminder_shown_at, created_at, updated_at`,
      [id, ownerId, merged.title, merged.description, merged.date, merged.time,
        merged.completed, merged.remindBefore, merged.notificationEnabled, merged.reminderShownAt || null]
    );
    send(res, 200, { reminder: mapReminder(result.rows[0]) }, req);
    return;
  }

  if (id && req.method === "DELETE") {
    const result = await db.query("DELETE FROM reminders WHERE id = $1 AND owner_id = $2 RETURNING id", [id, ownerId]);
    if (!result.rowCount) {
      send(res, 404, { error: "Reminder was not found." }, req);
      return;
    }
    send(res, 200, { deleted: true, id }, req);
    return;
  }

  send(res, 405, { error: "Method not allowed." }, { Allow: "GET, POST, PATCH, PUT, DELETE" }, req);
}

async function apiHandler(req, res) {
  if (req.method === "OPTIONS") {
    const headers = corsHeaders(req);
    if (!Object.keys(headers).length) {
      send(res, 403, { error: "This API origin is not allowed." }, {}, req);
      return;
    }
    send(res, 204, null, headers, req);
    return;
  }

  const parts = getPath(req);
  const [resource, id, action] = parts;

  try {
    if (resource === "health" && parts.length === 1) {
      if (req.method !== "GET") {
        send(res, 405, { error: "Method not allowed." }, { Allow: "GET" }, req);
        return;
      }
      await handleHealth(req, res);
      return;
    }

    if (resource === "session" && parts.length === 1) {
      await handleSession(req, res);
      return;
    }

    if (!["notes", "reminders"].includes(resource) || parts.length > 3) {
      send(res, 404, { error: "API endpoint was not found." }, req);
      return;
    }

    const ownerId = await requireOwner(req, res);
    if (!ownerId) return;

    if (resource === "notes") {
      if (parts.length > 2) {
        send(res, 404, { error: "API endpoint was not found." }, req);
        return;
      }
      await handleNotes(req, res, ownerId, id);
      return;
    }

    await handleReminders(req, res, ownerId, id, action);
  } catch (error) {
    if (error.code === "SESSION_SECRET_MISSING" || error.code === "SESSION_SECRET_TOO_SHORT") {
      sendSessionConfigurationError(res, error, req);
      return;
    }
    if (error.statusCode) {
      send(res, error.statusCode, { error: error.message }, req);
      return;
    }
    if (error.message && /(required|must be|valid|between|characters|JSON object|not valid)/i.test(error.message)) {
      send(res, 400, { error: error.message }, req);
      return;
    }
    sendDatabaseError(res, error, req);
  }
}

module.exports = apiHandler;
