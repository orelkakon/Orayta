import type { PrayerService } from './types';
import { HE } from '@/lib/hebrewTexts';

const MI = 'Weekday_Mincha';
const AR = 'Weekday_Arvit';

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
      id: 'amida', title: 'עמידה',
      parts: [
        { node: `${MI}, Amida`, from: 2, to: 50 },
        { node: `${MI}, Amida`, from: 51, to: 63, mark: 'ברכת כהנים (בתענית ציבור)' },
        { node: `${MI}, Amida`, from: 64, to: 72, mark: 'שים שלום ואלהי נצור' },
        { node: `${MI}, Amida`, from: 74, to: 105, mark: 'אבינו מלכנו', when: 'aseret', note: HE.SIDDUR_WHEN_ASERET },
        { node: `${MI}, Amida`, from: 107, to: 107, mark: 'יהי שם', when: 'optional', note: HE.SIDDUR_WHEN_NO_TACHANUN },
      ],
    },
    {
      id: 'tachanun', title: 'וידוי ותחנון', chip: 'תחנון', note: HE.SIDDUR_NOTE_TACHANUN,
      parts: [
        { node: `${MI}, Vidui`, from: 2, to: 5, mark: 'וידוי ושלוש עשרה מידות' },
        { node: `${MI}, Vidui`, from: 6, to: 10, mark: 'נפילת אפיים' },
        { node: `${MI}, Vidui`, from: 11, to: 24, mark: 'קדיש תתקבל ולמנצח' },
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
        { node: `${AR}, Barchu`, from: 3, to: 3, mark: 'ברכי נפשי', when: 'optional', note: HE.SIDDUR_WHEN_ROSH_CHODESH },
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
    { id: 'amida', title: 'עמידה', parts: [{ node: `${AR}, Amidah`, from: 2, to: 52 }] },
    {
      id: 'sium', title: 'קדיש ושיר המעלות', chip: 'שיר המעלות',
      parts: [
        { node: `${AR}, Amidah`, from: 54, to: 61, mark: 'ויהי נועם', when: 'motzash', note: HE.SIDDUR_WHEN_MOTZASH },
        { node: `${AR}, Amidah`, from: 62, to: 66, mark: 'קדיש תתקבל' },
        { node: `${AR}, Amidah`, from: 67, to: 73, mark: 'שיר למעלות וברכו' },
      ],
    },
    { id: 'alenu', title: 'עלינו לשבח', chip: 'עלינו', parts: [{ node: `${AR}, Alenu`, from: 2, to: 4 }] },
  ],
};
