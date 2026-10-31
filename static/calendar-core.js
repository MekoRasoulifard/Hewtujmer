"use strict";
(function () {
  const DAY_MS = 86400000;

  function startOfDay(date) {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
  }

  function dateKey(date) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");
  }

  function dateFromKey(key) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }
    return startOfDay(date);
  }

  function addDays(date, amount) {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);
    return startOfDay(result);
  }

  function daysBetween(first, second) {
    const firstUtc = Date.UTC(
      first.getFullYear(),
      first.getMonth(),
      first.getDate()
    );
    const secondUtc = Date.UTC(
      second.getFullYear(),
      second.getMonth(),
      second.getDate()
    );
    return Math.round((secondUtc - firstUtc) / DAY_MS);
  }

  function daysUntilNewroz(date) {
    const today = startOfDay(date);
    const newroz = new Date(today.getFullYear(), 2, 21);
    if (today > newroz) {
      newroz.setFullYear(newroz.getFullYear() + 1);
    }
    return daysBetween(today, newroz);
  }

  function mondayIndex(date) {
    return (date.getDay() + 6) % 7;
  }

  function startOfWeek(date) {
    return addDays(date, -mondayIndex(date));
  }

  function isoWeekInfo(date) {
    const utcDate = new Date(Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ));
    const weekday = utcDate.getUTCDay() || 7;
    utcDate.setUTCDate(utcDate.getUTCDate() + 4 - weekday);
    const year = utcDate.getUTCFullYear();
    const yearStart = new Date(Date.UTC(year, 0, 1));
    return {
      week: Math.ceil(
        ((utcDate - yearStart) / DAY_MS + 1) / 7
      ),
      year
    };
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
    const januaryFourth = new Date(year, 0, 4);
    const firstMonday = startOfWeek(januaryFourth);
    const result = addDays(firstMonday, (week - 1) * 7);
    const actual = isoWeekInfo(result);
    return actual.year === year && actual.week === week
      ? result
      : null;
  }

  const MONTHS = [
    "Xakelêwe", "Gulan", "Cizerdan", "Pûşper",
    "Gelawêj", "Xermanan", "Rezber", "Gelarêzan",
    "Sermawez", "Befranbar", "Rêbendan", "Reşeme"
  ];

  const MONTHS_CKB = [
<<<<<<< HEAD
    "خاکەلێوە", "بانەمەڕ", "جۆزەردان", "پووشپەڕ",
    "گەلاوێژ", "خەرمانان", "ڕەزبەر", "خەزەڵوەر",
    "سەرماوەز", "بەفرانبار", "ڕێبەندان", "ڕەشەمە"
  ];

  const GREGORIAN_MONTHS_CKB = [
    "جانیوەری", "فێبریوەری", "مارچ", "ئەپرێل",
    "مەی", "جوون", "جولای", "ئۆگەست",
    "سێپتەمبەر", "ئوکتۆبەر", "نۆڤەمبەر", "دیسێمبەر"
  ];

=======
    "خاکەلێوە", "گوڵان", "جۆزەردان", "پووشپەڕ",
    "گەلاوێژ", "خەرمانان", "ڕەزبەر", "گەڵاڕێزان",
    "سەرماوەز", "بەفرانبار", "ڕێبەندان", "ڕەشەمە"
  ];

>>>>>>> 26494999ea39bc70bfc6b80d481768d8b1e343eb
  const HOLIDAYS = {
    "03-21": {
      en: "Newroz",
      kmr: "Newroz",
      ckb: "نەورۆز"
    }
  };

  // Kurdish calendar year starts on March 21.

  function kurdishYearStart(year) {
    return new Date(year - 700, 2, 21);
  }

  function daysInKurdishYear(year) {
    return daysBetween(
      kurdishYearStart(year),
      kurdishYearStart(year + 1)
    );
  }

  function kurdishYearForDate(date) {
    const march21 = new Date(date.getFullYear(), 2, 21);
    return (
      date >= march21
        ? date.getFullYear()
        : date.getFullYear() - 1
    ) + 700;
  }

  function kurdishMonthLength(year, month) {
    if (!Number.isInteger(month) || month < 0 || month > 11) {
      return 0;
    }
    if (month < 6) return 31;
    if (month < 11) return 30;
    return daysInKurdishYear(year) - 336;
  }

  function kurdishMonthStart(year, month) {
    const normalizedYear = year + Math.floor(month / 12);
    const normalizedMonth = ((month % 12) + 12) % 12;
    let offset = 0;
    for (let index = 0; index < normalizedMonth; index += 1) {
      offset += kurdishMonthLength(normalizedYear, index);
    }
    return addDays(kurdishYearStart(normalizedYear), offset);
  }

  function kurdishDateParts(date) {
    const year = kurdishYearForDate(date);
    let remaining = daysBetween(kurdishYearStart(year), date);
    for (let month = 0; month < 12; month += 1) {
      const length = kurdishMonthLength(year, month);
      if (remaining < length) {
        return { year, month, day: remaining + 1 };
      }
      remaining -= length;
    }
    return { year, month: 11, day: 1 };
  }
function localizeDigits(value, language = "en") {
  const digits = language === "ckb"
    ? "٠١٢٣٤٥٦٧٨٩"
    : "0123456789";
  return String(value).replace(
    /\d/g,
    digit => digits[Number(digit)]
  );
}

  function formatGregorian(date, language = "en") {
<<<<<<< HEAD
    if (language === "ckb") {
      const day = localizeDigits(date.getDate(), language);
      const month = GREGORIAN_MONTHS_CKB[date.getMonth()];
      const year = localizeDigits(date.getFullYear(), language);
      return `${day}ی ${month}ی ${year}ی زایینی`;
    }

    const locale = language === "kmr" ? "ku" : "en-GB";
=======
    const locale = language === "ckb"
      ? "ckb"
      : language === "kmr"
        ? "ku"
        : "en-GB";
>>>>>>> 26494999ea39bc70bfc6b80d481768d8b1e343eb
    try {
      return new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "short",
        year: "numeric"
      }).format(date);
    } catch {
      return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
      }).format(date);
    }
  }

  function formatKurdishDate(date, language = "en") {
    const parts = kurdishDateParts(date);
    const month = language === "ckb"
      ? MONTHS_CKB[parts.month]
      : MONTHS[parts.month];
    const day = localizeDigits(parts.day, language);
    const year = localizeDigits(parts.year, language);
    if (language === "ckb") {
<<<<<<< HEAD
      return `${day}ی ${month}ی ${year}ی کوردی`;
=======
      return `${day}ی ${month} ${year}`;
>>>>>>> 26494999ea39bc70bfc6b80d481768d8b1e343eb
    }
    if (language === "kmr") {
      return `${day}ê ${month} ${year}`;
    }
    return `${month} ${parts.day}, ${parts.year}`;
  }

  function formatNorwegianWeekRange(date) {
    const monday = startOfWeek(date);
    const sunday = addDays(monday, 6);
    const format = (value, options) =>
      new Intl.DateTimeFormat("nb-NO", options).format(value);
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
    if (language === "no") {
      return formatNorwegianWeekRange(date);
    }
    const monday = startOfWeek(date);
    const sunday = addDays(monday, 6);
    return `${formatGregorian(monday, language)} – ${formatGregorian(sunday, language)}`;
  }

  function getHoliday(date, language = "en") {
    const key = [
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");
    const holiday = HOLIDAYS[key];
    return holiday ? holiday[language] || holiday.en : null;
  }

  function normalizeSearchDigits(value) {
    const arabicIndicDigits = "٠١٢٣٤٥٦٧٨٩";
    const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
    let normalized = "";
    for (let i = 0; i < value.length; i++) {
      const character = value.charAt(i);
      let digit = arabicIndicDigits.indexOf(character);
      if (digit === -1) {
        digit = persianDigits.indexOf(character);
      }
      if (digit === -1) {
        normalized += character;
      } else {
        normalized += String(digit);
      }
    }
    return normalized;
  }

  function parseSearch(input, referenceDate = new Date()) {
    const value = normalizeSearchDigits(String(input || "").trim());
    if (!value) return null;
    let match;
    // Week/year: 46 2026, 46-2026, week 46 2026, uke 46 2026.
    match = /^(?:(?:week|weeks|uke|hefte|heftujmer|هەفتە)\s*)?(\d{1,2})[\s,/-]+(\d{4})$/i.exec(value);
    if (match) {
      const date = isoWeekStart(
        Number(match[2]),
        Number(match[1])
      );
      return date ? { date, type: "week" } : null;
    }
    // Week number in the current ISO week-year.
    match = /^(?:(?:week|weeks|uke|hefte|heftujmer|هەفتە)\s*)?(\d{1,2})$/i.exec(value);
    if (match) {
      const date = isoWeekStart(
        isoWeekYear(referenceDate),
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
    // A year alone opens ISO week 1.
    if (/^\d{4}$/.test(value)) {
      const date = isoWeekStart(Number(value), 1);
      return date ? { date, type: "week" } : null;
    }
    // Fall back to browser-supported date strings.
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
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
    daysUntilNewroz,
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
