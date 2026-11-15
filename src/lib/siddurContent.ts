import type { SiddurSection } from './prayers/types';
import { TEFILLIN_GROUPS } from './prayers/tefillin';
import { CHAFETZ_CHAIM_GROUPS } from './prayers/chafetzChaim';
import { KADDISH_GROUPS } from './prayers/kaddish';
import { HE } from './hebrewTexts';

// The weekday services live in lib/siddur (shacharit/mincha/arvit). These are
// the siddur's standalone pieces, offered under "עוד בסידור" on /siddur.
export const SIDDUR_EXTRAS: (SiddurSection & { id: string; icon: string })[] = [
  {
    id: 'bedtime-shema', icon: 'moon',
    name: 'קריאת שמע שעל המיטה',
    sefariaRef: 'Siddur_Edot_HaMizrach, Bedtime_Shema',
    jump: { label: 'ברכת המפיל', match: 'המפיל חבלי שנה' },
  },
  // Said at midnight, after ק״ש על המיטה. Segment 2 of the first node lists the
  // nights it isn't said and when only תיקון לאה is said.
  {
    id: 'tikkun-chatzot', icon: 'hourglass', name: 'תיקון חצות',
    parts: [
      { subtitle: 'לשם יחוד', sefariaRef: 'Siddur_Edot_HaMizrach, The_Midnight_Rite, LeShem_Yichud.2-4' },
      { subtitle: 'תיקון רחל', sefariaRef: 'Siddur_Edot_HaMizrach, The_Midnight_Rite, Tikkun_Rachel.2-9' },
      { subtitle: 'תיקון לאה', sefariaRef: 'Siddur_Edot_HaMizrach, The_Midnight_Rite, Tikkun_Leah.2-15' },
    ],
  },
  // Shabbat shacharit's Nishmat, from the kavana note through ישתבח (it continues "ובכן ישתבח").
  { id: 'nishmat', icon: 'sunrise', name: 'נשמת כל חי', sefariaRef: "Siddur_Edot_HaMizrach, Shabbat_Shacharit, Pesukei_D'Zimra.19-30" },
  { id: 'kaddish', icon: 'candle', name: 'קדיש', groups: KADDISH_GROUPS },
  { id: 'chafetz-chaim', icon: 'sparkle', name: 'תפילת החפץ חיים', groups: CHAFETZ_CHAIM_GROUPS },
  // Wedding blessings: the betrothal (ארוסין) and the seven blessings (שבע ברכות).
  {
    id: 'sheva-brachot', icon: 'heart', name: 'ברכות נישואין · שבע ברכות',
    parts: [
      { subtitle: 'סדר ארוסין', sefariaRef: 'Siddur_Edot_HaMizrach, Assorted_Blessings_and_Prayers, Marriage.3-8' },
      { subtitle: 'שבע ברכות לחתן וכלה', sefariaRef: 'Siddur_Edot_HaMizrach, Assorted_Blessings_and_Prayers, Sheva_Berachot.2-13' },
    ],
  },
  { id: 'tefillin', icon: 'scroll', name: 'ברכות התפילין', groups: TEFILLIN_GROUPS },
  // A morning reading (שו״ע או״ח א, ה), after the עקדה. The Edot HaMizrach siddur
  // on Sefaria doesn't have it, so this is Siddur Sefard's (Exodus 16:4–36 with
  // the יהי רצון before and after); its CC BY license needs the credit line.
  {
    id: 'parashat-haman', icon: 'bread', name: 'פרשת המן',
    sefariaRef: 'Siddur_Sefard, Additional_Prayers_, Chapter_of_Manna',
    source: HE.SIDDUR_SOURCE_MANNA,
  },
];
