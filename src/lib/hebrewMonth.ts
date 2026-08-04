import { dayToLetters, yearToLetters } from './hebrewDate';

// Hebrew-month grid math built on Intl's hebrew calendar — no network needed.

export interface HebDayCell {
  iso: string;          // Gregorian date, YYYY-MM-DD (local)
  hebDay: number;       // 1..30
  hebDayLetters: string; // א׳ .. ל׳
  gregDay: number;      // Gregorian day-of-month, shown small in the cell
  weekday: number;      // 0 = Sunday .. 6 = Shabbat
}

export interface HebMonthGrid {
  title: string;        // e.g. "אב התשפ״ו"
  leading: number;      // blank cells before day 1 (weekday of the 1st)
  cells: HebDayCell[];
  startISO: string;
  endISO: string;
}

interface HebParts { day: number; month: string; year: number; }

let fmt: Intl.DateTimeFormat | null | undefined;

function hebParts(d: Date): HebParts | null {
  try {
    if (fmt === undefined) {
      fmt = new Intl.DateTimeFormat('he-u-ca-hebrew', {
        day: 'numeric', month: 'long', year: 'numeric',
      });
    }
    if (!fmt) return null;
    const parts = fmt.formatToParts(d);
    const get = (type: string) => parts.find(p => p.type === type)?.value ?? '';
    const day = Number(get('day'));
    const month = get('month');
    const year = Number(get('year'));
    return day && month && year ? { day, month, year } : null;
  } catch {
    fmt = null;
    return null;
  }
}

/** Add n days, anchored at noon so DST shifts can't skip a date. */
export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, 12);
}

export function toISO(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}

/** The full Hebrew month containing `anchor`, or null when Intl lacks the calendar. */
export function buildHebMonth(anchor: Date): HebMonthGrid | null {
  const ap = hebParts(anchor);
  if (!ap) return null;
  const start = addDays(anchor, 1 - ap.day);
  const length = hebParts(addDays(start, 29))?.day === 30 ? 30 : 29;

  const cells: HebDayCell[] = [];
  for (let i = 0; i < length; i++) {
    const d = addDays(start, i);
    cells.push({
      iso: toISO(d),
      hebDay: i + 1,
      hebDayLetters: dayToLetters(i + 1),
      gregDay: d.getDate(),
      weekday: d.getDay(),
    });
  }

  return {
    title: `${ap.month} ${yearToLetters(ap.year)}`,
    leading: start.getDay(),
    cells,
    startISO: cells[0].iso,
    endISO: cells[length - 1].iso,
  };
}
