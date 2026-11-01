
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
    const savedDate = window.HewtujmerStorage?.get("selected-date");
    const parsedDate = savedDate ? Core.dateFromKey(savedDate) : null;
    return parsedDate ? Core.startOfDay(parsedDate) : Core.startOfDay(new Date());
  }

  function readSavedView() {
    const savedView = window.HewtujmerStorage?.get("view");
    if (["week", "day", "month", "calendar"].includes(savedView)) return savedView;
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

    window.HewtujmerStorage?.set("theme", selected);

    const icon = document.querySelector("#theme-toggle .theme-icon");
    const button = document.querySelector("#theme-toggle");
    const isDark = selected === "dark";
    const t = translations[state.language] || translations.en;
    const label = isDark
      ? t.switchToLight
      : t.switchToDark;

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
      const group = languageSelect.querySelector("#language-group");
      if (group) group.label = t.languageGroup;
      for (const option of languageSelect.querySelectorAll("[data-i18n-option]")) {
        const value = t[option.dataset.i18nOption];
        if (typeof value === "string") option.textContent = value;
      }
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

    window.HewtujmerStorage?.set("language", nextLanguage);

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
    window.HewtujmerStorage?.set("view", state.view);
    window.HewtujmerStorage?.set("selected-date", Core.dateKey(state.selectedDate));

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

  function setupProgressiveWebApp() {
    window.CalendarNavigation.setupProgressiveWebApp();
  }

  function initialize() {
    const theme = window.HewtujmerStorage?.get("theme", "light") || "light";

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
    window.addEventListener("calendar-notes-updated", render);
    window.HewtujmerData?.bindLifecycleRefresh();
    window.HewtujmerData?.initialize();
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
