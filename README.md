<<<<<<< HEAD
# Hewtûjmêr — Kurdish Calendar and Events

Hewtûjmêr is a Kurdish calendar application built with HTML, CSS and plain JavaScript. It keeps the existing calendar calculations, Kurdish calendar data, language support and Newroz content. It can run as a website and Progressive Web App (PWA). An optional Node.js backend adds private notes and reminders stored in PostgreSQL.

The calendar does not need the backend, database or internet connection to calculate and display its local calendar data.

## Main features

- Kurdish calendar with week, This Day, month and year views.
- Existing calendar calculations, historical and cultural events, translations and Newroz information.
- Date selection with an event dialog when that date has events.
- Mobile bottom navigation with a separate Notes and Reminders area.
- Notes and reminders stored locally in IndexedDB and synced to PostgreSQL when the API is available.
- Optional browser notifications. Permission is requested only after the user selects the notification button.
- PWA installation, offline calendar files and service-worker update notices.
- Optional Capacitor project setup for Android and iOS.

## Architecture

The frontend remains a static application. It does not use React, Vue or Angular.

| Area | Location | Purpose |
|---|---|---|
| Calendar calculations | `static/calendar-core.js` | Gregorian and Kurdish date calculations |
| Calendar display | `static/calendar-view.js` | Week, day, month and year views |
| Navigation | `static/calendar-navigation.js` | Date and view navigation, installation help |
| Events | `static/calendar-events.js` | Cultural events, date dialogs, notes and reminders interface |
| Local data | `static/data-service.js` | IndexedDB, offline changes, sync and reminder timers |
| Preferences | `static/storage.js` | Small preferences in cookies and migration from old preferences |
| Update management | `static/update-manager.js` | Service-worker update checks and safe refresh |
| Backend | `backend/` | Express development server, PostgreSQL connection and API logic |
| Vercel API | `api/[...route].js` | Serverless API entry point |
| SQL migration | `database/migrations/001_create_tables.sql` | Canonical notes/reminders schema; no automatic migration is run |
| SQL copy | `temp-sql/001_create_tables.sql` | Same script retained for manual execution and existing project workflows |

The database stores only personal notes and reminders. Calendar calculations, calendar movements, historical events, cultural events and Newroz information remain in the existing frontend files.

## Requirements

- Node.js 20 or later.
- npm, installed with Node.js.
- PostgreSQL for cloud-saved notes and reminders.
- A Neon PostgreSQL database for the hosted Vercel setup.
- HTTPS for production PWA use and browser notifications.

## Install and run locally on Windows

Open PowerShell in the project folder.

```powershell
npm ci
Copy-Item .env.example .env
```

Edit `.env`. Set a private session secret of at least 32 characters. Generate one in PowerShell:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Copy the generated value into `SESSION_SECRET` in your private `.env` file. Do not use the example placeholder as the real secret.

Set your local PostgreSQL connection string in `DATABASE_URL`. The example below uses the database name and user from the project setup. Replace the password with your own local PostgreSQL password.

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/hewtujmer
SESSION_SECRET=PASTE_THE_GENERATED_RANDOM_VALUE_HERE
NODE_ENV=development
PORT=3000
```

Do not commit `.env`. It is excluded by `.gitignore`.

### Create the local database tables manually

The project does not connect to or change your local database during installation. Your existing `hewtujmer` database and its tables are not dropped or recreated. Since your local `notes` and `reminders` tables already exist, do not run the migration again unless the health check reports a schema mismatch. The migration uses `CREATE TABLE IF NOT EXISTS`, but it does not rewrite or repair an older table definition.

**Using pgAdmin:**

1. Start PostgreSQL and open pgAdmin.
2. Connect to your local server.
3. Select the `hewtujmer` database.
4. Open **Tools → Query Tool**.
5. Open `database/migrations/001_create_tables.sql` (or the identical copy in `temp-sql/001_create_tables.sql`) and run the complete script only if the tables do not already exist or the schema needs to be created in a new database.
6. Refresh the database tree and confirm that `notes` and `reminders` exist under **Schemas → public → Tables**.

**Using PowerShell and psql:**

```powershell
psql -U postgres -d hewtujmer -f .\database\migrations\001_create_tables.sql
```

The command asks for the local PostgreSQL password when needed. The SQL uses standard PostgreSQL types and statements and can also run in Neon. It creates only the `notes` and `reminders` tables, including keys, constraints and indexes. It is not executed by the application.

The canonical migration is kept in `database/migrations/001_create_tables.sql`. The `temp-sql/` copy is retained for compatibility with earlier project instructions. Keep the two files identical if the schema is changed.

### Start the application

```powershell
npm start
```

Open `http://localhost:3000`.

For development with automatic backend restarts, use the single-command setup:

```powershell
npm run dev
```

The same Express process serves the frontend at `http://localhost:3000` and the API under `/api`. Nodemon restarts the backend when server files change. You do not need a separate frontend server.

The health endpoint is `http://localhost:3000/api/health`. It checks PostgreSQL connectivity and confirms that the `notes` and `reminders` tables contain all required columns. It returns HTTP `200` only when the database and schema are ready. It returns HTTP `503` with a `degraded` status if the database is missing, unreachable or has an incomplete schema. The static calendar continues to load even while the database is unavailable.

**Important for the session `503` error:** `POST /api/session` does not connect to PostgreSQL. It needs `SESSION_SECRET` to be set to at least 32 characters. A missing or shorter value returns `SESSION_CONFIGURATION_REQUIRED`. The development response explains what must be fixed without displaying the secret. Restart `npm run dev` after editing `.env`.

## Notes and reminders

The Notes and Reminders dialog has two sections. On mobile, the floating **Add note** action opens the note editor directly. The Notes tab opens the saved note list and has its own Add note button. The editor uses a larger text area, touch-sized controls, a sticky save action and a keyboard-aware dialog height.

**Notes** support create, edit and delete. A note can have an optional reminder date and time.

**Reminders** support a title, optional description, date, time, reminder lead time, notification setting and completed status. Users can create, edit, delete, complete and reopen reminders.

The browser keeps a local copy in IndexedDB so users can view and edit notes while offline. Changes are marked for sync and sent to the API when the application is online. API responses are not stored in the service-worker cache.

The backend uses a signed anonymous browser session in an `HttpOnly` cookie. No account, email address or password is created. This separates one browser's cloud records from another browser's records, but it is not a user account system. The session secret must remain private. If a user clears the browser's site data, loses the session cookie and local IndexedDB data, the old cloud records cannot be recovered through an account. Cross-device access and account recovery are not included.

If PostgreSQL or the API is unavailable, the calendar remains usable and note changes can remain in the local browser queue. They sync after the service becomes available. Browser storage can still be cleared by the user or operating system, so it should not be treated as a backup service.

### API endpoints

All endpoints use JSON and private, non-cacheable responses.

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | Application and database status |
| `POST` | `/api/session` | Create or reuse the anonymous browser session |
| `GET`, `POST` | `/api/notes` | List or create notes |
| `PATCH`, `PUT`, `DELETE` | `/api/notes/:id` | Update or delete a note |
| `GET`, `POST` | `/api/reminders` | List or create reminders |
| `PATCH`, `PUT`, `DELETE` | `/api/reminders/:id` | Update or delete a reminder |
| `POST` | `/api/reminders/:id/complete` | Set reminder completion status |

The backend validates user input and uses parameterized PostgreSQL queries. Each notes and reminders query is restricted to the owner ID from the signed session cookie.

## Notifications and browser limits

The application does not ask for notification permission on first load. The user must select **Enable notifications**. When permission is granted, reminder notices can use the browser Notification API while the application is running.

Web browsers and operating systems do not guarantee that a page timer will run after the browser is closed, the device is sleeping or the operating system stops the PWA. This project does not include a push-notification server or a native Capacitor local-notification plugin. Do not rely on these browser reminders for critical appointments. A native notification plugin and device testing are still required for reliable Android and iOS local notifications.

## Storage strategy

| Data | Storage |
|---|---|
| Calendar calculations and static events | Existing JavaScript and JSON files |
| Notes and reminders | PostgreSQL with a local IndexedDB copy and pending sync queue |
| Language, theme and selected date | Small cookies and JavaScript memory |
| Temporary interface state | JavaScript memory |
| Static files for offline use | Service Worker Cache Storage |
| Authentication | Signed `HttpOnly` session cookie; no login system |

`localStorage` is read only to migrate existing preferences and legacy notes. It is not used for new application writes. Legacy notes are removed from `localStorage` only after migration to IndexedDB is available. If IndexedDB is unavailable, the legacy source is kept. Cookies are not used as a large cache.

## Automatic content and application updates

The frontend refreshes remote movement data and private data on startup, when a page is shown, when the tab becomes visible and when the device reconnects. Refresh calls are deduplicated and limited to avoid repeated requests. Static calendar calculations do not need a server request.

The service worker uses a versioned static cache and a network-first strategy for page navigation and the movement JSON. Static assets can be read from the installed cache while offline. API paths are not cached. A waiting service-worker version displays an update notice. The user chooses when to apply it, and the page reloads once after the new worker takes control.

## Neon PostgreSQL and Vercel

### Create a Neon database

1. Create or sign in to your Neon account.
2. Create a PostgreSQL project and database.
3. Copy the connection string for the database.
4. Keep the connection string private. It is a server environment variable and must not be placed in frontend JavaScript.

### Configure Vercel

1. Import the project repository into Vercel.
2. Keep the project root as the Root Directory.
3. Vercel uses `npm run build:vercel` to copy only the website files into the `public/` output folder. The API function remains under `api/`.
4. Add these environment variables in the Vercel project settings for the Production environment:

```env
DATABASE_URL=YOUR_NEON_POSTGRESQL_CONNECTION_STRING
SESSION_SECRET=YOUR_RANDOM_SECRET_OF_AT_LEAST_32_CHARACTERS
NODE_ENV=production
CAPACITOR_ORIGINS=capacitor://localhost,https://localhost,http://localhost
```

5. Run `database/migrations/001_create_tables.sql` using the Neon SQL Editor or another PostgreSQL client connected to the Neon database. This is required only when the tables have not already been created in that Neon database.
6. Deploy or redeploy the project.
7. Open `https://YOUR-VERCEL-DOMAIN/api/health`. It returns `"status":"ok"`, `"database":"connected"` and `"schema":"ready"` when Neon is connected and the expected columns are present. A `503` response reports an unavailable or incomplete database; it does not stop static calendar content from loading.

Vercel functions are serverless. The backend does not depend on a permanently running Express server in production. The Express server is used for local development. The PostgreSQL pool uses a small connection limit for serverless execution and enables certificate validation for remote database hosts.

Do not paste the real Neon URL or session secret into this repository, HTML, JavaScript or issue reports. Do not expose `.env` files in Git.

## Capacitor: Android and iOS

The web frontend is reused by Capacitor. The website and PWA can run without Capacitor.

Build the frontend assets for Capacitor:

```powershell
npm run build:mobile
```

This creates the generated `www/` folder. Before building a native application, edit `static/runtime-config.js` and set `HEWTUJMER_API_BASE_URL` to your deployed Vercel origin, without a trailing slash. Run the mobile build again after that change. The native app needs the hosted API because the local website server is not included in the app package.

Create the Android or iOS project when its platform tools are available:

```powershell
npm run cap:add:android
npm run cap:add:ios
```

If the native project has already been created, update its web assets with:

```powershell
npm run cap:sync
```

**Android:** Android Studio, a supported Java Development Kit (JDK), Android Software Development Kit (SDK), emulator or device are required to build and test the application. Open the generated `android/` project in Android Studio to create an APK or Android App Bundle.

**iOS:** iOS builds require macOS and Xcode. A Windows computer cannot compile or sign the iOS application. Run the iOS project creation and build commands on a Mac with Xcode installed.

The Capacitor configuration is included. The native platforms and notification plugin may need to be added and tested on the relevant operating systems. Browser notifications do not prove that native background notifications work.

## Testing

Run the automated checks from the project root:

```powershell
npm test
npm run check
```

The tests cover core date behaviour, note and reminder validation, offline data handling, legacy-note migration, API session ownership, note and reminder API operations, session-secret diagnostics, database schema readiness, PWA assets and project configuration.

Run the local server and check its health response:

```powershell
npm start
```

Then open `http://localhost:3000/api/health` in a browser. With your private `.env` configured and PostgreSQL running, the response must report `database: "connected"` and `schema: "ready"`. Because your local `notes` and `reminders` tables already exist, do not run the migration again unless the health endpoint reports a schema mismatch. The supplied automated API tests use an in-memory test database adapter; they do not modify your local PostgreSQL or Neon database.

A real Android or iOS device, browser-specific installation test and production Neon/Vercel credentials are not part of this source package. After installing dependencies and configuring your private `.env`, check `/api/health` against your actual PostgreSQL instance before relying on cloud storage.

## Project folders and important files


Generated folders such as `node_modules/`, `public/` and `www/` are not included in the source ZIP. They are created by the install or build commands.
=======
# Hewtûjmêr — Kurdish Calendar

A browser-based Kurdish calendar and Progressive Web App (PWA). The existing calendar calculations and navigation remain in place. The project uses plain HTML, CSS and JavaScript and can be deployed as a static site on Vercel.

## Project structure

```text
Hewtujmer/
├── icons/
├── index.html
├── manifest.webmanifest
├── offline.html
├── service-worker.js
├── vercel.json
├── static/
│   ├── app.js
│   ├── calendar-core.js
│   ├── calendar-events.js
│   ├── calendar-movements.json
│   ├── calendar-navigation.js
│   ├── calendar-view.js
│   ├── translations.js
│   ├── style.css
│   ├── style-calendar.css
│   ├── style-responsive.css
│   └── style-print.css
└── tests/
```

There are seven production JavaScript files, four CSS files and one JSON data file. The JavaScript and CSS file names are retained. Each production JavaScript file is below 400 lines. The uploaded source archive did not contain the `LICENSE` file shown in the folder tree, so I have not invented or replaced that legal file; copy your original `LICENSE` into the project root if you need it.

## Calendar rules

The original Kurdish calendar calculation is preserved. The Kurdish year starts on March 21 and uses the existing 700-year offset. ISO week calculations, localized digits, search formats, week/month/year views, language selection, theme selection, printing and date navigation remain available.

## Newroz and header

The Newroz countdown is calculated from the device's local date. The Newroz panel is shown in the same date-summary row as the Kurdish, Gregorian and Solar Hijri dates. The 21-ray sun rotates, while the central number 7 remains upright. The same sun mark appears before the Hewtûjmêr name in the header. Header alignment stays left-to-right when the language changes.

## Movements and international days

`static/calendar-movements.json` contains the Sorani and Kurmanji movement entries prepared from the list supplied for this update. It includes Kurdish-calendar dates and separate Gregorian-date international observances. The app shows a short daily summary when the current date has entries. The information button opens the current day's list. Event entries are available in the This Day view and in the event list for a selected date; they are not marked with dots or underlines on calendar dates.

Some source entries had incomplete or unclear dates. Those entries were not assigned to a calendar day by guessing. The historical wording and dates should be reviewed before treating the list as a verified historical reference.

## Notes and reminders

Notes and reminders are saved in the current browser using `localStorage`. No email address or account is needed for this local-only version. The reminder form supports 15 minutes, 30 minutes, one hour, or a custom number of minutes before the selected time. Browser notifications require permission. A reminder timer can run only while the app is open; it is not a reliable notification service after the browser or device is closed. Notes are not synced between devices and are not stored in Neon yet.

For private cloud notes, cross-device sync or reliable reminders while the app is closed, add authentication and a protected backend with a database. Do not expose database credentials in browser code.

## Install on a mobile home screen

The app asks about installation on the first visit and also provides an Install app button. On supported Android browsers, the button opens the browser's native installation prompt. The browser completes the installation and adds the app shortcut after the user confirms. On iPhone and iPad, Safari does not allow a website to start installation automatically; the dialog shows the steps to use Share → Add to Home Screen → Add. The prompt is shown again after seven days when the user dismisses it.

A website cannot force an installation or create a home-screen shortcut without the operating system's approval. The app must be served over HTTPS, except when testing on localhost.

## Offline and deployment

The service worker caches each resource separately. A missing optional asset no longer causes the complete installation step to fail. The cache includes the manifest, icons, four stylesheets, six app modules and movement JSON data. The cache version is `hewtujmer-static-v5`.

Run the app from the project root using a local web server. Do not open `index.html` as a `file://` URL. For local testing, use for example:

```bash
python -m http.server 5500
```

Open `http://127.0.0.1:5500/`. Deploy the project root to Vercel. Service workers require `localhost` or HTTPS.

## Tests

Run these commands from the project root:

```bash
node tests/calendar-core-smoke-test.js
node tests/calendar-view-smoke-test.js
node tests/movements-smoke-test.js
node tests/pwa-assets-check.js
node tests/service-worker-smoke-test.js
node tests/pwa-install-reminder-smoke-test.js
```
>>>>>>> 26494999ea39bc70bfc6b80d481768d8b1e343eb
