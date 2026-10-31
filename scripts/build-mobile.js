"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "www");
const entries = ["index.html", "offline.html", "manifest.webmanifest", "service-worker.js", "icons", "static"];

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
for (const entry of entries) {
  fs.cpSync(path.join(root, entry), path.join(output, entry), { recursive: true });
}
console.log("Mobile web assets prepared in www/. API features require the hosted API URL.");
