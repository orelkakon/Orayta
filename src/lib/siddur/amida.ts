import type { PrayerPart } from './types';
import { fill } from './parts';
import { HE } from '@/lib/hebrewTexts';

// Inserts inside each weekday Amida (segment numbers per Sefaria node).
// Everything not listed is the fixed text and is filled in by `fill`.

const BARCHENU = { mark: 'ברכנו', when: 'summer', note: HE.SIDDUR_WHEN_SUMMER } as const;
const BARECH = { mark: 'ברך עלינו', when: 'winter', note: HE.SIDDUR_WHEN_WINTER } as const;
const ANEINU = { mark: 'עננו', when: 'fast', note: HE.SIDDUR_WHEN_FAST } as const;
const ANEINU_CHAZAN = { mark: 'עננו בחזרת הש״ץ', when: 'fast', note: HE.SIDDUR_WHEN_FAST } as const;
const YAALE = { mark: 'יעלה ויבוא', when: 'yaale', note: HE.SIDDUR_WHEN_YAALE } as const;
const AL_HANISIM = { mark: 'על הניסים', when: 'al-hanisim', note: HE.SIDDUR_WHEN_AL_HANISIM } as const;
const BIMEI_MATITYAHU = { mark: 'בימי מתתיהו', when: 'chanukah', note: HE.SIDDUR_WHEN_CHANUKAH } as const;
const BIMEI_MORDECHAI = { mark: 'בימי מרדכי ואסתר', when: 'purim', note: HE.SIDDUR_WHEN_PURIM } as const;
const AVINU_MALKENU = { mark: 'אבינו מלכנו', when: 'aseret', note: HE.SIDDUR_WHEN_ASERET } as const;
const YEHI_SHEM = { mark: 'יהי שם', when: 'no-tachanun', note: HE.SIDDUR_WHEN_NO_TACHANUN } as const;

const SH = 'Weekday_Shacharit, Amida';
export const SHACHARIT_AMIDA: PrayerPart[] = fill(SH, 2, 108, [
  { from: 15, to: 17, ...ANEINU_CHAZAN },
  { from: 19, to: 20, ...BARCHENU },
  { from: 21, to: 22, ...BARECH },
  { from: 30, to: 31, ...ANEINU },
  { from: 34, to: 39, ...YAALE },
  { from: 46, to: 47, ...AL_HANISIM },
  { from: 48, to: 48, ...BIMEI_MATITYAHU },
  { from: 49, to: 49, ...BIMEI_MORDECHAI },
  { from: 51, to: 65, mark: 'ברכת כהנים' },
  { from: 66, to: 73, mark: 'שים שלום ואלהי נצור' },
  { from: 74, to: 106, ...AVINU_MALKENU },
  { from: 107, to: 108, ...YEHI_SHEM },
]);

const MI = 'Weekday_Mincha, Amida';
export const MINCHA_AMIDA: PrayerPart[] = fill(MI, 2, 107, [
  { from: 14, to: 16, ...ANEINU_CHAZAN },
  { from: 18, to: 19, ...BARCHENU },
  { from: 20, to: 21, ...BARECH },
  { from: 27, to: 28, mark: 'נחם', when: 'tisha-bav', note: HE.SIDDUR_WHEN_TISHA_BAV },
  { from: 29, to: 29, mark: 'בונה ירושלים', when: 'not-tisha-bav', note: HE.SIDDUR_WHEN_NOT_TISHA_BAV },
  { from: 32, to: 33, ...ANEINU },
  { from: 36, to: 41, ...YAALE },
  { from: 46, to: 47, ...AL_HANISIM },
  { from: 48, to: 48, ...BIMEI_MATITYAHU },
  { from: 49, to: 49, ...BIMEI_MORDECHAI },
  { from: 51, to: 63, mark: 'ברכת כהנים', when: 'fast', note: HE.SIDDUR_WHEN_FAST_KOHANIM },
  { from: 64, to: 72, mark: 'שים שלום ואלהי נצור' },
  { from: 73, to: 105, ...AVINU_MALKENU },
  { from: 106, to: 107, ...YEHI_SHEM },
]);

const AR = 'Weekday_Arvit, Amidah';
export const ARVIT_AMIDA: PrayerPart[] = fill(AR, 2, 52, [
  { from: 9, to: 10, mark: 'אתה חוננתנו', when: 'motzash', note: HE.SIDDUR_WHEN_MOTZASH },
  { from: 16, to: 17, ...BARCHENU },
  { from: 18, to: 19, ...BARECH },
  { from: 27, to: 28, mark: 'עננו', when: 'tisha-bav', note: HE.SIDDUR_WHEN_TISHA_BAV_NIGHT },
  { from: 31, to: 36, ...YAALE },
  { from: 40, to: 41, ...AL_HANISIM },
  { from: 42, to: 42, ...BIMEI_MATITYAHU },
  { from: 43, to: 43, ...BIMEI_MORDECHAI },
]);

/** Hallel: half on Rosh Chodesh / Chol HaMoed Pesach, whole on Chanukah / Sukkot. */
const FULL = { when: 'full-hallel', note: HE.SIDDUR_WHEN_FULL_HALLEL } as const;
export const HALLEL: PrayerPart[] = fill('Rosh_Hodesh, Hallel', 2, 34, [
  { from: 2, to: 5, mark: 'ברכת ההלל', ...FULL },
  { from: 8, to: 9, mark: 'לא לנו', ...FULL },
  { from: 11, to: 12, mark: 'אהבתי', ...FULL },
  { from: 24, to: 25, mark: 'יהללוך', ...FULL },
  { from: 26, to: 34, mark: 'קדיש תתקבל' },
]);
