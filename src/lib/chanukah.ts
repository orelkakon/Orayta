import { jerusalemSunTimes } from '@/lib/siddur/calendar';
import { chanukahDayOf } from '@/lib/siddur/occasions';

/**
 * The home menorah: how many candles stand in it right now and whether they
 * burn, by the real clock in Jerusalem (pure, tested).
 *
 * A night's candles are lit at nightfall (sunset + 25 min) — on Friday 40
 * minutes before sunset, ahead of the Shabbat candles, and on Saturday only
 * once Shabbat is out (sunset + 50 min) — and burn until sunrise. By day the
 * coming night's candles stand ready, unlit. The eighth day (זאת חנוכה) keeps
 * all eight burning until its evening.
 */
export type ChanukahWhen = 'tonight' | 'before-shabbat' | 'motzash';

export interface ChanukahStatus {
  /** 1–8: the candles in the menorah, besides the shamash. */
  candles: number;
  lit: boolean;
  /** Daytime of the eighth day. */
  zot: boolean;
  /** For unlit candles: when they will be lit. */
  when: ChanukahWhen;
}

const TZ = 'Asia/Jerusalem';
const DAY_MS = 86400000;
const MIN = 60000;
const NIGHTFALL_MIN = 25;
const BEFORE_SHABBAT_MIN = -40;
const AFTER_SHABBAT_MIN = 50;

const weekdayOf = (d: Date) =>
  ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short' }).format(d));

export function chanukahStatus(now: Date): ChanukahStatus | null {
  const { sunrise, sunset } = jerusalemSunTimes(now);
  const t = now.getTime();
  const today = chanukahDayOf(now);
  // Until sunrise the night still belongs to this civil date's Hebrew day.
  if (t < sunrise.getTime()) return today ? { candles: today, lit: true, zot: false, when: 'tonight' } : null;

  const wd = weekdayOf(now);
  const when: ChanukahWhen = wd === 5 ? 'before-shabbat' : wd === 6 ? 'motzash' : 'tonight';
  const offset = wd === 5 ? BEFORE_SHABBAT_MIN : wd === 6 ? AFTER_SHABBAT_MIN : NIGHTFALL_MIN;
  const tonight = chanukahDayOf(new Date(t + DAY_MS));
  if (tonight) return { candles: tonight, lit: t >= sunset.getTime() + offset * MIN, zot: false, when };
  if (today === 8 && t < sunset.getTime()) return { candles: 8, lit: true, zot: true, when };
  return null;
}

/** Holder index (0 = leftmost of nine, 4 = the shamash) of candle n: placed from the right. */
export function candleSlot(n: number): number {
  return n <= 4 ? 9 - n : 8 - n;
}
