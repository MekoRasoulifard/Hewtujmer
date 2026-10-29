
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

  function getSolarHijriParts(date) {
    const formatter = new Intl.DateTimeFormat("en-u-ca-persian-nu-latn", {
      day: "2-digit",
      month: "numeric",
      year: "numeric"
    });
    const formattedParts = formatter.formatToParts(date);
    const values = {};

    for (let i = 0; i < formattedParts.length; i++) {
      const part = formattedParts[i];
      if (part.type !== "literal") {
        values[part.type] = part.value;
      }
    }

    return values;
  }

  function showSoraniSolarHijriDate(element, parts) {
    const months = [
      "فەرڤەردین", "ئوردیبهێشت", "خۆرداد", "تیر", "مۆرداد", "شەهریوەر",
      "مەهر", "ئابان", "ئازەر", "دەی", "بەهمەن", "ئێسفەند"
    ];
    const monthNumber = Number(parts.month);
    const monthName = months[monthNumber - 1] || "";
    const dateParts = [parts.day.padStart(2, "0"), monthName, parts.year];
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < dateParts.length; i++) {
      const part = document.createElement("span");
      part.textContent = dateParts[i];
      part.dir = "rtl";
      part.lang = "ckb";
      part.className = "solar-hijri-part";
      fragment.appendChild(part);
    }

    element.replaceChildren(fragment);
    element.dir = "rtl";
    element.lang = "ckb";
    element.classList.add("solar-hijri-sorani");
  }

  function updateSolarHijriDate(date, element) {
    try {
      const parts = getSolarHijriParts(date);

      switch (state.language) {
        case "ckb":
          showSoraniSolarHijriDate(element, parts);
          break;
        case "kmr":
          element.classList.remove("solar-hijri-sorani");
          element.textContent = new Intl.DateTimeFormat("ku", {
            calendar: "persian",
            day: "numeric",
            month: "short",
            year: "numeric"
          }).format(date);
          element.dir = "ltr";
          element.lang = "kmr";
          break;
        default:
          element.classList.remove("solar-hijri-sorani");
          element.textContent = new Intl.DateTimeFormat("en-GB", {
            calendar: "persian",
            day: "numeric",
            month: "short",
            year: "numeric"
          }).format(date);
          element.dir = "ltr";
          element.lang = "en";
          break;
      }
    } catch (error) {
      element.textContent = "—";
      element.dir = state.language === "ckb" ? "rtl" : "ltr";
      element.lang = state.language;
      element.classList.remove("solar-hijri-sorani");
    }
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
      updateSolarHijriDate(today, solarHijriDate);
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
  const containers = document.querySelectorAll(".newroz-rays");

  for (let containerIndex = 0; containerIndex < containers.length; containerIndex++) {
    const container = containers[containerIndex];

    // Prevent generating the rays more than once.
    if (container.dataset.generated === "true") {
      continue;
    }

    // Clear old generated rays if necessary.
    container.replaceChildren();

    // Generate the 21 rays.
    for (let rayIndex = 0; rayIndex < 21; rayIndex++) {
      const ray = document.createElement("span");
      ray.className = "newroz-ray";
      ray.setAttribute("aria-hidden", "true");
      ray.style.setProperty("--ray-angle", `${(rayIndex * 360) / 21}deg`);
      container.appendChild(ray);
    }

    // Mark this container as generated.
    container.dataset.generated = "true";
  }
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

// Disable the browser context menu.
document.addEventListener("contextmenu", event => {
  event.preventDefault();
});

