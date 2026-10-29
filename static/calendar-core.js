"use strict";

(function () {
  const DAY_MS = 86400000;

  const MONTHS = [
    "Xakelêwe", "Gulan", "Cizerdan", "Pûşper",
    "Gelawêj", "Xermanan", "Rezber", "Gelarêzan",
    "Sermawez", "Befranbar", "Rêbendan", "Reşeme"
  ];

  const MONTHS_CKB = [
    "خاکەلێوە", "گوڵان", "جۆزەردان", "پووشپەڕ",
    "گەلاوێژ", "خەرمانان", "ڕەزبەر", "گەڵاڕێزان",
    "سەرماوەز", "بەفرانبار", "ڕێبەندان", "ڕەشەمە"
  ];

  const HOLIDAYS = {
    "03-21": {
      en: "Newroz",
      kmr: "Newroz",
      ckb: "نەورۆز"
    }
  };

  const ARABIC_INDIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
  const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

  function isValidDate(value) {
    return value instanceof Date && !Number.isNaN(value.getTime());
  }

  /*
   * JavaScript treats years 0–99 specially in Date constructors.
   * setFullYear/setUTCFullYear avoid the implicit 1900-year offset.
   */
  function createLocalDate(year, monthIndex, day) {
    const date = new Date(0);
    date.setHours(0, 0, 0, 0);
    date.setFullYear(year, monthIndex, day);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  function createUtcDate(year, monthIndex, day) {
    const date = new Date(0);
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCFullYear(year, monthIndex, day);
    return date;
  }

  function startOfDay(date) {
    if (!isValidDate(date)) {
      return new Date(Number.NaN);
    }

    return createLocalDate(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
  }

  function dateKey(date) {
    if (!isValidDate(date)) {
      return "";
    }

    return [
      String(date.getFullYear()).padStart(4, "0"),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");
  }

  function dateFromKey(key) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(key));

    if (!match) {
      return null;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = createLocalDate(year, month - 1, day);

    if (
      !isValidDate(date) ||
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  }

  function addDays(date, amount) {
    if (!isValidDate(date) || !Number.isInteger(amount)) {
      return new Date(Number.NaN);
    }

    const result = new Date(date.getTime());
    result.setDate(result.getDate() + amount);
    return startOfDay(result);
  }

  function daysBetween(first, second) {
    if (!isValidDate(first) || !isValidDate(second)) {
      return Number.NaN;
    }

    const firstUtc = createUtcDate(
      first.getFullYear(),
      first.getMonth(),
      first.getDate()
    ).getTime();

    const secondUtc = createUtcDate(
      second.getFullYear(),
      second.getMonth(),
      second.getDate()
    ).getTime();

    return Math.round((secondUtc - firstUtc) / DAY_MS);
  }

  function mondayIndex(date) {
    if (!isValidDate(date)) {
      return Number.NaN;
    }

    return (date.getDay() + 6) % 7;
  }

  function startOfWeek(date) {
    if (!isValidDate(date)) {
      return new Date(Number.NaN);
    }

    return addDays(date, -mondayIndex(date));
  }

  function isoWeekInfo(date) {
    if (!isValidDate(date)) {
      return { week: Number.NaN, year: Number.NaN };
    }

    const utcDate = createUtcDate(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const weekday = utcDate.getUTCDay() || 7;

    utcDate.setUTCDate(utcDate.getUTCDate() + 4 - weekday);

    const year = utcDate.getUTCFullYear();
    const yearStart = createUtcDate(year, 0, 1);
    const week = Math.ceil(
      ((utcDate.getTime() - yearStart.getTime()) / DAY_MS + 1) / 7
    );

    return { week, year };
  }

  function isoWeekNumber(date) {
    return isoWeekInfo(date).week;
  }

  function isoWeekYear(date) {
    return isoWeekInfo(date).year;
  }

  function isoWeekStart(year, week) {
    if (
      !Number.isInteger(year) ||
      !Number.isInteger(week) ||
      year < 1 ||
      year > 9998 ||
      week < 1 ||
      week > 53
    ) {
      return null;
    }

    const januaryFourth = createLocalDate(year, 0, 4);
    const firstMonday = startOfWeek(januaryFourth);
    const result = addDays(firstMonday, (week - 1) * 7);
    const actual = isoWeekInfo(result);

    if (actual.year !== year || actual.week !== week) {
      return null;
    }

    return result;
  }

  // The application's Kurdish calendar year starts on March 21.
  function kurdishYearStart(year) {
    if (!Number.isInteger(year)) {
      return new Date(Number.NaN);
    }

    return createLocalDate(year - 700, 2, 21);
  }

  function daysInKurdishYear(year) {
    if (!Number.isInteger(year)) {
      return 0;
    }

    return daysBetween(
      kurdishYearStart(year),
      kurdishYearStart(year + 1)
    );
  }

  function kurdishYearForDate(date) {
    if (!isValidDate(date)) {
      return Number.NaN;
    }

    const march21 = createLocalDate(date.getFullYear(), 2, 21);
    const gregorianYear = date >= march21
      ? date.getFullYear()
      : date.getFullYear() - 1;

    return gregorianYear + 700;
  }

  function kurdishMonthLength(year, month) {
    if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      month < 0 ||
      month > 11
    ) {
      return 0;
    }

    if (month < 6) {
      return 31;
    }

    if (month < 11) {
      return 30;
    }

    return daysInKurdishYear(year) - 336;
  }

  function kurdishMonthStart(year, month) {
    if (!Number.isInteger(year) || !Number.isInteger(month)) {
      return new Date(Number.NaN);
    }

    const normalizedYear = year + Math.floor(month / 12);
    const normalizedMonth = ((month % 12) + 12) % 12;
    let offset = 0;

    for (let index = 0; index < normalizedMonth; index += 1) {
      offset += kurdishMonthLength(normalizedYear, index);
    }

    return addDays(kurdishYearStart(normalizedYear), offset);
  }

  function kurdishDateParts(date) {
    if (!isValidDate(date)) {
      return null;
    }

    const year = kurdishYearForDate(date);
    let remaining = daysBetween(kurdishYearStart(year), date);

    for (let month = 0; month < 12; month += 1) {
      const length = kurdishMonthLength(year, month);

      if (remaining < length) {
        return {
          year,
          month,
          day: remaining + 1
        };
      }

      remaining -= length;
    }

    return null;
  }

  function normalizeDigits(value) {
    return String(value)
      .replace(/[٠-٩]/g, digit =>
        String(ARABIC_INDIC_DIGITS.indexOf(digit))
      )
      .replace(/[۰-۹]/g, digit =>
        String(PERSIAN_DIGITS.indexOf(digit))
      )
      .replace(/[\u061c\u200e\u200f]/g, "");
  }

  function localizeDigits(value, language = "en") {
    // Normalize both Arabic-Indic and Persian digits before formatting.
    const normalized = normalizeDigits(value);

    if (language !== "ckb") {
      return normalized;
    }

    return normalized.replace(/\d/g, digit =>
      ARABIC_INDIC_DIGITS[Number(digit)]
    );
  }

  function getLocale(language) {
    if (language === "ckb") {
      return "ckb";
    }

    if (language === "kmr") {
      return "ku";
    }

    return "en-GB";
  }

  function formatGregorian(date, language = "en") {
    if (!isValidDate(date)) {
      return "—";
    }

    const options = {
      day: "numeric",
      month: "short",
      year: "numeric"
    };

    try {
      return new Intl.DateTimeFormat(getLocale(language), options).format(date);
    } catch {
      return new Intl.DateTimeFormat("en-GB", options).format(date);
    }
  }

  function formatKurdishDate(date, language = "en") {
    const parts = kurdishDateParts(date);

    if (!parts) {
      return "—";
    }

    const month = language === "ckb"
      ? MONTHS_CKB[parts.month]
      : MONTHS[parts.month];
    const day = localizeDigits(parts.day, language);
    const year = localizeDigits(parts.year, language);

    if (language === "ckb") {
      return `${day}ی ${month} ${year}`;
    }

    if (language === "kmr") {
      return `${day}ê ${month} ${year}`;
    }

    return `${month} ${parts.day}, ${parts.year}`;
  }

  function formatNorwegianWeekRange(date) {
    if (!isValidDate(date)) {
      return "—";
    }

    const monday = startOfWeek(date);
    const sunday = addDays(monday, 6);

    function format(value, options) {
      return new Intl.DateTimeFormat("nb-NO", options).format(value);
    }

    const mondayDay = format(monday, { day: "numeric" });
    const sundayDay = format(sunday, { day: "numeric" });
    const mondayMonth = format(monday, { month: "long" });
    const sundayMonth = format(sunday, { month: "long" });

    if (monday.getFullYear() !== sunday.getFullYear()) {
      return `mandag ${mondayDay}. ${mondayMonth} ${monday.getFullYear()}–søndag ${sundayDay}. ${sundayMonth} ${sunday.getFullYear()}`;
    }

    if (monday.getMonth() !== sunday.getMonth()) {
      return `mandag ${mondayDay}. ${mondayMonth}–søndag ${sundayDay}. ${sundayMonth} ${sunday.getFullYear()}`;
    }

    return `mandag ${mondayDay}.–søndag ${sundayDay}. ${sundayMonth} ${sunday.getFullYear()}`;
  }

  function formatWeekRange(date, language = "en") {
    if (!isValidDate(date)) {
      return "—";
    }

    if (language === "no") {
      return formatNorwegianWeekRange(date);
    }

    const monday = startOfWeek(date);
    const sunday = addDays(monday, 6);

    return `${formatGregorian(monday, language)} – ${formatGregorian(sunday, language)}`;
  }

  function getHoliday(date, language = "en") {
    if (!isValidDate(date)) {
      return null;
    }

    const key = [
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");
    const holiday = HOLIDAYS[key];

    return holiday ? holiday[language] || holiday.en : null;
  }

  function parseSearch(input, referenceDate = new Date()) {
    const value = normalizeDigits(input || "").trim();

    if (!value) {
      return null;
    }

    const reference = isValidDate(referenceDate)
      ? referenceDate
      : new Date();
    let match;

    // Week/year formats: 46 2026, 46-2026, week 46 2026, or uke 46 2026.
    match = /^(?:(?:week|weeks|uke|hefte|heftujmer|هەفتە)\s*)?(\d{1,2})[\s,/-]+(\d{4})$/i.exec(value);

    if (match) {
      const date = isoWeekStart(
        Number(match[2]),
        Number(match[1])
      );

      return date ? { date, type: "week" } : null;
    }

    // A week number alone uses the reference date's ISO week-year.
    match = /^(?:(?:week|weeks|uke|hefte|heftujmer|هەفتە)\s*)?(\d{1,2})$/i.exec(value);

    if (match) {
      const date = isoWeekStart(
        isoWeekYear(reference),
        Number(match[1])
      );

      return date ? { date, type: "week" } : null;
    }

    // ISO date: YYYY-MM-DD.
    match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value);

    if (match) {
      const date = dateFromKey(
        `${match[1]}-${String(match[2]).padStart(2, "0")}-${String(match[3]).padStart(2, "0")}`
      );

      return date ? { date, type: "date" } : null;
    }

    // European date: DD.MM.YYYY, DD/MM/YYYY, or DD-MM-YYYY.
    match = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(value);

    if (match) {
      const date = dateFromKey(
        `${match[3]}-${String(match[2]).padStart(2, "0")}-${String(match[1]).padStart(2, "0")}`
      );

      return date ? { date, type: "date" } : null;
    }

    // A year alone opens ISO week 1 for that year.
    if (/^\d{4}$/.test(value)) {
      const date = isoWeekStart(Number(value), 1);
      return date ? { date, type: "week" } : null;
    }

    // Keep support for browser-recognized date strings.
    const parsed = new Date(value);

    if (isValidDate(parsed)) {
      return { date: startOfDay(parsed), type: "date" };
    }

    return null;
  }

  window.CalendarCore = Object.freeze({
    MONTHS,
    MONTHS_CKB,
    HOLIDAYS,
    startOfDay,
    dateKey,
    dateFromKey,
    addDays,
    daysBetween,
    mondayIndex,
    startOfWeek,
    isoWeekInfo,
    isoWeekNumber,
    isoWeekYear,
    isoWeekStart,
    kurdishYearStart,
    daysInKurdishYear,
    kurdishYearForDate,
    kurdishMonthLength,
    kurdishMonthStart,
    kurdishDateParts,
    localizeDigits,
    formatGregorian,
    formatKurdishDate,
    formatWeekRange,
    formatNorwegianWeekRange,
    getHoliday,
    parseSearch
  });
})();
