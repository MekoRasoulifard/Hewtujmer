
"use strict";

(function () {
  const Core = window.CalendarCore;
  const Navigation = window.CalendarNavigation;
  const View = window.CalendarView;
  const translations = window.HewtujmerTranslations;

  let language = "ckb";

  try {
    language = localStorage.getItem("hewtujmer-language") || "ckb";
  } catch {
    // Use the default language when storage is unavailable.
  }

  if (!translations[language]) language = "ckb";

  const state = {
    language,
    view: Navigation.readViewFromHash(),
    selectedDate: Core.startOfDay(new Date())
  };

  function applyTheme(theme) {
    const selected = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = selected;

    try {
      localStorage.setItem("hewtujmer-theme", selected);
    } catch {
      // The theme remains active for this session.
    }

    const icon = document.querySelector("#theme-toggle .theme-icon");
    const button = document.querySelector("#theme-toggle");
    const isDark = selected === "dark";
    const label = isDark
      ? "Switch to light mode"
      : "Switch to dark mode";

    if (icon) {
      icon.textContent = isDark ? "☀" : "☾";
    }

    if (button) {
      button.setAttribute("aria-label", label);
      button.title = label;
    }
  }

  function toggleTheme() {
    const current = document.documentElement.dataset.theme;
    applyTheme(current === "dark" ? "light" : "dark");
  }

  function updateTranslations() {
    const t = translations[state.language];

    const isSorani = state.language === "ckb";
    const direction = isSorani ? "rtl" : "ltr";

    document.documentElement.lang = state.language;
    document.documentElement.dir = direction;
    document.documentElement.dataset.language = state.language;
    document.body.lang = state.language;
    document.body.dir = direction;

    const titles = {
      ckb: "Hewtûjmêr — کوردی",
      kmr: "Hewtûjmêr — Kurdî",
      en: "Hewtûjmêr — Kurdish Calendar"
    };
    document.title = titles[state.language] || titles.ckb;

    const languageSelect =
      document.querySelector("#language-select");

    if (languageSelect) {
      languageSelect.value = state.language;
    }

    document.querySelectorAll("[data-i18n]").forEach(element => {
      const value = t[element.dataset.i18n];

      if (typeof value === "string") {
        element.textContent = value;
      }
    });

    const countdownLabel = document.querySelector(
      "#newroz-countdown-label"
    );

    if (countdownLabel) {
      countdownLabel.textContent = t.newrozCountdown;
      countdownLabel.lang = state.language;
      countdownLabel.dir = direction;

      countdownLabel.classList.toggle(
        "sorani-text",
        state.language === "ckb"
      );
    }

    const previous = document.querySelector("#previous-button");
    const next = document.querySelector("#next-button");

    if (previous) {
      previous.setAttribute("aria-label", t.previous);
      previous.title = t.previous;
    }

    if (next) {
      next.setAttribute("aria-label", t.next);
      next.title = t.next;
    }
  }

  function setLanguage(nextLanguage) {
    if (!translations[nextLanguage]) return;

    state.language = nextLanguage;

    try {
      localStorage.setItem(
        "hewtujmer-language",
        nextLanguage
      );
    } catch {
      // Language selection remains available this session.
    }

    updateTranslations();
    render();
  }

  function updateTodayCards() {
    const today = Core.startOfDay(new Date());

    const kurdishDate = document.querySelector("#kurdish-date");
    const gregorianDate = document.querySelector("#gregorian-date");
    const solarHijriDate = document.querySelector("#solar-hijri-date");
    const countdown = document.querySelector("#newroz-countdown");

    if (kurdishDate) {
      kurdishDate.textContent =
        Core.formatKurdishDate(today, state.language);
    }

    if (gregorianDate) {
      gregorianDate.textContent =
        Core.formatGregorian(today, state.language);
    }

    if (solarHijriDate) {
      try {
        solarHijriDate.textContent = new Intl.DateTimeFormat(
          state.language === "ckb"
            ? "ckb"
            : state.language === "kmr"
              ? "ku"
              : "en-GB",
          {
            calendar: "persian",
            day: "numeric",
            month: "short",
            year: "numeric"
          }
        ).format(today);
      } catch {
        solarHijriDate.textContent = "—";
      }
    }

    const newroz = new Date(
      today.getFullYear(),
      2,
      21
    );

    if (today >= newroz) {
      newroz.setFullYear(newroz.getFullYear() + 1);
    }

    if (countdown) {
      countdown.textContent = Core.localizeDigits(
        Core.daysBetween(today, newroz),
        state.language
      );
    }
  }

  function render() {
    updateTodayCards();
    View.render(state);
  }

  function initialize() {
    let theme = "light";

    try {
      theme = localStorage.getItem("hewtujmer-theme") || "light";
    } catch {
      // Use light mode by default.
    }

    applyTheme(theme);
    updateTranslations();

    window.CalendarEvents.bind(state, {
      render,
      setLanguage,
      toggleTheme
    });

    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initialize,
      { once: true }
    );
  } else {
    initialize();
  }
})();// Draw 21 pointed rays for the Kurdish national sun emblem.
function drawNewrozSun() {
  document.querySelectorAll(".newroz-rays").forEach((container) => {
    // Prevent generating the rays more than once.
    if (container.dataset.generated === "true") return;

    // Clear old generated rays if necessary.
    container.replaceChildren();

    // Generate the 21 rays.
    for (let i = 0; i < 21; i++) {
      const ray = document.createElement("span");

      ray.className = "newroz-ray";
      ray.setAttribute("aria-hidden", "true");

      // Evenly distribute all 21 rays around the sun.
      ray.style.setProperty(
        "--ray-angle",
        `${(i * 360) / 21}deg`
      );

      container.appendChild(ray);
    }

    // Mark this container as generated.
    container.dataset.generated = "true";
  });
}

// Run after the HTML has loaded.
if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    drawNewrozSun,
    { once: true }
  );
} else {
  drawNewrozSun();
}
/* 
// Disable the browser context menu.
document.addEventListener("contextmenu", event => {
  event.preventDefault();
});

 */