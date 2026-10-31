Hewtûjmêr — Kurdish Calendar

Hewtûjmêr is a Kurdish calendar application built with HTML, CSS and vanilla JavaScript. It supports Kurdish calendar calculations, cultural events, Newroz information, multiple languages and offline access.

It works as a website and Progressive Web App (PWA), with optional Android and iOS support through Capacitor.

Features
Kurdish calendar with day, week, month and year views.
Gregorian and Kurdish date calculations.
Historical events, cultural information and Newroz countdown.
Sorani and Kurmanji language support.
Responsive mobile interface.
Notes and reminders with IndexedDB storage.
Optional PostgreSQL cloud synchronization.
PWA installation and offline support.
Android and iOS project support.
Technology
Frontend: HTML, CSS and vanilla JavaScript.
Backend: Node.js and Express.
Database: PostgreSQL / Neon.
Deployment: Vercel.
Mobile: Capacitor.
Offline storage: IndexedDB and Service Worker.
Requirements
Node.js 20+
npm
PostgreSQL for cloud notes and reminders.
HTTPS for production PWA functionality.
Installation

Clone the repository and install dependencies:

bash
npm ci


Create your local environment file:

powershell
Copy-Item .env.example .env


Configure DATABASE_URL, SESSION_SECRET (at least 32 characters), NODE_ENV and PORT in .env.

Never commit .env or expose database credentials.

Run locally
bash
npm start


Open:

http://localhost:3000

For development with automatic restarts:

bash
npm run dev


Health check:

http://localhost:3000/api/health

Database

The SQL migration is located at:

database/migrations/001_create_tables.sql

Run it only when creating a new database or when the required tables are missing.

The database stores notes and reminders. Calendar calculations and cultural events remain available locally without PostgreSQL.

Deployment
Vercel
Import the GitHub repository into Vercel.
Configure DATABASE_URL and SESSION_SECRET.
Configure the required environment variables.
Create the database tables in Neon if necessary.
Deploy the project.

The frontend remains available even if the database is temporarily unavailable.

Mobile builds

Build the mobile web assets:

bash
npm run build:mobile


Synchronize Capacitor:

bash
npm run cap:sync


Android builds require Android Studio and the Android SDK.

iOS builds require macOS and Xcode.

Testing

Run the automated tests:

bash
npm test
npm run check


Check the database connection through /api/health.

Security and privacy
Environment secrets must remain private.
.env files must never be committed.
API responses containing private data are not cached.
Notes and reminders are separated using signed anonymous browser sessions.
Browser notifications are not guaranteed when the application is closed.
Project structure
text
Hewtujmer/
├── android/
├── ios/
├── api/
├── backend/
├── database/
├── icons/
├── scripts/
├── static/
├── tests/
├── index.html
├── manifest.webmanifest
├── service-worker.js
├── capacitor.config.js
├── package.json
└── vercel.json


Generated folders such as node_modules/, public/ and www/ are created during installation or builds.

Hewtûjmêr — Kurdish Calendar

Built to preserve Kurdish calendar traditions and make them accessible everywhere.