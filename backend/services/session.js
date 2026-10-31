"use strict";

const crypto = require("node:crypto");

const COOKIE_NAME = "hew_session";
const SESSION_SECONDS = 60 * 60 * 24 * 365;

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    const error = new Error("SESSION_SECRET is not configured. Add a private secret of at least 32 characters to .env.");
    error.code = "SESSION_SECRET_MISSING";
    throw error;
  }
  if (secret.length < 32) {
    const error = new Error("SESSION_SECRET is too short. Use a private secret containing at least 32 characters.");
    error.code = "SESSION_SECRET_TOO_SHORT";
    throw error;
  }
  return secret;
}

function validateSessionSecret() {
  getSecret();
  return true;
}

function sign(value) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function createSession() {
  const ownerId = crypto.randomUUID();
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = `${ownerId}.${expiresAt}`;
  return { ownerId, token: `${payload}.${sign(payload)}`, expiresAt };
}

function readCookie(header, name) {
  if (!header) return "";
  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    if (part.slice(0, separator).trim() === name) {
      return part.slice(separator + 1).trim();
    }
  }
  return "";
}

function verifySession(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [ownerId, expiresAtText, signature] = parts;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(ownerId)) return null;
  if (!/^\d+$/.test(expiresAtText)) return null;

  const payload = `${ownerId}.${expiresAtText}`;
  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length) return null;
  if (!crypto.timingSafeEqual(expected, received)) return null;
  if (Number(expiresAtText) <= Math.floor(Date.now() / 1000)) return null;

  return ownerId;
}

function getOwnerId(req) {
  const cookie = readCookie(req.headers?.cookie, COOKIE_NAME);
  return verifySession(cookie);
}

function getAllowedNativeOrigins() {
  return String(process.env.CAPACITOR_ORIGINS || "capacitor://localhost,https://localhost,http://localhost")
    .split(",").map(value => value.trim()).filter(Boolean);
}

function isAllowedNativeOrigin(origin) {
  return getAllowedNativeOrigins().includes(origin);
}

function sessionCookie(token, req) {
  const secure = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
  const nativeOrigin = isAllowedNativeOrigin(req?.headers?.origin || "");
  const sameSite = nativeOrigin ? "None" : "Lax";
  return [
    `${COOKIE_NAME}=${token}`,
    "Path=/",
    `Max-Age=${SESSION_SECONDS}`,
    "HttpOnly",
    `SameSite=${sameSite}`,
    ...(secure || nativeOrigin ? ["Secure"] : [])
  ].join("; ");
}

function assertSameOrigin(req) {
  const origin = req.headers?.origin;
  if (!origin) return String(req.headers?.["sec-fetch-site"] || "").toLowerCase() !== "cross-site";
  if (isAllowedNativeOrigin(origin)) return true;

  const forwardedProto = req.headers?.["x-forwarded-proto"];
  const protocol = forwardedProto ? String(forwardedProto).split(",")[0] : (req.socket?.encrypted ? "https" : "http");
  const host = req.headers?.["x-forwarded-host"] || req.headers?.host;
  if (!host) return false;
  try {
    return new URL(origin).origin === `${protocol}://${String(host).split(",")[0]}`;
  } catch (error) {
    return false;
  }
}

module.exports = {
  COOKIE_NAME,
  createSession,
  getOwnerId,
  sessionCookie,
  assertSameOrigin,
  isAllowedNativeOrigin,
  verifySession,
  validateSessionSecret
};
