/**
 * Pure scheduling decisions for the push dispatcher. The dispatcher runs every
 * ~10 minutes from GitHub Actions, and GitHub may delay or skip scheduled runs,
 * so nothing here depends on hitting an exact minute: a notification is "due"
 * once its local time has passed today, it wasn't sent today yet, and we are
 * not so late that it would arrive at a strange hour.
 */

export const DEFAULT_TIME_ZONE = 'Asia/Jerusalem';
export const DEFAULT_DAILY_MINUTES = 8 * 60;
export const MINUTE_STEP = 15;
/** How late (in minutes) a missed send may still go out. */
export const LATE_WINDOW_MIN = 180;
/** Omer reminder: this long after sunset (≈ tzeit hakochavim). */
export const OMER_AFTER_SUNSET_MIN = 25;

export interface LocalClock {
  /** 'YYYY-MM-DD' in the given time zone. */
  day: string;
  /** Minutes since local midnight. */
  minutes: number;
}

export function isValidTimeZone(tz: unknown): tz is string {
  if (typeof tz !== 'string' || tz.length === 0 || tz.length > 64) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Wall-clock day + minute of `now` in `timeZone` (falls back to Israel time). */
export function localClock(now: Date, timeZone: string): LocalClock {
  const tz = isValidTimeZone(timeZone) ? timeZone : DEFAULT_TIME_ZONE;
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now);
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? '00';
  return {
    day: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  };
}

/** Accepts whole minutes in [0, 1440) on the 15-minute grid; null otherwise. */
export function normalizeMinutes(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isInteger(value)) return null;
  if (value < 0 || value >= 1440 || value % MINUTE_STEP !== 0) return null;
  return value;
}

/** Due when the target time has passed today, it wasn't sent today, and we're within the late window. */
export function isDue(clock: LocalClock, targetMinutes: number, lastSentDay: string | null): boolean {
  if (lastSentDay === clock.day) return false;
  const late = clock.minutes - targetMinutes;
  return late >= 0 && late <= LATE_WINDOW_MIN;
}

export interface SubscriptionPrefs {
  timeZone: string;
  dailyMinutes: number;
  daily: boolean;
  hilula: boolean;
  omer: boolean;
  lastDailyDay: string | null;
  lastHilulaDay: string | null;
  lastOmerDay: string | null;
}

export interface DayContext {
  /**
   * Civil date ('YYYY-MM-DD') of the Hebrew day that begins tonight, when it has
   * at least one hilula (null otherwise). It is also the hilula "sent" marker, so
   * one notification goes out per Hebrew day whenever it was last claimed.
   */
  hilulaDay: string | null;
  /** Tonight's omer count is defined (null outside the season). */
  omerTonight: number | null;
  /** Israel nightfall (צאת הכוכבים) in minutes after midnight — hilula and omer go out then. */
  nightfallMinutes: number;
}

export type PushKind = 'daily' | 'hilula' | 'omer';

/**
 * Which notifications one subscription should get right now. The daily
 * reminder follows the subscriber's chosen time in their own zone; hilula and
 * omer follow Israel's nightfall, when the Hebrew day they belong to begins.
 */
export function dueKinds(now: Date, sub: SubscriptionPrefs, ctx: DayContext): PushKind[] {
  const clock = localClock(now, sub.timeZone);
  const kinds: PushKind[] = [];
  if (sub.daily && isDue(clock, sub.dailyMinutes, sub.lastDailyDay)) kinds.push('daily');
  const il = localClock(now, DEFAULT_TIME_ZONE);
  if (sub.hilula && ctx.hilulaDay !== null && sub.lastHilulaDay !== ctx.hilulaDay
    && isDue(il, ctx.nightfallMinutes, null)) kinds.push('hilula');
  if (sub.omer && ctx.omerTonight !== null && isDue(il, ctx.nightfallMinutes, sub.lastOmerDay)) kinds.push('omer');
  return kinds;
}

/** "HH:MM" for a minutes-after-midnight value. */
export function formatMinutes(m: number): string {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

/** Inverse of formatMinutes, snapped to the grid; null for malformed input. */
export function parseTime(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const m = Number(match[1]) * 60 + Number(match[2]);
  return normalizeMinutes(Math.round(m / MINUTE_STEP) * MINUTE_STEP % 1440);
}
