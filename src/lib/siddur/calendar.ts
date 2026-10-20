import type { PartCondition, PrayerPart, PrayerSection, ServiceId } from './types';
import type { PrayerDay, Occasion } from './occasions';

export { prayerDay, hebrewDate } from './occasions';
export type { PrayerDay } from './occasions';

const has = (d: PrayerDay, ...o: Occasion[]) => o.some(x => d.occasions.has(x));

/** One rule per condition — the single place prayer logic meets the calendar. */
const CONDITIONS: Record<Exclude<PartCondition, `chanukah-${number}`>, (d: PrayerDay) => boolean> = {
  'tachanun':           d => d.tachanun,
  'no-tachanun':        d => !d.tachanun,
  'mon-thu':            d => has(d, 'mon-thu'),
  'not-mon-thu':        d => !has(d, 'mon-thu'),
  'torah-reading':      d => d.service === 'shacharit' && has(d, 'mon-thu', 'rosh-chodesh', 'chanukah', 'fast', 'purim'),
  'rosh-chodesh':       d => has(d, 'rosh-chodesh'),
  'hallel':             d => has(d, 'rosh-chodesh', 'chanukah', 'chol-hamoed'),
  'full-hallel':        d => has(d, 'chanukah', 'chol-hamoed-sukkot'),
  'yaale':              d => has(d, 'rosh-chodesh', 'chol-hamoed'),
  'al-hanisim':         d => has(d, 'chanukah', 'purim'),
  'chanukah':           d => has(d, 'chanukah'),
  'purim':              d => has(d, 'purim'),
  'fast':               d => has(d, 'fast'),
  'public-fast':        d => has(d, 'fast') && !has(d, 'tisha-bav'),
  'tisha-bav':          d => has(d, 'tisha-bav'),
  'not-tisha-bav':      d => !has(d, 'tisha-bav'),
  'fast-gedalia-tevet': d => has(d, 'fast-gedalia', 'fast-tevet'),
  'fast-esther-purim':  d => has(d, 'fast-esther', 'purim'),
  'fast-tammuz':        d => has(d, 'fast-tammuz'),
  'aseret':             d => has(d, 'aseret'),
  'after-yk':           d => has(d, 'after-yk'),
  'motzash':            d => has(d, 'motzash'),
  'friday':             d => has(d, 'friday'),
  'not-friday':         d => !has(d, 'friday'),
  'summer':             d => !has(d, 'winter'),
  'winter':             d => has(d, 'winter'),
  'optional':           () => false,
};

export function conditionApplies(when: PartCondition | undefined, day: PrayerDay): boolean {
  if (!when) return true;
  const m = /^chanukah-(\d)$/.exec(when);
  if (m) return day.chanukahDay === Number(m[1]);
  return CONDITIONS[when as keyof typeof CONDITIONS](day);
}

export const partApplies = (part: PrayerPart, day: PrayerDay) => conditionApplies(part.when, day);
export const sectionApplies = (section: PrayerSection, day: PrayerDay) => conditionApplies(section.when, day);

/**
 * Conditions that describe an ordinary day's text (summer/winter, "not on
 * Friday"…): when they apply the text reads inline, with no "said today" box.
 */
export const EVERYDAY: ReadonlySet<PartCondition> = new Set<PartCondition>([
  'tachanun', 'no-tachanun', 'not-mon-thu', 'not-tisha-bav', 'not-friday', 'summer', 'winter',
]);

/** Song of the day: today's psalm only; on Shabbat (no weekday psalm) show all. */
export function showWeekdayPart(part: PrayerPart, day: PrayerDay, showAll: boolean): boolean {
  if (part.weekday === undefined || showAll || day.weekday === 6) return true;
  return part.weekday === day.weekday;
}

/* ── Sun times for Jerusalem (NOAA sunrise equation, ±2 min) ── */

const TZ = 'Asia/Jerusalem';
const LAT = 31.778;
const LNG = 35.235;
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const fromJulian = (j: number) => new Date((j - 2440587.5) * 86400000);

export interface SunTimes { sunrise: Date; noon: Date; sunset: Date; }

export function jerusalemSunTimes(now: Date): SunTimes {
  const [y, m, d] = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(now).split('-').map(Number);
  const jDate = Date.UTC(y, m - 1, d, 12) / 86400000 + 2440587.5;
  const n = Math.round(jDate - 2451545.0 + 0.0008);
  const jStar = n - LNG / 360;
  const M = (357.5291 + 0.98560028 * jStar) % 360;
  const C = 1.9148 * Math.sin(rad(M)) + 0.02 * Math.sin(rad(2 * M)) + 0.0003 * Math.sin(rad(3 * M));
  const lambda = (M + C + 180 + 102.9372) % 360;
  const jTransit = 2451545.0 + jStar + 0.0053 * Math.sin(rad(M)) - 0.0069 * Math.sin(rad(2 * lambda));
  const decl = Math.asin(Math.sin(rad(lambda)) * Math.sin(rad(23.4397)));
  const cosW = (Math.sin(rad(-0.833)) - Math.sin(rad(LAT)) * Math.sin(decl)) / (Math.cos(rad(LAT)) * Math.cos(decl));
  const w = deg(Math.acos(Math.max(-1, Math.min(1, cosW))));
  return { sunrise: fromJulian(jTransit - w / 360), noon: fromJulian(jTransit), sunset: fromJulian(jTransit + w / 360) };
}

/**
 * The service that fits the current time in Israel: shacharit from dawn
 * (~72 min before sunrise) until chatzot, mincha until sunset, arvit after.
 */
export function suggestService(now: Date): ServiceId {
  const { sunrise, noon, sunset } = jerusalemSunTimes(now);
  const t = now.getTime();
  if (t < sunrise.getTime() - 72 * 60000) return 'arvit';
  if (t < noon.getTime()) return 'shacharit';
  if (t < sunset.getTime()) return 'mincha';
  return 'arvit';
}
