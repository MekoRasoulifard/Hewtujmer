"use strict";

(function () {
  const VALID_VIEWS = new Set(["week", "day", "month", "calendar"]);

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
      const targetView = state.view === "day" ? "day" : "week";
      window.CalendarNavigation.setToday(state);
      window.CalendarNavigation.syncHash(targetView);
      render();
    }

    function navigateToView(view) {
      if (!VALID_VIEWS.has(view)) return;
      if (view === "calendar") {
        state.selectedDate = window.CalendarCore.startOfDay(new Date());
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
    if (window.CalendarExtras) window.CalendarExtras.bind(state);
  }
  window.CalendarEvents = Object.freeze({ bind });
})();

(function () {
  let movements = [];
  let gregorian = [];
  let loading = null;

  function loadMovements() {
    if (loading) return loading;
    loading = fetch("./static/calendar-movements.json")
      .then(response => {
        if (!response.ok) throw new Error("Movement data could not be loaded.");
        return response.json();
      })
      .then(data => {
        movements = Array.isArray(data.movements) ? data.movements : [];
        gregorian = Array.isArray(data.gregorian) ? data.gregorian : [];
        window.dispatchEvent(new Event("calendar-movements-loaded"));
        return true;
      })
      .catch(error => {
        console.error("Hewtûjmêr movement data could not be loaded.", error);
        return false;
      });
    return loading;
  }

  function getForDate(date, language) {
    const parts = window.CalendarCore.kurdishDateParts(date);
    const result = movements.filter(item => item.month === parts.month && item.day === parts.day);
    const key = String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
    for (const item of gregorian) {
      if (item[0] === key) result.push({ ckb: item[1], kmr: item[2], type: "international" });
    }
    return result.map(item => ({ title: language === "ckb" ? item.ckb : item.kmr, type: item.type || "historical" }));
  }
  window.CalendarMovements = Object.freeze({
    getForDate,
    load: loadMovements,
    get total() { return movements.length + gregorian.length; }
  });
  const STORAGE_KEY = "hewtujmer-notes-v1";
  function readNotes() {
    try { const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); return Array.isArray(value) ? value : []; }
    catch (error) { return []; }
  }
  function writeNotes(notes) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)); return true; } catch (error) { return false; } }

  function bindExtras(state) {
    const movementOverlay = document.querySelector("#movement-overlay");
    const notesOverlay = document.querySelector("#notes-overlay");
    const movementDialog = movementOverlay?.querySelector(".movement-dialog");
    const notesDialog = notesOverlay?.querySelector(".movement-dialog");
    const movementList = document.querySelector("#movement-list");
    const movementTitle = document.querySelector("#movement-title");
    let autoClose = null;
    let lastFocus = null;

    function openDialog(overlay, dialog) {
      if (!overlay || !dialog) return;
      lastFocus = document.activeElement;
      overlay.hidden = false;
      dialog.focus();
    }
    function closeDialog(overlay) {
      if (!overlay || overlay.hidden) return;
      overlay.hidden = true;
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    }
    function renderMovements(date, auto) {
      if (!movementList || !movementTitle) return;
      const Core = window.CalendarCore;
      const t = window.HewtujmerTranslations[state.language];
      clearTimeout(autoClose);
      autoClose = null;
      const list = window.CalendarMovements.getForDate(date, state.language);
      movementTitle.textContent = Core.formatKurdishDate(date, state.language);
      movementList.replaceChildren();
      if (!list.length) {
        const empty = document.createElement("p"); empty.textContent = t.noMovements; movementList.append(empty);
      } else {
        for (const item of list) {
          const article = document.createElement("article"); article.className = "movement-item";
          const type = document.createElement("span"); type.className = "movement-type";
          type.textContent = item.type === "international" ? t.internationalDay : item.type === "anniversary" ? t.anniversary : t.historicalEvent;
          const title = document.createElement("strong"); title.textContent = item.title;
          article.append(type, title); movementList.append(article);
        }
      }
      openDialog(movementOverlay, movementDialog);
      if (auto) {
        clearTimeout(autoClose);
        autoClose = setTimeout(() => closeDialog(movementOverlay), 10000);
      }
    }
    document.querySelector("#movements-button")?.addEventListener("click", () => {
      renderMovements(state.selectedDate, false);
    });
    document.querySelector("#movement-close")?.addEventListener("click", () => closeDialog(movementOverlay));
    movementOverlay?.addEventListener("click", () => closeDialog(movementOverlay));
    const noteForm = document.querySelector("#note-form");
    const noteText = document.querySelector("#note-text");
    const dateInput = document.querySelector("#reminder-date");
    const timeInput = document.querySelector("#reminder-time");
    const preset = document.querySelector("#reminder-preset");
    const customWrap = document.querySelector("#custom-reminder-wrap");
    const customMinutes = document.querySelector("#custom-reminder");
    const notesList = document.querySelector("#saved-notes-list");
    const noteStatus = document.querySelector("#note-status");

    function renderNotes() {
      if (!notesList) return;
      notesList.replaceChildren();
      const notes = readNotes();
      if (!notes.length) { const li = document.createElement("li"); li.textContent = "—"; notesList.append(li); return; }
      for (const note of notes) {
        const li = document.createElement("li"); li.className = "saved-note";
        const content = document.createElement("div");
        const text = document.createElement("p"); text.textContent = note.text;
        const meta = document.createElement("small"); meta.textContent = note.date + " · " + note.time;
        content.append(text, meta);
        const remove = document.createElement("button"); remove.type = "button"; remove.textContent = window.HewtujmerTranslations[state.language].deleteNote;
        remove.setAttribute("aria-label", window.HewtujmerTranslations[state.language].deleteNote + ": " + note.text.slice(0, 50));
        remove.addEventListener("click", () => {
          writeNotes(readNotes().filter(item => item.id !== note.id));
          renderNotes();
          window.dispatchEvent(new Event("calendar-notes-updated"));
        });
        li.append(content, remove); notesList.append(li);
      }
    }

    for (const savedNote of readNotes()) {
      window.CalendarNavigation.scheduleReminder(
        savedNote, state.language, readNotes, writeNotes, false
      );
    }

    document.querySelector("#notes-button")?.addEventListener("click", () => {
      const now = new Date();
      if (dateInput) dateInput.value = window.CalendarCore.dateKey(state.selectedDate || now);
      if (timeInput) timeInput.value = "";
      renderNotes(); openDialog(notesOverlay, notesDialog);
      noteText?.focus();
    });
    document.querySelector("#notes-close")?.addEventListener("click", () => closeDialog(notesOverlay));
    notesOverlay?.addEventListener("click", event => { if (event.target === notesOverlay) closeDialog(notesOverlay); });
    preset?.addEventListener("change", () => { if (customWrap) customWrap.hidden = preset.value !== "custom"; });
    noteForm?.addEventListener("submit", event => {
      event.preventDefault();
      const text = noteText?.value.trim();
      if (!text) return;
      const date = dateInput?.value || window.CalendarCore.dateKey(state.selectedDate);
      const time = timeInput?.value || "";
      const minutes = time
        ? (preset.value === "custom" ? Number(customMinutes.value) : Number(preset.value))
        : 0;
      if (time && (!Number.isFinite(minutes) || minutes < 0 || minutes > 10080)) return;
      const notes = readNotes();
      const note = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        text,
        date,
        time,
        remindBefore: minutes,
        reminderShownAt: null
      };
      notes.push(note);
      if (!writeNotes(notes)) {
        noteStatus.textContent = "Storage is unavailable in this browser.";
        return;
      }
      noteText.value = "";
      noteStatus.textContent = window.HewtujmerTranslations[state.language].noteSaved;
      renderNotes();
      window.CalendarNavigation.scheduleReminder(note, state.language, readNotes, writeNotes, Boolean(time));
      window.dispatchEvent(new Event("calendar-notes-updated"));
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") { closeDialog(movementOverlay); closeDialog(notesOverlay); }
      const activeOverlay = !notesOverlay?.hidden ? notesOverlay : !movementOverlay?.hidden ? movementOverlay : null;
      if (event.key === "Tab" && activeOverlay) {
        const focusable = activeOverlay.querySelectorAll("button, input, textarea, select, [tabindex='0']");
        if (!focusable.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });

    // Load the supplied movement list, then show today's items briefly when available.
    window.CalendarMovements.load().then(loaded => {
      if (!loaded) return;
      const today = window.CalendarCore.startOfDay(new Date());
      if (window.CalendarMovements.getForDate(today, state.language).length) {
        setTimeout(() => renderMovements(today, true), 450);
      }
    });
  }
  window.CalendarExtras = Object.freeze({ bind: bindExtras });
})();
