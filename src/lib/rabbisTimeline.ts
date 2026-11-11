import { toHebrewNumeral } from './hebrewNumerals';

/**
 * ציר הדורות — the rabbi directory as one chronological line. Everyone is
 * ordered by `sortYear` and grouped by the civil century they belong to;
 * empty centuries between two groups become a "time passes" gap.
 * Pure, tested in tests/rabbisTimeline.test.ts.
 */
export interface TimelineEntry { sortYear: number; category: string }

export interface TimelineSection<T extends TimelineEntry> {
  /** Signed century with no zero: 12 = 1101–1200, -5 = 500–401 BCE. */
  century: number;
  items: T[];
  /** Eras present, in order of first appearance. */
  categories: T['category'][];
  /** Whole centuries with no one in them, right before this section. */
  gap: number;
  /** Index of the section's first item in the whole line (sides alternate by it). */
  start: number;
}

/** Negative years are BCE; there is no year 0, so 0 counts as 1 CE. */
export function centuryOf(year: number): number {
  if (year >= 0) return Math.max(1, Math.ceil(year / 100));
  return -Math.ceil(-year / 100);
}

/** Centuries as consecutive integers across the BCE → CE seam. */
const ordinal = (century: number) => (century > 0 ? century - 1 : century);

export interface CenturyYears { from: number; to: number; bce: boolean }

/** The years a century covers, in reading order (500–401 BCE, 1101–1200). */
export function centuryYears(century: number): CenturyYears {
  const n = Math.abs(century);
  return century < 0
    ? { from: n * 100, to: (n - 1) * 100 + 1, bce: true }
    : { from: (n - 1) * 100 + 1, to: n * 100, bce: false };
}

/** The century as Hebrew letters with geresh / gershayim: 5 → ה׳, 12 → י״ב. */
export function centuryLetters(century: number): string {
  const s = toHebrewNumeral(Math.abs(century));
  return s.length === 1 ? `${s}׳` : `${s.slice(0, -1)}״${s.slice(-1)}`;
}

const TITLES = /^(?:ה?רב(?:י|ן|נו)?|מרן|רבנו)\s+/;

/** The letter shown in a medallion without a portrait: the name's, not the title's. */
export function initialOf(name: string): string {
  const bare = name.trim().replace(TITLES, '');
  return (bare || name.trim()).charAt(0);
}

export function buildTimeline<T extends TimelineEntry>(rabbis: readonly T[]): TimelineSection<T>[] {
  const line = rabbis
    .map((r, i) => ({ r, i }))
    .sort((a, b) => a.r.sortYear - b.r.sortYear || a.i - b.i)
    .map(x => x.r);

  const sections: TimelineSection<T>[] = [];
  line.forEach((r, index) => {
    const century = centuryOf(r.sortYear);
    let sec = sections[sections.length - 1];
    if (!sec || sec.century !== century) {
      const gap = sec ? ordinal(century) - ordinal(sec.century) - 1 : 0;
      sec = { century, items: [], categories: [], gap, start: index };
      sections.push(sec);
    }
    sec.items.push(r);
    if (!sec.categories.includes(r.category)) sec.categories.push(r.category);
  });
  return sections;
}
