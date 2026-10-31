"use strict";

require("dotenv").config();
const path = require("node:path");
const express = require("express");
const apiHandler = require("./services/api-handler");
const session = require("./services/session");
const database = require("./database/connection");
const { closePool } = database;

const ROOT = path.resolve(__dirname, "..");
const app = express();
const port = Number(process.env.PORT || 3000);

app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});
app.use("/api", (req, res) => apiHandler(req, res));
const staticOptions = {
  etag: true,
  maxAge: "0",
  setHeaders(res, filePath) {
    res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
  }
};
app.get(["/", "/index.html"], (req, res) => res.sendFile(path.join(ROOT, "index.html")));
app.get("/offline.html", (req, res) => res.sendFile(path.join(ROOT, "offline.html")));
app.get("/manifest.webmanifest", (req, res) => {
  res.type("application/manifest+json");
  res.sendFile(path.join(ROOT, "manifest.webmanifest"));
});
app.get("/service-worker.js", (req, res) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.type("application/javascript");
  res.sendFile(path.join(ROOT, "service-worker.js"));
});
app.use("/static", express.static(path.join(ROOT, "static"), staticOptions));
app.use("/icons", express.static(path.join(ROOT, "icons"), staticOptions));
app.use((req, res) => {
  res.status(404).send("Not found");
});

if (require.main === module) {
  const server = app.listen(port, async () => {
    console.info(`Hewtûjmêr calendar is listening at http://localhost:${port}`);

    try {
      session.validateSessionSecret();
      console.info("Private browser sessions: configured.");
    } catch (error) {
      console.error(`Private browser sessions: not ready (${error.code}). ${error.message}`);
    }

    try {
      await database.checkDatabase();
      console.info("Notes and reminders: PostgreSQL connected; required tables and columns are ready.");
    } catch (error) {
      console.error(`Notes and reminders: database not ready (${error.code || "DATABASE_UNAVAILABLE"}).`);
      if (error.missing?.length) {
        console.error(`Missing schema elements: ${error.missing.join(", ")}`);
      } else if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
        console.error(error.message);
      }
      console.warn("The calendar remains available. Notes and reminders will sync when the database is ready.");
    }
  });
  const shutdown = async () => {
    server.close(async () => {
      await closePool().catch(() => {});
      process.exit(0);
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

module.exports = app;
