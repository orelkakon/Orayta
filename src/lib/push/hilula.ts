import type { Rabbi } from '@/types';
import { hebrewDate, type HebMonth } from '@/lib/siddur/occasions';
import { matchYahrzeitRabbis, type HebDateParts } from '@/lib/yahrzeit';
import { formatHebrewDate } from '@/lib/hebrewDate';
import { jerusalemSunTimes } from '@/lib/siddur/calendar';
import { OMER_AFTER_SUNSET_MIN } from './schedule';

const DAY_MS = 86400000;
const TZ = 'Asia/Jerusalem';

/** Intl's Hebrew month names → the hebcal names `yahrzeit.ts` keys on. */
const INTL_TO_HEBCAL: Record<HebMonth, string> = {
  'Tishri': 'Tishrei', 'Heshvan': 'Cheshvan', 'Kislev': 'Kislev', 'Tevet': 'Tevet',
  'Shevat': 'Shvat', 'Adar': 'Adar', 'Adar I': 'Adar I', 'Adar II': 'Adar II',
  'Nisan': 'Nisan', 'Iyar': 'Iyyar', 'Sivan': 'Sivan', 'Tamuz': 'Tamuz', 'Av': 'Av', 'Elul': 'Elul',
};

/** GlobalCounter key for the candles lit on an Israel day. */
export const candleKey = (day: string) => `hilula_candles:${day}`;

/** 'YYYY-MM-DD' of `d` in Israel. */
export const israelIso = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d);

/** Noon in Israel on the Israel calendar day containing `d` — a safe instant for date lookups. */
function israelNoon(d: Date): Date {
  return new Date(`${israelIso(d)}T12:00:00+02:00`);
}

/** Hebrew date parts (hebcal naming) of the Israel civil day containing `d` — no network. */
export function hebDatePartsFor(d: Date): HebDateParts | null {
  const h = hebrewDate(israelNoon(d));
  return h ? { hd: h.day, hm: INTL_TO_HEBCAL[h.month] } : null;
}

/**
 * A moment inside the Hebrew day that is current at `now` in Israel: from
 * nightfall on, the next Hebrew day has begun, so its civil date is tomorrow's.
 */
export function hebrewDayAnchor(now: Date): Date {
  const nightfall = jerusalemSunTimes(now).sunset.getTime() + OMER_AFTER_SUNSET_MIN * 60_000;
  return now.getTime() >= nightfall ? new Date(now.getTime() + 86_400_000) : now;
}

/** Rabbis whose hilula falls on the Israel day containing `d`. */
export function hilulaRabbisOn<R extends Pick<Rabbi, 'deathDate'>>(rabbis: R[], d: Date): R[] {
  const parts = hebDatePartsFor(d);
  return parts ? matchYahrzeitRabbis(rabbis, parts) : [];
}

export interface HilulaDate<R> { iso: string; hebrew: string; rabbis: R[]; }

/** Today plus the next days that have hilulot, up to `limit` days with matches within `horizon` days. */
export function hilulaCalendar<R extends Pick<Rabbi, 'deathDate'>>(
  rabbis: R[], from: Date, horizon = 60, limit = 6,
): { today: HilulaDate<R>; upcoming: HilulaDate<R>[] } {
  const at = (i: number) => new Date(israelNoon(from).getTime() + i * DAY_MS);
  const entry = (d: Date): HilulaDate<R> => ({ iso: israelIso(d), hebrew: formatHebrewDate(d), rabbis: hilulaRabbisOn(rabbis, d) });
  const upcoming: HilulaDate<R>[] = [];
  for (let i = 1; i <= horizon && upcoming.length < limit; i++) {
    const e = entry(at(i));
    if (e.rabbis.length) upcoming.push(e);
  }
  return { today: entry(at(0)), upcoming };
}

/** "רבי א, רבי ב ועוד 2" — keeps a notification body short however many there are. */
export function joinNames(names: string[], max = 2, more: (n: number) => string): string {
  if (names.length <= max + 1) {
    return names.length <= 1 ? (names[0] ?? '') : `${names.slice(0, -1).join(', ')} ו${names[names.length - 1]}`;
  }
  return `${names.slice(0, max).join(', ')} ${more(names.length - max)}`;
}
