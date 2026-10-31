# Hewtûjmêr project audit and test report

**Audit date:** 31 October 2026  
**Runtime used for local checks:** Node.js 22.16.0, npm 10.9.2

## Completed checks

| Check | Result | Notes |
|---|---|---|
| Automated tests | PASS — 22/22 | Node's built-in test runner. Covers calendar calculations, validation, notes/reminders API behaviour, session ownership, secret diagnostics, database schema readiness, offline data handling and PWA assets. API tests use an in-memory PostgreSQL test adapter. |
| Project syntax/configuration check | PASS | 26 JavaScript files passed `node --check`; required files, JSON configuration, frontend asset paths, service-worker asset paths, SQL table names and PWA/API cache rules were checked. |
| Vercel static build | PASS | The `build:vercel` script generated the frontend output in `public/`. This generated folder is excluded from the source ZIP and is recreated during deployment. |
| Capacitor web asset build | PASS | The `build:mobile` script generated the web assets in `www/`. The generated folder is excluded from the source ZIP. Existing native Android and iOS project folders were retained. |
| Manual SQL review | PASS | The canonical migration and `temp-sql/001_create_tables.sql` define the `notes` and `reminders` tables and required constraints/indexes. Neither SQL file was executed. |
| Service-worker release cache | PASS | Cache version increased to `hewtujmer-app-v8` so updated frontend assets are not mixed with the previous cache. |
| Secret/package review | PASS | No `.env`, database password, session secret or `node_modules` folder is included in the ZIP. `.env.example` contains placeholders only. |

## Checks that could not be completed

| Check | Status | Reason |
|---|---|---|
| Dependency installation and live Express server | NOT RUN | `npm ci` could not complete because the package registry was unreachable from this environment (`EAI_AGAIN`). The installed dependencies were not available, so I did not claim a live server test. |
| Live PostgreSQL connection and schema validation | NOT RUN | Your private `.env` and database credentials were not provided, and I did not access or modify your local database. The automated database tests use an in-memory adapter. |
| Real browser and visual interaction | NOT RUN | A browser automation environment was not available for checking actual screenshots, touch behaviour, portrait/landscape rendering or keyboard behaviour. The mobile controls and responsive styles were checked through automated source assertions and project checks. |
| Exact UI screenshot comparison | NOT POSSIBLE | The uploaded ZIP did not contain the UI reference screenshots mentioned in the request. The current design was improved without claiming an exact match to missing references. |
| Exact Kurdish three-line date comparison | NOT POSSIBLE | The authoritative Kurdish date reference image was not included. The existing formatter was retained; the Sorani `ی` and Kurmanji `ê` suffix output was not replaced or guessed. |
| Android/iOS native build and device test | NOT RUN | Android SDK/device tooling and macOS/Xcode were not available. Existing Android and iOS projects were preserved. |
| Native background notifications | NOT RUN | A native Capacitor local-notification plugin and physical-device tests are not included in this audit. Browser reminders are not guaranteed to run when the app is closed. |
| Production Vercel/Neon deployment | NOT RUN | Production account access and credentials were not provided. |

## Important findings and required setup

1. The source code returns `503 SESSION_CONFIGURATION_REQUIRED` from `POST /api/session` when `SESSION_SECRET` is missing or shorter than 32 characters. This endpoint does not query PostgreSQL. The private `.env` was not included, so its actual value could not be inspected. Set a random secret of at least 32 characters and restart the server.
2. The revised `/api/health` checks both PostgreSQL connectivity and the required columns in `notes` and `reminders`. A reachable database with an incomplete schema is reported as degraded rather than ready.
3. Keep your existing local database and records. Do not rerun the migration against existing tables unless you have confirmed that the tables need to be created in a new database. The migration uses `CREATE TABLE IF NOT EXISTS`; it does not alter or repair existing table definitions.
4. Run `npm ci` on your computer, create the private `.env` from `.env.example`, set `DATABASE_URL` and a strong `SESSION_SECRET`, start PostgreSQL, then run `npm run dev` from the project root. The single Express process serves the frontend and `/api` on `http://localhost:3000`.
5. Check `http://localhost:3000/api/health`. Notes and reminders are ready only when it returns `database: "connected"` and `schema: "ready"`.
6. Use the README for Vercel/Neon and Capacitor build steps. Android builds require Android Studio/SDK; iOS builds require macOS and Xcode.
