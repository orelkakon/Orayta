import { toHebrewNumeral } from './hebrewNumerals';

const GERESH = '׳';
const GERSHAYIM = '״';

/** יז → י״ז style punctuation: gershayim before the last letter, geresh after a single one. */
function punctuate(letters: string): string {
  if (letters.length <= 1) return letters + GERESH;
  return letters.slice(0, -1) + GERSHAYIM + letters.slice(-1);
}

/** 17 → י״ז */
export function dayToLetters(day: number): string {
  return punctuate(toHebrewNumeral(day));
}

/** 5786 → התשפ״ו */
export function yearToLetters(year: number): string {
  return 'ה' + punctuate(toHebrewNumeral(year % 1000));
}

/**
 * Today's Hebrew-calendar date fully in letters: "י״ז בתמוז" or "י״ז בתמוז התשפ״ו".
 * Returns '' when the runtime lacks the Hebrew calendar (the callers hide the line).
 */
export function formatHebrewDate(date: Date, withYear = false): string {
  try {
    const parts = new Intl.DateTimeFormat('he-u-ca-hebrew', {
      day: 'numeric', month: 'long', year: 'numeric',
    }).formatToParts(date);
    const get = (type: string) => parts.find(p => p.type === type)?.value ?? '';
    const day = Number(get('day'));
    const month = get('month');
    const year = Number(get('year'));
    if (!day || !month) return '';
    const base = `${dayToLetters(day)} ב${month}`;
    return withYear && year ? `${base} ${yearToLetters(year)}` : base;
  } catch {
    return '';
  }
}
