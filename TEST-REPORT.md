# Hewtûjmêr project test report

**Test date:** 31 October 2026  
**Runtime:** Node.js 22.16.0, npm 10.9.2

## Checks completed

| Check | Result | Notes |
|---|---|---|
| Automated tests | PASS — 18/18 | Calendar date logic, notes/reminders API behaviour, validation, session ownership, offline storage and PWA checks. |
| Project syntax and configuration check | PASS | 26 JavaScript files checked. JSON, asset references, PWA configuration and required project files were checked. |
| Vercel static build | PASS | Frontend assets were copied to the generated `public/` build folder. The folder is excluded from the source ZIP because Vercel recreates it during deployment. |
| Capacitor web build | PASS | Frontend assets were copied to the generated `www/` folder. |
| Capacitor sync | PASS | Android and iOS project assets and configuration were synchronised. |
| Local HTTP smoke test | PASS | `/` and `/static/data-service.js` returned HTTP 200. The health and session endpoints responded. Backend source, SQL, environment example and package files returned HTTP 404 when requested as public files. |
| Manual SQL inspection | PASS | The schema contains only `notes` and `reminders`, with keys, constraints and indexes. The script was not executed. |

## Not tested in this environment

- **PostgreSQL and Neon:** No database credentials were supplied. The local database was not connected to or modified. The health endpoint correctly reported `database: unavailable` during the local smoke test.
- **Real browser interaction:** The browser environment blocked the local test origin before the application could be opened. The automated tests and HTTP checks passed, but a full visual and touch interaction test was not completed.
- **Android binary:** The Android project was generated and synced. An APK or Android App Bundle was not compiled because the Android Software Development Kit (SDK) and device tools were not available.
- **iOS binary:** The iOS project was generated and synced. It was not compiled because macOS and Xcode were not available.
- **Native notifications:** The project includes browser notifications when the application is active. A Capacitor native local-notification plugin and device testing are still required for native background notifications.
- **Vercel production deployment:** Deployment was prepared but not performed because the Vercel account, production `DATABASE_URL` and `SESSION_SECRET` were not provided.

## Important setup actions

1. Run `temp-sql/001_create_tables.sql` manually against the intended local PostgreSQL or Neon database.
2. Set `DATABASE_URL` and a private `SESSION_SECRET` with at least 32 characters in the local environment and Vercel.
3. For Capacitor, set the deployed API origin in `static/runtime-config.js`, rebuild the mobile web assets and run `npm run cap:sync`.
4. Follow the build steps in `README.md` on a computer with the relevant Android or Apple development tools.
