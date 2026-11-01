
"use strict";

(function () {
  const translations = {
    ckb: {
      languageLabel: "زمان",
      theme: "ڕووکار",
      print: "چاپ / PDF",
      views: "بینینەکان",
      week: "هەفتە",
      dayView: "ئەمڕۆ",
      month: "مانگ",
      calendar: "ساڵنامە",
      calendarNote: "ساڵنامەی کوردی",
      currentIsoWeek: "هەفتەی ئایسۆی ئێستا",
      weekPrefix: "هەفتە",
      newrozStarts: "نەورۆز: ٢١ی ئازار",
      kurdishDate: "بەرواری کوردی",
      gregorianDate: "بەرواری زایینی",
      solarHijriDate: "بەرواری هەتاوی",
      newrozCountdown: "رۆژ ماوە بۆ نەورۆز",
      installApp: "دامەزراندنی بەرنامە",
      installLater: "دواتر",
      installPromptEyebrow: "ساڵنامەکە وەک بەرنامە بەکاربهێنە",
      installPromptTitle: "دامەزراندنی Hewtûjmêr",
      installPromptMessage: "ساڵنامەکە زیاد بکە بۆ شاشەی سەرەکی مۆبایلەکەت بۆ گەیشتنی خێرا.",
      installIosSteps: "لە Safari، دوگمەی هاوبەشکردن (Share) بکەوە، Add to Home Screen هەڵبژێرە و پاشان Add بکە.",
      installAndroidSteps: "لە Chrome، مێنیوی سێ خاڵەکە بکەوە، Install app یان Add to Home Screen هەڵبژێرە و دامەزراندن پشتڕاست بکەرەوە.",
      installDesktopSteps: "لە نوارەکانی وێبگەڕ، نیشانی دامەزراندن لە ناونیشانەکەدا یان Install app لە مێنیوی وێبگەڕ هەڵبژێرە.",
      reminderNotificationTitle: "بیرخەرەوەی Hewtûjmêr",
      newrozSunLabel: "نیشانی خۆری نەورۆز",
      movements: "جووڵەکان", movementsButton: "پیشاندانی ڕووداوەکانی ئەمڕۆ",
      notes: "تێبینی", notesButton: "تێبینی و بیرخەرەوەکان", reminders: "بیرخەرەوەکان", todayMovements: "ڕووداوەکانی ئەمڕۆ",
      movementDismissHint: "بۆ داخستن، لە دەرەوە کلیک بکە یان Escape دابگرە.",
      close: "داخستن", privateNotes: "بۆ ئەم وێبگەڕە تایبەتە", notesAndReminders: "تێبینی و بیرخەرەوەکان",
      reminderTitle: "ناونیشان", reminderDescription: "وردەکاری", saveReminder: "پاشەکەوتکردنی بیرخەرەوە",
      savedReminders: "بیرخەرەوە پاشەکەوتکراوەکان", notificationForReminder: "ئاگادارم بکەرەوە بۆ ئەم بیرخەرەوەیە",
      reminderCreated: "بیرخەرەوە پاشەکەوت کرا.", reminderSavedLocally: "بیرخەرەوە لەم ئامێرە پاشەکەوت کرا.",
      reminderUpdated: "بیرخەرەوە نوێ کرایەوە.", reminderCompleted: "تەواو کرا", reminderRestore: "گەڕاندنەوە",
      reminderDeleted: "سڕایەوە", noSavedReminders: "هیچ بیرخەرەوەیەک نییە.",
      noteLabel: "تێبینی", reminderDate: "بەرواری بیرخەرەوە", reminderTime: "کات",
      remindBefore: "پێش کاتەکە بیرم بخەرەوە", atTime: "لە هەمان کاتدا", custom: "کاتی تایبەت",
      customMinutes: "چەند خولەک پێشتر؟", saveNote: "پاشەکەوتکردن", savedNotes: "تێبینییە پاشەکەوتکراوەکان",
      noteSaved: "تێبینی پاشەکەوت کرا.", noteSavedLocally: "لەسەر ئەم ئامێرە پاشەکەوت کرا؛ کاتێک خزمەتگوزارییەکە بەردەست بوو هاوکات دەکرێتەوە.", noteSaveFailed: "پاشەکەوتکردنی تێبینی سەرکەوتوو نەبوو.",
      editNote: "دەستکاریکردن", updateNote: "نوێکردنەوە", cancelEdit: "پاشگەزبوونەوە", noReminderDate: "بەرواری بیرخەرەوە نییە", invalidReminder: "تکایە ژمارەیەکی دروست بۆ خولەکەکان بنووسە.",
      enableNotifications: "چالاککردنی ئاگادارکردنەوە", notificationsEnabled: "ئاگادارکردنەوە چالاکە.", notificationsDenied: "مۆڵەتی ئاگادارکردنەوە ڕەتکرایەوە.", notificationsNotEnabled: "ئاگادارکردنەوە چالاک نەکرا.", notificationsUnsupported: "ئەم وێبگەڕە ئاگادارکردنەوە پشتگیری ناکات.",
      updateReady: "وەشانی نوێ ئامادەیە.", updateNow: "ئێستا نوێی بکەرەوە", deleteNote: "سڕینەوە", noMovements: "هیچ ڕووداوێک بۆ ئەم ڕۆژە تۆمار نەکراوە.",
      historicalEvent: "مێژوویی و کەلتووری", internationalDay: "ڕۆژی نێودەوڵەتی", anniversary: "یادی ساڵانە",
      weekView: "بینینی هەفتە",
      monthView: "بینینی مانگ",
      calendarView: "بینینی ساڵ",
      today: "ئەمڕۆ",
      previous: "پێشوو",
      next: "دواتر",
      footer: "ساڵنامەی کوردی · دەستپێکی ساڵ: ٢١ی ئازار",
      searchLabel: "گەڕان بۆ هەفتە یان بەروار",
      searchPlaceholder: "ژمارەی هەفتە١-٥٣ ، ساڵ و هەفتە، یان بەروار بنووسە",
      searchHint: "ژمارەی هەفتە، ساڵ و هەفتە، یان بەروار بنووسە.",
      searchError: "تکایە بەروارێک یان ژمارەی هەفتەیەکی دروست بنووسە.",
      weekdays: [
        "دووشەممە", "سێشەممە", "چوارشەممە",
        "پێنجشەممە", "هەینی", "شەممە", "یەکشەممە"
      ],
      weekdaysShort: ["د", "س", "چ", "پ", "ه", "ش", "ی"],
      months: [
        "خاکەلێوە", "گوڵان", "جۆزەردان", "پووشپەڕ",
        "گەلاوێژ", "خەرمانان", "ڕەزبەر", "گەڵاڕێزان",
        "سەرماوەز", "بەفرانبار", "ڕێبەندان", "ڕەشەمە"
      ],
      dateFormat: (day, month, year) => `${day}ی ${month} ${year}`
    },

    kmr: {
      languageLabel: "Ziman",
      theme: "Rûkar",
      print: "Çap / PDF",
      views: "Dîtin",
      week: "Hefte",
      dayView: "Îro",
      month: "Meh",
      calendar: "Salname",
      calendarNote: "Salnameya Kurdî",
      currentIsoWeek: "Hefteya ISO ya niha",
      weekPrefix: "Hefte",
      newrozStarts: "Newroz: 21ê Adarê",
      kurdishDate: "Dîroka Kurdî",
      gregorianDate: "Dîroka Gregorî",
      solarHijriDate: "Dîroka Hicrî-Şemsî",
      newrozCountdown: "roj mane heta Newrozê",
      installApp: "Sazkirina sepanê",
      installLater: "Paşê",
      installPromptEyebrow: "Salnameyê wek sepanê bi kar bîne",
      installPromptTitle: "Hewtûjmêr saz bike",
      installPromptMessage: "Salnameyê li ser ekrana sereke ya mobîla xwe zêde bike da ku zû bigihîjî wê.",
      installIosSteps: "Di Safari de, pêl bişka Share bike, Add to Home Screen hilbijêre û paşê Add bike.",
      installAndroidSteps: "Di Chrome de, menuya sê xalan veke, Install app an Add to Home Screen hilbijêre û saz kirinê piştrast bike.",
      installDesktopSteps: "Di gerokê de îkona Install ya li kêleka navnîşanê an Install app ji menuya gerokê hilbijêre.",
      reminderNotificationTitle: "Bîranîna Hewtûjmêr",
      newrozSunLabel: "Nîşana rojê ya Newrozê",
      movements: "Bûyer", movementsButton: "Bûyerên îro nîşan bide",
      notes: "Têbînî", notesButton: "Têbînî û bîranîn", reminders: "Bîranîn", todayMovements: "Bûyerên îro",
      movementDismissHint: "Ji bo girtinê li derveyî panelê bitikîne an Escape pêl bike.",
      close: "Bigire", privateNotes: "Taybet ji bo vê gerokê", notesAndReminders: "Têbînî û bîranîn",
      reminderTitle: "Sernav", reminderDescription: "Danasîn", saveReminder: "Bîranînê tomar bike",
      savedReminders: "Bîranînên tomarkirî", notificationForReminder: "Ji bo vê bîranînê agahdar bike",
      reminderCreated: "Bîranîn hate tomarkirin.", reminderSavedLocally: "Bîranîn li ser vê amûrê hate tomarkirin.",
      reminderUpdated: "Bîranîn hate nûkirin.", reminderCompleted: "Qediya", reminderRestore: "Vegere",
      reminderDeleted: "Jêbirin", noSavedReminders: "Bîranînek tune.",
      noteLabel: "Têbînî", reminderDate: "Dîroka bîranînê", reminderTime: "Dem",
      remindBefore: "Berî wê demê bîr bixe", atTime: "Di wê demê de", custom: "Taybet",
      customMinutes: "Çend xulek berê?", saveNote: "Tomar bike", savedNotes: "Têbîniyên tomarkirî",
      noteSaved: "Têbînî hate tomarkirin.", noteSavedLocally: "Li ser vê amûrê hate tomarkirin; dema ku xizmeta serverê peyda bibe dê were hevdemkirin.", noteSaveFailed: "Tomarkirina têbinî serneket.",
      editNote: "Biguherîne", updateNote: "Nû bike", cancelEdit: "Betal bike", noReminderDate: "Dîroka bîranînê tune", invalidReminder: "Ji kerema xwe hejmareke rast ji bo xulekan binivîse.",
      enableNotifications: "Agahdariyan çalak bike", notificationsEnabled: "Agahdarî çalak e.", notificationsDenied: "Destûra agahdariyan hate redkirin.", notificationsNotEnabled: "Agahdarî nehat çalak kirin.", notificationsUnsupported: "Ev gerok piştgiriya agahdariyan nake.",
      updateReady: "Guhertoyeke nû amade ye.", updateNow: "Niha nû bike", deleteNote: "Jê bibe", noMovements: "Ji bo vê rojê tu bûyer nehatiye tomarkirin.",
      historicalEvent: "Dîrokî û çandî", internationalDay: "Roja navneteweyî", anniversary: "Salveger",
      weekView: "Dîtina hefteyê",
      monthView: "Dîtina mehê",
      calendarView: "Dîtina salê",
      today: "Îro",
      previous: "Paş",
      next: "Pêş",
      footer: "Salnameya Kurdî · Destpêka salê: 21ê Adarê",
      searchLabel: "Li hefteyekê an dîrokekê bigere",
      searchPlaceholder: "Hejmareke hefteyê, sal û hefte, an dîrokê binivîse",
      searchHint: "Hejmareke hefteyê, sal û hefte, an dîrokê binivîse.",
      searchError: "Ji kerema xwe dîrokek an hejmareke hefteyê ya rast binivîse.",
      weekdays: [
        "Duşem", "Sêşem", "Çarşem", "Pêncşem",
        "În", "Şemî", "Yekşem"
      ],
      weekdaysShort: ["D", "S", "Ç", "P", "În", "Ş", "Y"],
      months: [
        "Xakelêwe", "Gulan", "Cizerdan", "Pûşper",
        "Gelawêj", "Xermanan", "Rezber", "Gelarêzan",
        "Sermawez", "Befranbar", "Rêbendan", "Reşeme"
      ],
      dateFormat: (day, month, year) => `${day}ê ${month} ${year}`
    },

    en: {
      languageLabel: "Language",
      theme: "Theme",
      print: "Print / PDF",
      views: "Views",
      week: "Week",
      dayView: "This Day",
      month: "Month",
      calendar: "Calendar",
      calendarNote: "Kurdish calendar",
      currentIsoWeek: "ISO WEEK",
      weekPrefix: "Week",
      newrozStarts: "Newroz: March 21",
      kurdishDate: "Kurdish date",
      gregorianDate: "Gregorian date",
      solarHijriDate: "Solar Hijri date",
      newrozCountdown: "days until Newroz",
      installApp: "Install app",
      installLater: "Not now",
      installPromptEyebrow: "Use the calendar like an app",
      installPromptTitle: "Install Hewtûjmêr",
      installPromptMessage: "Add the calendar to your mobile home screen for quick access.",
      installIosSteps: "In Safari, open the Share menu, choose Add to Home Screen, and then tap Add.",
      installAndroidSteps: "In Chrome, open the three-dot menu, choose Install app or Add to Home Screen, and confirm.",
      installDesktopSteps: "Choose the Install icon in the browser address bar, or select Install app from the browser menu.",
      reminderNotificationTitle: "Hewtûjmêr reminder",
      newrozSunLabel: "Newroz sun emblem",
      movements: "Events", movementsButton: "Show today's events", notes: "Notes", notesButton: "Notes and reminders", reminders: "Reminders",
      todayMovements: "Today's events", movementDismissHint: "Click outside or press Escape to close.", close: "Close",
      privateNotes: "Private to this browser", notesAndReminders: "Notes and reminders", noteLabel: "Note",
      reminderTitle: "Title", reminderDescription: "Description", saveReminder: "Save reminder",
      savedReminders: "Saved reminders", notificationForReminder: "Send a notification for this reminder",
      reminderCreated: "Reminder saved.", reminderSavedLocally: "Reminder saved on this device.",
      reminderUpdated: "Reminder updated.", reminderCompleted: "Completed", reminderRestore: "Reopen",
      reminderDeleted: "Deleted", noSavedReminders: "No reminders have been added.",
      reminderDate: "Reminder date", reminderTime: "Time", remindBefore: "Remind me before", atTime: "At this time",
      custom: "Custom", customMinutes: "Custom minutes before", saveNote: "Save note", savedNotes: "Saved notes",
      noteSaved: "Your note has been saved.", noteSavedLocally: "Saved on this device. It will sync when the service is available.", noteSaveFailed: "The note could not be saved.",
      editNote: "Edit", updateNote: "Save changes", cancelEdit: "Cancel", noReminderDate: "No reminder date", invalidReminder: "Enter a valid number of reminder minutes.",
      enableNotifications: "Enable notifications", notificationsEnabled: "Notifications are enabled.", notificationsDenied: "Notification permission was denied.", notificationsNotEnabled: "Notifications were not enabled.", notificationsUnsupported: "This browser does not support notifications.",
      updateReady: "A new version is ready.", updateNow: "Update now", deleteNote: "Delete", noMovements: "No events are recorded for this date.",
      historicalEvent: "Historical and cultural", internationalDay: "International day", anniversary: "Anniversary",
      weekView: "Week view",
      monthView: "Month view",
      calendarView: "Year view",
      today: "Today",
      previous: "Previous",
      next: "Next",
      footer: "Kurdish calendar · New year begins March 21",
      searchLabel: "Search for a week or date",
      searchPlaceholder: "Enter a week number, week and year, or date",
      searchHint: "Enter a week number, week and year, or date.",
      searchError: "Please enter a valid date or ISO week number.",
      weekdays: [
        "Monday", "Tuesday", "Wednesday", "Thursday",
        "Friday", "Saturday", "Sunday"
      ],
      weekdaysShort: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      months: [
        "Xakelêwe", "Gulan", "Cizerdan", "Pûşper",
        "Gelawêj", "Xermanan", "Rezber", "Gelarêzan",
        "Sermawez", "Befranbar", "Rêbendan", "Reşeme"
      ],
      dateFormat: (day, month, year) => `${month} ${day}, ${year}`
    }
  };



  // Solar Hijri display is localized here with the language dictionaries.
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

  function updateSolarHijriDate(date, element, language) {
    try {
      const parts = getSolarHijriParts(date);

      switch (language) {
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
      element.dir = language === "ckb" ? "rtl" : "ltr";
      element.lang = language;
      element.classList.remove("solar-hijri-sorani");
    }
  }

  window.CalendarSolarHijri = Object.freeze({
    update: updateSolarHijriDate
  });

  window.HewtujmerTranslations = Object.freeze(translations);
})();
