import { jerusalemDay } from '@/lib/adminStatsUtils';

/**
 * The day "היומי" belongs to — pure, shared by /today (client), the daily
 * sikum API and the server-rendered story image, so all three pick the same
 * items. The day is the Israel calendar date; its number is that date's day
 * count since the epoch, the same index /today has always used.
 */

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

/** 'YYYY-MM-DD' of `now` in Asia/Jerusalem. */
export const israelDayKey = (now: Date = new Date()): string => jerusalemDay(now);

/** A real calendar date in 'YYYY-MM-DD' form, else null. */
export function validDayKey(v: unknown): string | null {
  if (typeof v !== 'string' || !DAY_RE.test(v)) return null;
  const d = new Date(`${v}T12:00:00Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v ? null : v;
}

/** Days since 1970-01-01 for a day key. */
export function dayNumber(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

/** The item of the day: a stable rotation through the list. */
export function pickForDay<T>(list: T[], key: string): T | null {
  return list.length ? list[dayNumber(key) % list.length] : null;
}

/** `?date=` or `?d=` (the scheduler's cache buster), when it is a real date. */
export function dayParam(params: URLSearchParams): string | null {
  return validDayKey(params.get('date')) ?? validDayKey(params.get('d'));
}

/** Noon UTC of a day key: the same civil date in any zone from UTC−11 to UTC+11
 *  (used for the Hebrew date and Israel-date maths). */
export const dayKeyNoon = (key: string): Date => new Date(`${key}T12:00:00Z`);

/** A day key shifted by n days. */
export function addDayKey(key: string, n: number): string {
  const d = dayKeyNoon(key);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** 0 = Sunday … 6 = Saturday, for a day key. */
export const weekdayOfKey = (key: string): number => dayKeyNoon(key).getUTCDay();
