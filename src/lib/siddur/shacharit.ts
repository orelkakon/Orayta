import type { PrayerService, PrayerPart, ChanukahDay } from './types';
import { SHACHARIT_AMIDA, HALLEL } from './amida';
import { HE } from '@/lib/hebrewTexts';

// Segment numbers were mapped against Sefaria's Siddur Edot HaMizrach
// (segment 1 of each node is its title and is skipped).
const PREP = 'Preparatory_Prayers';
const SH = 'Weekday_Shacharit';
const RC = 'Rosh_Hodesh';
const SONG = `${SH}, Song_of_the_Day`;

// One of eight daily Chanukah readings — only today's is shown.
const CHANUKAH_READINGS: PrayerPart[] = ([[4, 6], [7, 9], [10, 11], [12, 13], [14, 15], [16, 17], [18, 19], [20, 22]] as const)
  .map(([from, to], i) => ({
    node: 'Hanukkah, Shacharit', from, to, only: true,
    mark: HE.SIDDUR_CHANUKAH_READING(i + 1), when: `chanukah-${(i + 1) as ChanukahDay}` as const,
  }));

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
      id: 'petach-eliyahu', title: 'פתח אליהו', note: HE.SIDDUR_NOTE_PETACH,
      parts: [
        { node: `${SH}, Petichat_Eliyahu`, from: 3, to: 9 },
        { node: `${SH}, Petichat_Eliyahu`, from: 10, to: 11, mark: 'מאמר רבי שמעון בר יוחאי' },
      ],
    },
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
        { node: `${SH}, Hanna's_Prayer`, from: 2, to: 2, mark: 'ותתפלל חנה' },
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
        { node: `${SH}, Pesukei_D'Zimra`, from: 20, to: 21, mark: 'שיר המעלות ממעמקים', when: 'aseret', note: HE.SIDDUR_WHEN_ASERET },
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
    { id: 'amida', title: 'עמידה', parts: SHACHARIT_AMIDA },
    { id: 'hallel', title: 'הלל', when: 'hallel', note: HE.SIDDUR_WHEN_HALLEL, parts: HALLEL },
    {
      id: 'tachanun', title: 'וידוי ותחנון', chip: 'תחנון', when: 'tachanun', note: HE.SIDDUR_NOTE_TACHANUN,
      parts: [
        { node: `${SH}, Vidui`, from: 2, to: 5, mark: 'וידוי ושלוש עשרה מידות' },
        { node: `${SH}, Vidui`, from: 6, to: 11, mark: 'נפילת אפיים' },
        { node: `${SH}, Vidui`, from: 12, to: 13, mark: 'חצי קדיש', when: 'not-mon-thu', note: HE.SIDDUR_WHEN_NOT_MON_THU },
        { node: `${SH}, Vidui`, from: 14, to: 34, mark: 'והוא רחום', when: 'mon-thu', note: HE.SIDDUR_WHEN_MON_THU },
      ],
    },
    {
      id: 'torah-reading', title: 'קריאת התורה', when: 'torah-reading', note: HE.SIDDUR_WHEN_TORAH,
      parts: [
        { node: `${SH}, Torah_Reading`, from: 2, to: 4, mark: 'אל ארך אפים', when: 'tachanun', note: HE.SIDDUR_WHEN_TACHANUN },
        { node: `${SH}, Torah_Reading`, from: 5, to: 6, mark: 'יהי ה׳ אלהינו עמנו', when: 'no-tachanun', note: HE.SIDDUR_WHEN_NO_TACHANUN },
        { node: `${SH}, Torah_Reading`, from: 7, to: 18 },
        { node: `${RC}, Hallel`, from: 39, to: 40, mark: HE.SIDDUR_RC_READING, when: 'rosh-chodesh', only: true },
        ...CHANUKAH_READINGS,
        { node: 'Purim, Purim_Day', from: 2, to: 3, mark: HE.SIDDUR_PURIM_READING, when: 'purim', only: true },
        { node: 'Fast_Days_and_Mourning, Torah_Reading_for_Fast_Days', from: 2, to: 2, mark: HE.SIDDUR_FAST_READING, when: 'public-fast', only: true },
        { node: `${SH}, Torah_Reading`, from: 19, to: 21, mark: 'חצי קדיש' },
      ],
    },
    {
      id: 'ashrei', title: 'אשרי ולמנצח', chip: 'אשרי',
      parts: [
        { node: `${SH}, Ashrei`, from: 2, to: 4 },
        { node: `${SH}, Ashrei`, from: 5, to: 6, mark: 'למנצח יענך', when: 'tachanun', note: HE.SIDDUR_WHEN_TACHANUN },
      ],
    },
    { id: 'uva-letzion', title: 'ובא לציון', parts: [{ node: `${SH}, Uva_LeSion`, from: 2, to: 10 }] },
    {
      id: 'beit-yaakov', title: 'בית יעקב',
      parts: [
        { node: `${SH}, Beit_Yaakov`, from: 2, to: 3, mark: 'תפלה לדוד', when: 'tachanun', note: HE.SIDDUR_WHEN_TACHANUN },
        { node: `${SH}, Beit_Yaakov`, from: 4, to: 5 },
      ],
    },
    {
      id: 'shir-shel-yom', title: 'שיר של יום',
      parts: [
        ...[[3, 4], [5, 6], [7, 8], [9, 10], [11, 12], [13, 14]].map(([from, to], weekday) => ({ node: SONG, from, to, weekday })),
        { node: SONG, from: 15, to: 16, mark: 'שיר מזמור לאסף', when: 'fast-gedalia-tevet', only: true },
        { node: SONG, from: 17, to: 18, mark: 'למנצח לבני קרח', when: 'after-yk', only: true },
        { node: SONG, from: 19, to: 20, mark: 'מזמור שיר חנוכת הבית', when: 'chanukah', only: true },
        { node: SONG, from: 21, to: 22, mark: 'למנצח על אילת השחר', when: 'fast-esther-purim', only: true },
        { node: SONG, from: 23, to: 24, mark: 'מזמור לאסף', when: 'fast-tammuz', only: true },
        { node: SONG, from: 25, to: 26, mark: 'למנצח לבני קרח', when: 'optional', note: HE.SIDDUR_WHEN_MOURNER },
        { node: SONG, from: 27, to: 30 },
      ],
    },
    {
      id: 'mussaf', title: 'מוסף לראש חודש', chip: 'מוסף', when: 'rosh-chodesh', note: HE.SIDDUR_WHEN_ROSH_CHODESH,
      parts: [
        { node: `${RC}, Mussaf`, from: 3, to: 17 },
        { node: `${RC}, Mussaf`, from: 18, to: 20, mark: 'על הניסים', when: 'chanukah', note: HE.SIDDUR_WHEN_CHANUKAH },
        { node: `${RC}, Mussaf`, from: 21, to: 49 },
      ],
    },
    {
      id: 'barchi-nafshi', title: 'ברכי נפשי', when: 'rosh-chodesh', note: HE.SIDDUR_WHEN_ROSH_CHODESH,
      parts: [{ node: `${RC}, Barchi_Nafshi`, from: 2, to: 6 }],
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
