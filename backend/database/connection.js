
"use strict";

let pool = null;

const REQUIRED_COLUMNS = Object.freeze({
  notes: [
    "id", "owner_id", "text", "reminder_date", "reminder_time",
    "remind_before_minutes", "reminder_shown_at", "created_at", "updated_at"
  ],
  reminders: [
    "id", "owner_id", "title", "description", "reminder_date", "reminder_time",
    "completed", "remind_before_minutes", "notification_enabled",
    "reminder_shown_at", "created_at", "updated_at"
  ]
});

function makeConfigurationError(message, code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function getPool() {
  const required = [
    "DB_HOST",
    "DB_NAME",
    "DB_USER",
    "DB_PASSWORD"
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length) {
    throw makeConfigurationError(
      `Missing database configuration: ${missing.join(", ")}`,
      "DATABASE_CONFIG_MISSING"
    );
  }

  if (!pool) {
    let Pool;

    try {
      ({ Pool } = require("pg"));
    } catch (error) {
      throw makeConfigurationError(
        "PostgreSQL driver is not installed. Run npm install.",
        "PG_DRIVER_MISSING"
      );
    }

    const isServerless = Boolean(process.env.VERCEL);

    const hostname = process.env.DB_HOST.toLowerCase();
    const isLocal = ["localhost", "127.0.0.1", "::1"].includes(hostname);

    const connectionOptions = {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,

      // Password is passed directly, so # and commas remain unchanged.
      password: process.env.DB_PASSWORD,

      max: isServerless ? 1 : 5,
      idleTimeoutMillis: isServerless ? 10000 : 30000,
      connectionTimeoutMillis: 5000,
      allowExitOnIdle: false
    };

    if (!isLocal) {
      connectionOptions.ssl = {
        rejectUnauthorized: true
      };
    }

    pool = new Pool(connectionOptions);

    pool.on("error", error => {
      console.error(
        "Unexpected idle PostgreSQL client error:",
        error.code || error.message
      );
    });
  }

  return pool;
}

async function query(text, values = []) {
  return getPool().query(text, values);
}

async function checkDatabase() {
  await query("SELECT 1");

  const result = await query(
    `SELECT table_name, column_name
       FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = ANY($1::text[])`,
    [Object.keys(REQUIRED_COLUMNS)]
  );

  const actual = new Map();

  for (const row of result.rows) {
    if (!actual.has(row.table_name)) {
      actual.set(row.table_name, new Set());
    }

    actual.get(row.table_name).add(row.column_name);
  }

  const missing = [];

  for (const [tableName, columns] of Object.entries(REQUIRED_COLUMNS)) {
    if (!actual.has(tableName)) {
      missing.push(`${tableName} (table missing)`);
      continue;
    }

    for (const column of columns) {
      if (!actual.get(tableName).has(column)) {
        missing.push(`${tableName}.${column}`);
      }
    }
  }

  if (missing.length) {
    const error = new Error(
      "PostgreSQL is reachable, but the notes/reminders schema is incomplete."
    );

    error.code = "DATABASE_SCHEMA_MISMATCH";
    error.missing = missing;

    throw error;
  }

  return {
    database: "connected",
    schema: "ready"
  };
}

async function closePool() {
  if (!pool) return;

  const current = pool;
  pool = null;

  await current.end();
}

function setPoolForTests(testPool) {
  pool = testPool;
}

module.exports = {
  getPool,
  query,
  checkDatabase,
  closePool,
  setPoolForTests
};
