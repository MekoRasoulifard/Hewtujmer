
"use strict";

(function () {
  const Core = window.CalendarCore;
  const VALID_VIEWS = new Set(["week", "day", "month", "calendar"]);

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

    if (state.view === "day") {
      state.selectedDate = Core.addDays(state.selectedDate, amount);
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
    if (!state || !Core) return state;
    state.selectedDate = Core.startOfDay(new Date());
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

  function renderDay(state) {
    const Core = window.CalendarCore;
    const translations = window.HewtujmerTranslations;
    const content = document.querySelector("#calendar-content");
    const heading = document.querySelector("#calendar-heading");
    const eyebrow = document.querySelector("#view-eyebrow");
    if (!Core || !translations || !content || !heading || !eyebrow) return;

    const t = translations[state.language];
    const date = Core.startOfDay(state.selectedDate);
    const events = window.CalendarMovements
      ? window.CalendarMovements.getForDate(date, state.language)
      : [];
    const notes = getNotesForDate(date);

    eyebrow.textContent = t.dayView;
    heading.textContent = Core.formatKurdishDate(date, state.language);

    const list = document.createElement("div");
    list.className = "day-event-list";

    if (!events.length) {
      const empty = document.createElement("p");
      empty.className = "day-empty";
      empty.textContent = t.noMovements;
      list.append(empty);
    } else {
      for (const item of events) {
        const article = document.createElement("article");
        article.className = "day-event";
        const type = document.createElement("span");
        type.className = "movement-type";
        type.textContent = item.type === "international"
          ? t.internationalDay
          : item.type === "anniversary" ? t.anniversary : t.historicalEvent;
        const title = document.createElement("strong");
        title.textContent = item.title;
        article.append(type, title);
        list.append(article);
      }
    }

    if (notes.length) {
      const noteHeading = document.createElement("h3");
      noteHeading.className = "day-notes-heading";
      noteHeading.textContent = t.savedNotes;
      list.append(noteHeading);

      for (const note of notes) {
        const article = document.createElement("article");
        article.className = "day-event day-personal-note";
        const type = document.createElement("span");
        type.className = "movement-type";
        type.textContent = t.noteLabel;
        const title = document.createElement("strong");
        title.textContent = note.text;
        article.append(type, title);
        if (note.time) {
          const time = document.createElement("small");
          time.textContent = note.time;
          article.append(time);
        }
        list.append(article);
      }
    }

    content.replaceChildren(list);
  }

  let deferredInstallPrompt = null;
  let reminderToastTimer = null;

  function installedAsApp() {
    const standalone = window.matchMedia
      ? window.matchMedia("(display-mode: standalone)").matches
      : false;
    return standalone || window.navigator.standalone === true;
  }

  function openInstallDialog() {
    const overlay = document.querySelector("#install-overlay");
    const dialog = overlay && overlay.querySelector(".install-dialog");
    const instructions = document.querySelector("#install-instructions");
    const confirmButton = document.querySelector("#install-confirm-button");
    if (!overlay || !dialog) return;

    if (instructions) instructions.hidden = true;
    if (confirmButton) confirmButton.hidden = false;
    overlay.hidden = false;
    dialog.focus();
  }

  function closeInstallDialog() {
    const overlay = document.querySelector("#install-overlay");
    if (overlay) overlay.hidden = true;
  }

  function getInstallInstructionKey() {
    const browser = window.navigator;
    const agent = browser.userAgent || "";
    const isIOS = /iPhone|iPad|iPod/i.test(agent) ||
      (browser.platform === "MacIntel" && browser.maxTouchPoints > 1);
    if (isIOS) return "installIosSteps";
    if (/Android/i.test(agent)) return "installAndroidSteps";
    return "installDesktopSteps";
  }

  function setupProgressiveWebApp() {
    const installButton = document.querySelector("#install-app-button");
    const confirmButton = document.querySelector("#install-confirm-button");
    const laterButton = document.querySelector("#install-later-button");
    const closeButton = document.querySelector("#install-close");
    const overlay = document.querySelector("#install-overlay");
    const instructionBox = document.querySelector("#install-instructions");
    const instructionText = document.querySelector("#install-instruction-text");

    window.HewtujmerUpdates?.register();

    if (installedAsApp()) {
      if (installButton) installButton.hidden = true;
      return;
    }

    if (installButton) {
      installButton.hidden = false;
      installButton.addEventListener("click", openInstallDialog);
    }

    window.addEventListener("beforeinstallprompt", event => {
      event.preventDefault();
      deferredInstallPrompt = event;
      if (installButton) installButton.hidden = false;
    });

    window.addEventListener("appinstalled", () => {
      deferredInstallPrompt = null;
      if (installButton) installButton.hidden = true;
      closeInstallDialog();
    });

    confirmButton?.addEventListener("click", async () => {
      if (deferredInstallPrompt) {
        const promptEvent = deferredInstallPrompt;
        deferredInstallPrompt = null;
        try {
          await promptEvent.prompt();
          const choice = await promptEvent.userChoice;
          if (choice && choice.outcome === "accepted") {
            if (installButton) installButton.hidden = true;
            closeInstallDialog();
          } else {
            dismissInstallPrompt();
          }
        } catch (error) {
          console.warn("The browser could not open its install prompt.", error);
          showInstallInstructions();
        }
        return;
      }
      showInstallInstructions();
    });

    function showInstallInstructions() {
      const t = window.HewtujmerTranslations[document.documentElement.lang] || window.HewtujmerTranslations.ckb;
      if (instructionText) instructionText.textContent = t[getInstallInstructionKey()] || t.installAndroidSteps;
      if (instructionBox) instructionBox.hidden = false;
      if (confirmButton) confirmButton.hidden = true;
    }

    function dismissInstallPrompt() {
      window.HewtujmerStorage?.set(
        "install-dismissed-until",
        String(Date.now() + 7 * 24 * 60 * 60 * 1000)
      );
      closeInstallDialog();
    }

    laterButton?.addEventListener("click", dismissInstallPrompt);
    closeButton?.addEventListener("click", dismissInstallPrompt);
    overlay?.addEventListener("click", event => {
      if (event.target === overlay) dismissInstallPrompt();
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && overlay && !overlay.hidden) dismissInstallPrompt();
    });

    const dismissedUntil = Number(
      window.HewtujmerStorage?.get("install-dismissed-until", "0") || 0
    );

    if (Date.now() >= dismissedUntil) {
      window.setTimeout(() => {
        if (!installedAsApp() && overlay && overlay.hidden) openInstallDialog();
      }, 900);
    }
  }

  function showReminderToast(note, language) {
    const toast = document.querySelector("#reminder-toast");
    const title = document.querySelector("#reminder-toast-title");
    const message = document.querySelector("#reminder-toast-message");
    const closeButton = document.querySelector("#reminder-toast-close");
    if (!toast || !title || !message) return;

    title.textContent = (window.HewtujmerTranslations[language] || window.HewtujmerTranslations.en).reminderNotificationTitle;
    message.textContent = note.text;
    toast.hidden = false;

    function dismiss() {
      toast.hidden = true;
      window.clearTimeout(reminderToastTimer);
    }

    toast.onclick = dismiss;
    if (closeButton) closeButton.onclick = event => {
      event.stopPropagation();
      dismiss();
    };
    window.clearTimeout(reminderToastTimer);
    reminderToastTimer = window.setTimeout(dismiss, 10000);
  }

  function getNotesForDate(date) {
    return window.HewtujmerData?.getNotesForDate(date) || [];
  }


  window.CalendarNavigation = Object.freeze({
    move, setView, setToday, readViewFromHash, syncHash, renderDay,
    getNotesForDate, setupProgressiveWebApp, showReminderToast
  });
})();
