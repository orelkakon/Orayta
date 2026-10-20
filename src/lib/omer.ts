import { hebrewDate, omerDayOf } from './siddur/occasions';
import { jerusalemSunTimes } from './siddur/calendar';

/**
 * ספירת העומר — pure, Israel-time. The count of a Hebrew day is said on the
 * night that opens it (from sunset), so in the evening "tonight" is already
 * tomorrow's Hebrew date. Wording follows nusach Edot HaMizrach
 * ("…יָמִים לָעֹמֶר, שֶׁהֵם…"), matching Siddur_Edot_HaMizrach on Sefaria.
 */

const DAY_MS = 86400000;
const ALOT_MIN = 72;

export const SEFIROT = ['חסד', 'גבורה', 'תפארת', 'נצח', 'הוד', 'יסוד', 'מלכות'] as const;

const UNITS = ['', 'אֶחָד', 'שְׁנַיִם', 'שְׁלֹשָׁה', 'אַרְבָּעָה', 'חֲמִשָּׁה', 'שִׁשָּׁה', 'שִׁבְעָה', 'שְׁמוֹנָה', 'תִּשְׁעָה', 'עֲשָׂרָה'];
const TEENS = ['', 'אַחַד עָשָׂר', 'שְׁנֵים עָשָׂר', 'שְׁלֹשָׁה עָשָׂר', 'אַרְבָּעָה עָשָׂר', 'חֲמִשָּׁה עָשָׂר',
  'שִׁשָּׁה עָשָׂר', 'שִׁבְעָה עָשָׂר', 'שְׁמוֹנָה עָשָׂר', 'תִּשְׁעָה עָשָׂר'];
const TENS: Record<number, [string, string]> = {
  2: ['עֶשְׂרִים', 'וְעֶשְׂרִים'], 3: ['שְׁלֹשִׁים', 'וּשְׁלֹשִׁים'], 4: ['אַרְבָּעִים', 'וְאַרְבָּעִים'],
};
const REST = ['', 'וְיוֹם אֶחָד', 'וּשְׁנֵי יָמִים', 'וּשְׁלֹשָׁה יָמִים', 'וְאַרְבָּעָה יָמִים', 'וַחֲמִשָּׁה יָמִים', 'וְשִׁשָּׁה יָמִים'];

/** "יוֹם אֶחָד" · "שְׁנֵי יָמִים" · "עֲשָׂרָה יָמִים" · "אַחַד עָשָׂר יוֹם" · "שְׁנַיִם וְעֶשְׂרִים יוֹם". */
export function omerDaysPhrase(n: number): string {
  if (n === 1) return 'יוֹם אֶחָד';
  if (n === 2) return 'שְׁנֵי יָמִים';
  if (n <= 10) return `${UNITS[n]} יָמִים`;
  if (n < 20) return `${TEENS[n - 10]} יוֹם`;
  const [tens, joined] = TENS[Math.floor(n / 10)];
  const u = n % 10;
  return u === 0 ? `${tens} יוֹם` : `${UNITS[u]} ${joined} יוֹם`;
}

function weeksPhrase(w: number): string {
  if (w === 1) return 'שָׁבוּעַ אֶחָד';
  if (w === 2) return 'שְׁנֵי שָׁבוּעוֹת';
  return `${UNITS[w]} שָׁבוּעוֹת`;
}

export interface OmerCount {
  day: number;
  weeks: number;
  /** Days past the full weeks (0–6). */
  rest: number;
  /** The count itself, without the opening "הַיּוֹם". */
  text: string;
  /** "גבורה שבתפארת". */
  sefira: string;
}

/** The count for day 1–49 (null outside that range). */
export function omerCount(day: number): OmerCount | null {
  if (!Number.isInteger(day) || day < 1 || day > 49) return null;
  const weeks = Math.floor(day / 7);
  const rest = day % 7;
  let text = `${omerDaysPhrase(day)} לָעֹמֶר`;
  if (weeks > 0) text += `, שֶׁהֵם ${weeksPhrase(weeks)}${rest ? ` ${REST[rest]}` : ''}`;
  const sefira = `${SEFIROT[(day - 1) % 7]} שב${SEFIROT[Math.floor((day - 1) / 7)]}`;
  return { day, weeks, rest, text: `${text}:`, sefira };
}

export interface OmerStatus {
  /** Between sunset and dawn (Jerusalem). */
  isNight: boolean;
  /** The count of the current night, or of the night ahead during the day. */
  tonight: number | null;
  /** During the day: last night's count — if it was forgotten, it is said now without a bracha. */
  today: number | null;
}

export function omerStatus(now: Date): OmerStatus {
  const { sunrise, sunset } = jerusalemSunTimes(now);
  const t = now.getTime();
  const heb = hebrewDate(now);
  const next = hebrewDate(new Date(t + DAY_MS));
  const day = heb ? omerDayOf(heb) : null;
  const nextDay = next ? omerDayOf(next) : null;
  if (t >= sunset.getTime()) return { isNight: true, tonight: nextDay, today: null };
  if (t < sunrise.getTime() - ALOT_MIN * 60000) return { isNight: true, tonight: day, today: null };
  return { isNight: false, tonight: nextDay, today: day };
}

/** Tonight's count (the current night's after sunset) — null when no count is due. */
export function getOmerDay(date: Date): number | null {
  return omerStatus(date).tonight;
}

/**
 * The civil day (noon, Israel) of the next 15 Nisan, whose evening opens the
 * count — null while the Omer is running.
 */
export function nextOmerStart(now: Date): Date | null {
  const s = omerStatus(now);
  if (s.tonight !== null || s.today !== null) return null;
  for (let k = 0; k < 400; k++) {
    const d = new Date(now.getTime() + k * DAY_MS);
    const h = hebrewDate(d);
    if (h && h.month === 'Nisan' && h.day === 15) return d;
  }
  return null;
}

/* ── Personal check-off ("ספרתי"), kept per device by Hebrew year ── */

/** Consecutive counted days ending at `current` (or the day before it, until tonight is marked). */
export function omerStreak(counted: number[], current: number): number {
  const set = new Set(counted);
  let d = set.has(current) ? current : current - 1;
  let n = 0;
  while (d >= 1 && set.has(d)) { n++; d--; }
  return n;
}

/** The first unmarked day after the user started marking and before `current` — null if none. */
export function omerGap(counted: number[], current: number): number | null {
  if (counted.length === 0) return null;
  const set = new Set(counted);
  for (let d = Math.min(...counted) + 1; d < current; d++) if (!set.has(d)) return d;
  return null;
}
