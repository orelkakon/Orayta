import { jerusalemSunAt, jerusalemSunTimes } from '@/lib/siddur/calendar';

/**
 * Shabbat in the home hero: from Friday morning until Shabbat goes out, by the
 * real clock in Jerusalem (pure, tested).
 *
 * Candle lighting is 40 minutes before Friday's sunset (Jerusalem custom, as
 * in `push/holy.ts` and `chanukah.ts`); Shabbat ends at צאת הכוכבים, the sun
 * 8.5° below the horizon on Saturday; Rabbeinu Tam 72 minutes after sunset.
 */
export type ShabbatPhase = 'erev' | 'shabbat';

export interface ShabbatStatus {
  phase: ShabbatPhase;
  candles: Date;
  ends: Date;
  rabbeinuTam: Date;
  /** Whole minutes left until candle lighting (0 once Shabbat has come in). */
  minutesToCandles: number;
}

const TZ = 'Asia/Jerusalem';
const DAY_MS = 86_400_000;
const MIN = 60_000;
export const CANDLES_BEFORE_SUNSET_MIN = 40;
export const TZEIT_ALTITUDE = -8.5;
export const RABBEINU_TAM_MIN = 72;

const weekdayOf = (d: Date) =>
  ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short' }).format(d));

/** The three times of the Shabbat whose Friday is `friday`'s date in Jerusalem. */
export function shabbatTimes(friday: Date) {
  const fri = jerusalemSunTimes(friday);
  const saturday = new Date(fri.noon.getTime() + DAY_MS);
  const satSunset = jerusalemSunTimes(saturday).sunset.getTime();
  // Whole minutes, erring on the strict side: light at the earlier minute, end at the later one.
  return {
    candles: new Date(Math.floor((fri.sunset.getTime() - CANDLES_BEFORE_SUNSET_MIN * MIN) / MIN) * MIN),
    ends: new Date(Math.ceil(jerusalemSunAt(saturday, TZEIT_ALTITUDE).sunset.getTime() / MIN) * MIN),
    rabbeinuTam: new Date(Math.ceil((satSunset + RABBEINU_TAM_MIN * MIN) / MIN) * MIN),
  };
}

/** Null outside Friday and Shabbat (and once Shabbat has gone out). */
export function shabbatStatus(now: Date): ShabbatStatus | null {
  const wd = weekdayOf(now);
  if (wd !== 5 && wd !== 6) return null;
  const friday = wd === 5 ? now : new Date(jerusalemSunTimes(now).noon.getTime() - DAY_MS);
  const times = shabbatTimes(friday);
  const t = now.getTime();
  if (t >= times.ends.getTime()) return null;
  const left = Math.max(0, Math.ceil((times.candles.getTime() - t) / MIN));
  return { ...times, phase: left > 0 ? 'erev' : 'shabbat', minutesToCandles: left };
}

/**
 * `/?shabbat=1` previews the hero as if today were Friday at this same clock
 * time; `?shabbat=2` as if Shabbat had just come in.
 */
export function shabbatPreview(now: Date, mode: number): ShabbatStatus | null {
  if (mode !== 1 && mode !== 2) return null;
  const ahead = (5 - weekdayOf(now) + 7) % 7;
  const friday = new Date(now.getTime() + ahead * DAY_MS);
  if (mode === 1) return shabbatStatus(friday);
  return shabbatStatus(new Date(shabbatTimes(friday).candles.getTime() + 30 * MIN));
}

/** Hours and minutes until candle lighting, for the countdown. */
export function countdownParts(minutes: number): { h: number; m: number } {
  return { h: Math.floor(minutes / 60), m: minutes % 60 };
}
