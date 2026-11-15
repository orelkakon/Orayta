import { jerusalemSunTimes, sunAt } from '@/lib/siddur/calendar';
import { candlesMinutes } from '@/lib/myPlace';

/**
 * Shabbat in the home hero: from Friday morning until Shabbat goes out, by the
 * real clock (pure, tested).
 *
 * Each city lights by its own custom before Friday's sunset — Jerusalem 40
 * minutes (as in `push/holy.ts` and `chanukah.ts`), Haifa 30, elsewhere 20 —
 * and Shabbat ends at צאת הכוכבים, the sun 8.5° below the horizon on
 * Saturday. Checked against Hebcal for every city (±1 min, winter and summer).
 * The hero's phase and countdown follow the visitor's place ("המקום שלי",
 * `lib/myPlace.ts`) when it is in Israel, otherwise Jerusalem.
 */
export type ShabbatPhase = 'erev' | 'shabbat';
export type CityId = 'jerusalem' | 'telaviv' | 'haifa' | 'beersheva' | 'tzfat' | 'eilat';

/** `mine` = the visitor's own place, named by `name`. */
export type CityKey = CityId | 'mine';

export interface ShabbatCity { id: CityKey; lat: number; lng: number; candlesMin: number; name?: string }

/** The hero shows the first two; the shared clip shows all. */
export const SHABBAT_CITIES: ShabbatCity[] = [
  { id: 'jerusalem', lat: 31.769, lng: 35.2163, candlesMin: 40 },
  { id: 'telaviv', lat: 32.0809, lng: 34.7806, candlesMin: 20 },
  { id: 'haifa', lat: 32.813, lng: 34.9993, candlesMin: 30 },
  { id: 'beersheva', lat: 31.2518, lng: 34.7913, candlesMin: 20 },
  { id: 'tzfat', lat: 32.9646, lng: 35.496, candlesMin: 20 },
  { id: 'eilat', lat: 29.5581, lng: 34.9482, candlesMin: 20 },
];

export interface CityTimes { id: CityKey; candles: Date; ends: Date; name?: string }

export interface ShabbatStatus {
  phase: ShabbatPhase;
  /** The hero's clock: the visitor's place, or Jerusalem. */
  candles: Date;
  ends: Date;
  /** The six fixed cities (the shared clip). */
  cities: CityTimes[];
  /** The two the hero's luach shows: the visitor's place + Jerusalem, or Jerusalem + Tel Aviv. */
  heroCities: CityTimes[];
  /** Whole minutes left until candle lighting there (0 once Shabbat has come in). */
  minutesToCandles: number;
  /** 0…1: Friday's daylight from sunrise to candle lighting there. */
  dayProgress: number;
}

const TZ = 'Asia/Jerusalem';
const DAY_MS = 86_400_000;
const MIN = 60_000;
export const TZEIT_ALTITUDE = -8.5;
const SUNSET_ALTITUDE = -0.833;

const weekdayOf = (d: Date) =>
  ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short' }).format(d));

/**
 * A city's times for the Shabbat whose Friday is `friday`'s date (Israel).
 * Whole minutes: candle lighting at the earlier minute (the strict side), the end at the
 * nearest (our sun is ~1 min behind Hebcal's, so rounding up would read 2 min late).
 */
export function cityTimes(friday: Date, city: ShabbatCity): CityTimes {
  const fri = sunAt(friday, SUNSET_ALTITUDE, city.lat, city.lng);
  const saturday = new Date(fri.noon.getTime() + DAY_MS);
  const ends = sunAt(saturday, TZEIT_ALTITUDE, city.lat, city.lng).sunset.getTime();
  return {
    id: city.id,
    ...(city.name ? { name: city.name } : {}),
    candles: new Date(Math.floor((fri.sunset.getTime() - city.candlesMin * MIN) / MIN) * MIN),
    ends: new Date(Math.round(ends / MIN) * MIN),
  };
}

export const allCityTimes = (friday: Date) => SHABBAT_CITIES.map(c => cityTimes(friday, c));

/** The visitor's place as a Shabbat city (its candle-lighting custom by name). */
export const placeCity = (p: { lat: number; lng: number; name: string }): ShabbatCity =>
  ({ id: 'mine', lat: p.lat, lng: p.lng, candlesMin: candlesMinutes(p.name), name: p.name });

/**
 * Null outside Friday and Shabbat (and once Shabbat has gone out at the hero's
 * place). `mine` = the visitor's place in Israel; without it, Jerusalem.
 */
export function shabbatStatus(now: Date, mine?: ShabbatCity): ShabbatStatus | null {
  const wd = weekdayOf(now);
  if (wd !== 5 && wd !== 6) return null;
  const friday = wd === 5 ? now : new Date(jerusalemSunTimes(now).noon.getTime() - DAY_MS);
  const cities = allCityTimes(friday);
  const isJerusalem = !mine || mine.name === 'ירושלים';
  const local = isJerusalem ? cities[0] : cityTimes(friday, mine);
  const heroCities = isJerusalem ? [cities[0], cities[1]] : [local, cities[0]];
  const { candles, ends } = local;
  const t = now.getTime();
  if (t >= ends.getTime()) return null;
  const left = Math.max(0, Math.ceil((candles.getTime() - t) / MIN));
  const at = mine ?? SHABBAT_CITIES[0];
  const sunrise = sunAt(friday, SUNSET_ALTITUDE, at.lat, at.lng).sunrise.getTime();
  const dayProgress = Math.min(1, Math.max(0, (t - sunrise) / (candles.getTime() - sunrise)));
  return { phase: left > 0 ? 'erev' : 'shabbat', candles, ends, cities, heroCities, minutesToCandles: left, dayProgress };
}

/**
 * `/?shabbat=1` previews the hero as if today were Friday at this same clock
 * time; `?shabbat=2` as if Shabbat had just come in.
 */
export function shabbatPreview(now: Date, mode: number, mine?: ShabbatCity): ShabbatStatus | null {
  if (mode !== 1 && mode !== 2) return null;
  const ahead = (5 - weekdayOf(now) + 7) % 7;
  const friday = new Date(now.getTime() + ahead * DAY_MS);
  if (mode === 1) return shabbatStatus(friday, mine);
  return shabbatStatus(new Date(cityTimes(friday, mine ?? SHABBAT_CITIES[0]).candles.getTime() + 30 * MIN), mine);
}

/** Hours and minutes until candle lighting, for the countdown. */
export function countdownParts(minutes: number): { h: number; m: number } {
  return { h: Math.floor(minutes / 60), m: minutes % 60 };
}
