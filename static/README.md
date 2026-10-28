Hewtujmer

Hewtujmer is a multilingual Kurdish calendar application for viewing weeks, dates, and important calendar information in a clean, responsive interface.

Features
Weekly calendar with ISO week numbers and Monday-to-Sunday date ranges
Kurdish calendar dates and Gregorian date display
Kurdish Sorani, Kurmanji, and English language support
Week navigation and a shortcut to the current week
Calendar month and year views
Search for weeks, years, and dates
Light and dark themes
Newroz countdown
Holiday indicators
Responsive desktop and mobile layouts
Print-friendly calendar views
Technology
Rust for the application server
HTML and CSS for the interface
Vanilla JavaScript for calendar logic and interactions
Browser Intl.DateTimeFormat for localized date formatting
Project Structure
text
Hewtujmer/
├── src/
│   └── main.rs
├── static/
│   ├── app.js
│   ├── calendar-core.js
│   ├── calendar-events.js
│   ├── calendar-navigation.js
│   ├── calendar-view.js
│   ├── style.css
│   └── translations.js
├── templates/
│   └── index.html
├── Cargo.toml
├── Cargo.lock
└── README.md

Requirements
Windows, macOS, or Linux
Rust and Cargo installed
A modern web browser

Install Rust using rustup.

Verify your installation:

bash
rustc --version
cargo --version

Run Locally

Clone the repository:

bash
git clone https://github.com/YOUR_USERNAME/Hewtujmer.git
cd Hewtujmer


Start the application:

bash
cargo run


Open the local address printed by the server. The default development address may be:

text
http://127.0.0.1:3000


If you use Windows PowerShell and Cargo is not available on your PATH, restart your terminal after installing Rust or use the Cargo executable installed by rustup.

Calendar Behavior

The application uses ISO week numbering, where weeks begin on Monday. Week numbers follow the ISO week-year, which can differ from the Gregorian calendar year near New Year.

The current-week shortcut returns the calendar to the week containing today's local date.

Deployment

Hewtujmer currently uses a Rust application server. Before deploying to Vercel, verify that the server can be built and run using Vercel's supported deployment configuration.

A conventional long-running Rust server does not automatically become a Vercel deployment merely by uploading the repository. Depending on the server implementation, deployment may require adapting the backend to a supported function runtime or hosting the Rust server on a platform that supports persistent Rust web services.

Keep the frontend and backend deployment requirements documented and tested before publishing a production URL.

License

Choose and add a license before distributing the project publicly. If you want others to reuse and modify the code, consider the MIT License.

Contributing

Issues and suggestions are welcome. Please test changes to date calculations, ISO week boundaries, localization, and navigation before submitting a pull request.