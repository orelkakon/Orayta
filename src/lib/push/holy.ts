import { hebrewDate, type HebDate } from '@/lib/siddur/occasions';
import { jerusalemSunTimes } from '@/lib/siddur/calendar';
import { localClock, DEFAULT_TIME_ZONE } from './schedule';

/**
 * Shabbat and Yom Tov — no notification may go out while either is in force
 * (pure, tested). Israel subscribers follow Jerusalem's sun with a safe margin
 * on both ends (candle lighting 40 min before sunset, the end 50 min after
 * it). Elsewhere we only know the time zone, not the place, so the rest day's
 * whole local date is blocked from 14:00 on its eve, and the diaspora's second
 * festival days count too.
 */
export const HOLY_BEFORE_SUNSET_MIN = 40;
export const HOLY_AFTER_SUNSET_MIN = 50;
const DIASPORA_EVE_MIN = 14 * 60;
const DAY_MS = 86_400_000;

const ISRAEL_ZONES = new Set(['Asia/Jerusalem', 'Asia/Tel_Aviv', 'Israel']);
export const isIsraelZone = (tz: string) => ISRAEL_ZONES.has(tz);

type YomTov = Partial<Record<HebDate['month'], number[]>>;
const YOM_TOV_IL: YomTov = { Tishri: [1, 2, 10, 15, 22], Nisan: [15, 21], Sivan: [6] };
const YOM_TOV_DIASPORA: YomTov = { Tishri: [1, 2, 10, 15, 16, 22, 23], Nisan: [15, 16, 21, 22], Sivan: [6, 7] };

/** 'YYYY-MM-DD' shifted by whole days. */
function addDays(day: string, n: number): string {
  return new Date(Date.parse(`${day}T12:00:00Z`) + n * DAY_MS).toISOString().slice(0, 10);
}

/** Shabbat or Yom Tov on a civil date (its daytime). */
export function isRestDay(day: string, diaspora = false): boolean {
  const noon = new Date(`${day}T12:00:00Z`);
  if (noon.getUTCDay() === 6) return true;
  const h = hebrewDate(noon);
  const table = diaspora ? YOM_TOV_DIASPORA : YOM_TOV_IL;
  return !!h && (table[h.month] ?? []).includes(h.day);
}

/** Inside Shabbat / Yom Tov in Israel, by Jerusalem's sun. */
export function isHolyInIsrael(now: Date): boolean {
  const today = localClock(now, DEFAULT_TIME_ZONE).day;
  const sunset = jerusalemSunTimes(now).sunset.getTime();
  const t = now.getTime();
  if (isRestDay(today) && t < sunset + HOLY_AFTER_SUNSET_MIN * 60_000) return true;
  return isRestDay(addDays(today, 1)) && t >= sunset - HOLY_BEFORE_SUNSET_MIN * 60_000;
}

/** Inside Shabbat / Yom Tov for a subscriber in `timeZone` (Israel rules for Israel zones). */
export function isHolyFor(now: Date, timeZone: string): boolean {
  if (isIsraelZone(timeZone)) return isHolyInIsrael(now);
  const clock = localClock(now, timeZone);
  if (isRestDay(clock.day, true)) return true;
  return clock.minutes >= DIASPORA_EVE_MIN && isRestDay(addDays(clock.day, 1), true);
}

/**
 * Minutes after Israel sunset at which the evening notifications (hilula,
 * omer) go out: nightfall normally, but after a rest day only once it has
 * surely ended.
 */
export function eveningDelayMin(now: Date, nightfallAfterSunsetMin: number): number {
  const restToday = isRestDay(localClock(now, DEFAULT_TIME_ZONE).day);
  return restToday ? Math.max(nightfallAfterSunsetMin, HOLY_AFTER_SUNSET_MIN + 5) : nightfallAfterSunsetMin;
}
