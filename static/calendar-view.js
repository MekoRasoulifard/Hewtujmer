
"use strict";

(function () {
  const Core = window.CalendarCore;

  function getElements() {
    return {
      content: document.querySelector("#calendar-content"),
      heading: document.querySelector("#calendar-heading"),
      eyebrow: document.querySelector("#view-eyebrow"),
      weekNumber: document.querySelector("#iso-week-number"),
      subtitle: document.querySelector("#hero-subtitle"),
      todayButton: document.querySelector("#today-button")
    };
  }

  function isTodayWeek(date, today = new Date()) {
    const selectedWeek = Core.isoWeekInfo(date);
    const currentWeek = Core.isoWeekInfo(today);

    return (
      selectedWeek.week === currentWeek.week &&
      selectedWeek.year === currentWeek.year
    );
  }

  function updateTodayButton(state, button) {
    if (!button) return;

    const active =
      state.view === "week" &&
      isTodayWeek(state.selectedDate);

    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  }

  function updateViewNavigation(state) {
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

  function renderWeek(state) {
    const { content, heading, eyebrow, weekNumber } = getElements();
    const t = window.HewtujmerTranslations[state.language];
    const selectedParts = Core.kurdishDateParts(state.selectedDate);
    const monday = Core.startOfWeek(state.selectedDate);
    const info = Core.isoWeekInfo(state.selectedDate);
    const todayKey = Core.dateKey(new Date());
    const selectedKey = Core.dateKey(state.selectedDate);

    eyebrow.textContent = t.weekView;

    heading.textContent =
      `${t.months[selectedParts.month]} ` +
      Core.localizeDigits(selectedParts.year, state.language);

    const grid = document.createElement("div");
    grid.className = "week-grid";

    for (let index = 0; index < 7; index += 1) {
      const date = Core.addDays(monday, index);
      const parts = Core.kurdishDateParts(date);
      const key = Core.dateKey(date);
      const holiday = Core.getHoliday(date, state.language);
      const selected = key === selectedKey;
      const today = key === todayKey;

      const card = document.createElement("button");
      card.type = "button";
      card.className = "day-card";
      card.dataset.date = key;

      card.classList.toggle("selected", selected);
      card.classList.toggle("today", today);
      card.classList.toggle("holiday", Boolean(holiday));

      card.setAttribute("aria-pressed", String(selected));
      card.setAttribute(
        "aria-label",
        `${t.weekdays[index]}, ` +
          `${Core.formatKurdishDate(date, state.language)}` +
          `${holiday ? `, ${holiday}` : ""}`
      );

      if (today) {
        card.setAttribute("aria-current", "date");
      }

      const name = document.createElement("span");
      name.className = "day-name";
      name.textContent = t.weekdays[index];

      const number = document.createElement("span");
      number.className = "day-number";
      number.textContent = Core.localizeDigits(
        parts.day,
        state.language
      );

      const month = document.createElement("span");
      month.className = "day-month";
      month.textContent = t.months[parts.month];

      card.append(name, number, month);

      if (holiday) {
        const holidayName = document.createElement("span");
        holidayName.className = "holiday-name";
        holidayName.textContent = holiday;
        card.append(holidayName);
      }

      grid.append(card);
    }

    content.replaceChildren(grid);

    if (weekNumber) {
      weekNumber.textContent = Core.localizeDigits(
        info.week,
        state.language
      );
    }
  }

  function renderMonth(state) {
    const { content, heading, eyebrow } = getElements();
    const t = window.HewtujmerTranslations[state.language];
    const parts = Core.kurdishDateParts(state.selectedDate);

    const firstDay = Core.kurdishMonthStart(
      parts.year,
      parts.month
    );

    const length = Core.kurdishMonthLength(
      parts.year,
      parts.month
    );

    const offset = Core.mondayIndex(firstDay);

    eyebrow.textContent = t.monthView;

    heading.textContent =
      `${t.months[parts.month]} ` +
      Core.localizeDigits(parts.year, state.language);

    const grid = document.createElement("div");
    grid.className = "month-grid";

    t.weekdaysShort.forEach(label => {
      const cell = document.createElement("div");
      cell.className = "weekday-heading";
      cell.textContent = label;
      cell.setAttribute("aria-hidden", "true");
      grid.append(cell);
    });

    const cellCount = Math.ceil((offset + length) / 7) * 7;
    const todayKey = Core.dateKey(new Date());
    const selectedKey = Core.dateKey(state.selectedDate);

    for (let index = 0; index < cellCount; index += 1) {
      const date = Core.addDays(firstDay, index - offset);
      const dateParts = Core.kurdishDateParts(date);
      const key = Core.dateKey(date);
      const holiday = Core.getHoliday(date, state.language);
      const selected = key === selectedKey;
      const today = key === todayKey;

      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "day-cell";
      cell.dataset.date = key;

      cell.textContent = Core.localizeDigits(
        dateParts.day,
        state.language
      );

      if (
        dateParts.month !== parts.month ||
        dateParts.year !== parts.year
      ) {
        cell.classList.add("outside-month");
      }

      cell.classList.toggle("today", today);
      cell.classList.toggle("selected", selected);
      cell.classList.toggle("holiday", Boolean(holiday));

      cell.setAttribute("aria-pressed", String(selected));
      cell.setAttribute(
        "aria-label",
        `${Core.formatKurdishDate(date, state.language)}` +
          `${holiday ? `, ${holiday}` : ""}`
      );

      if (today) {
        cell.setAttribute("aria-current", "date");
      }

      grid.append(cell);
    }

    content.replaceChildren(grid);
  }

  function renderYear(state) {
    const { content, heading, eyebrow } = getElements();
    const t = window.HewtujmerTranslations[state.language];

    const today = Core.startOfDay(new Date());
    const todayParts = Core.kurdishDateParts(today);
    const selectedParts = Core.kurdishDateParts(state.selectedDate);
    const year = selectedParts.year;
    const todayKey = Core.dateKey(today);

    eyebrow.textContent = t.calendarView;

    heading.textContent = Core.localizeDigits(
      year,
      state.language
    );

    const grid = document.createElement("div");
    grid.className = "year-grid";

    for (let month = 0; month < 12; month += 1) {
      const firstDay = Core.kurdishMonthStart(year, month);
      const length = Core.kurdishMonthLength(year, month);
      const offset = Core.mondayIndex(firstDay);

      const button = document.createElement("button");
      button.type = "button";
      button.className = "mini-month";
      button.dataset.month = String(month);
      button.dataset.year = String(year);

      const isCurrentMonth =
        year === todayParts.year && month === todayParts.month;
      const isSelectedMonth = month === selectedParts.month;
      const localizedYear = Core.localizeDigits(year, state.language);

      button.classList.toggle("current-month", isCurrentMonth);
      button.classList.toggle("selected", isSelectedMonth);

      if (isCurrentMonth) {
        button.dataset.currentMonth = "true";
        button.setAttribute("aria-current", "date");
      }

      button.setAttribute(
        "aria-label",
        `${t.months[month]} ${localizedYear}` +
          (isCurrentMonth ? " (current month)" : "") +
          (isSelectedMonth ? " (selected month)" : "")
      );

      const title = document.createElement("span");
      title.className = "mini-month-title";
      title.textContent = t.months[month];

      const days = document.createElement("span");
      days.className = "mini-days";

      t.weekdaysShort.forEach(label => {
        const weekday = document.createElement("span");
        weekday.textContent = label;
        weekday.setAttribute("aria-hidden", "true");
        days.append(weekday);
      });

      const count = Math.ceil((offset + length) / 7) * 7;

      for (let index = 0; index < count; index += 1) {
        const dayNumber = index - offset + 1;
        const day = document.createElement("span");

        if (dayNumber >= 1 && dayNumber <= length) {
          const date = Core.addDays(firstDay, dayNumber - 1);
          const key = Core.dateKey(date);
          const holiday = Core.getHoliday(date, state.language);
          const isToday = key === todayKey;

          day.textContent = Core.localizeDigits(
            dayNumber,
            state.language
          );

          // Keep the date available to your existing click handler.
          day.dataset.date = key;
          day.classList.toggle("today", isToday);

          day.setAttribute(
            "aria-label",
            Core.formatKurdishDate(date, state.language)
          );

          if (isToday) {
            day.setAttribute("aria-current", "date");
            day.title = Core.formatKurdishDate(
              date,
              state.language
            );
          }

          if (holiday) {
            day.classList.add("holiday-day");
            day.title = holiday;
          }
        } else {
          day.textContent = "";
          day.setAttribute("aria-hidden", "true");
        }

        days.append(day);
      }

      button.append(title, days);
      grid.append(button);
    }

    // Insert the complete calendar before attempting to scroll.
    content.replaceChildren(grid);

    // Wait for layout, then scroll the CURRENT Kurdish month into view.
    requestAnimationFrame(() => {
      // Do not scroll if the user has already switched to another view.
      if (!content.isConnected || !content.querySelector(".year-grid")) {
        return;
      }

      if (year !== todayParts.year) return;

      const currentMonth = content.querySelector(
        '.mini-month[data-current-month="true"]'
      );

      if (!currentMonth) return;

      currentMonth.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest"
      });
    });
  }

  function render(state) {
    if (
      !Core ||
      !state ||
      !(state.selectedDate instanceof Date)
    ) {
      return;
    }

    const elements = getElements();

    if (!elements.content) return;

    const t = window.HewtujmerTranslations?.[state.language];

    if (!t) {
      console.error(
        `Missing translations for language: ${state.language}`
      );
      return;
    }

    const info = Core.isoWeekInfo(state.selectedDate);

    if (elements.weekNumber) {
      elements.weekNumber.textContent = Core.localizeDigits(
        info.week,
        state.language
      );
    }

    if (elements.subtitle) {
      elements.subtitle.textContent = Core.formatWeekRange(
        state.selectedDate,
        state.language
      );

      elements.subtitle.dir =
        state.language === "ckb" ? "rtl" : "ltr";
    }

    updateTodayButton(state, elements.todayButton);
    updateViewNavigation(state);

    if (state.view === "week") {
      renderWeek(state);
    } else if (state.view === "month") {
      renderMonth(state);
    } else if (state.view === "calendar") {
      renderYear(state);
    }
  }

  window.CalendarView = Object.freeze({
    render,
    isTodayWeek,
    updateTodayButton
  });
})();
