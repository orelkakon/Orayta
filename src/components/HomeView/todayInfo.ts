import { HE } from '@/lib/hebrewTexts';
import { sunAt } from '@/lib/siddur/calendar';

/** Pure helpers for the home "today" hero. */

export function greeting(now: Date): string {
  const h = now.getHours();
  if (h < 5) return HE.HOME_GREETING_DAWN;
  if (h < 12) return HE.HOME_GREETING_MORNING;
  if (h < 17) return HE.HOME_GREETING_NOON;
  if (h < 21) return HE.HOME_GREETING_EVENING;
  return HE.HOME_GREETING_NIGHT;
}

export function weekdayName(now: Date): string {
  try {
    return new Intl.DateTimeFormat('he-IL', { weekday: 'long', timeZone: 'Asia/Jerusalem' }).format(now);
  } catch {
    return '';
  }
}

/** 'HH:MM' in Jerusalem. */
export const timeFmt = (d: Date) =>
  new Intl.DateTimeFormat('he-IL', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jerusalem' }).format(d);

export interface SunInfo {
  /** 0..1 between sunrise and sunset; null when the sun is down. */
  progress: number | null;
  /** The next sun event worth showing ("שקיעה 16:48"). */
  label: string;
}

/** Jerusalem, where the hero's sun stands when the visitor has no place in Israel. */
export const JERUSALEM = { lat: 31.778, lng: 35.235 };
const SUNSET_ALT = -0.833;

export function sunInfo(now: Date, at: { lat: number; lng: number } = JERUSALEM): SunInfo {
  const sunTimes = (d: Date) => sunAt(d, SUNSET_ALT, at.lat, at.lng);
  const { sunrise, sunset } = sunTimes(now);
  const t = now.getTime();
  if (t < sunrise.getTime()) return { progress: null, label: HE.HOME_SUNRISE_AT(timeFmt(sunrise)) };
  if (t < sunset.getTime()) {
    const progress = (t - sunrise.getTime()) / (sunset.getTime() - sunrise.getTime());
    return { progress, label: HE.HOME_SUNSET_AT(timeFmt(sunset)) };
  }
  const tomorrow = sunTimes(new Date(t + 86400000));
  return { progress: null, label: HE.HOME_SUNRISE_AT(timeFmt(tomorrow.sunrise)) };
}

/** "וירא" → "פרשת וירא" (Sefaria sometimes already includes the word). */
export function parashaLabel(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const name = raw.replace(/^פרשת\s+/, '').trim();
  return name ? HE.HOME_PARASHA(name) : null;
}
