
"use strict";

(function () {
  const translations = {
    ckb: {
      languageLabel: "زمان",
      theme: "ڕووکار",
      print: "چاپ / PDF",
      views: "بینینەکان",
      week: "هەفتە",
      month: "مانگ",
      calendar: "ساڵنامە",
      calendarNote: "ساڵنامەی کوردی",
      currentIsoWeek: "هەفتەی ئایسۆی ئێستا",
      weekPrefix: "هەفتە",
      newrozStarts: "نەورۆز: ٢١ی ئازار",
      kurdishDate: "بەرواری کوردی",
      gregorianDate: "بەرواری زایینی",
      solarHijriDate: "بەرواری هەتاوی",
      newrozCountdown: "رۆژی ماوە بۆ نەورۆز",
      weekView: "بینینی هەفتە",
      monthView: "بینینی مانگ",
      calendarView: "بینینی ساڵ",
      today: "ئەمڕۆ",
      previous: "پێشوو",
      next: "دواتر",
      footer: "ساڵنامەی کوردی · دەستپێکی ساڵ: ٢١ی ئازار",
      searchLabel: "گەڕان بۆ هەفتە یان بەروار",
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
      weekView: "Dîtina hefteyê",
      monthView: "Dîtina mehê",
      calendarView: "Dîtina salê",
      today: "Îro",
      previous: "Paş",
      next: "Pêş",
      footer: "Salnameya Kurdî · Destpêka salê: 21ê Adarê",
      searchLabel: "Li hefteyekê an dîrokekê bigere",
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
      weekView: "Week view",
      monthView: "Month view",
      calendarView: "Year view",
      today: "Today",
      previous: "Previous",
      next: "Next",
      footer: "Kurdish calendar · New year begins March 21",
      searchLabel: "Search for a week or date",
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

  window.HewtujmerTranslations = Object.freeze(translations);
})();
