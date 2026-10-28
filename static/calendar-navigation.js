
"use strict";

(function () {
  const Core = window.CalendarCore;
  const VALID_VIEWS = new Set(["week", "month", "calendar"]);

  function move(state, amount) {
    if (!Core || !state || !Number.isInteger(amount)) {
      return state;
    }

    if (state.view === "week") {
      state.selectedDate = Core.addDays(
        state.selectedDate,
        amount * 7
      );

      return state;
    }

    const parts = Core.kurdishDateParts(state.selectedDate);

    if (state.view === "month") {
      const totalMonth = parts.month + amount;
      const year = parts.year + Math.floor(totalMonth / 12);
      const month = ((totalMonth % 12) + 12) % 12;
      const day = Math.min(
        parts.day,
        Core.kurdishMonthLength(year, month)
      );

      state.selectedDate = Core.addDays(
        Core.kurdishMonthStart(year, month),
        day - 1
      );

      return state;
    }

    if (state.view === "calendar") {
      const year = parts.year + amount;
      const day = Math.min(
        parts.day,
        Core.kurdishMonthLength(year, parts.month)
      );

      state.selectedDate = Core.addDays(
        Core.kurdishMonthStart(year, parts.month),
        day - 1
      );
    }

    return state;
  }

  function setView(state, view) {
    if (!state || !VALID_VIEWS.has(view)) {
      return state;
    }

    state.view = view;
    return state;
  }

  function setToday(state) {
    if (!state || !Core) {
      return state;
    }

    state.selectedDate = Core.startOfDay(new Date());
    state.view = "week";

    return state;
  }

  function readViewFromHash() {
    const requested = window.location.hash
      .replace(/^#\/?/, "")
      .toLowerCase();

    return VALID_VIEWS.has(requested) ? requested : "week";
  }

  function syncHash(view) {
    if (!VALID_VIEWS.has(view)) {
      return;
    }

    const hash = `#${view}`;

    if (window.location.hash !== hash) {
      window.location.hash = hash;
    }
  }

  window.CalendarNavigation = Object.freeze({
    move,
    setView,
    setToday,
    readViewFromHash,
    syncHash
  });
})();
