import type { ServiceId } from './types';

/**
 * Hebrew-calendar facts that change the weekday prayers, computed in Israel
 * time with the runtime's Intl Hebrew calendar (minhag Eretz Yisrael and
 * nusach Edot HaMizrach: one day of Chol HaMoed, no tachanun from Erev Yom
 * Kippur to the end of Tishrei, …).
 */
export type HebMonth =
  | 'Tishri' | 'Heshvan' | 'Kislev' | 'Tevet' | 'Shevat' | 'Adar' | 'Adar I' | 'Adar II'
  | 'Nisan' | 'Iyar' | 'Sivan' | 'Tamuz' | 'Av' | 'Elul';

export interface HebDate { day: number; month: HebMonth; }

export type Occasion =
  | 'rosh-chodesh' | 'chanukah' | 'purim' | 'chol-hamoed' | 'chol-hamoed-sukkot'
  | 'fast' | 'fast-gedalia' | 'fast-tevet' | 'fast-esther' | 'fast-tammuz' | 'tisha-bav'
  | 'aseret' | 'after-yk' | 'winter' | 'motzash' | 'friday' | 'mon-thu';

export interface PrayerDay {
  service: ServiceId;
  /** The instant whose Hebrew date this prayer-day uses (tomorrow for an evening arvit). */
  at: Date;
  /** Weekday of the Hebrew day this service belongs to (0 = Sunday). */
  weekday: number;
  heb: HebDate | null;
  occasions: Set<Occasion>;
  /** 1–8 during Chanukah. */
  chanukahDay: number | null;
  /** 1–49 during the Omer: the count of this Hebrew day (its night opens it). */
  omerDay: number | null;
  tachanun: boolean;
  /** Why tachanun is not said (null when it is). */
  noTachanunReason: string | null;
}

const TZ = 'Asia/Jerusalem';
const DAY_MS = 86400000;
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const hebFmt = (() => {
  try { return new Intl.DateTimeFormat('en-u-ca-hebrew', { timeZone: TZ, day: 'numeric', month: 'long' }); }
  catch { return null; }
})();

export function hebrewDate(d: Date): HebDate | null {
  if (!hebFmt) return null;
  const parts = hebFmt.formatToParts(d);
  const month = parts.find(p => p.type === 'month')?.value as HebMonth | undefined;
  const day = Number(parts.find(p => p.type === 'day')?.value);
  return month && day ? { day, month } : null;
}

function weekdayOf(d: Date): number {
  return Math.max(0, WEEKDAYS.indexOf(new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short' }).format(d)));
}

const israelHour = (d: Date) => Number(new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', hourCycle: 'h23' }).format(d));

const isAdar = (m: HebMonth) => m === 'Adar' || m === 'Adar II';
const is = (h: HebDate, month: HebMonth, ...days: number[]) => h.month === month && days.includes(h.day);

/** Day of Chanukah (25 Kislev … 2/3 Tevet), or null. */
function chanukahDayOf(d: Date): number | null {
  for (let k = 0; k < 8; k++) {
    const h = hebrewDate(new Date(d.getTime() - k * DAY_MS));
    if (h && is(h, 'Kislev', 25)) return k + 1;
  }
  return null;
}

/** Public fasts, with Shabbat postponements (Esther moves back to Thursday). */
function fastOf(h: HebDate, wd: number): Occasion | null {
  if ((is(h, 'Tishri', 3) && wd !== 6) || (is(h, 'Tishri', 4) && wd === 0)) return 'fast-gedalia';
  if (is(h, 'Tevet', 10)) return 'fast-tevet';
  if (isAdar(h.month) && ((h.day === 13 && wd !== 6) || (h.day === 11 && wd === 4))) return 'fast-esther';
  if ((is(h, 'Tamuz', 17) && wd !== 6) || (is(h, 'Tamuz', 18) && wd === 0)) return 'fast-tammuz';
  if ((is(h, 'Av', 9) && wd !== 6) || (is(h, 'Av', 10) && wd === 0)) return 'tisha-bav';
  return null;
}

/** Day of the Omer (1–49) that a Hebrew day belongs to: 16 Nisan … 5 Sivan. */
export function omerDayOf(h: HebDate): number | null {
  if (h.month === 'Nisan' && h.day >= 16) return h.day - 15;
  if (h.month === 'Iyar') return h.day + 15;
  if (h.month === 'Sivan' && h.day <= 5) return h.day + 44;
  return null;
}

function isWinter(h: HebDate): boolean {
  // "ותן טל ומטר" in Israel: from 7 Cheshvan until Pesach.
  if (h.month === 'Heshvan') return h.day >= 7;
  if (h.month === 'Nisan') return h.day <= 14;
  return ['Kislev', 'Tevet', 'Shevat', 'Adar', 'Adar I', 'Adar II'].includes(h.month);
}

function noTachanunReason(h: HebDate, o: Set<Occasion>, service: ServiceId, wd: number): string | null {
  if (wd === 6) return 'שבת';
  if (o.has('rosh-chodesh')) return 'ראש חודש';
  if (o.has('chanukah')) return 'חנוכה';
  if (h.month === 'Nisan') return 'חודש ניסן';
  if (is(h, 'Iyar', 14)) return 'פסח שני';
  if (is(h, 'Iyar', 18)) return 'ל״ג בעומר';
  if (h.month === 'Sivan' && h.day <= 12) return 'מראש חודש סיון עד י״ב בו';
  if (is(h, 'Av', 9) || o.has('tisha-bav')) return 'תשעה באב';
  if (is(h, 'Av', 15)) return 'ט״ו באב';
  if (is(h, 'Elul', 29)) return 'ערב ראש השנה';
  if (is(h, 'Tishri', 1, 2)) return 'ראש השנה';
  if (h.month === 'Tishri' && h.day >= 9) return 'מערב יום הכיפורים עד סוף תשרי';
  if (is(h, 'Shevat', 15)) return 'ט״ו בשבט';
  if (isAdar(h.month) && (h.day === 14 || h.day === 15)) return h.day === 14 ? 'פורים' : 'שושן פורים';
  if (h.month === 'Adar I' && (h.day === 14 || h.day === 15)) return 'פורים קטן';
  if (service === 'mincha' && wd === 5) return 'מנחה של ערב שבת';
  return null;
}

/**
 * The prayer-day for a service opened at `now`. Arvit belongs to the next
 * Hebrew day, so from midday on it is computed for tomorrow.
 */
export function prayerDay(now: Date, service: ServiceId): PrayerDay {
  const at = service === 'arvit' && israelHour(now) >= 12 ? new Date(now.getTime() + DAY_MS) : now;
  const wd = weekdayOf(at);
  const heb = hebrewDate(at);
  const o = new Set<Occasion>();
  if (wd === 1 || wd === 4) o.add('mon-thu');
  if (service === 'arvit' && wd === 0) o.add('motzash');
  if (service === 'mincha' && wd === 5) o.add('friday');

  const chanukahDay = chanukahDayOf(at);
  if (heb) {
    if (heb.day === 30 || (heb.day === 1 && heb.month !== 'Tishri')) o.add('rosh-chodesh');
    if (chanukahDay) o.add('chanukah');
    if (isAdar(heb.month) && heb.day === 14) o.add('purim');
    if (is(heb, 'Nisan', 16, 17, 18, 19, 20)) o.add('chol-hamoed');
    if (is(heb, 'Tishri', 16, 17, 18, 19, 20, 21)) { o.add('chol-hamoed'); o.add('chol-hamoed-sukkot'); }
    if (heb.month === 'Tishri' && heb.day <= 10) o.add('aseret');
    if (is(heb, 'Tishri', 11)) o.add('after-yk');
    if (isWinter(heb)) o.add('winter');
    const fast = fastOf(heb, wd);
    if (fast) { o.add(fast); o.add('fast'); }
  }

  const reason = heb ? noTachanunReason(heb, o, service, wd) : null;
  const omerDay = heb ? omerDayOf(heb) : null;
  return { service, at, weekday: wd, heb, occasions: o, chanukahDay, omerDay, tachanun: reason === null, noTachanunReason: reason };
}
