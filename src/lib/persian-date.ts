// @ts-nocheck
import jalaali from "jalaali-js";

const persianMonthNames = [
  "فروردین", "اردیبهشت", "خرداد",
  "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر",
  "دی", "بهمن", "اسفند",
];

const persianWeekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
const persianWeekDaysFull = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];

export interface JalaaliDate {
  jy: number;
  jm: number;
  jd: number;
}

/** Convert a JS Date to Jalaali */
export function toJalaali(date: Date): JalaaliDate {
  return jalaali.toJalaali(date);
}

/** Convert Jalaali to JS Date */
export function toGregorian(jy: number, jm: number, jd: number): Date {
  const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd);
  return new Date(gy, gm - 1, gd);
}

/** Get month name */
export function getPersianMonthName(month: number): string {
  return persianMonthNames[month - 1] || "";
}

/** Get all month names */
export function getPersianMonthNames(): string[] {
  return persianMonthNames;
}

/** Get weekday headers */
export function getPersianWeekDays(): string[] {
  return persianWeekDays;
}

/** Get number of days in a Jalaali month */
export function getJalaaliMonthDays(jy: number, jm: number): number {
  return jalaali.jalaaliMonthLength(jy, jm);
}

/** Format a Date to Persian string like "۲۵ دی ۱۴۰۳" */
export function formatPersianDate(date: Date | string | undefined | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const { jy, jm, jd } = toJalaali(d);
  return `${toPersianDigits(jd)} ${getPersianMonthName(jm)} ${toPersianDigits(jy)}`;
}

/** Format a Date to Persian short string like "۱۴۰۳/۱۰/۲۵" */
export function formatPersianDateShort(date: Date | string | undefined | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const { jy, jm, jd } = toJalaali(d);
  return `${toPersianDigits(jy)}/${toPersianDigits(String(jm).padStart(2, "0"))}/${toPersianDigits(String(jd).padStart(2, "0"))}`;
}

/** Convert digits to Persian/Farsi numerals */
export function toPersianDigits(num: number | string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

/**
 * Get the day-of-week index (0=Saturday..6=Friday) for a Jalaali date.
 * JS Date.getDay() returns 0=Sunday..6=Saturday
 */
export function getJalaaliDayOfWeek(jy: number, jm: number, jd: number): number {
  const gDate = toGregorian(jy, jm, jd);
  const dow = gDate.getDay(); // 0=Sun
  // Convert to 0=Sat: Sat=0, Sun=1, Mon=2, ...
  return (dow + 1) % 7;
}

/** Build a month grid for Jalaali calendar */
export function buildMonthGrid(jy: number, jm: number): (number | null)[][] {
  const daysInMonth = getJalaaliMonthDays(jy, jm);
  const firstDayOfWeek = getJalaaliDayOfWeek(jy, jm, 1);

  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = [];

  // Fill empty days before first day
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Fill remaining days
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return weeks;
}
