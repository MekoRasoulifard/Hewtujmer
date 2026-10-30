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
