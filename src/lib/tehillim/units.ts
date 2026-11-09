import { toHebrewNumeral } from '@/lib/hebrewNumerals';
import type { TehillimMode } from '@/types/tehillim';

/**
 * What one reader takes at a time (pure, tested). A unit is a list of
 * segments — a whole chapter, or a verse range of one. Chapter 119 (176
 * verses) is split into its 22 letters, the way it is usually divided,
 * so nobody is handed half an hour of reading by chance.
 */
export interface Segment { chapter: number; from?: number; to?: number }
export interface Unit { index: number; segments: Segment[] }

const LETTERS = 'אבגדהוזחטיכלמנסעפצקרשת';

/** "כ״ג" / "א׳" — a numeral with geresh or gershayim. */
export function numeral(n: number): string {
  const s = toHebrewNumeral(n);
  return s.length === 1 ? `${s}׳` : `${s.slice(0, -1)}״${s.slice(-1)}`;
}

function chapterUnits(): Segment[][] {
  const out: Segment[][] = [];
  for (let c = 1; c <= 150; c++) {
    if (c !== 119) { out.push([{ chapter: c }]); continue; }
    for (let i = 0; i < 22; i++) out.push([{ chapter: 119, from: i * 8 + 1, to: i * 8 + 8 }]);
  }
  return out;
}

const range = (a: number, b: number): Segment[] => Array.from({ length: b - a + 1 }, (_, i) => ({ chapter: a + i }));

/** The traditional division of Tehillim by the days of the month. */
const DAYS: Segment[][] = [
  range(1, 9), range(10, 17), range(18, 22), range(23, 28), range(29, 34), range(35, 38), range(39, 43),
  range(44, 48), range(49, 54), range(55, 59), range(60, 65), range(66, 68), range(69, 71), range(72, 76),
  range(77, 78), range(79, 82), range(83, 87), range(88, 89), range(90, 96), range(97, 103), range(104, 105),
  range(106, 107), range(108, 112), range(113, 118), [{ chapter: 119, from: 1, to: 96 }],
  [{ chapter: 119, from: 97, to: 176 }], range(120, 134), range(135, 139), range(140, 144), range(145, 150),
];

/** The five books of Tehillim. */
const BOOKS: Segment[][] = [range(1, 41), range(42, 72), range(73, 89), range(90, 106), range(107, 150)];

const TABLES: Record<TehillimMode, Segment[][]> = { chapter: chapterUnits(), day: DAYS, book: BOOKS };

export const unitCount = (mode: TehillimMode) => TABLES[mode].length;

export function unitAt(mode: TehillimMode, index: number): Unit | null {
  const segments = TABLES[mode][index];
  return segments ? { index, segments } : null;
}

/** How long a unit stays reserved for its reader before it is handed to someone else. */
export const HOLD_MINUTES: Record<TehillimMode, number> = { chapter: 20, day: 90, book: 240 };

/** Short name of a unit: "פרק כ״ג", "פרק קי״ט · אות ב׳", "יום ה׳", "ספר שני". */
export function unitTitle(mode: TehillimMode, index: number): string {
  const u = unitAt(mode, index);
  if (!u) return '';
  if (mode === 'day') return `יום ${numeral(index + 1)}`;
  if (mode === 'book') return `ספר ${['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי'][index]}`;
  const s = u.segments[0];
  return s.from ? `פרק ${numeral(119)} · אות ${LETTERS[(s.from - 1) / 8]}׳` : `פרק ${numeral(s.chapter)}`;
}

/** What it covers: "פרקים כ״ט–ל״ד", "פרק קי״ט, פסוקים א׳–צ״ו". Empty for a single chapter. */
export function unitRange(mode: TehillimMode, index: number): string {
  const u = unitAt(mode, index);
  if (!u || mode === 'chapter') return '';
  const first = u.segments[0];
  const last = u.segments[u.segments.length - 1];
  if (first.from) return `פרק ${numeral(first.chapter)}, פסוקים ${numeral(first.from)}–${numeral(first.to ?? first.from)}`;
  return `פרקים ${numeral(first.chapter)}–${numeral(last.chapter)}`;
}

/** Short cell label on the map: the chapter number, or the letter for 119's parts. */
export function unitShort(mode: TehillimMode, index: number): string {
  const u = unitAt(mode, index);
  if (!u) return '';
  if (mode !== 'chapter') return toHebrewNumeral(index + 1);
  const s = u.segments[0];
  return s.from ? LETTERS[(s.from - 1) / 8] : toHebrewNumeral(s.chapter);
}

/** Whole chapters a unit completes (119 counts once, with its first part) — for "chapters read". */
export const unitChapters = (mode: TehillimMode, index: number) => unitAt(mode, index)?.segments.filter(s => !s.from || s.from === 1).length ?? 0;
