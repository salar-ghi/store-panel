// Number / price formatting utilities.
//
//   formatNumber  → 1,500,000  (Latin digits with comma)
//   formatPrice   → ۱٬۵۰۰٬۰۰۰ تومان  (Persian digits + Persian separator) — for DISPLAY
//   parseNumeric  → strips commas / Persian digits and returns a JS number
//
// Convention: INPUT fields use formatNumber (Latin commas, easy to type).
// DISPLAY (tables, badges, totals) uses formatPrice / toPersianDigits.

import { toPersianDigits } from './persian-date';

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** Strip all non-digit / non-dot characters, supporting Persian/Arabic digits. */
export function parseNumeric(value: string | number | null | undefined): number {
  if (value == null || value === '') return 0;
  if (typeof value === 'number') return isFinite(value) ? value : 0;

  let normalized = value.toString();
  for (let i = 0; i < 10; i++) {
    normalized = normalized
      .replace(new RegExp(PERSIAN_DIGITS[i], 'g'), String(i))
      .replace(new RegExp(ARABIC_DIGITS[i], 'g'), String(i));
  }
  normalized = normalized.replace(/[٬,\s]/g, '');
  const n = Number(normalized);
  return isFinite(n) ? n : 0;
}

/** Latin digits with comma thousand separator (for input fields). */
export function formatNumber(value: number | string | null | undefined): string {
  const n = parseNumeric(value);
  if (!n && n !== 0) return '';
  // preserve decimal portion if present
  const isDecimal = String(value ?? '').includes('.');
  if (isDecimal) {
    const [intPart, decPart = ''] = String(n).split('.');
    return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (decPart ? '.' + decPart : '');
  }
  return n.toLocaleString('en-US');
}

/** Persian digits + Persian thousand separator + optional currency suffix (DISPLAY). */
export function formatPrice(value: number | string | null | undefined, currency = 'تومان'): string {
  const n = parseNumeric(value);
  const formatted = new Intl.NumberFormat('fa-IR').format(n);
  return currency ? `${formatted} ${currency}` : formatted;
}

/** Persian digits, no currency (DISPLAY for plain counts / quantities). */
export function formatPersianNumber(value: number | string | null | undefined): string {
  const n = parseNumeric(value);
  return new Intl.NumberFormat('fa-IR').format(n);
}

export { toPersianDigits };
