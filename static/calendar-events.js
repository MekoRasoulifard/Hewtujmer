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
<<<<<<< HEAD
      if (view === "calendar" || view === "day") {
=======
      if (view === "calendar") {
>>>>>>> 26494999ea39bc70bfc6b80d481768d8b1e343eb
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
<<<<<<< HEAD
        window.CalendarExtras?.showMovements(date);
=======
>>>>>>> 26494999ea39bc70bfc6b80d481768d8b1e343eb
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

<<<<<<< HEAD
  function refreshMovements() {
    if (loading) return loading;
    loading = fetch("/static/calendar-movements.json", { cache: "no-store" })
=======
  function loadMovements() {
    if (loading) return loading;
    loading = fetch("./static/calendar-movements.json")
>>>>>>> 26494999ea39bc70bfc6b80d481768d8b1e343eb
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
<<<<<<< HEAD
        console.warn("Hewtûjmêr is keeping the available offline event data.", error.message);
        return false;
      })
      .finally(() => { loading = null; });
    return loading;
  }

  function loadMovements() {
    if (movements.length || gregorian.length) return Promise.resolve(true);
    return refreshMovements();
  }

=======
        console.error("Hewtûjmêr movement data could not be loaded.", error);
        return false;
      });
    return loading;
  }

>>>>>>> 26494999ea39bc70bfc6b80d481768d8b1e343eb
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
<<<<<<< HEAD
    refresh: refreshMovements,
    get total() { return movements.length + gregorian.length; }
  });
=======
    get total() { return movements.length + gregorian.length; }
  });
  const STORAGE_KEY = "hewtujmer-notes-v1";
  function readNotes() {
    try { const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); return Array.isArray(value) ? value : []; }
    catch (error) { return []; }
  }
  function writeNotes(notes) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)); return true; } catch (error) { return false; } }

>>>>>>> 26494999ea39bc70bfc6b80d481768d8b1e343eb
  function bindExtras(state) {
    const movementOverlay = document.querySelector("#movement-overlay");
    const notesOverlay = document.querySelector("#notes-overlay");
    const movementDialog = movementOverlay?.querySelector(".movement-dialog");
    const notesDialog = notesOverlay?.querySelector(".movement-dialog");
    const movementList = document.querySelector("#movement-list");
    const movementTitle = document.querySelector("#movement-title");
<<<<<<< HEAD
=======
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
>>>>>>> 26494999ea39bc70bfc6b80d481768d8b1e343eb
    const noteForm = document.querySelector("#note-form");
    const noteText = document.querySelector("#note-text");
    const dateInput = document.querySelector("#reminder-date");
    const timeInput = document.querySelector("#reminder-time");
    const preset = document.querySelector("#reminder-preset");
    const customWrap = document.querySelector("#custom-reminder-wrap");
    const customMinutes = document.querySelector("#custom-reminder");
    const notesList = document.querySelector("#saved-notes-list");
    const noteStatus = document.querySelector("#note-status");
<<<<<<< HEAD
    const saveButton = document.querySelector("#note-save-button");
    const cancelEditButton = document.querySelector("#note-cancel-edit");
    const notificationButton = document.querySelector("#enable-notifications-button");
    const noteTab = document.querySelector("#notes-tab");
    const remindersTab = document.querySelector("#reminders-tab");
    const notesPanel = document.querySelector("#notes-panel");
    const remindersPanel = document.querySelector("#reminders-panel");
    const reminderForm = document.querySelector("#reminder-form");
    const reminderTitle = document.querySelector("#reminder-title");
    const reminderDescription = document.querySelector("#reminder-description");
    const calendarReminderDate = document.querySelector("#calendar-reminder-date");
    const calendarReminderTime = document.querySelector("#calendar-reminder-time");
    const calendarReminderPreset = document.querySelector("#calendar-reminder-preset");
    const calendarCustomWrap = document.querySelector("#calendar-custom-reminder-wrap");
    const calendarCustomMinutes = document.querySelector("#calendar-custom-reminder");
    const calendarReminderNotification = document.querySelector("#calendar-reminder-notification");
    const reminderStatus = document.querySelector("#reminder-status");
    const reminderSaveButton = document.querySelector("#calendar-reminder-save");
    const reminderCancelButton = document.querySelector("#calendar-reminder-cancel");
    const reminderNotificationsButton = document.querySelector("#enable-reminder-notifications");
    const remindersList = document.querySelector("#saved-reminders-list");
    let autoClose = null;
    let lastFocus = null;
    let editingNoteId = null;
    let editingReminderId = null;

    function translations() {
      return window.HewtujmerTranslations[state.language] || window.HewtujmerTranslations.en;
    }

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

    function renderMovements(date, automatic = false) {
      if (!movementList || !movementTitle) return false;
      const list = window.CalendarMovements.getForDate(date, state.language);
      if (!list.length) return false;

      const Core = window.CalendarCore;
      clearTimeout(autoClose);
      autoClose = null;
      movementTitle.textContent = Core.formatKurdishDate(date, state.language);
      movementList.replaceChildren();

      for (const item of list) {
        const article = document.createElement("article");
        article.className = "movement-item";
        const type = document.createElement("span");
        type.className = "movement-type";
        type.textContent = item.type === "international"
          ? translations().internationalDay
          : item.type === "anniversary" ? translations().anniversary : translations().historicalEvent;
        const title = document.createElement("strong");
        title.textContent = item.title;
        article.append(type, title);
        movementList.append(article);
      }

      openDialog(movementOverlay, movementDialog);
      if (automatic) {
        autoClose = window.setTimeout(() => closeDialog(movementOverlay), 10000);
      }
      return true;
    }

    function showDateEvents(date) {
      if (!date || !window.CalendarMovements) return false;
      return renderMovements(date, false);
    }

    function resetNoteForm() {
      editingNoteId = null;
      noteForm?.reset();
      if (customWrap) customWrap.hidden = true;
      if (saveButton) saveButton.textContent = translations().saveNote;
      if (cancelEditButton) cancelEditButton.hidden = true;
    }
=======
>>>>>>> 26494999ea39bc70bfc6b80d481768d8b1e343eb

    function renderNotes() {
      if (!notesList) return;
      notesList.replaceChildren();
<<<<<<< HEAD
      const notes = window.HewtujmerData?.getNotes() || [];
      const visibleNotes = notes.filter(note => note.syncStatus !== "pendingDelete");

      if (!visibleNotes.length) {
        const empty = document.createElement("li");
        empty.className = "saved-notes-empty";
        empty.textContent = "—";
        notesList.append(empty);
        return;
      }

      for (const note of visibleNotes) {
        const item = document.createElement("li");
        item.className = "saved-note";
        const content = document.createElement("div");
        const text = document.createElement("p");
        text.textContent = note.text;
        const meta = document.createElement("small");
        meta.textContent = [note.date, note.time].filter(Boolean).join(" · ") || translations().noReminderDate;
        content.append(text, meta);

        const actions = document.createElement("div");
        actions.className = "saved-note-actions";
        const edit = document.createElement("button");
        edit.type = "button";
        edit.textContent = translations().editNote;
        edit.setAttribute("aria-label", `${translations().editNote}: ${note.text.slice(0, 50)}`);
        edit.addEventListener("click", () => editNote(note));

        const remove = document.createElement("button");
        remove.type = "button";
        remove.textContent = translations().deleteNote;
        remove.setAttribute("aria-label", `${translations().deleteNote}: ${note.text.slice(0, 50)}`);
        remove.addEventListener("click", async () => {
          try {
            await window.HewtujmerData.deleteNote(note.id);
            if (editingNoteId === note.id) resetNoteForm();
            renderNotes();
          } catch (error) {
            if (noteStatus) noteStatus.textContent = error.message;
          }
        });

        actions.append(edit, remove);
        item.append(content, actions);
        notesList.append(item);
      }
    }

    function editNote(note) {
      editingNoteId = note.id;
      if (noteText) noteText.value = note.text;
      if (dateInput) dateInput.value = note.date || "";
      if (timeInput) timeInput.value = note.time || "";
      const minutes = Number(note.remindBefore || 0);
      const presetValue = [0, 15, 30, 60].includes(minutes) ? String(minutes) : "custom";
      if (preset) preset.value = presetValue;
      if (customWrap) customWrap.hidden = presetValue !== "custom";
      if (customMinutes) customMinutes.value = String(minutes || 15);
      if (saveButton) saveButton.textContent = translations().updateNote;
      if (cancelEditButton) cancelEditButton.hidden = false;
      noteText?.focus();
    }

    function selectNotesTab(name) {
      const showNotes = name !== "reminders";
      if (notesPanel) notesPanel.hidden = !showNotes;
      if (remindersPanel) remindersPanel.hidden = showNotes;
      noteTab?.setAttribute("aria-selected", showNotes ? "true" : "false");
      remindersTab?.setAttribute("aria-selected", showNotes ? "false" : "true");

      // Do not focus a control while its dialog is still hidden.
      if (!notesOverlay?.hidden) {
        if (showNotes) noteText?.focus({ preventScroll: true });
        else reminderTitle?.focus({ preventScroll: true });
      }
    }

    function resetReminderForm() {
      editingReminderId = null;
      reminderForm?.reset();
      if (calendarCustomWrap) calendarCustomWrap.hidden = true;
      if (reminderSaveButton) reminderSaveButton.textContent = translations().saveReminder;
      if (reminderCancelButton) reminderCancelButton.hidden = true;
      if (calendarReminderNotification) calendarReminderNotification.checked = true;
    }

    function editReminder(reminder) {
      editingReminderId = reminder.id;
      if (reminderTitle) reminderTitle.value = reminder.title;
      if (reminderDescription) reminderDescription.value = reminder.description || "";
      if (calendarReminderDate) calendarReminderDate.value = reminder.date;
      if (calendarReminderTime) calendarReminderTime.value = reminder.time;
      const minutes = Number(reminder.remindBefore || 0);
      const presetValue = [0, 15, 30, 60].includes(minutes) ? String(minutes) : "custom";
      if (calendarReminderPreset) calendarReminderPreset.value = presetValue;
      if (calendarCustomWrap) calendarCustomWrap.hidden = presetValue !== "custom";
      if (calendarCustomMinutes) calendarCustomMinutes.value = String(minutes || 15);
      if (calendarReminderNotification) calendarReminderNotification.checked = reminder.notificationEnabled !== false;
      if (reminderSaveButton) reminderSaveButton.textContent = translations().updateNote;
      if (reminderCancelButton) reminderCancelButton.hidden = false;
      reminderTitle?.focus();
    }

    function renderReminders() {
      if (!remindersList) return;
      remindersList.replaceChildren();
      const reminders = (window.HewtujmerData?.getReminders() || [])
        .slice().sort((first, second) => `${first.date}T${first.time}`.localeCompare(`${second.date}T${second.time}`));
      if (!reminders.length) {
        const empty = document.createElement("li");
        empty.className = "saved-notes-empty";
        empty.textContent = translations().noSavedReminders;
        remindersList.append(empty);
        return;
      }

      for (const reminder of reminders) {
        const item = document.createElement("li");
        item.className = reminder.completed ? "saved-note saved-reminder-completed" : "saved-note";
        const content = document.createElement("div");
        const title = document.createElement("p");
        title.textContent = reminder.title;
        const meta = document.createElement("small");
        meta.textContent = [reminder.date, reminder.time].filter(Boolean).join(" · ");
        content.append(title, meta);
        if (reminder.description) {
          const description = document.createElement("p");
          description.className = "saved-reminder-description";
          description.textContent = reminder.description;
          content.append(description);
        }

        const actions = document.createElement("div");
        actions.className = "saved-note-actions";
        const complete = document.createElement("button");
        complete.type = "button";
        complete.textContent = reminder.completed ? translations().reminderRestore : translations().reminderCompleted;
        complete.addEventListener("click", async () => {
          try {
            await window.HewtujmerData.completeReminder(reminder.id, !reminder.completed);
            renderReminders();
          } catch (error) {
            if (reminderStatus) reminderStatus.textContent = error.message;
          }
        });
        const edit = document.createElement("button");
        edit.type = "button";
        edit.textContent = translations().editNote;
        edit.addEventListener("click", () => editReminder(reminder));
        const remove = document.createElement("button");
        remove.type = "button";
        remove.textContent = translations().deleteNote;
        remove.addEventListener("click", async () => {
          try {
            await window.HewtujmerData.deleteReminder(reminder.id);
            if (editingReminderId === reminder.id) resetReminderForm();
            renderReminders();
          } catch (error) {
            if (reminderStatus) reminderStatus.textContent = error.message;
          }
        });
        actions.append(complete, edit, remove);
        item.append(content, actions);
        remindersList.append(item);
      }
    }

    noteTab?.addEventListener("click", () => selectNotesTab("notes"));
    remindersTab?.addEventListener("click", () => selectNotesTab("reminders"));

    function openNotesDialog() {
      const now = new Date();
      const selectedDate = state.selectedDate || now;
      const selectedDateKey = window.CalendarCore.dateKey(selectedDate);

      if (dateInput) dateInput.value = selectedDateKey;
      if (calendarReminderDate) calendarReminderDate.value = selectedDateKey;
      if (timeInput) timeInput.value = "";

      resetNoteForm();
      resetReminderForm();
      selectNotesTab("notes");
      if (noteStatus) noteStatus.textContent = "";
      renderNotes();
      renderReminders();

      // Show the dialog and focus the editable field before starting any
      // network refresh. Typing must not depend on the database being ready.
      openDialog(notesOverlay, notesDialog);
      noteText?.focus({ preventScroll: true });

      const refresh = window.HewtujmerData?.refresh;
      if (typeof refresh === "function") {
        Promise.resolve(refresh.call(window.HewtujmerData))
          .then(() => {
            if (!notesOverlay?.hidden) {
              renderNotes();
              renderReminders();
            }
          })
          .catch(error => {
            if (noteStatus) noteStatus.textContent = error.message || translations().noteSaveFailed;
          });
      }
    }

    document.querySelectorAll('[data-nav-action="notes"], #notes-button').forEach(button => {
      button.addEventListener("click", event => {
        event.preventDefault();
        openNotesDialog();
      });
    });

    document.querySelector("#movement-close")?.addEventListener("click", () => closeDialog(movementOverlay));
    movementOverlay?.addEventListener("click", event => {
      if (event.target === movementOverlay) closeDialog(movementOverlay);
    });
    document.querySelector("#notes-close")?.addEventListener("click", () => closeDialog(notesOverlay));
    notesOverlay?.addEventListener("click", event => {
      if (event.target === notesOverlay) closeDialog(notesOverlay);
    });
    preset?.addEventListener("change", () => {
      if (customWrap) customWrap.hidden = preset.value !== "custom";
    });

    cancelEditButton?.addEventListener("click", resetNoteForm);
    noteForm?.addEventListener("submit", async event => {
      event.preventDefault();
      const text = noteText?.value.trim() || "";
      if (!text) return;

      const date = dateInput?.value || window.CalendarCore.dateKey(state.selectedDate);
      const time = timeInput?.value || "";
      const minutes = time
        ? (preset?.value === "custom" ? Number(customMinutes?.value) : Number(preset?.value || 0))
        : 0;
      if (time && (!Number.isInteger(minutes) || minutes < 0 || minutes > 10080)) {
        if (noteStatus) noteStatus.textContent = translations().invalidReminder;
        return;
      }

      const note = {
=======
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
>>>>>>> 26494999ea39bc70bfc6b80d481768d8b1e343eb
        text,
        date,
        time,
        remindBefore: minutes,
        reminderShownAt: null
      };
<<<<<<< HEAD

      const submitButton = saveButton;
      if (submitButton) submitButton.disabled = true;
      try {
        const savedId = editingNoteId || null;
        let savedRecord;
        if (savedId) {
          savedRecord = await window.HewtujmerData.updateNote(savedId, note);
        } else {
          savedRecord = await window.HewtujmerData.createNote(note);
        }
        const saved = window.HewtujmerData.getNotes().find(item => item.id === (savedId || savedRecord.id));
        const isSynced = saved?.syncStatus === "synced";
        if (noteStatus) {
          noteStatus.textContent = isSynced ? translations().noteSaved : translations().noteSavedLocally;
        }
        noteText.value = "";
        resetNoteForm();
        renderNotes();
      } catch (error) {
        if (noteStatus) noteStatus.textContent = error.message || translations().noteSaveFailed;
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });

    calendarReminderPreset?.addEventListener("change", () => {
      if (calendarCustomWrap) calendarCustomWrap.hidden = calendarReminderPreset.value !== "custom";
    });
    reminderCancelButton?.addEventListener("click", resetReminderForm);
    reminderForm?.addEventListener("submit", async event => {
      event.preventDefault();
      const title = reminderTitle?.value.trim() || "";
      const date = calendarReminderDate?.value || "";
      const time = calendarReminderTime?.value || "";
      const minutes = calendarReminderPreset?.value === "custom"
        ? Number(calendarCustomMinutes?.value)
        : Number(calendarReminderPreset?.value || 0);
      if (!title || !date || !time) return;
      if (!Number.isInteger(minutes) || minutes < 0 || minutes > 10080) {
        if (reminderStatus) reminderStatus.textContent = translations().invalidReminder;
        return;
      }

      const reminder = {
        title,
        description: reminderDescription?.value.trim() || "",
        date,
        time,
        completed: false,
        remindBefore: minutes,
        notificationEnabled: calendarReminderNotification?.checked !== false,
        reminderShownAt: null
      };
      if (reminderSaveButton) reminderSaveButton.disabled = true;
      try {
        const id = editingReminderId;
        let savedReminder;
        if (id) savedReminder = await window.HewtujmerData.updateReminder(id, reminder);
        else savedReminder = await window.HewtujmerData.createReminder(reminder);
        const latest = window.HewtujmerData.getReminders().find(item => item.id === (id || savedReminder.id));
        const synced = latest?.syncStatus === "synced";
        if (reminderStatus) {
          reminderStatus.textContent = synced
            ? (id ? translations().reminderUpdated : translations().reminderCreated)
            : translations().reminderSavedLocally;
        }
        resetReminderForm();
        renderReminders();
      } catch (error) {
        if (reminderStatus) reminderStatus.textContent = error.message;
      } finally {
        if (reminderSaveButton) reminderSaveButton.disabled = false;
      }
    });
    reminderNotificationsButton?.addEventListener("click", async () => {
      if (!window.Notification) {
        if (reminderStatus) reminderStatus.textContent = translations().notificationsUnsupported;
        return;
      }
      try {
        const permission = await window.HewtujmerData.requestNotificationPermission();
        if (reminderStatus) {
          reminderStatus.textContent = permission === "granted"
            ? translations().notificationsEnabled
            : permission === "denied" ? translations().notificationsDenied : translations().notificationsNotEnabled;
        }
      } catch (error) {
        if (reminderStatus) reminderStatus.textContent = translations().notificationsNotEnabled;
      }
    });

    notificationButton?.addEventListener("click", async () => {
      if (!window.Notification) {
        if (noteStatus) noteStatus.textContent = translations().notificationsUnsupported;
        return;
      }
      try {
        const permission = await window.HewtujmerData.requestNotificationPermission();
        if (noteStatus) {
          noteStatus.textContent = permission === "granted"
            ? translations().notificationsEnabled
            : permission === "denied" ? translations().notificationsDenied : translations().notificationsNotEnabled;
        }
      } catch (error) {
        if (noteStatus) noteStatus.textContent = translations().notificationsNotEnabled;
      }
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeDialog(movementOverlay);
        closeDialog(notesOverlay);
      }
      const activeOverlay = !notesOverlay?.hidden ? notesOverlay : !movementOverlay?.hidden ? movementOverlay : null;
      if (event.key === "Tab" && activeOverlay) {
        const focusable = activeOverlay.querySelectorAll("button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex='0']");
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    // The initial This Day popup is preserved, but only appears when events exist.
=======
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
>>>>>>> 26494999ea39bc70bfc6b80d481768d8b1e343eb
    window.CalendarMovements.load().then(loaded => {
      if (!loaded) return;
      const today = window.CalendarCore.startOfDay(new Date());
      if (window.CalendarMovements.getForDate(today, state.language).length) {
<<<<<<< HEAD
        window.setTimeout(() => renderMovements(today, true), 450);
      }
    });

    window.addEventListener("calendar-notes-updated", renderNotes);
    window.addEventListener("calendar-reminders-updated", renderReminders);
    renderNotes();
    renderReminders();
    selectNotesTab("notes");
    window.CalendarExtras = Object.freeze({
      showMovements: showDateEvents,
      openNotes: openNotesDialog
    });
=======
        setTimeout(() => renderMovements(today, true), 450);
      }
    });
>>>>>>> 26494999ea39bc70bfc6b80d481768d8b1e343eb
  }
  window.CalendarExtras = Object.freeze({ bind: bindExtras });
})();
