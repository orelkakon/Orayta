import { allCityTimes } from '@/lib/shabbat';
import { jerusalemDay } from '@/lib/adminStatsUtils';
import { addDayKey, dayKeyNoon, weekdayOfKey } from '@/lib/daily/day';

/**
 * Which day / Shabbat a story image is for, and how long a CDN may keep it —
 * pure, unit-tested. Everything is in Israel time.
 */

/** When Shabbat whose Friday is `fridayKey` goes out in Jerusalem. */
export const shabbatEnds = (fridayKey: string): Date => allCityTimes(dayKeyNoon(fridayKey))[0].ends;

/**
 * The Friday of the upcoming Shabbat for an Israel day: that week's Friday
 * (Sunday–Friday), or the Shabbat in progress on Saturday — and, when `now`
 * is on that Saturday after Shabbat went out in Jerusalem, next week's.
 */
export function shabbatFridayKey(dayKey: string, now?: Date): string {
  const wd = weekdayOfKey(dayKey);
  if (wd !== 6) return addDayKey(dayKey, 5 - wd);
  const friday = addDayKey(dayKey, -1);
  return now && now.getTime() >= shabbatEnds(friday).getTime() ? addDayKey(dayKey, 6) : friday;
}

/** The instant an Israel calendar day begins (Israel is UTC+2 or +3, and
 *  clocks never change at midnight). */
export function israelMidnight(dayKey: string): Date {
  const [y, m, d] = dayKey.split('-').map(Number);
  for (const off of [2, 3]) {
    const t = new Date(Date.UTC(y, m - 1, d) - off * 3_600_000);
    if (jerusalemDay(t) === dayKey && jerusalemDay(new Date(t.getTime() - 1000)) !== dayKey) return t;
  }
  return new Date(Date.UTC(y, m - 1, d) - 2 * 3_600_000);
}

export const DATED_CACHE = 'public, s-maxage=3600, stale-while-revalidate=86400';

/**
 * Cache-Control for an image. A dated URL (?d= / ?date=) names its day, so it
 * is cached normally. The bare URL means "now": the CDN may keep it, and serve
 * it stale, only until `until` (the next Israel midnight, or Shabbat going
 * out) — tomorrow's request never gets today's image.
 */
export function storyCacheControl(now: Date, until: Date | null): string {
  if (!until) return DATED_CACHE;
  const left = Math.max(0, Math.floor((until.getTime() - now.getTime()) / 1000));
  const fresh = Math.min(3600, left);
  const stale = Math.min(86_400, left - fresh);
  return `public, s-maxage=${fresh}, stale-while-revalidate=${stale}`;
}
