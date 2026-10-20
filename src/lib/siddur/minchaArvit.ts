import type { PrayerService, PrayerPart } from './types';
import { MINCHA_AMIDA, ARVIT_AMIDA } from './amida';
import { HE } from '@/lib/hebrewTexts';

const MI = 'Weekday_Mincha';
const AR = 'Weekday_Arvit';
const TR = 'Weekday_Shacharit, Torah_Reading';
const OM = 'Counting_of_the_Omer';

// Sefaria's omer node: 2–4 opening + bracha ("…הַיּוֹם"), then per day n a
// date line (3n+2), the count (3n+3) and its sefira (3n+4); 152–161 close.
const OMER_DAYS: PrayerPart[] = Array.from({ length: 49 }, (_, i) => ({
  node: OM, from: 3 * (i + 1) + 3, to: 3 * (i + 1) + 4,
  when: `omer-${i + 1}` as const, only: true, mark: HE.OMER_SIDDUR_MARK(i + 1),
}));

export const MINCHA: PrayerService = {
  id: 'mincha',
  title: HE.SIDDUR_MINCHA,
  icon: 'sun',
  highlights: HE.SIDDUR_MINCHA_HIGHLIGHTS,
  sections: [
    {
      id: 'korbanot', title: 'קרבנות',
      parts: [
        { node: `${MI}, Offerings`, from: 2, to: 3, mark: 'למנצח על הגתית' },
        { node: `${MI}, Offerings`, from: 4, to: 4, mark: 'קרבן התמיד' },
        { node: `${MI}, Offerings`, from: 5, to: 11, mark: 'פטום הקטורת' },
      ],
    },
    {
      id: 'ashrei', title: 'אשרי',
      parts: [
        { node: `${MI}, Offerings`, from: 12, to: 13 },
        { node: `${MI}, Offerings`, from: 14, to: 16, mark: 'תכון תפלתי וחצי קדיש' },
      ],
    },
    {
      // On a public fast (including Tisha B'Av) mincha has "ויחל" before the Amida.
      id: 'torah-reading', title: 'קריאת התורה', when: 'fast', note: HE.SIDDUR_WHEN_FAST,
      parts: [
        { node: TR, from: 7, to: 18 },
        { node: 'Fast_Days_and_Mourning, Torah_Reading_for_Fast_Days', from: 2, to: 2, mark: HE.SIDDUR_FAST_READING },
        { node: TR, from: 19, to: 21, mark: 'חצי קדיש' },
      ],
    },
    { id: 'amida', title: 'עמידה', parts: MINCHA_AMIDA },
    {
      id: 'tachanun', title: 'תחנון וקדיש', chip: 'תחנון', note: HE.SIDDUR_NOTE_TACHANUN,
      parts: [
        { node: `${MI}, Vidui`, from: 2, to: 5, mark: 'וידוי ושלוש עשרה מידות', when: 'tachanun', note: HE.SIDDUR_WHEN_TACHANUN },
        { node: `${MI}, Vidui`, from: 6, to: 10, mark: 'נפילת אפיים', when: 'tachanun', note: HE.SIDDUR_WHEN_TACHANUN },
        { node: `${MI}, Vidui`, from: 11, to: 15, mark: 'קדיש תתקבל' },
        { node: `${MI}, Vidui`, from: 16, to: 17, mark: 'למנצח בנגינות', when: 'not-friday', note: HE.SIDDUR_WHEN_NOT_FRIDAY },
        { node: `${MI}, Vidui`, from: 18, to: 19, mark: 'ה׳ מלך', when: 'friday', note: HE.SIDDUR_WHEN_FRIDAY },
        { node: `${MI}, Vidui`, from: 20, to: 21, mark: 'תפלה לעני', when: 'fast', note: HE.SIDDUR_WHEN_FAST },
        { node: `${MI}, Vidui`, from: 22, to: 24, mark: 'קדיש יהא שלמא' },
      ],
    },
    { id: 'alenu', title: 'עלינו לשבח', chip: 'עלינו', parts: [{ node: `${MI}, Alenu`, from: 2, to: 4 }] },
  ],
};

export const ARVIT: PrayerService = {
  id: 'arvit',
  title: HE.SIDDUR_ARVIT,
  icon: 'moon',
  highlights: HE.SIDDUR_ARVIT_HIGHLIGHTS,
  sections: [
    {
      id: 'barchu', title: 'והוא רחום וברכו', chip: 'ברכו',
      parts: [
        { node: `${AR}, Barchu`, from: 2, to: 3, mark: 'ברכי נפשי', when: 'rosh-chodesh', note: HE.SIDDUR_WHEN_RC_NIGHT },
        { node: `${AR}, Barchu`, from: 4, to: 8 },
        { node: `${AR}, Barchu`, from: 9, to: 11, mark: 'ברכו' },
      ],
    },
    {
      id: 'birkot-shema', title: 'ברכות קריאת שמע', chip: 'ברכות ק״ש',
      parts: [
        { node: `${AR}, The_Shema`, from: 2, to: 2, mark: 'המעריב ערבים' },
        { node: `${AR}, The_Shema`, from: 3, to: 3, mark: 'אהבת עולם' },
      ],
    },
    {
      id: 'shema', title: 'קריאת שמע',
      parts: [
        { node: `${AR}, The_Shema`, from: 4, to: 9 },
        { node: `${AR}, The_Shema`, from: 10, to: 13, mark: 'אמת ואמונה והשכיבנו' },
      ],
    },
    { id: 'amida', title: 'עמידה', parts: ARVIT_AMIDA },
    {
      id: 'sium', title: 'קדיש ושיר המעלות', chip: 'שיר המעלות',
      parts: [
        { node: `${AR}, Amidah`, from: 54, to: 61, mark: 'ויהי נועם', when: 'motzash', note: HE.SIDDUR_WHEN_MOTZASH },
        { node: `${AR}, Amidah`, from: 62, to: 66, mark: 'קדיש תתקבל' },
        { node: `${AR}, Amidah`, from: 67, to: 73, mark: 'שיר למעלות וברכו' },
      ],
    },
    {
      id: 'omer', title: 'ספירת העומר', when: 'omer', note: HE.SIDDUR_WHEN_OMER,
      parts: [
        { node: OM, from: 2, to: 4 },
        ...OMER_DAYS,
        { node: OM, from: 152, to: 161, mark: 'הרחמן, למנצח ואנא בכח' },
      ],
    },
    { id: 'alenu', title: 'עלינו לשבח', chip: 'עלינו', parts: [{ node: `${AR}, Alenu`, from: 2, to: 4 }] },
  ],
};
