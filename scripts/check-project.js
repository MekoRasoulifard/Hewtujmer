"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const excluded = new Set(["node_modules", ".git", ".vercel", "www", "public", "android", "ios"]);
const errors = [];
const javascriptFiles = [];

function walk(folder) {
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    if (entry.isDirectory() && excluded.has(entry.name)) continue;
    const fullPath = path.join(folder, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (entry.isFile() && entry.name.endsWith(".js")) javascriptFiles.push(fullPath);
  }
}

function readJson(fileName) {
  try { return JSON.parse(fs.readFileSync(path.join(root, fileName), "utf8")); }
  catch (error) {
    errors.push(`${fileName}: ${error.message}`);
    return null;
  }
}

walk(root);
for (const file of javascriptFiles) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) errors.push(`${path.relative(root, file)}: ${result.stderr || result.stdout}`);
}

const packageJson = readJson("package.json");
const lock = readJson("package-lock.json");
const manifest = readJson("manifest.webmanifest");
const vercel = readJson("vercel.json");

if (packageJson && lock && packageJson.version !== lock.version) {
  errors.push("package.json and package-lock.json versions do not match.");
}
if (!packageJson?.scripts?.test || !packageJson?.scripts?.check || !packageJson?.scripts?.["build:vercel"]) {
  errors.push("Required npm scripts are missing.");
}
if (!manifest?.start_url || !manifest?.display || !manifest?.icons?.length) {
  errors.push("PWA manifest is incomplete.");
}
if (!vercel || vercel.outputDirectory !== "public" || !vercel.buildCommand) {
  errors.push("Vercel static build output is not configured.");
}
if (!fs.existsSync(path.join(root, "api/[...route].js"))) errors.push("Vercel API catch-all function is missing.");
if (!fs.existsSync(path.join(root, "temp-sql/001_create_tables.sql"))) errors.push("Manual SQL schema is missing.");
if (!fs.existsSync(path.join(root, ".env.example")) || !fs.existsSync(path.join(root, ".gitignore"))) {
  errors.push("Environment example or gitignore file is missing.");
}

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
for (const match of html.matchAll(/(?:src|href)="(\/[^"#?]+)"/g)) {
  const asset = path.join(root, match[1].replace(/^\//, ""));
  if (!fs.existsSync(asset)) errors.push(`index.html references missing asset: ${match[1]}`);
}
const serviceWorker = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");
const assetBlock = serviceWorker.match(/const CORE_ASSETS = \[([\s\S]*?)\];/);
if (!assetBlock) {
  errors.push("Service worker core asset list is missing.");
} else {
  for (const match of assetBlock[1].matchAll(/"(\/[^\"]+)"/g)) {
    const asset = match[1] === "/" ? "index.html" : match[1].slice(1);
    if (!fs.existsSync(path.join(root, asset))) errors.push(`Service worker asset is missing: ${match[1]}`);
  }
}
if (/caches\.open[\s\S]{0,300}\/api\//.test(serviceWorker) || !serviceWorker.includes('if (url.pathname.startsWith("/api/")) return;')) {
  errors.push("Service worker must not cache API responses.");
}
if (html.includes('id="movements-button"')) errors.push("The separate Events button should not be present.");
if ((html.match(/class="newroz-rays"/g) || []).length !== 1) errors.push("The original Newroz sun must appear once in the header.");
const badge = html.match(/<div class="hero-badge newroz-badge"[\s\S]*?<\/div>/)?.[0] || "";
if (badge.includes("newroz-rays") || badge.includes("newroz-sun")) errors.push("The duplicate sun logo must not appear in the Newroz badge.");
if (!html.includes('id="reminder-form"') || !html.includes('id="notes-form"') && !html.includes('id="note-form"')) {
  errors.push("The Notes and Reminders forms are not both present.");
}

const sql = fs.readFileSync(path.join(root, "temp-sql/001_create_tables.sql"), "utf8");
const createTables = [...sql.matchAll(/CREATE TABLE IF NOT EXISTS\s+(\w+)/gi)].map(match => match[1].toLowerCase()).sort();
if (createTables.join(",") !== "notes,reminders") errors.push("The manual SQL must create only notes and reminders tables.");

if (errors.length) {
  console.error("Project checks failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Project checks passed (${javascriptFiles.length} JavaScript files checked).`);
}
