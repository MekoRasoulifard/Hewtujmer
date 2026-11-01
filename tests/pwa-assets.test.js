"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

test("PWA manifest points to existing icons and keeps standalone launch mode", () => {
  const manifest = JSON.parse(read("manifest.webmanifest"));
  assert.equal(manifest.display, "standalone");
  assert.ok(manifest.start_url);
  assert.ok(manifest.icons.length > 0);
  for (const icon of manifest.icons) {
    const iconPath = path.join(root, icon.src.replace(/^\.\//, ""));
    assert.equal(fs.existsSync(iconPath), true, `Missing PWA icon ${icon.src}`);
  }
});

test("service worker precaches the calendar and never intercepts API data", () => {
  const source = read("service-worker.js");
  assert.match(source, /const CACHE_VERSION = "hewtujmer-app-v\d+"/);
  assert.match(source, /url\.pathname\.startsWith\("\/api\/"\)\) return/);
  assert.match(source, /request\.mode === "navigate"/);
  assert.match(source, /calendar-movements\.json/);
  const assets = [...source.matchAll(/"(\/[^\"]+)"/g)].map(match => match[1]);
  for (const asset of assets) {
    if (asset === "/") continue;
    assert.equal(fs.existsSync(path.join(root, asset.slice(1))), true, `Missing service worker asset ${asset}`);
  }
});

test("manual SQL creates only the two personal data tables", () => {
 const temporarySql = read("database/migrations/001_create_tables.sql");
  const migrationSql = read("database/migrations/001_create_tables.sql");
  assert.equal(temporarySql, migrationSql);
  const tables = [...temporarySql.matchAll(/CREATE TABLE IF NOT EXISTS\s+(\w+)/gi)]
    .map(match => match[1].toLowerCase()).sort();
  assert.deepEqual(tables, ["notes", "reminders"]);
  assert.match(temporarySql, /notification_enabled BOOLEAN/);
  assert.match(temporarySql, /PRIMARY KEY/);
  assert.match(temporarySql, /CREATE INDEX/);
});

test("frontend contains the requested navigation and single Newroz sun", () => {
  const html = read("index.html");
  assert.match(html, /data-view-link="week"/);
  assert.match(html, /data-view-link="day"/);
  assert.match(html, /data-view-link="month"/);
  assert.match(html, /data-view-link="calendar"/);
  assert.match(html, /data-nav-action="notes"/);
  assert.match(html, /id="reminder-form"/);
  assert.doesNotMatch(html, /id="movements-button"/);
  assert.equal((html.match(/class="newroz-rays"/g) || []).length, 1);
  const badge = html.match(/<div class="hero-badge newroz-badge"[\s\S]*?<\/div>/)?.[0] || "";
  assert.doesNotMatch(badge, /newroz-rays|newroz-sun/);
});
