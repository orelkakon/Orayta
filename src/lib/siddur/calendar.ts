import type { PrayerPart, ServiceId } from './types';

/** What "today" means for the weekday siddur — computed in Israel time. */
export interface PrayerDay {
  /** 0 = Sunday … 6 = Saturday. */
  weekday: number;
  /** Tishrei 1–10. */
  aseret: boolean;
}

const TZ = 'Asia/Jerusalem';
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function prayerDay(now: Date): PrayerDay {
  const wd = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short' }).format(now);
  let aseret = false;
  try {
    const parts = new Intl.DateTimeFormat('en-u-ca-hebrew', { timeZone: TZ, day: 'numeric', month: 'long' }).formatToParts(now);
    const month = parts.find(p => p.type === 'month')?.value ?? '';
    const day = Number(parts.find(p => p.type === 'day')?.value);
    aseret = /^Tishri$/i.test(month) && day >= 1 && day <= 10;
  } catch { /* runtime without the Hebrew calendar — treat as an ordinary day */ }
  return { weekday: Math.max(0, WEEKDAYS.indexOf(wd)), aseret };
}

/** Whether a conditional part is said today (unconditional parts always are). */
export function partApplies(part: PrayerPart, day: PrayerDay): boolean {
  switch (part.when) {
    case undefined:  return true;
    case 'mon-thu':  return day.weekday === 1 || day.weekday === 4;
    case 'aseret':   return day.aseret;
    case 'motzash':  return day.weekday === 6;
    case 'optional': return false;
  }
}

/** Song of the day: today's psalm only; on Shabbat (no weekday psalm) show all. */
export function showWeekdayPart(part: PrayerPart, day: PrayerDay, showAll: boolean): boolean {
  if (part.weekday === undefined || showAll || day.weekday === 6) return true;
  return part.weekday === day.weekday;
}

/* ── Sun times for Jerusalem (NOAA sunrise equation, ±2 min) ── */

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
