"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "public");
const publicEntries = ["index.html", "offline.html", "manifest.webmanifest", "service-worker.js", "icons", "static"];

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const entry of publicEntries) {
  const source = path.join(root, entry);
  if (!fs.existsSync(source)) {
    throw new Error(`Required public asset is missing: ${entry}`);
  }
  fs.cpSync(source, path.join(output, entry), { recursive: true });
}

console.log("Vercel static assets prepared in public/. Backend files remain in serverless functions.");
