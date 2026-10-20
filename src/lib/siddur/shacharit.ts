import type { PrayerService } from './types';
import { HE } from '@/lib/hebrewTexts';

// Segment numbers were mapped against Sefaria's Siddur Edot HaMizrach
// (segment 1 of each node is its title and is skipped).
const PREP = 'Preparatory_Prayers';
const SH = 'Weekday_Shacharit';

export const SHACHARIT: PrayerService = {
  id: 'shacharit',
  title: HE.SIDDUR_SHACHARIT,
  icon: 'sunrise',
  highlights: HE.SIDDUR_SHACHARIT_HIGHLIGHTS,
  sections: [
    {
      id: 'birkot-hashachar', title: 'ברכות השחר',
      parts: [
        { node: `${PREP}, Modeh_Ani`, from: 2, to: 4, mark: 'מודה אני' },
        { node: `${PREP}, Morning_Blessings`, from: 2, to: 5, mark: 'נטילת ידיים ואשר יצר' },
        { node: `${PREP}, Morning_Blessings`, from: 6, to: 7, mark: 'אלהי נשמה' },
        { node: `${PREP}, Morning_Blessings`, from: 8, to: 27, mark: 'ברכות השחר' },
      ],
    },
    { id: 'birkot-hatorah', title: 'ברכות התורה', parts: [{ node: `${PREP}, Torah_Blessings`, from: 2, to: 5 }] },
    {
      id: 'tzitzit-tefillin', title: 'ציצית ותפילין',
      parts: [
        { node: `${SH}, Order_of_Talit`, from: 2, to: 3, mark: 'עטיפת ציצית' },
        { node: `${SH}, Order_of_Tefillin`, from: 2, to: 6, mark: 'הנחת תפילין' },
      ],
    },
    {
      id: 'korbanot', title: 'עקדה וקרבנות', chip: 'קרבנות',
      parts: [
        { node: `${SH}, Morning_Prayer`, from: 2, to: 10, mark: 'פרשת העקדה' },
        { node: `${SH}, Morning_Prayer`, from: 11, to: 19, mark: 'לעולם יהא אדם וקרבן התמיד' },
        { node: `${SH}, Incense_Offering`, from: 2, to: 9, mark: 'פטום הקטורת' },
        { node: `${SH}, Incense_Offering`, from: 10, to: 20, mark: 'אנא בכח' },
        { node: `${SH}, Incense_Offering`, from: 21, to: 31, mark: 'איזהו מקומן ורבי ישמעאל' },
        { node: `${SH}, Incense_Offering`, from: 32, to: 35, mark: 'קדיש על ישראל' },
      ],
    },
    {
      id: 'hodu', title: 'הודו',
      parts: [
        { node: `${SH}, Hodu`, from: 2, to: 13 },
        { node: `${SH}, Hodu`, from: 14, to: 15, mark: 'למנצח בצורת המנורה' },
      ],
    },
    {
      id: 'pesukei-dezimra', title: 'פסוקי דזמרה',
      parts: [
        { node: `${SH}, Pesukei_D'Zimra`, from: 2, to: 2, mark: 'ברוך שאמר' },
        { node: `${SH}, Pesukei_D'Zimra`, from: 3, to: 5, mark: 'מזמור לתודה ויהי כבוד' },
        { node: `${SH}, Pesukei_D'Zimra`, from: 6, to: 12, mark: 'אשרי והללויה' },
        { node: `${SH}, Pesukei_D'Zimra`, from: 13, to: 18, mark: 'ויברך דוד ושירת הים' },
        { node: `${SH}, Pesukei_D'Zimra`, from: 19, to: 19, mark: 'ישתבח' },
        { node: `${SH}, Pesukei_D'Zimra`, from: 21, to: 21, mark: 'שיר המעלות ממעמקים', when: 'aseret', note: HE.SIDDUR_WHEN_ASERET },
        { node: `${SH}, Pesukei_D'Zimra`, from: 22, to: 26, mark: 'חצי קדיש וברכו' },
      ],
    },
    {
      id: 'birkot-shema', title: 'ברכות קריאת שמע', chip: 'ברכות ק״ש',
      parts: [
        { node: `${SH}, The_Shema`, from: 2, to: 6, mark: 'יוצר אור' },
        { node: `${SH}, The_Shema`, from: 7, to: 9, mark: 'אהבת עולם' },
      ],
    },
    {
      id: 'shema', title: 'קריאת שמע',
      parts: [
        { node: `${SH}, The_Shema`, from: 10, to: 16 },
        { node: `${SH}, The_Shema`, from: 17, to: 21, mark: 'אמת ויציב' },
      ],
    },
    {
      id: 'amida', title: 'עמידה',
      parts: [
        { node: `${SH}, Amida`, from: 2, to: 50 },
        { node: `${SH}, Amida`, from: 51, to: 65, mark: 'ברכת כהנים' },
        { node: `${SH}, Amida`, from: 66, to: 73, mark: 'שים שלום ואלהי נצור' },
        { node: `${SH}, Amida`, from: 75, to: 106, mark: 'אבינו מלכנו', when: 'aseret', note: HE.SIDDUR_WHEN_ASERET },
        { node: `${SH}, Amida`, from: 108, to: 108, mark: 'יהי שם', when: 'optional', note: HE.SIDDUR_WHEN_NO_TACHANUN },
      ],
    },
    {
      id: 'tachanun', title: 'וידוי ותחנון', chip: 'תחנון', note: HE.SIDDUR_NOTE_TACHANUN,
      parts: [
        { node: `${SH}, Vidui`, from: 2, to: 5, mark: 'וידוי ושלוש עשרה מידות' },
        { node: `${SH}, Vidui`, from: 6, to: 13, mark: 'נפילת אפיים' },
        { node: `${SH}, Vidui`, from: 14, to: 34, mark: 'והוא רחום', when: 'mon-thu', note: HE.SIDDUR_WHEN_MON_THU },
      ],
    },
    {
      id: 'torah-reading', title: 'קריאת התורה',
      parts: [{ node: `${SH}, Torah_Reading`, from: 2, to: 21, when: 'mon-thu', note: HE.SIDDUR_WHEN_MON_THU }],
    },
    { id: 'ashrei', title: 'אשרי ולמנצח', chip: 'אשרי', parts: [{ node: `${SH}, Ashrei`, from: 2, to: 6 }] },
    { id: 'uva-letzion', title: 'ובא לציון', parts: [{ node: `${SH}, Uva_LeSion`, from: 2, to: 10 }] },
    { id: 'beit-yaakov', title: 'בית יעקב', parts: [{ node: `${SH}, Beit_Yaakov`, from: 2, to: 5 }] },
    {
      id: 'shir-shel-yom', title: 'שיר של יום',
      parts: [
        { node: `${SH}, Song_of_the_Day`, from: 3, to: 4, weekday: 0 },
        { node: `${SH}, Song_of_the_Day`, from: 5, to: 6, weekday: 1 },
        { node: `${SH}, Song_of_the_Day`, from: 7, to: 8, weekday: 2 },
        { node: `${SH}, Song_of_the_Day`, from: 9, to: 10, weekday: 3 },
        { node: `${SH}, Song_of_the_Day`, from: 11, to: 12, weekday: 4 },
        { node: `${SH}, Song_of_the_Day`, from: 13, to: 14, weekday: 5 },
        { node: `${SH}, Song_of_the_Day`, from: 27, to: 30 },
      ],
    },
    {
      id: 'kaveh', title: 'קוה ופטום הקטורת', chip: 'קוה',
      parts: [
        { node: `${SH}, Kaveh`, from: 2, to: 3 },
        { node: `${SH}, Kaveh`, from: 4, to: 12, mark: 'פטום הקטורת' },
        { node: `${SH}, Kaveh`, from: 13, to: 19, mark: 'קדיש וברכו' },
      ],
    },
    { id: 'alenu', title: 'עלינו לשבח', chip: 'עלינו', parts: [{ node: `${SH}, Alenu`, from: 2, to: 6 }] },
  ],
};
