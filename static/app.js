
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

    if (icon) icon.textContent = isDark ? "☀" : "☾";

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

    document.documentElement.lang = state.language;
    document.documentElement.dir =
      state.language === "en" ? "ltr" : "rtl";

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
      countdownLabel.dir =
        state.language === "en" ? "ltr" : "rtl";

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

    const subtitle = document.querySelector("#hero-subtitle");

    if (subtitle) {
      subtitle.textContent = Core.formatWeekRange(
        state.selectedDate,
        state.language
      );
    }
  }

  function updateNavigation() {
    document.querySelectorAll("[data-view-link]").forEach(link => {
      const active = link.dataset.viewLink === state.view;

      link.classList.toggle("active", active);

      if (active) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  // FIX: Refresh the Today button every time the calendar renders.
  function updateTodayButton() {
    const todayButton =
      document.querySelector("#today-button");

    if (!todayButton) return;

    const today = Core.startOfDay(new Date());

    const currentWeek = Core.isoWeekInfo(today);
    const displayedWeek = Core.isoWeekInfo(
      Core.startOfDay(state.selectedDate)
    );

    const isCurrentWeek =
      currentWeek.week === displayedWeek.week &&
      currentWeek.year === displayedWeek.year;

    todayButton.classList.toggle("active", isCurrentWeek);

    todayButton.setAttribute(
      "aria-pressed",
      String(isCurrentWeek)
    );
  }

  function render() {
    updateTodayCards();
    updateNavigation();
    updateTodayButton();
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
})();
