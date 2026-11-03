import { HE } from '@/lib/hebrewTexts';
import { jerusalemSunTimes } from '@/lib/siddur/calendar';

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

const timeFmt = (d: Date) =>
  new Intl.DateTimeFormat('he-IL', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jerusalem' }).format(d);

export interface SunInfo {
  /** 0..1 between sunrise and sunset; null when the sun is down. */
  progress: number | null;
  /** The next sun event worth showing ("שקיעה 16:48"). */
  label: string;
}

export function sunInfo(now: Date): SunInfo {
  const { sunrise, sunset } = jerusalemSunTimes(now);
  const t = now.getTime();
  if (t < sunrise.getTime()) return { progress: null, label: HE.HOME_SUNRISE_AT(timeFmt(sunrise)) };
  if (t < sunset.getTime()) {
    const progress = (t - sunrise.getTime()) / (sunset.getTime() - sunrise.getTime());
    return { progress, label: HE.HOME_SUNSET_AT(timeFmt(sunset)) };
  }
  const tomorrow = jerusalemSunTimes(new Date(t + 86400000));
  return { progress: null, label: HE.HOME_SUNRISE_AT(timeFmt(tomorrow.sunrise)) };
}

/** "וירא" → "פרשת וירא" (Sefaria sometimes already includes the word). */
export function parashaLabel(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const name = raw.replace(/^פרשת\s+/, '').trim();
  return name ? HE.HOME_PARASHA(name) : null;
}
