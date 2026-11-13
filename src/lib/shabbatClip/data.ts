import { HE } from '@/lib/hebrewTexts';
import { formatHebrewDate } from '@/lib/hebrewDate';
import type { CityTimes } from '@/lib/shabbat';

/**
 * What the shared Shabbat clip and message say (pure, tested): the parasha,
 * the Shabbat's date (Hebrew + civil, of the Saturday) and each city's
 * candle lighting and end, as Jerusalem clock times.
 */
export interface ClipRow { city: string; candles: string; ends: string }

export interface ClipData {
  /** "פרשת תולדות", or null when unknown. */
  parasha: string | null;
  /** "ד׳ בכסלו התשפ״ז" ('' when the runtime has no Hebrew calendar). */
  hebDate: string;
  /** "14.11.2026" */
  civilDate: string;
  rows: ClipRow[];
}

const TZ = 'Asia/Jerusalem';
export const clock = (d: Date) =>
  new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: TZ }).format(d);

export function civilDate(d: Date): string {
  const [y, m, day] = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d).split('-');
  return `${Number(day)}.${Number(m)}.${y}`;
}

export function clipData(cities: CityTimes[], parasha: string | null): ClipData {
  // Shabbat's own date: the Saturday on which it ends.
  const saturday = cities[0].ends;
  return {
    parasha,
    hebDate: formatHebrewDate(new Date(saturday.getTime() - 3 * 3600_000), true),
    civilDate: civilDate(saturday),
    rows: cities.map(c => ({ city: HE.SHABBAT_CITY[c.id], candles: clock(c.candles), ends: clock(c.ends) })),
  };
}

/** The Shabbat's date line: "ד׳ בכסלו התשפ״ז · 14.11.2026". */
export const dateLine = (d: ClipData) => [d.hebDate, d.civilDate].filter(Boolean).join(' · ');

/** The WhatsApp message: title with the parasha, the date, a line per city, the greeting and the link. */
export function shareText(d: ClipData, url: string): string {
  const rows = d.rows.map(r => HE.SHABBAT_WA_ROW(r.city, r.candles, r.ends));
  return HE.SHABBAT_WA_TEXT(HE.SHABBAT_WA_TITLE(d.parasha), dateLine(d), rows, url);
}
