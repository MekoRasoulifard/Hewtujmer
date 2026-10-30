
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

  function readSavedDate() {
    try {
      const savedDate = localStorage.getItem("hewtujmer-selected-date");
      const parsedDate = savedDate ? Core.dateFromKey(savedDate) : null;
      return parsedDate ? Core.startOfDay(parsedDate) : Core.startOfDay(new Date());
    } catch (error) {
      return Core.startOfDay(new Date());
    }
  }

  function readSavedView() {
    try {
      const savedView = localStorage.getItem("hewtujmer-view");
      if (["week", "month", "calendar"].includes(savedView)) return savedView;
    } catch (error) {
      // Continue with the URL's view when storage is unavailable.
    }
    return Navigation.readViewFromHash();
  }

  const state = {
    language,
    view: readSavedView(),
    selectedDate: readSavedDate()
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

    const direction = state.language === "ckb" ? "rtl" : "ltr";

    document.documentElement.lang = state.language;
    document.documentElement.dir = direction;
    document.documentElement.dataset.language = state.language;

    if (document.body) {
      document.body.lang = state.language;
      document.body.dir = direction;
    }

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

    const translatedElements = document.querySelectorAll("[data-i18n]");
    for (let i = 0; i < translatedElements.length; i++) {
      const element = translatedElements[i];
      const value = t[element.dataset.i18n];

      if (typeof value === "string") {
        element.textContent = value;
      }
    }

    // Update translated input placeholders as well as visible text.
    const placeholderElements = document.querySelectorAll(
      "[data-i18n-placeholder]"
    );

    for (let i = 0; i < placeholderElements.length; i++) {
      const element = placeholderElements[i];
      const key = element.dataset.i18nPlaceholder;
      const placeholder = t[key];

      if (typeof placeholder === "string") {
        element.placeholder = placeholder;
      }

      element.lang = state.language;
      element.dir = direction;
    }

    const ariaLabelElements = document.querySelectorAll("[data-i18n-aria-label]");

    for (const element of ariaLabelElements) {
      const key = element.dataset.i18nAriaLabel;
      if (typeof t[key] === "string") {
        element.setAttribute("aria-label", t[key]);
      }
    }

    const titleElements = document.querySelectorAll("[data-i18n-title]");
    for (const element of titleElements) {
      const key = element.dataset.i18nTitle;
      if (typeof t[key] === "string") element.title = t[key];
    }

    const countdownLabel = document.querySelector(
      "#newroz-countdown-label"
    );

    if (countdownLabel) {
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
      window.CalendarSolarHijri.update(today, solarHijriDate, state.language);
    }

    if (countdown) {
      countdown.textContent = Core.localizeDigits(
        Core.daysUntilNewroz(today),
        state.language
      );
    }

  }

  function render() {
    try {
      localStorage.setItem("hewtujmer-view", state.view);
      localStorage.setItem(
        "hewtujmer-selected-date",
        Core.dateKey(state.selectedDate)
      );
    } catch (error) {
      // The calendar continues to work for this session.
    }

    updateTodayCards();
    View.render(state);
    updatePrintHeading();
  }

  function updatePrintHeading() {
    const heading = document.querySelector("#print-calendar-heading");
    if (!heading) return;

    const t = translations[state.language];
    const parts = Core.kurdishDateParts(state.selectedDate);
    const year = Core.localizeDigits(parts.year, state.language);
    heading.textContent = t.calendarNote + " " + year;
    heading.lang = state.language;
    heading.dir = state.language === "ckb" ? "rtl" : "ltr";
  }

  function drawNewrozSun() {
    const containers = document.querySelectorAll(".newroz-rays");

    for (const container of containers) {
      if (container.dataset.generated === "true") continue;
      container.replaceChildren();

      for (let index = 0; index < 21; index += 1) {
        const ray = document.createElement("span");
        ray.className = "newroz-ray";
        ray.setAttribute("aria-hidden", "true");
        ray.style.setProperty("--ray-angle", `${(index * 360) / 21}deg`);
        container.append(ray);
      }

      container.dataset.generated = "true";
    }
  }

  let deferredInstallPrompt = null;

  function setupProgressiveWebApp() {
    const installButton = document.querySelector("#install-app-button");

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register(new URL("service-worker.js", document.baseURI)).catch(error => {
        console.warn("Hewtûjmêr offline support could not be registered.", error);
      });
    }

    window.addEventListener("beforeinstallprompt", event => {
      event.preventDefault();
      deferredInstallPrompt = event;
      if (installButton) installButton.hidden = false;
    });

    if (installButton) {
      installButton.addEventListener("click", async () => {
        if (!deferredInstallPrompt) return;

        deferredInstallPrompt.prompt();
        await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;
        installButton.hidden = true;
      });
    }

    window.addEventListener("appinstalled", () => {
      deferredInstallPrompt = null;
      if (installButton) installButton.hidden = true;
    });
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
    drawNewrozSun();
    setupProgressiveWebApp();

    window.CalendarEvents.bind(state, {
      render,
      setLanguage,
      toggleTheme
    });

    window.addEventListener("calendar-movements-loaded", render);
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
})();
