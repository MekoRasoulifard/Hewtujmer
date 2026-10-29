
"use strict";

(function () {
  const VALID_VIEWS = new Set(["week", "month", "calendar"]);

  function bind(state, actions) {
    const $ = selector => document.querySelector(selector);

    const languageSelect = $("#language-select");
    const themeToggle = $("#theme-toggle");
    const printButton = $("#print-button");
    const todayButton = $("#today-button");
    const brand = $(".brand");
    const previousButton = $("#previous-button");
    const nextButton = $("#next-button");
    const searchForm = $("#week-search-form");
    const searchError = $("#week-search-error");
    const content = $("#calendar-content");

    function getSearchInput() {
      return $("#week-search-input") ||
        searchForm?.querySelector(
          'input[type="search"], input[type="text"], input'
        );
    }

    function render() {
      actions.render();
    }

    function navigateToToday() {
      window.CalendarNavigation.setToday(state);
      window.CalendarNavigation.syncHash("week");
      render();
    }

    
function navigateToView(view) {
  if (!VALID_VIEWS.has(view)) return;

  if (view === "calendar") {
    // Reset to today's date before rendering the year.
    state.selectedDate =
      window.CalendarCore.startOfDay(new Date());
  }

  window.CalendarNavigation.setView(state, view);
  window.CalendarNavigation.syncHash(view);
  render();
}


    function clearSearchError() {
      if (searchError) {
        searchError.textContent = "";
        searchError.hidden = true;
      }

      getSearchInput()?.removeAttribute("aria-invalid");
    }

    function clearSearchInput() {
      const input = getSearchInput();

      if (input) {
        input.value = "";
        input.defaultValue = "";
        input.removeAttribute("value");
      }
    }

    languageSelect?.addEventListener("change", event => {
      actions.setLanguage(event.target.value);
    });

    themeToggle?.addEventListener("click", () => {
      actions.toggleTheme();
    });

    printButton?.addEventListener("click", () => {
      window.print();
    });

    todayButton?.addEventListener("click", navigateToToday);

    brand?.addEventListener("click", event => {
      event.preventDefault();
      navigateToToday();
    });

    previousButton?.addEventListener("click", () => {
      window.CalendarNavigation.move(state, -1);
      render();
    });

    nextButton?.addEventListener("click", () => {
      window.CalendarNavigation.move(state, 1);
      render();
    });

    getSearchInput()?.addEventListener("input", clearSearchError);

    searchForm?.addEventListener("submit", event => {
      event.preventDefault();

      const input = getSearchInput();

      const result = window.CalendarCore.parseSearch(
        input?.value || "",
        new Date()
      );

      // Keep invalid input so the user can correct it.
      if (
        !result ||
        !(result.date instanceof Date) ||
        Number.isNaN(result.date.getTime())
      ) {
        if (searchError) {
          const translations =
            window.HewtujmerTranslations?.[state.language];

          searchError.textContent =
            translations?.searchError ||
            "Please enter a valid date or week.";

          searchError.hidden = false;
        }

        input?.setAttribute("aria-invalid", "true");
        input?.focus();

        return;
      }

      // Clear the field immediately after a successful search.
      clearSearchError();
      clearSearchInput();

      state.selectedDate =
        window.CalendarCore.startOfDay(result.date);

      state.view = "week";

      window.CalendarNavigation.syncHash("week");
      render();

      // Recheck after rendering in case the renderer restored
      // the previous value or recreated the input element.
      clearSearchInput();
    });

    content?.addEventListener("click", event => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const dateButton = event.target.closest("[data-date]");

      if (dateButton && content.contains(dateButton)) {
        const date = window.CalendarCore.dateFromKey(
          dateButton.dataset.date
        );

        if (!date) {
          return;
        }

        state.selectedDate = date;

        if (state.view === "calendar") {
          window.CalendarNavigation.setView(state, "month");
          window.CalendarNavigation.syncHash("month");
        }

        render();
        return;
      }

      const monthButton = event.target.closest("[data-month]");

      if (monthButton && content.contains(monthButton)) {
        const year = Number(monthButton.dataset.year);
        const month = Number(monthButton.dataset.month);

        if (
          !Number.isInteger(year) ||
          !Number.isInteger(month) ||
          month < 0 ||
          month > 11
        ) {
          return;
        }

        state.selectedDate =
          window.CalendarCore.kurdishMonthStart(year, month);

        navigateToView("month");
      }
    });

    document.querySelectorAll("[data-view-link]").forEach(link => {
      link.addEventListener("click", event => {
        event.preventDefault();
        navigateToView(link.dataset.viewLink);
      });
    });

    window.addEventListener("hashchange", () => {
      state.view =
        window.CalendarNavigation.readViewFromHash();

      render();
    });
  }

  window.CalendarEvents = Object.freeze({ bind });
})();
