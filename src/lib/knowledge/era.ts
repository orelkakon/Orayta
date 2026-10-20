/**
 * Years and centuries out of the free-text `datePeriod` field. Only clear
 * "<year> - <year>" ranges are trusted; "המאה ה-2", "זמנו שנוי במחלוקת" and
 * the like return null so no question is built on a guess.
 */

const BCE = /לפנה["״]ס/;
const CE = /לספירה/;
const NOW_YEAR = 2026;

export interface YearRange { start: number; end: number; }

export function parseYearRange(period: string): YearRange | null {
  const m = period.trim().match(/^~?\s*(\d{1,4})\s*(לפנה["״]ס)?\s*[-–]\s*(\d{1,4}|היום)\s*(לפנה["״]ס|לספירה)?\s*$/);
  if (!m) return null;
  const [, a, aBce, b, tail] = m;
  const endIsBce = tail !== undefined && BCE.test(tail);
  // "1812 - 1637 לפנה״ס": a trailing BCE marker covers both ends;
  // "113 לפנה״ס - 8 לספירה": only the marked end is BCE.
  const startIsBce = Boolean(aBce) || (endIsBce && !CE.test(period));
  const start = Number(a) * (startIsBce ? -1 : 1);
  const end = b === 'היום' ? NOW_YEAR : Number(b) * (endIsBce ? -1 : 1);
  if (start === 0 || end === 0 || end < start || end - start > 200) return null;
  return { start, end };
}

/**
 * Century index with no year zero: 0 = 1st century CE, 19 = 20th,
 * -1 = 1st century BCE, -18 = 18th BCE.
 */
export function centuryIndex(year: number): number {
  return year > 0 ? Math.ceil(year / 100) - 1 : -Math.ceil(-year / 100);
}

/** Ordinal number to show and whether it is BCE. */
export function centuryParts(index: number): { n: number; bce: boolean } {
  return index >= 0 ? { n: index + 1, bce: false } : { n: -index, bce: true };
}

/** Highest century a distractor may name (the current one). */
export const MAX_CENTURY_INDEX = centuryIndex(NOW_YEAR);
